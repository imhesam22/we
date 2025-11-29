// src/App.jsx - آپدیت شده
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/SignUp/RegisterPage';
import EmailVerificationPage from './pages/SignUp/EmailVerificationPage';
import CoinHistoryPage from './pages/CoinHistory/CoinHistoryPage';
import UserSettings from './pages/Settings/UserSettings';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminMusic from './pages/Admin/AdminMusic';
import AdminStats from './pages/Admin/AdminStats';
import MusicPlayer from './components/Music/MusicPlayer';
import ErrorBoundary from './components/Error/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App bg-gray-900 min-h-screen">
          <Header />
          <main>
            <Routes>
              {/* Routes عمومی */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/verify-email" element={<EmailVerificationPage />} />
              <Route path="/coin-history" element={<CoinHistoryPage />} />
              <Route path="/settings" element={<UserSettings />} />
              
              {/* Routes ادمین */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/music" element={<AdminMusic />} />
              <Route path="/admin/stats" element={<AdminStats />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          
          <MusicPlayer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;