// src/components/Admin/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, getCurrentUser } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // چک کردن کاربر هنگام mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // اگر کاربر لاگین نیست
        if (!isAuthenticated || !user) {
          const token = localStorage.getItem('we_token');
          if (token) {
            // سعی کن کاربر رو بگیر
            await getCurrentUser();
          }
        }
      } catch (error) {
        console.log('Auth check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAccess();
  }, [isAuthenticated, user, getCurrentUser]);

  // 🔥 درست کردن چک ادمین
  const isUserAdmin = user?.isAdmin === true;

  // نمایش loading هنگام چک کردن
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Checking admin access...</div>
      </div>
    );
  }

  // چک کردن آیا کاربر ادمین هست - 🔥 درست شده
  if (!isUserAdmin) {
    console.log('❌ Admin access denied - User:', {
      username: user?.username,
      isAdmin: user?.isAdmin,
      isAuthenticated: isAuthenticated
    });
    
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-2">Admin access required</p>
          <p className="text-gray-500 text-sm mb-6">
            User: {user?.username} | Admin: {user?.isAdmin ? 'Yes' : 'No'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // منوی ادمین
  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/music', label: 'Music', icon: '🎵' },
    { path: '/admin/stats', label: 'Statistics', icon: '📈' },
  ];

  console.log('✅ Admin access granted for:', user.username);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">WE Admin</h1>
          <p className="text-gray-400 text-sm">Management Panel</p>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              navigate('/');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        {/* Top Bar */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">Welcome, {user.username}</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/30">
                  Admin
                </span>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;