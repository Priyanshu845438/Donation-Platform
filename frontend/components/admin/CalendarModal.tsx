
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar } from 'react-icons/fi';
import CalendarView from '../tasks/CalendarView.tsx';
import TaskModal from '../tasks/TaskModal.tsx';
import type { Task } from '../../types.ts';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSuccess = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
    setRefreshKey(k => k + 1); // Refresh calendar view
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -50, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-xl font-bold font-serif text-navy-blue dark:text-white flex items-center gap-2">
                  <FiCalendar /> My Calendar
                </h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-brand-dark text-gray-500 dark:text-gray-400">
                  <FiX size={24} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto">
                <CalendarView key={refreshKey} onEdit={handleEditTask} />
              </div>
            </motion.div>
          </motion.div>

          {/* Nested Task Modal */}
          <TaskModal 
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onSuccess={handleSuccess}
            task={selectedTask}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default CalendarModal;
