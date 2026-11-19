import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Calendar, 
  Clock, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Code2, 
  Cpu, 
  Server,
  Layers,
  Eye,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import { User, AdminStats } from '../../types/auth';

export const AdminDashboard: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const { addToast } = useProject();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Admin' | 'User'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive'>('all');

  // Modals state
  const [selectedUserDetail, setSelectedUserDetail] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Create User modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'Admin' | 'User'>('User');
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchUsersAndStats = async () => {
    if (!token) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to fetch admin users.');
      } else {
        setUsers(data.users || []);
        setStats(data.stats || null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error fetching admin data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndStats();
  }, [token]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Toggle user status
  const handleToggleStatus = async (user: User) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Failed to update user status.', 'error');
      } else {
        addToast(`User ${user.fullName} is now ${nextStatus}.`, 'success');
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
        if (stats) {
          setStats({
            ...stats,
            activeUsers: nextStatus === 'Active' ? stats.activeUsers + 1 : stats.activeUsers - 1,
            inactiveUsers: nextStatus === 'Inactive' ? stats.inactiveUsers + 1 : stats.inactiveUsers - 1
          });
        }
      }
    } catch (err: any) {
      addToast(err.message, 'error');
    }
  };

  // Delete user
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.error || 'Failed to delete user.', 'error');
      } else {
        addToast(`User ${userToDelete.fullName} deleted.`, 'success');
        setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
        if (stats) {
          setStats({
            ...stats,
            totalUsers: stats.totalUsers - 1,
            activeUsers: userToDelete.status === 'Active' ? stats.activeUsers - 1 : stats.activeUsers,
            inactiveUsers: userToDelete.status === 'Inactive' ? stats.inactiveUsers - 1 : stats.inactiveUsers
          });
        }
        setUserToDelete(null);
      }
    } catch (err: any) {
      addToast('error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Create new user directly by admin
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!newFullName.trim() || !newEmail.trim() || !newPassword) {
      setCreateError('All fields are required.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: newFullName.trim(),
          email: newEmail.trim(),
          password: newPassword,
          role: newRole,
          status: 'Active'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Failed to create user.');
      } else {
        addToast(`Created ${newRole} account for ${data.user.fullName}`, 'success');
        setUsers(prev => [data.user, ...prev]);
        setShowCreateModal(false);
        setNewFullName('');
        setNewEmail('');
        setNewPassword('');
        setNewRole('User');
        if (stats) {
          setStats({
            ...stats,
            totalUsers: stats.totalUsers + 1,
            activeUsers: stats.activeUsers + 1,
            adminUsers: newRole === 'Admin' ? stats.adminUsers + 1 : stats.adminUsers,
            regularUsers: newRole === 'User' ? stats.regularUsers + 1 : stats.regularUsers
          });
        }
      }
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Security & Management Portal
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Admin Dashboard</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono font-normal">
                Restricted Access
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage platform users, roles, account activations, and monitor platform health
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchUsersAndStats}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 hover:border-slate-700 transition-all shadow-sm"
              title="Refresh user records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Total Registered Users</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {stats ? stats.totalUsers : users.length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-cyan-400 font-medium">
                {stats ? stats.regularUsers : users.filter(u => u.role === 'User').length} Users
              </span>
              <span>•</span>
              <span className="text-indigo-400 font-medium">
                {stats ? stats.adminUsers : users.filter(u => u.role === 'Admin').length} Admins
              </span>
            </div>
          </div>

          {/* Card 2: Active Accounts */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Active Accounts</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-400 tracking-tight">
              {stats ? stats.activeUsers : users.filter(u => u.status === 'Active').length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-slate-500">
                {stats ? stats.inactiveUsers : users.filter(u => u.status === 'Inactive').length} Deactivated
              </span>
            </div>
          </div>

          {/* Card 3: Platform Projects */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Coding Projects</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {stats ? stats.totalProjects : 12}
            </div>
            <div className="text-[11px] text-indigo-400 mt-1">
              Across all user workspaces
            </div>
          </div>

          {/* Card 4: System Health */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">Platform Health</span>
              <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Server className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-teal-400 tracking-tight">
              {stats?.systemHealth || 'Optimal'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Uptime {stats?.serverUptime || '99.9%'}</span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* User Management Section */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Table Header Filter Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950/40">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white">Registered Users Directory</h2>
              <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
                {filteredUsers.length} of {users.length}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search name or email..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800 select-none">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 hidden md:table-cell">Registration Date</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {isLoading && users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                        <span>Loading platform user directory...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center gap-1.5">
                        <UserX className="w-8 h-8 text-slate-600" />
                        <span className="font-medium text-slate-400">No matching users found</span>
                        <span className="text-[11px] text-slate-600">Try adjusting your search query or filter settings</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isSelf = u.id === currentUser?.id;
                    const isRootAdmin = u.email.toLowerCase() === 'admin@codeforge.dev';

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* User Identity */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                              u.role === 'Admin' 
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            }`}>
                              {u.fullName.slice(0, 2)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                                {u.fullName}
                                {isSelf && (
                                  <span className="text-[10px] bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800">
                                    You
                                  </span>
                                )}
                              </span>
                              <span className="text-[11px] text-slate-400 truncate font-mono">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                            u.role === 'Admin'
                              ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}>
                            {u.role === 'Admin' ? (
                              <ShieldCheck className="w-3 h-3 text-indigo-400" />
                            ) : (
                              <Users className="w-3 h-3 text-cyan-400" />
                            )}
                            <span>{u.role}</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                            u.status === 'Active'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`} />
                            <span>{u.status}</span>
                          </span>
                        </td>

                        {/* Registration Date */}
                        <td className="py-3 px-4 hidden md:table-cell text-slate-400 font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>

                        {/* Last Login */}
                        <td className="py-3 px-4 hidden lg:table-cell text-slate-400 font-mono text-[11px]">
                          {new Date(u.lastLogin).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* View Details */}
                            <button
                              onClick={() => setSelectedUserDetail(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                              title="View user details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Status (Active / Inactive) */}
                            <button
                              onClick={() => handleToggleStatus(u)}
                              disabled={isRootAdmin || isSelf}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isRootAdmin || isSelf
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : u.status === 'Active'
                                  ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                                  : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'
                              }`}
                              title={
                                isRootAdmin || isSelf 
                                  ? 'Cannot deactivate this administrative account'
                                  : u.status === 'Active' 
                                  ? 'Deactivate user' 
                                  : 'Activate user'
                              }
                            >
                              {u.status === 'Active' ? (
                                <UserX className="w-3.5 h-3.5" />
                              ) : (
                                <UserCheck className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() => setUserToDelete(u)}
                              disabled={isRootAdmin || isSelf}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isRootAdmin || isSelf
                                  ? 'opacity-30 cursor-not-allowed text-slate-600'
                                  : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                              }`}
                              title={
                                isRootAdmin || isSelf 
                                  ? 'Cannot delete this administrative account' 
                                  : 'Delete user account'
                              }
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedUserDetail(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold text-lg">
                {selectedUserDetail.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedUserDetail.fullName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                    selectedUserDetail.role === 'Admin'
                      ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {selectedUserDetail.role}
                  </span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">{selectedUserDetail.email}</span>
              </div>
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Account ID</span>
                <span className="text-slate-200 font-mono text-[11px]">{selectedUserDetail.id}</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Account Status</span>
                <span className={`font-semibold ${
                  selectedUserDetail.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {selectedUserDetail.status}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Registered On</span>
                <span className="text-slate-200 font-mono">
                  {new Date(selectedUserDetail.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Last Active Session</span>
                <span className="text-slate-200 font-mono">
                  {new Date(selectedUserDetail.lastLogin).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Active Workspaces / Projects</span>
                <span className="text-cyan-400 font-semibold">{selectedUserDetail.projectsCount || 1}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedUserDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3">
              <Trash2 className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-white mb-1.5">
              Delete User Account
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Are you sure you want to permanently delete the account for{' '}
              <strong className="text-slate-200">{userToDelete.fullName}</strong> ({userToDelete.email})? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Plus className="w-5 h-5 text-cyan-400" />
              <span>Create New Platform Account</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Provision a new User or Administrator account directly.
            </p>

            {createError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  placeholder="e.g. Jane Smith"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('User')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      newRole === 'User'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    User
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('Admin')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
                      newRole === 'Admin'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                >
                  {isCreating ? 'Provisioning...' : 'Provision Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
