// backend/scripts/createNewAdmin.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createNewAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // ایجاد کاربر ادمین جدید
    const adminUser = new User({
      username: 'superadmin',
      email: 'superadmin@we.com',
      password: 'noodisazz1234',
      isVerified: true,
      isAdmin: true
    });

    await adminUser.save();
    
    console.log('🎉 New admin user created!');
    console.log('📧 Email: superadmin@we.com');
    console.log('🔐 Password: noodisazz1234');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

createNewAdmin();