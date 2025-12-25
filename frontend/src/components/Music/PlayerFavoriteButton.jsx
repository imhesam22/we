// src/components/Music/PlayerFavoriteButton.jsx
import React, { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore';
import { useMusicStore } from '../../stores/musicStore';
import API from '../../services/api';

const PlayerFavoriteButton = ({ musicId, musicTitle, size = 'md' }) => {
  const { user } = useAuthStore();
  const { favorites, fetchFavorites } = useMusicStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  useEffect(() => {
    if (musicId && favorites) {
      const favorite = favorites.some(f => f._id === musicId);
      setIsFavorite(favorite);
    }
  }, [musicId, favorites]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('برای افزودن به علاقه‌مندی‌ها باید وارد حساب شوید');
      return;
    }

    if (!musicId) return;

    setIsLoading(true);
    try {
      const response = await API.post(`/music/favorite/${musicId}`);
      
      if (response.data.success) {
        setIsFavorite(!isFavorite);
        // refresh favorites
        fetchFavorites();
      }
    } catch (error) {
      console.error('❌ Toggle favorite error:', error);
      alert('خطا در بروزرسانی علاقه‌مندی‌ها');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className={`${sizes[size]} rounded-full flex items-center justify-center transition-all duration-300 ${
        isLoading
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:scale-105 active:scale-95'
      } ${
        isFavorite
          ? 'bg-pink-600 text-white'
          : 'bg-black/40 text-gray-300 hover:text-white'
      }`}
      title={isFavorite ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
    >
      <FiHeart
        className={`
          ${isFavorite ? 'scale-110' : 'scale-100'}
          transition-transform duration-300
        `}
      />
    </button>
  );
};

export default PlayerFavoriteButton;