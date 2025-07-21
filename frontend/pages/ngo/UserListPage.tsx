
import React, { useState, useEffect } from 'react';
import { ngoAPI } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { FiLoader, FiMail, FiDollarSign, FiCalendar } from 'react-icons/fi';

interface User {
    id: string;
    name: string;
    email: string;
    totalDonated: number;
    donationCount: number;
    lastDonation: string;
}

const NgoUserListPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await ngoAPI.getUsers();
            setUsers(response.data);
        } catch (error: any) {
            addToast(error.message || 'Failed to load users', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <FiLoader className="animate-spin h-8 w-8 text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Donors & Supporters</h1>

            <div className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold">All Donors ({users.length})</h2>
                </div>

                {users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Donor</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Total Donated</th>
                                    <th className="px-6 py-3">Donations</th>
                                    <th className="px-6 py-3">Last Donation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id || user.email} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {user.name || 'Anonymous Donor'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiMail size={14} />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-green-600">
                                                <FiDollarSign size={14} />
                                                ₹{user.totalDonated.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{user.donationCount} donations</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <FiCalendar size={14} />
                                                {new Date(user.lastDonation).toLocaleDateString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">No donors found yet.</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Donors will appear here once they contribute to your campaigns.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NgoUserListPage;
