// backend/services/cloudinaryService.js - فقط برای عکس
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// 🔥 فقط آپلود عکس
export const uploadImage = async (imageBuffer) => {
  try {
    console.log('🖼️ Uploading image to Cloudinary...');
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'we-music/covers',
          resource_type: 'image',
          width: 500,
          height: 500,
          crop: 'fill',
          quality: 'auto',
          format: 'webp'
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary image upload error:', error);
            reject(error);
          } else {
            console.log('✅ Image uploaded:', result.secure_url);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              width: result.width,
              height: result.height
            });
          }
        }
      );
      
      streamifier.createReadStream(imageBuffer).pipe(uploadStream);
    });
    
  } catch (error) {
    console.error('💥 Image upload failed:', error);
    throw error;
  }
};

// 🔥 حذف عکس
export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Image deleted:', publicId);
    return result;
  } catch (error) {
    console.error('❌ Delete error:', error);
    throw error;
  }
};

// 🔥 تست اتصال
export const testConnection = async () => {
  try {
    await cloudinary.api.ping();
    console.log('✅ Cloudinary connected');
    return { success: true, message: 'Cloudinary connected for images' };
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error);
    return { success: false, error: error.message };
  }
};

export default {
  uploadImage,
  deleteImage,
  testConnection
};