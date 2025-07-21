
import React, { useState, useEffect, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { adminAPI } from '../../../services/api.ts';
import type { DonationReportSummary } from '../../../types.ts';
import ReportHeader from './ReportHeader.tsx';
import { useToast } from '../../../context/ToastContext.tsx';

const DonationReport: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<DonationReportSummary | null>(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', paymentMethod: '' });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.reportsAPI.getDonationsReport(filters);
      setData(response.donations);
      setSummary(response.summary);
    } catch (error: any) {
      addToast(error.message || 'Failed to fetch donation report', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      await adminAPI.reportsAPI.exportReport('donations', filters, format);
      addToast(`Donation report export started as ${format.toUpperCase()}.`, 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to export report.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'right' as const, labels: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' } } },
  };

  const paymentMethodChartData = {
    labels: summary ? Object.keys(summary.paymentMethodDistribution) : [],
    datasets: [{
      data: summary ? Object.values(summary.paymentMethodDistribution) : [],
      backgroundColor: ['#003f5c', '#58508d', '#bc5090', '#ff6361', '#ffa600'],
      borderColor: document.documentElement.classList.contains('dark') ? '#2d3748' : '#ffffff',
    }],
  };

  return (
    <div className="space-y-6">
      <ReportHeader title="Donation Report" onExport={handleExport} isExporting={isExporting}>
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <option value="">All Statuses</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
        </select>
      </ReportHeader>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow"><p className="text-2xl font-bold">₹{summary.totalAmount.toLocaleString()}</p><p className="text-sm text-gray-500">Total Donated</p></div>
            <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow"><p className="text-2xl font-bold">{summary.totalDonations}</p><p className="text-sm text-gray-500">Total Donations</p></div>
            <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow"><p className="text-2xl font-bold">{summary.uniqueDonors}</p><p className="text-sm text-gray-500">Unique Donors</p></div>
            <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow"><p className="text-2xl font-bold">₹{summary.averageAmount.toLocaleString()}</p><p className="text-sm text-gray-500">Average Donation</p></div>
        </div>
      )}
      
      {summary && (
        <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Payment Methods</h3>
          <div className="max-w-md mx-auto">
            <Doughnut options={chartOptions} data={paymentMethodChartData} />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Transaction ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Donor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="text-center p-4">Loading report...</td></tr>
            ) : data.map(donation => (
              <tr key={donation._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{donation.transactionId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{donation.donorId?.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800 dark:text-white">₹{donation.amount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{donation.campaignId?.title}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${donation.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{donation.status}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(donation.donationDate).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonationReport;
