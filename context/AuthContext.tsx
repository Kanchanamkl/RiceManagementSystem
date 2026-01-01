'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';
import type { User, Production } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [productions, setProductions] = useState<Production[]>([]);
  const router = useRouter();

  // Check session on mount and listen to auth changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          await fetchUserProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      
      if (currentSession) {
        await fetchUserProfile(currentSession.user.id);
      } else {
        setUser(null);
        setProductions([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch('/api/auth/me');
      const result = await response.json();
      
      if (result.success && result.data.user) {
        setUser(result.data.user);
        await fetchProductions(result.data.user);
      }
    } catch (error) {
      console.error('Fetch user profile error:', error);
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
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error.message);
      }

      setUser(result.data.user);
      setSession(result.data.session);
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
      await fetch('/api/auth/logout', { method: 'POST' });
      await supabase.auth.signOut();
      
      setUser(null);
      setSession(null);
      setProductions([]);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        if (result.error.details) {
          const errorMessages = Object.values(result.error.details).flat().join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(result.error.message);
      }

      // Auto login after registration
      await login(data.email, data.password);
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
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
      session,
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
