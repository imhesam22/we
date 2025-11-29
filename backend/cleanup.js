// backend/cleanup.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // پاک کردن users
    const userResult = await mongoose.connection.collection('users').deleteMany({});
    console.log(`🗑️ Deleted ${userResult.deletedCount} users`);
    
    // پاک کردن verificationcodes
    const codeResult = await mongoose.connection.collection('verificationcodes').deleteMany({});
    console.log(`🗑️ Deleted ${codeResult.deletedCount} verification codes`);
    
    console.log('🎉 Database cleaned successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
}

cleanup();