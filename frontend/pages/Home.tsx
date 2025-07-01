
import React from 'react';
import HeroSlider from '../components/home/HeroSlider';
import Testimonials from '../components/home/Testimonials';
import { MOCK_CAMPAIGNS } from '../utils/constants';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const CampaignCard: React.FC<{ campaign: typeof MOCK_CAMPAIGNS[0] }> = ({ campaign }) => {
    const percentage = Math.round((campaign.raised / campaign.goal) * 100);
    return (
        <Card>
            <div className="overflow-hidden">
                <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-48 object-cover transition-transform duration-500 hover:scale-105" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-2 text-copy">{campaign.title}</h3>
                <p className="text-copy-muted mb-4 h-12 overflow-hidden">{campaign.description}</p>
                <div className="my-4">
                    <div className="flex justify-between items-center text-sm mb-1 text-copy-muted">
                        <span className="font-semibold text-primary-light">${campaign.raised.toLocaleString()} <span className="text-copy-muted font-normal">Raised</span></span>
                        <span>Goal: ${campaign.goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                </div>
                <Link to={`/campaigns/${campaign.id}`} className="mt-auto"><Button variant="secondary" className="w-full">Donate Now</Button></Link>
            </div>
        </Card>
    );
};

const Home: React.FC = () => {
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
                        <h2 className="text-3xl font-extrabold text-copy sm:text-4xl">Featured Campaigns</h2>
                        <p className="mt-4 text-lg text-copy-muted max-w-2xl mx-auto">
                            Support causes that are making a real impact right now. Your contribution can change lives.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1">
                        {MOCK_CAMPAIGNS.slice(0, 3).map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link to="/campaigns"><Button size="lg" variant="outline">View All Campaigns</Button></Link>
                    </div>
                </div>
            </section>
            
            {/* About Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
                    <div className="animate-fade-in-up">
                        <h2 className="text-3xl font-extrabold text-copy sm:text-4xl">About CharityPlus</h2>
                        <p className="mt-4 text-lg text-copy-muted">
                           CharityPlus was founded on a simple but powerful idea: that everyone, everywhere, should have the power to make a positive impact. We are a technology platform dedicated to connecting compassionate donors, dedicated NGOs, and socially responsible companies to create a global network of giving.
                        </p>
                         <p className="mt-4 text-lg text-copy-muted">
                           Our mission is to foster transparency, trust, and efficiency in the charitable sector, ensuring that every donation reaches its intended cause and creates meaningful, lasting change.
                        </p>
                        <div className="mt-8">
                            <Link to="/about"><Button size="lg" variant="primary">Learn More About Us</Button></Link>
                        </div>
                    </div>
                    <div className="rounded-lg overflow-hidden shadow-2xl animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                        <img src="https://picsum.photos/seed/teamwork/800/600" alt="Team working" className="w-full h-full object-cover"/>
                    </div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="py-16 sm:py-24 bg-surface">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-extrabold text-copy sm:text-4xl">Why Choose Us?</h2>
                    <p className="mt-4 text-lg text-copy-muted max-w-2xl mx-auto">
                        We provide a secure, transparent, and effective platform for all your charitable giving.
                    </p>
                    <div className="mt-12 grid md:grid-cols-3 gap-10">
                        {WhyUsItems.map((item, index) => (
                             <div key={item.title} className="p-8 border border-border rounded-xl hover:border-primary/50 hover:bg-background transition-all duration-300 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-primary/10 text-primary-light rounded-full">
                                    <ion-icon name={item.icon} className="text-4xl"></ion-icon>
                                </div>
                                <h3 className="mt-6 text-xl font-bold text-copy">{item.title}</h3>
                                <p className="mt-2 text-copy-muted">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            <Testimonials />

            {/* CTA Section */}
            <section className="bg-background">
                <div className="max-w-4xl mx-auto py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-copy">
                        Join Our Mission Today
                    </h2>
                    <p className="mt-4 text-lg text-copy-muted">
                        Become part of a community that's actively shaping a better future. Whether you donate, start a campaign, or partner with us, your action matters.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link to="/campaigns">
                            <Button size="lg" variant="primary">
                                Find a Cause
                            </Button>
                        </Link>
                         <Link to="/signup">
                            <Button size="lg" variant="secondary">
                                Become a Member
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;