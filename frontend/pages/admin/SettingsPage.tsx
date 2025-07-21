





import React, { useState, useEffect, useCallback, MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSave, FiLoader, FiKey, FiCpu, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import Button from '../../components/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { adminAPI } from '../../services/api.ts';
import type { User } from '../../types.ts';


type SettingsTab = 'security' | 'system';

const SettingsCard = ({ title, description, icon, children, footer }: { title: string, description: string, icon: React.ReactNode, children: React.ReactNode, footer?: React.ReactNode }) => (
    <div id={title.toLowerCase().replace(/\s+/g, '-')} className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="text-brand-gold">{icon}</div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-6 space-y-4">{children}</div>
        {footer && <div className="bg-gray-50 dark:bg-brand-dark px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">{footer}</div>}
    </div>
);

const FormRow = ({ label, children, hint, htmlFor }: { label: string, children: React.ReactNode, hint?: string, htmlFor?: string }) => (
    <div>
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="mt-1">{children}</div>
        {hint && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
);

const SecuritySettings = ({ settings, onSave, loading }) => {
    const [rateLimiterData, setRateLimiterData] = useState(settings.rateLimiter || {});
    const [passwordData, setPasswordData] = useState({ userId: '', newPassword: '', adminNote: '' });
    const [users, setUsers] = useState<User[]>([]);
    const [userSearch, setUserSearch] = useState('');

    useEffect(() => {
        setRateLimiterData(settings.rateLimiter || {});
        const fetchUsers = async () => {
            const data = await adminAPI.getAllUsers();
            setUsers(data);
        };
        fetchUsers();
    }, [settings]);

    const filteredUsers = userSearch 
        ? users.filter(u => (u.fullName || u.name || '').toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase())).slice(0, 5) 
        : [];
    
    return (
        <div className="space-y-6">
            <SettingsCard title="Rate Limiting" description="Protect against brute-force attacks." icon={<FiKey size={24} />} footer={
                <Button onClick={() => onSave({ type: 'rateLimiter', data: rateLimiterData })} disabled={loading.rateLimiter}>
                    {loading.rateLimiter ? <><FiLoader className="animate-spin mr-2"/>Saving...</> : <><FiSave className="mr-2"/>Save Rate Limiter</>}
                </Button>
            }>
                <FormRow label="Window (milliseconds)">
                    <input type="number" value={rateLimiterData.windowMs || ''} onChange={e => setRateLimiterData({...rateLimiterData, windowMs: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </FormRow>
                <FormRow label="Max Requests per Window">
                    <input type="number" value={rateLimiterData.maxRequests || ''} onChange={e => setRateLimiterData({...rateLimiterData, maxRequests: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </FormRow>
            </SettingsCard>
            
            <SettingsCard title="Change User Password" description="Manually reset a password for any user." icon={<FiKey size={24} />} footer={
                 <Button onClick={() => onSave({ type: 'password', data: passwordData })} disabled={loading.password || !passwordData.userId || !passwordData.newPassword}>
                    {loading.password ? <><FiLoader className="animate-spin mr-2"/>Saving...</> : <><FiSave className="mr-2"/>Change Password</>}
                </Button>
            }>
                <FormRow label="Find User">
                    <input type="search" placeholder="Search by name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                    {userSearch && (
                        <ul className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                            {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                <li key={u._id} onClick={() => { setPasswordData({...passwordData, userId: u._id}); setUserSearch(`${u.fullName || u.name} (${u.email})`); }} className="p-2 hover:bg-gray-100 dark:hover:bg-brand-dark cursor-pointer">{u.fullName || u.name} ({u.email})</li>
                            )) : <li className="p-2 text-gray-500">No users found.</li>}
                        </ul>
                    )}
                </FormRow>
                <FormRow label="New Password">
                    <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </FormRow>
                 <FormRow label="Admin Note (Optional)">
                    <input type="text" value={passwordData.adminNote} onChange={e => setPasswordData({...passwordData, adminNote: e.target.value})} className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                </FormRow>
            </SettingsCard>
        </div>
    );
};

const SystemSettings = ({ settings, onSave, loading }) => {
    const [envData, setEnvData] = useState(settings.environment || {});
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    useEffect(() => {
        setEnvData(settings.environment || {});
    }, [settings]);

    const modalAnimation = {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    };
    const modalContentAnimation = {
        initial: { opacity: 0, y: -50, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -50, scale: 0.95 }
    };

    return (
        <div className="space-y-6">
            <SettingsCard title="Environment Variables" description="Core system configuration. Changes require a server restart." icon={<FiCpu size={24} />} footer={
                <Button onClick={() => onSave({ type: 'environment', data: envData })} disabled={loading.environment}>
                    {loading.environment ? <><FiLoader className="animate-spin mr-2"/>Saving...</> : <><FiSave className="mr-2"/>Save Environment</>}
                </Button>
            }>
                <div className="bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-md" role="alert">
                    <p className="font-bold">Warning!</p>
                    <p>Changing these values can break your application. Proceed with caution. A server restart is required for changes to take effect.</p>
                </div>
                {Object.entries(envData).map(([key, value]) => (
                     <FormRow key={key} label={key}>
                        <input type="text" value={value as string} onChange={e => setEnvData({...envData, [key]: e.target.value})} className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold font-mono" />
                    </FormRow>
                ))}
            </SettingsCard>

            <SettingsCard title="System Reset" description="Reset all settings to their default values. This action is irreversible." icon={<FiTrash2 size={24} />}>
                <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md" role="alert">
                    <p className="font-bold">Danger Zone</p>
                    <p>This will reset all platform settings. This cannot be undone.</p>
                </div>
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500/10" onClick={() => setIsResetModalOpen(true)}>Reset All Settings</Button>
            </SettingsCard>
            
            <AnimatePresence>
            {isResetModalOpen && (
                 <motion.div
                    {...modalAnimation}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={() => setIsResetModalOpen(false)}
                >
                    <motion.div
                        {...modalContentAnimation}
                        className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-xl w-full max-w-md m-4 relative"
                        onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                                <FiAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="mt-5 text-lg font-medium leading-6 text-gray-900 dark:text-white">Reset All Settings?</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to reset all system settings to their defaults? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                         <div className="flex items-center justify-center p-6 space-x-3 bg-gray-50 dark:bg-brand-dark rounded-b-lg">
                            <Button type="button" variant="ghost" onClick={() => setIsResetModalOpen(false)}>Cancel</Button>
                            <Button type="button" variant="primary" className="bg-red-600 hover:bg-red-700 focus:ring-red-500 !border-red-600" onClick={() => { onSave({type: 'reset'}); setIsResetModalOpen(false); }}>
                                {loading.reset ? 'Resetting...' : 'Yes, Reset Settings'}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const location = useLocation();
    const { addToast } = useToast();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({ branding: false, rateLimiter: false, password: false, environment: false, reset: false });

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminAPI.settingsAPI.getSettings();
            const settingsData = response.data || response.settings || response;
            
            const transformedSettings = {
                rateLimiter: {
                    windowMs: settingsData.rate_limiting?.window_minutes ? settingsData.rate_limiting.window_minutes * 60 * 1000 : 900000,
                    maxRequests: settingsData.rate_limiting?.max_requests || 100,
                },
                environment: settingsData.environment || {}
            };
            
            setSettings(transformedSettings);
        } catch (error: any) {
            addToast(error.message || 'Failed to load settings.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleSave = async ({ type, data }: { type: string, data?: any }) => {
        setSaving(prev => ({ ...prev, [type]: true }));
        try {
            switch (type) {
                case 'rateLimiter':
                    await adminAPI.settingsAPI.updateRateLimiter({
                        window_minutes: Math.round(data.windowMs / (60 * 1000)),
                        max_requests: data.maxRequests
                    });
                    addToast('Rate limiter settings saved!', 'success');
                    break;
                case 'password':
                    await adminAPI.settingsAPI.changeUserPassword(data.userId, {
                        newPassword: data.newPassword,
                        adminNote: data.adminNote
                    });
                    addToast('User password changed successfully!', 'success');
                    break;
                case 'environment':
                    await adminAPI.settingsAPI.updateEnvironment(data);
                    addToast('Environment settings saved!', 'success');
                    break;
                case 'reset':
                     await adminAPI.settingsAPI.resetSettings({ confirmReset: true, resetType: 'all' });
                     addToast('System settings have been reset.', 'success');
                     break;
            }
            await fetchSettings();
        } catch (error: any) {
            addToast(error.message || `Failed to save ${type} settings.`, 'error');
        } finally {
            setSaving(prev => ({ ...prev, [type]: false }));
        }
    };
    
    if (loading || !settings) {
        return <div className="flex items-center justify-center h-full"><FiLoader className="animate-spin h-8 w-8 text-brand-gold"/></div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">General Settings</h1>
             <p className="text-gray-600 dark:text-gray-400">
                Manage core platform settings. For appearance and branding, go to {' '}
                <a href="/admin/settings/appearance" className="text-brand-gold hover:underline">Appearance Settings</a>.
            </p>
            
            <SecuritySettings settings={settings} onSave={handleSave} loading={{ rateLimiter: saving.rateLimiter, password: saving.password }} />
            <SystemSettings settings={settings} onSave={handleSave} loading={{ environment: saving.environment, reset: saving.reset }} />
        </div>
    );
};

export default SettingsPage;