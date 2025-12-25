// src/components/Music/MusicPlayerUI.jsx - نسخه اصلاح شده
import React, { useEffect, useMemo, useState } from 'react';
import { useMusicStore } from '../../stores/musicStore';
import { usePlayerStore } from '../../stores/playerStore';
import { useAuthStore } from '../../stores/authStore';
import API from '../../services/api';
import {
  FiPlay,
  FiPause,
  FiSkipBack,
  FiSkipForward,
  FiVolume2,
  FiVolumeX,
  FiRepeat,
  FiShuffle,
  FiHeart,
} from 'react-icons/fi';

const MusicPlayerUI = () => {
  /* ===== MUSIC STORE ===== */
  const {
    currentMusic,
    isPlaying,
    currentTime,
    duration,
    audioElement,
    playMusic,
    pauseMusic,
    seekMusic,
    nextTrack,
    prevTrack,
    formatTime,
    favorites,
    fetchFavorites
  } = useMusicStore();

  /* ===== PLAYER STORE ===== */
  const {
    volume,
    isLooping,
    isShuffling,
    playerTheme,
    playerThemes,
    setVolume,
    toggleLoop,
    toggleShuffle,
  } = usePlayerStore();

  /* ===== AUTH STORE ===== */
  const { user } = useAuthStore();

  /* ===== LOCAL STATE ===== */
  const [isFavorite, setIsFavorite] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  /* ===== EFFECTS ===== */
  useEffect(() => {
    if (audioElement) {
      audioElement.volume = volume / 100;
    }
  }, [volume, audioElement]);

  useEffect(() => {
    if (audioElement) {
      audioElement.loop = isLooping;
    }
  }, [isLooping, audioElement]);

  // چک کردن favorite بودن موزیک فعلی
  useEffect(() => {
    if (currentMusic && favorites) {
      const favorite = favorites.some(f => f._id === currentMusic._id);
      setIsFavorite(favorite);
    }
  }, [currentMusic, favorites]);

  /* ===== HANDLERS ===== */
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * duration;
    seekMusic(seekTime);
  };

  // تابع toggleFavorite جدید
  const toggleFavorite = async () => {
    if (!user || !currentMusic) {
      alert('برای افزودن به علاقه‌مندی‌ها باید وارد حساب شوید');
      return;
    }

    setIsTogglingFavorite(true);
    try {
      const response = await API.post(`/music/favorite/${currentMusic._id}`);
      
      if (response.data.success) {
        setIsFavorite(!isFavorite);
        // refresh favorites list
        fetchFavorites();
      }
    } catch (error) {
      console.error('❌ Toggle favorite error:', error);
      alert('خطا در بروزرسانی علاقه‌مندی‌ها');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handlePlayPause = () => {
    if (!currentMusic) return;
    
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic(currentMusic);
    }
  };

  /* ===== MEMOS ===== */
  const theme = useMemo(
    () => playerThemes[playerTheme],
    [playerTheme, playerThemes]
  );

  const progress = useMemo(() => {
    if (!duration || duration === 0) return 0;
    return (currentTime / duration) * 100;
  }, [currentTime, duration]);

  // اگر موزیکی در حال پخش نیست، چیزی نمایش نده
  if (!currentMusic) return null;

  return (
    <div className="fixed bottom-2 left-80 right-80 z-50">
      <div className={`bg-slate-950 border ${theme.border} p-4 rounded-2xl`}>
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-4">

            {/* INFO SECTION */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={currentMusic.coverImage}
                  className="w-full h-full object-cover"
                  alt={currentMusic.title}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">
                  {currentMusic.title}
                </h3>
                <p className="text-gray-400 text-xs truncate">
                  {currentMusic.artist}
                </p>
              </div>
              
              {/* FAVORITE BUTTON */}
              <button
                onClick={toggleFavorite}
                disabled={isTogglingFavorite}
                className={`p-2 rounded-lg transition-colors ${isTogglingFavorite ? 'opacity-50' : ''} ${
                  isFavorite ? 'text-pink-500 hover:text-pink-400' : 'text-gray-400 hover:text-white'
                }`}
                title={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
              >
                <FiHeart className="w-5 h-5" />
              </button>
            </div>

            {/* CONTROLS SECTION */}
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleShuffle}
                className={`text-gray-400 hover:text-white transition-colors p-2 ${isShuffling ? 'text-purple-400' : ''}`}
                title="Shuffle"
              >
                <FiShuffle className="w-5 h-5" />
              </button>
              
              <button 
                onClick={prevTrack}
                className="text-gray-400 hover:text-white transition-colors p-2"
                title="Previous"
              >
                <FiSkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="bg-emerald-950 w-12 h-12 rounded-full flex items-center justify-center hover:bg-emerald-700 transition-colors hover:scale-105"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <FiPause className="w-6 h-6 text-white" />
                ) : (
                  <FiPlay className="w-6 h-6 text-white ml-1" />
                )}
              </button>
              
              <button 
                onClick={nextTrack}
                className="text-gray-400 hover:text-white transition-colors p-2"
                title="Next"
              >
                <FiSkipForward className="w-5 h-5" />
              </button>
              
              <button 
                onClick={toggleLoop}
                className={`text-gray-400 hover:text-white transition-colors p-2 ${isLooping ? 'text-purple-400' : ''}`}
                title="Repeat"
              >
                <FiRepeat className="w-5 h-5" />
              </button>
            </div>

            {/* PROGRESS + VOLUME SECTION */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className="text-xs text-gray-400 hidden md:block">
                {formatTime(currentTime)}
              </span>

              <div 
                onClick={handleSeek}
                className="w-32 md:w-40 h-1.5 bg-gray-600 rounded-full cursor-pointer"
              >
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-xs text-gray-400 hidden md:block">
                {formatTime(duration)}
              </span>

              <div className="flex items-center gap-2">
                {volume === 0 ? (
                  <FiVolumeX className="w-4 h-4 text-gray-400" />
                ) : (
                  <FiVolume2 className="w-4 h-4 text-gray-400" />
                )}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(+e.target.value)}
                  className="w-20 accent-purple-500"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerUI;