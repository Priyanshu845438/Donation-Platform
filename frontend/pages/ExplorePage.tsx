
import React, { useState, useEffect, useMemo } from 'react';
import CampaignCard from '../components/CampaignCard.tsx';
import SectionWrapper from '../components/SectionWrapper.tsx';
import { getPublicCampaigns } from '../services/api.ts';
import type { Campaign } from '../types.ts';

const ExplorePage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'All',
    location: 'All',
    status: 'All',
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getPublicCampaigns();
        setCampaigns(data);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const categoryMatch = filters.category === 'All' || campaign.category === filters.category;
      const locationMatch = filters.location === 'All' || campaign.location === filters.location;
      const statusMatch = filters.status === 'All' || (filters.status === 'Urgent' && campaign.urgent) || campaign.status === filters.status.toLowerCase();
      return categoryMatch && locationMatch && statusMatch;
    });
  }, [campaigns, filters]);

  const locations = useMemo(() => ['All', ...new Set(campaigns.map(c => c.location))], [campaigns]);
  const categories = useMemo(() => ['All', ...new Set(campaigns.map(c => c.category))], [campaigns]);

  return (
    <div className="bg-warm-gray dark:bg-brand-dark-200 font-sans min-h-screen">
      <div className="bg-white dark:bg-brand-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-extrabold text-navy-blue dark:text-white font-serif">Explore Campaigns</h1>
          <p className="mt-2 text-lg text-warm-gray-600 dark:text-gray-400">Find a cause that resonates with you and make a difference today.</p>

          {/* Filters */}
          <SectionWrapper className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-warm-gray-100 dark:bg-brand-dark-200 border border-gray-200 dark:border-gray-700">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-warm-gray-700 dark:text-gray-300">Category</label>
                <select id="category" name="category" onChange={handleFilterChange} value={filters.category} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-brand-dark dark:border-gray-600 focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm rounded-md">
                  {categories.map(cat => <option key={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-warm-gray-700 dark:text-gray-300">Location</label>
                <select id="location" name="location" onChange={handleFilterChange} value={filters.location} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-brand-dark dark:border-gray-600 focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm rounded-md">
                  {locations.map(loc => <option key={loc}>{loc}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-warm-gray-700 dark:text-gray-300">Status</label>
                <select id="status" name="status" onChange={handleFilterChange} value={filters.status} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:bg-brand-dark dark:border-gray-600 focus:outline-none focus:ring-sky-blue focus:border-sky-blue sm:text-sm rounded-md">
                  <option>All</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
          </SectionWrapper>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionWrapper>
            {loading ? (
                 <div className="text-center py-16">
                    <h2 className="text-xl font-semibold text-navy-blue dark:text-white">Loading Campaigns...</h2>
                 </div>
            ) : filteredCampaigns.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCampaigns.map(campaign => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <h2 className="text-xl font-semibold text-navy-blue dark:text-white">No Campaigns Found</h2>
                    <p className="mt-2 text-warm-gray-600 dark:text-gray-400">Try adjusting your filters or check back later!</p>
                </div>
            )}
        </SectionWrapper>
      </div>
    </div>
  );
};

export default ExplorePage;
