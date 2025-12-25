// src/pages/Home/HomePage.jsx - نسخه بدون ScrollReveal
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useMusicStore } from '../../stores/musicStore';
import { FiHeadphones, FiMusic, FiArrowRight, FiPlay, FiPause, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import SpotlightCard from '../../components/SpotlightCard';

const HomePage = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { featuredMusic, fetchMusic, playMusic, currentMusic, isPlaying } = useMusicStore();
  const navigate = useNavigate();
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && featuredMusic.length === 0) {
      fetchMusic();
    }
  }, [isAuthenticated, featuredMusic.length, fetchMusic]);

  // Auto slide show
  useEffect(() => {
    if (featuredMusic.length > 0 && isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % Math.min(featuredMusic.length, 3));
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [featuredMusic.length, isAutoPlaying]);

  // فقط ۳ موزیک برتر برای نمایش در اسلاید
  const slideTracks = featuredMusic.slice(0, 3);

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
    } else {
      navigate('/browse');
    }
  };

  const handleAuthAction = (type) => {
    setShowAuthPopup(false);
    navigate(type === 'login' ? '/login' : '/register');
  };

  const handlePlayMusic = (music) => {
    if (!isAuthenticated) {
      setShowAuthPopup(true);
      return;
    }
    playMusic(music, featuredMusic);
  };

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide(prev => (prev + 1) % Math.min(featuredMusic.length, 3));
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide(prev => (prev - 1 + Math.min(featuredMusic.length, 3)) % Math.min(featuredMusic.length, 3));
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const handlePlayPauseSlide = (music) => {
    if (currentMusic?._id === music._id && isPlaying) {
      playMusic(music); // Pause
    } else {
      handlePlayMusic(music); // Play
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-gray-900 text-white relative overflow-hidden">
      {/* Main Content */}
      <div className="relative z-10">
        
        {/* Hero Section */}
        <section className="pt-24 pb-32 px-4 md:px-6">
          <div className="container mx-auto max-w-6xl">
            
            {/* Hero Title - بدون ScrollReveal */}
            <div className="text-center mb-16">
              <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent tracking-tighter animate-pulse">
                WE MUSIC
              </h1>
              
              <p className="text-2xl md:text-3xl text-gray-300 font-light mb-12">
                Where Sound Meets Soul
              </p>
            </div>

            {/* Music Cover Slideshow */}
            {isAuthenticated && slideTracks.length > 0 && (
              <div className="relative mb-20">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
                  
                  {/* Album Cover Display */}
                  <div className="lg:w-1/2 relative">
                    <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                      {slideTracks.map((music, index) => (
                        <div
                          key={music._id}
                          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                            index === currentSlide
                              ? 'opacity-100 scale-100'
                              : 'opacity-0 scale-95'
                          }`}
                        >
                          <img
                            src={music.coverImage}
                            alt={music.title}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          
                          {/* Now Playing Indicator */}
                          {currentMusic?._id === music._id && (
                            <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-3 py-1 flex items-center gap-2 animate-pulse">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-green-300 text-sm font-medium">Now Playing</span>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Slide Controls */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2">
                        {slideTracks.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setIsAutoPlaying(false);
                              setCurrentSlide(index);
                              setTimeout(() => setIsAutoPlaying(true), 5000);
                            }}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentSlide
                                ? 'w-8 bg-gray-500'
                                : 'bg-gray-600 hover:bg-gray-400'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {/* Navigation Arrows */}
                      <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors border border-gray-700"
                      >
                        <FiChevronLeft className="w-6 h-6" />
                      </button>
                      
                      <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors border border-gray-700"
                      >
                        <FiChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="lg:w-1/2">
                    {slideTracks.map((music, index) => (
                      <div
                        key={music._id}
                        className={`bg-gray-900/40 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 md:p-8 transition-all duration-500 ${
                          index === currentSlide
                            ? 'opacity-100'
                            : 'absolute opacity-0 pointer-events-none'
                        }`}
                      >
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                          {music.title}
                        </h3>
                        <p className="text-xl text-gray-300 mb-6">{music.artist}</p>
                        
                        <div className="flex items-center gap-4 mb-6">
                          <span className="bg-purple-500/30 text-purple-300 px-4 py-1.5 rounded-full text-sm font-medium">
                            {music.genre}
                          </span>
                          <span className="text-gray-400">{music.duration}</span>
                          <div className="flex items-center gap-1 text-amber-400">
                            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full"></div>
                            <span className="text-sm font-bold">+1 coin</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handlePlayPauseSlide(music)}
                            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-purple-500/30"
                          >
                            {currentMusic?._id === music._id && isPlaying ? (
                              <FiPause className="w-6 h-6 text-white" />
                            ) : (
                              <FiPlay className="w-6 h-6 text-white ml-1" />
                            )}
                          </button>
                          
                          <div>
                            <p className="text-gray-400 text-sm">Play to earn coins</p>
                            <p className="text-gray-500 text-xs">{music.playCount || 0} plays</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={handleGetStarted}
                className="group relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-500/30 text-white px-10 py-4 rounded-full text-lg font-semibold hover:border-purple-500/50 transition-all duration-300 flex items-center justify-center gap-3 mx-auto hover:shadow-xl hover:shadow-purple-500/20"
              >
                <FiHeadphones className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                {isAuthenticated ? 'Continue Listening' : 'Start Free Trial'}
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </section>

        {/* Browse Button at Bottom */}
        {isAuthenticated && (
          <div className="fixed bottom-8 right-8 z-30 animate-bounce-slow">
            <button
              onClick={() => navigate('/browse')}
              className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-6 py-3 rounded-full font-medium hover:bg-black/60 hover:border-white/20 transition-all duration-300 flex items-center gap-2 shadow-2xl"
            >
              <FiMusic className="w-4 h-4" />
              Browse Library
            </button>
          </div>
        )}

        {/* Featured Tracks Section (فقط برای کاربران لاگین کرده) */}
        {isAuthenticated && featuredMusic.length > 0 && (
          <section className="py-20 px-4 md:px-6">
            <div className="container mx-auto max-w-6xl">
              
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Featured This Week
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                  Handpicked tracks selected just for you
                </p>
              </div>

              {/* Spotlight Cards for Featured Tracks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredMusic.slice(0, 3).map((music) => (
                  <SpotlightCard
                    key={music._id}
                    className="h-full hover:scale-[1.02] transition-transform duration-300"
                    spotlightColor="rgba(139, 92, 246, 0.15)"
                  >
                    <div className="flex flex-col h-full">
                      <div className="relative mb-4">
                        <img
                          src={music.coverImage}
                          alt={music.title}
                          className="w-full aspect-square rounded-xl object-cover"
                        />
                        <button
                          onClick={() => handlePlayMusic(music)}
                          className="absolute bottom-3 right-3 w-12 h-12 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-black/90 transition-colors"
                        >
                          <FiPlay className="w-5 h-5 text-white ml-1" />
                        </button>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-lg mb-1">{music.title}</h4>
                        <p className="text-gray-300 text-sm mb-3">{music.artist}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="bg-gray-800/50 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                            {music.genre}
                          </span>
                          <span className="text-gray-400 text-sm">{music.duration}</span>
                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-12">
                <button
                  onClick={() => navigate('/browse')}
                  className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-full font-medium transition-all duration-300 border border-white/10 hover:border-white/20 inline-flex items-center gap-2"
                >
                  View All Tracks
                  <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Call to Action for Non-Authenticated Users */}
        {!isAuthenticated && (
          <section className="py-32 px-4 md:px-6">
            <div className="container mx-auto max-w-4xl text-center">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Ready to Transform Your Music Experience?
                </h2>
                
                <p className="text-gray-300 text-lg md:text-xl mb-8">
                  Join thousands of music lovers and unlock exclusive features
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleAuthAction('register')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    Start Free Trial
                  </button>
                  
                  <button
                    onClick={() => handleAuthAction('login')}
                    className="bg-white/10 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 border border-white/10"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Auth Popup */}
      {showAuthPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiMusic className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Join WE Music</h2>
              <p className="text-gray-300">Unlock premium features and start earning</p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => handleAuthAction('register')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300"
              >
                Create Free Account
              </button>
              
              <button
                onClick={() => handleAuthAction('login')}
                className="w-full bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 border border-white/10"
              >
                Sign In to Existing Account
              </button>
              
              <button
                onClick={() => setShowAuthPopup(false)}
                className="w-full text-gray-400 hover:text-white transition-colors duration-200 text-sm"
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