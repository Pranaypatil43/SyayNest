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

  /** Host signup — creates account, does NOT log in automatically */
  const signup = async (username, email) => {
    const res = await api.post('/users/signup', { username, email });
    return res.data; // { message }
  };

  /** Send OTP to email — works for both host and guest */
  const sendOtp = async (email) => {
    const res = await api.post('/users/send-otp', { email });
    return res.data; // { message, dev_otp? }
  };

  /** Verify OTP — logs the user in */
  const verifyOtp = async (email, code, fullName) => {
    const res = await api.post('/users/verify-otp', { email, code, fullName });
    setCurrentUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    await api.post('/users/logout');
    setCurrentUser(null);
  };

  const isHost  = currentUser?.role === 'host';
  const isGuest = currentUser?.role === 'guest';

  return (
    <AuthContext.Provider value={{
      currentUser, loading,
      signup, sendOtp, verifyOtp, logout,
      isHost, isGuest,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
