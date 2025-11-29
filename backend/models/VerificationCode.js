// backend/models/VerificationCode.js
import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '10m' } // Automatic deletion after 10 minutes
  }
}, {
  timestamps: true
});

// Create index for faster queries
verificationCodeSchema.index({ email: 1, code: 1 });

export default mongoose.model('VerificationCode', verificationCodeSchema);