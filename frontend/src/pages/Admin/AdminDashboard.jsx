// src/pages/Admin/AdminDashboard.jsx
import React, { useEffect } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import AdminLayout from './AdminLayout';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { stats, fetchStats, loading, error } = useAdminStore();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const StatCard = ({ title, value, color, to }) => (
    <Link
      to={to || '#'}
      className={`flex flex-col justify-between p-6 rounded-2xl border-l-4 transition-colors ${
        color
      } hover:bg-gray-700 bg-gray-800`}
    >
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold text-white mt-2">{value ?? 0}</p>
    </Link>
  );

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64 text-white">Loading dashboard...</div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {error && <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl text-red-400 text-center">{error}</div>}

        <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage your platform efficiently</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats?.users?.total} color="border-blue-500" to="/admin/users"/>
          <StatCard title="Verified Users" value={stats?.users?.verified} color="border-green-500"/>
          <StatCard title="Total Music" value={stats?.music?.total} color="border-purple-500" to="/admin/music"/>
          <StatCard title="Total Coins" value={stats?.coins?.total} color="border-amber-500"/>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
