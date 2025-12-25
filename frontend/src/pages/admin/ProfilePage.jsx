import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Save, Camera, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../hooks/useNotification';
import { useForm } from '../../hooks/useForm';
import { apiClient } from '../../services/api';
import { profileUpdateSchema, changePasswordSchema } from '../../utils/schemas';
import { formatDate } from '../../utils/helpers';
import { ADMIN_ROLES } from '../../utils/constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Modal from '../../components/ui/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useNotification();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile form
  const profileForm = useForm(profileUpdateSchema, {
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || ''
  });

  // Password change form
  const passwordForm = useForm(changePasswordSchema, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch full profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/auth/profile');
        const profile = response.data || response;
        
        setProfileData(profile);
        
        // Update form with fetched data
        profileForm.reset({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          bio: profile.bio || ''
        });
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        error('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async (data) => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      const updatedProfile = response.data || response;
      
      // Update auth context
      updateUser(updatedProfile);
      setProfileData(updatedProfile);
      
      success('Success', 'Profile updated successfully');
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw new Error(err.message || 'Failed to update profile');
    }
  };

  // Handle password change
  const handlePasswordChange = async (data) => {
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      success('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      passwordForm.reset();
    } catch (err) {
      console.error('Failed to change password:', err);
      throw new Error(err.message || 'Failed to change password');
    }
  };

  // Role display helper
  const getRoleDisplay = (role) => {
    const roleMap = {
      [ADMIN_ROLES.SUPER_ADMIN]: 'Super Administrator',
      [ADMIN_ROLES.ADMIN]: 'Administrator',
      [ADMIN_ROLES.CASE_MANAGER]: 'Case Manager',
      [ADMIN_ROLES.CONTENT_MANAGER]: 'Content Manager',
      [ADMIN_ROLES.PR_OFFICER]: 'PR Officer'
    };
    return roleMap[role] || role;
  };

  // Status display helper
  const getStatusColor = (status) => {
    const statusColors = {
      ACTIVE: 'text-success-500 bg-success-500/10',
      INACTIVE: 'text-gray-500 bg-gray-500/10',
      SUSPENDED: 'text-error-500 bg-error-500/10'
    };
    return statusColors[status] || 'text-gray-500 bg-gray-500/10';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account information and security settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                <Input
                  {...profileForm.register('name')}
                  label="Full Name"
                  placeholder="Enter your full name"
                  leftIcon={User}
                  error={profileForm.errors.name?.message}
                  disabled={profileForm.isSubmitting}
                  required
                />

                <Input
                  {...profileForm.register('email')}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  leftIcon={Mail}
                  error={profileForm.errors.email?.message}
                  disabled={profileForm.isSubmitting}
                  required
                />

                <Input
                  {...profileForm.register('phone')}
                  type="tel"
                  label="Phone Number"
                  placeholder="Enter your phone number"
                  leftIcon={Phone}
                  error={profileForm.errors.phone?.message}
                  disabled={profileForm.isSubmitting}
                />

                <Textarea
                  {...profileForm.register('bio')}
                  label="Bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={500}
                  showCharCount
                  error={profileForm.errors.bio?.message}
                  disabled={profileForm.isSubmitting}
                />

                <div className="flex items-center gap-3 pt-4">
                  <Button
                    type="submit"
                    loading={profileForm.isSubmitting}
                    leftIcon={Save}
                  >
                    Save Changes
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => profileForm.reset()}
                    disabled={profileForm.isSubmitting}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordModal(true)}
                    leftIcon={Lock}
                  >
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-white/10">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center text-white text-2xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  leftIcon={Camera}
                  disabled
                >
                  Change Photo
                </Button>
              </div>

              {/* Account Details */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="w-4 h-4 text-neon-green" />
                    <span className="font-medium">{getRoleDisplay(user?.role)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user?.status)}`}>
                      {user?.status}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(profileData?.createdAt || user?.createdAt)}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div className="mt-1">
                    <span className="text-sm">
                      {formatDate(profileData?.updatedAt || user?.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Activity tracking coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          passwordForm.reset();
        }}
        title="Change Password"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordModal(false);
                passwordForm.reset();
              }}
              disabled={passwordForm.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={passwordForm.handleSubmit(handlePasswordChange)}
              loading={passwordForm.isSubmitting}
              leftIcon={Lock}
            >
              Change Password
            </Button>
          </>
        }
      >
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
          <Input
            {...passwordForm.register('currentPassword')}
            type="password"
            label="Current Password"
            placeholder="Enter your current password"
            showPasswordToggle
            error={passwordForm.errors.currentPassword?.message}
            disabled={passwordForm.isSubmitting}
            required
          />

          <Input
            {...passwordForm.register('newPassword')}
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            showPasswordToggle
            error={passwordForm.errors.newPassword?.message}
            disabled={passwordForm.isSubmitting}
            helperText="Password must be at least 8 characters with uppercase, lowercase, number, and special character"
            required
          />

          <Input
            {...passwordForm.register('confirmPassword')}
            type="password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            showPasswordToggle
            error={passwordForm.errors.confirmPassword?.message}
            disabled={passwordForm.isSubmitting}
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;