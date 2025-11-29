// src/pages/CoinHistory/CoinHistoryPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import API from '../../services/api';

const CoinHistoryPage = () => {
  const { user } = useAuthStore();
  const [coinHistory, setCoinHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoinHistory = async () => {
      try {
        const response = await API.get('/music/coin-history');
        setCoinHistory(response.data.data);
      } catch (error) {
        console.error('Failed to fetch coin history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoinHistory();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-12">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Coin History</h1>
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-900 font-bold text-2xl px-8 py-4 rounded-full inline-block">
            Total: {coinHistory?.totalCoins || 0} Coins
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Earning History</h2>
            
            {coinHistory?.earnedHistory.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No coins earned yet. Start listening to music!</p>
            ) : (
              <div className="space-y-4">
                {coinHistory?.earnedHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white/5 rounded-xl p-4">
                    <div>
                      <p className="text-white font-semibold">{item.musicTitle}</p>
                      <p className="text-gray-400 text-sm">
                        {new Date(item.timestamp).toLocaleDateString()} • +{item.amount} coin
                      </p>
                    </div>
                    <div className="text-amber-400 font-bold">+1</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CoinHistoryPage;