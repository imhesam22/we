// backend/routes/uploads.js - مطمئن شو درست کار می‌کنه
import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// سرو فایل‌های آپلود شده
router.get('/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    
    console.log('📁 Serving file:', { type, filename });
    
    // امنیت: فقط audio و images مجاز هستند
    if (!['audio', 'images'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const filePath = path.join(process.cwd(), 'uploads', type, filename);
    
    console.log('📁 File path:', filePath);
    
    // چک کردن وجود فایل
    if (!fs.existsSync(filePath)) {
      console.log('❌ File not found:', filePath);
      return res.status(404).json({ error: 'File not found' });
    }

    // تنظیم هدرهای مناسب
    if (type === 'audio') {
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'inline');
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    
    console.log('✅ Serving file successfully');
    res.sendFile(filePath);

  } catch (error) {
    console.error('❌ File serve error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

export default router;