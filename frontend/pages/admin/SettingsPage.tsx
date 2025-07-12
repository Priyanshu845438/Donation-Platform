
import React from 'react';
import Button from '../../components/Button.tsx';
import { FiSave } from 'react-icons/fi';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Platform Settings</h1>
      
      <div className="bg-white dark:bg-brand-dark-200 p-8 rounded-lg shadow-md space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">Branding</h2>
        <div className="grid md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium">Platform Logo</label>
                <input type="file" className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-gold/20 file:text-brand-gold hover:file:bg-brand-gold/30"/>
            </div>
            <div>
                <label className="block text-sm font-medium">Primary Color</label>
                <input type="color" defaultValue="#ffa600" className="mt-1 w-full h-10"/>
            </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-brand-dark-200 p-8 rounded-lg shadow-md space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">Payment Gateway</h2>
         <div>
            <label className="block text-sm font-medium">Stripe API Key</label>
            <input type="text" placeholder="pk_live_************************" className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
        </div>
      </div>
      
      <div className="bg-white dark:bg-brand-dark-200 p-8 rounded-lg shadow-md space-y-6">
        <h2 className="text-xl font-semibold border-b pb-2 border-gray-200 dark:border-gray-700">Email (SMTP)</h2>
         <div>
            <label className="block text-sm font-medium">SMTP Host</label>
            <input type="text" placeholder="smtp.example.com" className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
        </div>
      </div>
      
      <div className="flex justify-end">
          <Button><FiSave className="mr-2"/> Save Settings</Button>
      </div>

      <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-md" role="alert">
        <p className="font-bold">Feature in Development</p>
        <p>This is a UI placeholder. Settings are not currently saved.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
