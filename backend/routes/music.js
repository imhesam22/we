// backend/routes/music.js - آپدیت شده
import express from 'express';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import User from '../models/User.js';
import Music from '../models/Music.js';

const router = express.Router();

// گرفتن لیست موزیک‌ها + افزایش ویو وقتی کاربر کلیک می‌کنه
router.get('/', optionalAuth, async (req, res) => {
  try {
    const music = await Music.find({ isActive: true })
      .select('title artist duration genre coverImage audioUrl playCount viewCount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: music
    });
  } catch (error) {
    console.error('Get music error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get music'
    });
  }
});

// 🔥 افزایش ویوکاونتر وقتی کاربر روی موزیک کلیک می‌کنه
router.post('/:id/view', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    // اگر کاربر لاگین نباشه، ویو شمارش نمیشه
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Please login to count views'
      });
    }

    const music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    // استفاده از متد جدید
    const result = await music.incrementView(userId);

    res.json({
      success: true,
      message: result.viewed ? 'View counted successfully' : 'Already viewed this track',
      data: {
        viewed: result.viewed,
        viewCount: result.viewCount
      }
    });

  } catch (error) {
    console.error('View count error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to count view'
    });
  }
});

// 🔥 آپدیت سیستم کسب سکه
router.post('/earn-coin', authenticate, async (req, res) => {
  try {
    const { musicId } = req.body;
    const userId = req.user._id;

    console.log('🎵 Earn coin request:', { userId, musicId });

    if (!musicId) {
      return res.status(400).json({
        success: false,
        error: 'Music ID is required'
      });
    }

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

    // 🔥 چک کردن با متد جدید
    const alreadyListened = user.listenedTracks.some(track => 
      track.musicId && track.musicId.toString() === musicId.toString()
    );

    if (alreadyListened) {
      return res.json({
        success: false,
        message: 'Already earned coin for this track',
        coins: user.coins
      });
    }

    // 🔥 افزایش پلی‌کاونتر با متد جدید
    const playResult = await music.incrementPlay(userId);

    // دادن سکه به کاربر
    user.coins += 1;
    
    user.listenedTracks.push({
      musicId: musicId,
      musicTitle: music.title,
      listenedAt: new Date()
    });

    user.earnedHistory.push({
      musicId: musicId,
      musicTitle: music.title,
      amount: 1,
      timestamp: new Date()
    });

    await user.save();

    // آپدیت آمار موزیک
    music.totalEarnedCoins += 1;
    await music.save();

    console.log(`🎉 User ${user.username} earned +1 coin for: ${music.title}. Total: ${user.coins}`);

    res.json({
      success: true,
      message: 'Coin earned successfully!',
      coins: user.coins,
      track: music.title,
      playCount: playResult.playCount
    });

  } catch (error) {
    console.error('❌ Earn coin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to earn coin'
    });
  }
});

// 🔥 گرفتن وضعیت کاربر برای یک موزیک
router.get('/:id/user-status', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    const status = music.getUserStatus(userId);

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('User status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user status'
    });
  }
});

// گرفتن لیست موزیک‌ها با وضعیت کاربر
router.get('/', optionalAuth, async (req, res) => {
  try {
    const music = await Music.find({ isActive: true })
      .select('title artist duration genre coverImage audioUrl playCount viewCount')
      .sort({ createdAt: -1 });

    // اگر کاربر لاگین کرده، وضعیت رو اضافه کن
    let musicWithStatus = music;
    if (req.user) {
      const musicStatus = await Promise.all(
        music.map(async (track) => {
          const status = track.getUserStatus(req.user._id);
          return {
            ...track.toObject(),
            userStatus: status
          };
        })
      );
      musicWithStatus = musicStatus;
    }

    res.json({
      success: true,
      data: musicWithStatus
    });
  } catch (error) {
    console.error('Get music error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get music'
    });
  }
});
// 🔥 آپدیت سیستم کسب سکه برای افزایش پلی‌کاونتر
router.post('/earn-coin', authenticate, async (req, res) => {
  try {
    const { musicId } = req.body;
    const userId = req.user._id;

    console.log('🎵 Earn coin request:', { userId, musicId });

    if (!musicId) {
      return res.status(400).json({
        success: false,
        error: 'Music ID is required'
      });
    }

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

    // چک کردن آیا کاربر قبلاً این موزیک رو گوش داده
    const alreadyListened = user.listenedTracks.some(track => 
      track.musicId && track.musicId.toString() === musicId.toString()
    );

    if (alreadyListened) {
      return res.json({
        success: false,
        message: 'Already earned coin for this track',
        coins: user.coins
      });
    }

    // 🔥 افزایش پلی‌کاونتر موزیک
    await music.incrementPlay();

    // دادن سکه به کاربر
    user.coins += 1;
    
    user.listenedTracks.push({
      musicId: musicId,
      musicTitle: music.title,
      listenedAt: new Date()
    });

    user.earnedHistory.push({
      musicId: musicId,
      musicTitle: music.title,
      amount: 1,
      timestamp: new Date()
    });

    await user.save();

    // آپدیت آمار موزیک
    music.totalEarnedCoins += 1;
    await music.save();

    console.log(`🎉 User ${user.username} earned +1 coin for: ${music.title}. Total: ${user.coins}`);

    res.json({
      success: true,
      message: 'Coin earned successfully!',
      coins: user.coins,
      track: music.title
    });

  } catch (error) {
    console.error('❌ Earn coin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to earn coin'
    });
  }
});

// گرفتن آمار پیشرفته موزیک
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;

    const music = await Music.findById(id)
      .select('title artist playCount viewCount uniqueListeners totalEarnedCoins lastPlayed')
      .populate('uniqueListeners', 'username');

    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...music.toObject(),
        uniqueListenerCount: music.uniqueListeners.length
      }
    });

  } catch (error) {
    console.error('Music stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get music stats'
    });
  }
});

export default router;