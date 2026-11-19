export type UserRole = 'Admin' | 'User';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'Active' | 'Inactive';
  createdAt: string;
  lastLogin: string;
  projectsCount?: number;
}

export interface AuthResponse {
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalProjects: number;
  totalExecutions: number;
  serverUptime: string;
  systemHealth: string;
}
