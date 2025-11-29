// src/stores/musicStore.js - رفع مشکل nextTrack
import { create } from 'zustand';
import API from '../services/api';

export const useMusicStore = create((set, get) => ({
  musicList: [],
  featuredMusic: [],
  currentPlaylist: [],
  currentIndex: 0,
  currentMusic: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  audioElement: null,
  isLoading: false,
  error: null,

  // 🔧 گرفتن لیست موزیک‌ها
  fetchMusic: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await API.get('/music');
      const musicList = response.data.data;
      console.log('🎵 Fetched music:', musicList.length, 'tracks');
      
      set({ 
        musicList,
        featuredMusic: musicList,
        currentPlaylist: musicList, // 🔥 تنظیم currentPlaylist
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

  // 🔧 پخش موزیک - نسخه اصلاح شده
  // src/stores/musicStore.js - نسخه نهایی
playMusic: async (music, playlist = null) => {
  console.log('🎵 Play music called:', music?.title);
  
  const { audioElement, currentMusic, pauseMusic } = get();
  
  // اگر همین موزیک در حال پخش هست
  if (currentMusic && currentMusic._id === music._id) {
    console.log('🎵 Same music - toggling play/pause');
    if (audioElement) {
      const { isPlaying } = get();
      if (isPlaying) {
        audioElement.pause();
        set({ isPlaying: false });
      } else {
        // 🔥 با user interaction پخش کن
        audioElement.play().catch(error => {
          console.log('❌ Play failed, might need user interaction:', error);
        });
        set({ isPlaying: true });
      }
    }
    return;
  }

  // اگر موزیک جدید هست
  pauseMusic();
  
  const audio = new Audio(music.audioUrl);
  
  // event listeners
  audio.addEventListener('loadedmetadata', () => {
    console.log('🎵 Audio loaded, duration:', audio.duration);
    set({ duration: audio.duration });
  });
  
  audio.addEventListener('timeupdate', () => {
    set({ currentTime: audio.currentTime });
  });
  
  audio.addEventListener('ended', () => {
    console.log('🎵 Audio ended');
    set({ isPlaying: false, currentTime: 0 });
    
    const { currentPlaylist } = get();
    if (currentPlaylist && currentPlaylist.length > 1) {
      get().nextTrack();
    }
  });

  // 🔥 هندل کردن autoplay policy
  audio.addEventListener('canplaythrough', () => {
    console.log('🎵 Audio can play through, attempting playback...');
  });

  audio.addEventListener('error', (e) => {
    console.error('🎵 Audio error:', audio.error);
  });

  try {
    console.log('🎵 Attempting to play...');
    await audio.play();
    console.log('🎵 Play successful!');
    
    set({
      currentMusic: music,
      isPlaying: true,
      audioElement: audio,
      currentTime: 0
    });

    // افزایش ویو
    try {
      const { data } = await API.post(`/music/${music._id}/view`);
      console.log('👀 View result:', data);
    } catch (error) {
      console.log('👀 View count failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Play failed:', error);
    console.error('❌ Error name:', error.name);
    
    // 🔥 اگر autoplay policy مشکل داشت، audio element رو ذخیره کن
    // و به کاربر اجازه بده manually پخش کنه
    set({
      currentMusic: music,
      isPlaying: false,
      audioElement: audio,
      currentTime: 0
    });
    
    // می‌تونیم به کاربر بگیم روی دکمه پلیر کلیک کنه
    console.log('💡 User interaction might be required for playback');
  }
},
  // 🔧 ترک بعدی - نسخه ایمن
  nextTrack: () => {
    const { currentPlaylist, currentIndex } = get();
    console.log('⏭️ Next track called');
    console.log('⏭️ Current playlist length:', currentPlaylist?.length);
    console.log('⏭️ Current index:', currentIndex);
    
    // 🔥 چک کردن وجود playlist
    if (!currentPlaylist || currentPlaylist.length === 0) {
      console.log('⏭️ No playlist available');
      return;
    }

    // اگر فقط یک ترک وجود داره، همین ترک رو دوباره پخش کن
    if (currentPlaylist.length === 1) {
      console.log('⏭️ Only one track - replaying current');
      const currentMusic = currentPlaylist[0];
      get().playMusic(currentMusic);
      return;
    }

    const nextIndex = (currentIndex + 1) % currentPlaylist.length;
    const nextMusic = currentPlaylist[nextIndex];
    
    console.log('⏭️ Next music:', nextMusic?.title);
    console.log('⏭️ Next index:', nextIndex);
    
    if (!nextMusic) {
      console.log('⏭️ No next music found');
      return;
    }
    
    set({ currentIndex: nextIndex });
    get().playMusic(nextMusic);
  },

  // 🔧 ترک قبلی - نسخه ایمن
  prevTrack: () => {
    const { currentPlaylist, currentIndex } = get();
    console.log('⏮️ Previous track called');
    console.log('⏮️ Current playlist length:', currentPlaylist?.length);
    
    if (!currentPlaylist || currentPlaylist.length === 0) {
      console.log('⏮️ No playlist available');
      return;
    }

    // اگر فقط یک ترک وجود داره، همین ترک رو دوباره پخش کن
    if (currentPlaylist.length === 1) {
      console.log('⏮️ Only one track - replaying current');
      const currentMusic = currentPlaylist[0];
      get().playMusic(currentMusic);
      return;
    }

    const prevIndex = currentIndex === 0 ? currentPlaylist.length - 1 : currentIndex - 1;
    const prevMusic = currentPlaylist[prevIndex];
    
    console.log('⏮️ Previous music:', prevMusic?.title);
    console.log('⏮️ Previous index:', prevIndex);
    
    if (!prevMusic) {
      console.log('⏮️ No previous music found');
      return;
    }
    
    set({ currentIndex: prevIndex });
    get().playMusic(prevMusic);
  },

  // 🔧 pause
  pauseMusic: () => {
    const { audioElement } = get();
    console.log('⏸️ Pausing music');
    if (audioElement) {
      audioElement.pause();
    }
    set({ isPlaying: false });
  },

  // 🔧 seek
  seekMusic: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },

  // 🔧 volume
  setVolume: (volume) => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume / 100;
    }
  },

  // 🔧 کسب سکه
  earnCoin: async (musicId, musicTitle) => {
    try {
      console.log('💰 Earning coin for:', musicTitle);
      const response = await API.post('/music/earn-coin', {
        musicId,
        musicTitle
      });
      console.log('💰 Coin earned:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Earn coin error:', error);
      throw error;
    }
  },

  formatTime: (seconds) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}));