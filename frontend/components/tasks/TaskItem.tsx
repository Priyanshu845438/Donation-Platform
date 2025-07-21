
import React from 'react';
import type { Task } from '../../types.ts';
import { FiEdit, FiTrash2, FiCheck } from 'react-icons/fi';
import Button from '../Button.tsx';
import { taskAPI } from '../../services/api.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onComplete }) => {
    const { addToast } = useToast();
    
    const handleCompleteClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await taskAPI.markTaskComplete(task._id);
            addToast('Task marked as complete!', 'success');
            onComplete();
        } catch (err: any) {
            addToast(err.message || 'Failed to complete task.', 'error');
        }
    };
    
    const priorityStyles = {
        low: 'border-l-blue-400',
        medium: 'border-l-green-500',
        high: 'border-l-yellow-500',
        urgent: 'border-l-red-600',
    };
    
    const statusStyles = {
        pending: 'text-gray-500',
        'in-progress': 'text-blue-500',
        completed: 'text-green-500 line-through',
        cancelled: 'text-red-500 line-through',
    };

    return (
        <div className={`p-4 bg-white dark:bg-brand-dark-200 rounded-lg shadow-sm border-l-4 ${priorityStyles[task.priority]} flex items-center justify-between gap-4 transition-all hover:shadow-md`}>
            <div className="flex-grow">
                <p className={`font-semibold ${statusStyles[task.status]} dark:text-gray-200`}>{task.title}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()} at {task.dueTime}</span>
                    <span className="capitalize">• {task.category}</span>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                {task.status !== 'completed' && task.status !== 'cancelled' && (
                    <Button onClick={handleCompleteClick} variant="ghost" className="p-2 text-green-500 hover:bg-green-100" title="Mark as complete">
                        <FiCheck/>
                    </Button>
                )}
                <Button onClick={() => onEdit(task)} variant="ghost" className="p-2 text-blue-500 hover:bg-blue-100" title="Edit Task">
                    <FiEdit/>
                </Button>
                <Button onClick={() => onDelete(task)} variant="ghost" className="p-2 text-red-500 hover:bg-red-100" title="Delete Task">
                    <FiTrash2/>
                </Button>
            </div>
        </div>
    );
};

export default TaskItem;
