import React, { useState, useEffect } from 'react';

// TypeScript interfaces
interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  address: string;
  type: string;
  latitude?: number;
  longitude?: number;
  contactPhone?: string;
  contactEmail?: string;
  createdAt: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  description: string;
  salary?: string;
  requirements?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
}

interface AppliedJob {
  id: number;
  jobId: number;
  userId: number;
  status: string;
  appliedAt: string;
  job?: {
    title: string;
    company: string;
    location: string;
    type: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
  };
}

interface AppliedService {
  id: number;
  serviceId: number;
  userId: number;
  status: string;
  appliedAt: string;
  service?: {
    name: string;
    type: string;
    address: string;
  };
  user?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    email?: string;
  };
}

interface Document {
  id: number;
  name?: string;
  type?: string;
  verified: boolean;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  type: string;
  status: string;
  location?: string;
  caseWorkerName?: string;
  purpose?: string;
  createdAt: string;
  user?: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  };
}

// Updated Stats interface
interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalServices: number;
  totalJobs: number;
  totalDocuments: number;
  pendingDocuments: number;
  totalMessages: number;
  totalAppointments: number;
  appliedJobs: number;
  appliedServices: number;
}

interface Activity {
  message: string;
  phone?: string;
  timestamp: string;
  icon: string;
}

type TabType = 'overview' | 'users' | 'applied-jobs' | 'applied-services' | 'documents' | 'appointments';

// Theme interface
interface Theme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

