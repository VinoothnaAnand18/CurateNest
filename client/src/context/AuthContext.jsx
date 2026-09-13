import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('curatenest_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('curatenest_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (err) {
          console.warn('Auth token expired or invalid:', err.message);
          localStorage.removeItem('curatenest_token');
          localStorage.removeItem('curatenest_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('curatenest_token', newToken);
    localStorage.setItem('curatenest_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, interests, favoriteGenres) => {
    const res = await authAPI.register({ name, email, password, interests, favoriteGenres });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('curatenest_token', newToken);
    localStorage.setItem('curatenest_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('curatenest_token');
    localStorage.removeItem('curatenest_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
