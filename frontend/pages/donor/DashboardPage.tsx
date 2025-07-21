

import React, { useState, useEffect } from 'react';
import { donorAPI } from '../../services/api.ts';
import { FiHeart, FiDollarSign, FiLoader, FiAlertCircle, FiAward } from 'react-icons/fi';
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

const DonorDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await donorAPI.getDashboard();
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Dashboard</h1>
        <Button to="/donor/campaigns">Explore Campaigns</Button>
      </div>
      
      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard icon={<FiDollarSign size={24} className="text-green-500" />} title="Total Donated" value={`₹${(stats.totalDonatedAmount || 0).toLocaleString()}`} colorClass="border-green-500" />
            <StatCard icon={<FiHeart size={24} className="text-red-500" />} title="Campaigns Supported" value={stats.campaignsSupported} colorClass="border-red-500" />
        </div>
      ) : (
          <div className="p-6 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 rounded-lg shadow-md flex items-center gap-3">
            <FiAlertCircle/> No statistics available yet. Make your first donation!
          </div>
      )}
      
      <div className="mt-6 p-6 bg-white dark:bg-brand-dark-200 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FiAward /> My Impact & Achievements</h2>
        <div className="text-center py-8">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Coming Soon!</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
                This is where you'll see the badges you've earned and track the real-world impact of your donations.
            </p>
        </div>
      </div>


      <div className="mt-6 p-6 bg-white dark:bg-brand-dark-200 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Recommended Campaigns</h2>
        <p className="text-gray-500">Personalized recommendations coming soon...</p>
      </div>
    </div>
  );
};

export default DonorDashboardPage;