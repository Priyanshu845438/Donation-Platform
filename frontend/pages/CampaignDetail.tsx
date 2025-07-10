
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { Campaign } from '../types';
import { apiFetch } from '../utils/api';
import Button from '../components/common/Button';

const CampaignDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            if (!id) return;
            setIsLoading(true);
            try {
                const data = await apiFetch<{ campaign: Campaign }>(`/campaigns/${id}`);
                setCampaign(data.campaign);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch campaign details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-20 bg-background">
                <p className="text-red-500 bg-red-100 p-4 rounded-lg max-w-lg mx-auto">{error}</p>
                <Link to="/campaigns" className="mt-4 inline-block"><Button variant="primary">Back to Campaigns</Button></Link>
            </div>
        );
    }

    if (!campaign) {
        return <div className="text-center py-20 bg-background"><p>Campaign not found.</p></div>;
    }

    const percentage = campaign.goal > 0 ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0;

    return (
        <div className="bg-surface animate-fade-in">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    <div className="lg:col-span-3">
                        <div className="overflow-hidden rounded-xl shadow-lg">
                            <img src={campaign.imageUrl || `https://picsum.photos/seed/${campaign.id}/800/600`} alt={campaign.title} className="w-full h-auto object-cover" />
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <h1 className="text-3xl sm:text-4xl font-bold font-display text-text-primary">{campaign.title}</h1>
                        {campaign.ngo?.name && <p className="mt-2 text-lg text-text-secondary">by <span className="font-semibold text-primary">{campaign.ngo.name}</span></p>}

                        <div className="my-8">
                            <div className="flex justify-between items-end text-lg mb-2">
                                <span className="font-bold text-secondary text-2xl">${campaign.raised.toLocaleString()}</span>
                                <span className="text-text-secondary">raised of ${campaign.goal.toLocaleString()} goal</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div className="bg-secondary h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${percentage}%` }}>
                                    {percentage > 10 && `${percentage}%`}
                                </div>
                            </div>
                        </div>

                        <p className="text-text-secondary text-lg leading-relaxed">{campaign.description}</p>
                        
                        <div className="mt-10">
                            <Button size="lg" variant="accent" className="w-full">
                                <ion-icon name="heart-outline" className="mr-2"></ion-icon>
                                Donate Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail;
