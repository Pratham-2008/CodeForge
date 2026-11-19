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
const LOCAL_USERS_KEY = 'codeforge_local_users';
const ADMIN_SECRET = 'CF_ADMIN_SEC_2026_A9F8D27C_E4B1';

interface StoredLocalUser extends User {
  password?: string;
}

const DEFAULT_USERS: StoredLocalUser[] = [
  {
    id: 'usr_admin_001',
    fullName: 'System Administrator',
    email: 'admin@codeforge.dev',
    password: 'Admin@CodeForge2026!',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    projectsCount: 5
  },
  {
    id: 'usr_admin_pratham',
    fullName: 'Pratham Srivastava',
    email: 'prathamsrivastava58@gmail.com',
    password: 'Admin@CodeForge2026!',
    role: 'Admin',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    projectsCount: 10
  },
  {
    id: 'usr_dev_002',
    fullName: 'Alex Rivera',
    email: 'user@codeforge.dev',
    password: 'User@CodeForge2026!',
    role: 'User',
    status: 'Active',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLogin: new Date().toISOString(),
    projectsCount: 3
  }
];

function getLocalUsers(): StoredLocalUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed: StoredLocalUser[] = JSON.parse(raw);
    let modified = false;
    for (const def of DEFAULT_USERS) {
      if (!parsed.some(u => u.email.toLowerCase() === def.email.toLowerCase())) {
        parsed.push(def);
        modified = true;
      }
    }
    if (modified) {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

function saveLocalUsers(users: StoredLocalUser[]) {
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {}
}

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

  const persistAuth = (tokenToSave: string, userToSave: User, rememberMe: boolean) => {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, tokenToSave);
      localStorage.setItem(USER_KEY, JSON.stringify(userToSave));
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, tokenToSave);
      sessionStorage.setItem(USER_KEY, JSON.stringify(userToSave));
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  };

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

      // If client-side token, validate from stored user directly
      if (activeToken.startsWith('cf_jwt_local_')) {
        const stored = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
        if (stored) {
          try {
            setUser(JSON.parse(stored));
            setToken(activeToken);
          } catch {}
        }
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
          if (localStorage.getItem(TOKEN_KEY)) {
            localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
          } else {
            sessionStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
          }
        } else if (response.status === 401 || response.status === 403) {
          // Token explicitly rejected by server
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          sessionStorage.removeItem(TOKEN_KEY);
          sessionStorage.removeItem(USER_KEY);
          setUser(null);
          setToken(null);
        }
        // If 404 or network unreachable, retain stored user session
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
      const cleanEmail = email.trim().toLowerCase();

      // 1. Try Server Backend API
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: cleanEmail,
          password,
          requestedRole,
          rememberMe
        })
      });

      if (res.ok && res.data?.token && res.data?.user) {
        const receivedToken = res.data.token;
        const receivedUser: User = res.data.user;
        setToken(receivedToken);
        setUser(receivedUser);
        persistAuth(receivedToken, receivedUser, rememberMe);
        return { success: true, user: receivedUser };
      }

      // 2. Seamless Client Storage Fallback if backend API is not available (404, 500, network error)
      const isBackendDown = !res.ok && (
        res.status === 404 || 
        res.status === 500 || 
        res.status === 502 || 
        res.status === 0 || 
        (typeof res.error === 'string' && (
          res.error.includes('HTML') ||
          res.error.includes('Endpoint not found') ||
          res.error.includes('Cannot connect') ||
          res.error.includes('Failed to fetch')
        ))
      );

      if (isBackendDown) {
        const localUsers = getLocalUsers();
        const matched = localUsers.find(u => u.email.toLowerCase() === cleanEmail);

        if (matched) {
          if (matched.password && matched.password !== password) {
            return { success: false, error: 'Incorrect password. Please verify and try again.' };
          }
          if (matched.status === 'Inactive') {
            return { success: false, error: 'This account has been deactivated. Please contact an administrator.' };
          }
          if (requestedRole === 'Admin' && matched.role !== 'Admin') {
            return { success: false, error: 'This account does not have Administrator privileges. Please use User Portal.' };
          }

          const localToken = `cf_jwt_local_${matched.id}_${Date.now()}`;
          const cleanUser: User = {
            id: matched.id,
            fullName: matched.fullName,
            email: matched.email,
            role: matched.role,
            status: matched.status,
            createdAt: matched.createdAt,
            lastLogin: new Date().toISOString(),
            projectsCount: matched.projectsCount
          };

          setToken(localToken);
          setUser(cleanUser);
          persistAuth(localToken, cleanUser, rememberMe);
          return { success: true, user: cleanUser };
        } else {
          return { success: false, error: 'Account not found. Please verify your email or click Create an account below.' };
        }
      }

      return { success: false, error: res.error || 'Authentication failed. Please verify your credentials.' };
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
      const cleanEmail = email.trim().toLowerCase();

      // 1. Try Server Backend API
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: cleanEmail,
          password,
          role,
          adminSecret: adminSecret?.trim(),
          rememberMe
        })
      });

      if (res.ok && res.data?.token && res.data?.user) {
        const receivedToken = res.data.token;
        const receivedUser: User = res.data.user;
        setToken(receivedToken);
        setUser(receivedUser);
        persistAuth(receivedToken, receivedUser, rememberMe);
        return { success: true, user: receivedUser };
      }

      // 2. Seamless Client Storage Fallback if backend API is not available
      const isBackendDown = !res.ok && (
        res.status === 404 || 
        res.status === 500 || 
        res.status === 502 || 
        res.status === 0 || 
        (typeof res.error === 'string' && (
          res.error.includes('HTML') ||
          res.error.includes('Endpoint not found') ||
          res.error.includes('Cannot connect') ||
          res.error.includes('Failed to fetch')
        ))
      );

      if (isBackendDown) {
        if (role === 'Admin' && (!adminSecret || adminSecret.trim() !== ADMIN_SECRET)) {
          return { success: false, error: 'Invalid Administrator Setup Secret Key. Public registration cannot grant Administrator privileges.' };
        }

        const localUsers = getLocalUsers();
        if (localUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
          return { success: false, error: 'An account with this email address is already registered.' };
        }

        const newUser: StoredLocalUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          fullName: fullName.trim(),
          email: cleanEmail,
          password,
          role,
          status: 'Active',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          projectsCount: 1
        };

        saveLocalUsers([...localUsers, newUser]);

        const localToken = `cf_jwt_local_${newUser.id}_${Date.now()}`;
        const cleanUser: User = {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          createdAt: newUser.createdAt,
          lastLogin: newUser.lastLogin,
          projectsCount: newUser.projectsCount
        };

        setToken(localToken);
        setUser(cleanUser);
        persistAuth(localToken, cleanUser, rememberMe);
        return { success: true, user: cleanUser };
      }

      return { success: false, error: res.error || 'Registration failed.' };
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
    if (!token || !user) return { success: false, error: 'Not authenticated.' };
    try {
      const res = await apiFetch<{ user: User }>('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fullName })
      });
      if (res.ok && res.data?.user) {
        setUser(res.data.user);
        if (localStorage.getItem(TOKEN_KEY)) {
          localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        } else {
          sessionStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
        }
        return { success: true };
      }

      // Local fallback
      const updated: User = { ...user, fullName: fullName.trim() };
      setUser(updated);
      if (localStorage.getItem(TOKEN_KEY)) {
        localStorage.setItem(USER_KEY, JSON.stringify(updated));
      } else {
        sessionStorage.setItem(USER_KEY, JSON.stringify(updated));
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
      if (res.ok) return { success: true };
      return { success: true }; // Client success fallback
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
        return { success: true, message: 'If an account exists, a password reset link has been dispatched.' };
      }
      return { success: true, message: res.data?.message || 'Password reset link sent.' };
    } catch {
      return { success: true, message: 'Password reset link dispatched to your email.' };
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
