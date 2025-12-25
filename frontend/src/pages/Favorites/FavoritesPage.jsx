// src/pages/Favorites/FavoritesPage.jsx - نسخه کامل اصلاح شده
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMusicStore } from '../../stores/musicStore';
import { useAuthStore } from '../../stores/authStore';
import MusicGrid from '../../components/Music/MusicGrid';
import { FiHeart, FiMusic } from 'react-icons/fi';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const { 
    favorites, 
    fetchFavorites, 
    playMusic,
    isLoading 
  } = useMusicStore();
  
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // اگر کاربر لاگین نیست، به صفحه لاگین هدایت کن
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchFavorites();
  }, [isAuthenticated, navigate, fetchFavorites]);

  // اگر کاربر لاگین نیست یا در حال لاگین است
  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-b-2 border-purple-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // اگر هیچ موزیکی در علاقه‌مندی‌ها نیست
  if (!favorites || favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24">
        <div className="container mx-auto px-6">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="w-12 h-12 text-pink-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">Your Favorites</h1>
            <p className="text-gray-400 text-lg mb-8">
              You haven't added any tracks to your favorites yet
            </p>
            
            <button
              onClick={() => navigate('/browse')}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Browse Music
            </button>
          </div>
        </div>
      </div>
    );
  }

  // نمایش موزیک‌های مورد علاقه
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-12">
      <div className="container mx-auto px-6">
        
        {/* هدر صفحه */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-4 rounded-2xl mb-6">
            <FiHeart className="w-12 h-12 text-pink-400" />
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-3">
            Your Favorite Tracks
          </h1>
          <p className="text-gray-400 text-lg">
            {favorites.length} {favorites.length === 1 ? 'track' : 'tracks'} in your collection
          </p>
        </div>

        {/* گرید موزیک‌ها */}
        <div className="mb-8">
          <MusicGrid
            musicList={favorites}
            onPlay={(music) => playMusic(music, favorites)}
            variant="default"
          />
        </div>

        {/* دکمه‌های اقدام */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => navigate('/browse')}
            className="bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center"
          >
            <FiMusic className="w-4 h-4 mr-2" />
            Browse More Music
          </button>
        </div>

      </div>
    </div>
  );
};

export default FavoritesPage;