// backend/services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// ایجاد transporter - 🔧 درست شده
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// تست اتصال ایمیل
export const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ اتصال ایمیل فعال شد');
    return true;
  } catch (error) {
    console.error('❌ خطای اتصال ایمیل:', error);
    return false;
  }
};

// ارسال کد تأیید
export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"WE Music" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'کد تأیید حساب WE',
      html: `
        <div style="font-family: Tahoma, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #333; margin-bottom: 10px;">🎵 WE Music</h1>
            <h2 style="color: #666; margin-bottom: 20px;">کد تأیید حساب کاربری</h2>
            <p style="color: #666; margin: 20px 0;">
              برای فعال‌سازی حساب خود، لطفاً کد زیر را در اپلیکیشن وارد کنید:
            </p>
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
              ${verificationCode}
            </div>
            <p style="color: #999; font-size: 14px; margin: 20px 0;">
              ⏰ این کد به مدت ۱۰ دقیقه معتبر است
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
            <p style="color: #999; font-size: 12px;">
              اگر این درخواست توسط شما ارسال نشده است، این ایمیل را نادیده بگیرید.
            </p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 ایمیل ارسال شد به:', email);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ خطای ارسال ایمیل:', error);
    return { success: false, error: error.message };
  }
};

// ارسال ایمیل خوش‌آمدگویی
export const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"WE Music" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'خوش آمدید به WE! 🎉',
      html: `
        <div style="font-family: Tahoma, sans-serif; padding: 20px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #333; margin-bottom: 10px;">🎉 خوش آمدید!</h1>
            <p style="color: #666; margin-bottom: 20px;">حساب شما با موفقیت فعال شد</p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              عزیز <strong>${username}</strong>،
            </p>
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              به خانواده WE خوش آمدید! 🎵
            </p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: right;">
              <p style="color: #666; margin: 5px 0;">✅ به موزیک‌های اختصاصی دسترسی دارید</p>
              <p style="color: #666; margin: 5px 0;">✅ با گوش دادن به موزیک سکه کسب می‌کنید</p>
              <p style="color: #666; margin: 5px 0;">✅ از امکانات ویژه اعضا استفاده می‌کنید</p>
            </div>
            
            <p style="color: #999; font-size: 12px; margin-top: 25px;">
              اپلیکیشن WE: http://localhost:5173
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('🎉 ایمیل خوش‌آمدگویی ارسال شد به:', email);
    
  } catch (error) {
    console.error('❌ خطای ارسال ایمیل خوش‌آمدگویی:', error);
  }
};