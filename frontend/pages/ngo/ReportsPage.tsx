
import React, { useState, useEffect } from 'react';
import { ngoAPI } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { FiLoader, FiBarChart, FiTrendingUp, FiUsers, FiDollarSign } from 'react-icons/fi';

interface ReportsData {
    campaignPerformance: Array<{
        id: string;
        title: string;
        goalAmount: number;
        raisedAmount: number;
        donorCount: number;
        status: string;
    }>;
    summary: {
        totalCampaigns: number;
        totalRaised: number;
        totalDonors: number;
    };
}

const NgoReportsPage: React.FC = () => {
    const [reports, setReports] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await ngoAPI.getReports();
            setReports(response.data);
        } catch (error: any) {
            addToast(error.message || 'Failed to load reports', 'error');
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>

            {reports && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                                    <FiBarChart className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                        {reports.summary.totalCampaigns}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        Total Campaigns
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                                    <FiDollarSign className="text-green-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                        ₹{reports.summary.totalRaised.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        Total Raised
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                                    <FiUsers className="text-purple-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-800 dark:text-white">
                                        {reports.summary.totalDonors}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                        Total Donors
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign Performance */}
                    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FiTrendingUp className="text-brand-gold" />
                            Campaign Performance
                        </h2>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3">Campaign</th>
                                        <th className="px-6 py-3">Goal</th>
                                        <th className="px-6 py-3">Raised</th>
                                        <th className="px-6 py-3">Progress</th>
                                        <th className="px-6 py-3">Donors</th>
                                        <th className="px-6 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.campaignPerformance.map((campaign) => {
                                        const progress = (campaign.raisedAmount / campaign.goalAmount) * 100;
                                        return (
                                            <tr key={campaign.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                    {campaign.title}
                                                </td>
                                                <td className="px-6 py-4">₹{campaign.goalAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4">₹{campaign.raisedAmount.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                                        <div 
                                                            className="bg-brand-gold h-2.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{progress.toFixed(1)}%</span>
                                                </td>
                                                <td className="px-6 py-4">{campaign.donorCount}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {campaign.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NgoReportsPage;
