


import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api.ts';
import type { Campaign } from '../../types.ts';
import Button from '../../components/Button.tsx';
import ProgressBar from '../../components/ProgressBar.tsx';
import ShareCampaignModal from '../../components/admin/ShareCampaignModal.tsx';
import { FiArrowLeft, FiEdit, FiCalendar, FiMapPin, FiHeart, FiTarget, FiUsers, FiDollarSign, FiTag, FiFileText, FiShare2, FiDownload, FiImage } from 'react-icons/fi';

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) => (
    <div className={`bg-white dark:bg-brand-dark p-4 rounded-lg shadow-md flex items-center gap-4 border-l-4 ${color}`}>
        <div className="text-2xl">{icon}</div>
        <div>
            <p className="text-xl font-bold text-gray-800 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
);

const DetailItem = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
     <div className="flex items-start gap-3 py-2">
        <div className="text-gray-400 mt-1">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <div className="text-gray-800 dark:text-gray-200">{children}</div>
        </div>
    </div>
);

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


const AdminCampaignDetailsPage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!campaignId) {
            setError("Campaign ID not provided.");
            setLoading(false);
            return;
        }

        const fetchCampaign = async () => {
            setLoading(true);
            try {
                const data = await adminAPI.getCampaignById(campaignId);
                if (!data) throw new Error("Campaign not found.");
                setCampaign(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch campaign details.");
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [campaignId]);

    if (loading) return <div className="text-center p-10">Loading campaign details...</div>;
    if (error) return <div className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">{error}</div>;
    if (!campaign) return <div className="text-center p-10">Campaign not found.</div>;
    
    const percentage = campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
    const daysLeft = Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));


    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Link to="/admin/campaigns" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                <FiArrowLeft /> Back to Campaign List
            </Link>

            {/* Header */}
            <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center gap-6">
                 <img src={campaign.thumbnail} alt={campaign.title} className="w-28 h-28 rounded-lg object-cover ring-4 ring-brand-gold" />
                <div className="flex-grow">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Campaign by <span className="font-semibold text-brand-gold">{campaign.organizer}</span></p>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{campaign.title}</h1>
                </div>
                 <div className="flex flex-wrap gap-2 self-start md:self-center">
                    <Button onClick={() => setIsShareModalOpen(true)} variant="outline"><FiShare2 className="mr-2"/>Share</Button>
                    <Button onClick={() => navigate(`/admin/campaigns/${campaign._id}/edit`)} variant="primary"><FiEdit className="mr-2"/>Edit Campaign</Button>
                </div>
            </div>

            {/* Stats & Progress */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={<FiDollarSign/>} label="Raised" value={`₹${campaign.raised.toLocaleString()}`} color="border-green-500"/>
                    <StatCard icon={<FiTarget/>} label="Goal" value={`₹${campaign.goal.toLocaleString()}`} color="border-blue-500"/>
                    <StatCard icon={<FiUsers/>} label="Donors" value={"N/A"} color="border-yellow-500"/>
                    <StatCard icon={<FiCalendar/>} label="Days Left" value={daysLeft > 0 ? `${daysLeft}` : 'Ended'} color="border-red-500"/>
                </div>
                <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow-md">
                     <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <span>Progress</span>
                        <span>{percentage}%</span>
                     </div>
                     <ProgressBar value={percentage} />
                </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2"><FiFileText/>Description</h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{campaign.fullDescription}</p>
                    </div>
                     <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2"><FiHeart/>The Story</h3>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{campaign.explainStory || "No story provided."}</p>
                    </div>
                    {campaign.images && campaign.images.length > 1 && (
                        <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2"><FiImage/>Campaign Gallery</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {campaign.images.slice(1).map(renderFilePreview)}
                            </div>
                        </div>
                    )}
                    {campaign.documents && campaign.documents.length > 0 && (
                         <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2"><FiDownload/>Documents</h3>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {campaign.documents.map(renderFilePreview)}
                            </div>
                        </div>
                    )}
                     {campaign.proofs && campaign.proofs.length > 0 && (
                        <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2"><FiImage/>Proofs of Work</h3>
                             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {campaign.proofs.map(renderFilePreview)}
                            </div>
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md self-start">
                     <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Key Details</h3>
                     <div className="space-y-3">
                        <DetailItem icon={<FiTag/>} label="Category">{campaign.category}</DetailItem>
                        <DetailItem icon={<FiMapPin/>} label="Location">{campaign.location}</DetailItem>
                        <DetailItem icon={<FiCalendar/>} label="End Date">{new Date(campaign.endDate).toLocaleDateString('en-GB')}</DetailItem>
                        <DetailItem icon={<FiUsers/>} label="Beneficiaries">{campaign.beneficiaries || "N/A"}</DetailItem>
                     </div>
                </div>
            </div>
            
            <ShareCampaignModal 
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                campaign={campaign}
            />
        </motion.div>
    );
};

export default AdminCampaignDetailsPage;