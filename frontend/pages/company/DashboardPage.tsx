
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { useToast } from '../../components/ui/Toast';

interface DashboardData {
    totalDonations: number;
    totalCampaignsSupported: number;
    totalAmount: number;
    recentDonations: any[];
}

const CompanyDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const response = await apiFetch<{ dashboard: DashboardData }>('/company/dashboard');
                setDashboardData(response.dashboard);
            } catch (error: any) {
                addToast(error.message || 'Failed to fetch dashboard data', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboard();
    }, [addToast]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
                <p className="mt-2 text-gray-600">
                    Welcome back, {user?.fullName}! Here's your CSR impact overview.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Donations"
                    value={dashboardData?.totalDonations.toString() || '0'}
                    icon="💰"
                    color="text-green-600"
                />
                <StatCard
                    title="Campaigns Supported"
                    value={dashboardData?.totalCampaignsSupported.toString() || '0'}
                    icon="📊"
                    color="text-blue-600"
                />
                <StatCard
                    title="Total Amount Donated"
                    value={`₹${dashboardData?.totalAmount.toLocaleString() || '0'}`}
                    icon="🎯"
                    color="text-purple-600"
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link to="/company/campaigns">
                        <Button variant="outline" className="w-full">
                            View Campaigns
                        </Button>
                    </Link>
                    <Link to="/company/ngos">
                        <Button variant="outline" className="w-full">
                            Browse NGOs
                        </Button>
                    </Link>
                    <Link to="/company/reports">
                        <Button variant="outline" className="w-full">
                            View Reports
                        </Button>
                    </Link>
                    <Link to="/company/profile">
                        <Button variant="outline" className="w-full">
                            Update Profile
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Recent Donations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Donations</h2>
                </div>
                <div className="p-6">
                    {dashboardData?.recentDonations && dashboardData.recentDonations.length > 0 ? (
                        <div className="space-y-4">
                            {dashboardData.recentDonations.map((donation, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{donation.campaignId?.title || 'Campaign'}</p>
                                        <p className="text-sm text-gray-600">{donation.ngoId?.ngoName || 'NGO'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">₹{donation.amount?.toLocaleString()}</p>
                                        <p className="text-sm text-gray-600">{new Date(donation.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No donations made yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboardPage;
