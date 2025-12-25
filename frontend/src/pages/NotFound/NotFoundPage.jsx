// src/pages/NotFound/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-black text-white/10">404</h1>
          <h2 className="text-4xl font-bold text-white -mt-16">Page Not Found</h2>
        </div>
        
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="space-x-4">
          <Link 
            to="/"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all duration-300 inline-block"
          >
            Go Home
          </Link>
          <button 
            onClick={() => window.history.back()}
            className="bg-white/10 text-white px-8 py-3 rounded-full font-semibold hover:bg-white/20 transition-all duration-300 border border-white/20"
          >
            Go Back
          </button>
        </div>
        
        {/* Animated music notes */}
        <div className="mt-12 flex justify-center space-x-4">
          {['🎵', '🎶', '🎧', '🎸'].map((emoji, index) => (
            <div 
              key={index}
              className="text-2xl animate-bounce"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;