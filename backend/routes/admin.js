import express from 'express';
import multer from 'multer';
import User from '../models/User.js';
import Music from '../models/Music.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { uploadImage } from '../services/cloudinaryService.js';
import { backblazeService } from '../services/backblazeService.js';

const router = express.Router();

/* =========================
   📊 STATS
========================= */
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  const [users, verified, music] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    Music.countDocuments()
  ]);

  res.json({
    success: true,
    data: {
      users: { total: users, verified },
      music: { total: music }
    }
  });
});

/* =========================
   👥 USERS
========================= */
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = 10;

  const users = await User.find()
    .select('username email isVerified isAdmin createdAt')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments();

  res.json({
    success: true,
    data: {
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  });
});

/* =========================
   🎵 MUSIC LIST
========================= */
router.get('/music', authenticate, requireAdmin, async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = 10;

  const music = await Music.find()
    .populate('uploadedBy', 'username')
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Music.countDocuments();

  res.json({
    success: true,
    data: {
      music,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    }
  });
});

/* =========================
   📈 MUSIC STATS
========================= */
router.get('/music-stats', authenticate, requireAdmin, async (req, res) => {
  const stats = await Music.aggregate([
    {
      $group: {
        _id: null,
        totalPlays: { $sum: '$playCount' },
        totalViews: { $sum: '$viewCount' }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || { totalPlays: 0, totalViews: 0 }
  });
});

/* =========================
   ➕ UPLOAD MUSIC
========================= */
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  '/upload',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('📤 شروع آپلود موزیک...');
      
      const { title, artist, duration, genre } = req.body;

      // 🔥 بررسی وجود فایل‌ها
      if (!req.files?.audio || !req.files?.cover) {
        return res.status(400).json({ 
          success: false,
          error: 'لطفاً هم فایل صوتی و هم تصویر کاور را انتخاب کنید' 
        });
      }

      const audioFile = req.files.audio[0];
      const coverFile = req.files.cover[0];

      console.log('📁 اطلاعات فایل‌ها:', {
        audio: { name: audioFile.originalname, size: audioFile.size, type: audioFile.mimetype },
        cover: { name: coverFile.originalname, size: coverFile.size, type: coverFile.mimetype }
      });

      // 🔥 ۱. آپلود عکس به Cloudinary
      console.log('🖼️ آپلود تصویر کاور به Cloudinary...');
      let coverResult;
      try {
        coverResult = await uploadImage(coverFile.buffer);
        console.log('✅ تصویر آپلود شد:', coverResult.url);
      } catch (imageError) {
        console.error('❌ خطای آپلود تصویر:', imageError);
        return res.status(500).json({
          success: false,
          error: 'آپلود تصویر کاور ناموفق بود'
        });
      }

      // 🔥 ۲. ایجاد نام منحصربه‌فرد برای فایل صوتی
      const timestamp = Date.now();
      const safeAudioName = audioFile.originalname
        .replace(/[^a-zA-Z0-9.-]/g, '-') // جایگزینی کاراکترهای غیرمجاز
        .toLowerCase();
      
      const audioKey = `music/${timestamp}-${safeAudioName}`;
      console.log('🔑 کلید فایل صوتی:', audioKey);

      // 🔥 ۳. آپلود فایل صوتی به Backblaze
      console.log('🎵 آپلود فایل صوتی به Backblaze...');
      try {
        const uploadResult = await backblazeService.uploadFile(
          audioFile.buffer,
          audioKey,
          audioFile.mimetype
        );
        console.log('✅ فایل صوتی آپلود شد:', uploadResult.key);
      } catch (uploadError) {
        console.error('❌ خطای آپلود فایل صوتی:', uploadError);
        return res.status(500).json({
          success: false,
          error: 'آپلود فایل صوتی ناموفق بود: ' + uploadError.message
        });
      }

      // 🔥 ۴. ذخیره اطلاعات در دیتابیس
      console.log('💾 ذخیره اطلاعات در دیتابیس...');
      try {
        const music = await Music.create({
          title: title.trim(),
          artist: artist.trim(),
          duration: duration.trim(),
          genre: genre.trim(),
          coverImage: coverResult.url,
          audioKey: audioKey, // فقط کلید ذخیره می‌شود
          mimeType: audioFile.mimetype,
          uploadedBy: req.user._id,
          playCount: 0,
          viewCount: 0,
          isActive: true
        });

        console.log('✅ موزیک با موفقیت ایجاد شد:', {
          id: music._id,
          title: music.title,
          audioKey: music.audioKey
        });

        res.status(201).json({ 
          success: true, 
          message: 'موزیک با موفقیت آپلود شد',
          data: {
            id: music._id,
            title: music.title,
            artist: music.artist,
            coverImage: music.coverImage,
            audioKey: music.audioKey
          }
        });

      } catch (dbError) {
        console.error('❌ خطای دیتابیس:', dbError);
        
        // اگر خطای validation بود
        if (dbError.name === 'ValidationError') {
          const errors = Object.values(dbError.errors).map(err => err.message);
          return res.status(400).json({
            success: false,
            error: 'اطلاعات نامعتبر: ' + errors.join(', ')
          });
        }
        
        return res.status(500).json({
          success: false,
          error: 'خطا در ذخیره اطلاعات موزیک'
        });
      }

    } catch (error) {
      console.error('❌ خطای کلی آپلود:', error);
      res.status(500).json({ 
        success: false,
        error: 'خطا در آپلود موزیک: ' + (error.message || 'خطای ناشناخته')
      });
    }
  }
);

/* =========================
   ✏️ UPDATE / DELETE
========================= */
router.put('/music/:id', authenticate, requireAdmin, async (req, res) => {
  const music = await Music.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: music });
});

router.delete('/music/:id', authenticate, requireAdmin, async (req, res) => {
  await Music.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.patch('/users/:id/coins', authenticate, requireAdmin, async (req, res) => {
  const { coins } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { coins },
    { new: true }
  );

  res.json({ success: true, data: user });
});


export default router;
