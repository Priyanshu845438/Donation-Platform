



import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCampaignById } from '../services/api.ts';
import type { Campaign } from '../types.ts';
import ProgressBar from '../components/ProgressBar.tsx';
import Button from '../components/Button.tsx';
import SectionWrapper from '../components/SectionWrapper.tsx';
import { FiShare2, FiCheckCircle, FiDownload, FiFileText, FiChevronLeft, FiChevronRight, FiCopy } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext.tsx';

const CampaignDetailsPage: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { addToast } = useToast();

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
  
  const renderFilePreview = (fileUrl: string, index: number) => {
    const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
    const fileName = fileUrl.split('/').pop();

    if (isImage) {
        return (
            <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer">
                <img src={fileUrl} alt={`Preview ${index+1}`} className="w-full h-32 object-cover rounded-lg shadow-md hover:opacity-80 transition-opacity" />
            </a>
        );
    }
    return (
        <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-32 bg-gray-100 dark:bg-brand-dark rounded-lg shadow-md p-4 flex flex-col items-center justify-center text-center hover:bg-gray-200 dark:hover:bg-brand-dark-200/80 transition-colors">
            <FiFileText className="h-10 w-10 text-gray-400 mb-2" />
            <span className="text-xs text-gray-600 dark:text-gray-300 truncate w-full">{fileName}</span>
        </a>
    );
  };

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

  const allImages = campaign.images;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentImageIndex((prevIndex) => {
        const nextIndex = prevIndex + newDirection;
        if (nextIndex < 0) return allImages.length - 1;
        if (nextIndex >= allImages.length) return 0;
        return nextIndex;
    });
  };

  const handleThumbnailClick = (index: number) => {
    setDirection(index > currentImageIndex ? 1 : -1);
    setCurrentImageIndex(index);
  };

  const handleCopyImageLink = () => {
    navigator.clipboard.writeText(allImages[currentImageIndex]);
    addToast('Image link copied to clipboard!', 'success');
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Support this cause: ${campaign.description}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Campaign link copied to clipboard!', 'success');
    }
  };

  const percentage = Math.round((campaign.raised / campaign.goal) * 100);

  return (
    <div className="bg-warm-gray dark:bg-brand-dark font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SectionWrapper>
          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                  {/* Image Slider */}
                  <div className="relative w-full h-96 bg-gray-200 dark:bg-brand-dark rounded-lg shadow-lg overflow-hidden">
                      <AnimatePresence initial={false} custom={direction}>
                          <motion.img
                              key={currentImageIndex}
                              src={allImages[currentImageIndex]}
                              custom={direction}
                              variants={variants}
                              initial="enter"
                              animate="center"
                              exit="exit"
                              transition={{
                                  x: { type: "spring", stiffness: 300, damping: 30 },
                                  opacity: { duration: 0.2 }
                              }}
                              className="absolute inset-0 w-full h-full object-cover"
                              alt={`${campaign.title} image ${currentImageIndex + 1}`}
                          />
                      </AnimatePresence>
                      
                      {allImages.length > 1 && (
                          <>
                              <button
                                  onClick={() => paginate(-1)}
                                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                  aria-label="Previous image"
                              >
                                  <FiChevronLeft size={24} />
                              </button>
                              <button
                                  onClick={() => paginate(1)}
                                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                                  aria-label="Next image"
                              >
                                  <FiChevronRight size={24} />
                              </button>
                          </>
                      )}

                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md z-10">
                          {currentImageIndex + 1} / {allImages.length}
                      </div>
                      <button onClick={handleCopyImageLink} className="absolute bottom-2 right-2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-brand-gold" title="Copy image link">
                          <FiCopy size={16}/>
                      </button>
                  </div>

                  {/* Thumbnails */}
                  {allImages.length > 1 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                          {allImages.map((img, index) => (
                              <div
                                  key={index}
                                  onClick={() => handleThumbnailClick(index)}
                                  className={`cursor-pointer rounded-md overflow-hidden h-20 w-full ring-2 transition-all ${
                                      currentImageIndex === index
                                          ? 'ring-brand-gold ring-offset-2 dark:ring-offset-brand-dark'
                                          : 'ring-transparent hover:ring-brand-gold/50'
                                  }`}
                              >
                                  <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-navy-blue dark:text-white mb-4">{campaign.title}</h1>
                <div className="prose prose-lg dark:prose-invert max-w-none text-warm-gray-700 dark:text-gray-300">
                    <p>{campaign.fullDescription}</p>
                </div>
              </div>
              
              {campaign.documents && campaign.documents.length > 0 && (
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold font-serif text-navy-blue dark:text-white mb-4">Supporting Documents</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {campaign.documents.map(renderFilePreview)}
                    </div>
                </div>
              )}

              {campaign.proofs && campaign.proofs.length > 0 && (
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold font-serif text-navy-blue dark:text-white mb-4">Proof of Work</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {campaign.proofs.map(renderFilePreview)}
                    </div>
                </div>
              )}

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