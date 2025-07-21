
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../../components/ui/Toast';
import { apiFetch } from '../../services/api';
import Button from '../../components/common/Button';

interface CompanyProfile {
    _id: string;
    companyName: string;
    email: string;
    website?: string;
    companyAddress?: string;
    ceoName?: string;
    ceoContactNumber?: string;
    companyType?: string;
    numberOfEmployees?: number;
    companyLogo?: string;
    industry?: string;
    description?: string;
    isVerified: boolean;
}

const CompanyProfilePage: React.FC = () => {
    const { addToast } = useToast();
    const [profile, setProfile] = useState<Partial<CompanyProfile>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await apiFetch<CompanyProfile>('/company/profile');
                setProfile(response);
            } catch (error: any) {
                addToast(error.message || 'Failed to fetch company profile.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [addToast]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { _id, companyLogo, isVerified, ...updateData } = profile;
            await apiFetch('/company/profile', {
                method: 'PUT',
                body: updateData
            });
            addToast('Company Profile updated successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to update profile.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('companyLogo', file);
        setIsUploading(true);
        try {
            const response = await apiFetch<{ company: CompanyProfile }>('/company/upload-logo', {
                method: 'POST',
                body: formData
            });
            setProfile(response.company);
            addToast('Logo uploaded successfully!', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to upload logo.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const inputStyles = "block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm";
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Company Profile</h1>
                <p className="mt-2 text-gray-600">Manage your corporate identity and details for CSR initiatives.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Logo Section */}
                <div className="md:col-span-1 flex flex-col items-center bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                    <img 
                        src={profile.companyLogo || `https://ui-avatars.com/api/?name=${profile.companyName || 'C'}&background=0d6efd&color=fff&size=128`} 
                        alt="Company Logo" 
                        className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-primary"
                    />
                    <h3 className="text-lg font-bold text-center">{profile.companyName}</h3>
                    {profile.isVerified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                            ✓ Verified
                        </span>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                    <Button onClick={() => fileInputRef.current?.click()} className="mt-4" variant="outline" size="sm" disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Change Logo'}
                    </Button>
                </div>

                {/* Profile Form */}
                <form onSubmit={handleSubmit} className="md:col-span-2 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                            <input id="companyName" name="companyName" type="text" required value={profile.companyName || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input id="email" name="email" type="email" required value={profile.email || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                         <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input id="website" name="website" type="url" value={profile.website || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                            <input id="industry" name="industry" type="text" value={profile.industry || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="companyAddress" className="block text-sm font-medium text-gray-700 mb-1">Company Address</label>
                            <input id="companyAddress" name="companyAddress" type="text" value={profile.companyAddress || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="ceoName" className="block text-sm font-medium text-gray-700 mb-1">CEO Name</label>
                            <input id="ceoName" name="ceoName" type="text" value={profile.ceoName || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="ceoContactNumber" className="block text-sm font-medium text-gray-700 mb-1">CEO Contact</label>
                            <input id="ceoContactNumber" name="ceoContactNumber" type="tel" value={profile.ceoContactNumber || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="companyType" className="block text-sm font-medium text-gray-700 mb-1">Company Type</label>
                            <input id="companyType" name="companyType" type="text" value={profile.companyType || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                         <div>
                            <label htmlFor="numberOfEmployees" className="block text-sm font-medium text-gray-700 mb-1">Number of Employees</label>
                            <input id="numberOfEmployees" name="numberOfEmployees" type="number" value={profile.numberOfEmployees || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Company Description</label>
                            <textarea id="description" name="description" rows={4} value={profile.description || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div className="md:col-span-2 text-right">
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompanyProfilePage;
