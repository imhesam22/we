// src/pages/Admin/AdminStats.jsx
import React, { useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import AdminLayout from './AdminLayout';

const AdminStats = () => {
  const { musicStats, fetchMusicStats, loading, error } = useAdminStore();

  useEffect(() => {
    fetchMusicStats();
  }, [fetchMusicStats]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading statistics...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Music Statistics</h1>
          <p className="text-gray-400">Detailed analytics and insights</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Top Music Section */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Top Tracks</h2>
          <div className="space-y-3">
            {musicStats?.topMusic?.map((music, index) => (
              <div key={music._id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-medium">{music.title}</div>
                    <div className="text-gray-400 text-sm">{music.artist}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-blue-400 font-semibold">{music.playCount}</div>
                    <div className="text-gray-400 text-xs">Plays</div>
                  </div>
                  <div className="text-center">
                    <div className="text-amber-400 font-semibold">{music.totalEarnedCoins}</div>
                    <div className="text-gray-400 text-xs">Coins</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {(!musicStats?.topMusic || musicStats.topMusic.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              No music statistics available yet
            </div>
          )}
        </div>

        {/* Recent Plays Section */}
        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Listens</h2>
          <div className="space-y-3">
            {musicStats?.recentPlays?.map((play, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {play.username?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium">{play.musicTitle || play.title}</div>
                    <div className="text-gray-400 text-sm">
                      by {play.username} • {new Date(play.listenedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  {play.artist}
                </div>
              </div>
            ))}
          </div>
          
          {(!musicStats?.recentPlays || musicStats.recentPlays.length === 0) && (
            <div className="text-center py-8 text-gray-400">
              No recent listening activity
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStats;