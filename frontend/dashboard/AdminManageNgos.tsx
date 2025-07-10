
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { apiFetch } from '../utils/api';
import { ADMIN_ENDPOINTS, buildQueryParams } from '../utils/adminEndpoints';
import { User } from '../types';
import { useToast } from '../components/ui/Toast';

type NgoStatusFilter = 'all' | 'active' | 'pending' | 'inactive';

const AdminManageNgos: React.FC = () => {
    const [ngos, setNgos] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const [filter, setFilter] = useState<NgoStatusFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');
    
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedNgo, setSelectedNgo] = useState<User | null>(null);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [ngoToDelete, setNgoToDelete] = useState<User | null>(null);

    const [action, setAction] = useState<{ type: 'approve' | 'disable', reason?: string } | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newNgoData, setNewNgoData] = useState({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: ''
    });

    const inputStyles = "block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-70 disabled:bg-gray-100";

    const fetchNgos = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = buildQueryParams({ role: 'ngo', limit: '100' });
            const data = await apiFetch<{ users: User[] }>(`${ADMIN_ENDPOINTS.USERS.LIST}?${params}`);
            setNgos(data.users || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch NGOs');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNgos();
    }, [fetchNgos]);

    const filteredNgos = useMemo(() => {
        return ngos
            .filter(ngo => filter === 'all' || ngo.status === filter)
            .filter(ngo => 
                ngo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ngo.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [filter, searchTerm, ngos]);
    
    const handleViewDetails = (ngo: User) => {
        setSelectedNgo(ngo);
        setIsEditMode(false);
        setIsDetailModalOpen(true);
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNgo) return;
        setIsSubmitting(true);
        try {
            const { fullName, phoneNumber } = selectedNgo;
            await apiFetch(ADMIN_ENDPOINTS.USERS.UPDATE_PROFILE(selectedNgo.id), {
                method: 'PATCH',
                body: { fullName, phoneNumber }
            });
            addToast('NGO details updated successfully!', 'success');
            fetchNgos();
            setIsEditMode(false);
        } catch(err: any) {
            addToast(err.message || "Failed to update details.", "error");
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const handleStatusChange = async () => {
        if (!selectedNgo || !action) return;
        
        try {
            const body = { isActive: action.type === 'approve', reason: action.reason || 'Admin action.' };
            await apiFetch(ADMIN_ENDPOINTS.USERS.UPDATE_STATUS(selectedNgo.id), { method: 'PATCH', body });
            addToast(`NGO ${action.type === 'approve' ? 'approved' : 'disabled'} successfully.`, 'success');
            fetchNgos();
            // Also update the selected NGO in the modal
            if(selectedNgo) {
                 setSelectedNgo({...selectedNgo, status: action.type === 'approve' ? 'active' : 'inactive'});
            }
        } catch (err: any) {
             addToast(err.message || 'Failed to update status.', 'error');
        } finally {
            setIsConfirmModalOpen(false);
            setAction(null);
        }
    };
    
    const openConfirmationModal = (ngo: User, type: 'approve' | 'disable') => {
        setSelectedNgo(ngo);
        setAction({ type });
        setIsConfirmModalOpen(true);
    }
    
    const openDeleteModal = (ngo: User) => {
        setNgoToDelete(ngo);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteNgo = async () => {
        if (!ngoToDelete) return;
        try {
            await apiFetch(ADMIN_ENDPOINTS.USERS.DELETE(ngoToDelete.id), { method: 'DELETE' });
            addToast('NGO deleted successfully.', 'success');
            fetchNgos();
        } catch (err: any) {
            addToast(err.message || 'Failed to delete NGO.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setNgoToDelete(null);
        }
    };

    const handleOpenAddModal = () => {
        setNewNgoData({ fullName: '', email: '', password: '', phoneNumber: '' });
        setIsAddModalOpen(true);
    };

    const handleNewNgoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewNgoData({ ...newNgoData, [e.target.name]: e.target.value });
    };

    const handleAddNgo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiFetch(ADMIN_ENDPOINTS.USERS.CREATE, {
                method: 'POST',
                body: { ...newNgoData, role: 'ngo' }
            });
            addToast('NGO created successfully! It is now pending approval.', 'success');
            fetchNgos();
            setIsAddModalOpen(false);
        } catch (err: any) {
            addToast(err.message || "Failed to create NGO.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const tableHeaders = ["NGO Name", "Email", "Status", "Actions"];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">Manage NGOs</h1>
                <p className="mt-2 text-lg text-text-secondary">Oversee and manage all registered NGO partners.</p>
            </div>

            <div className="bg-surface p-4 rounded-xl shadow-serene border border-border space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {(['all', 'active', 'pending', 'inactive'] as const).map(status => (
                        <Button key={status} onClick={() => setFilter(status)} variant={filter === status ? 'primary' : 'outline'} size="sm" className="capitalize">{status}</Button>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                        <ion-icon name="search-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></ion-icon>
                        <input type="text" placeholder="Search NGOs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                    </div>
                    <Button onClick={handleOpenAddModal} variant="primary">
                        <ion-icon name="add-outline" className="mr-2"></ion-icon>
                        Add NGO
                    </Button>
                </div>
            </div>

            <div className="bg-surface rounded-xl shadow-serene border border-border overflow-hidden">
                <div className="w-full overflow-x-auto">
                    {isLoading ? <div className="text-center p-8 text-text-secondary">Loading NGOs...</div>
                    : error ? <div className="text-center p-8 text-red-500">{error}</div>
                    : <table className="min-w-full text-sm text-left text-text-primary">
                        <thead className="bg-gray-50 text-xs text-text-secondary uppercase">
                            <tr>{tableHeaders.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredNgos.map((ngo) => (
                                <tr key={ngo.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium">{ngo.fullName}</td>
                                    <td className="px-6 py-4">{ngo.email}</td>
                                    <td className="px-6 py-4"><StatusBadge status={ngo.status === 'active' ? 'Approved' : ngo.status === 'inactive' ? 'Disabled' : 'Pending'} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-1">
                                            <Button onClick={() => handleViewDetails(ngo)} variant="ghost" size="sm" className="p-2"><ion-icon name="eye-outline" className="text-xl"></ion-icon></Button>
                                            {ngo.status === 'pending' && <Button onClick={() => openConfirmationModal(ngo, 'approve')} variant="ghost" size="sm" className="p-2 text-green-500"><ion-icon name="checkmark-circle-outline" className="text-xl"></ion-icon></Button>}
                                            {ngo.status === 'active' && <Button onClick={() => openConfirmationModal(ngo, 'disable')} variant="ghost" size="sm" className="p-2 text-orange-500"><ion-icon name="ban-outline" className="text-xl"></ion-icon></Button>}
                                            <Button onClick={() => openDeleteModal(ngo)} variant="ghost" size="sm" className="p-2 text-red-500"><ion-icon name="trash-outline" className="text-xl"></ion-icon></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                </div>
            </div>
            
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="NGO Details" size="xl">
                {selectedNgo && (
                     <form onSubmit={handleUpdateDetails} className="space-y-6 text-text-primary">
                        <div><h3 className="font-bold text-lg text-primary">{selectedNgo.fullName}</h3></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                                <input type="text" value={selectedNgo.fullName} onChange={e => setSelectedNgo({...selectedNgo, fullName: e.target.value})} className={inputStyles} disabled={!isEditMode} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input type="email" value={selectedNgo.email} className={inputStyles} disabled />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                                <input type="text" value={selectedNgo.phoneNumber || ''} onChange={e => setSelectedNgo({...selectedNgo, phoneNumber: e.target.value})} className={inputStyles} disabled={!isEditMode} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                                <div className="mt-2"><StatusBadge status={selectedNgo.status === 'active' ? 'Approved' : selectedNgo.status === 'inactive' ? 'Disabled' : 'Pending'} /></div>
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
                 {selectedNgo && action && (
                     <div className="space-y-4">
                        <p>Are you sure you want to <span className="font-bold">{action.type}</span> the NGO "{selectedNgo.fullName}"?</p>
                        {action.type === 'disable' && (
                             <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-text-secondary mb-1">Reason (Optional)</label>
                                <input type="text" id="reason" value={action.reason || ''} onChange={(e) => setAction({...action, reason: e.target.value})} className="block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                            </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-4">
                             <Button onClick={() => setIsConfirmModalOpen(false)} variant="outline" size="sm">Cancel</Button>
                             <Button onClick={handleStatusChange} variant={action.type === 'approve' ? 'secondary' : 'accent'} size="sm">{action.type === 'approve' ? 'Approve' : 'Disable'}</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                {ngoToDelete && (
                    <div className="space-y-4">
                        <p className="text-lg">Are you sure you want to delete the NGO <span className="font-bold text-red-500">{ngoToDelete.fullName}</span>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">Cancel</Button>
                            <Button onClick={handleDeleteNgo} variant="accent">Delete NGO</Button>
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New NGO">
                <form onSubmit={handleAddNgo} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-text-secondary mb-1">NGO Name</label>
                        <input type="text" name="fullName" id="fullName" required value={newNgoData.fullName} onChange={handleNewNgoChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                        <input type="email" name="email" id="email" required value={newNgoData.email} onChange={handleNewNgoChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                        <input type="password" name="password" id="password" required value={newNgoData.password} onChange={handleNewNgoChange} className={inputStyles} />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
                        <input type="tel" name="phoneNumber" id="phoneNumber" value={newNgoData.phoneNumber} onChange={handleNewNgoChange} className={inputStyles} />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                        <Button type="button" onClick={() => setIsAddModalOpen(false)} variant="outline">Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create NGO"}</Button>
                    </div>
                </form>
            </Modal>

        </div>
    );
};

export default AdminManageNgos;
