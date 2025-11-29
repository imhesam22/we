// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../../stores/adminStore';
import AdminLayout from './AdminLayout';

const AdminDashboard = () => {
  const { stats, fetchStats, loading, error } = useAdminStore();

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const StatCard = ({ title, value, icon, color, to }) => (
    <Link 
      to={to} 
      className={`bg-gray-800 rounded-2xl p-6 hover:bg-gray-700 transition-colors border-l-4 ${color} ${to ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-2">{value || 0}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </Link>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading dashboard...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-8 border border-purple-500/30">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Welcome to WE Music Admin Panel. Manage your platform with ease.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats?.users?.total}
            icon="👥"
            color="border-blue-500"
            to="/admin/users"
          />
          <StatCard
            title="Verified Users"
            value={stats?.users?.verified}
            icon="✅"
            color="border-green-500"
          />
          <StatCard
            title="Total Music"
            value={stats?.music?.total}
            icon="🎵"
            color="border-purple-500"
            to="/admin/music"
          />
          <StatCard
            title="Total Coins"
            value={stats?.coins?.total}
            icon="💰"
            color="border-amber-500"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Activity</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">New Users Today</span>
                <span className="text-white font-semibold">{stats?.users?.newToday || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Plays</span>
                <span className="text-white font-semibold">{stats?.music?.totalPlays || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/admin/music"
                className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg text-center hover:bg-purple-700 transition-colors"
              >
                Upload New Music
              </Link>
              <Link
                to="/admin/users"
                className="block w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-center hover:bg-gray-600 transition-colors"
              >
                Manage Users
              </Link>
              <Link
                to="/admin/stats"
                className="block w-full bg-gray-700 text-white py-2 px-4 rounded-lg text-center hover:bg-gray-600 transition-colors"
              >
                View Statistics
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;