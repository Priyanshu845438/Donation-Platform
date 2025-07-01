
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { NAV_LINKS } from '../../utils/constants';
import Button from './Button';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-background/70 backdrop-blur-lg sticky top-0 z-50 border-b border-border/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold text-primary-light transition hover:opacity-80">
                            CharityPlus
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {NAV_LINKS.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                                            isActive
                                                ? 'text-copy'
                                                : 'text-copy-muted hover:text-copy'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                    <div className="hidden md:block">
                        {isAuthenticated && user ? (
                            <div className="flex items-center space-x-4">
                                <Link to={`/dashboard`} className="font-medium text-copy-muted hover:text-primary-light">
                                   Welcome, {user.fullName.split(' ')[0]}
                                </Link>
                                <Button onClick={handleLogout} variant="secondary" size="sm">Logout</Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login">
                                    <Button variant="outline" size="sm">Login</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="primary" size="sm">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="bg-surface inline-flex items-center justify-center p-2 rounded-md text-copy-muted hover:text-primary-light hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            <ion-icon name={isOpen ? 'close-outline' : 'menu-outline'} className="text-2xl"></ion-icon>
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-surface">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `block px-3 py-2 rounded-md text-base font-medium ${
                                        isActive ? 'bg-primary text-copy' : 'text-copy-muted hover:bg-background hover:text-copy'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    <div className="pt-4 pb-3 border-t border-border">
                        {isAuthenticated && user ? (
                             <div className="flex flex-col items-start px-5 space-y-3">
                                <Link to={`/dashboard`} onClick={() => setIsOpen(false)} className="font-medium text-copy-muted hover:text-primary-light">
                                    {user.fullName}
                                </Link>
                                <Button onClick={() => { handleLogout(); setIsOpen(false); }} variant="secondary" className="w-full">Logout</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2 px-5">
                                <Link to="/login"><Button onClick={() => setIsOpen(false)} variant="outline" className="w-full">Login</Button></Link>
                                <Link to="/signup"><Button onClick={() => setIsOpen(false)} variant="primary" className="w-full">Sign Up</Button></Link>
                            </div>
                        )}
                    </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
