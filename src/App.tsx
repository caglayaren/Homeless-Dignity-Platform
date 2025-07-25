import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Identity from './pages/Identity';
import CaseWorker from './pages/CaseWorker';
import Jobs from './pages/Jobs';
import MyProfile from './pages/MyProfile';
import Login from './pages/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';

function App(): JSX.Element {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <Routes>
            {/* Login Route - Basit kontrol */}
            <Route
              path="/login"
              element={<LoginRouteWrapper />}
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={<AdminProtectedRouteWrapper />}
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={<ProtectedRouteWrapper><Dashboard /></ProtectedRouteWrapper>}
            />

            <Route
              path="/services"
              element={<ProtectedRouteWrapper><Services /></ProtectedRouteWrapper>}
            />

            <Route
              path="/identity"
              element={<ProtectedRouteWrapper><Identity /></ProtectedRouteWrapper>}
            />

            <Route
              path="/caseworker"
              element={<ProtectedRouteWrapper><CaseWorker /></ProtectedRouteWrapper>}
            />

            <Route
              path="/caseworkers"
              element={<ProtectedRouteWrapper><CaseWorker /></ProtectedRouteWrapper>}
            />

            <Route
              path="/jobs"
              element={<ProtectedRouteWrapper><Jobs /></ProtectedRouteWrapper>}
            />

            <Route
              path="/MyProfile"
              element={<ProtectedRouteWrapper><MyProfile /></ProtectedRouteWrapper>}
            />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

// ✅ Basit login route wrapper
const LoginRouteWrapper = () => {
  const authToken = localStorage.getItem('authToken');
  const adminToken = localStorage.getItem('adminToken');
  
  console.log('🟡 LoginRoute - authToken:', authToken, 'adminToken:', adminToken);
  
  // Admin token varsa admin'e git
  if (adminToken && adminToken !== 'null' && adminToken.length > 5) {
    console.log('🔀 Login: Redirecting to admin');
    return <Navigate to="/admin" replace />;
  }
  
  // Auth token varsa dashboard'a git  
  if (authToken && authToken !== 'null' && authToken.length > 5) {
    console.log('🔀 Login: Redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }
  
  // Token yoksa login göster
  console.log('📋 Login: Showing login page');
  return <Login />;
};

// ✅ Protected route wrapper
const ProtectedRouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  
  console.log('🔐 ProtectedRoute - authToken:', authToken);
  
  if (!authToken || authToken === 'null' || authToken.length < 5) {
    console.log('🔀 Protected: Redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Protected: Access granted');
  return <Layout>{children}</Layout>;
};

// ✅ Admin protected route wrapper
const AdminProtectedRouteWrapper = () => {
  const adminToken = localStorage.getItem('adminToken');
  
  console.log('👑 AdminRoute - adminToken:', adminToken);
  
  if (!adminToken || adminToken === 'null' || adminToken.length < 5) {
    console.log('🔀 Admin: Redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Admin: Access granted');
  return <AdminDashboard />;
};

export default App;