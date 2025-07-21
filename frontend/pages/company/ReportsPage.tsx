
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/common/Button';

interface DonationReport {
    _id: string;
    amount: number;
    campaignId: {
        title: string;
    };
    ngoId: {
        ngoName: string;
    };
    status: string;
    createdAt: string;
}

interface ReportStats {
    totalDonations: number;
    totalAmount: number;
    activeCampaigns: number;
    impactMetrics: {
        beneficiariesReached: number;
        projectsSupported: number;
    };
}

const CompanyReportsPage: React.FC = () => {
    const { addToast } = useToast();
    const [donations, setDonations] = useState<DonationReport[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [donationsResponse, statsResponse] = await Promise.all([
                    apiFetch<{ donations: DonationReport[] }>('/company/donations'),
                    apiFetch<ReportStats>('/company/reports/stats')
                ]);
                
                setDonations(donationsResponse.donations);
                setStats(statsResponse);
            } catch (error: any) {
                addToast(error.message || 'Failed to fetch reports', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReports();
    }, [addToast, dateRange, selectedYear]);

    const exportReport = async (format: 'pdf' | 'excel') => {
        try {
            const response = await apiFetch(`/company/reports/export?format=${format}`, {
                method: 'GET',
            });
            addToast(`${format.toUpperCase()} report exported successfully!`, 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to export report', 'error');
        }
    };

    const filteredDonations = donations.filter(donation => {
        if (dateRange === 'all') return true;
        
        const donationDate = new Date(donation.createdAt);
        const currentYear = new Date().getFullYear();
        
        switch (dateRange) {
            case 'thisYear':
                return donationDate.getFullYear() === currentYear;
            case 'lastYear':
                return donationDate.getFullYear() === currentYear - 1;
            case 'custom':
                return donationDate.getFullYear() === selectedYear;
            default:
                return true;
        }
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">CSR Reports</h1>
                    <p className="mt-2 text-gray-600">Track your corporate social responsibility impact</p>
                </div>
                <div className="flex space-x-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Time</option>
                        <option value="thisYear">This Year</option>
                        <option value="lastYear">Last Year</option>
                        <option value="custom">Custom Year</option>
                    </select>
                    {dateRange === 'custom' && (
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary w-24"
                            min="2020"
                            max={new Date().getFullYear()}
                        />
                    )}
                    <Button variant="outline" size="sm" onClick={() => exportReport('pdf')}>
                        Export PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => exportReport('excel')}>
                        Export Excel
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Donations"
                        value={stats.totalDonations.toString()}
                        icon="💰"
                        color="text-green-600"
                    />
                    <StatCard
                        title="Total Amount"
                        value={`₹${stats.totalAmount.toLocaleString()}`}
                        icon="📊"
                        color="text-blue-600"
                    />
                    <StatCard
                        title="Active Campaigns"
                        value={stats.activeCampaigns.toString()}
                        icon="🎯"
                        color="text-purple-600"
                    />
                    <StatCard
                        title="Beneficiaries Reached"
                        value={stats.impactMetrics.beneficiariesReached.toString()}
                        icon="👥"
                        color="text-orange-600"
                    />
                </div>
            )}

            {/* Donation History Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Donation History</h2>
                </div>
                <div className="overflow-x-auto">
                    {filteredDonations.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Campaign
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        NGO
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredDonations.map((donation) => (
                                    <tr key={donation._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {donation.campaignId?.title || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {donation.ngoId?.ngoName || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                ₹{donation.amount.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                donation.status === 'completed' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : donation.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {donation.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(donation.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            No donations found for the selected period
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CompanyReportsPage;
