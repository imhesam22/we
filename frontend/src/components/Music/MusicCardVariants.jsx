import React from 'react';
import { FiHeadphones, FiPlay, FiHeart } from 'react-icons/fi';
import { useMusicStore } from '../../stores/musicStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

// Helper component برای دکمه قلب
const FavoriteButton = ({ musicId, isFavorite, onClick }) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.stopPropagation();
    
    if (!user) {
      alert('برای افزودن به علاقه‌مندی‌ها باید وارد حساب شوید');
      navigate('/login');
      return;
    }
    
    onClick(musicId);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        transition-all duration-300 active:scale-90
        ${isFavorite
          ? 'bg-pink-600 text-white scale-110'
          : 'bg-black/40 text-gray-300 hover:text-white hover:scale-105'}
      `}
      title={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
    >
      <FiHeart
        className={`
          transition-transform duration-300
          ${isFavorite ? 'scale-110' : 'scale-100'}
        `}
      />
    </button>
  );
};

// Helper component برای دکمه پلی
const PlayButton = ({ onClick, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <button
      onClick={onClick}
      className={`
        bg-purple-600 rounded-full flex items-center justify-center 
        hover:bg-purple-700 transition-all duration-300
        hover:scale-105 opacity-0 group-hover:opacity-100
        ${sizes[size]} ${className}
      `}
      title="پخش موزیک"
    >
      <FiPlay className="text-white ml-0.5" />
    </button>
  );
};

// Helper برای نمایش تصویر
const MusicImage = ({ src, alt, className = '' }) => (
  <div className={`overflow-hidden ${className}`}>
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.parentElement.innerHTML = `
          <div class="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <FiMusic class="w-6 h-6 text-white/60" />
          </div>
        `;
      }}
    />
  </div>
);

/* =======================
   کارت کوچک (Sidebar)
======================= */
export const SmallMusicCard = ({ music, onPlay }) => {
  const { favorites, toggleFavorite } = useMusicStore();
  const isFavorite = favorites?.some(f => f._id === music._id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(music);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-3 hover:bg-white/10 transition-all duration-300 group">
      <div className="flex items-center space-x-3">
        {/* تصویر موزیک */}
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <MusicImage src={music.coverImage} alt={music.title} />
        </div>

        {/* اطلاعات موزیک */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white text-sm font-medium truncate">{music.title}</h4>
          <p className="text-gray-400 text-xs truncate">{music.artist}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-gray-500 text-xs flex items-center">
              <FiHeadphones className="w-3 h-3 mr-1" />
              {music.playCount || 0}
            </span>
            <span className="text-gray-500 text-xs">{music.duration}</span>
          </div>
        </div>

        {/* دکمه‌ها */}
        <div className="flex items-center space-x-1">
          <FavoriteButton
            musicId={music._id}
            isFavorite={isFavorite}
            onClick={toggleFavorite}
            className="p-1.5 rounded-lg"
          />
          <PlayButton
            onClick={handlePlay}
            size="sm"
            className="p-1.5"
          />
        </div>
      </div>
    </div>
  );
};

/* =======================
   کارت متوسط
======================= */
export const MediumMusicCard = ({ music, onPlay }) => {
  const { favorites, toggleFavorite } = useMusicStore();
  const isFavorite = favorites?.some(f => f._id === music._id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(music);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 group">
      
      {/* دکمه قلب در بالا */}
      <div className="absolute top-3 right-3 z-10">
        <FavoriteButton
          musicId={music._id}
          isFavorite={isFavorite}
          onClick={toggleFavorite}
          className="w-8 h-8 rounded-full"
        />
      </div>

      <div className="flex items-center space-x-4">
        {/* تصویر موزیک */}
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <MusicImage src={music.coverImage} alt={music.title} />
        </div>

        {/* اطلاعات موزیک */}
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-base truncate">{music.title}</h4>
          <p className="text-gray-400 text-sm truncate">{music.artist}</p>
          
          {/* اطلاعات اضافی */}
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <FiHeadphones className="w-3 h-3" />
              <span>{music.playCount || 0}</span>
            </div>
            <span className="text-xs text-gray-500">{music.duration}</span>
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
              {music.genre}
            </span>
          </div>
        </div>

        {/* دکمه پلی */}
        <div className="flex-shrink-0">
          <PlayButton onClick={handlePlay} size="md" />
        </div>
      </div>
    </div>
  );
};

/* =======================
   کارت بزرگ
======================= */
export const LargeMusicCard = ({ music, onPlay }) => {
  const { favorites, toggleFavorite } = useMusicStore();
  const isFavorite = favorites?.some(f => f._id === music._id);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(music);
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-2xl p-5 border border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 group">
      
      {/* دکمه قلب */}
      <div className="absolute top-4 right-4 z-10">
        <FavoriteButton
          musicId={music._id}
          isFavorite={isFavorite}
          onClick={toggleFavorite}
          className="w-10 h-10 rounded-full"
        />
      </div>

      {/* بخش تصویر */}
      <div className="relative mb-4">
        <div className="w-full aspect-square rounded-xl overflow-hidden">
          <MusicImage src={music.coverImage} alt={music.title} />
        </div>

        {/* دکمه پلی روی تصویر */}
        <div className="absolute bottom-3 right-3">
          <PlayButton onClick={handlePlay} size="lg" />
        </div>
      </div>

      {/* اطلاعات موزیک */}
      <div className="space-y-2">
        <div>
          <h3 className="text-white font-bold text-lg truncate">{music.title}</h3>
          <p className="text-gray-300 text-sm truncate">{music.artist}</p>
        </div>
        
        {/* اطلاعات اضافی */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <FiHeadphones className="w-3 h-3" />
              <span>{music.playCount || 0}</span>
            </div>
            <span className="text-xs text-gray-400">{music.duration}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-1 rounded-full">
              {music.genre}
            </span>
            <div className="flex items-center space-x-1 bg-amber-500/20 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
              <span className="text-amber-300 text-xs font-medium">+1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component اصلی برای export
const MusicCard = ({ music, variant = 'medium', onPlay }) => {
  switch (variant) {
    case 'small':
      return <SmallMusicCard music={music} onPlay={onPlay} />;
    case 'large':
      return <LargeMusicCard music={music} onPlay={onPlay} />;
    case 'medium':
    default:
      return <MediumMusicCard music={music} onPlay={onPlay} />;
  }
};

export default MusicCard;

// همچنین یک HOC برای مدیریت Auth اضافه می‌کنیم
export const withAuthCheck = (WrappedComponent) => {
  return function WithAuthCheckComponent(props) {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    
    const handleAuthRequiredAction = (action) => {
      if (!user) {
        alert('برای انجام این عمل باید وارد حساب شوید');
        navigate('/login');
        return false;
      }
      return true;
    };
    
    return (
      <WrappedComponent
        {...props}
        checkAuth={handleAuthRequiredAction}
      />
    );
  };
};

// اکسپورت همه چیز
export { SmallMusicCard, MediumMusicCard, LargeMusicCard };