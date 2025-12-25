// models/User.js - نسخه اصلاح شده
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Music'
  }],
  coins: {
    type: Number,
    default: 0
  },
  
  // 🔥 سیستم جدید برای پیگیری موزیک‌های گوش داده شده
  musicInteractions: [{
    musicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Music'
    },
    listenedAt: { type: Date, default: Date.now },
    earnedCoins: { type: Boolean, default: false },
    lastInteraction: { type: Date, default: Date.now }
  }],
  
  // 🔥 برای نمایش تاریخچه
  listenHistory: [{
    musicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Music'
    },
    title: String,
    artist: String,
    listenedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  earnedHistory: [{
    musicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Music'
    },
    title: String,
    amount: Number,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  lastLogin: Date,
  verifiedAt: Date
}, {
  timestamps: true
});

// 🔥 متد برای بررسی آیا کاربر قبلاً برای این موزیک سکه دریافت کرده
userSchema.methods.hasEarnedForMusic = function(musicId) {
  return this.musicInteractions.some(interaction => 
    interaction.musicId.toString() === musicId.toString() && 
    interaction.earnedCoins === true
  );
};

// 🔥 متد برای افزودن تعامل موزیک
userSchema.methods.addMusicInteraction = function(musicId) {
  const existingIndex = this.musicInteractions.findIndex(interaction => 
    interaction.musicId.toString() === musicId.toString()
  );
  
  if (existingIndex === -1) {
    // اولین بار است که این موزیک را می‌شنود
    this.musicInteractions.push({
      musicId,
      listenedAt: new Date(),
      earnedCoins: false,
      lastInteraction: new Date()
    });
    return false; // هنوز سکه دریافت نکرده
  } else {
    // به‌روزرسانی زمان آخرین تعامل
    this.musicInteractions[existingIndex].lastInteraction = new Date();
    return this.musicInteractions[existingIndex].earnedCoins;
  }
};

// 🔥 متد برای افزودن سکه
userSchema.methods.addCoins = async function(amount, musicId, musicTitle) {
  this.coins += amount;
  
  // به‌روزرسانی تعامل موزیک
  const interactionIndex = this.musicInteractions.findIndex(interaction => 
    interaction.musicId.toString() === musicId.toString()
  );
  
  if (interactionIndex !== -1) {
    this.musicInteractions[interactionIndex].earnedCoins = true;
  }
  
  // اضافه کردن به تاریخچه کسب سکه
  this.earnedHistory.unshift({
    musicId,
    title: musicTitle,
    amount,
    earnedAt: new Date()
  });
  
  // محدود کردن تاریخچه به 50 مورد آخر
  if (this.earnedHistory.length > 50) {
    this.earnedHistory = this.earnedHistory.slice(0, 50);
  }
  
  await this.save();
  return this.coins;
};

// 🔥 متد برای افزودن به تاریخچه گوش دادن
userSchema.methods.addToListenHistory = function(music) {
  this.listenHistory.unshift({
    musicId: music._id,
    title: music.title,
    artist: music.artist,
    listenedAt: new Date()
  });
  
  // محدود کردن تاریخچه به 100 مورد آخر
  if (this.listenHistory.length > 100) {
    this.listenHistory = this.listenHistory.slice(0, 100);
  }
};

// باقی متدها همان‌گونه باقی می‌مانند
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

export default mongoose.model('User', userSchema);