import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string, requestedRole?: UserRole, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (fullName: string, email: string, password: string, role?: UserRole, adminSecret?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  updateProfile: (fullName: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'codeforge_auth_token';
const USER_KEY = 'codeforge_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on mount or token change
  useEffect(() => {
    const validateToken = async () => {
      const activeToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      if (!activeToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${activeToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setToken(activeToken);
          // Keep storage in sync
          if (localStorage.getItem(TOKEN_KEY)) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
          } else {
            sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
          }
        } else {
          // Token invalid or expired
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.warn('[CodeForge Auth] Could not reach backend validation endpoint:', err);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  const login = async (
    email: string, 
    password: string, 
    requestedRole?: UserRole, 
    rememberMe = true
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          requestedRole,
          rememberMe
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Authentication failed.' };
      }

      const receivedToken = data.token;
      const receivedUser: User = data.user;

      setToken(receivedToken);
      setUser(receivedUser);

      // Persist based on rememberMe
      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, receivedToken);
        localStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
      } else {
        sessionStorage.setItem(TOKEN_KEY, receivedToken);
        sessionStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }

      return { success: true, user: receivedUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    fullName: string, 
    email: string, 
    password: string, 
    role: UserRole = 'User', 
    adminSecret?: string, 
    rememberMe = true
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
          adminSecret: adminSecret?.trim(),
          rememberMe
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed.' };
      }

      const receivedToken = data.token;
      const receivedUser: User = data.user;

      setToken(receivedToken);
      setUser(receivedUser);

      if (rememberMe) {
        localStorage.setItem(TOKEN_KEY, receivedToken);
        localStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
      } else {
        sessionStorage.setItem(TOKEN_KEY, receivedToken);
        sessionStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
      }

      return { success: true, user: receivedUser };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during registration.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const updateProfile = async (fullName: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'Not authenticated.' };
    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to update profile.' };

      setUser(data.user);
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      } else {
        sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'Not authenticated.' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Failed to change password.' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'Admin',
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    forgotPassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
