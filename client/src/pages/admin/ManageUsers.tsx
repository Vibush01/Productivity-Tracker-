import React, { useEffect, useState, useCallback } from 'react';
import { Search, Shield, ShieldOff, Eye, ChevronLeft, ChevronRight, ArrowUpDown, Ban, Users } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { useUIStore } from '../../store/uiStore';
import api from '../../services/api';

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  xp: number;
  level: number;
  isPremium?: boolean;
  isDisabled?: boolean;
  habitCount: number;
  createdAt: string;
}

interface UserDetail {
  user: any;
  stats: {
    habitCount: number;
    taskCount: number;
    routineCount: number;
    journalCount: number;
    timerCount: number;
    programCount: number;
    totalCompletions: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ManageUsers: React.FC = () => {
  const { showToast } = useUIStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Detail modal
  const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { page: pagination.page, limit: 20, search, role: roleFilter, sortBy, sortOrder },
      });
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch {
      showToast('error', 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, search, roleFilter, sortBy, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role });
      showToast('success', `Role updated to ${role}`);
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleToggleDisable = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/disable`);
      showToast('success', 'User status toggled');
      fetchUsers();
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Failed to toggle status');
    }
  };

  const handleViewDetail = async (userId: string) => {
    try {
      const { data } = await api.get(`/admin/users/${userId}`);
      if (data.success) setSelectedUser(data.data);
    } catch {
      showToast('error', 'Failed to load user details');
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <>
      <Navbar />
      <div className="animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users size={24} className="text-neon" /> Manage Users
          </h2>
          <span className="text-sm text-text-secondary font-mono">{pagination.total} total</span>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-[200px] relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              className="w-full bg-bg-secondary border border-border rounded-[10px] py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-neon transition-colors"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            />
          </div>

          {/* Role filter */}
          <div className="flex gap-1 p-1 bg-bg-secondary border border-border rounded-[10px]">
            {['all', 'user', 'admin'].map((r) => (
              <button
                key={r}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all capitalize ${
                  roleFilter === r ? 'bg-neon/10 text-neon' : 'text-text-secondary hover:text-text-primary'
                }`}
                onClick={() => { setRoleFilter(r); setPagination((p) => ({ ...p, page: 1 })); }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-bg-secondary border border-border rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {[
                  { key: 'name', label: 'Name' },
                  { key: 'email', label: 'Email' },
                  { key: 'role', label: 'Role' },
                  { key: 'xp', label: 'XP' },
                  { key: 'level', label: 'Level' },
                  { key: 'createdAt', label: 'Joined' },
                ].map(({ key, label }) => (
                  <th
                    key={key}
                    className="px-4 py-3 text-text-tertiary font-semibold text-xs uppercase tracking-wider cursor-pointer hover:text-text-primary transition-colors select-none"
                    onClick={() => handleSort(key)}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      {sortBy === key && <ArrowUpDown size={12} className="text-neon" />}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-text-tertiary font-semibold text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="skeleton h-4 w-20 rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-text-tertiary">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="border-b border-border hover:bg-bg-tertiary/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-text-primary">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-neon/10 flex items-center justify-center text-neon text-xs font-bold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[120px]">{user.name}</span>
                        {user.isDisabled && <span className="px-1.5 py-0.5 rounded bg-danger/10 text-danger text-[9px] font-bold">BAN</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary truncate max-w-[160px]">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        user.role === 'admin' ? 'bg-neon/10 text-neon' : 'bg-bg-tertiary text-text-secondary'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary font-mono text-xs">{user.xp.toLocaleString()}</td>
                    <td className="px-4 py-3 text-neon font-mono text-xs">{user.level}</td>
                    <td className="px-4 py-3 text-text-tertiary text-xs">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1.5 rounded-[6px] text-text-secondary hover:bg-bg-tertiary hover:text-info transition-colors"
                          onClick={() => handleViewDetail(user._id)}
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        {user.role === 'user' ? (
                          <button
                            className="p-1.5 rounded-[6px] text-text-secondary hover:bg-neon/10 hover:text-neon transition-colors"
                            onClick={() => handleRoleChange(user._id, 'admin')}
                            title="Promote to admin"
                          >
                            <Shield size={14} />
                          </button>
                        ) : (
                          <button
                            className="p-1.5 rounded-[6px] text-text-secondary hover:bg-warning/10 hover:text-warning transition-colors"
                            onClick={() => handleRoleChange(user._id, 'user')}
                            title="Demote to user"
                          >
                            <ShieldOff size={14} />
                          </button>
                        )}
                        <button
                          className="p-1.5 rounded-[6px] text-text-secondary hover:bg-danger/10 hover:text-danger transition-colors"
                          onClick={() => handleToggleDisable(user._id)}
                          title={user.isDisabled ? 'Enable user' : 'Disable user'}
                        >
                          <Ban size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-text-tertiary">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                icon={<ChevronLeft size={14} />}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                icon={<ChevronRight size={14} />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" size="md">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-neon/10 flex items-center justify-center text-neon text-xl font-bold">
                {selectedUser.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-text-primary">{selectedUser.user.name}</h3>
                <span className="text-sm text-text-secondary">{selectedUser.user.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Role', value: selectedUser.user.role },
                { label: 'Level', value: selectedUser.user.level },
                { label: 'XP', value: selectedUser.user.xp?.toLocaleString() },
                { label: 'Joined', value: new Date(selectedUser.user.createdAt).toLocaleDateString() },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-bg-tertiary rounded-[10px]">
                  <span className="block text-[10px] text-text-tertiary uppercase font-semibold">{label}</span>
                  <span className="text-sm font-bold text-text-primary">{value}</span>
                </div>
              ))}
            </div>

            <h4 className="text-sm font-semibold text-text-primary mt-4">Activity Stats</h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Habits', value: selectedUser.stats.habitCount, emoji: '🎯' },
                { label: 'Tasks', value: selectedUser.stats.taskCount, emoji: '✅' },
                { label: 'Routines', value: selectedUser.stats.routineCount, emoji: '🔄' },
                { label: 'Journal', value: selectedUser.stats.journalCount, emoji: '📝' },
                { label: 'Timer', value: selectedUser.stats.timerCount, emoji: '⏱️' },
                { label: 'Programs', value: selectedUser.stats.programCount, emoji: '🏆' },
              ].map(({ label, value, emoji }) => (
                <div key={label} className="p-2.5 bg-bg-tertiary rounded-[10px] text-center">
                  <span className="text-lg">{emoji}</span>
                  <span className="block text-sm font-bold text-text-primary">{value}</span>
                  <span className="text-[9px] text-text-tertiary">{label}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-bg-tertiary rounded-[10px]">
              <span className="block text-[10px] text-text-tertiary uppercase font-semibold">Total Completions</span>
              <span className="text-lg font-bold text-neon">{selectedUser.stats.totalCompletions}</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ManageUsers;
