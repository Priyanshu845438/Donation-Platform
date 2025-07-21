
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { campaignAPI } from '../../services/api.ts';
import type { Campaign } from '../../types.ts';
import { AuthContext } from '../../context/AuthContext.tsx';
import Button from '../../components/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const EditCampaignPage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { user: ngoUser } = useContext(AuthContext);
    const { addToast } = useToast();
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchCampaign = useCallback(async () => {
        if (!campaignId) {
            setError('No campaign ID provided.');
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const campaignData = await campaignAPI.getById(campaignId);
            if (!campaignData || campaignData.organizerId !== ngoUser?._id) {
                throw new Error('Campaign not found or you do not have permission to edit it.');
            }
            setFormData({
                ...campaignData,
                targetAmount: campaignData.goal,
                endDate: campaignData.endDate.split('T')[0]
            });
        } catch (err: any) {
            setError(err.message);
            addToast(err.message, 'error');
            navigate('/ngo/campaigns');
        } finally {
            setLoading(false);
        }
    }, [campaignId, addToast, ngoUser, navigate]);

    useEffect(() => {
        fetchCampaign();
    }, [fetchCampaign]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignId) return;
        
        setError('');
        setSaving(true);
        
        try {
            await campaignAPI.update(campaignId, formData);
            addToast('Campaign details updated successfully!', 'success');
            navigate('/ngo/campaigns');
        } catch (err: any) {
            const msg = err.message || 'Failed to update campaign details.';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading campaign data...</div>;
    if (error && !formData.title) return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;

    return (
        <div className="space-y-6">
            <Link to="/ngo/campaigns" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                <FiArrowLeft /> Back to My Campaigns
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Campaign: <span className="text-brand-gold">{formData.title}</span></h1>
            
            <form onSubmit={handleSubmitDetails} className="space-y-6 bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Campaign Title" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Short Description" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-24" />
                    <textarea name="fullDescription" value={formData.fullDescription || ''} onChange={handleChange} placeholder="Full Story" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-32" />
                    <select name="category" value={formData.category || 'Education'} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                        <option>Education</option>
                        <option>Health</option>
                        <option>Environment</option>
                        <option>Disaster Relief</option>
                        <option>Other</option>
                    </select>
                    <input type="number" name="targetAmount" value={formData.targetAmount || ''} onChange={handleChange} placeholder="Fundraising Goal (₹)" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    <input type="date" name="endDate" value={formData.endDate || ''} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    <input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Location" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving}>
                        <FiSave className="mr-2"/>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditCampaignPage;