
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from '../Button.tsx';
import type { Campaign } from '../../types.ts';

interface DeleteCampaignModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    campaign: Campaign | null;
}

const DeleteCampaignModal: React.FC<DeleteCampaignModalProps> = ({ isOpen, onClose, onConfirm, campaign }) => {
    if (!campaign) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: -50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-xl w-full max-w-md m-4 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                                <FiAlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" aria-hidden="true" />
                            </div>
                            <h3 className="mt-5 text-lg font-medium leading-6 text-gray-900 dark:text-white">Delete Campaign</h3>
                            <div className="mt-2 px-7 py-3">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Are you sure you want to permanently delete the campaign <strong className="text-gray-800 dark:text-gray-200">{campaign.title}</strong>? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                         <div className="flex items-center justify-center p-6 space-x-3 bg-gray-50 dark:bg-brand-dark rounded-b-lg">
                            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                            <Button type="button" variant="primary" className="bg-red-600 hover:bg-red-700 focus:ring-red-500 !border-red-600" onClick={onConfirm}>
                                Yes, Delete
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DeleteCampaignModal;