// src/pages/CoinHistory/CoinHistoryPage.jsx - نسخه جدید
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import API from '../../services/api';
import { FiDollarSign, FiMusic, FiClock, FiTrendingUp } from 'react-icons/fi';

const CoinHistoryPage = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoinHistory = async () => {
      try {
        const response = await API.get('/music/user-stats');
        setHistory(response.data.data);
      } catch (error) {
        console.error('Failed to fetch coin history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-amber-500 rounded-full"></div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-12">
      <div className="container mx-auto px-4">
        
        {/* هدر صفحه */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-br from-amber-500/20 to-yellow-500/20 p-6 rounded-2xl mb-6">
            <FiDollarSign className="w-16 h-16 text-amber-400" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Coin History
          </h1>
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-900 font-bold text-2xl px-8 py-4 rounded-full inline-block">
            Total: {user?.coins || 0} Coins
          </div>
        </div>

        {/* کارت‌های آمار */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Total Earned</h3>
              <FiDollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400">
              {history?.stats?.totalEarned || 0}
            </p>
            <p className="text-gray-400 text-sm mt-2">Coins earned from music</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Tracks Listened</h3>
              <FiMusic className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {history?.stats?.totalListened || 0}
            </p>
            <p className="text-gray-400 text-sm mt-2">Unique tracks played</p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Earning Rate</h3>
              <FiTrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {history?.stats?.totalListened > 0 
                ? `${((history.stats.totalEarned / history.stats.totalListened) * 100).toFixed(1)}%`
                : '0%'
              }
            </p>
            <p className="text-gray-400 text-sm mt-2">Of tracks converted to coins</p>
          </div>
        </div>

        {/* تاریخچه */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <FiClock className="w-6 h-6 mr-3 text-amber-400" />
            Recent Earnings
          </h2>
          
          {history?.earnedHistory?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMusic className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No coins earned yet</h3>
              <p className="text-gray-400 mb-6">Start listening to music to earn coins!</p>
              <button
                onClick={() => window.location.href = '/browse'}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-2xl transition-all duration-300"
              >
                Browse Music
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {history?.earnedHistory?.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-lg flex items-center justify-center">
                      <FiMusic className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <p className="text-gray-400 text-sm">
                        {formatDate(item.earnedAt)} • +{item.amount} coin
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-amber-400 font-bold text-lg">+1</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CoinHistoryPage;