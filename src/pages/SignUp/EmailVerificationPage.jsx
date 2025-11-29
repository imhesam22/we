// src/pages/SignUp/EmailVerificationPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const EmailVerificationPage = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  
  const { verifyEmail, resendVerificationCode } = useAuthStore();
  const navigate = useNavigate();

  // گرفتن ایمیل از localStorage
  useEffect(() => {
    const email = localStorage.getItem('pending_email');
    if (email) {
      setUserEmail(email);
    } else {
      navigate('/register');
    }
  }, [navigate]);

  // کانتداون
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // حرکت به فیلد بعدی
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const enteredCode = code.join('');
    
    if (enteredCode.length !== 6) {
      setError('لطفاً کد ۶ رقمی را کامل وارد کنید');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyEmail(userEmail, enteredCode);
      
      if (result.success) {
        // پاک کردن داده‌های موقت
        localStorage.removeItem('pending_email');
        // رفتن به صفحه اصلی
        navigate('/');
      }
      
    } catch (error) {
      setError(error.error || 'تأیید ایمیل ناموفق بود');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown === 0 && userEmail) {
      setCountdown(60);
      setError('');
      setCode(['', '', '', '', '', '']);
      
      try {
        console.log('🔄 درخواست ارسال مجدد کد...');
        
        const result = await resendVerificationCode(userEmail);
        
        if (result.success) {
          console.log('📧 کد جدید:', result.code);
          setError(`کد جدید: ${result.code}`);
        } else {
          setError(result.error || 'ارسال مجدد کد ناموفق بود');
        }
        
      } catch (error) {
        console.error('❌ خطای ارسال مجدد:', error);
        setError(error.error || 'ارسال مجدد کد ناموفق بود');
      }
      
      document.getElementById('code-0')?.focus();
    }
  };

  if (!userEmail) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">در حال بارگذاری...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2">تأیید ایمیل</h1>
              <p className="text-white/70 mb-2">کد تأیید به آدرس زیر ارسال شد</p>
              <p className="text-purple-400 font-semibold">{userEmail}</p>
              
              {/* نمایش کد تست */}
              <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  🔒 کد تأیید در کنسول مرورگر نمایش داده می‌شود
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-white/80 text-sm font-medium mb-4 text-center">
                  کد ۶ رقمی را وارد کنید
                </label>
                
                <div className="flex justify-center space-x-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 bg-white/5 border border-white/20 rounded-xl text-white text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    در حال تأیید...
                  </div>
                ) : (
                  'تأیید ایمیل'
                )}
              </button>

              <div className="text-center">
                <p className="text-white/70">
                  کد را دریافت نکردید؟{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={countdown > 0}
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200 disabled:text-white/40 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `${countdown} ثانیه تا ارسال مجدد` : 'ارسال مجدد کد'}
                  </button>
                </p>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;