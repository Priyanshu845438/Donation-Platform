import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedProfile } from '../services/api.ts';
import type { User, Campaign } from '../types.ts';
import CampaignCard from '../components/CampaignCard.tsx';
import Button from '../components/Button.tsx';
import { FiMail, FiGlobe, FiMapPin, FiHeart, FiBriefcase, FiLoader } from 'react-icons/fi';

const generateCampaignsHtml = (campaigns: Campaign[]): string => {
    if (!campaigns || campaigns.length === 0) {
        return '<p style="text-align: center; color: #666;">No active campaigns at the moment.</p>';
    }
    return campaigns.map(campaign => {
        const percentage = campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
        return `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); background-color: white;">
            <img src="${campaign.images[0]}" alt="${campaign.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px;">
            <h3 style="font-size: 1.25rem; margin-top: 12px; margin-bottom: 4px; color: #003f5c;">${campaign.title}</h3>
            <p style="font-size: 0.9rem; color: #4a5568; margin-bottom: 12px;">by ${campaign.organizer}</p>
            <div style="background-color: #e2e8f0; border-radius: 9999px; height: 8px; overflow: hidden; margin-bottom: 8px;">
              <div style="background-color: #ffa600; height: 100%; width: ${percentage}%;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 600; color: #2d3748;">
              <span>Raised: ₹${campaign.raised.toLocaleString()}</span>
              <span>${percentage}%</span>
            </div>
        </div>
    `}).join('');
};


const ShareProfilePage: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [data, setData] = useState<{ user: User, campaigns: Campaign[], customization?: { html: string, css: string } } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!shareId) return;
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const profileData = await getSharedProfile(shareId);
                if (!profileData) {
                    throw new Error("Profile not found or the link is invalid.");
                }
                setData(profileData);
            } catch (err: any) {
                setError(err.message || 'Could not load profile.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [shareId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-light dark:bg-brand-dark flex flex-col items-center justify-center text-center p-4">
                <FiLoader className="animate-spin h-12 w-12 text-brand-gold mb-4" />
                <h1 className="text-2xl font-bold text-brand-deep-blue dark:text-white">Loading Profile...</h1>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-brand-light dark:bg-brand-dark flex flex-col items-center justify-center text-center p-4">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Profile Not Available</h1>
                <p className="text-lg text-warm-gray-700 dark:text-warm-gray-200">{error || "The profile you are looking for does not exist or the link may have expired."}</p>
                <div className="mt-8">
                    <Button to="/">Go to Homepage</Button>
                </div>
            </div>
        );
    }

    const { user, campaigns, customization } = data;

    if (customization && customization.html) {
        const replacements: Record<string, string | number> = {
            '{{USER_NAME}}': user.name || 'N/A',
            '{{USER_AVATAR}}': user.avatar || '',
            '{{USER_EMAIL}}': user.email || 'N/A',
            '{{USER_PHONE}}': user.phoneNumber || 'N/A',
            '{{PROFILE_DESCRIPTION}}': user.profile?.description || 'No description provided.',
            '{{PROFILE_WEBSITE}}': user.profile?.website || '#',
            '{{PROFILE_ADDRESS}}': user.profile?.address || user.profile?.companyAddress || 'N/A',
            '{{PROFILE_NGO_NAME}}': user.profile?.ngoName || user.name || 'N/A',
            '{{PROFILE_COMPANY_NAME}}': user.profile?.companyName || user.name || 'N/A',
            '{{PROFILE_REG_NUMBER}}': user.profile?.registrationNumber || 'N/A',
            '{{PROFILE_REG_YEAR}}': user.profile?.registeredYear || 'N/A',
            '{{PROFILE_EMPLOYEES}}': user.profile?.numberOfEmployees || 'N/A',
            '{{PROFILE_CEO_NAME}}': user.profile?.ceoName || 'N/A',
            '{{PROFILE_80G}}': user.profile?.is80GCertified ? 'Yes' : 'No',
            '{{PROFILE_12A}}': user.profile?.is12ACertified ? 'Yes' : 'No',
        };

        let finalHtml = customization.html;

        // Loop through replacements and apply them.
        for (const placeholder in replacements) {
            finalHtml = finalHtml.replace(new RegExp(placeholder, 'g'), String(replacements[placeholder]));
        }

        // Handle campaigns separately since it's a block of HTML.
        if (finalHtml.includes('{{CAMPAIGNS_HTML}}')) {
            const campaignsHtml = generateCampaignsHtml(campaigns);
            finalHtml = finalHtml.replace(/{{CAMPAIGNS_HTML}}/g, campaignsHtml);
        }

        const srcDoc = `
            <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>${customization.css}</style>
                </head>
                <body>${finalHtml}</body>
            </html>
        `;

        return (
            <iframe
                srcDoc={srcDoc}
                title={`${user.name}'s Profile`}
                className="w-full h-screen border-none"
                sandbox="allow-scripts allow-same-origin"
            />
        );
    }

    const roleIcon = user.role === 'ngo' 
        ? <FiHeart className="w-6 h-6 text-white" /> 
        : <FiBriefcase className="w-6 h-6 text-white" />;

    return (
        <div className="min-h-screen bg-brand-light dark:bg-brand-dark font-sans">
            {/* Header Section */}
            <header className="bg-brand-deep-blue dark:bg-brand-dark-200 relative text-white py-20 md:py-32">
                 <div className="absolute inset-0 bg-black opacity-30"></div>
                 <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full object-cover ring-8 ring-white/20 shadow-xl mb-6" />
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-brand-gold p-2 rounded-full">{roleIcon}</div>
                        <h1 className="text-4xl md:text-5xl font-extrabold font-serif">{user.name}</h1>
                    </div>
                    <p className="text-xl text-gray-300 capitalize">{user.role}</p>
                    <div className="mt-6 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-gray-300">
                        {user.profile?.address && <span className="flex items-center"><FiMapPin className="mr-2"/>{user.profile.address}</span>}
                        <a href={`mailto:${user.email}`} className="flex items-center hover:text-brand-gold"><FiMail className="mr-2"/>Email</a>
                        {user.profile?.website && <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-brand-gold"><FiGlobe className="mr-2"/>Website</a>}
                    </div>
                 </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                 {/* About Section */}
                <section className="bg-white dark:bg-brand-dark-200 p-8 rounded-lg shadow-lg -mt-24 md:-mt-32 z-10 relative">
                     <h2 className="text-2xl font-bold font-serif text-brand-deep-blue dark:text-white mb-4">About {user.name}</h2>
                     <p className="text-lg text-warm-gray-700 dark:text-gray-300 leading-relaxed">
                        {user.profile?.description || 'This user has not yet provided a description.'}
                     </p>
                </section>
                
                {/* Campaigns Section */}
                {user.role === 'ngo' && campaigns.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-3xl font-bold font-serif text-brand-deep-blue dark:text-white mb-8 text-center">Active Campaigns</h2>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {campaigns.map(campaign => (
                                <CampaignCard key={campaign.id} campaign={campaign} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer CTA */}
                <footer className="mt-20 text-center border-t dark:border-gray-700 pt-10">
                    <p className="text-xl font-semibold text-brand-deep-blue dark:text-white">
                        Want to see more or make a donation?
                    </p>
                    <div className="mt-6">
                        <Button to="/" variant="primary" className="text-lg">
                            Visit DonationHub
                        </Button>
                    </div>
                    <p className="text-sm text-warm-gray-600 dark:text-gray-400 mt-4">
                        &copy; {new Date().getFullYear()} Donation Hub. All rights reserved.
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default ShareProfilePage;