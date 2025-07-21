
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { FiSave, FiBell, FiShield, FiEye } from 'react-icons/fi';

const DonorSettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        campaignUpdates: true,
        marketingEmails: false,
        donationReceipts: true,
        monthlyReports: true,
        profileVisibility: 'public',
        showDonationHistory: false,
        twoFactorAuth: false
    });

    const handleSave = async () => {
        try {
            // This would normally save to backend
            addToast('Settings saved successfully', 'success');
        } catch (error: any) {
            addToast('Failed to save settings', 'error');
        }
    };

    const handleToggle = (setting: string) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting as keyof typeof prev]
        }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Settings
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Manage your account preferences and privacy settings.
                </p>
            </div>

            {/* Notification Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <FiBell className="h-5 w-5 text-blue-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Notification Preferences
                        </h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                Email Notifications
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Receive notifications via email
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('emailNotifications')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                SMS Notifications
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Receive notifications via SMS
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('smsNotifications')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                Campaign Updates
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Get updates on campaigns you've supported
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('campaignUpdates')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.campaignUpdates ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.campaignUpdates ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                Monthly Reports
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Receive monthly donation summaries
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('monthlyReports')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.monthlyReports ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.monthlyReports ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <FiEye className="h-5 w-5 text-green-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Privacy Settings
                        </h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Profile Visibility
                        </h3>
                        <select
                            value={settings.profileVisibility}
                            onChange={(e) => setSettings({...settings, profileVisibility: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="donors_only">Donors Only</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                Show Donation History
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Allow others to see your donation history
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('showDonationHistory')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.showDonationHistory ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.showDonationHistory ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <FiShield className="h-5 w-5 text-red-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Security Settings
                        </h2>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                Two-Factor Authentication
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <button
                            onClick={() => handleToggle('twoFactorAuth')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <FiSave className="mr-2" />
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default DonorSettingsPage;
