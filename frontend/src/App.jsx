import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/admin/Dashboard';
import ProfilePage from './pages/admin/ProfilePage';
import NewsPage from './pages/admin/NewsPage';
import EventsPage from './pages/admin/EventsPage';
import ReportsPage from './pages/admin/ReportsPage';

import './styles/index.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <NotificationProvider>
              <div className="App">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  
                  {/* Protected Admin Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Layout>
                        <ProfilePage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/news" element={
                    <ProtectedRoute requiredPermissions={['manage_news', 'manage_content']}>
                      <Layout>
                        <NewsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/events" element={
                    <ProtectedRoute requiredPermissions={['manage_events', 'manage_content']}>
                      <Layout>
                        <EventsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reports" element={
                    <ProtectedRoute requiredPermissions={['manage_reports', 'view_reports']}>
                      <Layout>
                        <ReportsPage />
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes with nested routing */}
                  <Route path="/admin/*" element={
                    <ProtectedRoute>
                      <Layout>
                        <Routes>
                          <Route index element={<Navigate to="/dashboard" replace />} />
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="profile" element={<ProfilePage />} />
                          <Route path="news" element={
                            <ProtectedRoute requiredPermissions={['manage_news', 'manage_content']}>
                              <NewsPage />
                            </ProtectedRoute>
                          } />
                          <Route path="events" element={
                            <ProtectedRoute requiredPermissions={['manage_events', 'manage_content']}>
                              <EventsPage />
                            </ProtectedRoute>
                          } />
                          <Route path="reports" element={
                            <ProtectedRoute requiredPermissions={['manage_reports', 'view_reports']}>
                              <ReportsPage />
                            </ProtectedRoute>
                          } />
                          <Route path="*" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  } />
                  
                  {/* Fallback redirects */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </NotificationProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
