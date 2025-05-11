import React, { createContext, useState, useEffect, useCallback } from 'react';

interface UserContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (username: string, password: string) => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  isAuthenticated: false,
  userId: null,
  login: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUserId(null);
      return;
    }

    try {
      const response = await fetch('/api/verify-token', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUserId(data.userId);
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserId(null);
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUserId(null);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
      setIsAuthenticated(true);
      setUserId(data.userId);
    } else {
      throw new Error(data.error || 'Login failed');
    }
  };

  return (
    <UserContext.Provider value={{ isAuthenticated, userId, login }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => React.useContext(UserContext);