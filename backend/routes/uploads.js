import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/* =========================
   آماده‌سازی پوشه‌ها
========================= */
const uploadRoot = path.join(process.cwd(), 'uploads');
const audioDir = path.join(uploadRoot, 'audio');
const imageDir = path.join(uploadRoot, 'images');

[audioDir, imageDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/* =========================
   تنظیم Multer
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'audio') cb(null, audioDir);
    else if (file.fieldname === 'cover') cb(null, imageDir);
    else cb(new Error('Invalid field name'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName =
      file.originalname
        .replace(ext, '')
        .replace(/[^a-zA-Z0-9-_]/g, '');

    cb(null, `${safeName}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

/* =========================
   🔥 POST: آپلود موزیک
========================= */
router.post(
  '/music',
  authenticate,
  requireAdmin,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  (req, res) => {
    try {
      const audio = req.files?.audio?.[0];
      const cover = req.files?.cover?.[0];

      if (!audio || !cover) {
        return res.status(400).json({
          success: false,
          error: 'Audio یا Cover ارسال نشده'
        });
      }

      res.status(201).json({
        success: true,
        data: {
          audioUrl: `/uploads/audio/${audio.filename}`,
          coverUrl: `/uploads/images/${cover.filename}`,
          audioSize: audio.size
        }
      });

    } catch (err) {
      console.error('❌ Upload error:', err);
      res.status(500).json({
        success: false,
        error: 'Upload failed'
      });
    }
  }
);

/* =========================
   📁 GET: سرو فایل‌ها
========================= */
router.get('/:type/:filename', (req, res) => {
  const { type, filename } = req.params;

  if (!['audio', 'images'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }

  const filePath = path.join(uploadRoot, type, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
});

export default router;
