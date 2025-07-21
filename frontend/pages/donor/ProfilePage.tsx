
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.tsx';
import { userAPI } from '../../services/api.ts';
import Button from '../../components/Button.tsx';
import { FiSave, FiLoader, FiUser } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.tsx';

const DonorProfilePage: React.FC = () => {
    const { user: currentUser, loading: authLoading } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (!authLoading && currentUser) {
            setFormData({
                fullName: currentUser.fullName || '',
                phoneNumber: currentUser.phoneNumber || '',
            });
            setLoading(false);
        }
    }, [currentUser, authLoading]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await userAPI.updateProfile(formData);
            addToast('Profile updated successfully!', 'success');
            // Note: AuthContext needs to be refreshed to see changes in header,
            // but for now this is fine. A full page reload would do it.
        } catch (err: any) {
            addToast(`Failed to update profile: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || authLoading) {
        return <div className="flex items-center justify-center h-64"><FiLoader className="animate-spin h-8 w-8 text-brand-gold"/></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit My Profile</h1>
            <div className="max-w-2xl">
                <form onSubmit={handleSave} className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h3 className="text-lg font-semibold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
                        <FiUser /> Personal Information
                    </h3>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input type="email" id="email" name="email" value={currentUser?.email || ''} disabled className="mt-1 w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-brand-dark/50 focus:outline-none cursor-not-allowed"/>
                    </div>
                     <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                        <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                    </div>
                     <div className="flex justify-end pt-4">
                        <Button type="submit" variant="primary" disabled={isSaving}><FiSave className="mr-2"/>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DonorProfilePage;
