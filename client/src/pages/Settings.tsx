import React, { useState } from 'react';
import { User, Lock, Eye, Download, Trash2, Shield } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import api from '../services/api';

const Settings: React.FC = () => {
  const { user, updateProfile, logout } = useAuthStore();
  const { showToast } = useUIStore();

  // Account
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Privacy
  const [anonymous, setAnonymous] = useState(user?.settings?.anonymousOnLeaderboard || false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ name, email });
      showToast('success', 'Profile updated');
    } catch {
      showToast('error', 'Failed to update profile');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters');
      return;
    }
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      showToast('success', 'Password changed');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      showToast('error', error.response?.data?.error || 'Failed to change password');
    }
  };

  const handleToggleAnonymous = async () => {
    try {
      const newValue = !anonymous;
      await updateProfile({ settings: { ...user?.settings, anonymousOnLeaderboard: newValue } } as any);
      setAnonymous(newValue);
      showToast('success', newValue ? 'You are now anonymous on leaderboards' : 'Your name is visible on leaderboards');
    } catch {
      showToast('error', 'Failed to update privacy settings');
    }
  };

  const handleExportData = async () => {
    try {
      const { data } = await api.get('/auth/export');
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productivity-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('success', 'Data exported successfully');
      }
    } catch {
      showToast('error', 'Failed to export data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { showToast('error', 'Enter your password'); return; }
    setIsDeleting(true);
    try {
      await api.delete('/auth/account', { data: { password: deletePassword } });
      showToast('success', 'Account deleted. Goodbye.');
      logout();
    } catch (error: any) {
      showToast('error', error.response?.data?.error || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const SectionTitle: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-text-tertiary">{icon}</span>
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">{title}</h3>
    </div>
  );

  const InputField: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }> = ({
    label, value, onChange, type = 'text', placeholder,
  }) => (
    <div>
      <label className="block text-xs text-text-tertiary mb-1.5">{label}</label>
      <input
        type={type}
        className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-neon transition-colors duration-200 placeholder:text-text-tertiary/50"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="animate-fade-in max-w-[600px] mx-auto space-y-6">
        {/* Account */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5">
          <SectionTitle icon={<User size={16} />} title="Account" />
          <div className="space-y-3">
            <InputField label="Name" value={name} onChange={setName} />
            <InputField label="Email" value={email} onChange={setEmail} type="email" />
            <Button size="sm" onClick={handleUpdateProfile}>Save Changes</Button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5">
          <SectionTitle icon={<Lock size={16} />} title="Change Password" />
          <div className="space-y-3">
            <InputField label="Current Password" value={currentPassword} onChange={setCurrentPassword} type="password" />
            <InputField label="New Password" value={newPassword} onChange={setNewPassword} type="password" placeholder="Min 6 characters" />
            <InputField label="Confirm New Password" value={confirmPassword} onChange={setConfirmPassword} type="password" />
            <Button size="sm" onClick={handleChangePassword}>Change Password</Button>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5">
          <SectionTitle icon={<Eye size={16} />} title="Privacy" />
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-text-primary">Anonymous on Leaderboard</span>
              <p className="text-xs text-text-tertiary mt-0.5">Hide your name from public rankings</p>
            </div>
            <button
              className={`w-12 h-6 rounded-full transition-all duration-200 relative ${anonymous ? 'bg-neon' : 'bg-bg-tertiary border border-border'}`}
              onClick={handleToggleAnonymous}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-200 ${anonymous ? 'left-[26px]' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Data */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-5">
          <SectionTitle icon={<Download size={16} />} title="Data" />
          <p className="text-xs text-text-tertiary mb-3">Export all your habits, tasks, routines, timer sessions, and journal entries as JSON.</p>
          <Button size="sm" variant="secondary" onClick={handleExportData} icon={<Download size={14} />}>
            Export All Data
          </Button>
        </div>

        {/* Danger Zone */}
        <div className="bg-bg-secondary border border-danger/30 rounded-2xl p-5">
          <SectionTitle icon={<Shield size={16} />} title="Danger Zone" />
          <p className="text-xs text-text-tertiary mb-3">Once you delete your account, all data is permanently removed. This cannot be undone.</p>
          <Button size="sm" variant="danger" onClick={() => setShowDeleteModal(true)} icon={<Trash2 size={14} />}>
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isOpen={true} title="Delete Account" onClose={() => setShowDeleteModal(false)} size="sm">
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              This will permanently delete your account and all data. Enter your password to confirm.
            </p>
            <input
              type="password"
              className="w-full py-2.5 px-3.5 bg-bg-tertiary border border-border rounded-[10px] text-text-primary text-sm outline-none focus:border-danger transition-colors duration-200"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" fullWidth onClick={() => setShowDeleteModal(false)}>Cancel</Button>
              <Button size="sm" variant="danger" fullWidth onClick={handleDeleteAccount} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Forever'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default Settings;
