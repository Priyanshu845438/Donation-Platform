
import React, { useState } from 'react';
import Button from '../../components/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { userAPI } from '../../services/api.ts';
import { FiKey, FiSave, FiLoader } from 'react-icons/fi';

const DonorSettingsPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match.", 'error');
      return;
    }
    if (newPassword.length < 6) {
        addToast("Password must be at least 6 characters long.", 'error');
        return;
    }
    setLoading(true);
    try {
      await userAPI.changePassword(currentPassword, newPassword);
      addToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
      
      <div className="max-w-2xl">
        <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2"><FiKey/>Change Password</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                    <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="mt-1 w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                </div>
                <div className="text-right pt-2">
                    <Button type="submit" disabled={loading}>
                        {loading ? <FiLoader className="animate-spin mr-2"/> : <FiSave className="mr-2"/>}
                        {loading ? 'Saving...' : 'Save Password'}
                    </Button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default DonorSettingsPage;
