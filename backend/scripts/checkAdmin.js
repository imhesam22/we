// backend/scripts/checkAdmin.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // همه کاربران ادمین رو پیدا کن
    const adminUsers = await User.find({ isAdmin: true })
      .select('username email isAdmin isVerified createdAt');
    
    console.log('👑 Admin Users:');
    adminUsers.forEach(user => {
      console.log({
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      });
    });

    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

checkAdmin();