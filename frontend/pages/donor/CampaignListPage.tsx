
import React, { useState, useEffect } from 'react';
import CampaignCard from '../../components/CampaignCard.tsx';
import { getPublicCampaigns } from '../../services/api.ts';
import type { Campaign } from '../../types.ts';
import { FiLoader } from 'react-icons/fi';

const DonorCampaignListPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await getPublicCampaigns();
        setCampaigns(data.filter(c => c.status === 'active' && c.approvalStatus === 'approved'));
      } catch (error) {
        setError("Failed to fetch campaigns.");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Explore Campaigns</h1>
      <p className="text-gray-600 dark:text-gray-400">Find a cause that resonates with you and make a difference today.</p>

      {loading && (
        <div className="text-center py-16">
          <FiLoader className="animate-spin h-10 w-10 text-brand-gold mx-auto" />
          <h2 className="mt-4 text-xl font-semibold text-navy-blue dark:text-white">Loading Campaigns...</h2>
        </div>
      )}
      
      {!loading && error && <div className="text-center py-16 text-red-500">{error}</div>}

      {!loading && !error && (
        campaigns.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-xl font-semibold text-navy-blue dark:text-white">No Active Campaigns Found</h2>
            <p className="mt-2 text-warm-gray-600 dark:text-gray-400">Please check back later for new opportunities.</p>
          </div>
        )
      )}
    </div>
  );
};

export default DonorCampaignListPage;
