
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

let idCounter = 0;

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = idCounter++;
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    const iconMap = {
        success: <ion-icon name="checkmark-circle-outline"></ion-icon>,
        error: <ion-icon name="alert-circle-outline"></ion-icon>,
        info: <ion-icon name="information-circle-outline"></ion-icon>,
    };

    const colorMap = {
        success: 'border-secondary text-secondary',
        error: 'border-red-500 text-red-500',
        info: 'border-blue-500 text-blue-500',
    };

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[100] space-y-3">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`flex items-center justify-between min-w-[320px] p-4 text-text-primary rounded-lg shadow-lg bg-surface border-l-4 ${colorMap[toast.type]} animate-fade-in`}
                    >
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">{iconMap[toast.type]}</span>
                            <span>{toast.message}</span>
                        </div>
                        <button onClick={() => removeToast(toast.id)} className="ml-4 p-1 rounded-full hover:bg-gray-100 transition-colors">
                            <ion-icon name="close-outline"></ion-icon>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};