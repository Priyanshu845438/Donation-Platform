
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { User } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { AuthContext } from '../../context/AuthContext.tsx';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

const CreateCampaignPage: React.FC = () => {
    const { user: adminUser } = useContext(AuthContext);
    const [formData, setFormData] = useState<any>({
        title: '',
        campaignName: '',
        description: '',
        category: 'Education',
        targetAmount: 0,
        endDate: '',
        location: '',
        beneficiaries: '',
        importance: '',
        explainStory: '',
        contactNumber: '',
        donationLink: '',
        ngoId: '',
        approvalStatus: 'pending',
        isActive: false
    });
    const [ngos, setNgos] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
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
        fetchNgos();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!adminUser?._id) {
            setError('Could not identify the admin user. Please log in again.');
            setLoading(false);
            return;
        }

        const dataToSubmit = {
            ...formData,
            targetAmount: Number(formData.targetAmount) || 0,
            goalAmount: Number(formData.targetAmount) || 0,
            createdBy: adminUser._id,
        };

        try {
            await adminAPI.createCampaign(dataToSubmit);
            navigate('/admin/campaigns');
        } catch (err: any) {
            setError(err.message || 'Failed to create campaign.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/admin/campaigns" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                <FiArrowLeft /> Back to Campaign List
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New Campaign</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input name="title" value={formData.title} onChange={handleChange} placeholder="Campaign Title" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input name="campaignName" value={formData.campaignName} onChange={handleChange} placeholder="Campaign Name (Internal)" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short Description" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-24" />
                        <select name="category" value={formData.category} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option>Education</option>
                            <option>Health</option>
                            <option>Environment</option>
                            <option>Disaster Relief</option>
                            <option>Other</option>
                        </select>
                        <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} placeholder="Fundraising Goal (₹)" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <select name="ngoId" value={formData.ngoId} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option value="">Select Organizer NGO</option>
                            {ngos.map(ngo => <option key={ngo._id} value={ngo._id}>{ngo.fullName}</option>)}
                        </select>
                        <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                         <input name="donationLink" value={formData.donationLink || ''} onChange={handleChange} placeholder="External Donation Link (optional)" className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    </div>
                </div>

                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Story</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <textarea name="beneficiaries" value={formData.beneficiaries} onChange={handleChange} placeholder="Who are the beneficiaries?" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-20" />
                        <textarea name="importance" value={formData.importance} onChange={handleChange} placeholder="Why is this important?" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-20" />
                        <textarea name="explainStory" value={formData.explainStory} onChange={handleChange} placeholder="Full story behind the campaign" className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-32" />
                     </div>
                </div>
                 <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Status</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <select name="approvalStatus" value={formData.approvalStatus} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <div className="flex items-center gap-2">
                             <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-5 w-5 text-brand-gold focus:ring-brand-gold border-gray-300 rounded" />
                             <label htmlFor="isActive">Set as Active</label>
                        </div>
                     </div>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                        <FiSave className="mr-2"/>
                        {loading ? 'Creating...' : 'Create Campaign'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateCampaignPage;
