// src/stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import API from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      userCoins: 0,
      token: null,
      isLoading: false,
      
         clearError: () => set({ error: null }),
      // ثبت‌نام
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📤 ارسال درخواست ثبت‌نام:', userData);
          
          const response = await API.post('/auth/register', userData);
          console.log('✅ پاسخ ثبت‌نام:', response.data);
          
          return response.data;
        } catch (error) {
          console.error('❌ خطای ثبت‌نام:', error);
          const errorMessage = error.response?.data?.error || 'ثبت‌نام ناموفق بود';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      // تأیید ایمیل
       verifyEmail: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          console.log('📤 تأیید ایمیل:', { email, code });
          
          const response = await API.post('/auth/verify-email', { email, code });
          const { token, user } = response.data;
          
          localStorage.setItem('we_token', token);
          
          set({ 
            user,
            isAuthenticated: true,
            userCoins: user.coins,
            token,
            error: null
          });
          
          console.log('✅ تأیید ایمیل موفق');
          return response.data;
        } catch (error) {
          console.error('❌ خطای تأیید ایمیل:', error);
          const errorMessage = error.response?.data?.error || 'تأیید ایمیل ناموفق بود';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      // ارسال مجدد کد
      resendVerificationCode: async (email) => {
        set({ isLoading: true });
        try {
          const response = await API.post('/auth/resend-code', { email });
          return response.data;
        } catch (error) {
          throw error.response?.data || { error: 'ارسال مجدد کد ناموفق بود' };
        } finally {
          set({ isLoading: false });
        }
      },

      // لاگین
// src/stores/authStore.js - آپدیت login function
login: async (credentials) => {
  set({ isLoading: true });
  try {
    console.log('🔐 Attempting login...', credentials.email);
    
    const response = await API.post('/auth/login', credentials);
    const { token, user } = response.data;
    
    console.log('✅ Login response user:', user);
    
    localStorage.setItem('we_token', token);
    
    // 🔥 CRITICAL: مطمئن شو isAdmin از backend میاد
    set({ 
      user: {
        ...user,
        isAdmin: user.isAdmin // این خط خیلی مهمه
      },
      isAuthenticated: true,
      userCoins: user.coins,
      token
    });
    
    console.log('🎯 User after login:', useAuthStore.getState().user);
    
    return response.data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error.response?.data || { error: 'Login failed' };
  } finally {
    set({ isLoading: false });
  }
},
  logout: () => {
        console.log('🚪 Logging out user...');
        localStorage.removeItem('we_token');
        set({
          user: null,
          isAuthenticated: false,
          userCoins: 0,
          token: null,
          isLoading: false
        });
      },
      // force logout
      forceLogout: () => {
        localStorage.removeItem('we_token');
        set({
          user: null,
          isAuthenticated: false,
          userCoins: 0,
          token: null,
          isLoading: false
        });
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);