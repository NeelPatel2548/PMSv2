import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { connectSocket, disconnectSocket, getSocket } from '../services/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Check auth status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Socket.IO — connect when user is set, disconnect on logout
  useEffect(() => {
    if (user) {
      let socket;
      try {
        socket = connectSocket();
      } catch (err) {
        console.warn('[AuthContext] Socket connection failed:', err.message);
        return;
      }

      // Listen for real-time notifications
      socket.on('notification', (notif) => {
        setUnreadCount(prev => prev + 1);
      });

      // Fetch initial unread count
      api.get('/notifications/unread-count')
        .then(res => {
          if (res.data.success) {
            setUnreadCount(res.data.data?.count ?? 0);
          }
        })
        .catch(() => {});

      return () => {
        socket.off('notification');
      };
    } else {
      disconnectSocket();
      setUnreadCount(0);
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  };

  const loginVerify = async (email, otp) => {
    const res = await api.post('/auth/login/verify', { email, otp });
    // Backend sets JWT cookie on login verify — now fetch user into context
    await checkAuth();
    return res.data;
  };

  const register = async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  };

  const verifyOTP = async (email, otp) => {
    const res = await api.post('/auth/verify-otp', { email, otp });
    // NOTE: Backend does NOT set a JWT cookie on registration verify.
    // It returns success with message "Account created successfully. Please log in."
    // So we do NOT call checkAuth() here — user must login separately.
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    disconnectSocket();
    setUser(null);
    setUnreadCount(0);
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const decrementUnread = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const resetUnread = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = {
    user,
    loading,
    login,
    loginVerify,
    register,
    verifyOTP,
    logout,
    updateUser,
    checkAuth,
    isAuthenticated: !!user,
    unreadCount,
    decrementUnread,
    resetUnread,
    getSocket,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
