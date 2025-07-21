


import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedCampaign } from '../services/api.ts';
import type { Campaign } from '../types.ts';
import ProgressBar from '../components/ProgressBar.tsx';
import Button from '../components/Button.tsx';
import { FiLoader, FiHeart, FiShare2, FiArrowRight, FiFileText, FiImage } from 'react-icons/fi';

const ShareCampaignPage: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!shareId) return;
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const data = await getSharedCampaign(shareId);
                if (!data) {
                    throw new Error("Campaign not found or the link is invalid.");
                }
                setCampaign(data.campaign);
            } catch (err: any) {
                setError(err.message || 'Could not load campaign.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [shareId]);

    const handleShare = () => {
        if (navigator.share) {
          navigator.share({
            title: campaign?.title,
            text: `Support this cause: ${campaign?.description}`,
            url: window.location.href,
          }).catch(console.error);
        } else {
          navigator.clipboard.writeText(window.location.href);
          alert('Link copied to clipboard!');
        }
      };

    const renderFilePreview = (fileUrl: string, index: number) => {
        const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
        const fileName = fileUrl.split('/').pop();

        if (isImage) {
            return (
                <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
                    <img src={fileUrl} alt={`Campaign content ${index + 1}`} className="h-40 w-full object-cover transition-transform group-hover:scale-105"/>
                </a>
            );
        }
        return (
            <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer" className="block p-4 bg-gray-100 rounded-lg shadow-sm hover:shadow-lg transition-shadow text-center h-40 flex flex-col justify-center items-center">
                <FiFileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <span className="text-xs text-gray-600 truncate w-full block">{fileName}</span>
            </a>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center text-center p-4">
                <FiLoader className="animate-spin h-12 w-12 text-brand-gold mb-4" />
                <h1 className="text-2xl font-bold text-brand-deep-blue">Loading Campaign...</h1>
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Campaign Not Available</h1>
                <p className="text-lg text-warm-gray-700">{error || "This campaign may have ended or the link is invalid."}</p>
                <div className="mt-8">
                    <Button to="/">Go to Homepage</Button>
                </div>
            </div>
        );
    }

    const percentage = campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
    const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));


    return (
        <div className="bg-gray-50 font-sans antialiased">
            <div className="container mx-auto max-w-6xl p-4 md:p-8">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    <div className="grid lg:grid-cols-5">

                        {/* Image & Title Section */}
                        <div className="lg:col-span-3">
                            <img src={campaign.thumbnail} alt={campaign.title} className="w-full h-64 md:h-full object-cover" />
                        </div>

                        {/* Donation & Stats Section */}
                        <div className="lg:col-span-2 p-6 md:p-8 flex flex-col bg-gray-50/50">
                            <div className="flex items-center mb-4">
                                <img src={campaign.organizerLogo} alt={campaign.organizer} className="h-10 w-10 rounded-full mr-3 border-2 border-brand-gold/50" />
                                <div>
                                    <p className="text-sm text-gray-500">Campaign by</p>
                                    <p className="font-bold text-brand-deep-blue">{campaign.organizer}</p>
                                </div>
                            </div>
                            <h1 className="font-serif text-3xl font-extrabold text-brand-deep-blue mb-6">{campaign.title}</h1>
                            
                            <div className="space-y-4 flex-grow">
                                <div>
                                    <ProgressBar value={percentage} />
                                    <div className="flex justify-between items-end mt-2">
                                        <div>
                                            <span className="text-2xl font-bold text-brand-deep-blue">₹{campaign.raised.toLocaleString()}</span>
                                            <span className="text-gray-500 ml-1">raised</span>
                                        </div>
                                        <div className="text-right">
                                             <span className="font-bold text-lg text-gray-700">{percentage}%</span>
                                        </div>
                                    </div>
                                     <p className="text-sm text-gray-500 mt-1">of ₹{campaign.goal.toLocaleString()} goal</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-center border-t border-b py-4 my-4">
                                    <div>
                                        <p className="text-2xl font-bold text-brand-deep-blue">N/A</p>
                                        <p className="text-sm text-gray-500">Supporters</p>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-brand-deep-blue">{daysLeft > 0 ? daysLeft : 'Ended'}</p>
                                        <p className="text-sm text-gray-500">{daysLeft > 0 ? 'Days Left' : ''}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-auto pt-6 space-y-3">
                                <Button to={`/donate?campaign=${campaign._id}`} fullWidth className="text-lg py-4">
                                    Donate Now <FiHeart className="ml-2"/>
                                </Button>
                                <button onClick={handleShare} className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-100 transition-colors">
                                    <FiShare2 className="mr-2" /> Share Campaign
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Story Section */}
                    <div className="p-6 md:p-10">
                        <h2 className="font-serif text-2xl font-bold text-brand-deep-blue mb-4">Our Story</h2>
                        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                            <p>{campaign.fullDescription}</p>
                        </div>
                    </div>

                    <div className="p-6 md:p-10 pt-0 space-y-12">
                        {campaign.images && campaign.images.length > 1 && (
                            <section>
                                <h2 className="font-serif text-2xl font-bold text-brand-deep-blue mb-4 flex items-center gap-3"><FiImage /> Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {campaign.images.slice(1).map((img, index) => renderFilePreview(img, index))}
                                </div>
                            </section>
                        )}
                        {campaign.documents && campaign.documents.length > 0 && (
                            <section>
                                <h2 className="font-serif text-2xl font-bold text-brand-deep-blue mb-4 flex items-center gap-3"><FiFileText /> Documents</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {campaign.documents.map((doc, index) => renderFilePreview(doc, index))}
                                </div>
                            </section>
                        )}
                        {campaign.proofs && campaign.proofs.length > 0 && (
                            <section>
                                <h2 className="font-serif text-2xl font-bold text-brand-deep-blue mb-4 flex items-center gap-3"><FiHeart /> Proof of Work</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {campaign.proofs.map((proof, index) => renderFilePreview(proof, index))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                 <footer className="mt-8 text-center">
                    <p className="text-gray-500">
                        Want to explore more campaigns? 
                        <Link to="/" className="font-bold text-brand-gold hover:underline ml-1">Visit DonationHub <FiArrowRight className="inline"/></Link>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        &copy; {new Date().getFullYear()} DonationHub. Secure and transparent donations.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default ShareCampaignPage;