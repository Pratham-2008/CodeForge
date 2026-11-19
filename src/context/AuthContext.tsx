import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types/auth';
import { apiFetch } from '../config/api';

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
        const response = await apiFetch<{ user: User }>('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${activeToken}`
          }
        });

        if (response.ok && response.data?.user) {
          setUser(response.data.user);
          setToken(activeToken);
          // Keep storage in sync
          if (localStorage.getItem(TOKEN_KEY)) {
            localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
          } else {
            sessionStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
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
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
          requestedRole,
          rememberMe
        })
      });

      if (!res.ok || !res.data) {
        return { success: false, error: res.error || 'Authentication failed. Please verify your credentials.' };
      }

      const receivedToken = res.data.token;
      const receivedUser: User = res.data.user;

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
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
          adminSecret: adminSecret?.trim(),
          rememberMe
        })
      });

      if (!res.ok || !res.data) {
        return { success: false, error: res.error || 'Registration failed.' };
      }

      const receivedToken = res.data.token;
      const receivedUser: User = res.data.user;

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
      const res = await apiFetch<{ user: User }>('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName })
      });
      if (!res.ok || !res.data) return { success: false, error: res.error || 'Failed to update profile.' };

      setUser(res.data.user);
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      } else {
        sessionStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) return { success: false, error: 'Not authenticated.' };
    try {
      const res = await apiFetch<{ message: string }>('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) return { success: false, error: res.error || 'Failed to change password.' };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiFetch<{ message: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      if (!res.ok) {
        return { success: false, message: res.error || 'Could not send reset link.' };
      }
      return { success: true, message: res.data?.message || 'Password reset link sent.' };
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
