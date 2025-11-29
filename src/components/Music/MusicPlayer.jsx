// src/components/Music/MusicPlayer.jsx - نسخه دیباگ
import React from 'react';
import { useMusicStore } from '../../stores/musicStore';
import { usePlayerStore } from '../../stores/playerStore';
import { 
  FiPlay, FiPause, FiSkipBack, FiSkipForward, 
  FiVolume2, FiVolumeX, FiRepeat, FiShuffle 
} from 'react-icons/fi';

const MusicPlayer = () => {
  const { 
    currentMusic, 
    isPlaying, 
    currentTime, 
    duration,
    playMusic, 
    pauseMusic, 
    seekMusic,
    nextTrack,
    prevTrack,
    formatTime,
    setVolume
  } = useMusicStore();

  const {
    playerTheme,
    playerThemes,
    isLooping,
    isShuffling,
    volume,
    setPlayerTheme,
    toggleLoop,
    toggleShuffle,
  } = usePlayerStore();

  const theme = playerThemes[playerTheme];

  // 🔥 لاگ برای دیباگ
  console.log('🎵 MusicPlayer State:', {
    currentMusic: currentMusic?.title,
    isPlaying,
    currentTime,
    duration
  });

  if (!currentMusic) {
    console.log('🎵 No current music - hiding player');
    return null;
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    seekMusic(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-6 z-50">
      <div className={`bg-gradient-to-r ${theme.bg} backdrop-blur-2xl rounded-2xl border ${theme.border} shadow-2xl p-4`}>
        
        {/* اطلاعات موزیک و کنترل‌ها */}
        <div className="flex items-center justify-between">
          
          {/* اطلاعات موزیک */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex-shrink-0 overflow-hidden">
              {currentMusic.coverImage ? (
                <img 
                  src={currentMusic.coverImage} 
                  alt={currentMusic.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-purple-500/30">
                  <FiMusic className="w-6 h-6 text-white/70" />
                </div>
              )}
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className={`${theme.text} font-bold text-sm truncate`}>
                {currentMusic.title}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {currentMusic.artist}
              </p>
              <p className="text-gray-500 text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </p>
            </div>
          </div>

          {/* کنترل‌های اصلی پخش */}
          <div className="flex items-center space-x-4 mx-6">
            {/* دکمه shuffle */}
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isShuffling 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={isShuffling ? "Shuffle: On" : "Shuffle: Off"}
            >
              <FiShuffle className="w-4 h-4" />
            </button>

            {/* دکمه قبلی */}
            <button 
              onClick={prevTrack}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
            >
              <FiSkipBack className="w-5 h-5" />
            </button>

            {/* دکمه پخش/توقف اصلی */}
            <button
              onClick={isPlaying ? pauseMusic : () => playMusic(currentMusic)}
              className={`w-12 h-12 bg-gradient-to-br ${theme.button} rounded-full flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
            >
              {isPlaying ? (
                <FiPause className="w-5 h-5 text-white" />
              ) : (
                <FiPlay className="w-5 h-5 text-white" />
              )}
            </button>

            {/* دکمه بعدی */}
            <button 
              onClick={nextTrack}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-2 hover:bg-white/10 rounded-lg"
            >
              <FiSkipForward className="w-5 h-5" />
            </button>

            {/* دکمه تکرار */}
            <button
              onClick={toggleLoop}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isLooping 
                  ? 'bg-white/20 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title={isLooping ? "Loop: On" : "Loop: Off"}
            >
              <FiRepeat className="w-4 h-4" />
            </button>
          </div>

          {/* کنترل‌های سمت راست */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            {/* زمان */}
            <span className="text-gray-400 text-sm font-medium min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            
            {/* نوار پیشرفت */}
            <div 
              className="flex-1 max-w-md cursor-pointer group"
              onClick={handleSeek}
            >
              <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${theme.progress} transition-all duration-100 relative group-hover:brightness-110`}
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"></div>
                </div>
              </div>
            </div>
            
            <span className="text-gray-400 text-sm font-medium min-w-[40px]">
              {formatTime(duration)}
            </span>

            {/* کنترل صدا */}
            <div className="flex items-center space-x-2 w-24">
              <button className="text-gray-400 hover:text-white transition-colors">
                {volume === 0 ? <FiVolumeX className="w-4 h-4" /> : <FiVolume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;