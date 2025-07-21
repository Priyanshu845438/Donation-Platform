
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.tsx';
import { userAPI } from '../../services/api.ts';
import type { User } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { FiSave, FiEdit, FiLoader, FiHeart, FiShield, FiUser, FiCreditCard, FiFileText, FiDownload, FiUploadCloud } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.tsx';

// Re-using admin components for consistency
const FormField = ({ label, name, value, onChange, type = 'text', children }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {children || 
            <input
                type={type}
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
        }
    </div>
);

const FormSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-lg font-semibold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2">
            {icon} {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);


const NgoProfilePage: React.FC = () => {
    const { user: currentUser, loading: authLoading } = useContext(AuthContext);
    const [profile, setProfile] = useState<User | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        if (!authLoading && currentUser) {
            userAPI.getProfile().then(userProfile => {
                setProfile(userProfile);
                setFormData(userProfile.profile || {});
                setLoading(false);
            }).catch(err => {
                addToast(err.message || "Failed to load profile", 'error');
                setLoading(false);
            });
        }
    }, [currentUser, authLoading, addToast]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        const keys = name.split('.');
        setFormData(prev => {
            const newFormData = JSON.parse(JSON.stringify(prev ?? {}));
            let current = newFormData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            const finalKey = keys[keys.length - 1];
            current[finalKey] = type === 'checkbox' ? checked : value;
            return newFormData;
        });
    };
    
    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await userAPI.updateProfile(formData);
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit My Profile</h1>
            <form onSubmit={handleSave} className="space-y-6">
                <FormSection title="NGO Profile" icon={<FiHeart/>}>
                    <FormField label="NGO Name" name="ngoName" value={formData.ngoName} onChange={handleInputChange} />
                    <FormField label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
                    <FormField label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                    <FormField label="Website" name="website" value={formData.website} onChange={handleInputChange} type="url"/>
                </FormSection>

                <FormSection title="Legal Info" icon={<FiShield/>}>
                    <FormField label="PAN" name="panNumber" value={formData.panNumber} onChange={handleInputChange} />
                    <FormField label="TAN" name="tanNumber" value={formData.tanNumber} onChange={handleInputChange} />
                    <FormField label="80G Certified" name="is80GCertified" value={formData.is80GCertified} onChange={handleInputChange} type="checkbox" />
                    <FormField label="12A Certified" name="is12ACertified" value={formData.is12ACertified} onChange={handleInputChange} type="checkbox" />
                </FormSection>

                <FormSection title="Authorized Person" icon={<FiUser/>}>
                    <FormField label="Name" name="authorizedPerson.name" value={formData.authorizedPerson?.name} onChange={handleInputChange} />
                    <FormField label="Phone" name="authorizedPerson.phone" value={formData.authorizedPerson?.phone} onChange={handleInputChange} />
                    <FormField label="Email" name="authorizedPerson.email" value={formData.authorizedPerson?.email} onChange={handleInputChange} type="email" />
                </FormSection>

                <FormSection title="Bank Details" icon={<FiCreditCard/>}>
                    <FormField label="Account Holder Name" name="bankDetails.accountHolderName" value={formData.bankDetails?.accountHolderName} onChange={handleInputChange} />
                    <FormField label="Account Number" name="bankDetails.accountNumber" value={formData.bankDetails?.accountNumber} onChange={handleInputChange} />
                    <FormField label="IFSC Code" name="bankDetails.ifscCode" value={formData.bankDetails?.ifscCode} onChange={handleInputChange} />
                    <FormField label="Bank Name" name="bankDetails.bankName" value={formData.bankDetails?.bankName} onChange={handleInputChange} />
                    <FormField label="Branch Name" name="bankDetails.branchName" value={formData.bankDetails?.branchName} onChange={handleInputChange} />
                </FormSection>
                
                <div className="flex justify-end gap-2 pt-4">
                    <Button type="submit" variant="primary" disabled={isSaving}><FiSave className="mr-2"/>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
            </form>
        </div>
    );
};

export default NgoProfilePage;