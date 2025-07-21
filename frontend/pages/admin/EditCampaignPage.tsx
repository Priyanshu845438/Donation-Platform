

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { User, Campaign } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { FiSave, FiArrowLeft, FiUploadCloud, FiImage, FiFileText, FiTrash2, FiLoader } from 'react-icons/fi';

const API_SERVER_URL = 'http://localhost:5000';

const FileManagementSection: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    fileType: 'images' | 'documents' | 'proofs';
    campaignId: string;
    existingFiles: string[];
    onUploadSuccess: () => void;
}> = ({ title, description, icon, fileType, campaignId, existingFiles, onUploadSuccess }) => {
    const { addToast } = useToast();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [deletingFile, setDeletingFile] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(files);
            const newPreviews = files.map(file => URL.createObjectURL(file));
            setPreviews(newPreviews);
        }
    };
    
    const handleDelete = async (fileUrl: string) => {
        if (window.confirm(`Are you sure you want to delete this file?`)) {
            setDeletingFile(fileUrl);
            try {
                await adminAPI.deleteCampaignFile(campaignId, fileUrl);
                addToast('File deleted successfully', 'success');
                onUploadSuccess(); // This re-fetches the campaign
            } catch (err: any) {
                addToast(err.message || 'Failed to delete file', 'error');
            } finally {
                setDeletingFile(null);
            }
        }
    };


    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            addToast('Please select files to upload.', 'info');
            return;
        }
        setUploading(true);
        try {
            switch (fileType) {
                case 'images':
                    await adminAPI.uploadCampaignImages(campaignId, selectedFiles);
                    break;
                case 'documents':
                    await adminAPI.uploadCampaignDocuments(campaignId, selectedFiles);
                    break;
                case 'proofs':
                    await adminAPI.uploadCampaignProofs(campaignId, selectedFiles);
                    break;
            }
            addToast(`${title} uploaded successfully!`, 'success');
            setSelectedFiles([]);
            setPreviews([]);
            onUploadSuccess();
        } catch (err: any) {
            addToast(err.message || `Failed to upload ${title}.`, 'error');
        } finally {
            setUploading(false);
        }
    };

    const renderFilePreview = (fileUrl: string, index: number) => {
        const isImage = fileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null || fileUrl.startsWith('blob:') || fileUrl.startsWith('data:');
        const fileName = fileUrl.split('/').pop();

        if (isImage) {
            return <img key={index} src={fileUrl} alt="Preview" className="h-24 w-24 object-cover rounded-md" />;
        }
        return (
            <div key={index} className="h-24 w-24 flex flex-col items-center justify-center bg-gray-100 dark:bg-brand-dark rounded-md p-2 border border-gray-200 dark:border-gray-600">
                <FiFileText className="h-8 w-8 text-gray-400" />
                <span className="text-xs text-center truncate w-full mt-1">{fileName}</span>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold border-b dark:border-gray-700 pb-3 mb-4 flex items-center gap-3">{icon}{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
            
            <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">Existing Files:</h4>
                {existingFiles && existingFiles.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {existingFiles.map((fileUrl, index) => (
                             <div key={index} className="relative group">
                                {renderFilePreview(fileUrl, index)}
                                <button 
                                    type="button"
                                    onClick={() => handleDelete(fileUrl)} 
                                    disabled={deletingFile === fileUrl}
                                    className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    title="Delete File"
                                >
                                    {deletingFile === fileUrl ? <FiLoader size={12} className="animate-spin" /> : <FiTrash2 size={12} />}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-gray-400">No existing files.</p>
                )}
            </div>

            <div className="mb-4">
                 <h4 className="font-semibold text-sm mb-2">Upload New Files:</h4>
                 <div className="p-4 border-2 border-dashed dark:border-gray-600 rounded-lg">
                    <input type="file" multiple onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/20 file:text-brand-gold hover:file:bg-brand-gold/30" />
                    {previews.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                            {previews.map(renderFilePreview)}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="text-right">
                <Button type="button" onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
                    {uploading ? <FiLoader className="animate-spin mr-2" /> : <FiUploadCloud className="mr-2" />}
                    {uploading ? 'Uploading...' : 'Upload New Files'}
                </Button>
            </div>
        </div>
    );
};


const EditCampaignPage: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<any>({});
    const [ngos, setNgos] = useState<User[]>([]);
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
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [campaignId, addToast]);

    useEffect(() => {
        const fetchNgos = async () => {
            try {
                const ngoList = await adminAPI.getNgos();
                setNgos(ngoList);
            } catch (err) {
                addToast('Failed to load NGOs.', 'error');
            }
        };
        fetchNgos();
        fetchCampaign();
    }, [campaignId, addToast, fetchCampaign]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmitDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!campaignId) return;
        
        setError('');
        setSaving(true);
        
        const dataToSubmit = { ...formData, goalAmount: formData.targetAmount };

        try {
            await adminAPI.updateCampaign(campaignId, dataToSubmit);
            addToast('Campaign details updated successfully!', 'success');
            await fetchCampaign(); // Re-fetch to confirm
        } catch (err: any) {
            const msg = err.message || 'Failed to update campaign details.';
            setError(msg);
            addToast(msg, 'error');
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
            
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            
            <form onSubmit={handleSubmitDetails} className="space-y-6 bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
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
                    <select name="approvalStatus" value={formData.approvalStatus || 'pending'} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <div className="flex items-center gap-2 self-center">
                        <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive || false} onChange={handleChange} className="h-5 w-5 text-brand-gold focus:ring-brand-gold border-gray-300 rounded" />
                        <label htmlFor="isActive">Set as Active</label>
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving}>
                        <FiSave className="mr-2"/>
                        {saving ? 'Saving...' : 'Save Details'}
                    </Button>
                </div>
            </form>
            
            <div className="space-y-6">
                <FileManagementSection 
                    title="Campaign Images"
                    description="Upload JPG, PNG, or WEBP files. The first image will be the main cover."
                    icon={<FiImage />}
                    fileType="images"
                    campaignId={campaignId!}
                    existingFiles={formData.images || []}
                    onUploadSuccess={fetchCampaign}
                />
                <FileManagementSection 
                    title="Supporting Documents"
                    description="Upload PDF or DOC files for transparency, like project proposals or reports."
                    icon={<FiFileText />}
                    fileType="documents"
                    campaignId={campaignId!}
                    existingFiles={formData.documents || []}
                    onUploadSuccess={fetchCampaign}
                />
                <FileManagementSection 
                    title="Proof of Work"
                    description="Upload images showing the campaign's progress or impact."
                    icon={<FiImage />}
                    fileType="proofs"
                    campaignId={campaignId!}
                    existingFiles={formData.proofs || []}
                    onUploadSuccess={fetchCampaign}
                />
            </div>
        </div>
    );
};

export default EditCampaignPage;