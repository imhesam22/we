// backend/routes/auth.js
import express from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken'; // ✅ این خط باید باشه
import User from '../models/User.js';
import VerificationCode from '../models/VerificationCode.js';
import { authenticate, handleValidationErrors } from '../middleware/index.js';
import { generateVerificationCode, generateToken } from '../utils/helpers.js';
import { sendVerificationEmail, verifyEmailConnection } from '../services/emailService.js';
import { sendWelcomeEmail } from '../services/emailService.js';
verifyEmailConnection();

const router = express.Router();

// ثبت‌نام کاربر
// backend/routes/auth.js - آپدیت register
// backend/routes/auth.js - آپدیت register endpoint
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log('📝 Registration attempt:', { username, email });

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // 🔧 **درست شده: فقط کاربران VERIFIED رو چک کن**
    const existingVerifiedUser = await User.findOne({
      $or: [{ email }, { username }],
      isVerified: true  // فقط verifiedها
    });

    if (existingVerifiedUser) {
      console.log('❌ Verified user already exists:', { email, username });
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email or username'
      });
    }

    // 🔧 **کاربر verify نشده قدیمی رو پیدا کن**
    const existingUnverifiedUser = await User.findOne({
      $or: [{ email }, { username }],
      isVerified: false  // فقط unverifiedها
    });

    let user;
    let isNewUser = false;

    if (existingUnverifiedUser) {
      // 🔧 **آپدیت کاربر verify نشده موجود**
      console.log('🔄 Updating existing unverified user:', existingUnverifiedUser.email);
      
      existingUnverifiedUser.username = username;
      existingUnverifiedUser.password = password; // پسورد جدید hash میشه
      existingUnverifiedUser.createdAt = new Date(); // آپدیت تاریخ
      await existingUnverifiedUser.save();
      
      user = existingUnverifiedUser;
    } else {
      // 🔧 **ایجاد کاربر جدید**
      console.log('👤 Creating new user');
      user = new User({
        username,
        email,
        password,
        isVerified: false
      });
      await user.save();
      isNewUser = true;
    }

    // تولید کد تأیید
    const verificationCode = generateVerificationCode();
    
    // 🔧 **آپدیت یا ایجاد کد تأیید**
    await VerificationCode.findOneAndUpdate(
      { email },
      {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 دقیقه
      },
      { upsert: true, new: true }
    );

    console.log('🔐 Verification code for', email, ':', verificationCode);

    // ارسال ایمیل
    try {
      await sendVerificationEmail(email, verificationCode);
      console.log('📧 Email sent to:', email);
      
      res.status(isNewUser ? 201 : 200).json({
        success: true,
        message: 'Verification code sent to your email',
        email: email,
        isNewUser: isNewUser
      });
      
    } catch (emailError) {
      console.log('📧 Email failed, returning code in response');
      
      res.status(isNewUser ? 201 : 200).json({
        success: true,
        message: 'Check console for verification code',
        code: verificationCode, // فقط برای توسعه
        email: email,
        isNewUser: isNewUser
      });
    }

  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
});
// تأیید ایمیل
// backend/routes/auth.js - آپدیت verify-email endpoint
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log('🔐 Verification request received:', { email, code });

    // 🔧 لاگ کردن بیشتر برای دیباگ
    if (!email || !code) {
      console.log('❌ Missing email or code');
      return res.status(400).json({
        success: false,
        error: 'Email and code are required'
      });
    }

    // پیدا کردن کد تأیید
    const verification = await VerificationCode.findOne({ email, code });
    console.log('📦 Found verification:', verification);
    
    if (!verification) {
      console.log('❌ No verification code found for:', email);
      
      // 🔧 لاگ کردن تمام کدهای موجود برای این ایمیل
      const allCodes = await VerificationCode.find({ email });
      console.log('📋 All codes for this email:', allCodes);
      
      return res.status(400).json({
        success: false,
        error: 'Invalid verification code'
      });
    }

    // بررسی انقضا
    const now = new Date();
    console.log('⏰ Time check - Now:', now, 'Expires:', verification.expiresAt);
    
    if (now > verification.expiresAt) {
      console.log('❌ Code expired');
      await VerificationCode.deleteOne({ _id: verification._id });
      return res.status(400).json({
        success: false,
        error: 'Verification code expired'
      });
    }

    // پیدا کردن کاربر
    const user = await User.findOne({ email });
    console.log('👤 Found user:', user);
    
    if (!user) {
      console.log('❌ User not found for email:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // تأیید کاربر
    user.isVerified = true;
    user.verifiedAt = new Date();
    await user.save();

    // حذف کد استفاده شده
    await VerificationCode.deleteOne({ _id: verification._id });

    // تولید توکن
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    console.log('✅ Email verified successfully for:', email);

    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error: ' + error.message
    });
  }
});
// ارسال مجدد کد
router.post('/resend-code', [
  body('email').isEmail().normalizeEmail()
], handleValidationErrors, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email is already verified'
      });
    }

    // تولید کد جدید
    const verificationCode = generateVerificationCode();
    
    await VerificationCode.findOneAndUpdate(
      { email },
      {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      },
      { upsert: true, new: true }
    );

    console.log('🔄 New code for:', email, 'Code:', verificationCode);

    res.json({
      success: true,
      message: 'Verification code sent',
      code: verificationCode
    });

    user.isVerified = true;
user.verifiedAt = new Date();
await user.save();
await sendWelcomeEmail(email, user.username);
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// لاگین
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Login attempt for:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        error: 'Please verify your email first'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        isAdmin: user.isAdmin
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    user.lastLogin = new Date();
    await user.save();

    console.log('✅ Login successful - User:', {
      username: user.username,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified
    });

    // 🔥 CRITICAL: مطمئن شو isAdmin فرستاده میشه
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        isVerified: user.isVerified,
        isAdmin: user.isAdmin // این خط رو حتماً چک کن
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// اطلاعات کاربر جاری
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        coins: req.user.coins,
        isVerified: req.user.isVerified
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;