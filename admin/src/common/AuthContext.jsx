import { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/admin/auth/login', { email, password });
    return response.data.data; // { adminId, message }
  };

  const verifyOtp = async (adminId, otp) => {
    const response = await api.post('/admin/auth/verify-otp', { adminId, otp });
    const { accessToken, refreshToken, admin: adminData } = response.data.data;

    // Store in localStorage
    localStorage.setItem('adminToken', accessToken);
    localStorage.setItem('adminRefreshToken', refreshToken);
    localStorage.setItem('adminUser', JSON.stringify(adminData));

    // Update state
    setToken(accessToken);
    setAdmin(adminData);
    setIsAuthenticated(true);

    return response.data.data;
  };

  const logout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  const hasPermission = (permission) => {
    if (!admin?.permissions) return false;
    return admin.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated,
        permissions: admin?.permissions || [],
        login,
        verifyOtp,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
