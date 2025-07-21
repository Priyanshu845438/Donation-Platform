
import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../services/api.ts';
import type { Task, TaskStats } from '../types.ts';
import Button from '../components/Button.tsx';
import TaskModal from '../components/tasks/TaskModal.tsx';
import DeleteTaskModal from '../components/tasks/DeleteTaskModal.tsx';
import { FiPlus, FiEdit, FiTrash2, FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useToast } from '../context/ToastContext.tsx';

const ITEMS_PER_PAGE = 10;

const TaskManagerPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [stats, setStats] = useState<TaskStats | null>(null);
    const [pagination, setPagination] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        priority: 'all',
        category: 'all',
        page: 1,
    });
    
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const { addToast } = useToast();

    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const response = await taskAPI.getTasks({ ...filters, limit: ITEMS_PER_PAGE });
            setTasks(response.tasks);
            setStats(response.stats);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch tasks.');
            addToast(err.message || 'Failed to fetch tasks.', 'error');
        } finally {
            setLoading(false);
        }
    }, [filters, addToast]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTasks();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchTasks]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    const handleSuccess = () => {
        setIsTaskModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedTask(null);
        fetchTasks();
    };

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const handleDeleteTask = (task: Task) => {
        setSelectedTask(task);
        setIsDeleteModalOpen(true);
    };

    const priorityBadge = (priority: Task['priority']) => {
        const styles = {
            low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
            medium: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            high: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
            urgent: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return `px-2 py-1 text-xs font-semibold rounded-full capitalize ${styles[priority]}`;
    };

    const statusBadge = (status: Task['status']) => {
        const styles = {
            pending: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            'in-progress': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
            completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        };
        return `px-2 py-1 text-xs font-semibold rounded-full capitalize whitespace-nowrap ${styles[status]}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Task Management</h1>
                <Button onClick={() => { setSelectedTask(null); setIsTaskModalOpen(true); }}>
                    <FiPlus className="mr-2" /> Create Task
                </Button>
            </div>

            <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
                <input
                    type="text"
                    name="search"
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
                <select name="status" value={filters.status} onChange={handleFilterChange} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Due Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-brand-dark-200 divide-y divide-gray-200 dark:divide-gray-700">
                        {loading && <tr><td colSpan={5} className="text-center p-4"><FiLoader className="animate-spin inline mr-2" />Loading tasks...</td></tr>}
                        {error && <tr><td colSpan={5} className="text-center p-4 text-red-500"><FiAlertCircle className="inline mr-2" />{error}</td></tr>}
                        {!loading && tasks.length === 0 && <tr><td colSpan={5} className="text-center p-4">No tasks found.</td></tr>}
                        {!loading && !error && tasks.map(task => (
                            <tr key={task._id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{task.category}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {new Date(task.dueDate).toLocaleDateString()} at {task.dueTime}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={priorityBadge(task.priority)}>{task.priority}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap"><span className={statusBadge(task.status)}>{task.status}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end items-center gap-2">
                                        <Button onClick={() => handleEditTask(task)} variant="ghost" className="p-2 text-blue-500" title="Edit"><FiEdit /></Button>
                                        <Button onClick={() => handleDeleteTask(task)} variant="ghost" className="p-2 text-red-500" title="Delete"><FiTrash2 /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-between items-center bg-white dark:bg-brand-dark-200 px-4 py-3 rounded-b-lg shadow-md">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrev} variant="ghost" className="p-2">
                            <FiChevronLeft />
                        </Button>
                        <Button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} variant="ghost" className="p-2">
                            <FiChevronRight />
                        </Button>
                    </div>
                </div>
            )}

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSuccess={handleSuccess}
                task={selectedTask}
            />

            <DeleteTaskModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleSuccess}
                task={selectedTask}
            />
        </div>
    );
};

export default TaskManagerPage;
