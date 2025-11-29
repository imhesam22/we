// src/pages/SignUp/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuthStore } from '../../stores/authStore';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (error) clearError();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 Form submitted'); // برای دیباگ
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    clearError();
    
    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      };
      
      console.log('🚀 Starting registration...', userData);
      
      const result = await register(userData);
      
      console.log('✅ Registration successful:', result);
      
      if (result.success) {
        // Save email for verification page
        localStorage.setItem('pending_email', formData.email);
        navigate('/verify-email');
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      setErrors({ 
        submit: error.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Join WE
              </h1>
              <p className="text-white/70">
                Create your account - email verification required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-white/80 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${
                    errors.username ? 'border-red-500/50' : 'border-white/20'
                  } rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300`}
                  placeholder="Choose a username"
                />
                {errors.username && (
                  <p className="text-red-400 text-sm mt-1">{errors.username}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${
                    errors.email ? 'border-red-500/50' : 'border-white/20'
                  } rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${
                    errors.password ? 'border-red-500/50' : 'border-white/20'
                  } rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300`}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-white/80 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-white/5 border ${
                    errors.confirmPassword ? 'border-red-500/50' : 'border-white/20'
                  } rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-300`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>

              {(errors.submit || error) && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                  <p className="text-red-400 text-sm text-center">
                    {errors.submit || error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center pt-4 border-t border-white/20">
                <p className="text-white/70 text-sm">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors duration-200"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

            </form>
          </div>

          {/* Debug Info */}
          <div className="mt-4 p-4 bg-blue-500/10 rounded-lg">
            <p className="text-blue-300 text-sm text-center">
              🔧 Development Mode: Backend on port 5222
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;