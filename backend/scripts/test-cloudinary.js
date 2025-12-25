// backend/scripts/test-cloudinary.js
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { uploadMusic, testCloudinaryConnection } from '../services/cloudinaryService.js';

dotenv.config();

async function testCloudinary() {
  try {
    console.log('🧪 Testing Cloudinary connection...');
    
    // تست اتصال
    await testCloudinaryConnection();
    
    // تست آپلود (اگر فایل تست داری)
    const testAudioPath = path.join(process.cwd(), 'test-audio.mp3');
    const testImagePath = path.join(process.cwd(), 'test-image.jpg');
    
    if (fs.existsSync(testAudioPath) && fs.existsSync(testImagePath)) {
      console.log('🎵 Testing file upload...');
      
      const audioBuffer = fs.readFileSync(testAudioPath);
      const imageBuffer = fs.readFileSync(testImagePath);
      
      const result = await uploadMusic(
        audioBuffer,
        imageBuffer,
        { title: 'Test Song', artist: 'Test Artist' }
      );
      
      console.log('✅ Upload test successful!');
      console.log('🎵 Audio URL:', result.audioUrl);
      console.log('🖼️ Cover URL:', result.coverImage);
    } else {
      console.log('⚠️  Test files not found, skipping upload test');
      console.log('📁 Create these files for full test:');
      console.log('   - test-audio.mp3 (any MP3 file)');
      console.log('   - test-image.jpg (any image file)');
    }
    
    console.log('\n✅ Cloudinary configuration looks good!');
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check .env file has correct credentials');
    console.log('2. Make sure Cloudinary account is active');
    console.log('3. Verify API key and secret are correct');
    console.log('4. Check internet connection');
    
    console.log('\n📋 Current configuration:');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Set (hidden)' : 'Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Set (hidden)' : 'Not set');
  }
}

testCloudinary();