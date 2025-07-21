



import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { Campaign } from '../../types.ts';
import Button from '../../components/Button.tsx';
import ProgressBar from '../../components/ProgressBar.tsx';
import DeleteCampaignModal from '../../components/admin/DeleteCampaignModal.tsx';
import { FiEdit, FiTrash2, FiPlus, FiCheck, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.tsx';

const ITEMS_PER_PAGE = 10;

const CampaignManagementPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    approvalStatus: 'all',
    page: 1,
  });
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getCampaigns({ ...filters, limit: ITEMS_PER_PAGE });
      setCampaigns(data.campaigns);
      setPagination(data.pagination);
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch campaigns.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 300); // Debounce search input
    return () => clearTimeout(timer);
  }, [fetchCampaigns]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };
  
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({...prev, page: newPage}));
  }
  
  const handleApprove = async (e: React.MouseEvent, campaignId: string, status: 'approved' | 'rejected') => {
    e.stopPropagation();
    try {
      await adminAPI.approveCampaign(campaignId, status);
      addToast(`Campaign ${status} successfully.`, 'success');
      fetchCampaigns();
    } catch (err: any) {
      addToast(`Failed to update approval status: ${err.message}`, 'error');
    }
  };
  
  const handleDeleteConfirm = async () => {
      if (!deletingCampaign) return;
      try {
          await adminAPI.deleteCampaign(deletingCampaign._id);
          addToast('Campaign deleted successfully.', 'success');
          setDeletingCampaign(null);
          fetchCampaigns();
      } catch (err: any)
      {
          addToast(`Failed to delete campaign: ${err.message}`, 'error');
          setDeletingCampaign(null);
      }
  }

  const approvalStatusBadge = (status: Campaign['approvalStatus']) => {
      const base = "px-2 py-1 text-xs font-semibold rounded-full";
      switch(status) {
          case 'approved': return `${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
          case 'pending': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
          case 'rejected': return `${base} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
      }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Campaign Management</h1>
        <Button onClick={() => navigate('/admin/campaigns/new')}>
          <FiPlus className="mr-2" /> Add New Campaign
        </Button>
      </div>
      
       <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
          <input 
            type="text"
            name="search"
            placeholder="Search by title or organizer..."
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select name="status" value={filters.status} onChange={handleFilterChange} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="disabled">Disabled</option>
          </select>
          <select name="approvalStatus" value={filters.approvalStatus} onChange={handleFilterChange} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
              <option value="all">All Approvals</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
          </select>
      </div>

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-dark-200 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && <tr><td colSpan={5} className="text-center p-4">Loading campaigns...</td></tr>}
            {error && <tr><td colSpan={5} className="text-center p-4 text-red-500">{error}</td></tr>}
            {!loading && campaigns.length === 0 && <tr><td colSpan={5} className="text-center p-4">No campaigns found.</td></tr>}
            {!loading && !error && campaigns.map(campaign => {
                const percentage = campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
                return (
                    <tr key={campaign._id} className="hover:bg-gray-50 dark:hover:bg-brand-dark cursor-pointer" onClick={() => navigate(`/admin/campaigns/${campaign._id}`)}>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-md object-cover" src={campaign.thumbnail} alt={campaign.title} />
                            <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">by {campaign.organizer}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">₹{campaign.raised.toLocaleString()} / ₹{campaign.goal.toLocaleString()}</div>
                            <ProgressBar value={percentage} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={approvalStatusBadge(campaign.approvalStatus)}>{campaign.approvalStatus}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex justify-end items-center gap-1">
                                {campaign.approvalStatus === 'pending' && (
                                  <>
                                    <Button onClick={(e) => handleApprove(e, campaign._id, 'approved')} variant="ghost" className="p-2 text-green-500" title="Approve"><FiCheck/></Button>
                                    <Button onClick={(e) => handleApprove(e, campaign._id, 'rejected')} variant="ghost" className="p-2 text-red-500" title="Reject"><FiX/></Button>
                                  </>
                                )}
                                <Button onClick={(e) => { e.stopPropagation(); navigate(`/admin/campaigns/${campaign._id}/edit`); }} variant="ghost" className="p-2 text-blue-500" title="Edit"><FiEdit /></Button>
                                <Button onClick={(e) => {e.stopPropagation(); setDeletingCampaign(campaign)}} variant="ghost" className="p-2 text-red-500" title="Delete"><FiTrash2 /></Button>
                            </div>
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
      </div>
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-brand-dark-200 px-4 py-3 rounded-b-lg shadow-md">
            <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
                <Button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} variant="ghost" className="p-2">
                    <FiChevronLeft />
                </Button>
                <Button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} variant="ghost" className="p-2">
                    <FiChevronRight />
                </Button>
            </div>
        </div>
      )}
      <DeleteCampaignModal 
        isOpen={!!deletingCampaign}
        onClose={() => setDeletingCampaign(null)}
        onConfirm={handleDeleteConfirm}
        campaign={deletingCampaign}
      />
    </div>
  );
};

export default CampaignManagementPage;