
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { Notice } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { FiPlus, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext.tsx';
import DeleteNoticeModal from '../../components/admin/DeleteNoticeModal.tsx';

const ITEMS_PER_PAGE = 10;

const NoticeManagementPage: React.FC = () => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [pagination, setPagination] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        priority: 'all',
        page: 1,
    });
    const [deletingNotice, setDeletingNotice] = useState<Notice | null>(null);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const fetchNotices = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminAPI.noticeAPI.getNotices({ ...filters, limit: ITEMS_PER_PAGE });
            setNotices(response.notices);
            setPagination(response.pagination);
        } catch (err: any) {
            const msg = err.message || 'Failed to fetch notices.';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, addToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNotices();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchNotices]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleDeleteConfirm = async () => {
        if (!deletingNotice) return;
        try {
            await adminAPI.noticeAPI.deleteNotice(deletingNotice._id);
            addToast('Notice deleted successfully.', 'success');
            setDeletingNotice(null);
            fetchNotices();
        } catch (err: any) {
            addToast(`Failed to delete notice: ${err.message}`, 'error');
            setDeletingNotice(null);
        }
    };

    const typeBadge = (type: Notice['type']) => {
        const styles = {
            info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            success: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            error: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return `px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[type]}`;
    };

    const priorityBadge = (priority: Notice['priority']) => {
        const styles = {
            low: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return `px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[priority]}`;
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Notice Management</h1>
                <Button onClick={() => navigate('/admin/notices/new')}>
                    <FiPlus className="mr-2" /> Create Notice
                </Button>
            </div>

            <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
                <input
                    type="text"
                    name="search"
                    placeholder="Search in title..."
                    className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
                    value={filters.search}
                    onChange={handleFilterChange}
                />
                <select name="type" value={filters.type} onChange={handleFilterChange} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                    <option value="all">All Types</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                </select>
                <select name="priority" value={filters.priority} onChange={handleFilterChange} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-brand-dark">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Target</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-brand-dark-200 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading && <tr><td colSpan={7} className="text-center p-4">Loading notices...</td></tr>}
                        {error && <tr><td colSpan={7} className="text-center p-4 text-red-500">{error}</td></tr>}
                        {!loading && notices.length === 0 && <tr><td colSpan={7} className="text-center p-4">No notices found.</td></tr>}
                        {!loading && !error && notices.map(notice => (
                            <tr key={notice._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{notice.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={typeBadge(notice.type)}>{notice.type}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={priorityBadge(notice.priority)}>{notice.priority}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{notice.targetRole}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${notice.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                        {notice.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(notice.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-2">
                                        <Button onClick={() => navigate(`/admin/notices/${notice._id}/edit`)} variant="ghost" className="p-2 text-blue-500" title="Edit"><FiEdit /></Button>
                                        <Button onClick={() => setDeletingNotice(notice)} variant="ghost" className="p-2 text-red-500" title="Delete"><FiTrash2 /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {pagination && pagination.pages > 1 && (
                <div className="flex justify-between items-center bg-white dark:bg-brand-dark-200 px-4 py-3 rounded-b-lg shadow-md">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} variant="ghost" className="p-2">
                            <FiChevronLeft />
                        </Button>
                        <Button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages} variant="ghost" className="p-2">
                            <FiChevronRight />
                        </Button>
                    </div>
                </div>
            )}
             <DeleteNoticeModal 
                isOpen={!!deletingNotice}
                onClose={() => setDeletingNotice(null)}
                onConfirm={handleDeleteConfirm}
                notice={deletingNotice}
            />
        </div>
    );
};

export default NoticeManagementPage;
