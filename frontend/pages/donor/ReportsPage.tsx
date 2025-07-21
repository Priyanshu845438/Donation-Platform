
import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { FiLoader, FiDownload, FiTrendingUp, FiPieChart } from 'react-icons/fi';

interface ReportData {
    year: number;
    monthlyStats: Array<{ _id: number; amount: number; count: number }>;
    categoryStats: Array<{ _id: string; amount: number; count: number }>;
    topNgos: Array<{ _id: string; ngoName: string; amount: number; count: number }>;
    totalStats: { totalAmount: number; totalCount: number; avgAmount: number };
}

const DonorReportsPage: React.FC = () => {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const { addToast } = useToast();

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    useEffect(() => {
        fetchReports();
    }, [selectedYear]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/donor/reports?year=${selectedYear}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReportData(data.data);
            } else {
                throw new Error('Failed to fetch reports');
            }
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= currentYear - 5; year--) {
            years.push(year);
        }
        return years;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Donation Reports
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Track your giving impact and history.
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        {generateYearOptions().map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <FiDownload className="mr-2" />
                        Export
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FiTrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Donated
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${reportData?.totalStats.totalAmount.toLocaleString() || '0'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FiPieChart className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Total Donations
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {reportData?.totalStats.totalCount || 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <FiTrendingUp className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Average Donation
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                ${reportData?.totalStats.avgAmount.toFixed(2) || '0'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Donations Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Donations ({selectedYear})
                </h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                    {monthNames.map((month, index) => {
                        const monthData = reportData?.monthlyStats.find(stat => stat._id === index + 1);
                        const amount = monthData?.amount || 0;
                        const maxAmount = Math.max(...(reportData?.monthlyStats.map(s => s.amount) || [1]));
                        const height = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;

                        return (
                            <div key={month} className="flex flex-col items-center flex-1">
                                <div className="w-full flex flex-col items-center">
                                    <div
                                        className="w-full bg-blue-500 rounded-t"
                                        style={{ height: `${height}%` }}
                                        title={`${month}: $${amount.toLocaleString()}`}
                                    ></div>
                                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        {month}
                                    </div>
                                    <div className="text-xs font-semibold text-gray-900 dark:text-white">
                                        ${amount.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Donations by Category
                    </h3>
                    <div className="space-y-3">
                        {reportData?.categoryStats.map((category, index) => {
                            const maxAmount = Math.max(...(reportData?.categoryStats.map(c => c.amount) || [1]));
                            const percentage = maxAmount > 0 ? (category.amount / maxAmount) * 100 : 0;
                            const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'];

                            return (
                                <div key={category._id} className="flex items-center">
                                    <div className="w-24 text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {category._id}
                                    </div>
                                    <div className="flex-1 mx-3">
                                        <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${colors[index % colors.length]}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div className="w-20 text-sm font-semibold text-gray-900 dark:text-white text-right">
                                        ${category.amount.toLocaleString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top NGOs */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Top NGOs Supported
                    </h3>
                    <div className="space-y-4">
                        {reportData?.topNgos.map((ngo, index) => (
                            <div key={ngo._id} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {ngo.ngoName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {ngo.count} donations
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                    ${ngo.amount.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorReportsPage;
