
import React, { useState } from 'react';
import UserReport from '../../components/admin/reports/UserReport.tsx';
import CampaignReport from '../../components/admin/reports/CampaignReport.tsx';
import DonationReport from '../../components/admin/reports/DonationReport.tsx';
import FinancialReport from '../../components/admin/reports/FinancialReport.tsx';
import { FiUsers, FiHeart, FiDollarSign, FiBarChart2 } from 'react-icons/fi';

type ReportTab = 'users' | 'campaigns' | 'donations' | 'financial';

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('users');

  const tabs = [
    { id: 'users', label: 'User Report', icon: <FiUsers /> },
    { id: 'campaigns', label: 'Campaign Report', icon: <FiHeart /> },
    { id: 'donations', label: 'Donation Report', icon: <FiDollarSign /> },
    { id: 'financial', label: 'Financial Summary', icon: <FiBarChart2 /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserReport />;
      case 'campaigns':
        return <CampaignReport />;
      case 'donations':
        return <DonationReport />;
      case 'financial':
        return <FinancialReport />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Generate and export platform data. Use the filters to narrow down your results.
      </p>

      <div className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-md">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ReportTab)}
                className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? 'border-brand-gold text-brand-gold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
