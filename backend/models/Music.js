// backend/models/Music.js - آپدیت شده
import mongoose from 'mongoose';

const musicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  artist: {
    type: String,
    required: [true, 'Artist is required'],
    trim: true
  },
  duration: {
    type: String,
    required: true
  },
  genre: {
    type: String,
    required: true
  },
  coverImage: {
    type: String,
    required: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  // آمار پیشرفته
  playCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  // 🔥 تغییر: ذخیره کاربرانی که ویو کردن
  viewedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // 🔥 تغییر: ذخیره کاربرانی که گوش دادن
  listenedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    listenedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalEarnedCoins: {
    type: Number,
    default: 0
  },
  // اطلاعات آپلود
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastPlayed: Date
}, {
  timestamps: true
});

// ایندکس برای جستجوی بهتر
musicSchema.index({ title: 'text', artist: 'text' });
musicSchema.index({ genre: 1 });
musicSchema.index({ playCount: -1 });
musicSchema.index({ viewCount: -1 });
musicSchema.index({ 'viewedBy.user': 1 });
musicSchema.index({ 'listenedBy.user': 1 });

// 🔥 متد جدید: افزایش ویو فقط یکبار برای هر کاربر
musicSchema.methods.incrementView = async function(userId) {
  // چک کن اگر کاربر قبلاً این موزیک رو دیده
  const alreadyViewed = this.viewedBy.some(view => 
    view.user && view.user.toString() === userId.toString()
  );

  if (!alreadyViewed) {
    this.viewCount += 1;
    this.viewedBy.push({
      user: userId,
      viewedAt: new Date()
    });
    await this.save();
    return { viewed: true, viewCount: this.viewCount };
  }

  return { viewed: false, viewCount: this.viewCount };
};

// 🔥 متد جدید: افزایش پلی فقط یکبار برای هر کاربر
musicSchema.methods.incrementPlay = async function(userId) {
  // چک کن اگر کاربر قبلاً این موزیک رو گوش داده
  const alreadyListened = this.listenedBy.some(listen => 
    listen.user && listen.user.toString() === userId.toString()
  );

  if (!alreadyListened) {
    this.playCount += 1;
    this.listenedBy.push({
      user: userId,
      listenedAt: new Date()
    });
    this.lastPlayed = new Date();
    await this.save();
    return { played: true, playCount: this.playCount };
  }

  return { played: false, playCount: this.playCount };
};

// 🔥 متد برای چک کردن وضعیت کاربر
musicSchema.methods.getUserStatus = function(userId) {
  const hasViewed = this.viewedBy.some(view => 
    view.user && view.user.toString() === userId.toString()
  );
  
  const hasListened = this.listenedBy.some(listen => 
    listen.user && listen.user.toString() === userId.toString()
  );

  return {
    hasViewed,
    hasListened,
    viewCount: this.viewCount,
    playCount: this.playCount
  };
};

export default mongoose.model('Music', musicSchema);