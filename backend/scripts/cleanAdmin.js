// backend/scripts/cleanAdmin.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createCleanAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // پاک کردن کاربرهای قدیمی
    await User.deleteMany({ 
      $or: [
        { email: 'cleanadmin@we.com' },
        { username: 'cleanadmin' }
      ] 
    });
    
    // کاربر جدید با داده‌های clean
    const admin = new User({
      username: 'cleanadmin',
      email: 'cleanadmin@we.com',
      password: 'admin123',
      isVerified: true,
      isAdmin: true
    });
    
    await admin.save();
    
    console.log('🎉 CLEAN Admin created!');
    console.log('📧 cleanadmin@we.com');
    console.log('🔐 admin123');
    console.log('👑 isAdmin: TRUE');
    
    // verify کن
    const verify = await User.findOne({ email: 'cleanadmin@we.com' });
    console.log('🔍 Verification:', {
      username: verify.username,
      email: verify.email, 
      isAdmin: verify.isAdmin,
      isVerified: verify.isVerified
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createCleanAdmin();