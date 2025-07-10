
import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { NAV_LINKS } from '../../utils/constants';
import Button from './Button';

const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface/95 backdrop-blur-lg shadow-serene' : 'bg-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-bold font-display text-primary transition hover:opacity-80">
                            CharityPlus
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-2">
                            {NAV_LINKS.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                                            isActive
                                                ? 'text-primary'
                                                : `hover:text-text-primary ${scrolled ? 'text-text-secondary' : 'text-white/80 hover:text-white'}`
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
                                <Link to={`/dashboard`} className={`font-medium transition-colors ${scrolled ? 'text-text-secondary hover:text-primary' : 'text-white/90 hover:text-white'}`}>
                                   Welcome, {user.fullName.split(' ')[0]}
                                </Link>
                                <Button onClick={handleLogout} variant="outline" size="sm">Logout</Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login">
                                    <Button variant="outline" size="sm" className={!scrolled ? 'border-white/50 text-white hover:bg-white/10' : ''}>Login</Button>
                                </Link>
                                <Link to="/signup">
                                    <Button variant="accent" size="sm">Sign Up</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary ${scrolled ? 'text-text-secondary hover:text-primary' : 'text-white/90 hover:text-white'}`}
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            <ion-icon name={isOpen ? 'close-outline' : 'menu-outline'} className="text-3xl"></ion-icon>
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden bg-surface" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {NAV_LINKS.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={({ isActive }) =>
                                    `block px-3 py-2 rounded-md text-base font-medium ${
                                        isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                                    }`
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    <div className="pt-4 pb-3 border-t border-border">
                        {isAuthenticated && user ? (
                             <div className="flex flex-col items-start px-5 space-y-3">
                                <Link to={`/dashboard`} onClick={() => setIsOpen(false)} className="font-medium text-text-secondary hover:text-primary">
                                    {user.fullName}
                                </Link>
                                <Button onClick={() => { handleLogout(); setIsOpen(false); }} variant="outline" className="w-full">Logout</Button>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-2 px-5">
                                <Link to="/login"><Button onClick={() => setIsOpen(false)} variant="outline" className="w-full">Login</Button></Link>
                                <Link to="/signup"><Button onClick={() => setIsOpen(false)} variant="accent" className="w-full">Sign Up</Button></Link>
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