const ProfessionalAdminDashboard: React.FC = () => {
  // API Base URL - Production için değiştirin
  const API_BASE = 'http://localhost:3000/api';

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Updated stats state
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalServices: 0,
    totalJobs: 0,
    totalDocuments: 0,
    pendingDocuments: 0,
    totalMessages: 0,
    totalAppointments: 0,
    appliedJobs: 0,
    appliedServices: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
  const [appliedServices, setAppliedServices] = useState<AppliedService[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // Updated RED-WHITE THEME (original colors preserved)
  const lightTheme: Theme = {
    primary: '#dc2626', // Red-600
    secondary: '#991b1b', // Red-800
    accent: '#fca5a5', // Red-300
    background: '#fefefe', // Almost white
    surface: '#ffffff', // Pure white
    text: '#1f2937', // Gray-800
    textSecondary: '#6b7280', // Gray-500
    border: '#f3f4f6', // Gray-100
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  };

  const darkTheme: Theme = {
    primary: '#ef4444', // Red-500
    secondary: '#dc2626', // Red-600
    accent: '#991b1b', // Red-800
    background: '#1f1f1f', // Dark background
    surface: '#2d2d2d', // Dark surface
    text: '#f8fafc', // Slate-50
    textSecondary: '#cbd5e1', // Slate-300
    border: '#4b5563', // Gray-600
    success: '#34d399',
    warning: '#fbbf24',
    error: '#f87171',
    info: '#60a5fa'
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // LOGOUT FUNCTION
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
  };

  // Updated API call helper for real backend
  const apiCall = async (endpoint: string): Promise<any> => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return { data: result.data };
      } else {
        throw new Error(result.message || 'API call failed');
      }
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  // Load all data
  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const [
        statsData,
        usersData,
        appliedJobsData,
        appliedServicesData,
        documentsData,
        appointmentsData,
        activityData
      ] = await Promise.all([
        apiCall('/admin/stats'),
        apiCall('/admin/users'),
        apiCall('/admin/applied-jobs'),
        apiCall('/admin/applied-services'),
        apiCall('/admin/documents'),
        apiCall('/admin/appointments'),
        apiCall('/admin/recent-activity')
      ]);

      setStats(statsData.data);
      setUsers(usersData.data || []);
      setAppliedJobs(appliedJobsData.data || []);
      setAppliedServices(appliedServicesData.data || []);
      setDocuments(documentsData.data || []);
      setAppointments(appointmentsData.data || []);
      setRecentActivity(activityData.data || []);

    } catch (err) {
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount with admin token check
  useEffect(() => {
    // Admin token kontrolü
    const token = localStorage.getItem('adminToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    loadData();
  }, []);

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    const colors: { [key: string]: string } = {
      'active': theme.success,
      'inactive': theme.error,
      'pending': theme.warning,
      'applied': theme.info,
      'approved': theme.success,
      'rejected': theme.error,
      'completed': theme.success,
      'scheduled': theme.info,
      'cancelled': theme.error,
      'verified': theme.success,
      'unverified': theme.warning
    };
    return colors[status] || theme.textSecondary;
  };

  // Updated user status update function
  const updateUserStatus = async (userId: number, isActive: boolean): Promise<void> => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const result = await response.json();
      
      if (result.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, isActive } : user
          )
        );
        alert(`User ${isActive ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (err) {
      console.error('Error updating user status:', err);
      alert('Failed to update user status');
    }
  };

  // Updated document verification function
  const verifyDocument = async (docId: number, verified: boolean): Promise<void> => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE}/admin/documents/${docId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ verified }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify document');
      }

      const result = await response.json();
      
      if (result.success) {
        setDocuments(prevDocs => 
          prevDocs.map(doc => 
            doc.id === docId ? { ...doc, verified } : doc
          )
        );
        alert(`Document ${verified ? 'verified' : 'unverified'} successfully!`);
      }
    } catch (err) {
      console.error('Error verifying document:', err);
      alert('Failed to verify document');
    }
  };

  // Loading screen
  if (loading && users.length === 0) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh', 
          background: theme.background,
          color: theme.text
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{
              width: '64px',
              height: '64px',
              border: `4px solid ${theme.border}`,
              borderTop: `4px solid ${theme.primary}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }}
          ></div>
          <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Loading admin dashboard...
          </p>
          <p style={{ fontSize: '14px', color: theme.textSecondary }}>
            Please wait while we fetch your data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.background }}>
      {/* Left Sidebar */}
      <div 
        style={{
          width: '280px',
          background: theme.surface,
          borderRight: `1px solid ${theme.border}`,
          padding: '24px 20px',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          boxShadow: isDarkMode 
            ? '4px 0 6px -1px rgba(0, 0, 0, 0.1)' 
            : '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div 
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              boxShadow: `0 4px 12px ${theme.primary}30`
            }}
          >
            <span style={{ fontSize: '50px' }}>👩🏻‍💻</span>
          </div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            margin: 0,
            color: theme.text,
            lineHeight: '1.2'
          }}>
            Admin Dashboard
          </h2>
          <p style={{ 
            fontSize: '13px', 
            color: theme.textSecondary, 
            margin: '4px 0 0 0',
            fontWeight: '500'
          }}>
            Dignity Services Platform
          </p>
        </div>

        {/* Navigation - Updated with new counts */}
        <nav style={{ marginBottom: '24px' }}>
          {[
            { id: 'overview' as TabType, label: 'Overview', icon: '📊' },
            { id: 'users' as TabType, label: 'Users', icon: '👥', count: stats.totalUsers },
            { id: 'applied-jobs' as TabType, label: 'Applied Jobs', icon: '💼', count: stats.appliedJobs },
            { id: 'applied-services' as TabType, label: 'Applied Services', icon: '🔧', count: stats.appliedServices },
            { id: 'documents' as TabType, label: 'Documents', icon: '📄', count: stats.pendingDocuments },
            { id: 'appointments' as TabType, label: 'Appointments', icon: '📅', count: stats.totalAppointments }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                marginBottom: '4px',
                background: activeTab === item.id 
                  ? `linear-gradient(135deg, ${theme.primary}15, ${theme.primary}10)` 
                  : 'transparent',
                border: activeTab === item.id 
                  ? `1px solid ${theme.primary}30` 
                  : '1px solid transparent',
                borderRadius: '8px',
                color: activeTab === item.id ? theme.primary : theme.text,
                fontSize: '14px',
                fontWeight: activeTab === item.id ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = `${theme.primary}08`;
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.count !== undefined && (
                <span style={{
                  background: activeTab === item.id 
                    ? theme.primary 
                    : `${theme.primary}20`,
                  color: activeTab === item.id ? 'white' : theme.primary,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            background: `${theme.primary}10`,
            border: `1px solid ${theme.primary}20`,
            color: theme.text,
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '16px' }}>{isDarkMode ? '☀️' : '🌙'}</span>
          <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            background: loading 
              ? `${theme.textSecondary}20` 
              : `${theme.success}15`,
            border: `1px solid ${loading ? theme.textSecondary : theme.success}30`,
            color: loading ? theme.textSecondary : theme.success,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <span style={{ fontSize: '16px' }}>{loading ? '🔄' : '⟳'}</span>
          <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            marginBottom: '24px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            background: `${theme.error}15`,
            border: `1px solid ${theme.error}30`,
            color: theme.error,
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '16px' }}>🚪</span>
          <span>Logout</span>
        </button>

        {/* Admin Info */}
        <div 
          style={{
            padding: '16px',
            borderRadius: '8px',
            border: `1px solid ${theme.border}`,
            background: `${theme.primary}08`
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                color: 'white'
              }}
            >
              👩🏻‍💻
            </div>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: theme.text }}>
                Admin User
              </p>
              <p style={{ fontSize: '12px', fontWeight: '500', margin: 0, color: theme.textSecondary }}>
                05428881755
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        flex: 1, 
        marginLeft: '280px', 
        padding: '50px',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: theme.text }}>
              {activeTab === 'applied-jobs' ? 'Applied Jobs' : 
               activeTab === 'applied-services' ? 'Applied Services' :
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p style={{ fontSize: '14px', fontWeight: '500', margin: '4px 0 0 0', color: theme.textSecondary }}>
              Real-time data • Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          
          {error && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                background: `${theme.error}15`,
                border: `1px solid ${theme.error}30`,
                color: theme.error
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px', 
              marginBottom: '32px' 
            }}>
              {[
                { 
                  title: 'Total Users', 
                  value: stats.totalUsers, 
                  icon: '👥', 
                  color: theme.info,
                  bgGradient: `linear-gradient(135deg, ${theme.info}20, ${theme.info}10)`
                },
                { 
                  title: 'Active Users', 
                  value: stats.activeUsers, 
                  icon: '✅', 
                  color: theme.success,
                  bgGradient: `linear-gradient(135deg, ${theme.success}20, ${theme.success}10)`
                },
                { 
                  title: 'Applied Jobs', 
                  value: stats.appliedJobs, 
                  icon: '💼', 
                  color: theme.warning,
                  bgGradient: `linear-gradient(135deg, ${theme.warning}20, ${theme.warning}10)`
                },
                { 
                  title: 'Pending Documents', 
                  value: stats.pendingDocuments, 
                  icon: '📄', 
                  color: theme.error,
                  bgGradient: `linear-gradient(135deg, ${theme.error}20, ${theme.error}10)`
                }
              ].map((stat, index) => (
                <div 
                  key={index} 
                  style={{
                    padding: '24px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.border}`,
                    background: theme.surface,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isDarkMode 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = isDarkMode 
                      ? '0 8px 25px -5px rgba(0, 0, 0, 0.2)' 
                      : '0 8px 25px -5px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isDarkMode 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      : '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: theme.textSecondary }}>
                      {stat.title}
                    </h3>
                    <div 
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        background: stat.bgGradient,
                        border: `1px solid ${stat.color}20`
                      }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <p style={{ fontSize: '32px', fontWeight: '700', margin: 0, color: stat.color }}>
                      {stat.value}
                    </p>
                    <span style={{ fontSize: '12px', fontWeight: '500', color: theme.textSecondary }}>
                      total
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div 
              style={{
                padding: '24px',
                borderRadius: '12px',
                border: `1px solid ${theme.border}`,
                background: theme.surface,
                boxShadow: isDarkMode 
                  ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: theme.text }}>
                  Recent Activity
                </h3>
                <div 
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    background: `${theme.primary}15`,
                    border: `1px solid ${theme.primary}30`,
                    color: theme.primary
                  }}
                >
                  LIVE
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div 
                    key={index} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      background: `${theme.primary}05`,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div 
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        background: `${theme.primary}15`,
                        border: `1px solid ${theme.primary}30`
                      }}
                    >
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: theme.text }}>
                        {activity.message}
                      </p>
                      {activity.phone && (
                        <p style={{ fontSize: '12px', fontWeight: '500', margin: '4px 0 0 0', color: theme.textSecondary }}>
                          📱 {activity.phone}
                        </p>
                      )}
                    </div>
                    <div 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '500',
                        background: `${theme.textSecondary}15`,
                        color: theme.textSecondary
                      }}
                    >
                      {formatDate(activity.timestamp)}
                    </div>
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: theme.textSecondary }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📊</div>
                    <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No recent activity</p>
                    <p style={{ fontSize: '14px', opacity: 0.7 }}>Activity will appear here as users interact with the platform</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div 
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              boxShadow: isDarkMode 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: theme.text }}>
                Registered Users ({users.length})
              </h3>
              <button
                onClick={loadData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: `${theme.primary}10` }}>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>USER</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>CONTACT</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>JOINED</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>STATUS</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr 
                      key={user.id} 
                      style={{ 
                        borderBottom: `1px solid ${theme.border}`,
                        background: index % 2 === 0 ? 'transparent' : `${theme.primary}05`
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div 
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600',
                              background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`
                            }}
                          >
                            {user.firstName?.[0] || 'U'}{user.lastName?.[0] || 'U'}
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: theme.text }}>
                              {user.firstName || 'Unknown'} {user.lastName || 'User'}
                            </p>
                            <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '500', margin: 0, color: theme.text }}>
                          {user.email || 'No email'}
                        </p>
                        <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                          {user.phoneNumber || 'No phone'}
                        </p>
                      </td>
                      <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: theme.text }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span 
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: user.isActive ? `${theme.success}20` : `${theme.error}20`,
                            color: user.isActive ? theme.success : theme.error,
                            border: `1px solid ${user.isActive ? theme.success : theme.error}30`
                          }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => updateUserStatus(user.id, !user.isActive)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: 'white',
                            background: user.isActive 
                              ? `linear-gradient(135deg, ${theme.error}, ${theme.error}dd)` 
                              : `linear-gradient(135deg, ${theme.success}, ${theme.success}dd)`,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Applied Jobs Tab */}
        {activeTab === 'applied-jobs' && (
          <div 
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              boxShadow: isDarkMode 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: theme.text }}>
                Applied Jobs ({appliedJobs.length})
              </h3>
              <button
                onClick={loadData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>

            {appliedJobs.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: `${theme.primary}10` }}>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>JOB</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>APPLICANT</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>APPLIED DATE</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>STATUS</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>CONTACT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedJobs.map((application, index) => (
                      <tr 
                        key={application.id} 
                        style={{ 
                          borderBottom: `1px solid ${theme.border}`,
                          background: index % 2 === 0 ? 'transparent' : `${theme.primary}05`
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div 
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                background: `linear-gradient(135deg, ${theme.warning}, ${theme.warning}dd)`
                              }}
                            >
                              💼
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: theme.text }}>
                                {application.job?.title || 'Unknown Job'}
                              </p>
                              <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                                {application.job?.company || 'Unknown Company'} • {application.job?.location || 'Unknown Location'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: theme.text }}>
                            {application.user?.firstName || 'Unknown'} {application.user?.lastName || 'User'}
                          </p>
                          <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                            ID: {application.userId}
                          </p>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: theme.text }}>
                          {formatDate(application.appliedAt)}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span 
                            style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: `${getStatusColor(application.status)}20`,
                              color: getStatusColor(application.status),
                              border: `1px solid ${getStatusColor(application.status)}30`
                            }}
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontSize: '12px', margin: 0, color: theme.text }}>
                            📧 {application.user?.email || 'No email'}
                          </p>
                          <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                            📱 {application.user?.phoneNumber || 'No phone'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>💼</div>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                  No Job Applications Yet
                </p>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>
                  Job applications will appear here when users apply for positions
                </p>
              </div>
            )}
          </div>
        )}

        {/* Applied Services Tab */}
        {activeTab === 'applied-services' && (
          <div 
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              boxShadow: isDarkMode 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: theme.text }}>
                Applied Services ({appliedServices.length})
              </h3>
              <button
                onClick={loadData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>

            {appliedServices.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: `${theme.primary}10` }}>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>SERVICE</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>APPLICANT</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>APPLIED DATE</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>STATUS</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>CONTACT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appliedServices.map((application, index) => (
                      <tr 
                        key={application.id} 
                        style={{ 
                          borderBottom: `1px solid ${theme.border}`,
                          background: index % 2 === 0 ? 'transparent' : `${theme.primary}05`
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div 
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}dd)`
                              }}
                            >
                              🔧
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: theme.text }}>
                                {application.service?.name || 'Unknown Service'}
                              </p>
                              <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                                {application.service?.type || 'Unknown Type'} • {application.service?.address || 'Unknown Address'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: theme.text }}>
                            {application.user?.firstName || 'Unknown'} {application.user?.lastName || 'User'}
                          </p>
                          <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                            ID: {application.userId}
                          </p>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: theme.text }}>
                          {formatDate(application.appliedAt)}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span 
                            style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: `${getStatusColor(application.status)}20`,
                              color: getStatusColor(application.status),
                              border: `1px solid ${getStatusColor(application.status)}30`
                            }}
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontSize: '12px', margin: 0, color: theme.text }}>
                            📧 {application.user?.email || 'No email'}
                          </p>
                          <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                            📱 {application.user?.phoneNumber || 'No phone'}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>🔧</div>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                  No Service Applications Yet
                </p>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>
                  Service applications will appear here when users apply for services
                </p>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div 
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              boxShadow: isDarkMode 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: theme.text }}>
                Documents ({documents.length})
              </h3>
              <button
                onClick={loadData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>

            {documents.length > 0 ? (
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: `${theme.primary}10` }}>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>DOCUMENT</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>USER</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>UPLOADED</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>STATUS</th>
                      <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((document, index) => (
                      <tr 
                        key={document.id} 
                        style={{ 
                          borderBottom: `1px solid ${theme.border}`,
                          background: index % 2 === 0 ? 'transparent' : `${theme.primary}05`
                        }}
                      >
                        <td style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div 
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px',
                                background: `linear-gradient(135deg, ${theme.info}, ${theme.info}dd)`
                              }}
                            >
                              📄
                            </div>
                            <div>
                              <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: theme.text }}>
                                {document.name || 'Unnamed Document'}
                              </p>
                              <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                                Type: {document.type || 'Unknown'} • ID: {document.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: theme.text }}>
                            {document.user?.firstName || 'Unknown'} {document.user?.lastName || 'User'}
                          </p>
                          <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                            📱 {document.user?.phoneNumber || 'No phone'}
                          </p>
                        </td>
                        <td style={{ padding: '16px', fontSize: '13px', fontWeight: '500', color: theme.text }}>
                          {formatDate(document.createdAt)}
                        </td>
                        <td style={{ padding: '16px' }}>
                          <span 
                            style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              background: document.verified ? `${theme.success}20` : `${theme.warning}20`,
                              color: document.verified ? theme.success : theme.warning,
                              border: `1px solid ${document.verified ? theme.success : theme.warning}30`
                            }}
                          >
                            {document.verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <button
                            onClick={() => verifyDocument(document.id, !document.verified)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: '600',
                              color: 'white',
                              background: document.verified 
                                ? `linear-gradient(135deg, ${theme.warning}, ${theme.warning}dd)` 
                                : `linear-gradient(135deg, ${theme.success}, ${theme.success}dd)`,
                              border: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {document.verified ? 'Unverify' : 'Verify'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📄</div>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                  No Documents Yet
                </p>
                <p style={{ fontSize: '14px', opacity: 0.7 }}>
                  Documents will appear here when users upload them
                </p>
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div 
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: `1px solid ${theme.border}`,
              background: theme.surface,
              boxShadow: isDarkMode 
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0, color: theme.text }}>
              Case Worker Appointments ({appointments.length})
            </h3>
            <button
              onClick={loadData}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'white',
                background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>

          {appointments.length > 0 ? (
            <div style={{ overflowX: 'auto', borderRadius: '8px', border: `1px solid ${theme.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: `${theme.primary}10` }}>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>APPOINTMENT</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>CLIENT</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>DATE & TIME</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>STATUS</th>
                    <th style={{ textAlign: 'left', padding: '16px', fontSize: '12px', fontWeight: '600', color: theme.text }}>CASE WORKER</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment, index) => (
                    <tr 
                      key={appointment.id} 
                      style={{ 
                        borderBottom: `1px solid ${theme.border}`,
                        background: index % 2 === 0 ? 'transparent' : `${theme.primary}05`
                      }}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div 
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              background: `linear-gradient(135deg, ${theme.info}, ${theme.info}dd)`
                            }}
                          >
                            📅
                          </div>
                          <div>
                            <p style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: theme.text }}>
                              {appointment.type || 'General Appointment'}
                            </p>
                            <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                              {appointment.purpose || 'No purpose specified'} • {appointment.location || 'Location TBD'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: theme.text }}>
                          {appointment.user?.firstName || 'Unknown'} {appointment.user?.lastName || 'Client'}
                        </p>
                        <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                          📱 {appointment.user?.phoneNumber || 'No phone'}
                        </p>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: theme.text }}>
                          {appointment.date}
                        </p>
                        <p style={{ fontSize: '12px', margin: 0, color: theme.textSecondary }}>
                          🕐 {appointment.time}
                        </p>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span 
                          style={{
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: `${getStatusColor(appointment.status)}20`,
                            color: getStatusColor(appointment.status),
                            border: `1px solid ${getStatusColor(appointment.status)}30`
                          }}
                        >
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: theme.text }}>
                          {appointment.caseWorkerName || 'Not Assigned'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: theme.textSecondary }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📅</div>
              <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: theme.text }}>
                No Appointments Scheduled
              </p>
              <p style={{ fontSize: '14px', opacity: 0.7 }}>
                Case worker appointments will appear here when scheduled
              </p>
            </div>
          )}
        </div>
      )}
    </div>

    {/* CSS for animations */}
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);
};
export default ProfessionalAdminDashboard;