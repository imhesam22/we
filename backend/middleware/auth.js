// backend/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('🔐 Auth Middleware - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔐 Decoded Token:', decoded);
    
    const user = await User.findById(decoded.userId);
    console.log('🔐 Found User:', user ? {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isVerified: user.isVerified
    } : 'User not found');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token. User not found.' 
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({ 
        success: false,
        error: 'Please verify your email first.' 
      });
    }

    req.user = user;
    console.log('✅ Auth Successful - User is admin:', user.isAdmin);
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token.' 
    });
  }
};

// 🔥 اضافه کردن optionalAuth
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user && user.isVerified) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // در صورت خطا، بدون user ادامه بده
    next();
  }
};

// 🔥 اضافه کردن requireAdmin
export const requireAdmin = async (req, res, next) => {
  try {
    console.log('👑 Admin Check - User:', req.user ? {
      username: req.user.username,
      isAdmin: req.user.isAdmin
    } : 'No user in request');
    
    if (!req.user.isAdmin) {
      console.log('❌ Admin access denied for user:', req.user.username);
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }
    
    console.log('✅ Admin access granted for:', req.user.username);
    next();
  } catch (error) {
    console.error('❌ Admin middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};