
import React, { useState } from 'react';
import CalendarView from '../../components/tasks/CalendarView.tsx';
import TaskModal from '../../components/tasks/TaskModal.tsx';
import DeleteTaskModal from '../../components/tasks/DeleteTaskModal.tsx';
import type { Task } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { FiPlus } from 'react-icons/fi';

const TaskCalendarPage: React.FC = () => {
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshData = () => setRefreshKey(k => k + 1);

    const handleEditTask = (task: Task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const handleSuccess = () => {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
        refreshData();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Task Calendar</h1>
                <Button onClick={() => { setSelectedTask(null); setIsTaskModalOpen(true); }}>
                    <FiPlus className="mr-2" /> Create Task
                </Button>
            </div>

            <div className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-md p-6">
                <CalendarView key={refreshKey} onEdit={handleEditTask} />
            </div>

            <TaskModal 
                isOpen={isTaskModalOpen} 
                onClose={() => setIsTaskModalOpen(false)} 
                onSuccess={handleSuccess}
                task={selectedTask}
            />
        </div>
    );
};

export default TaskCalendarPage;
