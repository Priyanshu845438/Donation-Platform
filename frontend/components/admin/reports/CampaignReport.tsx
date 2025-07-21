
import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { adminAPI, transformBackendCampaign } from '../../../services/api.ts';
import type { Campaign, CampaignReportSummary } from '../../../types.ts';
import ReportHeader from './ReportHeader.tsx';
import { useToast } from '../../../context/ToastContext.tsx';
import ProgressBar from '../../ProgressBar.tsx';

const CampaignReport: React.FC = () => {
  const [data, setData] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<CampaignReportSummary | null>(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', status: '', category: '', approvalStatus: '' });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.reportsAPI.getCampaignsReport(filters);
      setData(response.campaigns.map(transformBackendCampaign));
      setSummary(response.summary);
    } catch (error: any) {
      addToast(error.message || 'Failed to fetch campaign report', 'error');
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
      await adminAPI.reportsAPI.exportReport('campaigns', filters, format);
      addToast(`Campaign report export started as ${format.toUpperCase()}.`, 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to export report.', 'error');
    } finally {
      setIsExporting(false);
    }
  };
  
  const chartOptions = {
    responsive: true,
    plugins: { legend: { labels: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' } } },
    scales: {
        y: { ticks: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        x: { ticks: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  const categoryChartData = {
    labels: summary ? Object.keys(summary.categoryDistribution) : [],
    datasets: [{
      label: 'Campaigns by Category',
      data: summary ? Object.values(summary.categoryDistribution) : [],
      backgroundColor: ['#ffa600', '#003f5c', '#bc5090', '#58508d', '#ff6361'],
    }],
  };
  
  const approvalChartData = {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [{
      data: summary ? [summary.approvedCampaigns, (summary.totalCampaigns - summary.approvedCampaigns), 0] : [], // Assuming API gives approved count
      backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
    }],
  };

  return (
    <div className="space-y-6">
      <ReportHeader title="Campaign Report" onExport={handleExport} isExporting={isExporting}>
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="disabled">Disabled</option>
        </select>
      </ReportHeader>

      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Category Distribution</h3>
            <Bar options={chartOptions} data={categoryChartData} />
          </div>
          <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Approval Status</h3>
            <div className="max-w-xs mx-auto"><Pie options={{...chartOptions, scales: undefined}} data={approvalChartData} /></div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Progress</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={4} className="text-center p-4">Loading report...</td></tr>
            ) : data.map(campaign => (
              <tr key={campaign._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{campaign.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm w-48">
                    <ProgressBar value={campaign.goal > 0 ? Math.round((campaign.raised / campaign.goal) * 100) : 0} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">₹{campaign.raised.toLocaleString()} / ₹{campaign.goal.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize"><span className={`px-2 py-1 text-xs rounded-full ${campaign.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : campaign.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{campaign.approvalStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignReport;