
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.tsx';
import { userAPI, adminAPI } from '../../services/api.ts'; // Using adminAPI for doc uploads
import type { User } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { FiSave, FiLoader, FiBriefcase, FiFileText, FiDownload, FiUploadCloud } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.tsx';

const FormField = ({ label, name, value, onChange, type = 'text', children }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {children || <input type={type} id={name} name={name} value={value || ''} onChange={onChange} className="mt-1 w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>}
    </div>
);

const FormSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">{icon}{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
);

const CompanyProfilePage: React.FC = () => {
    const { user: currentUser, loading: authLoading } = useContext(AuthContext);
    const [profile, setProfile] = useState<User | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [docs, setDocs] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    const fetchProfile = async () => {
        try {
            const userProfile = await userAPI.getProfile();
            setProfile(userProfile);
            setFormData(userProfile.profile || {});
        } catch (err: any) {
            addToast(err.message || "Failed to load profile", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && currentUser) {
            fetchProfile();
        }
    }, [currentUser, authLoading]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) setDocs(Array.from(e.target.files));
    };

    const handleUpload = async () => {
        if (docs.length === 0 || !profile) return;
        setUploading(true);
        try {
            await adminAPI.uploadCompanyDocuments(profile._id, docs);
            addToast('Documents uploaded successfully!', 'success');
            setDocs([]);
            await fetchProfile(); // Refresh profile to show new docs
        } catch (err: any) {
            addToast(err.message || 'Failed to upload documents.', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await userAPI.updateProfile({ ...formData });
            addToast('Profile updated successfully!', 'success');
        } catch (err: any) {
            addToast(`Failed to update profile: ${err.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || authLoading) {
        return <div className="flex items-center justify-center h-64"><FiLoader className="animate-spin h-8 w-8 text-brand-gold"/></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Company Profile</h1>
            <form onSubmit={handleSave} className="space-y-6">
                <FormSection title="Company Details" icon={<FiBriefcase/>}>
                    <FormField label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} />
                    <FormField label="Company Type" name="companyType" value={formData.companyType} onChange={handleInputChange} />
                    <FormField label="Company Address" name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} />
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleInputChange} className="mt-1 w-full h-24 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                    </div>
                </FormSection>

                <FormSection title="CEO Details" icon={<FiBriefcase/>}>
                    <FormField label="CEO Name" name="ceoName" value={formData.ceoName} onChange={handleInputChange} />
                    <FormField label="CEO Phone" name="ceoContactNumber" value={formData.ceoContactNumber} onChange={handleInputChange} />
                    <FormField label="CEO Email" name="ceoEmail" value={formData.ceoEmail} onChange={handleInputChange} type="email" />
                </FormSection>
                
                <div className="flex justify-end pt-4">
                    <Button type="submit" variant="primary" disabled={isSaving}><FiSave className="mr-2"/>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            </form>
            
            <FormSection title="Company Documents" icon={<FiFileText />}>
                <div className="md:col-span-2 space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Existing Documents</h4>
                        {formData.documents && formData.documents.length > 0 ? (
                            <ul className="space-y-2">
                                {formData.documents.map((doc, i) => (
                                    <li key={i}>
                                        <a href={doc} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-brand-gold hover:underline">
                                            <FiDownload className="mr-2"/> {doc.split('/').pop()}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-gray-500">No documents uploaded.</p>}
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload New Documents</h4>
                        <input type="file" multiple onChange={handleFileChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/20 file:text-brand-gold hover:file:bg-brand-gold/30"/>
                        <div className="text-right mt-2">
                            <Button type="button" onClick={handleUpload} disabled={uploading || docs.length === 0}>
                                {uploading ? <FiLoader className="animate-spin mr-2" /> : <FiUploadCloud className="mr-2" />}
                                {uploading ? 'Uploading...' : `Upload ${docs.length} File(s)`}
                            </Button>
                        </div>
                    </div>
                </div>
            </FormSection>
        </div>
    );
};

export default CompanyProfilePage;