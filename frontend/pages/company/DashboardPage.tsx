
import React, { useState, useEffect } from 'react';
import { companyAPI } from '../../services/api.ts';
import { FiHeart, FiDollarSign, FiUsers, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.tsx';
import Button from '../../components/Button.tsx';

const StatCard = ({ icon, title, value, colorClass }) => (
    <div className={`bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg border-l-4 ${colorClass}`}>
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full bg-gray-100 dark:bg-brand-dark`}>{icon}</div>
            <div>
                <p className="text-3xl font-bold text-gray-800 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            </div>
        </div>
    </div>
);

const CompanyDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await companyAPI.getDashboard();
        setStats(response.stats);
      } catch (error: any) {
        addToast(error.message || 'Failed to load dashboard stats.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [addToast]);
  
  if(loading) {
      return <div className="flex items-center justify-center h-full"><FiLoader className="animate-spin h-8 w-8 text-brand-gold"/></div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Company Dashboard</h1>
        <Button to="/company/campaigns">Explore Campaigns</Button>
      </div>
      
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon={<FiDollarSign size={24} className="text-green-500" />} title="Total Donated" value={`₹${(stats.totalDonationsAmount || 0).toLocaleString()}`} colorClass="border-green-500" />
            <StatCard icon={<FiHeart size={24} className="text-red-500" />} title="Campaigns Supported" value={stats.campaignsSupportedCount} colorClass="border-red-500" />
            <StatCard icon={<FiUsers size={24} className="text-blue-500" />} title="NGOs Partnered With" value={stats.ngosSupportedCount} colorClass="border-blue-500" />
        </div>
      ) : (
          <div className="p-6 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 rounded-lg shadow-md flex items-center gap-3">
            <FiAlertCircle/> No statistics available yet. Start by exploring campaigns.
          </div>
      )}

      <div className="mt-6 p-6 bg-white dark:bg-brand-dark-200 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Featured NGOs</h2>
        <p className="text-gray-500">A list of featured NGOs will be shown here soon.</p>
      </div>
    </div>
  );
};

export default CompanyDashboardPage;