import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../mock/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('intern_test_auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('intern_test_auth_token') || null;
  });

  const [routeNotice, setRouteNotice] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('intern_test_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('intern_test_auth_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('intern_test_auth_token', token);
    } else {
      localStorage.removeItem('intern_test_auth_token');
    }
  }, [token]);

  const login = async (username) => {
    setRouteNotice(null);
    const result = await api.login(username);
    setUser(result.user);
    setToken(result.token);
    return result.user;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRouteNotice(null);
    localStorage.removeItem('intern_test_auth_user');
    localStorage.removeItem('intern_test_auth_token');
  };

  const clearRouteNotice = () => {
    setRouteNotice(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        routeNotice,
        setRouteNotice,
        clearRouteNotice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
