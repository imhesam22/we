import { 
  S3Client, 
  GetObjectCommand, 
  HeadObjectCommand,
  PutObjectCommand // این خط اضافه شده
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class BackblazeService {
  constructor() {
    console.log('🔧 Initializing Backblaze Service...');
    console.log('📦 Bucket:', process.env.B2_BUCKET_NAME);
    console.log('🌍 Region:', process.env.B2_REGION);
    
    this.client = new S3Client({
      endpoint: `https://s3.${process.env.B2_REGION}.backblazeb2.com`,
      region: process.env.B2_REGION,
      credentials: {
        accessKeyId: process.env.B2_KEY_ID,
        secretAccessKey: process.env.B2_APPLICATION_KEY
      }
    });

    this.bucket = process.env.B2_BUCKET_NAME;
    console.log('✅ Backblaze Service initialized');
  }

  // 🔥 متد جدید: آپلود فایل به Backblaze
  async uploadFile(buffer, key, contentType) {
    try {
      console.log('📤 Uploading file to Backblaze:', {
        key,
        size: buffer.length,
        contentType
      });

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'max-age=31536000', // 1 year cache
        ACL: 'private' // فایل private باشد
      });

      await this.client.send(command);
      console.log('✅ File uploaded successfully:', key);
      
      return { 
        success: true, 
        key,
        url: `https://${this.bucket}.s3.${process.env.B2_REGION}.backblazeb2.com/${key}`
      };
      
    } catch (error) {
      console.error('❌ Backblaze upload error:', error);
      throw new Error(`آپلود فایل ناموفق بود: ${error.message}`);
    }
  }

  // 🔥 متد: چک کردن وجود فایل
  async fileExists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  // 🔥 متد: گرفتن stream از فایل
  async getStreamRange(key, start, end = undefined) {
    try {
      const range = end !== undefined 
        ? `bytes=${start}-${end}`
        : `bytes=${start}-`;

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Range: range
      });

      const response = await this.client.send(command);
      
      return {
        stream: response.Body,
        contentLength: response.ContentLength || 0,
        contentType: response.ContentType || 'audio/mpeg',
        contentRange: response.ContentRange || range
      };
    } catch (error) {
      console.error('❌ getStreamRange error:', error);
      throw new Error(`خطا در استریم فایل: ${error.message}`);
    }
  }

  // 🔥 متد: گرفتن signed URL
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.client, command, { 
        expiresIn 
      });

      return signedUrl;
    } catch (error) {
      console.error('❌ Signed URL error:', error);
      throw new Error(`خطا در ایجاد لینک موقت: ${error.message}`);
    }
  }
}

export const backblazeService = new BackblazeService();