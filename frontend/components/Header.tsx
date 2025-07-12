
import React, { useState, useContext, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiHeart, FiUser, FiLogOut, FiGrid } from 'react-icons/fi';
import Button from './Button.tsx';
import ThemeToggle from './ThemeToggle.tsx';
import { AuthContext } from '../context/AuthContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';

const NavLinks = () => {
  const { user } = useContext(AuthContext);
  const baseClass = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
  const activeClass = "text-brand-gold";
  const inactiveClass = "text-gray-700 dark:text-gray-200 hover:text-brand-gold dark:hover:text-brand-gold";
  
  return (
    <>
      <NavLink to="/" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>Home</NavLink>
      <NavLink to="/about" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>About</NavLink>
      <NavLink to="/explore" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>Explore</NavLink>
      {user?.role === 'admin' && (
        <NavLink to="/admin" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>Admin Dashboard</NavLink>
      )}
       <NavLink to="/contact" className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass}`}>Contact</NavLink>
    </>
  );
};


const Header: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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

    return (
        <header className="bg-white/80 dark:bg-brand-dark/80 backdrop-blur-md shadow-sm sticky top-0 z-50 transition-colors">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                           <FiHeart className="h-8 w-8 text-brand-gold" />
                           <span className="text-xl font-bold text-brand-deep-blue dark:text-white font-serif">DonationHub</span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavLinks />
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-2">
                        <ThemeToggle />
                        {user ? (
                            <div ref={profileMenuRef} className="relative">
                                <button
                                    onClick={() => setIsProfileMenuOpen(prev => !prev)}
                                    className="flex items-center p-2 rounded-full hover:bg-gray-200 dark:hover:bg-brand-dark-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-brand-dark focus:ring-brand-gold"
                                    aria-haspopup="true"
                                    aria-expanded={isProfileMenuOpen}
                                >
                                    <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full" />
                                </button>
                                <AnimatePresence>
                                    {isProfileMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ duration: 0.1 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-dark-200 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 origin-top-right z-50"
                                            role="menu"
                                            aria-orientation="vertical"
                                        >
                                            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600">Signed in as <br/><strong className="truncate">{user.name}</strong></div>
                                            <Link to={`/profile/${user.username}`} onClick={() => setIsProfileMenuOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-brand-dark" role="menuitem">
                                                <FiUser className="mr-2"/> Profile
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-brand-dark" role="menuitem">
                                                    <FiGrid className="mr-2"/> Dashboard
                                                </Link>
                                            )}
                                            <button onClick={() => { handleLogout(); setIsProfileMenuOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-brand-dark" role="menuitem">
                                                <FiLogOut className="mr-2"/> Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Button to="/login" variant="outline">Login</Button>
                                <Button to="/signup" variant="primary">Sign Up</Button>
                            </>
                        )}
                    </div>
                    <div className="-mr-2 flex md:hidden items-center">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="bg-gray-100 dark:bg-brand-dark-200 inline-flex items-center justify-center p-2 rounded-md text-brand-deep-blue dark:text-white hover:text-brand-gold focus:outline-none"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? <FiMenu className="block h-6 w-6" /> : <FiX className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
                        <NavLinks />
                    </div>
                     <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col items-center px-5 space-y-3">
                            {user ? (
                                <>
                                    <div className="flex items-center mb-2">
                                        <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full mr-3" />
                                        <div>
                                            <p className="text-base font-medium text-gray-800 dark:text-white">{user.name}</p>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.email}</p>
                                        </div>
                                    </div>
                                    <Button to={`/profile/${user.username}`} variant="outline" fullWidth>Profile</Button>
                                    <Button onClick={handleLogout} variant="secondary" fullWidth>Logout</Button>
                                </>
                            ) : (
                                <>
                                    <Button to="/login" variant="outline" fullWidth>Login</Button>
                                    <Button to="/signup" variant="primary" fullWidth>Sign Up</Button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
