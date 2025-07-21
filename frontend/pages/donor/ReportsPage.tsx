
import React, { useState, useEffect, useCallback } from 'react';
import { donorAPI } from '../../services/api.ts';
import type { Donation } from '../../types.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { FiLoader } from 'react-icons/fi';

const DonorReportsPage: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await donorAPI.getDonationHistory({});
      setDonations(response.donations || []);
    } catch (err: any) {
      addToast(err.message || 'Failed to fetch donation history.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const statusBadge = (status: Donation['status']) => {
    const base = "px-2 py-1 text-xs font-semibold rounded-full";
    switch(status) {
        case 'Completed': return `${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
        case 'Pending': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
        case 'Failed': return `${base} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
        default: return `${base} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Donation History</h1>
      <p className="text-gray-600 dark:text-gray-400">Here's a record of all the contributions you've made.</p>

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transaction ID</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-dark-200 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && <tr><td colSpan={5} className="text-center p-4"><FiLoader className="animate-spin inline mr-2"/>Loading reports...</td></tr>}
            {!loading && donations.length === 0 && <tr><td colSpan={5} className="text-center p-4">You haven't made any donations yet.</td></tr>}
            {!loading && donations.map(donation => (
              <tr key={donation._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{donation.campaignId?.title || 'General Fund'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-white">₹{donation.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={statusBadge(donation.status)}>{donation.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(donation.donationDate).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{donation.transactionId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorReportsPage;
