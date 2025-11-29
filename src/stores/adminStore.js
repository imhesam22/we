// src/stores/adminStore.js
import { create } from 'zustand';
import API from '../services/api';

export const useAdminStore = create((set, get) => ({
  // آمار کلی
  stats: null,
  
  // لیست کاربران
  users: [],
  usersLoading: false,
  usersPagination: {
    page: 1,
    totalPages: 1,
    total: 0
  },
  
  // لیست موزیک‌ها
  music: [],
  musicLoading: false,
  musicPagination: {
    page: 1,
    totalPages: 1,
    total: 0
  },
  
  // آمار موزیک
  musicStats: null,
  
  // وضعیت لودینگ و ارور
  loading: false,
  error: null,
  
  // پاک کردن ارور
  clearError: () => set({ error: null }),
  
  // 📊 گرفتن آمار کلی
  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/admin/stats');
      set({ stats: response.data.data, error: null });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch stats';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  
  // 👥 گرفتن لیست کاربران
  fetchUsers: async (page = 1, search = '') => {
    set({ usersLoading: true, error: null });
    try {
      const response = await API.get(`/admin/users?page=${page}&limit=10&search=${search}`);
      set({ 
        users: response.data.data.users,
        usersPagination: {
          page: response.data.data.currentPage,
          totalPages: response.data.data.totalPages,
          total: response.data.data.total
        },
        error: null 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch users';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ usersLoading: false });
    }
  },
  
  // 🎵 گرفتن لیست موزیک‌ها
  fetchMusic: async (page = 1, search = '') => {
    set({ musicLoading: true, error: null });
    try {
      const response = await API.get(`/admin/music?page=${page}&limit=10&search=${search}`);
      set({ 
        music: response.data.data.music,
        musicPagination: {
          page: response.data.data.currentPage,
          totalPages: response.data.data.totalPages,
          total: response.data.data.total
        },
        error: null 
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch music';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ musicLoading: false });
    }
  },
  
  // 📈 گرفتن آمار موزیک
  fetchMusicStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await API.get('/admin/music-stats');
      set({ musicStats: response.data.data, error: null });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch music stats';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  
  // ➕ آپلود موزیک جدید
  uploadMusic: async (formData) => {
  set({ loading: true, error: null });
  try {
    const response = await API.post('/admin/music/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    // آپدیت لیست موزیک‌ها
    await get().fetchMusic();
    
    set({ error: null });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to upload music';
    set({ error: errorMessage });
    throw new Error(errorMessage);
  } finally {
    set({ loading: false });
  }
},
  
  // ✏️ آپدیت موزیک
  updateMusic: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await API.put(`/admin/music/${id}`, updates);
      
      // آپدیت لیست موزیک‌ها
      await get().fetchMusic();
      
      set({ error: null });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update music';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  
  // 🗑️ حذف موزیک
  deleteMusic: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await API.delete(`/admin/music/${id}`);
      
      // آپدیت لیست موزیک‌ها
      await get().fetchMusic();
      
      set({ error: null });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete music';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    } finally {
      set({ loading: false });
    }
  }
}));