// backend/scripts/quickFileCheck.js
import fs from 'fs';
import path from 'path';

function quickFileCheck() {
  const filePath = './uploads/audio/1763814610309-631894243.mp3';
  
  console.log('🔍 Quick File Check...');
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ File does not exist at path:', filePath);
    return;
  }

  const stats = fs.statSync(filePath);
  console.log('📁 File exists - Size:', stats.size, 'bytes');
  
  // خواندن 100 بایت اول
  const buffer = fs.readFileSync(filePath, { encoding: null, flag: 'r' });
  console.log('📊 Total file size:', buffer.length, 'bytes');
  
  // نمایش 10 بایت اول (hex)
  const firstBytes = Array.from(buffer.slice(0, 10)).map(b => 
    b.toString(16).padStart(2, '0')
  ).join(' ');
  console.log('🔬 First 10 bytes (hex):', firstBytes);
  
  // چک کردن signature
  console.log('🎵 Checking MP3 signature...');
  const isID3 = buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33;
  const isMPEG = buffer[0] === 0xFF && (buffer[1] & 0xE0) === 0xE0;
  
  console.log('   ID3 header:', isID3 ? '✅ Found' : '❌ Not found');
  console.log('   MPEG frame:', isMPEG ? '✅ Found' : '❌ Not found');
  
  if (!isID3 && !isMPEG) {
    console.log('⚠️  File may not be valid MP3!');
  }
}

quickFileCheck();