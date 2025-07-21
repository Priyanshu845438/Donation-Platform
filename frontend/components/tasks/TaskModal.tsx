
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiEdit } from 'react-icons/fi';
import Button from '../Button.tsx';
import { taskAPI } from '../../services/api.ts';
import type { Task } from '../../types.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task | null;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSuccess, task }) => {
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<Task>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (task) {
                // Editing existing task
                setFormData({
                    ...task,
                    dueDate: task.dueDate.split('T')[0], // Format for date input
                    recurringEndDate: task.recurringEndDate ? task.recurringEndDate.split('T')[0] : '',
                });
            } else {
                // Creating new task
                const today = new Date();
                const defaultTime = today.toTimeString().substring(0,5);
                setFormData({
                    title: '',
                    description: '',
                    dueDate: today.toISOString().split('T')[0],
                    dueTime: defaultTime,
                    priority: 'medium',
                    status: 'pending',
                    category: 'other',
                    isRecurring: false,
                });
            }
            setError('');
        }
    }, [isOpen, task]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (task?._id) {
                await taskAPI.updateTask(task._id, formData);
                addToast('Task updated successfully!', 'success');
            } else {
                await taskAPI.createTask(formData);
                addToast('Task created successfully!', 'success');
            }
            onSuccess();
        } catch (err: any) {
            const msg = err.message || 'An error occurred.';
            setError(msg);
            addToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-xl w-full max-w-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold font-serif text-navy-blue dark:text-white flex items-center gap-2">
                                {task ? <FiEdit/> : <FiPlus/>} {task ? 'Edit Task' : 'Create New Task'}
                            </h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-brand-dark"><FiX/></button>
                        </header>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto">
                                {error && <div className="p-3 text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-md">{error}</div>}
                                
                                <input type="text" name="title" value={formData.title || ''} onChange={handleChange} placeholder="Task Title" required className="w-full text-lg font-semibold px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />
                                <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Description..." className="w-full h-24 px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                                    <input type="time" name="dueTime" value={formData.dueTime || ''} onChange={handleChange} required className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <select name="priority" value={formData.priority || 'medium'} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                        <option value="low">Low Priority</option>
                                        <option value="medium">Medium Priority</option>
                                        <option value="high">High Priority</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                    <select name="category" value={formData.category || 'other'} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                        <option value="meeting">Meeting</option>
                                        <option value="review">Review</option>
                                        <option value="approval">Approval</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="deadline">Deadline</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <select name="status" value={formData.status || 'pending'} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                
                                <div className="pt-2">
                                    <label className="flex items-center gap-2">
                                        <input type="checkbox" name="isRecurring" checked={formData.isRecurring || false} onChange={handleChange} className="h-5 w-5 text-brand-gold rounded focus:ring-brand-gold"/>
                                        Is this a recurring task?
                                    </label>
                                </div>

                                {formData.isRecurring && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-brand-dark rounded-md border dark:border-gray-700">
                                        <select name="recurringType" value={formData.recurringType || 'daily'} onChange={handleChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                            <option value="yearly">Yearly</option>
                                        </select>
                                        <div>
                                            <label className="text-sm">End Date</label>
                                            <input type="date" name="recurringEndDate" value={formData.recurringEndDate || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"/>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <footer className="flex justify-end p-4 border-t dark:border-gray-700 space-x-2">
                                <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                                <Button type="submit" variant="primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Task'}
                                </Button>
                            </footer>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TaskModal;
