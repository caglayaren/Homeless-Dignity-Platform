import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// useTheme hook'u - diğer sayfalar için
export const useTheme = () => {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    // Başlangıçta her zaman light mode, kullanıcı toggle'a basarsa değişir
    const saved = localStorage.getItem('darkMode');
    if (saved) {
      setIsDark(JSON.parse(saved));
    }

    // Global değişiklikleri dinle
    const handleStorageChange = () => {
      const saved = localStorage.getItem('darkMode');
      if (saved) {
        setIsDark(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for same-tab updates
    const handleThemeChange = (e: CustomEvent) => {
      setIsDark(e.detail);
    };
    
    window.addEventListener('themeChange', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange as EventListener);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('darkMode', JSON.stringify(newTheme));
    
    // Trigger custom event for same-tab updates
    window.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }));
  };

  return {
    isDark,
    toggleTheme
  };
};

// Dark Mode Toggle Component for Layout
const DarkModeToggle = ({ isDarkMode, toggleDarkMode }: { isDarkMode: boolean; toggleDarkMode: () => void }) => (
  <button
    onClick={toggleDarkMode}
    style={{
      position: 'fixed',
      top: '12px',
      right: '130px', // Dashboard toggle'dan farklı pozisyon
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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const { isDark, toggleTheme } = useTheme(); // useTheme hook'unu kullan

  // Global body styling için useEffect
  React.useEffect(() => {
    // Body margin/padding sıfırla ve background ayarla
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.backgroundColor = isDark ? '#1f2937' : '#f9fafb';
    
    // HTML element için de aynı ayarlar
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.backgroundColor = isDark ? '#1f2937' : '#f9fafb';
    
    // Box-sizing'i border-box yap
    document.documentElement.style.boxSizing = 'border-box';
    
    return () => {
      // Cleanup - varsayılan değerlere dön
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.backgroundColor = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [isDark]);

  // ✅ DÜZELTİLMİŞ Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('userType');
    window.location.href = '/login';
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Services', href: '/services', icon: '📍' },
    { name: 'Identity', href: '/identity', icon: '👤' },
    { name: 'Case Worker', href: '/caseworker', icon: '💬' },
    { name: 'Jobs', href: '/jobs', icon: '💼' },
    { name: 'My Profile', href: '/MyProfile', icon: '⚙️' }
  ];

  const navStyle = {
    background: isDark ? '#374151' : '#ffffff',
    borderBottom: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  };

  const containerStyle = {
    background: isDark ? '#1f2937' : '#f9fafb',
    minHeight: '100vh',
    width: '100vw',
    color: isDark ? '#ffffff' : '#1f2937',
    margin: '0',
    padding: '0',
    boxSizing: 'border-box' as const
  };

  const [windowWidth, setWindowWidth] = React.useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  return (
    <div style={containerStyle}>
      <DarkModeToggle isDarkMode={isDark} toggleDarkMode={toggleTheme} />
      
      <nav style={navStyle}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', height: '64px', alignItems: 'center' }}>
            <div style={{ marginRight: '32px' }}>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#dc2626',
                margin: 0
              }}>
                Dignity Services
              </h1>
            </div>

            {!isMobile && (
              <div style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'center',
                flex: 1
              }}>
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: isActive 
                          ? (isDark ? '#1f2937' : '#fef2f2') 
                          : 'transparent',
                        color: isActive 
                          ? '#dc2626' 
                          : (isDark ? '#d1d5db' : '#4b5563'),
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = '#dc2626';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = isDark ? '#d1d5db' : '#4b5563';
                        }
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {!isMobile && (
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                  }}
                >
                  <span style={{ fontSize: '16px' }}>🚪</span>
                  <span>Logout</span>
                </button>
              )}

              {isMobile && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: isDark ? '#d1d5db' : '#4b5563',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  {isMobileMenuOpen ? '✕' : '☰'}
                </button>
              )}
            </div>
          </div>
        </div>

        {isMobile && isMobileMenuOpen && (
          <div style={{
            borderTop: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`
          }}>
            <div style={{ padding: '8px 16px 12px' }}>
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '16px',
                      fontWeight: '500',
                      background: isActive 
                        ? (isDark ? '#1f2937' : '#fef2f2') 
                        : 'transparent',
                      color: isActive 
                        ? '#dc2626' 
                        : (isDark ? '#d1d5db' : '#4b5563'),
                      marginBottom: '4px'
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '500',
                  width: '100%',
                  marginTop: '8px'
                }}
              >
                <span style={{ fontSize: '18px' }}>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px 16px'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;