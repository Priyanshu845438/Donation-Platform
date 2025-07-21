
import React, { useState, useEffect } from 'react';
import { taskAPI } from '../../services/api.ts';
import type { Task } from '../../types.ts';
import TaskItem from './TaskItem.tsx';
import { FiLoader, FiAlertCircle, FiStar, FiClock } from 'react-icons/fi';

interface TodayViewProps {
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: () => void;
}

const TodayView: React.FC<TodayViewProps> = ({ onEdit, onDelete, onComplete }) => {
  const [data, setData] = useState<{ todaysTasks: Task[], overdueTasks: Task[], summary: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTodaysTasks = async () => {
      setLoading(true);
      try {
        const response = await taskAPI.getTodaysTasks();
        setData(response);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tasks for today.');
      } finally {
        setLoading(false);
      }
    };
    fetchTodaysTasks();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center p-8"><FiLoader className="animate-spin mr-2"/>Loading today's tasks...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center p-8 text-red-500"><FiAlertCircle className="mr-2"/>{error}</div>;
  }

  if (!data || (data.todaysTasks.length === 0 && data.overdueTasks.length === 0)) {
    return <div className="text-center p-8 text-gray-500">You're all caught up for today!</div>;
  }
  
  const { todaysTasks, overdueTasks, summary } = data;

  return (
    <div className="space-y-8">
      {overdueTasks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
            <FiClock /> Overdue Tasks ({overdueTasks.length})
          </h2>
          <div className="space-y-3">
            {overdueTasks.map(task => (
              <TaskItem key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} />
            ))}
          </div>
        </section>
      )}

      {todaysTasks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-navy-blue dark:text-white flex items-center gap-2 mb-4">
            <FiStar /> Today's Tasks ({summary.pendingToday})
          </h2>
          <div className="space-y-3">
            {todaysTasks.map(task => (
              <TaskItem key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} onComplete={onComplete} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default TodayView;
