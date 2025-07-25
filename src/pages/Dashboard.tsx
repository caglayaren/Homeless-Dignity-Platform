import React, { useState, useEffect } from 'react';
import { useTheme } from '../components/Layout'; // Layout'tan tema hook'unu import et

// Dark Mode Toggle Component
const DarkModeToggle = ({ isDarkMode, toggleDarkMode }: { isDarkMode: boolean; toggleDarkMode: () => void }) => (
  <button
    onClick={toggleDarkMode}
    style={{
      position: 'fixed',
      top: '12px',
      right: '130px', // Logout butonundan uzaklaştırdık
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

const Dashboard = () => {
  // Layout'tan tema durumunu al
  const { isDark: isDarkMode, toggleTheme } = useTheme();

  // Artık local state'e gerek yok, layout'taki tema durumunu kullanıyoruz
  
  const quickActions = [
    {
      title: 'Find Shelter',
      description: 'Locate available shelters near you',
      icon: '🏠',
      path: '/services',
      color: isDarkMode ? '#dc2626' : '#ef4444',
      bgGradient: isDarkMode
        ? 'linear-gradient(135deg, #7f1d1d, #991b1b)'
        : 'linear-gradient(135deg, #ef4444, #dc2626)'
    },
    {
      title: 'Digital Identity',
      description: 'Access your stored documents',
      icon: '👤',
      path: '/identity',
      color: isDarkMode ? '#3b82f6' : '#3b82f6',
      bgGradient: isDarkMode
        ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
        : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
    },
    {
      title: 'Contact Case Worker',
      description: 'Schedule or message your case worker',
      icon: '💬',
      path: '/caseworker',
      color: isDarkMode ? '#8b5cf6' : '#8b5cf6',
      bgGradient: isDarkMode
        ? 'linear-gradient(135deg, #5b21b6, #7c3aed)'
        : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    },
    {
      title: 'Job Opportunities',
      description: 'Find employment opportunities',
      icon: '💼',
      path: '/jobs',
      color: isDarkMode ? '#10b981' : '#10b981',
      bgGradient: isDarkMode
        ? 'linear-gradient(135deg, #047857, #059669)'
        : 'linear-gradient(135deg, #10b981, #059669)'
    }
  ];

  return (
    <div style={{
      padding: '24px',
      background: 'transparent', // Layout'tan gelen arka planı kullan
      minHeight: 'calc(100vh - 120px)', // Layout'ın padding'ini hesaba kat
      color: isDarkMode ? '#ffffff' : '#1f2937' // Metin rengini ayarla
    }}>
      <DarkModeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleTheme} />
      

      
      {/* Welcome Section */}
      <div style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e40af, #1d4ed8)'
          : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        color: 'white',
        padding: '48px',
        borderRadius: '16px',
        textAlign: 'center',
        marginBottom: '32px',
        boxShadow: isDarkMode
          ? '0 20px 25px rgba(30, 64, 175, 0.3)'
          : '0 20px 25px rgba(59, 130, 246, 0.3)'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏠</div>
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          marginBottom: '8px',
          margin: '0 0 8px 0'
        }}>
          Welcome to Dignity Services
        </h1>
        <p style={{
          fontSize: '18px',
          margin: 0,
          opacity: 0.9
        }}>
          Your comprehensive platform for accessing essential services worldwide
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1f2937, #111827)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: isDarkMode ? '#10b981' : '#dc2626', marginBottom: '4px' }}>
            150+
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: '500' }}>
            Services Available
          </div>
        </div>
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1f2937, #111827)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💼</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: isDarkMode ? '#10b981' : '#dc2626', marginBottom: '4px' }}>
            200+
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: '500' }}>
            Job Opportunities
          </div>
        </div>
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1f2937, #111827)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌍</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: isDarkMode ? '#10b981' : '#dc2626', marginBottom: '4px' }}>
            7
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: '500' }}>
            Countries Supported
          </div>
        </div>
        <div style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1f2937, #111827)'
            : 'linear-gradient(135deg, #ffffff, #f8fafc)',
          padding: '24px',
          borderRadius: '16px',
          border: `1px solid ${isDarkMode ? '#374151' : '#e2e8f0'}`,
          boxShadow: isDarkMode
            ? '0 4px 20px rgba(0,0,0,0.3)'
            : '0 4px 20px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🕒</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: isDarkMode ? '#10b981' : '#dc2626', marginBottom: '4px' }}>
            24/7
          </div>
          <div style={{ fontSize: '14px', color: isDarkMode ? '#9ca3af' : '#64748b', fontWeight: '500' }}>
            Support Available
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: isDarkMode ? '#10b981' : '#dc2626',
        marginBottom: '24px',
        margin: '0 0 24px 0'
      }}>
        🚀 Quick Actions
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {quickActions.map((action, index) => (
          <div
            key={index}
            onClick={() => window.location.href = action.path}
            style={{
              background: isDarkMode
                ? 'linear-gradient(135deg, #1f2937, #111827)'
                : 'white',
              border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
              borderRadius: '16px',
              padding: '28px',
              boxShadow: isDarkMode
                ? '0 8px 30px rgba(0,0,0,0.3)'
                : '0 8px 30px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 12px 40px rgba(0,0,0,0.4)'
                : '0 12px 40px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = isDarkMode
                ? '0 8px 30px rgba(0,0,0,0.3)'
                : '0 8px 30px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{
              background: action.bgGradient,
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: `0 8px 20px ${action.color}40`
            }}>
              <span style={{ fontSize: '28px' }}>{action.icon}</span>
            </div>
            <h3 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: isDarkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              {action.title}
            </h3>
            <p style={{
              color: isDarkMode ? '#9ca3af' : '#6b7280',
              fontSize: '15px',
              lineHeight: '1.5',
              margin: 0
            }}>
              {action.description}
            </p>
            {/* Hover indicator */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: action.bgGradient,
              transform: 'scaleX(0)',
              transition: 'transform 0.3s ease',
              transformOrigin: 'left'
            }} />
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1f2937, #111827)'
          : 'white',
        border: `2px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: isDarkMode
          ? '0 8px 30px rgba(0,0,0,0.3)'
          : '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: isDarkMode ? '#f9fafb' : '#1f2937',
          marginBottom: '16px',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📈 Recent Activity
        </h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: isDarkMode ? '#374151' : '#f8fafc',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🏠</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#f9fafb' : '#1f2937' }}>
                Searched for shelters in Cyprus
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                2 hours ago
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: isDarkMode ? '#374151' : '#f8fafc',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>📄</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#f9fafb' : '#1f2937' }}>
                Updated identity documents
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                1 day ago
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: isDarkMode ? '#374151' : '#f8fafc',
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>💼</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: isDarkMode ? '#f9fafb' : '#1f2937' }}>
                Applied for 3 job positions
              </div>
              <div style={{ fontSize: '12px', color: isDarkMode ? '#9ca3af' : '#6b7280' }}>
                3 days ago
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #7f1d1d, #991b1b)'
          : 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: 'white',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        boxShadow: isDarkMode
          ? '0 10px 25px rgba(127, 29, 29, 0.4)'
          : '0 10px 25px rgba(239, 68, 68, 0.4)'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚨</div>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '12px',
          margin: '0 0 12px 0'
        }}>
          📞 Emergency Contact
        </h2>
        <p style={{
          fontSize: '14px',
          marginBottom: '16px',
          opacity: 0.9,
          margin: '0 0 16px 0'
        }}>
          24/7 Crisis Support Available • Multi-language Support • Confidential
        </p>
        <button
          onClick={() => window.location.href = 'tel:+1555911HELP'}
          style={{
            width: '100%',
            maxWidth: '300px',
            background: 'white',
            color: isDarkMode ? '#991b1b' : '#dc2626',
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            margin: '0 auto',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.2)';
          }}
        >
          📞 Call (555) 911-HELP
        </button>
      </div>

      {/* Quick Tips */}
      <div style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
          : 'linear-gradient(135deg, #eff6ff, #dbeafe)',
        border: `1px solid ${isDarkMode ? '#3b82f6' : '#93c5fd'}`,
        borderRadius: '16px',
        padding: '24px',
        marginTop: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: isDarkMode ? '#dbeafe' : '#1e40af',
          marginBottom: '16px',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          💡 Quick Tips for Using Dignity Services
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          fontSize: '14px',
          color: isDarkMode ? '#93c5fd' : '#3730a3'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🗺️</span>
            <div>
              <strong>Interactive Maps:</strong> Click anywhere on service or job maps to search that exact location using real-time data.
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🤝</span>
            <div>
              <strong>Homeless-Friendly Filter:</strong> Look for the green badges - these employers specifically welcome people experiencing homelessness.
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>📱</span>
            <div>
              <strong>Save Your Documents:</strong> Upload important documents to your digital identity for quick access anywhere.
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <span style={{ fontSize: '16px' }}>🌍</span>
            <div>
              <strong>Global Coverage:</strong> We support 7+ countries with local services and job opportunities in multiple languages.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;