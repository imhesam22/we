// backend/routes/admin.js
import express from 'express';
import User from '../models/User.js';
import Music from '../models/Music.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadMusicFiles, getFileUrl, processImage } from '../services/uploadService.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 🔒 middleware چک کردن ادمین

// 📊 آمار کلی
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalCoins = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$coins' } } }
    ]);
    const totalMusic = await Music.countDocuments();
    const totalPlays = await Music.aggregate([
      { $group: { _id: null, total: { $sum: '$playCount' } } }
    ]);

    // آمار کاربران جدید امروز
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          newToday: newUsersToday
        },
        coins: {
          total: totalCoins[0]?.total || 0
        },
        music: {
          total: totalMusic,
          totalPlays: totalPlays[0]?.total || 0
        }
      }
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get admin stats'
    });
  }
});

// 👥 لیست کاربران
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('username email coins isVerified isAdmin createdAt lastLogin')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

// 🎵 مدیریت موزیک‌ها
router.get('/music', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    const query = search ? {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { artist: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const music = await Music.find(query)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Music.countDocuments(query);

    res.json({
      success: true,
      data: {
        music,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });

  } catch (error) {
    console.error('Admin music error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get music'
    });
  }
});

// 📈 آمار پخش موزیک
router.get('/music-stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const topMusic = await Music.find()
      .sort({ playCount: -1 })
      .limit(10)
      .select('title artist playCount totalEarnedCoins');

    const recentPlays = await User.aggregate([
      { $unwind: '$listenedTracks' },
      { $sort: { 'listenedTracks.listenedAt': -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'music',
          localField: 'listenedTracks.musicId',
          foreignField: '_id',
          as: 'musicInfo'
        }
      },
      {
        $project: {
          username: 1,
          musicTitle: '$listenedTracks.musicTitle',
          listenedAt: '$listenedTracks.listenedAt',
          title: { $arrayElemAt: ['$musicInfo.title', 0] },
          artist: { $arrayElemAt: ['$musicInfo.artist', 0] }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        topMusic,
        recentPlays
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

// ➕ آپلود موزیک جدید
router.post('/music/upload', authenticate, requireAdmin, uploadMusicFiles, async (req, res) => {
  try {
    console.log('📁 Upload request received:', req.files);

    // چک کردن فایل‌ها
    if (!req.files || !req.files.audioFile || !req.files.coverImage) {
      return res.status(400).json({
        success: false,
        error: 'Both audio file and cover image are required'
      });
    }

    const { title, artist, duration, genre } = req.body;
    
    if (!title || !artist || !duration || !genre) {
      // پاک کردن فایل‌های آپلود شده اگر validation fail بشه
      if (req.files.audioFile) fs.unlinkSync(req.files.audioFile[0].path);
      if (req.files.coverImage) fs.unlinkSync(req.files.coverImage[0].path);
      
      return res.status(400).json({
        success: false,
        error: 'All fields are required: title, artist, duration, genre'
      });
    }

    // پردازش عکس
    const coverImagePath = await processImage(req.files.coverImage[0].path);
    const coverImageFilename = path.basename(coverImagePath);

    // ساخت موزیک جدید
    const music = new Music({
      title: title.trim(),
      artist: artist.trim(),
      duration: duration.trim(),
      genre: genre.trim(),
      coverImage: getFileUrl(coverImageFilename, 'images'),
      audioUrl: getFileUrl(req.files.audioFile[0].filename, 'audio'),
      uploadedBy: req.user._id
    });

    await music.save();
    await music.populate('uploadedBy', 'username');

    console.log('✅ Music uploaded successfully:', music.title);

    res.status(201).json({
      success: true,
      message: 'Music uploaded successfully',
      data: music
    });

  } catch (error) {
    console.error('❌ Music upload error:', error);
    
    // پاک کردن فایل‌ها در صورت خطا
    if (req.files) {
      if (req.files.audioFile) fs.unlinkSync(req.files.audioFile[0].path);
      if (req.files.coverImage) fs.unlinkSync(req.files.coverImage[0].path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to upload music: ' + error.message
    });
  }
});

// آپدیت endpoint آپلود قبلی (برای backward compatibility)
router.post('/music', authenticate, requireAdmin, async (req, res) => {
  return res.status(400).json({
    success: false,
    error: 'Please use /api/admin/music/upload with file upload'
  });
});
// ✏️ آپدیت موزیک
router.put('/music/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const music = await Music.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'username');

    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    res.json({
      success: true,
      message: 'Music updated successfully',
      data: music
    });

  } catch (error) {
    console.error('Music update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update music'
    });
  }
});

// 🗑️ حذف موزیک
router.delete('/music/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const music = await Music.findByIdAndDelete(id);

    if (!music) {
      return res.status(404).json({
        success: false,
        error: 'Music not found'
      });
    }

    res.json({
      success: true,
      message: 'Music deleted successfully'
    });

  } catch (error) {
    console.error('Music delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete music'
    });
  }
});

export default router;