import React, { useState, useEffect } from 'react';

// Dark Mode Toggle Component
const DarkModeToggle = ({ isDarkMode, toggleDarkMode }) => (
  <button
    onClick={toggleDarkMode}
    style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
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
);

const Login = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dark mode initialization
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode-login');
    setIsDarkMode(savedDarkMode === 'true');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode-login', newMode.toString());
  };

  const API_BASE = 'http://localhost:3000/api';

  const isValidPhoneNumber = (phone) => {
    const cleanPhone = phone.replace(/\s/g, '');
    const globalPhoneRegex = /^(\+\d{1,3})?[0-9]{7,15}$/;
    return globalPhoneRegex.test(cleanPhone) && cleanPhone.length >= 8 && cleanPhone.length <= 18;
  };

  const isValidPassword = (password) => {
    return password.length >= 6;
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { text: '', color: '' };
    if (password.length < 6) return { text: 'Too short', color: '#ef4444' };
    if (password.length >= 6 && password.length < 8) return { text: 'Medium', color: '#f59e0b' };
    return { text: 'Strong', color: '#10b981' };
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      if (!firstName || !lastName || !birthDate || !phoneNumber || !password || !confirmPassword) {
        setError('All fields are required');
        return;
      }

      if (!isValidPhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number (8-15 digits with optional country code)');
        return;
      }

      if (!isValidPassword(password)) {
        setError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          birthDate,
          phoneNumber,
          password,
          confirmPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.token); // ✅ DÜZELTİLDİ
        localStorage.setItem('currentUserId', data.user.id.toString()); // ✅ DÜZELTİLDİ
        localStorage.setItem('user', JSON.stringify(data.user));
        alert('Registration successful! Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ TAMAMEN DÜZELTİLMİŞ handleLogin fonksiyonu
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!phoneNumber || !password) {
        setError('Phone number and password are required');
        return;
      }
      
      if (!isValidPhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number');
        return;
      }
      
      console.log('🚀 Login attempt started');
      console.log('📱 Phone:', phoneNumber);
      
      // ✅ ADMIN TELEFON NUMARASI KONTROLÜ
      const isAdmin = phoneNumber === '05428881755';
      
      // ✅ login1 endpoint kullan (AuthContext ile uyumlu)
      const endpoint = '/auth/login1';
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber,
          password
        })
      });
      
      console.log('📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success && data.token) {
        console.log('✅ Login successful, saving token');
        console.log('🎫 Token:', data.token);
        
        // ✅ DOĞRU localStorage keys kullan
        if (isAdmin) {
          // Admin login
          localStorage.setItem('adminToken', data.token); // ✅ adminToken
          localStorage.setItem('userType', 'admin');
          localStorage.setItem('user', JSON.stringify(data.user));
          
          console.log('👑 Admin login successful, redirecting to /admin');
          window.location.href = '/admin';
        } else {
          // Normal user login
          localStorage.setItem('authToken', data.token); // ✅ authToken (AuthContext bekliyor)
          localStorage.setItem('currentUserId', data.user.id.toString());
          localStorage.setItem('userType', 'user');
          localStorage.setItem('user', JSON.stringify(data.user));
          
          console.log('👤 User login successful, redirecting to /dashboard');
          window.location.href = '/dashboard';
        }
      } else {
        console.error('❌ Login failed:', data.message);
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isNewUser) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = confirmPassword === '' || password === confirmPassword;

  return (
    <div style={{
      minHeight: '100vh',
      background: isDarkMode 
        ? 'linear-gradient(135deg, #111827, #1f2937)'
        : 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      
      <div style={{
        background: isDarkMode ? '#1f2937' : 'white',
        borderRadius: '16px',
        boxShadow: isDarkMode 
          ? '0 20px 25px rgba(0, 0, 0, 0.4)'
          : '0 20px 25px rgba(0, 0, 0, 0.1)',
        padding: '48px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: `1px solid ${isDarkMode ? '#374151' : 'transparent'}`
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
              : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: isDarkMode
              ? '0 10px 15px rgba(30, 64, 175, 0.4)'
              : '0 10px 15px rgba(59, 130, 246, 0.3)'
          }}>
            <span style={{ fontSize: '36px' }}>🏠</span>
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f9fafb' : '#1f2937',
            marginBottom: '8px'
          }}>
            Dignity Services Platform
          </h1>
          <p style={{ color: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: '16px' }}>
            {isNewUser ? 'Create your new account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: isDarkMode 
              ? 'linear-gradient(135deg, #7f1d1d, #991b1b)'
              : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: `1px solid ${isDarkMode ? '#dc2626' : '#fecaca'}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '24px'
          }}>
            <p style={{ color: isDarkMode ? '#fca5a5' : '#dc2626', fontSize: '14px', margin: 0 }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Toggle Register/Login */}
        <div style={{
          display: 'flex',
          marginBottom: '24px',
          background: isDarkMode ? '#374151' : '#f9fafb',
          borderRadius: '8px',
          padding: '4px'
        }}>
          <button
            onClick={() => setIsNewUser(false)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              background: !isNewUser 
                ? isDarkMode ? '#1f2937' : 'white'
                : 'transparent',
              color: !isNewUser 
                ? isDarkMode ? '#3b82f6' : '#3b82f6'
                : isDarkMode ? '#9ca3af' : '#6b7280',
              boxShadow: !isNewUser ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Login
          </button>
          <button
            onClick={() => setIsNewUser(true)}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              background: isNewUser 
                ? isDarkMode ? '#1f2937' : 'white'
                : 'transparent',
              color: isNewUser 
                ? isDarkMode ? '#3b82f6' : '#3b82f6'
                : isDarkMode ? '#9ca3af' : '#6b7280',
              boxShadow: isNewUser ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {/* Registration Fields */}
        {isNewUser && (
          <>
            {/* Name Fields */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isDarkMode ? '#f3f4f6' : '#374151',
                  marginBottom: '8px'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Your first name"
                  onKeyPress={handleKeyPress}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    background: isDarkMode ? '#374151' : '#ffffff',
                    color: isDarkMode ? '#f9fafb' : '#1f2937'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb'}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isDarkMode ? '#f3f4f6' : '#374151',
                  marginBottom: '8px'
                }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Your last name"
                  onKeyPress={handleKeyPress}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `2px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                    background: isDarkMode ? '#374151' : '#ffffff',
                    color: isDarkMode ? '#f9fafb' : '#1f2937'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb'}
                />
              </div>
            </div>

            {/* Birth Date */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDarkMode ? '#f3f4f6' : '#374151',
                marginBottom: '8px'
              }}>
                Birth Date *
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `2px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  background: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#f9fafb' : '#1f2937'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb'}
              />
            </div>
          </>
        )}

        {/* Phone Number Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: isDarkMode ? '#f3f4f6' : '#374151',
            marginBottom: '8px'
          }}>
            Phone Number *
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              if (e.target.value.length <= 18) {
                setPhoneNumber(e.target.value);
              }
            }}
            placeholder="+1234567890 or 05551234567"
            maxLength={18}
            onKeyPress={handleKeyPress}
            style={{
              width: '100%',
              padding: '16px',
              border: `2px solid ${!phoneNumber 
                ? isDarkMode ? '#4b5563' : '#e5e7eb'
                : isValidPhoneNumber(phoneNumber) 
                  ? '#10b981' 
                  : '#ef4444'}`,
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s',
              boxSizing: 'border-box',
              background: isDarkMode ? '#374151' : '#ffffff',
              color: isDarkMode ? '#f9fafb' : '#1f2937'
            }}
            onFocus={(e) => {
              if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
                e.target.style.borderColor = '#10b981';
              } else {
                e.target.style.borderColor = '#3b82f6';
              }
            }}
            onBlur={(e) => {
              if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
                e.target.style.borderColor = '#ef4444';
              } else if (phoneNumber && isValidPhoneNumber(phoneNumber)) {
                e.target.style.borderColor = '#10b981';
              } else {
                e.target.style.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
              }
            }}
          />
          {phoneNumber && !isValidPhoneNumber(phoneNumber) && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', margin: '4px 0 0 0' }}>
              Please enter a valid phone number (8-15 digits with optional country code)
            </p>
          )}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: isDarkMode ? '#f3f4f6' : '#374151',
            marginBottom: '8px'
          }}>
            Password *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isNewUser ? 'Create a strong password' : 'Enter your password'}
              onKeyPress={handleKeyPress}
              style={{
                width: '100%',
                padding: '16px',
                paddingRight: '50px',
                border: `2px solid ${!password 
                  ? isDarkMode ? '#4b5563' : '#e5e7eb'
                  : isValidPassword(password) 
                    ? '#10b981' 
                    : '#ef4444'}`,
                borderRadius: '12px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
                background: isDarkMode ? '#374151' : '#ffffff',
                color: isDarkMode ? '#f9fafb' : '#1f2937'
              }}
              onFocus={(e) => {
                if (password && isValidPassword(password)) {
                  e.target.style.borderColor = '#10b981';
                } else {
                  e.target.style.borderColor = '#3b82f6';
                }
              }}
              onBlur={(e) => {
                if (password && !isValidPassword(password)) {
                  e.target.style.borderColor = '#ef4444';
                } else if (password && isValidPassword(password)) {
                  e.target.style.borderColor = '#10b981';
                } else {
                  e.target.style.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: isDarkMode ? '#9ca3af' : '#6b7280'
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          
          {isNewUser && (
            <p style={{
              fontSize: '12px',
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              marginTop: '4px',
              margin: '4px 0 8px 0'
            }}>
              💡 Minimum 6 characters
            </p>
          )}
          
          {isNewUser && password && (
            <p style={{
              fontSize: '12px',
              color: passwordStrength.color,
              marginTop: '4px',
              margin: '4px 0 0 0'
            }}>
              {passwordStrength.text}
            </p>
          )}
        </div>

        {/* Confirm Password Field (Only for Registration) */}
        {isNewUser && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: isDarkMode ? '#f3f4f6' : '#374151',
              marginBottom: '8px'
            }}>
              Confirm Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                onKeyPress={handleKeyPress}
                style={{
                  width: '100%',
                  padding: '16px',
                  paddingRight: '50px',
                  border: `2px solid ${!confirmPassword 
                    ? isDarkMode ? '#4b5563' : '#e5e7eb'
                    : passwordsMatch 
                      ? '#10b981' 
                      : '#ef4444'}`,
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                  background: isDarkMode ? '#374151' : '#ffffff',
                  color: isDarkMode ? '#f9fafb' : '#1f2937'
                }}
                onFocus={(e) => {
                  if (confirmPassword && passwordsMatch) {
                    e.target.style.borderColor = '#10b981';
                  } else {
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onBlur={(e) => {
                  if (confirmPassword && !passwordsMatch) {
                    e.target.style.borderColor = '#ef4444';
                  } else if (confirmPassword && passwordsMatch) {
                    e.target.style.borderColor = '#10b981';
                  } else {
                    e.target.style.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: isDarkMode ? '#9ca3af' : '#6b7280'
                }}
              >
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            
            {confirmPassword && !passwordsMatch && (
              <p style={{
                fontSize: '12px',
                color: '#ef4444',
                marginTop: '4px',
                margin: '4px 0 0 0'
              }}>
                Passwords do not match
              </p>
            )}
            {confirmPassword && passwordsMatch && (
              <p style={{
                fontSize: '12px',
                color: '#10b981',
                marginTop: '4px',
                margin: '4px 0 0 0'
              }}>
                ✓ Passwords match
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !phoneNumber || !password || 
            (isNewUser && (!firstName || !lastName || !birthDate || !confirmPassword || !passwordsMatch || !isValidPassword(password))) || 
            !isValidPhoneNumber(phoneNumber)}
          style={{
            width: '100%',
            background: loading
              ? isDarkMode 
                ? 'linear-gradient(135deg, #4b5563, #6b7280)'
                : 'linear-gradient(135deg, #9ca3af, #6b7280)'
              : isNewUser
              ? isDarkMode
                ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
                : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              : isDarkMode
                ? 'linear-gradient(135deg, #047857, #059669)'
                : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: isNewUser
              ? isDarkMode
                ? '0 10px 15px rgba(30, 64, 175, 0.4)'
                : '0 10px 15px rgba(59, 130, 246, 0.3)'
              : isDarkMode
                ? '0 10px 15px rgba(4, 120, 87, 0.4)'
                : '0 10px 15px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s',
            opacity: (!phoneNumber || !password || 
              (isNewUser && (!firstName || !lastName || !birthDate || !confirmPassword || !passwordsMatch || !isValidPassword(password))) || 
              !isValidPhoneNumber(phoneNumber)) ? 0.5 : 1
          }}
        >
          {loading
            ? '⏳ Processing...'
            : isNewUser
            ? '📱 Create Account'
            : '🔐 Sign In'
          }
        </button>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: isDarkMode ? '#374151' : '#f9fafb',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280', margin: 0 }}>
            🔒 Your information is secure and encrypted
          </p>
        </div>

        {/* Emergency Contact - Always Visible */}
        <div style={{
          marginTop: '16px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #7f1d1d, #991b1b)'
            : 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>
            📞 Emergency Contact
          </h3>
          <p style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.9, margin: 0 }}>
            24/7 Crisis Support Hotline
          </p>
          <button 
            onClick={() => window.location.href = 'tel:+1555911HELP'}
            style={{
            width: '100%',
            background: 'white',
            color: isDarkMode ? '#991b1b' : '#dc2626',
            fontWeight: 'bold',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            Call (555) 911-HELP
          </button>
        </div>

        {/* Global Support Notice */}
        <div style={{
          marginTop: '16px',
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
            : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
          border: `1px solid ${isDarkMode ? '#3b82f6' : '#93c5fd'}`,
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌍</div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isDarkMode ? '#dbeafe' : '#1e40af',
            margin: '0 0 8px 0'
          }}>
            Global Support Available
          </h4>
          <p style={{
            fontSize: '12px',
            color: isDarkMode ? '#93c5fd' : '#3730a3',
            margin: 0,
            lineHeight: '1.4'
          }}>
            We support users in Cyprus 🇨🇾, Turkey 🇹🇷, Greece 🇬🇷, UK 🇬🇧, Germany 🇩🇪, USA 🇺🇸 with local services and multilingual support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;