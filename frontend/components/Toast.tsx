import React from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiLoader } from 'react-icons/fi';
import { Toast as ToastInterface } from '../context/ToastContext.tsx';

interface ToastProps {
  toast: ToastInterface;
  onDismiss: (id: string) => void;
}

const icons = {
  success: <FiCheckCircle />,
  error: <FiAlertCircle />,
  info: <FiInfo />,
  loading: <FiLoader className="animate-spin" />,
};

const colors = {
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    info: 'bg-blue-500 border-blue-600',
    loading: 'bg-gray-700 border-gray-800',
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5, transition: { duration: 0.2 } }}
      className={`flex items-center w-full max-w-xs p-4 mb-4 text-white ${colors[toast.type]} rounded-lg shadow-2xl border-b-4`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-xl">
        {icons[toast.type]}
        <span className="sr-only">{toast.type} icon</span>
      </div>
      <div className="ml-3 text-sm font-medium">{toast.message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white/10 text-white hover:bg-white/30 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <FiX />
      </button>
    </motion.div>
  );
};

export default Toast;
