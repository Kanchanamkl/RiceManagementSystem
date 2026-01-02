'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Production } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  productions: Production[];
  addProduction: (production: Omit<Production, 'id' | 'created_at'>) => Promise<void>;
  updateProduction: (id: string, production: Partial<Production>) => Promise<void>;
  deleteProduction: (id: string) => Promise<void>;
  refreshProductions: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'farmer';
  district?: string;
  phone?: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'farmer';
  district?: string;
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState<Production[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  // Check session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.user) {
          setUser(result.data.user);
          setIsAuthenticated(true);
          await fetchProductions(result.data.user);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductions = async (currentUser: User) => {
    try {
      const response = await fetch('/api/productions');
      const result = await response.json();
      
      if (result.success) {
        setProductions(result.data);
      }
    } catch (error) {
      console.error('Fetch productions error:', error);
    }
  };

  const refreshProductions = async () => {
    if (user) {
      await fetchProductions(user);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      setUser(result.data.user);
      setIsAuthenticated(true);
      await fetchProductions(result.data.user);

      // Redirect based on role
      if (result.data.user.role === 'admin') {
        router.push('/admin/map');
      } else {
        router.push('/farmer/dashboard');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      
      setUser(null);
      setIsAuthenticated(false);
      setProductions([]);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Registration failed');
    }

    // Don't redirect here, let the component handle it
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      setUser(result.data.user);
    } catch (error: any) {
      throw new Error(error.message || 'Update failed');
    }
  };

  const addProduction = async (production: Omit<Production, 'id' | 'created_at'>) => {
    try {
      const response = await fetch('/api/productions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(production),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      await refreshProductions();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to add production');
    }
  };

  const updateProduction = async (id: string, updates: Partial<Production>) => {
    try {
      const response = await fetch(`/api/productions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      await refreshProductions();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update production');
    }
  };

  const deleteProduction = async (id: string) => {
    try {
      const response = await fetch(`/api/productions/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      await refreshProductions();
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete production');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      updateProfile,
      productions,
      addProduction,
      updateProduction,
      deleteProduction,
      refreshProductions,
      isAuthenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
