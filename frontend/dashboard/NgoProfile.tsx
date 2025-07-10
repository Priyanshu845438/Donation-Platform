
import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { apiFetch } from '../utils/api';
import { NgoProfile as INgoProfile } from '../types';
import Button from '../components/common/Button';

type FileUploadKey = 'registrationCertificate' | 'panCard' | '80gCertificate';

const NgoProfile: React.FC = () => {
    const { addToast } = useToast();
    const [profile, setProfile] = useState<Partial<INgoProfile>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [files, setFiles] = useState<Record<FileUploadKey, File | null>>({
        registrationCertificate: null,
        panCard: null,
        '80gCertificate': null,
    });
    
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Corrected to use the unified /auth/profile endpoint
                const data = await apiFetch<INgoProfile>('/auth/profile');
                setProfile(data);
            } catch (err: any) {
                addToast(err.message || 'Failed to fetch NGO profile.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [addToast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const keys = name.split('.');
        if (keys.length > 1) {
            setProfile(prev => ({
                ...prev,
                [keys[0]]: { ...prev[keys[0]], [keys[1]]: value }
            }));
        } else {
            setProfile(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const { id, ...updateData } = profile;
            // The API spec uses a dedicated PATCH /ngo/profile endpoint for updates
            await apiFetch('/ngo/profile', {
                method: 'PATCH',
                body: updateData
            });
            addToast('NGO Profile updated successfully!', 'success');
        } catch (err: any) {
            addToast(err.message || 'Failed to update profile.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files: inputFiles } = e.target;
        if (inputFiles && inputFiles.length > 0) {
            setFiles(prev => ({ ...prev, [name]: inputFiles[0] }));
        }
    };

    const handleFileUpload = async (key: FileUploadKey) => {
        const file = files[key];
        if (!file) return;

        const formData = new FormData();
        formData.append(key, file);

        try {
            await apiFetch('/ngo/upload-documents', {
                method: 'POST',
                body: formData
            });
            addToast(`${key.replace(/([A-Z])/g, ' $1')} uploaded successfully!`, 'success');
            setFiles(prev => ({ ...prev, [key]: null }));
            // Optionally, refetch profile to get new document URL
        } catch (err: any) {
             addToast(err.message || `Failed to upload ${key}.`, 'error');
        }
    };

    const inputStyles = "block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";

    if (isLoading) {
        return <div className="text-center p-8 text-text-secondary">Loading NGO Profile...</div>
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
             <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">NGO Profile</h1>
                <p className="mt-2 text-lg text-text-secondary">Manage your organization's details and verification documents.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-surface p-8 rounded-xl shadow-sm border border-border space-y-8">
                {/* Basic Info */}
                <fieldset>
                    <legend className="text-xl font-bold font-display text-text-primary mb-4">Organization Details</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="ngoName" className="block text-sm font-medium text-text-secondary mb-1">NGO Name</label>
                            <input id="ngoName" name="ngoName" type="text" value={profile.ngoName || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="address.street" className="block text-sm font-medium text-text-secondary mb-1">Street Address</label>
                            <input id="address.street" name="address.street" type="text" value={profile.address?.street || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="address.city" className="block text-sm font-medium text-text-secondary mb-1">City</label>
                            <input id="address.city" name="address.city" type="text" value={profile.address?.city || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="address.state" className="block text-sm font-medium text-text-secondary mb-1">State</label>
                            <input id="address.state" name="address.state" type="text" value={profile.address?.state || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                    </div>
                </fieldset>

                {/* Authorized Person */}
                <fieldset>
                    <legend className="text-xl font-bold font-display text-text-primary mb-4 pt-4 border-t border-border">Authorized Person</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="authorizedPerson.name" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                            <input id="authorizedPerson.name" name="authorizedPerson.name" type="text" value={profile.authorizedPerson?.name || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                        <div>
                            <label htmlFor="authorizedPerson.email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                            <input id="authorizedPerson.email" name="authorizedPerson.email" type="email" value={profile.authorizedPerson?.email || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                         <div>
                            <label htmlFor="authorizedPerson.phone" className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                            <input id="authorizedPerson.phone" name="authorizedPerson.phone" type="tel" value={profile.authorizedPerson?.phone || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                         <div>
                            <label htmlFor="authorizedPerson.designation" className="block text-sm font-medium text-text-secondary mb-1">Designation</label>
                            <input id="authorizedPerson.designation" name="authorizedPerson.designation" type="text" value={profile.authorizedPerson?.designation || ''} onChange={handleInputChange} className={inputStyles} />
                        </div>
                    </div>
                </fieldset>
                <div className="text-right">
                    <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Profile"}</Button>
                </div>
            </form>

            {/* Document Uploads */}
            <div className="bg-surface p-8 rounded-xl shadow-sm border border-border space-y-6">
                <h2 className="text-xl font-bold font-display text-text-primary">Verification Documents</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(Object.keys(files) as FileUploadKey[]).map(key => (
                         <div key={key} className="bg-background p-4 rounded-lg border border-border">
                            <label htmlFor={key} className="block text-sm font-medium text-text-secondary mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                            {profile.documents?.[key] && <a href={profile.documents[key]} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline">View Uploaded Document</a>}
                            <input id={key} name={key} type="file" onChange={handleFileChange} className="mt-2 text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                            {files[key] && <Button onClick={() => handleFileUpload(key)} size="sm" className="mt-2">Upload</Button>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NgoProfile;
