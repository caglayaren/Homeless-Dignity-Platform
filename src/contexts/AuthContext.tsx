// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API functions
const authAPI = {
  login: async (phoneNumber: string, password: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // JWT token'ı localStorage'a kaydet
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('currentUserId', result.user.id.toString());
        return result.user;
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;

      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        return result.user;
      } else {
        // Token geçersiz, temizle
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUserId');
        return null;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUserId');
      return null;
    }
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde kullanıcıyı kontrol et
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          setUser({
            id: currentUser.id.toString(),
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            phoneNumber: currentUser.phoneNumber || '',
            name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User'
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (phoneNumber: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      console.log('🚀 Frontend: Starting login request');
      console.log('📱 Phone:', phoneNumber);
      
      const response = await fetch('http://localhost:3000/api/auth/login1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, password })
      });
      
      console.log('📡 Response status:', response.status);
      
      const result = await response.json();
      console.log('📦 Response data:', result);
      
      if (result.success && result.token) {
        console.log('✅ Login successful, saving token');
        console.log('🎫 Token:', result.token);
        
        // JWT token'ı localStorage'a kaydet
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('currentUserId', result.user.id.toString());
        
        console.log('💾 Token saved to localStorage');
        
        setUser({
          id: result.user.id.toString(),
          firstName: result.user.firstName || '',
          lastName: result.user.lastName || '',
          phoneNumber: result.user.phoneNumber || '',
          name: `${result.user.firstName || ''} ${result.user.lastName || ''}`.trim() || 'User'
        });
        
        // Manual redirect
        console.log('🔀 Redirecting to dashboard...');
        window.location.href = '/dashboard';
        
        return true;
      } else {
        console.error('❌ Login failed:', result.message);
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUserId');
    setUser(null);
    
    // Login sayfasına yönlendir
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};