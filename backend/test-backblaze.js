import dotenv from 'dotenv';
import { S3Client, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

dotenv.config();

// 🔧 تنظیمات
const REGION = process.env.B2_REGION;
const BUCKET = process.env.B2_BUCKET_NAME;

// ⚠️ حتماً اینو عوض کن
const TEST_AUDIO_KEY = 'music/dariush-shaghayegh-1765656306821.mp3'; // مثلا: music/track1.mp3

const client = new S3Client({
  endpoint: `https://s3.${REGION}.backblazeb2.com`,
  region: REGION,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY
  }
});

async function testBackblaze() {
  try {
    console.log('🔍 Testing Backblaze connection...\n');

    // 1️⃣ HEAD – گرفتن اطلاعات فایل
    console.log('📦 Checking file metadata...');
    const head = await client.send(
      new HeadObjectCommand({
        Bucket: BUCKET,
        Key: TEST_AUDIO_KEY
      })
    );

    console.log('✅ File found');
    console.log('   Size:', head.ContentLength, 'bytes');
    console.log('   Type:', head.ContentType);
    console.log('----------------------------');

    // 2️⃣ GET با Range (برای استریم)
    console.log('🎧 Testing stream with Range...');
    const range = 'bytes=0-102400'; // 100KB اول فایل

    const get = await client.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: TEST_AUDIO_KEY,
        Range: range
      })
    );

    console.log('✅ Stream OK');
    console.log('   Content-Range:', get.ContentRange);
    console.log('   Content-Length:', get.ContentLength);
    console.log('----------------------------');

    // 3️⃣ خواندن چند بایت از استریم
    const stream = get.Body;
    let total = 0;

    for await (const chunk of stream) {
      total += chunk.length;
      if (total > 1024 * 10) break; // فقط 10KB
    }

    console.log('✅ Stream readable');
    console.log('   Read bytes:', total);

    console.log('\n🎉 Backblaze test PASSED');
  } catch (err) {
    console.error('\n❌ Backblaze test FAILED');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
  }
}

testBackblaze();
