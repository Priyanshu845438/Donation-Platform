
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiUserPlus } from 'react-icons/fi';
import Button from '../Button.tsx';
import { createAdminUser } from '../../services/api.ts';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onUserCreated }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'donor',
        approvalStatus: 'pending'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
            setError('Please fill out all required fields.');
            setLoading(false);
            return;
        }

        const userDataToSubmit = { ...formData } as any;
        if (userDataToSubmit.approvalStatus === 'approved') {
            // Also activate the user if they are being created as approved.
            userDataToSubmit.isActive = true;
        }

        try {
            await createAdminUser(userDataToSubmit);
            onUserCreated();
        } catch (err: any) {
            setError(err.message || 'Failed to create user. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Reset form when modal opens
    useEffect(() => {
        if(isOpen) {
            setFormData({
                fullName: '',
                email: '',
                password: '',
                phoneNumber: '',
                role: 'donor',
                approvalStatus: 'pending'
            });
            setError('');
            setLoading(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-xl w-full max-w-2xl m-4 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold font-serif text-navy-blue dark:text-white flex items-center">
                                <FiUserPlus className="mr-3 text-brand-gold"/>
                                Create New User
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-brand-dark text-gray-500 dark:text-gray-400">
                                <FiX size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {error && <div className="p-3 text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-md text-sm">{error}</div>}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                                    <select name="role" value={formData.role} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                        <option value="donor">Donor</option>
                                        <option value="ngo">NGO</option>
                                        <option value="company">Company</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Approval Status</label>
                                    <select name="approvalStatus" value={formData.approvalStatus} onChange={handleChange} className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            {/* Footer */}
                            <div className="flex items-center justify-end pt-4 space-x-3">
                                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CreateUserModal;
