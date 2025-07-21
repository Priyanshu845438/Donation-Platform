
import React from 'react';
import Button from '../../components/Button.tsx';
import { FiPlus, FiUserPlus } from 'react-icons/fi';

const NgoVolunteeringPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <FiUserPlus /> Volunteer Management
        </h1>
        <Button>
          <FiPlus className="mr-2" /> Post an Opportunity
        </Button>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        This is where you can post and manage volunteering opportunities for your campaigns and organization. Connect with passionate individuals willing to contribute their time and skills.
      </p>

      <div className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-md p-12 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Coming Soon!</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
            The volunteer matching module is currently under development. Stay tuned!
        </p>
      </div>
    </div>
  );
};

export default NgoVolunteeringPage;
