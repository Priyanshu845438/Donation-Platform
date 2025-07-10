import React, { useState, useMemo, useEffect, useCallback } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { apiFetch } from '../utils/api';
import { ADMIN_ENDPOINTS, buildQueryParams } from '../utils/adminEndpoints';
import { Campaign } from '../types';
import { useToast } from '../components/ui/Toast';

type CampaignStatusFilter = 'all' | 'pending' | 'active' | 'completed' | 'rejected' | 'suspended';

const AdminManageCampaigns: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToast } = useToast();

    const [filter, setFilter] = useState<CampaignStatusFilter>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

    const [action, setAction] = useState<{ type: 'approve' | 'reject' | 'suspend', reason: string } | null>(null);

    const fetchCampaigns = useCallback(async () => {
        setIsLoading(true);
        try {
            const queryParams: Record<string, any> = { limit: '100' };
            if (filter !== 'all') queryParams.status = filter;
            const params = buildQueryParams(queryParams);
            const data = await apiFetch<{ campaigns: Campaign[] }>(`${ADMIN_ENDPOINTS.CAMPAIGNS.LIST}?${params}`);
            setCampaigns(data.campaigns || []);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch campaigns');
        } finally {
            setIsLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const filteredCampaigns = useMemo(() => {
        return campaigns.filter(campaign => 
                campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (campaign.creator?.name && campaign.creator.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
    }, [searchTerm, campaigns]);

    const handleViewDetails = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsEditMode(false);
        setIsDetailModalOpen(true);
    };

    const handleUpdateDetails = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCampaign) return;
        setIsSubmitting(true);
        try {
            const { title, description, goal } = selectedCampaign;
            await apiFetch(ADMIN_ENDPOINTS.CAMPAIGNS.UPDATE(selectedCampaign.id), {
                method: 'PATCH',
                body: { title, description, goal: Number(goal) }
            });
            addToast('Campaign details updated successfully!', 'success');
            fetchCampaigns();
            setIsEditMode(false);
        } catch(err: any) {
            addToast(err.message || "Failed to update campaign details.", "error");
        } finally {
            setIsSubmitting(false);
        }
    }

    const openActionModal = (campaign: Campaign, type: 'approve' | 'reject' | 'suspend') => {
        setSelectedCampaign(campaign);
        setAction({ type, reason: '' });
        setIsActionModalOpen(true);
    }

    const openDeleteModal = (campaign: Campaign) => {
        setCampaignToDelete(campaign);
        setIsDeleteModalOpen(true);
    }

    const handleDeleteCampaign = async () => {
        if (!campaignToDelete) return;
        try {
            await apiFetch(ADMIN_ENDPOINTS.CAMPAIGNS.DELETE(campaignToDelete.id), { method: 'DELETE' });
            addToast('Campaign deleted successfully!', 'success');
            fetchCampaigns();
        } catch (err: any) {
            addToast(err.message || 'Failed to delete campaign.', 'error');
        } finally {
            setIsDeleteModalOpen(false);
            setCampaignToDelete(null);
        }
    };

    const handleStatusChange = async () => {
        if (!selectedCampaign || !action) return;

        try {
            let statusToSend = action.type;
            if (action.type === 'approve') statusToSend = 'active' as any;

            const body = { status: statusToSend, reason: action.reason };
            await apiFetch(ADMIN_ENDPOINTS.CAMPAIGNS.UPDATE_STATUS(selectedCampaign.id), { method: 'PATCH', body });
            addToast(`Campaign status updated to ${statusToSend}.`, 'success');
            fetchCampaigns();
        } catch(err: any) {
            addToast(err.message || 'Failed to update campaign status', 'error');
        } finally {
            setIsActionModalOpen(false);
            setAction(null);
            setSelectedCampaign(null);
        }
    }

    const handleShare = (campaignId: string) => {
        const url = `${window.location.origin}/#/campaigns/${campaignId}`;
        navigator.clipboard.writeText(url).then(() => {
            addToast('Campaign link copied to clipboard!', 'success');
        }, () => {
            addToast('Failed to copy link.', 'error');
        });
    };

    const tableHeaders = ["Campaign Title", "Creator", "Goal / Raised", "Progress", "Status", "Actions"];
    const inputStyles = "block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm disabled:opacity-70 disabled:bg-gray-100";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">Manage Campaigns</h1>
                <p className="mt-2 text-lg text-text-secondary">Review, approve, and monitor all fundraising campaigns.</p>
            </div>

             <div className="bg-surface p-4 rounded-xl shadow-serene border border-border space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {(['all', 'pending', 'active', 'completed', 'rejected', 'suspended'] as const).map(status => (
                        <Button key={status} onClick={() => setFilter(status)} variant={filter === status ? 'primary' : 'outline'} size="sm" className="capitalize">{status}</Button>
                    ))}
                </div>
                <div className="relative flex-shrink-0">
                    <ion-icon name="search-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></ion-icon>
                    <input type="text" placeholder="Search Campaigns..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none" />
                </div>
            </div>

            <div className="bg-surface rounded-xl shadow-serene border border-border overflow-hidden">
                <div className="w-full overflow-x-auto">
                    {isLoading ? <div className="text-center p-8 text-text-secondary">Loading campaigns...</div>
                    : error ? <div className="text-center p-8 text-red-500">{error}</div>
                    : <table className="min-w-full text-sm text-left text-text-primary">
                        <thead className="bg-gray-50 text-xs text-text-secondary uppercase">
                            <tr>{tableHeaders.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCampaigns.map((campaign) => (
                                            <tr key={`campaign-${campaign.id}`} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-medium">{campaign.title}</td>
                                    <td className="px-6 py-4 text-text-secondary">{campaign.creator?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 font-mono">
                                        <span className="text-secondary">${campaign.raised.toLocaleString()}</span> / ${campaign.goal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0}%` }}></div>
                                        </div>
                                        <span className="text-xs text-text-secondary">{campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0}%</span>
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={campaign.status as any} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-0">
                                            <Button onClick={() => handleViewDetails(campaign)} variant="ghost" size="sm" className="p-2"><ion-icon name="eye-outline" className="text-xl"></ion-icon></Button>
                                            <Button onClick={() => handleShare(campaign.id)} variant="ghost" size="sm" className="p-2 text-primary"><ion-icon name="share-social-outline" className="text-xl"></ion-icon></Button>
                                            {campaign.status === 'pending' && <Button onClick={() => openActionModal(campaign, 'approve')} variant="ghost" size="sm" className="p-2 text-green-500"><ion-icon name="checkmark-circle-outline" className="text-xl"></ion-icon></Button>}
                                            {campaign.status === 'pending' && <Button onClick={() => openActionModal(campaign, 'reject')} variant="ghost" size="sm" className="p-2 text-red-500"><ion-icon name="close-circle-outline" className="text-xl"></ion-icon></Button>}
                                            {campaign.status === 'active' && <Button onClick={() => openActionModal(campaign, 'suspend')} variant="ghost" size="sm" className="p-2 text-orange-500"><ion-icon name="ban-outline" className="text-xl"></ion-icon></Button>}
                                            <Button onClick={() => openDeleteModal(campaign)} variant="ghost" size="sm" className="p-2 text-red-500"><ion-icon name="trash-outline" className="text-xl"></ion-icon></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>}
                </div>
            </div>

            <Modal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} title="Campaign Details" size="xl">
                {selectedCampaign && (
                     <form onSubmit={handleUpdateDetails} className="space-y-6 text-text-primary">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Campaign Title</label>
                                <input type="text" value={selectedCampaign.title} onChange={e => setSelectedCampaign({...selectedCampaign, title: e.target.value})} className={inputStyles} disabled={!isEditMode} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Fundraising Goal</label>
                                <input type="number" value={selectedCampaign.goal} onChange={e => setSelectedCampaign({...selectedCampaign, goal: Number(e.target.value)})} className={inputStyles} disabled={!isEditMode} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                            <textarea rows={5} value={selectedCampaign.description} onChange={e => setSelectedCampaign({...selectedCampaign, description: e.target.value})} className={inputStyles} disabled={!isEditMode}></textarea>
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

            <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title="Confirm Action">
                 {selectedCampaign && action && (
                     <div className="space-y-4">
                        <p>Are you sure you want to <span className="font-bold">{action.type}</span> the campaign "{selectedCampaign.title}"?</p>
                        {(action.type === 'reject' || action.type === 'suspend') &&
                             <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-text-secondary mb-1">Reason</label>
                                <textarea id="reason" value={action.reason} onChange={(e) => setAction({...action, reason: e.target.value})} rows={3} className="block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary sm:text-sm" />
                            </div>
                        }
                        <div className="flex justify-end space-x-2 pt-4">
                             <Button onClick={() => setIsActionModalOpen(false)} variant="outline" size="sm">Cancel</Button>
                             <Button onClick={handleStatusChange} variant={action.type === 'approve' ? 'secondary' : 'accent'} size="sm">Confirm</Button>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                {campaignToDelete && (
                    <div className="space-y-4">
                        <p className="text-lg">Are you sure you want to delete the campaign <span className="font-bold text-red-500">{campaignToDelete.title}</span>? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-3 pt-4">
                            <Button onClick={() => setIsDeleteModalOpen(false)} variant="outline">Cancel</Button>
                            <Button onClick={handleDeleteCampaign} variant="accent">Delete Campaign</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminManageCampaigns;