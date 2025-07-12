
import React from 'react';
import Button from '../../components/Button.tsx';

const NoticesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Notice System</h1>
        <Button>Create New Notice</Button>
      </div>

      <div className="bg-white dark:bg-brand-dark-200 p-8 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Feature Coming Soon</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          The interface for creating, scheduling, and sending notices to users will be available here.
        </p>
      </div>
    </div>
  );
};

export default NoticesPage;
