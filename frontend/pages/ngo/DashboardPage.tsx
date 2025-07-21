
import React, { useState, useEffect } from 'react';
import { ngoAPI } from '../../services/api.ts';
import { FiHeart, FiDollarSign, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
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


const NgoDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await ngoAPI.getDashboard();
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">NGO Dashboard</h1>
        <Button to="/ngo/campaigns/new">Create New Campaign</Button>
      </div>
      
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard icon={<FiHeart size={24} className="text-red-500" />} title="Total Campaigns" value={stats.totalCampaigns} colorClass="border-red-500" />
            <StatCard icon={<FiDollarSign size={24} className="text-green-500" />} title="Total Raised" value={`₹${(stats.totalRaised || 0).toLocaleString()}`} colorClass="border-green-500" />
            <StatCard icon={<FiCheckCircle size={24} className="text-blue-500" />} title="Completed Campaigns" value={stats.completedCampaigns} colorClass="border-blue-500" />
        </div>
      ) : (
          <div className="p-6 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 rounded-lg shadow-md flex items-center gap-3">
            <FiAlertCircle/> No statistics available at the moment.
          </div>
      )}

      <div className="mt-6 p-6 bg-white dark:bg-brand-dark-200 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <p className="text-gray-500">Recent activity feed coming soon...</p>
      </div>
       <div className="mt-6 p-6 bg-white dark:bg-brand-dark-200 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Donation Trends</h2>
        <p className="text-gray-500">Donation trend chart coming soon...</p>
      </div>
    </div>
  );
};

export default NgoDashboardPage;