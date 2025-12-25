// src/components/Admin/AdminLayout.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, getCurrentUser } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!isAuthenticated || !user) {
          const token = localStorage.getItem('we_token');
          if (token) await getCurrentUser();
        }
      } catch (e) {
        console.log('Auth check failed:', e);
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, [isAuthenticated, user, getCurrentUser]);

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      Checking admin access...
    </div>
  );

  if (!user?.isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p className="text-gray-400 mb-6">Admin access required</p>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
      >
        Go Home
      </button>
    </div>
  );

  const menuItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/music', label: 'Music' },
    { path: '/admin/stats', label: 'Statistics' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">WE Admin</h1>
          <p className="text-gray-400 text-sm">Management Panel</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4">
          <button
            onClick={() => { useAuthStore.getState().logout(); navigate('/'); }}
            className="w-full text-gray-300 hover:bg-gray-700 px-4 py-3 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
};

export default AdminLayout;
