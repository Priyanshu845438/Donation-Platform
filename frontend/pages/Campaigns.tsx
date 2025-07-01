
import React, { useState, useMemo } from 'react';
import { MOCK_CAMPAIGNS } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import { Campaign } from '../types';


const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
    const percentage = Math.round((campaign.raised / campaign.goal) * 100);
    return (
        <Card className="flex flex-col group">
            <div className="overflow-hidden">
                <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 text-copy">{campaign.title}</h3>
                <p className="text-copy-muted mb-4 flex-grow">{campaign.description}</p>
                <div className="my-4">
                    <div className="flex justify-between items-center text-sm mb-1 text-copy-muted">
                        <span className="font-semibold text-primary-light">${campaign.raised.toLocaleString()} <span className="text-copy-muted font-normal">Raised</span></span>
                        <span className="">{percentage}%</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                     <p className="text-right text-sm text-copy-muted mt-1">Goal: ${campaign.goal.toLocaleString()}</p>
                </div>
                <Link to={`/campaigns/${campaign.id}`} className="mt-auto"><Button variant="secondary" className="w-full">View & Donate</Button></Link>
            </div>
        </Card>
    );
};


const Campaigns: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCampaigns = useMemo(() => {
        return MOCK_CAMPAIGNS.filter(campaign =>
            campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    return (
        <div className="bg-background">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-copy sm:text-5xl">Our Campaigns</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-copy-muted">
                        Find a cause that speaks to you. Every donation helps write a new story of hope.
                    </p>
                </div>

                <div className="mt-12 max-w-lg mx-auto">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                             <ion-icon name="search-outline" className="text-copy-muted"></ion-icon>
                        </div>
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-border rounded-lg leading-5 bg-surface placeholder-copy-muted text-copy focus:outline-none focus:placeholder-copy-muted/70 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                    {filteredCampaigns.length > 0 ? (
                        filteredCampaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))
                    ) : (
                        <div className="lg:col-span-3 text-center py-12">
                            <p className="text-lg text-copy-muted">No campaigns found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Campaigns;
