
import React, { useState, useEffect, useCallback } from 'react';
import { taskAPI } from '../../services/api.ts';
import type { Task, TaskStats } from '../../types.ts';
import TaskItem from './TaskItem.tsx';
import Button from '../Button.tsx';
import { FiLoader, FiAlertCircle, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const ITEMS_PER_PAGE = 10;

interface TaskListViewProps {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const TaskListView: React.FC<TaskListViewProps> = ({ onEdit, onDelete }) => {
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

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getTasks({ ...filters, limit: ITEMS_PER_PAGE });
      setTasks(response.tasks);
      setStats(response.stats);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTasks]);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value, page: 1}));
  };
  
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({...prev, page: newPage}));
  };
  
  const handleComplete = () => {
      fetchTasks();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-brand-dark p-4 rounded-lg flex flex-wrap items-center gap-4 border dark:border-gray-700">
        <input 
            type="text" 
            name="search" 
            placeholder="Search tasks..." 
            value={filters.search} 
            onChange={handleFilterChange}
            className="flex-grow px-4 py-2 border rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
        />
        <select name="status" value={filters.status} onChange={handleFilterChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
        </select>
         <select name="priority" value={filters.priority} onChange={handleFilterChange} className="px-4 py-2 border rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold">
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
        </select>
      </div>
      
      {loading && <div className="flex justify-center items-center p-8"><FiLoader className="animate-spin mr-2"/>Loading tasks...</div>}
      {error && <div className="flex justify-center items-center p-8 text-red-500"><FiAlertCircle className="mr-2"/>{error}</div>}
      
      {!loading && !error && (
        <>
          <div className="space-y-3">
            {tasks.length > 0 ? (
                tasks.map(task => <TaskItem key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} onComplete={handleComplete} />)
            ) : (
                <div className="text-center p-8 text-gray-500">No tasks found for the selected filters.</div>
            )}
          </div>
          
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrev} variant="ghost" className="p-2"><FiChevronLeft/></Button>
                    <Button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} variant="ghost" className="p-2"><FiChevronRight/></Button>
                </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskListView;
