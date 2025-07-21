
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShare2, FiClipboard, FiCheck, FiLoader } from 'react-icons/fi';
import Button from '../Button.tsx';
import { adminAPI } from '../../services/api.ts';
import type { User } from '../../types.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface ShareProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const ShareProfileModal: React.FC<ShareProfileModalProps> = ({ isOpen, onClose, user }) => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen && user && user.profile?._id) {
            const generateLink = async () => {
                setLoading(true);
                setError('');
                setShareLink('');
                setCopied(false);
                try {
                    let response;
                    if (user.role === 'ngo') {
                        response = await adminAPI.generateNgoShareLink(user.profile._id!);
                    } else if (user.role === 'company') {
                        response = await adminAPI.generateCompanyShareLink(user.profile._id!);
                    } else {
                        throw new Error('Sharing is only available for NGOs and Companies.');
                    }
                    setShareLink(response.shareLink);
                    addToast('Share link generated!', 'success');
                } catch (err: any) {
                    const msg = err.message || 'Failed to generate share link.';
                    setError(msg);
                    addToast(msg, 'error');
                } finally {
                    setLoading(false);
                }
            };
            generateLink();
        }
    }, [isOpen, user]);

    const handleCopy = () => {
        if (!shareLink) return;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        addToast('Link copied to clipboard!', 'success');
        setTimeout(() => setCopied(false), 2000);
    };

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
                        className="bg-white dark:bg-brand-dark-200 rounded-lg shadow-xl w-full max-w-lg m-4 relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold font-serif text-navy-blue dark:text-white flex items-center">
                                <FiShare2 className="mr-3 text-brand-gold"/>
                                Share Profile
                            </h2>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-brand-dark text-gray-500 dark:text-gray-400">
                                <FiX size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                Generate a public link to share this organization's profile. Anyone with the link will be able to view their public page.
                            </p>
                            {loading && (
                                <div className="flex items-center justify-center h-24">
                                    <FiLoader className="animate-spin h-8 w-8 text-brand-gold"/>
                                    <span className="ml-3">Generating link...</span>
                                </div>
                            )}
                            {error && <div className="p-3 text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300 rounded-md text-sm">{error}</div>}
                            {shareLink && (
                                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-brand-dark p-3 rounded-md">
                                    <input 
                                        type="text"
                                        value={shareLink}
                                        readOnly
                                        className="w-full bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
                                    />
                                    <Button onClick={handleCopy} variant="primary" className="flex-shrink-0 px-4 py-2">
                                        {copied ? <FiCheck className="mr-2"/> : <FiClipboard className="mr-2" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ShareProfileModal;
