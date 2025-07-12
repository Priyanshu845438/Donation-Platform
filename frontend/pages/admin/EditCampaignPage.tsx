
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { User, Campaign } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const EditCampaignPage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const [formData, setFormData] = useState<any>({});
    const [ngos, setNgos] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNgos = async () => {
            try {
                const ngoList = await adminAPI.getNgos();
                setNgos(ngoList);
            } catch (err) {
                setError('Failed to load NGOs.');
            }
        };
        
        const fetchCampaign = async () => {
            if (!campaignId) {
                setError('No campaign ID provided.');
                setLoading(false);
                return;
            }
            try {
                const campaignData = await adminAPI.getCampaignById(campaignId);
                if (!campaignData) {
                    throw new Error('Campaign not found.');
                }
                setFormData({
                    ...campaignData,
                    ngoId: campaignData.ngoId?._id || ''
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchNgos();
        fetchCampaign();
    }, [campaignId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignId) return;
        
        setError('');
        setSaving(true);
        
        const dataToSubmit = { ...formData, goalAmount: formData.targetAmount };

        try {
            await adminAPI.updateCampaign(campaignId, dataToSubmit);
            navigate('/admin/campaigns');
        } catch (err: any) {
            setError(err.message || 'Failed to update campaign.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div>Loading campaign data...</div>;
    }
    
    if (error && !formData.title) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <Link to="/admin/campaigns" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                <FiArrowLeft /> Back to Campaign List
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Campaign: <span className="text-brand-gold">{formData.title}</span></h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Campaign Title" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input name="campaignName" value={formData.campaignName || ''} onChange={handleChange} placeholder="Campaign Name (Internal)" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Short Description" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-24" />
                        <select name="category" value={formData.category || 'Education'} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option>Education</option>
                            <option>Health</option>
                            <option>Environment</option>
                            <option>Disaster Relief</option>
                            <option>Other</option>
                        </select>
                        <input type="number" name="targetAmount" value={formData.targetAmount || 0} onChange={handleChange} placeholder="Fundraising Goal (₹)" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input type="date" name="endDate" value={formData.endDate?.split('T')[0] || ''} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input name="location" value={formData.location || ''} onChange={handleChange} placeholder="Location" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <select name="ngoId" value={formData.ngoId || ''} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option value="">Select Organizer NGO</option>
                            {ngos.map(ngo => <option key={ngo._id} value={ngo._id}>{ngo.fullName}</option>)}
                        </select>
                        <input name="contactNumber" value={formData.contactNumber || ''} onChange={handleChange} placeholder="Contact Number" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Story</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <textarea name="beneficiaries" value={formData.beneficiaries || ''} onChange={handleChange} placeholder="Who are the beneficiaries?" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-20" />
                        <textarea name="importance" value={formData.importance || ''} onChange={handleChange} placeholder="Why is this important?" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-20" />
                        <textarea name="explainStory" value={formData.explainStory || ''} onChange={handleChange} placeholder="Full story behind the campaign" className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-32" />
                     </div>
                </div>
                 <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Status</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <select name="approvalStatus" value={formData.approvalStatus || 'pending'} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <div className="flex items-center gap-2">
                             <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive || false} onChange={handleChange} className="h-5 w-5 text-brand-gold focus:ring-brand-gold border-gray-300 rounded" />
                             <label htmlFor="isActive">Set as Active</label>
                        </div>
                     </div>
                </div>
                <div className="flex justify-end">
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