
import React, { useState, useEffect } from 'react';
import HeroSlider from '../components/home/HeroSlider';
import Testimonials from '../components/home/Testimonials';
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
        <Card className="flex flex-col">
            <div className="overflow-hidden h-48">
                <img src={campaign.imageUrl || `https://picsum.photos/seed/${campaign.id}/600/400`} alt={campaign.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold font-display mb-2 text-text-primary">{campaign.title}</h3>
                <p className="text-text-secondary mb-4 text-sm flex-grow">{(campaign.description || '').substring(0, 100)}...</p>
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
                    <Button variant="accent" className="w-full">Donate Now</Button>
                </Link>
            </div>
        </Card>
    );
};

const Home: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setIsLoading(true);
                const data = await apiFetch<{ campaigns: Campaign[] }>('/campaigns?limit=3&status=active');
                setCampaigns(data.campaigns || []);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch campaigns.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    const WhyUsItems = [
        { icon: "shield-checkmark-outline", title: "Verified Campaigns", description: "Every campaign is vetted for authenticity and transparency." },
        { icon: "trending-up-outline", title: "Real-Time Impact", description: "Track your donation and see the immediate difference it makes." },
        { icon: "earth-outline", title: "Global Community", description: "Join millions of users worldwide in a mission to create positive change." },
    ];

    return (
        <div className="bg-background">
            <HeroSlider />

            {/* Featured Campaigns Section */}
            <section className="py-16 sm:py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold font-display text-text-primary sm:text-4xl">Featured Campaigns</h2>
                        <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
                            Support causes that are making a real impact right now. Your contribution can change lives.
                        </p>
                    </div>
                    <div className="mt-12">
                        {isLoading && (
                            <div className="flex justify-center items-center h-48">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                            </div>
                        )}
                        {error && <p className="text-center text-red-400">{error}</p>}
                        {!isLoading && !error && (
                             <div className="grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                                {campaigns.map(campaign => (
                                    <CampaignCard key={campaign.id} campaign={campaign} />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/campaigns"><Button size="lg" variant="outline">View All Campaigns</Button></Link>
                    </div>
                </div>
            </section>
            
            {/* About Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
                    <div className="animate-slide-in-up">
                        <h2 className="text-3xl font-bold font-display text-text-primary sm:text-4xl">About CharityPlus</h2>
                        <p className="mt-4 text-lg text-text-secondary">
                           CharityPlus was founded on a simple but powerful idea: that everyone, everywhere, should have the power to make a positive impact. We are a technology platform dedicated to connecting compassionate donors, dedicated NGOs, and socially responsible companies to create a global network of giving.
                        </p>
                         <p className="mt-4 text-lg text-text-secondary">
                           Our mission is to foster transparency, trust, and efficiency in the charitable sector, ensuring that every donation reaches its intended cause and creates meaningful, lasting change.
                        </p>
                        <div className="mt-8">
                            <Link to="/about"><Button size="lg" variant="primary">Learn More About Us</Button></Link>
                        </div>
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-xl animate-slide-in-up" style={{animationDelay: '0.2s'}}>
                        <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop" alt="Team working" className="w-full h-full object-cover"/>
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="py-16 sm:py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold font-display text-text-primary sm:text-4xl">Why Choose Us?</h2>
                    <p className="mt-4 text-lg text-text-secondary max-w-2xl mx-auto">
                        We provide a secure, transparent, and effective platform for all your charitable giving.
                    </p>
                    <div className="mt-12 grid md:grid-cols-3 gap-10">
                        {WhyUsItems.map((item, index) => (
                             <div key={item.title} className="p-8 bg-surface border border-transparent rounded-2xl hover:shadow-xl hover:border-border transition-all duration-300 animate-slide-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-primary/10 text-primary rounded-full">
                                    <ion-icon name={item.icon} className="text-4xl"></ion-icon>
                                </div>
                                <h3 className="mt-6 text-xl font-bold font-display text-text-primary">{item.title}</h3>
                                <p className="mt-2 text-text-secondary">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <Testimonials />

            {/* CTA Section */}
            <section className="bg-gray-100">
                 <div className="max-w-5xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-bold font-display text-text-primary">
                            Join Our Mission Today
                        </h2>
                        <p className="mt-4 text-lg text-text-secondary">
                            Become part of a community that's actively shaping a better future. Whether you donate, start a campaign, or partner with us, your action matters.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <Link to="/campaigns">
                                <Button size="lg" variant="primary">
                                    Find a Cause
                                </Button>
                            </Link>
                             <Link to="/signup">
                                <Button size="lg" variant="accent">
                                    Become a Member
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
