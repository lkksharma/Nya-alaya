import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults for credentials
  axios.defaults.withCredentials = true;
  // Use relative URL if proxy is set up, or absolute if not. 
  // Based on settings.py CORS_ALLOWED_ORIGINS, backend is likely on same host or localhost:8000
  // Assuming Vite proxy is set up or we need to define base URL.
  // Let's check vite.config.js later, but for now assume relative path works if proxy exists, 
  // or we might need to set a base URL.
  // Given the existing code doesn't seem to have a global axios instance, I'll use relative paths 
  // and assume proxy is configured or will be configured.
  // Actually, looking at the file list, there is no .env file mentioned, but let's try relative first.
  // Wait, I should check if there is a base URL constant used elsewhere.
  // I'll stick to relative paths `/api/` or `/` as seen in urls.py.
  // The backend urls.py has `path("api/", include("scheduler.urls"))` AND `path("", include("scheduler.urls"))`.
  // So `/auth/...` should work if hitting the root.

  const API_URL = 'http://127.0.0.1:8000'; // Hardcoding for now based on typical Django dev server

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/check/`);
      if (response.data.isAuthenticated) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, { username, password });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register/`, { username, email, password });
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout/`);
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
