// src/components/Coins/CoinDisplay.jsx
import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import CoinIcon from '../../assets/icons/CoinIcon';

const CoinDisplay = () => {
  const { user, userCoins } = useAuthStore();

  if (!user) return null;

  return (
    <div className="flex items-center space-x-3">
      {/* نمایش سکه‌ها */}
      <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2 flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
        <CoinIcon className="w-5 h-5" />
        <span className="text-amber-300 font-bold text-sm">{userCoins} coins</span>
      </div>
    </div>
  );
};

export default CoinDisplay;