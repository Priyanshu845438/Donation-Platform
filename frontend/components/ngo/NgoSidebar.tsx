

import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiHeart, FiSettings, FiFileText, FiBriefcase, FiChevronDown, FiChevronRight, FiList, FiPlusSquare, FiUserPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { label: 'Dashboard', icon: <FiGrid />, to: '/ngo/dashboard', isSingle: true, path: '/ngo/dashboard' },
    {
        label: 'Campaigns', icon: <FiHeart />, path: '/ngo/campaigns',
        subItems: [
            { label: 'My Campaigns', to: '/ngo/campaigns', icon: <FiList /> },
            { label: 'Create Campaign', to: '/ngo/campaigns/new', icon: <FiPlusSquare /> }
        ]
    },
    { label: 'Volunteering', icon: <FiUserPlus />, to: '/ngo/volunteering', isSingle: true, path: '/ngo/volunteering' },
    { label: 'Companies', icon: <FiBriefcase />, to: '/ngo/companies', isSingle: true, path: '/ngo/companies' },
    { label: 'Users', icon: <FiUsers />, to: '/ngo/users', isSingle: true, path: '/ngo/users' },
    { label: 'Reports', icon: <FiFileText />, to: '/ngo/reports', isSingle: true, path: '/ngo/reports' },
    { label: 'My Profile', icon: <FiUsers />, to: '/ngo/profile', isSingle: true, path: '/ngo/profile' },
    { label: 'Settings', icon: <FiSettings />, to: '/ngo/settings', isSingle: true, path: '/ngo/settings' },
];

const NgoSidebar: React.FC = () => {
    const location = useLocation();
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        const currentMenu = menuItems.find(item => !item.isSingle && location.pathname.startsWith(item.path));
        setOpenMenu(currentMenu ? currentMenu.label : null);
    }, [location.pathname]);
    
    const handleMenuToggle = (label: string) => {
        setOpenMenu(prev => (prev === label ? null : label));
    };

    const baseLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-brand-royal-navy hover:text-white transition-colors rounded-lg";
    const activeLinkClasses = "bg-brand-royal-navy text-white font-semibold";
    
    const subMenuAnimation = {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: 'auto' },
        exit: { opacity: 0, height: 0 }
    };

    return (
        <div className="w-64 bg-brand-deep-blue text-white flex flex-col min-h-screen shadow-lg">
            <div className="flex items-center h-20 px-6 border-b border-gray-700">
                <Link to="/" className="text-2xl font-bold font-serif">DonationHub</Link>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map(item => (
                    <div key={item.label}>
                        {item.isSingle ? (
                            <NavLink to={item.to!} className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}>
                                <span className="mr-3 text-lg">{item.icon}</span>
                                {item.label}
                            </NavLink>
                        ) : (
                            <>
                                <button onClick={() => handleMenuToggle(item.label)} className={`${baseLinkClasses} w-full justify-between ${location.pathname.startsWith(item.path) ? activeLinkClasses : ''}`}>
                                    <div className="flex items-center">
                                        <span className="mr-3 text-lg">{item.icon}</span>
                                        {item.label}
                                    </div>
                                    {openMenu === item.label ? <FiChevronDown /> : <FiChevronRight />}
                                </button>
                                <AnimatePresence>
                                    {openMenu === item.label && (
                                        <motion.div {...subMenuAnimation} className="pl-4 mt-1 space-y-1 overflow-hidden">
                                            {item.subItems?.map(subItem => (
                                                <NavLink key={subItem.to} to={subItem.to} end className={({ isActive }) => `${baseLinkClasses} text-sm ${isActive ? activeLinkClasses : ''}`}>
                                                    <span className="mr-3 text-base">{subItem.icon}</span>
                                                    {subItem.label}
                                                </NavLink>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </>
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default NgoSidebar;