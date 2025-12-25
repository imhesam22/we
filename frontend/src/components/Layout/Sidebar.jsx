import React, { useState, useEffect } from 'react';
import {
  FiDollarSign,
  FiHome, 
  FiMusic, 
  FiTrendingUp, 
  FiHeart, 
  FiX, 
  FiUser, 
  FiLogOut, 
  FiSettings, 
  FiAward,
  FiHeadphones,
  FiClock,
  FiStar,
  FiCompass,
  FiPlayCircle
} from 'react-icons/fi';
import logo from '../../assets/Logo/Weicon.svg';
import { BsLayoutSidebar } from "react-icons/bs";
import { useMusicStore } from '../../stores/musicStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { featuredMusic, playMusic, fetchMusic } = useMusicStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // وقتی سایدبار باز میشه، موزیک‌ها رو load کن
  useEffect(() => {
    if (isOpen && featuredMusic.length === 0 && isAuthenticated) {
      fetchMusic();
    }
  }, [isOpen, featuredMusic.length, fetchMusic, isAuthenticated]);

  // منوی اصلی
const menuItems = [
  { icon: FiHome, label: 'Home', path: '/', color: 'text-blue-400' },
  { icon: FiCompass, label: 'Browse', path: '/browse', color: 'text-purple-400' },
  { icon: FiDollarSign, label: 'Coins', path: '/coin-history', color: 'text-amber-400' }, // 🔥 جدید
  { icon: FiHeart, label: 'Favorites', path: '/favorites', color: 'text-pink-400' },
];

  // منوی کاربر
  const userMenuItems = [
    { icon: FiAward, label: 'Coin History', path: '/coin-history', color: 'text-amber-400' },
    { icon: FiClock, label: 'Listening History', path: '/history', color: 'text-cyan-400' },
    { icon: FiStar, label: 'Playlists', path: '/playlists', color: 'text-emerald-400' },
    { icon: FiSettings, label: 'Settings', path: '/settings', color: 'text-gray-400' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handlePlayMusic = (music) => {
    if (!isAuthenticated) {
      alert('Please login to play music');
      setIsOpen(false);
      return;
    }
    playMusic(music);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  // برای صفحاتی که سایدبار نباید نمایش داده بشه
  const noSidebarPages = ['/login', '/register', '/verify-email', '/music-player'];
  if (noSidebarPages.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      {/* دکمه باز کردن سایدبار */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-2 left-4 z-40 w-12 h-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-purple-500/30 border border-gray-700"
      >
        <BsLayoutSidebar className="w-6 h-6" />
      </button>

      {/* سایدبار */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-gray-950 border-r border-gray-800 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* هدر سایدبار */}
        <div className="p-6 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
             
                     <img 
                  src={logo} 
               alt="WE" 
                className="h-10"
                                />
              
              <div>
                <h2 className="text-lg font-bold text-white">WE Music</h2>
                <p className="text-gray-500 text-xs">Premium Music Streaming</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* محتوای اصلی سایدبار */}
        <div className="flex-1 overflow-y-auto py-4" style={{ height: 'calc(100vh - 200px)' }}>
          
          {/* منوی ناوبری اصلی */}
          <div className="px-4 mb-6">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
              Navigation
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button 
                  key={item.label}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${
                    location.pathname === item.path
                      ? 'bg-gray-800 border-l-4 border-purple-500'
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="font-medium text-gray-200">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* منوی کاربر */}
          {isAuthenticated && (
            <div className="px-4 mb-6">
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                Account
              </h3>
              <div className="space-y-1">
                {userMenuItems.map((item) => (
                  <button 
                    key={item.label}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-left ${
                      location.pathname === item.path
                        ? 'bg-gray-800 border-l-4 border-purple-500'
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span className="font-medium text-gray-200">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* موزیک‌های اخیر */}
          {isAuthenticated && featuredMusic.length > 0 && (
            <div className="px-4">
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3 px-2">
                Recently Played
              </h3>
              <div className="space-y-2">
                {featuredMusic.slice(0, 5).map(music => (
                  <div
                    key={music._id}
                    className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer group border border-gray-700"
                    onClick={() => handlePlayMusic(music)}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden flex-shrink-0 border border-gray-700">
                      <img 
                        src={music.coverImage} 
                        alt={music.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium text-sm truncate">{music.title}</h4>
                      <p className="text-gray-400 text-xs truncate">{music.artist}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1 hover:bg-gray-700 rounded">
                      <FiPlayCircle className="w-4 h-4 text-purple-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* اطلاعات کاربر در پایین */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900 border-t border-gray-800">
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-gray-700">
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{user.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <p className="text-amber-300 text-xs font-bold">{user.coins || 0} coins</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNavigation('/settings')}
                  className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  title="Settings"
                >
                  <FiSettings className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
                  title="Logout"
                >
                  <FiLogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/login');
                }}
                className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-medium hover:bg-gray-700 transition-all duration-300 border border-gray-700"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/register');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;