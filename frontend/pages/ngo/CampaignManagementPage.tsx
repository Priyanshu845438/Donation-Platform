
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignAPI } from '../../services/api.ts';
import type { Campaign } from '../../types.ts';
import Button from '../../components/Button.tsx';
import ProgressBar from '../../components/ProgressBar.tsx';
import DeleteCampaignModal from '../../components/admin/DeleteCampaignModal.tsx'; // Reusing admin component
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.tsx';

const CampaignManagementPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const data = await campaignAPI.getUserCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch your campaigns.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);
  
  const handleDeleteConfirm = async () => {
      if (!deletingCampaign) return;
      try {
          await campaignAPI.delete(deletingCampaign._id);
          addToast('Campaign deleted successfully.', 'success');
          setDeletingCampaign(null);
          fetchCampaigns();
      } catch (err: any) {
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Campaigns</h1>
        <Button onClick={() => navigate('/ngo/campaigns/new')}>
          <FiPlus className="mr-2" /> Add New Campaign
        </Button>
      </div>

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Approval Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">End Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-dark-200 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && <tr><td colSpan={5} className="text-center p-4">Loading campaigns...</td></tr>}
            {error && <tr><td colSpan={5} className="text-center p-4 text-red-500">{error}</td></tr>}
            {!loading && campaigns.length === 0 && <tr><td colSpan={5} className="text-center p-4">You haven't created any campaigns yet.</td></tr>}
            {!loading && !error && campaigns.map(campaign => {
                const percentage = campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0;
                return (
                    <tr key={campaign._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <img className="h-10 w-10 rounded-md object-cover" src={campaign.thumbnail} alt={campaign.title} />
                            <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{campaign.title}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">₹{campaign.raised.toLocaleString()} / ₹{campaign.goal.toLocaleString()}</div>
                            <ProgressBar value={percentage} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={approvalStatusBadge(campaign.approvalStatus)}>{campaign.approvalStatus}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex justify-end items-center gap-1">
                                <Button onClick={() => navigate(`/ngo/campaigns/${campaign._id}/edit`)} variant="ghost" className="p-2 text-blue-500" title="Edit"><FiEdit /></Button>
                                <Button onClick={() => setDeletingCampaign(campaign)} variant="ghost" className="p-2 text-red-500" title="Delete"><FiTrash2 /></Button>
                            </div>
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
      </div>
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