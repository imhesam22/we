// src/stores/authStore.js - نسخه اصلاح شده
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import API from '../services/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      isLoading: false,
      error: null,
      
      // 🔥 تابع جدید: لود کردن کاربر از سرور با token
      loadUserFromToken: async () => {
        const token = localStorage.getItem('we_token');
        
        if (!token) {
          console.log('🔍 No token found in localStorage');
          return false;
        }
        
        console.log('🔍 Found token, loading user...');
        set({ isLoading: true });
        
        try {
          // تست اتصال با token
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await API.get('/auth/me');
          const user = response.data.user;
          
          console.log('✅ User loaded from token:', user.username);
          
          // 🔥 مطمئن شویم isAdmin و coins وجود دارند
          set({
            user: {
              ...user,
              isAdmin: user.isAdmin || false,
              coins: user.coins || 0,
              isVerified: user.isVerified || false
            },
            isAuthenticated: true,
            token: token,
            isLoading: false,
            error: null
          });
          
          return true;
        } catch (error) {
          console.error('❌ Failed to load user from token:', error);
          
          // اگر token منقضی یا نامعتبر است
          if (error.response?.status === 401) {
            localStorage.removeItem('we_token');
          }
          
          set({
            user: null,
            isAuthenticated: false,
            token: null,
            isLoading: false,
            error: 'Session expired. Please login again.'
          });
          
          return false;
        }
      },
      
      clearError: () => set({ error: null }),
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.post('/auth/register', userData);
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'ثبت‌نام ناموفق بود';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      verifyEmail: async (email, code) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.post('/auth/verify-email', { email, code });
          const { token, user } = response.data;
          
          localStorage.setItem('we_token', token);
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ 
            user: {
              ...user,
              isAdmin: user.isAdmin || false,
              coins: user.coins || 0,
              isVerified: true
            },
            isAuthenticated: true,
            token,
            error: null
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.error || 'تأیید ایمیل ناموفق بود';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🔐 Attempting login...', credentials.email);
          
          const response = await API.post('/auth/login', credentials);
          const { token, user } = response.data;
          
          console.log('✅ Login successful:', user.username);
          
          // ذخیره token و ست کردن header
          localStorage.setItem('we_token', token);
          API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          set({ 
            user: {
              ...user,
              isAdmin: user.isAdmin || false,
              coins: user.coins || 0,
              isVerified: user.isVerified || false
            },
            isAuthenticated: true,
            token,
            error: null
          });
          
          return response.data;
        } catch (error) {
          console.error('❌ Login error:', error);
          const errorMessage = error.response?.data?.error || 'Login failed';
          set({ error: errorMessage });
          throw new Error(errorMessage);
        } finally {
          set({ isLoading: false });
        }
      },
      
      logout: () => {
        console.log('🚪 Logging out...');
        
        // پاک کردن از localStorage
        localStorage.removeItem('we_token');
        delete API.defaults.headers.common['Authorization'];
        
        // پاک کردن state
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          isLoading: false,
          error: null
        });
      },
      
      refreshUser: async () => {
        if (!get().token) return null;
        
        try {
          const response = await API.get('/auth/me');
          const user = response.data.user;
          
          set({
            user: {
              ...user,
              coins: user.coins || 0
            }
          });
          
          return user;
        } catch (error) {
          console.error('❌ Refresh user error:', error);
          if (error.response?.status === 401) {
            get().logout();
          }
          return null;
        }
      },
      
      // 🔥 تابع جدید: آپدیت سکه‌ها
      updateCoins: (newCoins) => {
        set(state => ({
          user: state.user ? {
            ...state.user,
            coins: newCoins
          } : null
        }));
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 🔥 فقط token را ذخیره کن، user از سرور لود شود
      partialize: (state) => ({ 
        token: state.token 
      }),
      // 🔥 وقتی state از localStorage لود شد، این تابع اجرا شود
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Storage rehydrated');
        if (state?.token) {
          // کمی صبر کن سپس کاربر را لود کن
          setTimeout(() => {
            state.loadUserFromToken?.();
          }, 100);
        }
      }
    }
  )
);

// 🔥 Hook برای بررسی وضعیت auth
export const useAuthInitializer = () => {
  const loadUserFromToken = useAuthStore(state => state.loadUserFromToken);
  
  return {
    initializeAuth: loadUserFromToken
  };
};