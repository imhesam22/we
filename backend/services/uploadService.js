// backend/services/uploadService.js - آپدیت نهایی
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// ایجاد پوشه‌های لازم
const uploadsDir = './uploads';
const audioDir = './uploads/audio';
const imagesDir = './uploads/images';

[uploadsDir, audioDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// تنظیمات multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, audioDir);
    } else if (file.mimetype.startsWith('image/')) {
      cb(null, imagesDir);
    } else {
      cb(new Error('Invalid file type'), null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (audioTypes.includes(file.mimetype) || imageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio and image files are allowed'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  }
});

export const uploadMusicFiles = upload.fields([
  { name: 'audioFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]);

export const processImage = async (filePath) => {
  try {
    const processedPath = filePath.replace(path.extname(filePath), '-processed.jpg');
    
    await sharp(filePath)
      .resize(500, 500)
      .jpeg({ quality: 80 })
      .toFile(processedPath);
    
    fs.unlinkSync(filePath);
    
    return processedPath;
  } catch (error) {
    console.error('Image processing error:', error);
    return filePath;
  }
};

// 🔥 آپدیت نهایی: ساخت URL درست
export const getFileUrl = (filename, type = 'audio') => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT}`;
  
  // 🔥 مطمئن شو مسیر درست هست
  return `${baseUrl}/api/uploads/${type}/${filename}`;
};