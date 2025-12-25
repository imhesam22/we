// src/components/Music/ResponsiveMusicCard.jsx
import React from 'react';
import { FiHeadphones, FiEye, FiCheck, FiPlay, FiMusic } from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore';

const ResponsiveMusicCard = ({ music, onPlay, variant = "default", playlist = null }) => {
  const { isAuthenticated, user } = useAuthStore();

  const handlePlay = () => {
    console.log('🎵 Playing music:', music.title);
    if (onPlay) {
      onPlay(music, playlist);
    }
  };

  // فرمت کردن اعداد
  const formatCount = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  };

  // واریانت‌های مختلف
  const variants = {
    default: {
      container: "bg-gradient-to-br from-black to-slate-900/80 backdrop-blur-xl rounded-2xl p-4 border border-slate-700/50 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.02] group shadow-2xl hover:shadow-purple-500/10",
      image: "w-full aspect-square rounded-xl overflow-hidden",
      info: "space-y-3 mt-4",
      title: "text-white font-bold text-lg truncate",
      artist: "text-gray-300 text-sm truncate",
      stats: "flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-slate-700/50"
    },
    compact: {
      container: "bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group hover:bg-white/10",
      image: "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0",
      info: "flex-1 min-w-0 ml-3",
      title: "text-white font-semibold text-sm truncate",
      artist: "text-gray-400 text-xs truncate mt-1",
      stats: "hidden"
    },
    mobile: {
      container: "bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10 hover:border-purple-500/20 transition-all duration-300 active:scale-95",
      image: "w-14 h-14 rounded-lg overflow-hidden flex-shrink-0",
      info: "flex-1 min-w-0 ml-3",
      title: "text-white font-medium text-sm truncate",
      artist: "text-gray-400 text-xs truncate mt-0.5",
      stats: "hidden"
    },
    grid: {
      container: "bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-xl p-3 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300 group hover:scale-105",
      image: "w-full aspect-square rounded-lg overflow-hidden",
      info: "space-y-2 mt-3",
      title: "text-white font-semibold text-sm truncate",
      artist: "text-gray-400 text-xs truncate",
      stats: "flex items-center justify-between text-xs text-gray-500 mt-2"
    }
  };

  const style = variants[variant] || variants.default;

  return (
    <div className={style.container}>
      <div className="relative">
        {/* تصویر موزیک */}
        <div className={style.image}>
          <img 
            src={music.coverImage} 
            alt={music.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          
          {/* فال‌بک وقتی تصویر load نمیشه */}
          <div 
            className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20"
          >
            <FiMusic className="w-6 h-6 text-white/60" />
          </div>

          {/* دکمه پلی */}
          <button
            onClick={handlePlay}
            className={`absolute ${
              variant === 'compact' || variant === 'mobile' 
                ? 'bottom-1 right-1 w-8 h-8' 
                : 'bottom-2 right-2 w-10 h-10'
            } bg-gradient-to-br from-black to-blue-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 shadow-lg`}
          >
            <FiPlay className="text-white" style={{ 
              width: variant === 'compact' || variant === 'mobile' ? '14px' : '16px',
              height: variant === 'compact' || variant === 'mobile' ? '14px' : '16px',
              marginLeft: '2px'
            }} />
          </button>

          {/* وضعیت کاربر */}
          {isAuthenticated && music.userStatus && (
            <div className={`absolute top-2 left-2 flex space-x-1 ${
              variant === 'compact' || variant === 'mobile' ? 'scale-75 origin-top-left' : ''
            }`}>
              {music.userStatus.hasViewed && (
                <div className="bg-blue-500/90 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center space-x-1 backdrop-blur-sm">
                  <FiEye className="w-2.5 h-2.5" />
                </div>
              )}
              {music.userStatus.hasListened && (
                <div className="bg-green-500/90 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center space-x-1 backdrop-blur-sm">
                  <FiCheck className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* اطلاعات موزیک */}
      <div className={style.info}>
        <div>
          <h3 className={style.title}>{music.title}</h3>
          <p className={style.artist}>{music.artist}</p>
        </div>
        
        {/* ژانر و مدت زمان */}
        <div className="flex justify-between items-center">
          <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
            {music.genre}
          </span>
          <span className="text-gray-400 text-xs font-medium">
            {music.duration}
          </span>
        </div>
        
        {/* آمار */}
        <div className={style.stats}>
          <div className="flex items-center space-x-3">
            {/* تعداد ویو */}
            <div className="flex items-center space-x-1" title={`${music.viewCount || 0} views`}>
              <FiEye className="w-3 h-3 text-blue-400" />
              <span className="font-medium text-xs">{formatCount(music.viewCount || 0)}</span>
            </div>
            
            {/* تعداد پلی */}
            <div className="flex items-center space-x-1" title={`${music.playCount || 0} plays`}>
              <FiHeadphones className="w-3 h-3 text-green-400" />
              <span className="font-medium text-xs">{formatCount(music.playCount || 0)}</span>
            </div>
          </div>

          {/* نشانگر سکه */}
          {isAuthenticated && (
            <div className="flex items-center space-x-1 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-amber-300 text-xs font-bold">1</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveMusicCard;