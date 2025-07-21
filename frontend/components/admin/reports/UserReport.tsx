
import React, { useState, useEffect, useCallback } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { adminAPI } from '../../../services/api.ts';
import type { User, UserReportStats } from '../../../types.ts';
import ReportHeader from './ReportHeader.tsx';
import { useToast } from '../../../context/ToastContext.tsx';

const UserReport: React.FC = () => {
  const [data, setData] = useState<User[]>([]);
  const [stats, setStats] = useState<UserReportStats | null>(null);
  const [filters, setFilters] = useState({ role: '', status: '', approvalStatus: '' });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminAPI.reportsAPI.getUsersReport(filters);
      setData(response.users);
      setStats(response.stats);
    } catch (error: any) {
      addToast(error.message || 'Failed to fetch user report', 'error');
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
      await adminAPI.reportsAPI.exportReport('users', filters, format);
      addToast(`User report export started as ${format.toUpperCase()}.`, 'success');
    } catch (error: any) {
      addToast(error.message || 'Failed to export report.', 'error');
    } finally {
      setIsExporting(false);
    }
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
        legend: { labels: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' } }
    },
    scales: {
        y: { ticks: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }, grid: { color: 'rgba(255,255,255,0.1)' } },
        x: { ticks: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  const roleChartData = {
    labels: stats ? Object.keys(stats.roleDistribution) : [],
    datasets: [{
      label: 'User Roles',
      data: stats ? Object.values(stats.roleDistribution) : [],
      backgroundColor: ['#ffa600', '#003f5c', '#2f4b7c', '#665191'],
    }],
  };
  
  const approvalChartData = {
    labels: stats ? Object.keys(stats.approvalDistribution) : [],
    datasets: [{
      data: stats ? Object.values(stats.approvalDistribution) : [],
      backgroundColor: ['#2ecc71', '#f1c40f', '#e74c3c'],
    }],
  };

  return (
    <div className="space-y-6">
      <ReportHeader title="User Report" onExport={handleExport} isExporting={isExporting}>
        <select name="role" value={filters.role} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <option value="">All Roles</option>
          <option value="donor">Donor</option>
          <option value="ngo">NGO</option>
          <option value="company">Company</option>
          <option value="admin">Admin</option>
        </select>
        <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select name="approvalStatus" value={filters.approvalStatus} onChange={handleFilterChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
          <option value="">All Approvals</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </ReportHeader>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Role Distribution</h3>
            <Bar options={chartOptions} data={roleChartData} />
          </div>
          <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2 text-gray-800 dark:text-white">Approval Status</h3>
            <div className="max-w-xs mx-auto">
              <Pie options={{ ...chartOptions, scales: undefined }} data={approvalChartData} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Approval</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Joined On</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="text-center p-4">Loading report...</td></tr>
            ) : data.map(user => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="px-6 py-4 whitespace-nowrap capitalize"><span className={`px-2 py-1 text-xs rounded-full ${user.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : user.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{user.approvalStatus}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserReport;
