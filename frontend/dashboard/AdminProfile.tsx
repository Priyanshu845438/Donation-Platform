
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const AdminProfile: React.FC = () => {
    const { user } = useAuth();
    
    const inputStyles = "block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-copy">Admin Profile</h1>
                <p className="mt-2 text-lg text-copy-muted">Manage your profile information and password.</p>
            </div>

            {/* Profile Information Form */}
            <div className="bg-surface p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-copy mb-6">Profile Information</h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-copy-muted mb-1">Full Name</label>
                        <input type="text" name="fullName" id="fullName" defaultValue={user?.fullName} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-copy-muted mb-1">Email Address</label>
                        <input type="email" name="email" id="email" defaultValue={user?.email} className={inputStyles} readOnly />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="role" className="block text-sm font-medium text-copy-muted mb-1">Role</label>
                        <input type="text" name="role" id="role" defaultValue={user?.role} className={`${inputStyles} cursor-not-allowed bg-background/50`} readOnly />
                    </div>
                    <div className="md:col-span-2 text-right">
                        <Button type="submit" variant="primary">Save Changes</Button>
                    </div>
                </form>
            </div>
            
            {/* Change Password Form */}
            <div className="bg-surface p-8 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-copy mb-6">Change Password</h2>
                <form className="space-y-6">
                     <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-copy-muted mb-1">Current Password</label>
                        <input type="password" name="currentPassword" id="currentPassword" className={inputStyles} />
                    </div>
                     <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-copy-muted mb-1">New Password</label>
                        <input type="password" name="newPassword" id="newPassword" className={inputStyles} />
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-copy-muted mb-1">Confirm New Password</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" className={inputStyles} />
                    </div>
                    <div className="text-right">
                        <Button type="submit" variant="secondary">Update Password</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;
