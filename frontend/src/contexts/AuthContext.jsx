import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import socketService from '@/services/socketService';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          // Connect socket with token
          socketService.connect(token);
        } catch (error) {
          localStorage.removeItem('token');
          socketService.disconnect();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authAPI.login(email, password);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    // Connect socket with token
    socketService.connect(response.token);
  };

  const register = async (email, password, name) => {
    const response = await authAPI.register(email, password, name);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    // Connect socket with token
    socketService.connect(response.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
