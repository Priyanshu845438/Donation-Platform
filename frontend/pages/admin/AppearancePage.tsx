


import React, { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { FiPenTool, FiType, FiImage, FiSave, FiLoader, FiCheck } from 'react-icons/fi';
import Button from '../../components/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { adminAPI, API_SERVER_URL } from '../../services/api.ts';
import { THEME_PRESETS, FONT_PAIRINGS } from '../../constants/theme.ts';

const SettingsCard = ({ title, description, icon, children, footer, fullWidth = false }: { title: string, description: string, icon: React.ReactNode, children: React.ReactNode, footer?: React.ReactNode, fullWidth?: boolean }) => (
    <div className={`bg-white dark:bg-brand-dark-200 shadow-md rounded-lg ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="text-brand-gold">{icon}</div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="bg-gray-50 dark:bg-brand-dark px-6 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">{footer}</div>}
    </div>
);

const FormRow = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <div className="mt-1">{children}</div>
    </div>
);


const AppearancePage: React.FC = () => {
    const { addToast } = useToast();
    const [settings, setSettings] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);


    const fetchSettings = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminAPI.settingsAPI.getSettings();
            const settingsData = response.data || response.settings || response;
            const appearance = settingsData.appearance || {};
            setSettings({
                siteName: settingsData.branding?.site_name || 'DonationHub',
                colors: appearance.colors || THEME_PRESETS[0].colors,
                fonts: appearance.fonts || FONT_PAIRINGS[0],
            });
            setLogoPreview(settingsData.branding?.logo ? `${API_SERVER_URL}${settingsData.branding.logo}` : null);
            setFaviconPreview(settingsData.branding?.favicon ? `${API_SERVER_URL}${settingsData.branding.favicon}` : null);
        } catch (error: any) {
            addToast(error.message || 'Failed to load appearance settings.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);
    
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);
    
    const handleColorChange = (theme: 'light' | 'dark', key: string, value: string) => {
        setSettings(prev => ({
            ...prev,
            colors: {
                ...prev.colors,
                [theme]: {
                    ...prev.colors[theme],
                    [key]: value
                }
            }
        }));
    };
    
    const handleFontChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedFontPair = FONT_PAIRINGS.find(f => f.name === e.target.value);
        if (selectedFontPair) {
            setSettings(prev => ({ ...prev, fonts: selectedFontPair }));
        }
    };
    
    const applyPreset = (preset: any) => {
        setSettings(prev => ({
            ...prev,
            colors: preset.colors,
        }));
        addToast(`${preset.name} preset applied. Save to make it live.`, 'info');
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>, setFile: Function, setPreview: Function) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await adminAPI.settingsAPI.updateBranding({ site_name: settings.siteName });
            await adminAPI.settingsAPI.updateAppearanceSettings(settings);

            if (logoFile) {
                const formData = new FormData();
                formData.append('logo', logoFile);
                await adminAPI.settingsAPI.uploadLogo(formData);
            }
            if (faviconFile) {
                const formData = new FormData();
                formData.append('favicon', faviconFile);
                await adminAPI.settingsAPI.uploadFavicon(formData);
            }
            
            addToast('Appearance settings saved successfully! Refreshing to see changes...', 'success');
            setTimeout(() => window.location.reload(), 2000);

        } catch (err: any) {
            addToast(err.message || "Failed to save settings.", 'error');
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
         return <div className="flex items-center justify-center h-full"><FiLoader className="animate-spin h-8 w-8 text-brand-gold"/></div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Appearance</h1>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <><FiLoader className="animate-spin mr-2"/>Saving...</> : <><FiSave className="mr-2"/>Save Changes</>}
                </Button>
            </div>

            <SettingsCard title="Theme Presets" description="Select a predefined theme to get started quickly." icon={<FiPenTool size={24}/>} fullWidth>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {THEME_PRESETS.map(preset => (
                        <button key={preset.id} onClick={() => applyPreset(preset)} className="p-4 border-2 rounded-lg text-left hover:border-brand-gold transition-colors">
                            <span className="font-semibold text-sm">{preset.name}</span>
                            <div className="flex gap-1 mt-2">
                                {Object.values(preset.colors.light).slice(0, 5).map((color, i) => (
                                    <div key={i} style={{ backgroundColor: color as string }} className="w-5 h-5 rounded-full"></div>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </SettingsCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SettingsCard title="Color Palette" description="Customize your platform's colors." icon={<FiPenTool size={24}/>}>
                     <div className="space-y-4">
                        <h4 className="font-semibold">Light Theme</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {settings.colors?.light && Object.entries(settings.colors.light).map(([key, value]) => (
                                <FormRow key={key} label={key.replace(/-/g, ' ')}>
                                    <input type="color" value={value as string} onChange={e => handleColorChange('light', key, e.target.value)} className="w-full h-10 border rounded-md" />
                                </FormRow>
                            ))}
                        </div>
                         <h4 className="font-semibold pt-4 border-t dark:border-gray-700">Dark Theme</h4>
                         <div className="grid grid-cols-2 gap-4">
                            {settings.colors?.dark && Object.entries(settings.colors.dark).map(([key, value]) => (
                                <FormRow key={key} label={key.replace(/-/g, ' ')}>
                                    <input type="color" value={value as string} onChange={e => handleColorChange('dark', key, e.target.value)} className="w-full h-10 border rounded-md" />
                                </FormRow>
                            ))}
                        </div>
                    </div>
                </SettingsCard>

                <div className="space-y-6">
                    <SettingsCard title="Typography" description="Select font pairings for headings and body text." icon={<FiType size={24}/>}>
                        <FormRow label="Font Pairing">
                            <select value={settings.fonts?.name || ''} onChange={handleFontChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                {FONT_PAIRINGS.map(font => (
                                    <option key={font.name} value={font.name}>{font.name}</option>
                                ))}
                            </select>
                        </FormRow>
                    </SettingsCard>

                    <SettingsCard title="Branding & Logo" description="Upload your logo and set your site name." icon={<FiImage size={24}/>}>
                        <div className="space-y-4">
                             <FormRow label="Site Name">
                                <input type="text" value={settings.siteName || ''} onChange={e => setSettings({...settings, siteName: e.target.value})} className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                            </FormRow>
                             <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    {logoPreview ? <img src={logoPreview} alt="Logo Preview" className="h-16 w-16 object-contain bg-gray-100 dark:bg-gray-700 p-1 rounded-md" /> : <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">Logo</div>}
                                </div>
                                <FormRow label="Upload Logo (PNG, SVG)">
                                    <input type="file" accept="image/png, image/svg+xml" onChange={e => handleFileChange(e, setLogoFile, setLogoPreview)} className="text-sm" />
                                </FormRow>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    {faviconPreview ? <img src={faviconPreview} alt="Favicon Preview" className="h-16 w-16 object-contain bg-gray-100 dark:bg-gray-700 p-1 rounded-md" /> : <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center text-xs text-gray-400">Favicon</div>}
                                </div>
                                <FormRow label="Upload Favicon (.ico, .svg, .png)">
                                    <input type="file" accept="image/x-icon, image/svg+xml, image/png" onChange={e => handleFileChange(e, setFaviconFile, setFaviconPreview)} className="text-sm" />
                                </FormRow>
                            </div>
                        </div>
                    </SettingsCard>
                </div>
            </div>
        </div>
    );
};

export default AppearancePage;