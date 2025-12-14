'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('coffee-pula-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // TODO: Replace with actual API call
    // For demo, hardcoded users
    const demoUsers: Record<string, { password: string; user: User }> = {
      'admin@coffeepula.com': {
        password: 'admin123',
        user: { id: '1', name: 'Admin', email: 'admin@coffeepula.com', role: 'admin' },
      },
      'manager@coffeepula.com': {
        password: 'manager123',
        user: { id: '2', name: 'Manager', email: 'manager@coffeepula.com', role: 'manager' },
      },
      'cashier@coffeepula.com': {
        password: 'cashier123',
        user: { id: '3', name: 'Cashier', email: 'cashier@coffeepula.com', role: 'cashier' },
      },
    };

    const userRecord = demoUsers[email];
    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user);
      localStorage.setItem('coffee-pula-user', JSON.stringify(userRecord.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coffee-pula-user');
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
