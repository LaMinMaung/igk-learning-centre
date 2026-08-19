import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from './pocketbase';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent' | 'owner';
  avatar?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (pb.authStore.isValid && pb.authStore.record) {
        try {
          await pb.collection('users').authRefresh({ requestKey: null });
          setUser(pb.authStore.record as User);
        } catch (error) {
          pb.authStore.clear();
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen to auth changes
    pb.authStore.onChange(() => {
      if (pb.authStore.record) {
        setUser(pb.authStore.record as User);
      } else {
        setUser(null);
      }
    });
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password, { requestKey: null });
      setUser(authData.record as User);
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const hasRole = (role: string | string[]) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};