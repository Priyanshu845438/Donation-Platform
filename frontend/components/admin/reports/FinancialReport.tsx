
import React, { useState, useEffect, useCallback } from 'react';
import { Bar } from 'react-chartjs-2';
import { adminAPI } from '../../../services/api.ts';
import type { FinancialReportSummary } from '../../../types.ts';
import ReportHeader from './ReportHeader.tsx';
import { useToast } from '../../../context/ToastContext.tsx';

const FinancialReport: React.FC = () => {
  const [summary, setSummary] = useState<FinancialReportSummary | null>(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.reportsAPI.getFinancialReport(filters);
      setSummary(response);
    } catch (error: any) {
      addToast(error.message || 'Failed to fetch financial report', 'error');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(true);
    try {
      await adminAPI.reportsAPI.exportReport('financial', filters, format);
      addToast(`Financial report export started as ${format.toUpperCase()}.`, 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to export report.', 'error');
    } finally {
      setIsExporting(false);
    }
  };
  
  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
        y: { ticks: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        x: { ticks: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  const monthlyTrendsData = {
    labels: summary ? summary.monthlyTrends.map(t => `${t._id.year}-${t._id.month}`) : [],
    datasets: [{
      label: 'Total Collection',
      data: summary ? summary.monthlyTrends.map(t => t.totalAmount) : [],
      backgroundColor: '#003f5c',
    }],
  };
  
  const categoryData = {
    labels: summary ? summary.categoryWiseDistribution.map(c => c._id) : [],
    datasets: [{
      label: 'Collection by Category',
      data: summary ? summary.categoryWiseDistribution.map(c => c.totalAmount) : [],
      backgroundColor: '#ffa600',
    }],
  };

  if (loading) {
    return <div className="text-center p-4">Loading report...</div>
  }
  
  if (!summary || !summary.summary) {
    return <div className="text-center p-4">No financial data available for the selected period.</div>
  }

  return (
    <div className="space-y-6">
      <ReportHeader title="Financial Summary" onExport={handleExport} isExporting={isExporting}>
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
      </ReportHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow"><p className="text-2xl font-bold">₹{summary.summary.totalAmount.toLocaleString()}</p><p className="text-sm text-gray-500">Total Revenue</p></div>
        <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow"><p className="text-2xl font-bold">{summary.summary.totalDonations.toLocaleString()}</p><p className="text-sm text-gray-500">Total Donations</p></div>
        <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow"><p className="text-2xl font-bold">₹{summary.summary.averageAmount.toLocaleString()}</p><p className="text-sm text-gray-500">Average Donation</p></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Monthly Trends</h3>
          <Bar options={chartOptions} data={monthlyTrendsData} />
        </div>
        <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Collection by Category</h3>
          <Bar options={chartOptions} data={categoryData} />
        </div>
      </div>

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <h3 className="font-semibold p-4 text-gray-800 dark:text-white">NGO-wise Collection</h3>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">NGO Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total Donations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Campaigns</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {summary.ngoWiseCollection.map(ngo => (
              <tr key={ngo._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{ngo.ngoName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">₹{ngo.totalAmount.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ngo.totalDonations}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{ngo.campaignCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialReport;