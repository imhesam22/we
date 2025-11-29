// src/components/Layout/Header.jsx - نسخه اصلاح شده
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useMusicStore } from '../../stores/musicStore';
import { FiSearch, FiLogOut, FiUser, FiMusic , FiMenu } from 'react-icons/fi';
import logo from '../../assets/Logo/Weicon.svg';

const Header = () => {
  const [headerColor, setHeaderColor] = useState('rgba(255,255,255,0.1)');
  const [searchQuery, setSearchQuery] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const presetColors = [
    'rgba(255,255,255,0.1)',
    'rgba(30, 41, 59, 0.9)',
    'rgba(79, 70, 229, 0.9)',
    'rgba(14, 165, 233, 0.9)',
    'rgba(20, 184, 166, 0.9)',
    'rgba(245, 158, 11, 0.9)',
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // بعداً منطق سرچ رو اضافه می‌کنیم
  };

  const handleLogout = () => {
    console.log('🔄 Logging out...');
    
    try {
      const musicStore = useMusicStore.getState();
      if (musicStore.audioElement) {
        musicStore.pauseMusic();
      }
      
      // 🔥 استفاده درست از logout
      if (logout && typeof logout === 'function') {
        logout();
      } else {
        // fallback
        localStorage.removeItem('we_token');
        useAuthStore.getState().forceLogout();
      }
      
      navigate('/');
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Force logout anyway
      localStorage.removeItem('we_token');
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        userCoins: 0,
        token: null
      });
      navigate('/');
    }
  };

  const handleMusicClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      setShowAuthPopup(true);
    }
  };

  const handleAuthAction = (type) => {
    setShowAuthPopup(false);
    if (type === 'login') {
      navigate('/login');
    } else if (type === 'register') {
      navigate('/register');
    }
  };

  return (
    <>
      <header 
        className="backdrop-blur-xl border-b border-white/20 sticky top-6 mx-8 rounded-2xl z-50 mt-4 shadow-2xl transition-all duration-300"
        style={{ backgroundColor: headerColor }}
      >
        <div className="container mx-auto px-8 py-3">
          <div className="flex items-center justify-between">
            
            {/* Logo and Menu */}
            <div className="flex items-center space-x-12">
              <Link to="/" className="flex items-center">
                <img 
                  src={logo} 
                  alt="WE" 
                  className="h-14 w-auto rounded-full hover:scale-105 transition-transform duration-300"
                />
              </Link>
              
              {/* Navigation Menu */}
              <nav className="hidden lg:flex items-center space-x-8">
                <Link to="/" className="text-white/90 hover:text-white transition-all duration-200 font-semibold text-lg hover:scale-105">
                  Home
                </Link>
                <Link to="/browse" onClick={handleMusicClick} className="text-white/90 hover:text-white transition-all duration-200 font-semibold text-lg hover:scale-105">
                  Browse
                </Link>
                <Link to="/library" onClick={handleMusicClick} className="text-white/90 hover:text-white transition-all duration-200 font-semibold text-lg hover:scale-105">
                  Library
                </Link>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search on WE..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-full px-6 py-2.5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-200"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* User Section */}
            <div className="flex items-center space-x-4">
              
              {/* Color Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-10 h-10 rounded-full border-2 border-white/30 hover:border-white/60 transition-all duration-200 flex items-center justify-center hover:scale-110"
                  style={{ backgroundColor: headerColor }}
                  title="Change header color"
                >
                  <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </button>

                {showColorPicker && (
                  <div className="absolute top-12 right-0 bg-gray-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-4 shadow-2xl z-50">
                    <div className="grid grid-cols-3 gap-3 min-w-[140px]">
                      {presetColors.map((color, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setHeaderColor(color);
                            setShowColorPicker(false);
                          }}
                          className="w-8 h-8 rounded-full border-2 border-white/40 hover:border-white hover:scale-110 transition-all duration-200"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Authenticated Users */}
              {isAuthenticated && user ? (
                <>
                  {/* Coins Display */}
                  <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2 flex items-center space-x-2 hover:scale-105 transition-transform duration-200">
                    <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                      <span className="text-amber-900 text-xs font-bold">$</span>
                    </div>
                    <span className="text-amber-300 font-bold text-sm">{user.coins || 0} coins</span>
                  </div>
                  
                  {/* User Profile */}
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white/30 flex items-center justify-center text-white font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold text-lg">{user?.username}</span>
                      <button 
                        onClick={handleLogout}
                        className="text-white/70 hover:text-white transition-colors duration-200 ml-2 p-1 hover:bg-white/10 rounded-lg"
                        title="Logout"
                      >
                        <FiLogOut className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Login/Signup Buttons */
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShowAuthPopup(true)}
                    className="text-white/90 hover:text-white transition-all duration-200 font-semibold text-lg hover:scale-105"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => setShowAuthPopup(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg border border-white/20"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Popup */}
      {showAuthPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiMusic className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join WE Music</h2>
              <p className="text-gray-300">Sign up to access exclusive music and earn coins</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => handleAuthAction('register')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <FiUser className="w-4 h-4 mr-2" />
                Create Account
              </button>
              
              <button
                onClick={() => handleAuthAction('login')}
                className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center justify-center"
              >
                <FiLogOut className="w-4 h-4 mr-2" />
                Sign In
              </button>
              
              <button
                onClick={() => setShowAuthPopup(false)}
                className="w-full text-gray-400 py-2 hover:text-white transition-colors duration-200"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;