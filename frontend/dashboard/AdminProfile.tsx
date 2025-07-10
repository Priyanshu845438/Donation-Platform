
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../utils/api';
import { User } from '../types';

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({ fullName: '', phoneNumber: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, [user]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };
    
    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingProfile(true);
        try {
            const updatedUser = await apiFetch<User>('/auth/profile', {
                method: 'PATCH',
                body: formData,
            });
            addToast('Profile updated successfully!', 'success');
            updateUser({ ...formData, ...updatedUser });
        } catch (error: any) {
            addToast(error.message || 'Failed to update profile.', 'error');
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            addToast("New passwords do not match.", "error");
            return;
        }
        setIsSubmittingPassword(true);
        try {
            await apiFetch('/auth/change-password', {
                method: 'PATCH',
                body: { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
            });
            addToast('Password changed successfully!', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            addToast(error.message || 'Failed to change password.', 'error');
        } finally {
            setIsSubmittingPassword(false);
        }
    };
    
     const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        const uploadFormData = new FormData();
        uploadFormData.append('profileImage', file);
        setIsUploadingImage(true);

        try {
            const response = await apiFetch<{ user: User }>('/auth/upload-profile-image', {
                method: 'POST',
                body: uploadFormData,
            });
            addToast('Profile image updated!', 'success');
            updateUser(response.user);
        } catch (error: any) {
            addToast(error.message || 'Failed to upload image.', 'error');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const inputStyles = "block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-50";

    return (
        <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
             <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">My Account</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage your profile information and password.</p>
            </div>
            
            <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-sm border border-border flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                    <img 
                        src={user?.profileImageUrl || `https://i.pravatar.cc/150?u=${user?.email}`} 
                        alt="Profile" 
                        className="w-28 h-28 rounded-full object-cover border-4 border-primary"
                    />
                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage} className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full hover:bg-primary-dark transition-colors border-2 border-surface">
                       {isUploadingImage ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <ion-icon name="camera-outline" className="text-lg"></ion-icon>}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                </div>
                <div className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold font-display text-text-primary">{user?.fullName}</h2>
                    <p className="text-text-secondary">{user?.email}</p>
                    <p className="text-sm text-primary capitalize font-semibold mt-1">{user?.role} Account</p>
                </div>
            </div>

            <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-bold font-display text-text-primary mb-6 pb-4 border-b border-border">Profile Information</h3>
                <form className="space-y-6" onSubmit={handleProfileSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleProfileChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
                            <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleProfileChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                            <input type="email" name="email" id="email" value={user?.email || ''} className={`${inputStyles} cursor-not-allowed bg-gray-100`} readOnly />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                            <input type="text" name="role" id="role" value={user?.role || ''} className={`${inputStyles} cursor-not-allowed bg-gray-100 capitalize`} readOnly />
                        </div>
                    </div>
                    <div className="text-right">
                        <Button type="submit" variant="primary" disabled={isSubmittingProfile}>
                            {isSubmittingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
            
            <div className="bg-surface p-6 sm:p-8 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-bold font-display text-text-primary mb-6 pb-4 border-b border-border">Change Password</h3>
                <form className="space-y-6" onSubmit={handlePasswordSubmit}>
                     <input type="text" name="username" id="username" value={user?.email || ''} autoComplete="username" readOnly className="hidden" />
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                            <input type="password" name="currentPassword" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className={inputStyles} autoComplete="current-password" />
                        </div>
                         <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                            <input type="password" name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className={inputStyles} autoComplete="new-password" />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                            <input type="password" name="confirmPassword" id="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className={inputStyles} autoComplete="new-password" />
                        </div>
                     </div>
                    <div className="text-right">
                        <Button type="submit" variant="secondary" disabled={isSubmittingPassword}>
                            {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
