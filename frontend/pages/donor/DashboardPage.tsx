
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { FiLoader, FiHeart, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';
import StatCard from '../../components/dashboard/StatCard';
import { Link } from 'react-router-dom';

interface DashboardStats {
    totalDonations: number;
    totalAmount: number;
    supportedCampaigns: number;
    supportedNgos: number;
    recentDonations: any[];
}

const DonorDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/donor/dashboard', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    setStats(data.data.stats);
                } else {
                    throw new Error('Failed to fetch dashboard stats');
                }
            } catch (error: any) {
                addToast(error.message || 'Failed to load dashboard stats.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [addToast]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <FiLoader className="animate-spin h-8 w-8 text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Welcome back, {user?.fullName}!
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Thank you for making a difference in the world.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Donated"
                    value={`$${stats?.totalAmount?.toLocaleString() || 0}`}
                    icon={<FiDollarSign />}
                    color="text-green-600"
                />
                <StatCard
                    title="Total Donations"
                    value={stats?.totalDonations?.toString() || '0'}
                    icon={<FiHeart />}
                    color="text-red-600"
                />
                <StatCard
                    title="Campaigns Supported"
                    value={stats?.supportedCampaigns?.toString() || '0'}
                    icon={<FiTrendingUp />}
                    color="text-blue-600"
                />
                <StatCard
                    title="NGOs Supported"
                    value={stats?.supportedNgos?.toString() || '0'}
                    icon={<FiUsers />}
                    color="text-purple-600"
                />
            </div>

            {/* Recent Donations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Recent Donations
                    </h2>
                </div>
                <div className="p-6">
                    {stats?.recentDonations && stats.recentDonations.length > 0 ? (
                        <div className="space-y-4">
                            {stats.recentDonations.map((donation: any) => (
                                <div 
                                    key={donation._id}
                                    className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600"
                                >
                                    <div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {donation.campaignId?.title || 'Campaign'}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(donation.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-green-600">
                                            ${donation.amount.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {donation.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FiHeart className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-4 text-gray-500 dark:text-gray-400">
                                No donations yet. Start making a difference today!
                            </p>
                            <Link 
                                to="/donor/campaigns"
                                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Explore Campaigns
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonorDashboardPage;
