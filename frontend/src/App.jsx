import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Layout from "./components/layout/Layout";
import PublicLayout from "./components/layout/PublicLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProtectedRoute from "./routes/ProtectedRoute";
import UserProtectedRoute from "./routes/UserProtectedRoute";

// Public Pages
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import NewsListingPage from "./pages/public/NewsListingPage";
import NewsDetailPage from "./pages/public/NewsDetailPage";
import EventsListingPage from "./pages/public/EventsListingPage";
import EventDetailPage from "./pages/public/EventDetailPage";
import AnonymousReportPage from "./pages/public/AnonymousReportPage";
import ReportTrackingPage from "./pages/public/ReportTrackingPage";
import ContactPage from "./pages/public/ContactPage";
import NotFoundPage from "./pages/public/NotFoundPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import UserLoginPage from "./pages/auth/UserLoginPage";

// User Pages
import UserProfilePage from "./pages/user/UserProfilePage";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import ProfilePage from "./pages/admin/ProfilePage";
import NewsPage from "./pages/admin/NewsPage";
import EventsPage from "./pages/admin/EventsPage";
import ReportsPage from "./pages/admin/ReportsPage";

import "./styles/index.css";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <NotificationProvider>
              <div className="App">
                <Routes>
                  {/* Public Routes - No Authentication Required */}
                  <Route
                    path="/"
                    element={
                      <PublicLayout>
                        <HomePage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      <PublicLayout>
                        <AboutPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/news"
                    element={
                      <PublicLayout>
                        <NewsListingPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/news/:slug"
                    element={
                      <PublicLayout>
                        <NewsDetailPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <PublicLayout>
                        <EventsListingPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/events/:slug"
                    element={
                      <PublicLayout>
                        <EventDetailPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/report"
                    element={
                      <PublicLayout>
                        <AnonymousReportPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/report/track"
                    element={
                      <PublicLayout>
                        <ReportTrackingPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <PublicLayout>
                        <ContactPage />
                      </PublicLayout>
                    }
                  />

                  {/* User Auth Routes */}
                  <Route
                    path="/user/register"
                    element={
                      <PublicLayout>
                        <RegisterPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/user/login"
                    element={
                      <PublicLayout>
                        <UserLoginPage />
                      </PublicLayout>
                    }
                  />
                  <Route
                    path="/user/profile"
                    element={
                      <UserProtectedRoute>
                        <PublicLayout>
                          <UserProfilePage />
                        </PublicLayout>
                      </UserProtectedRoute>
                    }
                  />

                  {/* Auth Routes */}
                  <Route path="/login" element={<LoginPage />} />

                  {/* Protected Admin Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <ProfilePage />
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes with nested routing */}
                  <Route
                    path="/admin/*"
                    element={
                      <ProtectedRoute>
                        <Layout>
                          <Routes>
                            <Route
                              index
                              element={<Navigate to="/dashboard" replace />}
                            />
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route
                              path="news"
                              element={
                                <ProtectedRoute
                                  requiredPermissions={[
                                    "manage_news",
                                    "manage_content",
                                  ]}
                                >
                                  <NewsPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="events"
                              element={
                                <ProtectedRoute
                                  requiredPermissions={[
                                    "manage_events",
                                    "manage_content",
                                  ]}
                                >
                                  <EventsPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="reports"
                              element={
                                <ProtectedRoute
                                  requiredPermissions={[
                                    "manage_reports",
                                    "view_reports",
                                  ]}
                                >
                                  <ReportsPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="*"
                              element={<Navigate to="/dashboard" replace />}
                            />
                          </Routes>
                        </Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 - Not Found */}
                  <Route path="*" element={<NotFoundPage />} />
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
