
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import Button from '../../components/Button.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { FiSave, FiArrowLeft, FiLoader } from 'react-icons/fi';
import type { Notice } from '../../types.ts';

const EditNoticePage: React.FC = () => {
    const { noticeId } = useParams<{ noticeId: string }>();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<Notice>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!noticeId) {
            setError("No notice ID provided.");
            setLoading(false);
            return;
        }

        const fetchNotice = async () => {
            try {
                const noticeData = await adminAPI.noticeAPI.getNoticeById(noticeId);
                if (noticeData.scheduledAt) {
                    // Format for datetime-local input
                    noticeData.scheduledAt = new Date(noticeData.scheduledAt).toISOString().slice(0, 16);
                }
                setFormData(noticeData);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch notice data.');
                addToast(err.message || 'Failed to fetch notice data.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchNotice();
    }, [noticeId, addToast]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!noticeId) return;

        setError('');
        setSaving(true);
        
        const dataToSubmit: Partial<Notice> = { ...formData };
        if (!dataToSubmit.scheduledAt) {
            delete dataToSubmit.scheduledAt;
        }

        try {
            await adminAPI.noticeAPI.updateNotice(noticeId, dataToSubmit);
            addToast('Notice updated successfully!', 'success');
            navigate('/admin/notices');
        } catch (err: any) {
            const msg = err.message || 'Failed to update notice.';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setSaving(false);
        }
    };
    
    if (loading) {
        return <div className="flex items-center justify-center p-8"><FiLoader className="animate-spin mr-2"/> Loading notice...</div>
    }

    if (error && !formData.title) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>;
    }

    return (
        <div className="space-y-6">
            <Link to="/admin/notices" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-gold font-semibold">
                <FiArrowLeft /> Back to Notice List
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Notice</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Notice Content</h2>
                    <input name="title" value={formData.title || ''} onChange={handleChange} placeholder="Notice Title" required className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                    <textarea name="content" value={formData.content || ''} onChange={handleChange} placeholder="Full notice content..." required className="w-full px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold h-40" />
                </div>

                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md space-y-4">
                    <h2 className="text-xl font-semibold border-b dark:border-gray-700 pb-2">Configuration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Type</label>
                            <select name="type" value={formData.type || 'info'} onChange={handleChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                <option value="info">Info</option>
                                <option value="success">Success</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Priority</label>
                            <select name="priority" value={formData.priority || 'medium'} onChange={handleChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Target Audience</label>
                            <select name="targetRole" value={formData.targetRole || 'all'} onChange={handleChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                <option value="all">All Users</option>
                                <option value="donor">Donors</option>
                                <option value="ngo">NGOs</option>
                                <option value="company">Companies</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium mb-1">Schedule At (Optional)</label>
                            <input type="datetime-local" name="scheduledAt" value={formData.scheduledAt || ''} onChange={handleChange} className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-5 w-5 text-brand-gold focus:ring-brand-gold border-gray-300 rounded" />
                            <label htmlFor="isActive">Active</label>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <input type="checkbox" id="sendEmail" name="sendEmail" checked={formData.sendEmail} onChange={handleChange} className="h-5 w-5 text-brand-gold focus:ring-brand-gold border-gray-300 rounded" />
                            <label htmlFor="sendEmail">Send Email Notification</label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                        <FiSave className="mr-2"/>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditNoticePage;
