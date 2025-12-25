// src/pages/Music/MusicPlayerPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMusicStore } from '../../stores/musicStore';
import { useAuthStore } from '../../stores/authStore';
import { useCoinStore } from '../../stores/coinStore';
import { FiPlay, FiPause, FiSkipBack, FiSkipForward, FiHeart, FiShare2, FiHeadphones, FiClock } from 'react-icons/fi';

const MusicPlayerPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentMusic, 
    isPlaying, 
    currentTime, 
    duration,
    playMusic, 
    pauseMusic,
    featuredMusic,
    fetchMusic
  } = useMusicStore();
  
  const { user, isAuthenticated } = useAuthStore();
  const { earnCoin } = useCoinStore();
  const [hasEarnedCoin, setHasEarnedCoin] = useState(false);

  useEffect(() => {
    if (!featuredMusic.length) {
      fetchMusic();
    }
  }, [featuredMusic.length, fetchMusic]);

  useEffect(() => {
    if (currentMusic && isAuthenticated && !hasEarnedCoin) {
      // کسب سکه وقتی موزیک برای اولین بار پخش میشه
      const timer = setTimeout(async () => {
        try {
          await earnCoin(currentMusic._id, currentMusic.title);
          setHasEarnedCoin(true);
          console.log('🎉 Coin earned for:', currentMusic.title);
        } catch (error) {
          console.log('💰 Already earned coin for this track');
        }
      }, 10000); // بعد از 10 ثانیه سکه می‌ده

      return () => clearTimeout(timer);
    }
  }, [currentMusic, isAuthenticated, hasEarnedCoin, earnCoin]);

  if (!currentMusic) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiHeadphones className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Music Playing</h2>
          <p className="text-gray-400 mb-6">Select a track to start listening</p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Browse Music
          </button>
        </div>
      </div>
    );
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        
        {/* اطلاعات موزیک */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* سمت چپ: تصویر و اطلاعات اصلی */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-6">
                <img 
                  src={currentMusic.coverImage} 
                  alt={currentMusic.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{currentMusic.title}</h1>
                  <p className="text-xl text-gray-300">{currentMusic.artist}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                    {currentMusic.genre}
                  </span>
                  <span>{currentMusic.duration}</span>
                </div>
                
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-700">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <FiHeart className="w-5 h-5" />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <FiShare2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* سمت راست: لیست پخش */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FiHeadphones className="w-5 h-5 mr-2" />
                Up Next
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {featuredMusic.map((music, index) => (
                  <div
                    key={music._id}
                    className={`flex items-center space-x-4 p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                      currentMusic._id === music._id
                        ? 'bg-purple-600/20 border border-purple-500/30'
                        : 'hover:bg-white/10'
                    }`}
                    onClick={() => playMusic(music)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={music.coverImage} 
                        alt={music.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate">
                        {music.title}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">{music.artist}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <FiHeadphones className="w-3 h-3" />
                        <span>{music.playCount || 0}</span>
                      </span>
                      <span>{music.duration}</span>
                    </div>
                    
                    {currentMusic._id === music._id && isPlaying && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* کنترل‌های پخش */}
        <div className="bg-white/5 rounded-2xl p-6 backdrop-blur-sm border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-white transition-colors p-2">
                <FiSkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={isPlaying ? pauseMusic : () => playMusic(currentMusic)}
                className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:scale-105 transition-all duration-200 shadow-lg"
              >
                {isPlaying ? (
                  <FiPause className="w-6 h-6 text-white" />
                ) : (
                  <FiPlay className="w-6 h-6 text-white ml-1" />
                )}
              </button>
              
              <button className="text-gray-400 hover:text-white transition-colors p-2">
                <FiSkipForward className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{Math.floor(currentTime / 60)}:{(currentTime % 60).toFixed(0).padStart(2, '0')}</span>
              <span>/</span>
              <span>{Math.floor(duration / 60)}:{(duration % 60).toFixed(0).padStart(2, '0')}</span>
            </div>
          </div>
          
          {/* نوار پیشرفت */}
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          
          {/* وضعیت کسب سکه */}
          {isAuthenticated && (
            <div className="flex items-center justify-center mt-4">
              <div className="bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                <span className="text-amber-300 text-sm font-medium">
                  {hasEarnedCoin ? 'Coin earned! +1' : 'Listening... coin pending'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerPage;