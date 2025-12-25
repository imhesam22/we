// models/Music.js - نسخه اصلاح شده
import mongoose from 'mongoose';

const musicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  duration: { type: String, required: true },
  genre: { type: String, required: true },
  coverImage: { type: String, required: true },
  audioKey: { type: String, default: null },
  mimeType: { type: String, default: 'audio/mpeg' },
  
  playCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  // 🔥 اضافه کردن لیست کاربرانی که موزیک را گوش داده‌اند
  listenedBy: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    listenedAt: { type: Date, default: Date.now },
    earnedCoins: { type: Boolean, default: false }
  }],
  
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { 
  timestamps: true
});

// 🔥 متد برای بررسی آیا کاربر قبلاً این موزیک را گوش داده است
musicSchema.methods.hasUserListened = function(userId) {
  return this.listenedBy.some(listener => 
    listener.userId.toString() === userId.toString() && listener.earnedCoins
  );
};

// 🔥 متد برای افزودن کاربر به لیست شنوندگان
musicSchema.methods.addListener = async function(userId) {
  const existing = this.listenedBy.find(listener => 
    listener.userId.toString() === userId.toString()
  );
  
  if (!existing) {
    this.listenedBy.push({
      userId,
      listenedAt: new Date(),
      earnedCoins: false
    });
    return false; // هنوز سکه دریافت نکرده
  }
  
  return existing.earnedCoins; // آیا قبلاً سکه دریافت کرده؟
};

// 🔥 متد برای علامت‌گذاری سکه دریافتی
musicSchema.methods.markCoinsEarned = function(userId) {
  const listener = this.listenedBy.find(listener => 
    listener.userId.toString() === userId.toString()
  );
  
  if (listener && !listener.earnedCoins) {
    listener.earnedCoins = true;
    return true;
  }
  return false;
};

// 🔥 افزایش viewCount برای هر بار بازدید
musicSchema.methods.incrementView = function(userId) {
  // چک کن آیا کاربر قبلاً این موزیک رو دیده
  const hasViewed = this.listenedBy.some(listener => 
    listener.userId?.toString() === userId?.toString()
  );
  
  // اگر کاربر لاگین کرده و قبلاً ندیده، ویو اضافه کن
  if (userId && !hasViewed) {
    this.viewCount = (this.viewCount || 0) + 1;
    
    // کاربر رو به لیست اضافه کن (بدون سکه)
    if (!hasViewed) {
      this.listenedBy.push({
        userId,
        listenedAt: new Date(),
        earnedCoins: false
      });
    }
    console.log(`👁️ User view counted: ${userId} for ${this.title}`);
    return true;
  }
  
  // ⚠️ حذف بخش sessionStorage برای backend
  // این بخش باید در frontend هندل شود
  // فقط برای کاربران مهمان که userId ندارند
  if (!userId) {
    // در backend نمی‌توانیم sessionStorage چک کنیم
    // پس یا ویو ندهیم یا روش دیگری پیاده‌سازی کنیم
    console.log(`👁️ Guest view for ${this.title} (not counted in backend)`);
    return false;
  }
  
  return false;
};

musicSchema.pre('save', function(next) {
  if (this.isNew && !this.audioKey) {
    this.isActive = false;
  }
  next();
});

musicSchema.virtual('streamUrl').get(function() {
  return `/api/music/stream/${this._id}`;
});

musicSchema.set('toJSON', { virtuals: true });
musicSchema.set('toObject', { virtuals: true });

export default mongoose.model('Music', musicSchema);