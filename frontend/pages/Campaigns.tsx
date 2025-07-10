
import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import { Campaign } from '../types';
import { apiFetch } from '../utils/api';

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const raised = campaign.raised || 0;
    const goal = campaign.goal || 0;
    const percentage = goal > 0 ? Math.max(0, Math.min(100, Math.round((raised / goal) * 100))) : 0;
    
    return (
        <Card className="flex flex-col group">
            <div className="overflow-hidden h-56">
                <img src={campaign.imageUrl || `https://picsum.photos/seed/${campaign.id}/600/400`} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold font-display mb-2 text-text-primary">{campaign.title}</h3>
                <p className="text-text-secondary mb-4 flex-grow text-sm">{(campaign.description || '').substring(0, 120)}...</p>
                <div className="my-4">
                    <div className="flex justify-between items-center text-sm mb-1 text-text-secondary">
                        <span className="font-semibold text-secondary">${raised.toLocaleString()} <span className="text-text-secondary font-normal">Raised</span></span>
                        <span className="font-bold">{percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                     <p className="text-right text-xs text-text-secondary mt-1">Goal: ${goal.toLocaleString()}</p>
                </div>
                <Link to={`/campaigns/${campaign.id}`} className="mt-auto block">
                    <Button variant="accent" className="w-full">View & Donate</Button>
                </Link>
            </div>
        </Card>
    );
};

const CATEGORIES = ['all', 'education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other'];

const Campaigns: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState('all');

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const query = category === 'all' ? '' : `?category=${category}`;
                const data = await apiFetch<{ campaigns: Campaign[] }>(`/campaigns${query}`);
                setCampaigns(data.campaigns || []);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch campaigns.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaigns();
    }, [category]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(campaign =>
            campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (campaign.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, campaigns]);

    return (
        <div className="bg-background">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold font-display text-text-primary sm:text-5xl">Our Campaigns</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                        Find a cause that speaks to you. Every donation helps write a new story of hope.
                    </p>
                </div>

                <div className="mt-12 max-w-4xl mx-auto">
                    <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <ion-icon name="search-outline" className="text-text-secondary"></ion-icon>
                        </div>
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg leading-5 bg-surface placeholder-text-secondary text-text-primary focus:outline-none focus:placeholder-text-secondary/70 focus:ring-1 focus:ring-primary sm:text-sm"
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat}
                                variant={category === cat ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setCategory(cat)}
                                className="capitalize"
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="mt-12">
                    {isLoading && (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                        </div>
                    )}
                    {error && <p className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</p>}
                    {!isLoading && !error && (
                         <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                            {filteredCampaigns.length > 0 ? (
                                filteredCampaigns.map(campaign => (
                                    <CampaignCard key={campaign.id} campaign={campaign} />
                                ))
                            ) : (
                                <div className="lg:col-span-3 text-center py-12 bg-surface rounded-lg">
                                    <p className="text-lg text-text-secondary">No campaigns found matching your search or filter.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Campaigns;
