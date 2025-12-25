import express from 'express';
import Music from '../models/Music.js';
import User from '../models/User.js'; // 🔥 اضافه کردن User
import { backblazeService } from '../services/backblazeService.js';
import { authenticate } from '../middleware/auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// 🎵 لیست موزیک‌ها
router.get('/', async (req, res) => {
  try {
    const music = await Music.find({ isActive: true })
      .select('title artist duration genre coverImage mimeType playCount viewCount')
      .sort({ createdAt: -1 });
    
    res.json({ success: true, data: music });
  } catch (error) {
    console.error('❌ Get music error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch music' });
  }
});

// 🔍 SEARCH MUSIC
router.get('/search', async (req, res) => {
  try {
    const {
      q = '',
      genre,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 1000);
    const skip = (pageNum - 1) * limitNum;

    const query = { isActive: true };

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { artist: { $regex: q, $options: 'i' } }
      ];
    }

    if (genre && genre !== 'all') {
      query.genre = genre;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'popular') sortOption = { playCount: -1 };
    if (sort === 'alphabetical') sortOption = { title: 1 };
    if (sort === 'trending') sortOption = { viewCount: -1 };

    const [music, total] = await Promise.all([
      Music.find(query)
        .select('title artist duration genre coverImage mimeType playCount viewCount createdAt')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Music.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: music,
      pagination: {
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });

  } catch (err) {
    console.error('❌ SEARCH ERROR:', err);
    res.status(500).json({ success: false, error: 'Search failed' });
  }
});

// 🔥 تابع جدید: ثبت شنیدن موزیک و کسب سکه
const registerMusicPlay = async (musicId, userId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const [music, user] = await Promise.all([
      Music.findById(musicId).session(session),
      User.findById(userId).session(session)
    ]);

    if (!music || !user) throw new Error('Music or User not found');

    // 1. افزایش playCount
    music.playCount = (music.playCount || 0) + 1;
    
    // 2. چک کن آیا کاربر قبلاً سکه گرفته
    const alreadyEarned = music.hasUserListened(userId);
    
    let coinsEarned = 0;
    
    // 3. اگر اولین باره، 1 سکه بده
    if (!alreadyEarned) {
      coinsEarned = 1;
      
      // به کاربر سکه اضافه کن
      await user.addCoins(coinsEarned, musicId, music.title);
      
      // در موزیک علامت بزن که سکه داده شده
      music.markCoinsEarned(userId);
      
      console.log(`💰 Coin earned: ${user.username} +1 coin for ${music.title}`);
    }
    
    // 4. به تاریخچه اضافه کن
    user.addToListenHistory(music);
    user.addMusicInteraction(musicId);
    
    // 5. کاربر رو به لیست شنوندگان اضافه کن
    await music.addListener(userId);
    
    // 6. ذخیره کن
    await Promise.all([music.save(), user.save()]);
    await session.commitTransaction();
    
    return {
      coinsEarned,
      totalCoins: user.coins,
      alreadyEarned,
      playCount: music.playCount,
      viewCount: music.viewCount
    };
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// 🎧 STREAM (Range-aware) - نسخه اصلاح شده
// backend/routes/music.js - endpoint stream را آپدیت کن
router.get('/stream/:id', async (req, res) => {
  try {
    const musicId = req.params.id;
    const range = req.headers.range;

    console.log('🎵 Stream request:', { musicId, range });

    // 1. پیدا کردن موزیک
    const music = await Music.findById(musicId);
    if (!music || !music.isActive) {
      console.log('❌ Music not found or inactive:', musicId);
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    // 2. بررسی audioKey
    if (!music.audioKey) {
      console.log('❌ No audioKey for music:', musicId);
      return res.status(404).json({
        success: false,
        error: 'Audio file not available'
      });
    }

    console.log('🔍 Music found:', {
      title: music.title,
      audioKey: music.audioKey,
      mimeType: music.mimeType
    });

    // 3. اگر کاربر لاگین کرده، آمار را ثبت کن
    if (req.user?._id) {
      try {
        registerMusicPlay(musicId, req.user._id)
          .then(result => {
            console.log('✅ Music play registered:', {
              userId: req.user._id,
              coinsEarned: result.coinsEarned
            });
          })
          .catch(err => {
            console.error('❌ Error registering play:', err);
          });
      } catch (error) {
        console.error('❌ Background registration error:', error);
      }
    } else {
      // برای کاربران مهمان فقط viewCount
      music.incrementView();
      await music.save();
    }

    // 4. گرفتن stream از Backblaze
    let streamData;
    try {
      if (!range) {
        // کل فایل
        streamData = await backblazeService.getStreamRange(music.audioKey, 0);
      } else {
        // range request
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : undefined;
        
        if (isNaN(start)) {
          return res.status(416).json({
            success: false,
            error: 'Invalid range header'
          });
        }
        
        streamData = await backblazeService.getStreamRange(music.audioKey, start, end);
      }
    } catch (streamError) {
      console.error('❌ Backblaze stream error:', streamError);
      return res.status(500).json({
        success: false,
        error: 'Failed to stream audio from storage'
      });
    }

    // 5. تنظیم هدرها
    const headers = {
      'Content-Type': streamData.contentType || music.mimeType || 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };

    if (range) {
      headers['Content-Range'] = streamData.contentRange;
      headers['Content-Length'] = streamData.contentLength;
      res.writeHead(206, headers);
    } else {
      headers['Content-Length'] = streamData.contentLength;
      res.writeHead(200, headers);
    }

    // 6. ارسال stream
    streamData.stream.pipe(res);

    // 7. هندل کردن خطاهای stream
    streamData.stream.on('error', (err) => {
      console.error('❌ Stream pipe error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Stream error'
        });
      }
    });

  } catch (error) {
    console.error('❌ STREAM ENDPOINT ERROR:', error.message);
    console.error(error.stack);
    
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error: ' + error.message
      });
    }
  }
});

