import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import ErrorBoundary from './components/Error/ErrorBoundary';
import LoadingSpinner from './components/Common/LoadingSpinner';
import './index.css';

// Layout components (not lazy loaded as they're needed immediately)
import PublicLayout from './components/Layout/PublicLayout';
import AdminLayout from './components/Layout/AdminLayout';
import ScrollReveal from './components/UI/ScrollReveal';

// Lazy loaded public pages
const HomePage = lazy(() => import('./pages/Home/HomePage'));
const BrowsePage = lazy(() => import('./pages/Music/BrowsePage'));
const MusicPlayerPage = lazy(() => import('./pages/Music/MusicPlayerPage'));
const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const RegisterPage = lazy(() => import('./pages/SignUp/RegisterPage'));
const EmailVerificationPage = lazy(() => import('./pages/SignUp/EmailVerificationPage'));
const CoinHistoryPage = lazy(() => import('./pages/CoinHistory/CoinHistoryPage'));
const UserSettings = lazy(() => import('./pages/Settings/UserSettings'));
const NotFoundPage = lazy(() => import('./pages/NotFound/NotFoundPage'));
const FavoritesPage = lazy(() => import('./pages/Favorites/FavoritesPage'));

// Lazy loaded admin pages
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/Admin/AdminUsers'));
const AdminMusic = lazy(() => import('./pages/Admin/AdminMusic'));
const AdminStats = lazy(() => import('./pages/Admin/AdminStats'));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          {/* 🌍 Public layout */}
          <Route element={<PublicLayout />}>
            <Route 
              path="/" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <HomePage />
                </Suspense>
              } 
            />
            <Route 
              path="/browse" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <BrowsePage />
                </Suspense>
              } 
            />
            <Route 
              path="/favorites" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <FavoritesPage />
                </Suspense>
              } 
            />
            <Route 
              path="/coin-history" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <CoinHistoryPage />
                </Suspense>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <UserSettings />
                </Suspense>
              } 
            />
          </Route>

          {/* 🎵 Fullscreen player (NO sidebar/header) */}
          <Route 
            path="/music/:id" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <MusicPlayerPage />
              </Suspense>
            } 
          />

          {/* 🔐 Auth pages */}
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LoginPage />
              </Suspense>
            } 
          />
          <Route 
            path="/register" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <RegisterPage />
              </Suspense>
            } 
          />
          <Route 
            path="/verify-email" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <EmailVerificationPage />
              </Suspense>
            } 
          />

          {/* 👑 Admin section */}
          <Route element={<AdminLayout />}>
            <Route 
              path="/admin" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminDashboard />
                </Suspense>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminUsers />
                </Suspense>
              } 
            />
            <Route 
              path="/admin/music" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminMusic />
                </Suspense>
              } 
            />
            <Route 
              path="/admin/stats" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminStats />
                </Suspense>
              } 
            />
          </Route>

          {/* 404 Page */}
          <Route 
            path="*" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <NotFoundPage />
              </Suspense>
            } 
          />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;