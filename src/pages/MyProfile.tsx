import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/Layout';

interface ProfileFormData {
  currentFirstName: string;
  currentLastName: string;
  newFirstName: string;
  newLastName: string;
  currentPhone: string;
  newPhone: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface Message {
  type: 'success' | 'error' | '';
  text: string;
}

const MyProfile: React.FC = () => {
  const { isDark: isDarkMode, toggleTheme } = useTheme();
  
  // User info - localStorage'dan direkt al
  const getUserInfo = () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        return {
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phoneNumber: userData.phoneNumber || ''
        };
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return { firstName: '', lastName: '', phoneNumber: '' };
  };

  const userInfo = getUserInfo();
  console.log('Current user info:', userInfo);
  
  // Form states
  const [profileData, setProfileData] = useState<ProfileFormData>({
    currentFirstName: '',
    currentLastName: '',
    newFirstName: '',
    newLastName: '',
    currentPhone: '',
    newPhone: ''
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<Message>({ type: '', text: '' });

  // Load user data
  useEffect(() => {
    console.log('Component mounted, user info:', userInfo);
  }, []);

  // Handle profile input changes
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof ProfileFormData): void => {
    setProfileData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Handle password input changes
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof PasswordData): void => {
    setPasswordData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Handle input focus/blur for styling
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    e.target.style.borderColor = '#3b82f6';
    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    e.target.style.borderColor = isDarkMode ? '#4b5563' : '#d1d5db';
    e.target.style.boxShadow = 'none';
  };

  // Profile update functionality
  const handleProfileUpdate = async (): Promise<void> => {
    // Validation
    if (!profileData.currentFirstName || !profileData.currentLastName || !profileData.newFirstName || !profileData.newLastName) {
      setMessage({ type: 'error', text: 'Please fill in all name fields' });
      return;
    }

    if (!profileData.currentPhone || !profileData.newPhone) {
      setMessage({ type: 'error', text: 'Please fill in all phone fields' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentFirstName: profileData.currentFirstName,
          currentLastName: profileData.currentLastName,
          newFirstName: profileData.newFirstName,
          newLastName: profileData.newLastName,
          currentPhone: profileData.currentPhone,
          newPhone: profileData.newPhone
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully! Please log in again.' });
        setProfileData({
          currentFirstName: '',
          currentLastName: '',
          newFirstName: '',
          newLastName: '',
          currentPhone: '',
          newPhone: ''
        });
        
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Password change functionality
  const handlePasswordChange = async (): Promise<void> => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully! Please log in again.' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Account deletion functionality
  const handleAccountDeletion = async (): Promise<void> => {
    const confirmDeletion = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    
    if (!confirmDeletion) return;

    const doubleConfirm = window.confirm(
      'This will permanently delete all your data. Are you absolutely sure?'
    );
    
    if (!doubleConfirm) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/profile/delete-account', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Account deleted successfully' });
        
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete account' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Common input style
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: `2px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box' as const,
    background: isDarkMode ? '#374151' : '#ffffff',
    color: isDarkMode ? '#f9fafb' : '#1f2937'
  };

  const buttonStyle = {
    background: isDarkMode 
      ? 'linear-gradient(135deg, #1e40af, #1d4ed8)' 
      : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: 'white',
    fontWeight: '600',
    fontSize: '16px',
    padding: '14px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: loading ? 0.7 : 1,
    boxShadow: isDarkMode 
      ? '0 4px 6px rgba(30, 64, 175, 0.3)' 
      : '0 4px 6px rgba(59, 130, 246, 0.3)'
  };

  return (
    <div style={{
      background: isDarkMode ? '#111827' : '#f9fafb',
      minHeight: '100vh',
      color: isDarkMode ? '#f9fafb' : '#1f2937',
      padding: '0',
      margin: '0'
    }}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '12px',
          right: '130px',
          zIndex: 1000,
          background: isDarkMode
            ? 'linear-gradient(135deg, #4338ca, #3730a3)'
            : 'linear-gradient(135deg, #1f2937, #111827)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          fontSize: '20px',
          cursor: 'pointer',
          boxShadow: isDarkMode
            ? '0 10px 25px rgba(67, 56, 202, 0.3)'
            : '0 10px 25px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {/* Header */}
      <div 
        style={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e40af, #1d4ed8)' 
            : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          borderRadius: '20px',
          padding: '40px',
          marginBottom: '32px',
          color: 'white',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: isDarkMode 
            ? '0 20px 25px rgba(30, 64, 175, 0.4)' 
            : '0 20px 25px rgba(59, 130, 246, 0.3)'
        }}
      >
        {/* Animated Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'moveBackground 20s linear infinite'
        }} />
        
        {/* Profile Icon */}
        <div style={{ 
          fontSize: '64px', 
          marginBottom: '16px',
          position: 'relative',
          zIndex: 2
        }}>👤</div>
        
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '8px',
          margin: '0 0 8px 0',
          position: 'relative',
          zIndex: 2
        }}>
          {userInfo.firstName && userInfo.lastName 
            ? `${userInfo.firstName} ${userInfo.lastName}'s Profile`
            : 'Account Settings'
          }
        </h1>
        <p style={{
          fontSize: '18px',
          margin: 0,
          opacity: 0.9,
          position: 'relative',
          zIndex: 2
        }}>
          {userInfo.phoneNumber 
            ? `Phone: ${userInfo.phoneNumber} • Manage your personal information and account security`
            : 'Manage your personal information and account security'
          }
        </p>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes moveBackground {
            0% { background-position: 0 0; }
            100% { background-position: 60px 60px; }
          }
        `}
      </style>

      {/* Back to Dashboard */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            background: 'transparent',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            border: `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Message Display */}
      {message.text && (
        <div style={{
          background: message.type === 'success' 
            ? (isDarkMode ? '#065f46' : '#d1fae5') 
            : (isDarkMode ? '#7f1d1d' : '#fef2f2'),
          color: message.type === 'success' 
            ? (isDarkMode ? '#a7f3d0' : '#065f46') 
            : (isDarkMode ? '#fca5a5' : '#dc2626'),
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Profile Information Section */}
      <div style={{
        background: isDarkMode ? '#1f2937' : '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: isDarkMode 
          ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: isDarkMode ? '#f9fafb' : '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✏️ Profile Information
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Current Name */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: isDarkMode ? '#e5e7eb' : '#374151' }}>
              Current Name
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={profileData.currentFirstName}
                  onChange={(e) => handleProfileInputChange(e, 'currentFirstName')}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={inputStyle}
                  placeholder="Current first name"
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={profileData.currentLastName}
                  onChange={(e) => handleProfileInputChange(e, 'currentLastName')}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={inputStyle}
                  placeholder="Current last name"
                  required
                />
              </div>
            </div>
          </div>

          {/* New Name */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: isDarkMode ? '#e5e7eb' : '#374151' }}>
              New Name
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={profileData.newFirstName}
                  onChange={(e) => handleProfileInputChange(e, 'newFirstName')}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={inputStyle}
                  placeholder="New first name"
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={profileData.newLastName}
                  onChange={(e) => handleProfileInputChange(e, 'newLastName')}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={inputStyle}
                  placeholder="New last name"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phone Numbers */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: isDarkMode ? '#e5e7eb' : '#374151' }}>
              Current Phone Number
            </h3>
            <input
              type="tel"
              value={profileData.currentPhone}
              onChange={(e) => handleProfileInputChange(e, 'currentPhone')}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={inputStyle}
              placeholder="Current phone number"
              required
            />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: isDarkMode ? '#e5e7eb' : '#374151' }}>
              New Phone Number
            </h3>
            <input
              type="tel"
              value={profileData.newPhone}
              onChange={(e) => handleProfileInputChange(e, 'newPhone')}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={inputStyle}
              placeholder="New phone number"
              required
            />
          </div>
        </div>

