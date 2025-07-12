
import React from 'react';
import Button from '../../components/Button.tsx';
import { FiDownload } from 'react-icons/fi';

const ReportsPage: React.FC = () => {
  const reportTypes = [
    { name: 'User Report', description: 'Export a list of all users with their roles and statuses.' },
    { name: 'Donation Report', description: 'A detailed summary of all donations within a date range.' },
    { name: 'Campaign Report', description: 'Export data for all campaigns, including goals and amounts raised.' },
    { name: 'Transaction Logs', description: 'A complete log of all financial transactions.' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports</h1>
      <p className="text-gray-600 dark:text-gray-400">Generate and export platform data in CSV or PDF format.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map(report => (
          <div key={report.name} className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{report.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
            </div>
            <Button variant="outline"><FiDownload className="mr-2" /> Export</Button>
          </div>
        ))}
      </div>

       <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-md" role="alert">
          <p className="font-bold">Feature in Development</p>
          <p>The export functionality is currently a placeholder and will be fully implemented soon.</p>
        </div>
    </div>
  );
};

export default ReportsPage;
