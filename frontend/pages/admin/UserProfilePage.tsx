
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAdminUserById, approveUser, toggleUserStatus, updateUserProfile } from '../../services/api.ts';
import type { User, Campaign } from '../../types.ts';
import Button from '../../components/Button.tsx';
import CampaignCard from '../../components/CampaignCard.tsx';
import ShareProfileModal from '../../components/admin/ShareProfileModal.tsx';
import { FiMail, FiPhone, FiCalendar, FiCheck, FiToggleLeft, FiToggleRight, FiArrowLeft, FiDollarSign, FiHeart, FiActivity, FiBriefcase, FiUser, FiUsers, FiInfo, FiAward, FiShield, FiTag, FiCreditCard, FiHome, FiMapPin, FiGlobe, FiEdit, FiSave, FiShare2, FiPenTool } from 'react-icons/fi';

const statusBadge = (status: User['status']) => {
    const base = "px-3 py-1 text-sm font-semibold rounded-full inline-block";
    switch(status) {
        case 'active': return `${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
        case 'pending': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
        case 'disabled': return `${base} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
    }
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="bg-gray-50 dark:bg-brand-dark p-4 rounded-lg flex items-center gap-4">
        <div className="bg-brand-gold/20 text-brand-gold p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
    </div>
);

const DetailItem = ({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) => (
    <div className="flex items-start gap-4 py-2">
        <div className="text-gray-400 mt-1">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
            <div className="text-gray-800 dark:text-gray-200 font-semibold break-words">{children}</div>
        </div>
    </div>
);

const FormField = ({ label, name, value, onChange, type = 'text', required = false, children }: any) => (
    <div className={type === 'checkbox' ? 'md:col-span-2 flex items-center gap-2' : ''}>
        <label htmlFor={name} className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${type === 'checkbox' ? 'order-2' : ''}`}>{label}</label>
        {children ? children : (
             <input
                type={type}
                id={name}
                name={name}
                checked={type === 'checkbox' ? value : undefined}
                value={type !== 'checkbox' ? value || '' : undefined}
                onChange={onChange}
                required={required}
                className={type === 'checkbox' 
                    ? 'order-1 h-4 w-4 text-brand-gold focus:ring-brand-gold border-gray-300 dark:border-gray-600 rounded'
                    : 'mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold'
                }
            />
        )}
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

const UserProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [profileData, setProfileData] = useState<{ user: User, stats: any, activities: any[], campaigns: Campaign[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [formData, setFormData] = useState<any>({});

    const fetchUser = async () => {
        if (!userId) return;
        setLoading(true);
        setError('');
        try {
            const data = await getAdminUserById(userId);
            if (!data) throw new Error("User not found.");
            setProfileData(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch user data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, [userId]);
    
    const handleEditClick = () => {
        setFormData(profileData?.user?.profile || {});
        setIsEditMode(true);
    };

    const handleCancel = () => {
        setIsEditMode(false);
        setFormData({});
    };

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
        if (!userId) return;
        setIsSaving(true);
        try {
            await updateUserProfile(userId, formData);
            await fetchUser();
            setIsEditMode(false);
        } catch (err: any) {
            alert(`Failed to update profile: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };


    const handleApprove = async () => {
        if (!profileData?.user) return;
        try {
            await approveUser(profileData.user.id);
            fetchUser();
        } catch (err: any) {
            alert(`Failed to approve user: ${err.message}`);
        }
    };

    const handleToggleStatus = async () => {
        if (!profileData?.user) return;
        try {
            await toggleUserStatus(profileData.user);
            fetchUser();
        } catch (err: any) {
            alert(`Failed to change status: ${err.message}`);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64">Loading user profile...</div>;
    if (error) return <div className="p-4 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>;
    if (!profileData) return <div className="p-4 text-center">User not found.</div>;

    const { user, stats, activities, campaigns } = profileData;
    
    const roleColors = {
        admin: 'ring-red-500',
        ngo: 'ring-green-500',
        company: 'ring-blue-500',
        donor: 'ring-yellow-500',
    };

    const renderEditForm = () => (
        <form onSubmit={handleSave} className="space-y-6">
            {user.role === 'ngo' && (
                <>
                    <FormSection title="NGO Profile" icon={<FiHeart/>}>
                        <FormField label="NGO Name" name="ngoName" value={formData.ngoName} onChange={handleInputChange} />
                        <FormField label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
                        <FormField label="Registered Year" name="registeredYear" value={formData.registeredYear} onChange={handleInputChange} type="number" />
                        <FormField label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                        <FormField label="Website" name="website" value={formData.website} onChange={handleInputChange} type="url"/>
                        <FormField label="# of Employees" name="numberOfEmployees" value={formData.numberOfEmployees} onChange={handleInputChange} type="number"/>
                        <FormField label="NGO Type" name="ngoType" value={formData.ngoType} onChange={handleInputChange}>
                             <select name="ngoType" value={formData.ngoType || ''} onChange={handleInputChange} className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                <option value="">Select Type</option>
                                <option value="Trust">Trust</option>
                                <option value="Society">Society</option>
                                <option value="Section 8 Company">Section 8 Company</option>
                                <option value="Other">Other</option>
                            </select>
                        </FormField>
                    </FormSection>
                    <FormSection title="Legal Info" icon={<FiShield/>}>
                        <FormField label="PAN" name="panNumber" value={formData.panNumber} onChange={handleInputChange} />
                        <FormField label="TAN" name="tanNumber" value={formData.tanNumber} onChange={handleInputChange} />
                        <FormField label="GSTIN" name="gstNumber" value={formData.gstNumber} onChange={handleInputChange} />
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
                </>
            )}
            {user.role === 'company' && (
                 <FormSection title="Company Profile" icon={<FiBriefcase/>}>
                    <FormField label="Company Name" name="companyName" value={formData.companyName} onChange={handleInputChange} />
                    <FormField label="Registration Number" name="registrationNumber" value={formData.registrationNumber} onChange={handleInputChange} />
                    <FormField label="Company Address" name="companyAddress" value={formData.companyAddress} onChange={handleInputChange} />
                    <FormField label="# of Employees" name="numberOfEmployees" value={formData.numberOfEmployees} onChange={handleInputChange} type="number"/>
                    <FormField label="Company Type" name="companyType" value={formData.companyType} onChange={handleInputChange} />
                    <h4 className="md:col-span-2 font-semibold text-gray-800 dark:text-gray-200 mt-4 pt-3 border-t dark:border-gray-700">CEO Details</h4>
                    <FormField label="CEO Name" name="ceoName" value={formData.ceoName} onChange={handleInputChange} />
                    <FormField label="CEO Phone" name="ceoContactNumber" value={formData.ceoContactNumber} onChange={handleInputChange} />
                    <FormField label="CEO Email" name="ceoEmail" value={formData.ceoEmail} onChange={handleInputChange} type="email" />
                 </FormSection>
            )}
            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={handleCancel}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isSaving}><FiSave className="mr-2"/>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
            </div>
        </form>
    );

    const renderDisplayInfo = () => (
        <div className="space-y-6">
            <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2"><FiUser/>User Info</h3>
                <DetailItem icon={<FiMail/>} label="Email"><a href={`mailto:${user.email}`} className="text-brand-gold hover:underline">{user.email}</a></DetailItem>
                <DetailItem icon={<FiPhone/>} label="Phone">{user.phoneNumber || 'N/A'}</DetailItem>
                <DetailItem icon={<FiCalendar/>} label="Joined On">{new Date(user.createdAt).toLocaleDateString()}</DetailItem>
                <DetailItem icon={<FiCheck/>} label="Approval">{user.approvalStatus}</DetailItem>
            </div>
             {user.role === 'ngo' && user.profile && (
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-2">
                    <h3 className="text-lg font-semibold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2"><FiHeart/> NGO Profile</h3>
                    <DetailItem icon={<FiInfo />} label="Registration Number">{user.profile.registrationNumber || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiCalendar />} label="Registered Year">{user.profile.registeredYear || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiMapPin />} label="Address">{user.profile.address || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiGlobe />} label="Website">{user.profile.website ? <a href={user.profile.website} target="_blank" rel="noopener noreferrer" className="text-brand-gold hover:underline">{user.profile.website}</a> : 'N/A'}</DetailItem>
                    <DetailItem icon={<FiUsers />} label="# of Employees">{user.profile.numberOfEmployees || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiTag />} label="NGO Type">{user.profile.ngoType || 'N/A'}</DetailItem>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 pt-3 border-t dark:border-gray-700">Legal Info</h4>
                    <DetailItem icon={<FiShield />} label="PAN">{user.profile.panNumber || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiShield />} label="TAN">{user.profile.tanNumber || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiShield />} label="GSTIN">{user.profile.gstNumber || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiAward />} label="80G Certified">{user.profile.is80GCertified ? 'Yes' : 'No'}</DetailItem>
                    <DetailItem icon={<FiAward />} label="12A Certified">{user.profile.is12ACertified ? 'Yes' : 'No'}</DetailItem>
                    {user.profile.authorizedPerson && (<><h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 pt-3 border-t dark:border-gray-700">Authorized Person</h4><DetailItem icon={<FiUser />} label="Name">{user.profile.authorizedPerson.name || 'N/A'}</DetailItem><DetailItem icon={<FiPhone />} label="Phone">{user.profile.authorizedPerson.phone || 'N/A'}</DetailItem><DetailItem icon={<FiMail />} label="Email">{user.profile.authorizedPerson.email || 'N/A'}</DetailItem></>)}
                    {user.profile.bankDetails && (<><h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 pt-3 border-t dark:border-gray-700">Bank Details</h4><DetailItem icon={<FiCreditCard />} label="Account Holder">{user.profile.bankDetails.accountHolderName || 'N/A'}</DetailItem><DetailItem icon={<FiCreditCard />} label="Account No.">{user.profile.bankDetails.accountNumber || 'N/A'}</DetailItem><DetailItem icon={<FiCreditCard />} label="IFSC Code">{user.profile.bankDetails.ifscCode || 'N/A'}</DetailItem><DetailItem icon={<FiHome />} label="Bank Name">{user.profile.bankDetails.bankName || 'N/A'}</DetailItem><DetailItem icon={<FiHome />} label="Branch Name">{user.profile.bankDetails.branchName || 'N/A'}</DetailItem></>)}
                </div>
            )}
            {user.role === 'company' && user.profile && (
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-2">
                    <h3 className="text-lg font-semibold mb-4 border-b dark:border-gray-700 pb-2 flex items-center gap-2"><FiBriefcase/> Company Profile</h3>
                    <DetailItem icon={<FiInfo />} label="Registration Number">{user.profile.registrationNumber || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiMapPin />} label="Address">{user.profile.companyAddress || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiUsers />} label="# of Employees">{user.profile.numberOfEmployees || 'N/A'}</DetailItem>
                    <DetailItem icon={<FiTag />} label="Company Type">{user.profile.companyType || 'N/A'}</DetailItem>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 mt-4 pt-3 border-t dark:border-gray-700">CEO Details</h4>
                    <DetailItem icon={<FiUser />} label="Name">{user.profile.ceoName || 'N/A'}</DetailItem><DetailItem icon={<FiPhone />} label="Phone">{user.profile.ceoContactNumber || 'N/A'}</DetailItem><DetailItem icon={<FiMail />} label="Email">{user.profile.ceoEmail || 'N/A'}</DetailItem>
                </div>
            )}
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Link to="/admin/users" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                <FiArrowLeft /> Back to User List
            </Link>

            {/* Header */}
            <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center gap-6">
                <img src={user.avatar} alt={user.name} className={`w-28 h-28 rounded-full object-cover ring-4 ${roleColors[user.role] || 'ring-gray-300'}`} />
                <div className="flex-grow">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{user.name}</h1>
                        <span className={statusBadge(user.status)}>{user.status}</span>
                    </div>
                    <p className="text-lg text-gray-500 dark:text-gray-400 capitalize font-medium">{user.role}</p>
                </div>
                <div className="flex flex-wrap gap-2 self-start md:self-center">
                    {user.approvalStatus === 'pending' && <Button onClick={handleApprove} variant="primary"><FiCheck className="mr-2"/>Approve</Button>}
                    {user.role !== 'admin' && user.approvalStatus === 'approved' && (
                        <Button onClick={handleToggleStatus} variant="outline" className={user.isActive ? 'border-red-500 text-red-500 hover:bg-red-50' : 'border-green-500 text-green-500 hover:bg-green-50'}>
                            {user.isActive ? <FiToggleLeft size={20} className="mr-2"/> : <FiToggleRight size={20} className="mr-2"/>}
                            {user.isActive ? 'Disable' : 'Enable'}
                        </Button>
                    )}
                    {(user.role === 'ngo' || user.role === 'company') && (
                        <>
                            <Button to={`/admin/users/${user.id}/customize`} variant="outline" title="Customize Public Page"><FiPenTool className="mr-2"/>Customize</Button>
                            <Button onClick={() => setIsShareModalOpen(true)} variant="outline" title="Get Share Link"><FiShare2 className="mr-2"/>Share</Button>
                        </>
                    )}
                    <Button onClick={handleEditClick} variant="secondary" title="Edit Profile Details"><FiEdit className="mr-2"/>Edit</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                   {isEditMode ? renderEditForm() : renderDisplayInfo()}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <StatCard icon={<FiDollarSign size={24}/>} label="Total Raised" value={`₹${stats.totalDonationAmount?.toLocaleString() || 0}`} />
                       <StatCard icon={<FiHeart size={24}/>} label="Donations Made" value={stats.totalDonations || 0} />
                       <StatCard icon={<FiBriefcase size={24}/>} label="Campaigns" value={stats.totalCampaigns || 0} />
                    </div>

                    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><FiActivity/>Recent Activity</h3>
                        <ul className="space-y-4 max-h-96 overflow-y-auto">
                            {activities.length > 0 ? activities.map((activity: any) => (
                                <li key={activity._id} className="flex items-center gap-4">
                                    <div className="bg-gray-100 dark:bg-brand-dark p-3 rounded-full"><FiActivity className="text-gray-500" /></div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{activity.action}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                                    </div>
                                </li>
                            )) : <p className="text-gray-500 dark:text-gray-400 text-center py-4">No activity recorded.</p>}
                        </ul>
                    </div>
                </div>
            </div>

            {campaigns.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Campaigns by {user.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {campaigns.map(campaign => <CampaignCard key={campaign.id} campaign={campaign} />)}
                    </div>
                </div>
            )}
            <ShareProfileModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                user={user}
            />
        </motion.div>
    );
};

export default UserProfilePage;
