
import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiCalendar, FiLogOut, FiUser, FiEdit, FiSettings } from 'react-icons/fi';
import ThemeToggle from '../ThemeToggle.tsx';
import { AuthContext } from '../../context/AuthContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarModal from '../admin/CalendarModal.tsx'; // Reusing admin calendar modal for now

const NgoHeader: React.FC = () => {
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) return null;

    return (
        <header className="flex-shrink-0 bg-white dark:bg-brand-dark-200 shadow-sm p-4 flex justify-between items-center z-10 border-b border-gray-200 dark:border-gray-700">
            <div className="relative w-full max-w-xs">
                <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search campaigns..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
                />
            </div>

            <div className="flex items-center gap-4">
                <button onClick={() => setIsCalendarOpen(true)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-brand-dark">
                    <FiCalendar size={20} />
                </button>
                <ThemeToggle />
                <div ref={profileMenuRef} className="relative">
                    <button
                        onClick={() => setIsProfileMenuOpen(prev => !prev)}
                        className="flex items-center p-1 rounded-full hover:bg-gray-200 dark:hover:bg-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-dark focus:ring-brand-gold"
                        aria-haspopup="true"
                        aria-expanded={isProfileMenuOpen}
                    >
                        <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full" />
                    </button>
                    <AnimatePresence>
                        {isProfileMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 mt-2 w-56 bg-white dark:bg-brand-dark-200 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 origin-top-right z-50"
                                role="menu"
                                aria-orientation="vertical"
                            >
                                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate" title={user.name}>{user.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate" title={user.email}>{user.email}</p>
                                </div>
                                <div className="py-1">
                                    <Link to="/ngo/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-brand-dark" role="menuitem">
                                        <FiUser className="mr-3"/> My Profile
                                    </Link>
                                    <Link to="/ngo/settings" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-brand-dark" role="menuitem">
                                        <FiSettings className="mr-3"/> Settings
                                    </Link>
                                </div>
                                <div className="py-1 border-t border-gray-200 dark:border-gray-600">
                                    <button onClick={() => { handleLogout(); setIsProfileMenuOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-brand-dark" role="menuitem">
                                        <FiLogOut className="mr-3"/> Logout
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <CalendarModal isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} />
        </header>
    );
};

export default NgoHeader;