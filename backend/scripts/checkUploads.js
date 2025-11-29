// backend/scripts/checkUploads.js
import fs from 'fs';
import path from 'path';

function checkUploads() {
  const audioDir = './uploads/audio';
  const imagesDir = './uploads/images';
  
  console.log('🔍 Checking uploads directory...');
  
  if (fs.existsSync(audioDir)) {
    const audioFiles = fs.readdirSync(audioDir);
    console.log('🎵 Audio files:', audioFiles);
  } else {
    console.log('❌ Audio directory not found');
  }
  
  if (fs.existsSync(imagesDir)) {
    const imageFiles = fs.readdirSync(imagesDir);
    console.log('🖼️ Image files:', imageFiles);
  } else {
    console.log('❌ Images directory not found');
  }
}

checkUploads();