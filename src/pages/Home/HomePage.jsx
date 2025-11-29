// src/pages/Home/HomePage.jsx - نسخه کامل آپدیت شده
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useMusicStore } from '../../stores/musicStore';
import MusicCard from '../../components/Music/MusicCard';
import { FiHeadphones, FiTrendingUp, FiStar, FiMusic } from 'react-icons/fi';

const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { featuredMusic, fetchMusic, playMusic, isLoading } = useMusicStore();
  const navigate = useNavigate();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('featured');

  useEffect(() => {
    if (isAuthenticated) {
      fetchMusic();
    }
  }, [isAuthenticated, fetchMusic]);

  const handlePlayMusic = (music, playlist = null) => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }
    
    const playListToUse = playlist || featuredMusic;
    console.log('🎵 Playing with playlist:', playListToUse?.length || 0, 'tracks');
    
    playMusic(music, playListToUse);
  };

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
    } else {
      document.getElementById('music-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAuthAction = (type) => {
    setShowAuthPopup(false);
    navigate(type === 'login' ? '/login' : '/register');
  };

  // دسته‌بندی موزیک‌ها بر اساس ژانر
  const genres = [...new Set(featuredMusic.map(music => music.genre))];
  const featuredTracks = featuredMusic.slice(0, 8);
  const popularTracks = [...featuredMusic].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <FiMusic className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                <span className="text-amber-900 text-sm font-bold">$</span>
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
            WE MUSIC
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover exclusive music, earn rewards, and experience sound like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-white/20 flex items-center"
            >
              <FiHeadphones className="w-5 h-5 mr-2" />
              {isAuthenticated ? 'Explore Music' : 'Get Started Free'}
            </button>
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/10 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
            >
              Learn More
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{featuredMusic.length}+</div>
              <div className="text-gray-400">Premium Tracks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">1K+</div>
              <div className="text-gray-400">Active Listeners</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-2">5K+</div>
              <div className="text-gray-400">Coins Earned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-800/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose WE?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Experience the future of music streaming with our unique features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white/5 rounded-2xl p-8 text-center backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Earn Rewards</h3>
              <p className="text-gray-300">Get coins for every track you listen to and unlock exclusive content</p>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-8 text-center backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMusic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Exclusive Content</h3>
              <p className="text-gray-300">Access premium tracks from curated artists worldwide</p>
            </div>
            
            <div className="bg-white/5 rounded-2xl p-8 text-center backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">High Quality</h3>
              <p className="text-gray-300">Enjoy crystal clear audio quality optimized for all devices</p>
            </div>
          </div>
        </div>
      </section>

      {/* Music Section */}
      <section id="music-section" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Tracks</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {isAuthenticated 
                ? `Welcome back, ${user?.username}! Start listening to earn coins.`
                : 'Sign up to access exclusive tracks and earn rewards'
              }
            </p>
            
            {isAuthenticated && (
              <div className="mt-6 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 rounded-full px-8 py-4 inline-block">
                <span className="text-amber-300 font-bold text-xl">
                  {user?.coins || 0} coins available
                </span>
              </div>
            )}
          </div>

          {/* Tab Navigation */}
          {isAuthenticated && featuredMusic.length > 0 && (
            <div className="flex justify-center mb-8">
              <div className="bg-white/10 rounded-2xl p-2 backdrop-blur-sm border border-white/20">
                <button
                  onClick={() => setActiveTab('featured')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'featured' 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiStar className="w-4 h-4 inline mr-2" />
                  Featured
                </button>
                <button
                  onClick={() => setActiveTab('popular')}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === 'popular' 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <FiTrendingUp className="w-4 h-4 inline mr-2" />
                  Popular
                </button>
              </div>
            </div>
          )}
          
          {isAuthenticated ? (
            <div className="space-y-12">
              {/* Featured Tracks */}
              {(activeTab === 'featured' || !isAuthenticated) && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <FiStar className="w-6 h-6 text-purple-400 mr-3" />
                    Featured Tracks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {featuredTracks.map(music => (
                      <MusicCard 
                        key={music._id} 
                        music={music} 
                        onPlay={handlePlayMusic}
                        playlist={featuredMusic}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Tracks */}
              {activeTab === 'popular' && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                    <FiTrendingUp className="w-6 h-6 text-green-400 mr-3" />
                    Popular Now
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {popularTracks.map(music => (
                      <MusicCard 
                        key={music._id} 
                        music={music} 
                        onPlay={handlePlayMusic}
                        playlist={popularTracks}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                  <p className="text-gray-400 mt-4">Loading music...</p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && featuredMusic.length === 0 && (
                <div className="text-center py-12">
                  <FiMusic className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">No Music Available</h3>
                  <p className="text-gray-400">Check back later for new tracks</p>
                </div>
              )}
            </div>
          ) : (
            /* Sign Up Prompt */
            <div className="text-center py-12">
              <div className="bg-white/5 rounded-2xl p-12 max-w-2xl mx-auto border border-white/10">
                <FiHeadphones className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Listening?</h3>
                <p className="text-gray-300 mb-6">Sign up now to access our exclusive music library and start earning coins with every play</p>
                <button
                  onClick={() => setShowAuthPopup(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300"
                >
                  Sign Up Free
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/80 border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">WE Music</h3>
              <p className="text-gray-400">
                Your destination for exclusive music and rewards.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => document.getElementById('music-section')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Browse Music</button></li>
                <li><button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => setShowAuthPopup(true)} className="hover:text-white transition-colors">Sign Up</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="text-lg">📘</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="text-lg">🐦</span>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="text-lg">📷</span>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 WE Music. All rights reserved.</p>
          </div>
        </div>
      </footer>

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
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
              >
                Create Account
              </button>
              
              <button
                onClick={() => handleAuthAction('login')}
                className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
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
    </div>
  );
};

export default HomePage;