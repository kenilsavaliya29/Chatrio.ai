'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      
      if (!res.ok) {
        setUser(null);
        return;
      }
      
      const data = await res.json();
      
      if (data.success && data.user) {
        setUser(data.user);
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

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const data = await res.json();
        return { 
          success: false, 
          error: data.error || 'Login failed',
          field: data.field || 'general'
        };
      }
      
      const data = await res.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: data.error || 'Login failed',
        field: data.field || 'general'
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Network error occurred',
        field: 'general'
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const data = await res.json();
        return { 
          success: false, 
          error: data.error || 'Registration failed',
          field: data.field || 'general'
        };
      }
      
      const data = await res.json();
      
      if (data.success && data.user) {
        setUser(data.user);
        return { success: true };
      }
      
      return { 
        success: false, 
        error: data.error || 'Registration failed',
        field: data.field || 'general'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: 'Network error occurred',
        field: 'general'
      };
    }
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (res.ok) {
        setUser(null);
        router.push('/');
        return { success: true };
      }
      
      return { 
        success: false, 
        error: 'Logout failed',
        field: 'general'
      };
    } catch (error) {
      console.error('Logout failed:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during logout',
        field: 'general'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 