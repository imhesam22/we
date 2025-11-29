// src/components/Music/MusicCard.jsx - نسخه کامل آپدیت شده
import React, { useState, useEffect } from 'react';
import { FiHeadphones, FiEye, FiCheck, FiPlay } from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore';

const MusicCard = ({ music, onPlay, playlist = null }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [userStatus, setUserStatus] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (music.userStatus) {
      setUserStatus(music.userStatus);
    }
  }, [music]);

  const handlePlay = () => {
    console.log('🎵 Playing music from card:', music.title);
    console.log('🎵 Playlist available:', playlist ? playlist.length : 'none');
    
    if (onPlay) {
      onPlay(music, playlist);
    } else {
      console.error('❌ onPlay function not provided');
    }
  };

  const formatCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count;
  };

  return (
    <div 
      className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-purple-500/40 transition-all duration-500 hover:scale-[1.02] group shadow-2xl hover:shadow-purple-500/10 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* User Status Badges */}
      {isAuthenticated && userStatus && (
        <div className="absolute top-3 left-3 z-10 flex space-x-1">
          {userStatus.hasViewed && (
            <div className="bg-blue-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 backdrop-blur-sm">
              <FiEye className="w-3 h-3" />
              <span className="text-xs">Viewed</span>
            </div>
          )}
          {userStatus.hasListened && (
            <div className="bg-green-500/90 text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 backdrop-blur-sm">
              <FiCheck className="w-3 h-3" />
              <span className="text-xs">Listened</span>
            </div>
          )}
        </div>
      )}

      {/* Music Image */}
      <div className="relative mb-5">
        <div className="w-full aspect-square rounded-xl overflow-hidden relative shadow-lg">
          <img 
            src={music.coverImage} 
            alt={music.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          
          {/* Fallback */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hidden items-center justify-center group-hover:from-purple-500/30 group-hover:to-pink-500/30"
            style={{ display: music.coverImage ? 'none' : 'flex' }}
          >
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center">
              <FiHeadphones className="w-8 h-8 text-white/80 group-hover:text-white transition-colors duration-300 mx-auto mb-2" />
              <p className="text-white/60 text-xs">No Image</p>
            </div>
          </div>

          {/* Play Button */}
          <button
            onClick={handlePlay}
            className="absolute bottom-3 right-3 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500 hover:scale-110 hover:from-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 z-20"
          >
            <FiPlay className="w-5 h-5 text-white ml-0.5" />
          </button>

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      {/* Music Info */}
      <div className="space-y-3 relative z-10">
        <div>
          <h3 className="text-white font-bold text-lg truncate tracking-tight mb-1">
            {music.title}
          </h3>
          <p className="text-gray-300 font-medium text-sm truncate">
            {music.artist}
          </p>
        </div>
        
        {/* Genre Badge */}
        <div className="flex justify-between items-center">
          <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full border border-purple-500/30">
            {music.genre}
          </span>
          <span className="text-gray-400 text-sm font-semibold">
            {music.duration}
          </span>
        </div>
        
        {/* Music Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400 pt-3 border-t border-slate-700/50">
          <div className="flex items-center space-x-3">
            {/* View Count */}
            <div className="flex items-center space-x-1" title={`${music.viewCount || 0} views`}>
              <FiEye className="w-3 h-3 text-blue-400" />
              <span className="font-medium text-xs">{formatCount(music.viewCount || 0)}</span>
            </div>
            
            {/* Play Count */}
            <div className="flex items-center space-x-1" title={`${music.playCount || 0} plays`}>
              <FiHeadphones className="w-3 h-3 text-green-400" />
              <span className="font-medium text-xs">{formatCount(music.playCount || 0)}</span>
            </div>
          </div>

          {/* Coin Indicator */}
          {isAuthenticated && (
            <div className="flex items-center space-x-1 bg-amber-500/20 px-2 py-1 rounded-full border border-amber-500/30">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-amber-300 text-xs font-bold">1</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/20 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
};

export default MusicCard;