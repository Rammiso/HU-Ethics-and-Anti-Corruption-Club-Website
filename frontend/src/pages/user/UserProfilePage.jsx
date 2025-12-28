import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  LogOut,
  CheckCircle,
  XCircle,
  Loader,
} from "lucide-react";
import { useNotification } from "../../context/NotificationContext";
import { apiClient } from "../../services/api";

const UserProfilePage = () => {
  const navigate = useNavigate();
  const notification = useNotification();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("userToken");

      const response = await apiClient.get("/auth/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success && response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to load profile";
      notification.error("Error", message);

      // If unauthorized, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("userType");
        navigate("/user/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("userToken");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("userType");

    notification.success("Success", "Logged out successfully");
    navigate("/");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-neon-green animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 max-w-md text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground mb-6">
            Unable to load your profile information.
          </p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-green to-neon-blue mb-4 shadow-neon">
            <UserIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold font-display neon-text mb-2">
            User Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </div>

        {/* Profile Information */}
        <div className="glass-card p-8 mb-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-neon-green" />
            Account Information
          </h2>

          <div className="space-y-6">
            {/* Name */}
            {user.profile?.name && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-neon-green/10 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-neon-green" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Full Name
                  </p>
                  <p className="text-lg font-medium">{user.profile.name}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-neon-blue/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-neon-blue" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Email Address
                </p>
                <p className="text-lg font-medium">{user.email}</p>

                {/* Email Verification Status */}
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium">
                  {user.isEmailVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-orange-500">Not Verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Registration Date */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Member Since
                </p>
                <p className="text-lg font-medium">
                  {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Last Login */}
            {user.lastLogin && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    Last Login
                  </p>
                  <p className="text-lg font-medium">
                    {formatDate(user.lastLogin)}
                  </p>
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  Account Status
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 text-xs font-medium">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-500">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Features Section */}
        <div className="glass-card p-6 mb-6 border-l-4 border-neon-blue">
          <h3 className="text-lg font-semibold mb-2 text-neon-blue">
            Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground">
            Edit profile information, change password, manage notification
            preferences, and view your activity history.
          </p>
        </div>

        {/* Logout Button */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
