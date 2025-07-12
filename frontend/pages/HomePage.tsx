
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button.tsx';
import CampaignCard from '../components/CampaignCard.tsx';
import StatCard from '../components/StatCard.tsx';
import SectionWrapper from '../components/SectionWrapper.tsx';
import { TESTIMONIALS } from '../constants.ts';
import { getPublicCampaigns } from '../services/api.ts';
import type { Campaign } from '../types.ts';
import { FaHandHoldingHeart, FaUsers, FaCheckCircle, FaBuilding } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';

const HomePage: React.FC = () => {
  const [featuredCampaigns, setFeaturedCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const campaigns = await getPublicCampaigns();
        // Filter for active campaigns and take the first 3
        setFeaturedCampaigns(campaigns.filter(c => c.status === 'active').slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="bg-brand-light dark:bg-brand-dark font-sans text-warm-gray-700 dark:text-warm-gray-200">
      {/* Hero Section */}
      <section className="bg-brand-deep-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold font-serif tracking-tight">
            Support Verified Causes. <span className="text-brand-gold">Make an Impact Now.</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
            Join a community of changemakers. Donate with confidence to transparent, high-impact campaigns verified for your trust.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button to="/explore" variant="primary" className="text-lg">Explore Campaigns</Button>
            <Button to="/join-us" variant="outline" className="text-lg border-white text-white hover:bg-white/10">Join as Donor</Button>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="relative -mt-16 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionWrapper>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<FaHandHoldingHeart size={24} />} value="₹1.2 Cr+" label="Total Donations" />
                    <StatCard icon={<FaCheckCircle size={24} />} value="150+" label="Active Campaigns" />
                    <StatCard icon={<FaUsers size={24} />} value="85+" label="Verified NGOs" />
                    <StatCard icon={<FaBuilding size={24} />} value="20+" label="Companies Partnered" />
                </div>
            </SectionWrapper>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionWrapper>
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold font-serif text-navy-blue dark:text-white">Featured Campaigns</h2>
                    <p className="mt-4 text-lg text-warm-gray-600 dark:text-gray-400">Discover campaigns that need your urgent attention.</p>
                </div>
                {loading ? (
                  <div className="text-center py-12">Loading campaigns...</div>
                ) : (
                  <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {featuredCampaigns.map(campaign => (
                          <CampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                  </div>
                )}
                <div className="mt-12 text-center">
                    <Button to="/explore" variant="secondary">View All Campaigns</Button>
                </div>
              </SectionWrapper>
          </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white dark:bg-brand-dark-200 py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <SectionWrapper>
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                         <h2 className="text-3xl md:text-4xl font-bold font-serif text-navy-blue dark:text-white">Why Choose Donation Hub?</h2>
                         <p className="mt-4 text-lg text-warm-gray-600 dark:text-gray-400">We are committed to building a platform based on trust, transparency, and impact.</p>
                         <ul className="mt-8 space-y-4">
                            <li className="flex items-start">
                                <div className="flex-shrink-0"><FiCheck className="h-6 w-6 text-green-500 bg-green-100 dark:bg-green-900/50 rounded-full p-1"/></div>
                                <div className="ml-3">
                                    <h4 className="text-lg font-semibold text-navy-blue dark:text-gray-100">Government Compliant</h4>
                                    <p className="text-warm-gray-600 dark:text-gray-400">Fully compliant with all regulations, ensuring your donations are secure and legally sound.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div className="flex-shrink-0"><FiCheck className="h-6 w-6 text-green-500 bg-green-100 dark:bg-green-900/50 rounded-full p-1"/></div>
                                <div className="ml-3">
                                    <h4 className="text-lg font-semibold text-navy-blue dark:text-gray-100">Zero Platform Fees for NGOs</h4>
                                    <p className="text-warm-gray-600 dark:text-gray-400">We ensure maximum funds reach the cause. A small fee is charged to donors for platform upkeep.</p>
                                </div>
                            </li>
                            <li className="flex items-start">
                                <div className="flex-shrink-0"><FiCheck className="h-6 w-6 text-green-500 bg-green-100 dark:bg-green-900/50 rounded-full p-1"/></div>
                                <div className="ml-3">
                                    <h4 className="text-lg font-semibold text-navy-blue dark:text-gray-100">Verified Campaigns</h4>
                                    <p className="text-warm-gray-600 dark:text-gray-400">Every NGO and campaign undergoes a rigorous verification process before going live.</p>
                                </div>
                            </li>
                         </ul>
                    </div>
                    <div className="rounded-lg overflow-hidden">
                        <img src="https://picsum.photos/seed/chooseus/600/500" alt="Team discussing plans" className="object-cover w-full h-full shadow-lg rounded-lg"/>
                    </div>
                </div>
              </SectionWrapper>
          </div>
      </section>

      {/* Testimonials Section */}
       <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionWrapper>
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-navy-blue dark:text-white">Voices of Our Community</h2>
              <p className="mt-4 text-lg text-warm-gray-600 dark:text-gray-400">See what donors and partners are saying about us.</p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
              {TESTIMONIALS.map((testimonial) => (
                <div key={testimonial.id} className="bg-white dark:bg-brand-dark-200 p-8 rounded-lg shadow-lg">
                  <p className="text-warm-gray-700 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                  <div className="mt-6 flex items-center">
                    <img className="h-12 w-12 rounded-full" src={testimonial.avatar} alt={testimonial.name} />
                    <div className="ml-4">
                      <p className="font-semibold text-navy-blue dark:text-white">{testimonial.name}</p>
                      <p className="text-sm text-warm-gray-600 dark:text-gray-400">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-gold">
         <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-brand-deep-blue sm:text-4xl font-serif">
                <span className="block">Ready to make a difference?</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-900/80">
                Start your journey of giving today. Explore campaigns, start your own, or join our community of passionate donors.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
                <Link to="/donate" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-brand-gold bg-white hover:bg-blue-50">
                    Donate Now
                </Link>
                <Link to="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white bg-transparent hover:bg-white/20">
                    Start a Campaign
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
