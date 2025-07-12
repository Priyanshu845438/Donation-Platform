
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaignById } from '../services/api.ts';
import type { Campaign } from '../types.ts';
import ProgressBar from '../components/ProgressBar.tsx';
import Button from '../components/Button.tsx';
import SectionWrapper from '../components/SectionWrapper.tsx';
import { FiShare2, FiCheckCircle } from 'react-icons/fi';

const CampaignDetailsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!campaignId) {
        setError('No campaign ID provided.');
        setLoading(false);
        return;
    }

    const fetchCampaign = async () => {
      try {
        const foundCampaign = await getCampaignById(campaignId);
        if (foundCampaign) {
          setCampaign(foundCampaign);
        } else {
          setError('Campaign not found.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load campaign data. There might be a network error.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  if (loading) {
    return <div className="text-center py-20">Loading campaign details...</div>;
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-navy-blue dark:text-white">{error || 'Campaign not found'}</h2>
        <p className="mt-4 text-warm-gray-600 dark:text-gray-400">The campaign you are looking for does not exist or may have been removed.</p>
        <div className="mt-6">
          <Button to="/explore">Back to Campaigns</Button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((campaign.raised / campaign.goal) * 100);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Support this cause: ${campaign.description}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="bg-warm-gray dark:bg-brand-dark font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionWrapper>
          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            
            <div className="lg:col-span-2">
              <div className="mb-8">
                <img src={campaign.images[0]} alt={campaign.title} className="w-full h-auto object-cover rounded-lg shadow-lg" />
              </div>
              <div className="grid grid-cols-3 gap-4 mb-8">
                {campaign.images.slice(1, 4).map((img, index) => (
                    <img key={index} src={img} alt={`${campaign.title} ${index+2}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
                ))}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold font-serif text-navy-blue dark:text-white mb-4">{campaign.title}</h1>
              <div className="prose prose-lg dark:prose-invert max-w-none text-warm-gray-700 dark:text-gray-300">
                <p>{campaign.fullDescription}</p>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-xl">
                <div className="flex items-center mb-4">
                  <img src={campaign.organizerLogo} alt={campaign.organizer} className="h-12 w-12 rounded-full mr-4" />
                  <div>
                    <p className="text-sm text-warm-gray-600 dark:text-gray-400">Organized by</p>
                    <Link to={`/profile/${campaign.organizer.toLowerCase().replace(/\s+/g, '_')}`} className="font-semibold text-navy-blue dark:text-white flex items-center hover:underline">{campaign.organizer} {campaign.verified && <FiCheckCircle title="Verified" className="ml-2 text-green-500"/>}</Link>
                  </div>
                </div>
                
                <ProgressBar value={percentage} />
                <div className="mt-4">
                  <p className="text-2xl font-bold text-navy-blue dark:text-white">₹{campaign.raised.toLocaleString()}</p>
                  <p className="text-warm-gray-600 dark:text-gray-400">raised of ₹{campaign.goal.toLocaleString()} goal</p>
                </div>

                <div className="mt-6">
                    <Button to={`/donate?campaign=${campaign._id}`} className="w-full text-lg">Donate Now</Button>
                </div>
                
                <button onClick={handleShare} className="mt-4 w-full flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-warm-gray-700 dark:text-gray-200 bg-white dark:bg-brand-dark hover:bg-gray-100 dark:hover:bg-brand-dark/80 transition-colors">
                    <FiShare2 className="mr-2" /> Share Campaign
                </button>

                <div className="mt-6 text-center">
                    <h4 className="font-semibold text-navy-blue dark:text-white">Recent Supporters</h4>
                    <p className="text-sm text-warm-gray-500 dark:text-gray-400 mt-2">Feature coming soon!</p>
                </div>
              </div>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </div>
  );
};

export default CampaignDetailsPage;