// 🔥 ENDPOINT جدید: گرفتن اطلاعات تعامل کاربر با موزیک
router.get('/interaction/:id', authenticate, async (req, res) => {
  try {
    const musicId = req.params.id;
    const userId = req.user._id;

    const [music, user] = await Promise.all([
      Music.findById(musicId),
      User.findById(userId)
    ]);

    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    const hasEarnedCoins = user.hasEarnedForMusic(musicId);
    const interaction = user.musicInteractions.find(i => 
      i.musicId.toString() === musicId.toString()
    );

    res.json({
      success: true,
      data: {
        hasEarnedCoins,
        lastListened: interaction?.lastInteraction,
        canEarnMore: !hasEarnedCoins,
        musicPlayCount: music.playCount,
        musicViewCount: music.viewCount
      }
    });

  } catch (error) {
    console.error('❌ Get interaction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get interaction data'
    });
  }
});

// ❤️ GET favorites
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('favorites', 'title artist duration genre coverImage mimeType playCount viewCount');
    
    res.json({
      success: true,
      data: user.favorites
    });
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch favorites'
    });
  }
});

// ❤️ TOGGLE favorite
router.post('/favorite/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;
    const musicId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    const index = user.favorites.indexOf(musicId);
    let action = '';

    if (index === -1) {
      user.favorites.push(musicId);
      action = 'added';
    } else {
      user.favorites.splice(index, 1);
      action = 'removed';
    }

    await user.save();

    res.json({
      success: true,
      action,
      favorites: user.favorites
    });
  } catch (error) {
    console.error('❌ Toggle favorite error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
});

// 🔥 ENDPOINT جدید: گرفتن اطلاعات کاربر شامل سکه‌ها
router.get('/user-stats', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('coins username earnedHistory listenHistory');
    
    // محاسبه آمار
    const totalEarned = user.earnedHistory?.length || 0;
    const totalListened = user.listenHistory?.length || 0;
    
    res.json({
      success: true,
      data: {
        user: {
          username: user.username,
          coins: user.coins || 0
        },
        stats: {
          totalEarned,
          totalListened,
          remainingToEarn: totalListened - totalEarned
        },
        earnedHistory: user.earnedHistory?.slice(0, 20) || [],
        listenHistory: user.listenHistory?.slice(0, 20) || []
      }
    });
  } catch (error) {
    console.error('❌ Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user stats'
    });
  }
});

// 🔥 ENDPOINT جدید: بررسی سریع کسب سکه
router.get('/check-earning/:id', authenticate, async (req, res) => {
  try {
    const musicId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const hasEarned = user.hasEarnedForMusic(musicId);

    res.json({
      success: true,
      canEarn: !hasEarned,
      alreadyEarned: hasEarned
    });
  } catch (error) {
    console.error('❌ Check earning error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check earning status'
    });
  }
});

// باقی endpointها...
router.get('/signed-url/:id', authenticate, async (req, res) => {
  try {
    const musicId = req.params.id;
    const music = await Music.findById(musicId);
    
    if (!music || !music.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    if (!music.audioKey) {
      return res.status(404).json({
        success: false,
        error: 'Audio file not available'
      });
    }

    const signedUrl = await backblazeService.getSignedUrl(music.audioKey, 3600);

    res.json({
      success: true,
      signedUrl,
      expiresIn: 3600,
      expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
    });

  } catch (error) {
    console.error('❌ Signed URL error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate signed URL'
    });
  }
});

router.get('/file-info/:id', async (req, res) => {
  try {
    const musicId = req.params.id;
    const music = await Music.findById(musicId).select('audioKey title artist playCount viewCount');

    if (!music || !music.audioKey) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    const fileInfo = await backblazeService.getFileInfo(music.audioKey);

    res.json({
      success: true,
      data: {
        ...fileInfo,
        title: music.title,
        artist: music.artist,
        audioKey: music.audioKey,
        playCount: music.playCount,
        viewCount: music.viewCount
      }
    });

  } catch (error) {
    console.error('❌ File info error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get file info'
    });
  }
});

// 🔥 این endpoint دیگر نیاز نیست چون در stream انجام می‌شود
// اما برای سازگاری با کد قدیمی نگه می‌داریم
router.post('/increment-play/:id', authenticate, async (req, res) => {
  try {
    const result = await registerMusicPlay(req.params.id, req.user._id);
    
    res.json({ 
      success: true, 
      ...result
    });
  } catch (error) {
    console.error('❌ Increment play error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to increment play count' 
    });
  }
});

export default router;