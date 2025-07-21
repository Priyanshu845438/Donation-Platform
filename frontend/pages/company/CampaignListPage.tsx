
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';

interface Campaign {
    _id: string;
    title: string;
    description: string;
    targetAmount: number;
    raisedAmount: number;
    status: string;
    ngoId: {
        ngoName: string;
        email: string;
    };
    images: string[];
    createdAt: string;
}

const CompanyCampaignListPage: React.FC = () => {
    const { addToast } = useToast();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await apiFetch<Campaign[]>('/company/campaigns');
                setCampaigns(response);
            } catch (error: any) {
                addToast(error.message || 'Failed to fetch campaigns', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCampaigns();
    }, [addToast]);

    const handleDonate = (campaignId: string) => {
        // Navigate to donation page or open donation modal
        console.log('Donate to campaign:', campaignId);
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        if (filter === 'all') return true;
        return campaign.status === filter;
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Available Campaigns</h1>
                    <p className="mt-2 text-gray-600">Support meaningful causes through our verified NGO partners</p>
                </div>
                <div className="flex space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="all">All Campaigns</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {filteredCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCampaigns.map((campaign) => (
                        <div key={campaign._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="h-48 bg-gray-200">
                                {campaign.images && campaign.images.length > 0 ? (
                                    <img
                                        src={campaign.images[0]}
                                        alt={campaign.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>
                                
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                                        <span>Raised</span>
                                        <span>{((campaign.raisedAmount / campaign.targetAmount) * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{ width: `${Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                                        <span>₹{campaign.raisedAmount.toLocaleString()}</span>
                                        <span>₹{campaign.targetAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">By: {campaign.ngoId.ngoName}</p>
                                        <p className="text-xs text-gray-500">{new Date(campaign.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleDonate(campaign._id)}
                                    >
                                        Donate Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No campaigns found</p>
                </div>
            )}
        </div>
    );
};

export default CompanyCampaignListPage;
