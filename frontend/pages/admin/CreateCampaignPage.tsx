

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { User } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { AuthContext } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { FiSave, FiArrowLeft, FiImage, FiFileText, FiUploadCloud, FiPaperclip } from 'react-icons/fi';

const FileUploadInput = ({ label, onFilesSelected, multiple = false, preview = 'image' }: {
    label: string;
    onFilesSelected: (files: File | File[]) => void;
    multiple?: boolean;
    preview?: 'image' | 'list';
}) => {
    const [previews, setPreviews] = useState<string[]>([]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            onFilesSelected(multiple ? files : files[0]);
            
            if (preview === 'image') {
                 const newPreviews = files.map(file => URL.createObjectURL(file));
                 setPreviews(newPreviews);
            } else {
                 const newPreviews = files.map(file => file.name);
                 setPreviews(newPreviews);
            }
        }
    };
    
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <div className="p-4 border-2 border-dashed dark:border-gray-600 rounded-lg">
                <input type="file" multiple={multiple} onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/20 file:text-brand-gold hover:file:bg-brand-gold/30"/>
                {previews.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mt-4 ${preview !== 'image' && 'flex-col'}`}>
                        {previews.map((src, index) => 
                            preview === 'image' ?
                            <img key={index} src={src} alt="Preview" className="h-24 w-24 object-cover rounded-md" />
                            : <span key={index} className="text-xs flex items-center gap-1"><FiPaperclip size={12}/>{src}</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const CreateCampaignPage: React.FC = () => {
    const { user: adminUser } = useContext(AuthContext);
    const { addToast } = useToast();
    const [formData, setFormData] = useState<any>({
        title: '',
        description: '',
        fullDescription: '',
        importance: '',
        category: 'Education',
        targetAmount: '',
        endDate: '',
        ngoId: '',
        location: '',
        beneficiaries: '',
        contactNumber: '',
        donationLink: '',
    });
    
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [documentFiles, setDocumentFiles] = useState<File[]>([]);
    const [proofFiles, setProofFiles] = useState<File[]>([]);

    const [ngos, setNgos] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNgos = async () => {
            try {
                const ngoList = await adminAPI.getNgos();
                setNgos(ngoList);
            } catch (err: any) {
                const msg = err.message || 'Failed to load NGOs.';
                setError(msg);
                addToast(msg, 'error');
            }
        };
        fetchNgos();
    }, [addToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!adminUser?._id) {
            addToast('Could not identify the admin user. Please log in again.', 'error');
            setLoading(false);
            return;
        }
        
        const dataToSubmit = {
            title: formData.title,
            campaignName: formData.title,
            description: formData.description,
            explainStory: formData.fullDescription,
            importance: formData.importance,
            category: formData.category,
            goalAmount: Number(formData.targetAmount) || 0,
            targetAmount: Number(formData.targetAmount) || 0,
            endDate: formData.endDate,
            location: formData.location,
            beneficiaries: formData.beneficiaries,
            contactNumber: formData.contactNumber,
            donationLink: formData.donationLink,
            ngoId: formData.ngoId,
            createdBy: adminUser._id,
        };

        try {
            const response = await adminAPI.createCampaign(dataToSubmit);
            const newCampaignId = response?.campaign?._id;

            if (!newCampaignId) {
                throw new Error("Campaign created, but no ID was returned.");
            }
            
            addToast('Campaign details created! Now uploading files...', 'info');

            const uploadPromises = [];
            if (imageFiles.length > 0) uploadPromises.push(adminAPI.uploadCampaignImages(newCampaignId, imageFiles));
            if (documentFiles.length > 0) uploadPromises.push(adminAPI.uploadCampaignDocuments(newCampaignId, documentFiles));
            if (proofFiles.length > 0) uploadPromises.push(adminAPI.uploadCampaignProofs(newCampaignId, proofFiles));

            await Promise.all(uploadPromises);

            addToast('Campaign created successfully with all files!', 'success');
            navigate('/admin/campaigns');
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
            <Link to="/admin/campaigns" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                <FiArrowLeft /> Back to Campaign List
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New Campaign</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-md">{error}</div>}
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <input name="title" value={formData.title} onChange={handleChange} placeholder="Campaign Title" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <select name="ngoId" value={formData.ngoId} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option value="">Select Organizer NGO</option>
                            {ngos.map(ngo => <option key={ngo._id} value={ngo._id}>{ngo.fullName}</option>)}
                        </select>
                        <input name="location" value={formData.location} onChange={handleChange} placeholder="Location (e.g., City, State)" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Short Description (for cards, max 150 characters)" required maxLength={150} className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-20" />
                        <textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange} placeholder="Full Story / Detailed Explanation" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-32" />
                        <textarea name="importance" value={formData.importance} onChange={handleChange} placeholder="Why is this campaign important?" required className="md:col-span-2 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-20" />
                        <select name="category" value={formData.category} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                            <option value="Education">Education</option>
                            <option value="Health">Health</option>
                            <option value="Environment">Environment</option>
                            <option value="Disaster Relief">Disaster Relief</option>
                            <option value="Other">Other</option>
                        </select>
                        <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} placeholder="Fundraising Goal (₹)" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input name="beneficiaries" value={formData.beneficiaries} onChange={handleChange} placeholder="Beneficiaries (e.g., 100 students)" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} placeholder="Contact Number" required className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        <input type="url" name="donationLink" value={formData.donationLink} onChange={handleChange} placeholder="External Donation Link (Optional)" className="px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    </div>
                </div>
                 <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Campaign Files</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileUploadInput label="Campaign Images (First image will be thumbnail)" onFilesSelected={(files: File | File[]) => setImageFiles(files as File[])} multiple />
                        <FileUploadInput label="Supporting Documents (PDF, DOC)" onFilesSelected={(files: File | File[]) => setDocumentFiles(files as File[])} multiple preview="list"/>
                        <FileUploadInput label="Proof of Work Images" onFilesSelected={(files: File | File[]) => setProofFiles(files as File[])} multiple />
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