        <button
          onClick={handleProfileUpdate}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? '⏳ Updating...' : '✅ Update Profile Information'}
        </button>
      </div>

      {/* Password Change Section */}
      <div style={{
        background: isDarkMode ? '#1f2937' : '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: isDarkMode 
          ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: isDarkMode ? '#f9fafb' : '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔒 Change Password
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: isDarkMode ? '#e5e7eb' : '#374151' }}>
              Current Password
            </h3>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => handlePasswordInputChange(e, 'currentPassword')}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={inputStyle}
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: isDarkMode ? '#e5e7eb' : '#374151' }}>
              New Password
            </h3>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => handlePasswordInputChange(e, 'newPassword')}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={inputStyle}
              placeholder="Enter new password"
              required
            />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '12px', color: isDarkMode ? '#e5e7eb' : '#374151' }}>
              Confirm New Password
            </h3>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => handlePasswordInputChange(e, 'confirmPassword')}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              style={inputStyle}
              placeholder="Confirm new password"
              required
            />
          </div>
        </div>

        <button
          onClick={handlePasswordChange}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? '⏳ Changing...' : '🔐 Change Password'}
        </button>
      </div>

      {/* Account Deletion Section */}
      <div style={{
        background: isDarkMode ? '#7f1d1d' : '#fef2f2',
        borderRadius: '16px',
        padding: '24px',
        border: `2px solid ${isDarkMode ? '#dc2626' : '#fecaca'}`,
        boxShadow: isDarkMode 
          ? '0 4px 6px rgba(127, 29, 29, 0.3)' 
          : '0 4px 6px rgba(254, 242, 242, 0.3)'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '16px',
          color: isDarkMode ? '#fca5a5' : '#dc2626',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ Danger Zone
        </h2>
        <p style={{
          color: isDarkMode ? '#fca5a5' : '#dc2626',
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleAccountDeletion}
          disabled={loading}
          style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #dc2626, #b91c1c)' 
              : 'linear-gradient(135deg, #ef4444, #dc2626)',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px',
            padding: '14px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 6px rgba(239, 68, 68, 0.3)'
          }}
        >
          {loading ? '⏳ Deleting...' : '🗑️ Delete My Account'}
        </button>
      </div>
    </div>
  );
};

export default MyProfile;