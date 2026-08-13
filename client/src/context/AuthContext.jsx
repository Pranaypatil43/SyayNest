import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me')
      .then(res => setCurrentUser(res.data.user))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/users/login', { username, password });
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const signup = async (username, email, password) => {
    const res = await api.post('/users/signup', { username, email, password });
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/users/logout');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
