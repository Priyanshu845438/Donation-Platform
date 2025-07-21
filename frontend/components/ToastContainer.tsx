import React from 'react';
import { useToast } from '../context/ToastContext.tsx';
import Toast from './Toast.tsx';
import { AnimatePresence } from 'framer-motion';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[99999] w-full max-w-xs">
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
