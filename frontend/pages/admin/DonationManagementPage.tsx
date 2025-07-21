
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { Donation } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { FiEdit, FiTrash2, FiChevronLeft, FiChevronRight, FiDollarSign } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.tsx';
import DeleteDonationModal from '../../components/admin/DeleteDonationModal.tsx';

const ITEMS_PER_PAGE = 15;

const DonationManagementPage: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    page: 1,
  });
  const [deletingDonation, setDeletingDonation] = useState<Donation | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminAPI.donations.getDonations({ ...filters, limit: ITEMS_PER_PAGE });
      setDonations(data.donations);
      setPagination(data.pagination);
    } catch (err: any) {
      const msg = err.message || 'Failed to fetch donations.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDonations();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [fetchDonations]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };
  
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({...prev, page: newPage}));
  };
  
  const handleDeleteConfirm = async () => {
    if (!deletingDonation) return;
    try {
        await adminAPI.donations.deleteDonation(deletingDonation._id);
        addToast('Donation record deleted successfully.', 'success');
        setDeletingDonation(null);
        fetchDonations();
    } catch (err: any) {
        addToast(`Failed to delete donation: ${err.message}`, 'error');
        setDeletingDonation(null);
    }
  };

  const statusBadge = (status: Donation['status']) => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full";
    switch(status) {
        case 'Completed': return `${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
        case 'Pending': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
        case 'Failed': return `${base} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <FiDollarSign />Donation Management
        </h1>
      </div>
      
       <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
          <input 
            type="text"
            name="search"
            placeholder="Search by Donor, Campaign, or Txn ID..."
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={filters.search}
            onChange={handleFilterChange}
          />
          <select name="status" value={filters.status} onChange={handleFilterChange} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
              <option value="all">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
          </select>
      </div>

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Donor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-dark-200 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && <tr><td colSpan={6} className="text-center p-4">Loading donations...</td></tr>}
            {error && <tr><td colSpan={6} className="text-center p-4 text-red-500">{error}</td></tr>}
            {!loading && donations.length === 0 && <tr><td colSpan={6} className="text-center p-4">No donations found.</td></tr>}
            {!loading && !error && donations.map(donation => {
                return (
                    <tr key={donation._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{donation.donorId?.fullName || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{donation.transactionId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{donation.campaignId?.title || 'General Fund'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-white">₹{donation.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={statusBadge(donation.status)}>{donation.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {new Date(donation.donationDate).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                           <div className="flex justify-end items-center gap-1">
                                <Button onClick={() => addToast('Editing coming soon!', 'info')} variant="ghost" className="p-2 text-blue-500" title="Edit"><FiEdit /></Button>
                                <Button onClick={() => setDeletingDonation(donation)} variant="ghost" className="p-2 text-red-500" title="Delete"><FiTrash2 /></Button>
                            </div>
                        </td>
                    </tr>
                );
            })}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-brand-dark-200 px-4 py-3 rounded-b-lg shadow-md">
            <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
                <Button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevPage} variant="ghost" className="p-2">
                    <FiChevronLeft />
                </Button>
                <Button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNextPage} variant="ghost" className="p-2">
                    <FiChevronRight />
                </Button>
            </div>
        </div>
      )}
      <DeleteDonationModal 
        isOpen={!!deletingDonation}
        onClose={() => setDeletingDonation(null)}
        onConfirm={handleDeleteConfirm}
        donation={deletingDonation}
      />
    </div>
  );
};

export default DonationManagementPage;