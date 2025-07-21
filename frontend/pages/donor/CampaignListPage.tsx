
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { FiSearch, FiFilter, FiHeart, FiLoader } from 'react-icons/fi';

interface Campaign {
    _id: string;
    title: string;
    description: string;
    targetAmount: number;
    raisedAmount: number;
    endDate: string;
    category: string;
    ngoId: {
        organizationName: string;
    };
    campaignImage?: string;
}

const DonorCampaignListPage: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { addToast } = useToast();

    const categories = [
        'Education', 'Healthcare', 'Environment', 'Poverty', 'Animals', 
        'Disaster Relief', 'Human Rights', 'Children', 'Elderly', 'Other'
    ];

    useEffect(() => {
        fetchCampaigns();
    }, [page, search, category]);

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12'
            });
            
            if (search) params.append('search', search);
            if (category) params.append('category', category);

            const response = await fetch(`/api/donor/campaigns?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCampaigns(data.data.campaigns);
                setTotalPages(data.data.pagination.pages);
            } else {
                throw new Error('Failed to fetch campaigns');
            }
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchCampaigns();
    };

    const getProgressPercentage = (raised: number, target: number) => {
        return Math.min((raised / target) * 100, 100);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Explore Campaigns
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Find causes you care about and make a difference.
                </p>
            </div>

            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="md:w-48">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Campaigns Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map((campaign) => (
                            <div key={campaign._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                                    {campaign.campaignImage && (
                                        <img
                                            src={campaign.campaignImage}
                                            alt={campaign.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                                            {campaign.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {campaign.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                                        By {campaign.ngoId.organizationName}
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                        {campaign.description}
                                    </p>
                                    
                                    {/* Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                            <span className="text-gray-900 dark:text-white font-semibold">
                                                {getProgressPercentage(campaign.raisedAmount, campaign.targetAmount).toFixed(0)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-sm mt-1">
                                            <span className="text-green-600 font-semibold">
                                                ${campaign.raisedAmount.toLocaleString()}
                                            </span>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                of ${campaign.targetAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Ends: {new Date(campaign.endDate).toLocaleDateString()}
                                        </span>
                                        <Link
                                            to={`/campaigns/${campaign._id}`}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <FiHeart className="mr-2" />
                                            Donate
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DonorCampaignListPage;
