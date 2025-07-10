
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { apiFetch } from '../utils/api';
import { User } from '../types';
import { useToast } from '../components/ui/Toast';

type CompanyStatusFilter = 'all' | 'active' | 'inactive';

const AdminManageCompanies: React.FC = () => {
    const [companies, setCompanies] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const [filter, setFilter] = useState<CompanyStatusFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<User | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<User | null>(null);

    const [action, setAction] = useState<{ type: 'activate' | 'disable', reason?: string } | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCompanyData, setNewCompanyData] = useState({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: ''
    });

    const inputStyles = "block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-70 disabled:bg-gray-100";

    const fetchCompanies = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({ role: 'company', limit: '100' });
            const data = await apiFetch<{ users: User[] }>(`/admin/dashboard/users?${params.toString()}`);
            setCompanies(data.users || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch companies');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCompanies();
    }, [fetchCompanies]);


    const filteredCompanies = useMemo(() => {
        return companies
            .filter(company => filter === 'all' || company.status === filter)
            .filter(company => 
                company.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [filter, searchTerm, companies]);

    const handleViewDetails = (company: User) => {
        setSelectedCompany(company);
        setIsEditMode(false);
        setIsDetailModalOpen(true);
    };
    
    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany) return;
        setIsSubmitting(true);
        try {
            const { fullName, phoneNumber } = selectedCompany;
            await apiFetch(`/admin/dashboard/users/${selectedCompany.id}`, {
                method: 'PATCH',
                body: { fullName, phoneNumber }
            });
            addToast('Company details updated successfully!', 'success');
            fetchCompanies();
            setIsEditMode(false);
        } catch(err: any) {
            addToast(err.message || "Failed to update details.", "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleStatusChange = async () => {
        if (!selectedCompany || !action) return;
        
        try {
            const body = { isActive: action.type === 'activate', reason: action.reason || 'Admin action.' };
            await apiFetch(`/admin/dashboard/users/${selectedCompany.id}/status`, { method: 'PATCH', body });
            addToast(`Company ${action.type}d successfully.`, 'success');
            fetchCompanies();
             if(selectedCompany) {
                 setSelectedCompany({...selectedCompany, status: action.type === 'activate' ? 'active' : 'inactive'});
            }
        } catch (err: any) {
             addToast(err.message || 'Failed to update status.', 'error');
        } finally {
            setIsConfirmModalOpen(false);
            setAction(null);
        }
    };
    
    const openConfirmationModal = (company: User, type: 'activate' | 'disable') => {
        setSelectedCompany(company);
        setAction({ type });
        setIsConfirmModalOpen(true);
    }

    const openDeleteModal = (company: User) => {
        setCompanyToDelete(company);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteCompany = async () => {
        if (!companyToDelete) return;
        try {
            await apiFetch(`/admin/dashboard/users/${companyToDelete.id}`, { method: 'DELETE' });
            addToast('Company deleted successfully.', 'success');
            fetchCompanies();
        } catch (err: any) {
            addToast(err.message || 'Failed to delete company.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setCompanyToDelete(null);
        }
    };

    const handleOpenAddModal = () => {
        setNewCompanyData({ fullName: '', email: '', password: '', phoneNumber: '' });
        setIsAddModalOpen(true);
    };

    const handleNewCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewCompanyData({ ...newCompanyData, [e.target.name]: e.target.value });
    };

    const handleAddCompany = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch('/admin/dashboard/users', {
                method: 'POST',
                body: { ...newCompanyData, role: 'company' }
            });
            addToast('Company created successfully!', 'success');
            fetchCompanies();
            setIsAddModalOpen(false);
        } catch (err: any) {
            addToast(err.message || "Failed to create company.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const tableHeaders = ["Company Name", "Contact", "Status", "Actions"];
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">Manage Companies</h1>
                <p className="mt-2 text-lg text-text-secondary">View and manage all corporate partners.</p>
            </div>

            <div className="bg-surface p-4 rounded-xl shadow-serene border border-border space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {(['all', 'active', 'inactive'] as const).map(status => (
                        <Button key={status} onClick={() => setFilter(status)} variant={filter === status ? 'primary' : 'outline'} size="sm" className="capitalize">{status}</Button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                        <ion-icon name="search-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></ion-icon>
                        <input type="text" placeholder="Search Companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                     <Button onClick={handleOpenAddModal} variant="primary">
                        <ion-icon name="add-outline" className="mr-2"></ion-icon>
                        Add Company
                    </Button>
                </div>
            </div>

            <div className="bg-surface rounded-xl shadow-serene border border-border overflow-hidden">
                <div className="w-full overflow-x-auto">
                     {isLoading ? <div className="text-center p-8 text-text-secondary">Loading Companies...</div>
                    : error ? <div className="text-center p-8 text-red-500">{error}</div>
                    : <table className="min-w-full text-sm text-left text-text-primary">
                        <thead className="bg-gray-50 text-xs text-text-secondary uppercase">
                            <tr>{tableHeaders.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{company.fullName}</td>
                                    <td className="px-6 py-4">{company.email}<br/><span className="text-text-secondary">{company.phoneNumber || 'N/A'}</span></td>
                                    <td className="px-6 py-4"><StatusBadge status={company.status === 'active' ? 'Active' : 'Disabled'} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1">
                                            <Button onClick={() => handleViewDetails(company)} variant="ghost" size="sm" className="p-2"><ion-icon name="eye-outline" className="text-xl"></ion-icon></Button>
                                            {company.status === 'active' 
                                                ? <Button onClick={() => openConfirmationModal(company, 'disable')} variant="ghost" size="sm" className="p-2 text-orange-500"><ion-icon name="ban-outline" className="text-xl"></ion-icon></Button>
                                                : <Button onClick={() => openConfirmationModal(company, 'activate')} variant="ghost" size="sm" className="p-2 text-green-500"><ion-icon name="checkmark-circle-outline" className="text-xl"></ion-icon></Button>
                                            }
                                            <Button onClick={() => openDeleteModal(company)} variant="ghost" size="sm" className="p-2 text-red-500"><ion-icon name="trash-outline" className="text-xl"></ion-icon></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                </div>
            </div>

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Company Details" size="xl">
                {selectedCompany && (
                    <form onSubmit={handleUpdateDetails} className="space-y-6 text-text-primary">
                        <div><h3 className="font-bold text-lg text-primary">{selectedCompany.fullName}</h3></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Company Name</label>
                                <input type="text" value={selectedCompany.fullName} onChange={e => setSelectedCompany({...selectedCompany, fullName: e.target.value})} className={inputStyles} disabled={!isEditMode} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input type="email" value={selectedCompany.email} className={inputStyles} disabled />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                                <input type="text" value={selectedCompany.phoneNumber || ''} onChange={e => setSelectedCompany({...selectedCompany, phoneNumber: e.target.value})} className={inputStyles} disabled={!isEditMode} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                                <div className="mt-2"><StatusBadge status={selectedCompany.status === 'active' ? 'Active' : 'Disabled'} /></div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                             <Button type="button" onClick={() => setIsDetailModalOpen(false)} variant="outline">Close</Button>
                             {isEditMode ? 
                                <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button> :
                                <Button type="button" onClick={() => setIsEditMode(true)} variant="secondary">Edit</Button>
                             }
                        </div>
                    </form>
                )}
            </Modal>

             <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Action">
                 {selectedCompany && action && (
                     <div className="space-y-4">
                        <p>Are you sure you want to <span className="font-bold">{action.type}</span> the company "{selectedCompany.fullName}"?</p>
                        {action.type === 'disable' && (
                             <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-text-secondary mb-1">Reason (Optional)</label>
                                <input type="text" id="reason" value={action.reason || ''} onChange={(e) => setAction({...action, reason: e.target.value})} className="block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-4">
                             <Button onClick={() => setIsConfirmModalOpen(false)} variant="outline" size="sm">Cancel</Button>
                             <Button onClick={handleStatusChange} variant={action.type === 'activate' ? 'secondary' : 'accent'} size="sm">{action.type === 'activate' ? 'Activate' : 'Disable'}</Button>
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                {companyToDelete && (
                    <div className="space-y-4">
                        <p className="text-lg">Are you sure you want to delete the company <span className="font-bold text-red-500">{companyToDelete.fullName}</span>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">Cancel</Button>
                            <Button onClick={handleDeleteCompany} variant="accent">Delete Company</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Company">
                <form onSubmit={handleAddCompany} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">Company Name</label>
                        <input type="text" name="fullName" id="fullName" required value={newCompanyData.fullName} onChange={handleNewCompanyChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input type="email" name="email" id="email" required value={newCompanyData.email} onChange={handleNewCompanyChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                        <input type="password" name="password" id="password" required value={newCompanyData.password} onChange={handleNewCompanyChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
                        <input type="tel" name="phoneNumber" id="phoneNumber" value={newCompanyData.phoneNumber} onChange={handleNewCompanyChange} className={inputStyles} />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                        <Button type="button" onClick={() => setIsAddModalOpen(false)} variant="outline">Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Company"}</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

export default AdminManageCompanies;
