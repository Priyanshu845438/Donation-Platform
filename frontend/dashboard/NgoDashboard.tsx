
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../utils/api';
import { Campaign } from '../types';
import StatCard from '../components/dashboard/StatCard';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';

const NgoDashboard: React.FC = () => {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMyCampaigns = async () => {
            try {
                const data = await apiFetch<{ campaigns: Campaign[] }>('/campaigns/my-campaigns');
                setCampaigns(data.campaigns || []);
            } catch (err: any) {
                setError(err.message || "Failed to fetch campaigns.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyCampaigns();
    }, []);

    const totalRaised = campaigns.reduce((acc, c) => acc + c.raised, 0);
    const activeCampaigns = campaigns.filter(c => c.status === 'Active' || c.status === 'active').length;

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">NGO Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">
                    Welcome, <span className="font-semibold text-primary">{user?.fullName}</span>! Manage your impact.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard title="Total Campaigns" value={campaigns.length.toString()} icon="megaphone-outline" color="text-primary" />
                <StatCard title="Total Raised" value={`$${totalRaised.toLocaleString()}`} icon="cash-outline" color="text-secondary" />
                <StatCard title="Active Campaigns" value={activeCampaigns.toString()} icon="play-circle-outline" color="text-teal-500" />
            </div>

            <div className="bg-surface rounded-xl shadow-serene border border-border">
                <div className="p-4 border-b border-border md:flex md:items-center md:justify-between">
                    <h2 className="text-xl font-bold font-display text-text-primary">My Campaigns</h2>
                    <Link to="create-campaign">
                        <Button variant="primary" size="sm">
                            <ion-icon name="add-outline" className="mr-2"></ion-icon>
                            Create New Campaign
                        </Button>
                    </Link>
                </div>
                <div className="w-full overflow-x-auto">
                     {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <p className="p-6 text-center text-red-500">{error}</p>
                    ) : campaigns.length > 0 ? (
                        <table className="min-w-full text-sm text-left text-text-primary">
                            <thead className="bg-gray-50 text-xs text-text-secondary uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Title</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Raised / Goal</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {campaigns.map((campaign) => (
                                    <tr key={campaign.id} className="border-b border-border hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{campaign.title}</td>
                                        <td className="px-6 py-4"><StatusBadge status={campaign.status as any} /></td>
                                        <td className="px-6 py-4 font-mono">${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" className="p-2"><ion-icon name="eye-outline" className="text-xl"></ion-icon></Button>
                                            <Button variant="ghost" size="sm" className="p-2"><ion-icon name="pencil-outline" className="text-xl"></ion-icon></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                         <p className="p-6 text-center text-text-secondary">You haven't created any campaigns yet.</p>
                    )}
                </div>
            </div>

        </div>
    );
};

export default NgoDashboard;