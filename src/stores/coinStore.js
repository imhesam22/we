// src/stores/coinStore.js
import { create } from 'zustand';
import API from '../services/api';
import { useAuthStore } from './authStore';

export const useCoinStore = create((set, get) => ({
  isLoading: false,
  error: null,

  // کسب سکه
  earnCoin: async (musicId, musicTitle) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await API.post('/music/earn-coin', {
        musicId,
        musicTitle
      });

      // آپدیت سکه‌ها در authStore
      if (response.data.coins !== undefined) {
        useAuthStore.getState().updateUserCoins(response.data.coins);
      }

      console.log('✅ سکه کسب شد:', response.data);
      return response.data;

    } catch (error) {
      console.error('❌ خطای کسب سکه:', error);
      const errorMessage = error.response?.data?.error || 'کسب سکه ناموفق بود';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ isLoading: false });
    }
  },

  // پاک کردن error
  clearError: () => set({ error: null })
}));