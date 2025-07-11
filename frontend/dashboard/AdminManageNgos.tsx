
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { apiFetch } from '../utils/api';
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

    const fetchNgos = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ role: 'ngo', limit: '100' });
            if (filter !== 'all') {
                params.append('status', filter);
            }
            const data = await apiFetch<{ users: User[] }>(`/admin/dashboard/users?${params.toString()}`);
            setNgos(data.users || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch NGOs');
            addToast(err.message || 'Failed to fetch NGOs', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [filter, addToast]);

    useEffect(() => {
        fetchNgos();
    }, [fetchNgos]);

    const filteredNgos = useMemo(() => {
        return ngos
            .filter(ngo => 
                ngo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ngo.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [searchTerm, ngos]);
    
    const handleViewDetails = (ngo: User) => {
        setSelectedNgo({ ...ngo }); // Create a copy to avoid mutating state directly
        setIsEditMode(false);
        setIsDetailModalOpen(true);
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedNgo) return;
        setIsSubmitting(true);
        try {
            const { fullName, phoneNumber } = selectedNgo;
            await apiFetch(`/admin/users/${selectedNgo.id}`, {
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
        
        setIsSubmitting(true);
        try {
            const body = { isActive: action.type === 'approve', reason: action.reason || 'Admin action.' };
            await apiFetch(`/admin/users/${selectedNgo.id}/status`, { method: 'PATCH', body });
            addToast(`NGO ${action.type === 'approve' ? 'approved' : 'disabled'} successfully.`, 'success');
            fetchNgos();
        } catch (err: any) {
             addToast(err.message || 'Failed to update status.', 'error');
        } finally {
            setIsConfirmModalOpen(false);
            setAction(null);
            setIsSubmitting(false);
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
        setIsSubmitting(true);
        try {
            await apiFetch(`/admin/users/${ngoToDelete.id}`, { method: 'DELETE' });
            addToast('NGO deleted successfully.', 'success');
            fetchNgos();
        } catch (err: any) {
            addToast(err.message || 'Failed to delete NGO.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setNgoToDelete(null);
            setIsSubmitting(false);
        }
    };

    const tableHeaders = ["NGO", "Contact", "Status", "Actions"];
    const inputStyles = "block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-70 disabled:bg-gray-100";

    const SkeletonRow = () => (
        <tr className="animate-pulse">
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
            <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
            <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
        </tr>
    );

    return (
        <div className="space-y-6 animate-fade-in">
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
                <div className="relative flex-shrink-0 w-full md:w-auto">
                    <ion-icon name="search-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></ion-icon>
                    <input type="text" placeholder="Search NGOs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
            </div>

            <div className="bg-surface rounded-xl shadow-serene border border-border overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-text-primary">
                        <thead className="bg-gray-50 text-xs text-text-secondary uppercase font-semibold">
                            <tr>{tableHeaders.map(h => <th key={h} scope="col" className="px-6 py-4">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                            ) : error ? (
                                <tr><td colSpan={tableHeaders.length} className="text-center p-8 text-red-500 bg-red-50">{error}</td></tr>
                            ) : filteredNgos.length > 0 ? (
                                filteredNgos.map((ngo) => (
                                    <tr key={ngo.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <img src={ngo.profileImageUrl || `https://ui-avatars.com/api/?name=${ngo.fullName.replace(/\s/g, '+')}&background=random`} alt={ngo.fullName} className="h-10 w-10 rounded-full object-cover"/>
                                                <span className="font-semibold">{ngo.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-text-secondary">{ngo.email}</td>
                                        <td className="px-6 py-4"><StatusBadge status={ngo.status as any} /></td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                <Button title="View Details" onClick={() => handleViewDetails(ngo)} variant="ghost" size="sm" className="p-2"><ion-icon name="eye-outline" className="text-xl"></ion-icon></Button>
                                                {ngo.status === 'pending' && <Button title="Approve" onClick={() => openConfirmationModal(ngo, 'approve')} variant="ghost" size="sm" className="p-2 text-green-500 hover:text-green-700"><ion-icon name="checkmark-circle-outline" className="text-xl"></ion-icon></Button>}
                                                {ngo.status === 'active' && <Button title="Disable" onClick={() => openConfirmationModal(ngo, 'disable')} variant="ghost" size="sm" className="p-2 text-orange-500 hover:text-orange-700"><ion-icon name="ban-outline" className="text-xl"></ion-icon></Button>}
                                                <Button title="Delete" onClick={() => openDeleteModal(ngo)} variant="ghost" size="sm" className="p-2 text-red-500 hover:text-red-700"><ion-icon name="trash-outline" className="text-xl"></ion-icon></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length} className="text-center p-12 text-text-secondary">
                                        <ion-icon name="people-outline" class="text-5xl text-gray-300"></ion-icon>
                                        <h3 className="mt-2 font-semibold">No NGOs Found</h3>
                                        <p>No NGOs match your current filter and search criteria.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="NGO Details" size="xl">
                {selectedNgo && (
                     <form onSubmit={handleUpdateDetails} className="space-y-6 text-text-primary">
                        <div className="flex items-center gap-4 border-b border-border pb-4">
                             <img src={selectedNgo.profileImageUrl || `https://ui-avatars.com/api/?name=${selectedNgo.fullName.replace(/\s/g, '+')}&background=random`} alt={selectedNgo.fullName} className="h-16 w-16 rounded-full object-cover"/>
                            <div>
                                <h3 className="font-bold text-lg text-primary">{selectedNgo.fullName}</h3>
                                <StatusBadge status={selectedNgo.status as any} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                                <input type="text" value={selectedNgo.fullName} onChange={e => setSelectedNgo({...selectedNgo, fullName: e.target.value})} className={inputStyles} disabled={!isEditMode || isSubmitting} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
                                <input type="email" value={selectedNgo.email} className={inputStyles} disabled />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Phone</label>
                                <input type="text" value={selectedNgo.phoneNumber || ''} onChange={e => setSelectedNgo({...selectedNgo, phoneNumber: e.target.value})} className={inputStyles} disabled={!isEditMode || isSubmitting} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">User ID</label>
                                <input type="text" value={selectedNgo.id} className={`${inputStyles} text-xs`} disabled />
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
            
            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Action" size="md">
                 {selectedNgo && action && (
                     <div className="space-y-4">
                        <p className="text-text-secondary">Are you sure you want to <span className="font-bold text-text-primary">{action.type}</span> the NGO "{selectedNgo.fullName}"?</p>
                        {action.type === 'disable' && (
                             <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-text-secondary mb-1">Reason (Optional)</label>
                                <input type="text" id="reason" value={action.reason || ''} onChange={(e) => setAction({...action, reason: e.target.value})} className={inputStyles} />
                            </div>
                        )}
                        <div className="flex justify-end space-x-3 pt-4">
                             <Button onClick={() => setIsConfirmModalOpen(false)} variant="outline">Cancel</Button>
                             <Button onClick={handleStatusChange} variant={action.type === 'approve' ? 'secondary' : 'accent'} disabled={isSubmitting}>
                                {isSubmitting ? 'Processing...' : (action.type === 'approve' ? 'Approve' : 'Disable')}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion" size="md">
                {ngoToDelete && (
                    <div className="space-y-4 text-center p-4">
                        <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-red-100">
                             <ion-icon name="trash-outline" class="text-4xl text-red-600"></ion-icon>
                        </div>
                        <h3 className="text-xl font-bold">Delete NGO</h3>
                        <p className="text-text-secondary">Are you sure you want to permanently delete <span className="font-bold text-red-500">{ngoToDelete.fullName}</span>? This action cannot be undone.</p>
                        <div className="flex justify-center space-x-4 pt-4">
                            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline" className="w-32">Cancel</Button>
                            <Button onClick={handleDeleteNgo} variant="accent" className="w-32" disabled={isSubmitting}>
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminManageNgos;
