
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { campaignAPI } from '../../services/api.ts';
import Button from '../../components/Button.tsx';
import { AuthContext } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const CreateCampaignPage: React.FC = () => {
    const { user: ngoUser } = useContext(AuthContext);
    const { addToast } = useToast();
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        fullDescription: '',
        category: 'Education',
        targetAmount: '',
        endDate: '',
        location: '',
    });
    
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImageFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const dataToSubmit = {
            ...formData,
            ngoId: ngoUser?._id,
        };

        try {
            const response = await campaignAPI.create(dataToSubmit);
            const newCampaignId = response?.campaign?._id;

            if (!newCampaignId) {
                throw new Error("Campaign created, but no ID was returned.");
            }
            
            if (imageFiles.length > 0) {
                addToast('Campaign details saved! Uploading images...', 'info');
                const imageFormData = new FormData();
                imageFiles.forEach(file => imageFormData.append('images', file));
                await campaignAPI.uploadImages(newCampaignId, imageFormData);
            }

            addToast('Campaign submitted for approval!', 'success');
            navigate('/ngo/campaigns');
        } catch (err: any) {
            const msg = err.message || 'Failed to create campaign.';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/ngo/campaigns" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                <FiArrowLeft /> Back to My Campaigns
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New Campaign</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">{error}</div>}
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input name="title" value={formData.title} onChange={handleChange} placeholder="Campaign Title" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short Description (max 150 characters)" required maxLength={150} className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-20" />
                        <textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange} placeholder="Full Story / Detailed Explanation" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-32" />
                        <select name="category" value={formData.category} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Environment">Environment</option>
                            <option value="Disaster Relief">Disaster Relief</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} placeholder="Fundraising Goal (₹)" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., City, State)" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    </div>
                </div>
                 <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Images</h2>
                     <input type="file" multiple onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/20 file:text-brand-gold hover:file:bg-brand-gold/30"/>
                </div>
                
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        <FiSave className="mr-2"/>
                        {loading ? 'Submitting...' : 'Submit for Approval'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateCampaignPage;