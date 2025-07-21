
import React, { useState, useEffect } from 'react';
import { ngoAPI } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { FiSave, FiLoader, FiBell, FiLock, FiSettings as SettingsIcon } from 'react-icons/fi';
import Button from '../../components/Button.tsx';

interface SettingsData {
    notifications: {
        emailNotifications: boolean;
        donationAlerts: boolean;
        campaignUpdates: boolean;
    };
    privacy: {
        profileVisibility: string;
        contactInfoVisible: boolean;
    };
    preferences: {
        currency: string;
        timezone: string;
    };
}

const NgoSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await ngoAPI.getSettings();
            setSettings(response.data);
        } catch (error: any) {
            addToast(error.message || 'Failed to load settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        
        setSaving(true);
        try {
            await ngoAPI.updateSettings(settings);
            addToast('Settings updated successfully', 'success');
        } catch (error: any) {
            addToast(error.message || 'Failed to update settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateSettings = (section: keyof SettingsData, key: string, value: any) => {
        if (!settings) return;
        
        setSettings(prev => ({
            ...prev!,
            [section]: {
                ...prev![section],
                [key]: value
            }
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <FiLoader className="animate-spin h-8 w-8 text-brand-gold" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
                    Save Changes
                </Button>
            </div>

            {settings && (
                <div className="grid gap-6">
                    {/* Notification Settings */}
                    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FiBell className="text-brand-gold" />
                            Notification Preferences
                        </h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Email Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.emailNotifications}
                                    onChange={(e) => updateSettings('notifications', 'emailNotifications', e.target.checked)}
                                    className="toggle toggle-primary"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Donation Alerts</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.donationAlerts}
                                    onChange={(e) => updateSettings('notifications', 'donationAlerts', e.target.checked)}
                                    className="toggle toggle-primary"
                                />
                            </label>
                            <label className="flex items-center justify-between">
                                <span>Campaign Updates</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications.campaignUpdates}
                                    onChange={(e) => updateSettings('notifications', 'campaignUpdates', e.target.checked)}
                                    className="toggle toggle-primary"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Privacy Settings */}
                    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <FiLock className="text-brand-gold" />
                            Privacy Settings
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Profile Visibility</label>
                                <select
                                    value={settings.privacy.profileVisibility}
                                    onChange={(e) => updateSettings('privacy', 'profileVisibility', e.target.value)}
                                    className="w-full p-2 border rounded-lg dark:bg-brand-dark dark:border-gray-600"
                                >
                                    <option value="public">Public</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                            <label className="flex items-center justify-between">
                                <span>Show Contact Information</span>
                                <input
                                    type="checkbox"
                                    checked={settings.privacy.contactInfoVisible}
                                    onChange={(e) => updateSettings('privacy', 'contactInfoVisible', e.target.checked)}
                                    className="toggle toggle-primary"
                                />
                            </label>
                        </div>
                    </div>

                    {/* General Preferences */}
                    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <SettingsIcon className="text-brand-gold" />
                            General Preferences
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Currency</label>
                                <select
                                    value={settings.preferences.currency}
                                    onChange={(e) => updateSettings('preferences', 'currency', e.target.value)}
                                    className="w-full p-2 border rounded-lg dark:bg-brand-dark dark:border-gray-600"
                                >
                                    <option value="INR">Indian Rupee (₹)</option>
                                    <option value="USD">US Dollar ($)</option>
                                    <option value="EUR">Euro (€)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Timezone</label>
                                <select
                                    value={settings.preferences.timezone}
                                    onChange={(e) => updateSettings('preferences', 'timezone', e.target.value)}
                                    className="w-full p-2 border rounded-lg dark:bg-brand-dark dark:border-gray-600"
                                >
                                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                                    <option value="UTC">UTC</option>
                                    <option value="America/New_York">America/New_York</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NgoSettingsPage;
