// src/stores/musicStore.js - نسخه نهایی
import { create } from 'zustand';
import API from '../services/api';
import { useAuthStore } from './authStore';

export const useMusicStore = create((set, get) => ({
  musicList: [],
  featuredMusic: [],
  favorites: [],
  currentPlaylist: [],
  currentIndex: 0,
  currentMusic: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  audioElement: null,
  isLoading: false,
  error: null,
  
  searchMusic: async (query, filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.page) params.append('page', filters.page);
      
      const res = await API.get(`/music/search?${params.toString()}`);
      return res.data;
    } catch (err) {
      console.error('❌ Search error:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  
  fetchMusic: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.get('/music');
      const musicList = response.data.data;
      
      const processedMusic = musicList.map(music => ({
        ...music,
        coverImage: music.coverImage?.startsWith('http') 
          ? music.coverImage 
          : `http://localhost:3000${music.coverImage}`,
        streamUrl: `/api/music/stream/${music._id}`
      }));
      
      set({ 
        musicList: processedMusic,
        featuredMusic: processedMusic,
        currentPlaylist: processedMusic,
        error: null 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Fetch music error:', error);
      set({ error: 'Failed to load music' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  playMusic: async (music, playlist = null) => {
    const { audioElement, currentMusic } = get();
    const authStore = useAuthStore.getState();
    
    // اگر همین موزیک در حال پخش است
    if (currentMusic && currentMusic._id === music._id && audioElement) {
      if (audioElement.paused) {
        try {
          await audioElement.play();
          set({ isPlaying: true });
        } catch (error) {
          console.log('⛔ Play resume error:', error);
          set({ isPlaying: false });
        }
      } else {
        audioElement.pause();
        set({ isPlaying: false });
      }
      return;
    }
    
    // متوقف کردن audio قبلی
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      audioElement.remove();
    }
    
    // ساخت URL استریم
    const streamUrl = `http://localhost:3000/api/music/stream/${music._id}`;
    console.log('🎵 Streaming from API:', streamUrl);
    
    // ایجاد audio element جدید
    const audio = new Audio();
    audio.src = streamUrl;
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    
    // 🔥 نمایش نوتیفیکیشن برای کسب سکه
    const showCoinNotification = (coinsEarned, totalCoins) => {
      if (coinsEarned > 0) {
        // می‌توانید از Toast یا Modal استفاده کنید
        console.log(`🎉 +${coinsEarned} coin earned! Total: ${totalCoins}`);
        
        // رفرش کردن سکه‌های کاربر
        authStore.refreshUserData();
      }
    };
    
    // تنظیم event handlers
    audio.onloadedmetadata = () => {
      set({ duration: audio.duration || 0 });
    };
    
    audio.ontimeupdate = () => {
      const currentTime = audio.currentTime;
      set({ currentTime });
      
      // 🔥 اگر 30 ثانیه از موزیک پخش شد، سکه را ثبت کن
      if (authStore.isAuthenticated && currentTime >= 30) {
        // فقط یک بار چک کن
        if (!window.coinCheckedForTrack) {
          window.coinCheckedForTrack = music._id;
          
          // بررسی سریع از سرور
          API.get(`/music/check-earning/${music._id}`)
            .then(response => {
              if (response.data.canEarn) {
                console.log('✅ User can earn coins for this track');
              }
            })
            .catch(console.error);
        }
      }
    };
    
    audio.onended = () => {
      console.log('⏹️ Track ended');
      set({ isPlaying: false });
      window.coinCheckedForTrack = null;
      
      setTimeout(() => {
        get().nextTrack();
      }, 500);
    };
    
    audio.onerror = (e) => {
      console.error('❌ Audio stream error:', audio.error);
      set({ isPlaying: false, error: 'خطا در بارگذاری فایل صوتی' });
    };
    
    audio.onplay = () => {
      set({ isPlaying: true });
    };
    
    audio.onpause = () => {
      set({ isPlaying: false });
    };
    
    // آپدیت state
    set({
      audioElement: audio,
      currentMusic: music,
      currentTime: 0,
      isPlaying: false,
      error: null
    });
    
    // ست کردن playlist
    if (playlist && Array.isArray(playlist)) {
      const currentIndex = playlist.findIndex(m => m._id === music._id);
      if (currentIndex !== -1) {
        set({ 
          currentPlaylist: playlist,
          currentIndex: currentIndex 
        });
      }
    }
    
    // تلاش برای پخش
    try {
      await audio.play();
      set({ isPlaying: true });
    } catch (error) {
      console.log('⛔ Auto-play blocked:', error);
    }
  },
  
  nextTrack: () => {
    const { currentPlaylist, currentIndex } = get();
    
    if (!currentPlaylist || currentPlaylist.length === 0) {
      return;
    }
    
    if (currentPlaylist.length === 1) {
      const currentMusic = currentPlaylist[0];
      get().playMusic(currentMusic);
      return;
    }
    
    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    const nextMusic = currentPlaylist[nextIndex];
    
    if (!nextMusic) return;
    
    set({ currentIndex: nextIndex });
    get().playMusic(nextMusic);
  },
  
  prevTrack: () => {
    const { currentPlaylist, currentIndex } = get();
    
    if (!currentPlaylist || currentPlaylist.length === 0) {
      return;
    }
    
    if (currentPlaylist.length === 1) {
      const currentMusic = currentPlaylist[0];
      get().playMusic(currentMusic);
      return;
    }
    
    const prevIndex = currentIndex === 0 ? currentPlaylist.length - 1 : currentIndex - 1;
    const prevMusic = currentPlaylist[prevIndex];
    
    if (!prevMusic) return;
    
    set({ currentIndex: prevIndex });
    get().playMusic(prevMusic);
  },
  
  pauseMusic: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
    }
    set({ isPlaying: false });
  },
  
  seekMusic: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },
  
  setVolume: (volume) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume / 100;
    }
  },
  
  fetchFavorites: async () => {
    set({ isLoading: true });
    try {
      const response = await API.get('/music/favorites');
      
      const favoritesWithUrls = response.data.data?.map(music => ({
        ...music,
        coverImage: music.coverImage?.startsWith('http') 
          ? music.coverImage 
          : `http://localhost:3000${music.coverImage}`,
        streamUrl: `/api/music/stream/${music._id}`
      })) || [];
      
      set({ 
        favorites: favoritesWithUrls,
        error: null 
      });
    } catch (error) {
      console.error('❌ Fetch favorites error:', error);
      set({ 
        favorites: [],
        error: 'Failed to load favorites' 
      });
    } finally {
      set({ isLoading: false });
    }
  },
  
  toggleFavorite: async (musicId) => {
    try {
      const response = await API.post(`/music/favorite/${musicId}`);
      
      if (response.data.success) {
        const currentFavorites = get().favorites || [];
        const isCurrentlyFavorite = currentFavorites.some(f => f._id === musicId);
        
        let newFavorites;
        if (isCurrentlyFavorite) {
          newFavorites = currentFavorites.filter(f => f._id !== musicId);
        } else {
          try {
            const musicResponse = await API.get(`/music/${musicId}`);
            if (musicResponse.data.success) {
              newFavorites = [...currentFavorites, musicResponse.data.data];
            } else {
              newFavorites = currentFavorites;
            }
          } catch {
            newFavorites = currentFavorites;
          }
        }
        
        set({ favorites: newFavorites });
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Toggle favorite error:', error);
      throw error;
    }
  },
  
  formatTime: (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  },
  
  // 🔥 تابع جدید برای گرفتن آمار کاربر
  getUserStats: async () => {
    try {
      const response = await API.get('/music/user-stats');
      return response.data;
    } catch (error) {
      console.error('❌ Get user stats error:', error);
      throw error;
    }
  }
}));