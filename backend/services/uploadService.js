import multer from 'multer';
import path from 'path';

/* =========================
   🧠 HELPERS
========================= */
export const sanitizeFilename = (name = '') => {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')          // space → -
    .replace(/[^a-z0-9.-]/g, '')   // remove unsafe chars
    .replace(/-+/g, '-');
};

export const getFileExtension = (filename = '') => {
  return path.extname(filename).toLowerCase().replace('.', '');
};

/* =========================
   📦 MULTER CONFIG
========================= */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 2
  },
  fileFilter
});

/* =========================
   🚀 EXPORTS
========================= */
export const uploadMusicFiles = upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);

/* =========================
   🧪 OPTIONAL HELPERS
========================= */
export const getFileUrl = (filename, type = 'audio') => {
  if (!filename) return '';
  return type === 'audio'
    ? `/uploads/audio/${filename}`
    : `/uploads/images/${filename}`;
};

export const processImage = (imageUrl) => {
  // برای future optimization (resize, CDN, ...)
  return imageUrl;
};
