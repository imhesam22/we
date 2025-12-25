// src/components/Header.jsx - فقط بخش سکه‌ها اصلاح شده
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { FiSearch, FiLogOut, FiUser, FiMusic, FiHome, FiTrendingUp, FiHeart, FiMenu, FiX, FiDollarSign } from 'react-icons/fi';
import logo from '../../assets/Logo/Weicon.svg';

const Header = () => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}&page=1`);
    setSearchQuery('');
    setIsSearchVisible(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // برای صفحاتی که هدر ندارن
  if (['/login', '/register', '/verify-email', '/music-player'].includes(location.pathname)) {
    return null;
  }

  // دکمه‌های ناوبری
const navigationItems = [
  { path: '/', label: 'Home', icon: FiHome },
  { path: '/browse', label: 'Browse', icon: FiMusic },
  { path: '/coin-history', label: 'Coins', icon: FiDollarSign }, // 🔥 جایگزین Trend
  { path: '/favorites', label: 'Favorites', icon: FiHeart },
];

  return (
    <>
      <header className="sticky top-0 bg-gray-950 z-30 border-b border-gray-800">
        {/* با استفاده از mx-auto و max-w برای کنترل فاصله */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7.5xl">
          <div className="h-16 flex items-center justify-between">
            
            {/* سمت چپ: لوگو و منوی موبایل */}
            <div className="flex items-center gap-4">
              {/* دکمه منوی موبایل */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-400 hover:text-white"
              >
                <FiMenu className="w-6 h-6" />
              </button>

              {/* لوگو */}
              <Link to="/" className="flex items-center">
                <img 
                  src={logo} 
                  alt="WE" 
                  className="h-10 ml-5 w-auto"
                />
              </Link>

              {/* منوی ناوبری - فقط دسکتاپ */}
              <nav className="hidden md:flex items-center gap-1 ml-6 lg:ml-8">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === item.path 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* وسط: نوار جستجو (دسکتاپ) */}
            <div className="hidden lg:flex flex-1 max-w-xl mx-6 2xl:mx-12">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-full px-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FiSearch className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* سمت راست: بخش کاربر */}
            <div className="flex items-center gap-3 lg:gap-4">
              
              {/* دکمه جستجو در موبایل */}
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* 🔴 تصحیح: نمایش سکه‌ها */}
              {isAuthenticated && user && (
                <div className="flex items-center gap-2 bg-gray-900 border border-amber-500/30 rounded-full px-3 py-1.5">
                  <FiDollarSign className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-300 font-bold text-sm">
                    {user.coins || 0}
                  </span>
                </div>
              )}

              {/* کاربر احراز هویت شده */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3 lg:gap-4">
                  {/* آواتار کاربر */}
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    {/* نام کاربر - فقط دسکتاپ */}
                    <span className="hidden md:block text-white font-medium text-sm">
                      {user?.username}
                    </span>
                  </div>
                  
                  {/* دکمه خروج */}
                  <button 
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-white p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* دکمه‌های لاگین/ثبت‌نام */
                <div className="flex items-center gap-2 lg:gap-3">
                  <button 
                    onClick={() => navigate('/login')}
                    className="text-gray-300 hover:text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => navigate('/register')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-2 rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* نوار جستجو در موبایل */}
          {isSearchVisible && (
            <div className="lg:hidden pb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FiSearch className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* منوی موبایل */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-800 mt-2 pt-4">
              <nav className="grid grid-cols-2 gap-2">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                      location.pathname === item.path 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Header;