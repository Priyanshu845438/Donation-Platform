





import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiHeart, FiSettings, FiFileText, FiBell, FiChevronDown, FiChevronRight, FiList, FiPlusSquare, FiCheckSquare, FiSliders, FiShield, FiHardDrive, FiCalendar, FiDollarSign, FiPenTool } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    {
        label: 'Dashboard',
        icon: <FiGrid />,
        to: '/admin/dashboard',
        isSingle: true,
        path: '/admin/dashboard'
    },
    {
        label: 'Users',
        icon: <FiUsers />,
        path: '/admin/users',
        subItems: [
            { label: 'All Users', to: '/admin/users', icon: <FiList /> }
        ]
    },
    {
        label: 'Campaigns',
        icon: <FiHeart />,
        path: '/admin/campaigns',
        subItems: [
            { label: 'All Campaigns', to: '/admin/campaigns', icon: <FiList /> },
            { label: 'Create Campaign', to: '/admin/campaigns/new', icon: <FiPlusSquare /> }
        ]
    },
    {
        label: 'Donations',
        icon: <FiDollarSign />,
        to: '/admin/donations',
        isSingle: true,
        path: '/admin/donations'
    },
    {
        label: 'Notices',
        icon: <FiBell />,
        path: '/admin/notices',
        subItems: [
            { label: 'All Notices', to: '/admin/notices', icon: <FiList /> },
            { label: 'Create Notice', to: '/admin/notices/new', icon: <FiPlusSquare /> }
        ]
    },
    {
        label: 'Tasks',
        icon: <FiCheckSquare />,
        path: '/admin/tasks',
        subItems: [
            { label: 'All Tasks', to: '/admin/tasks', icon: <FiList /> },
            { label: 'Calendar', to: '/admin/tasks/calendar', icon: <FiCalendar /> }
        ]
    },
    {
        label: 'Reports',
        icon: <FiFileText />,
        to: '/admin/reports',
        isSingle: true,
        path: '/admin/reports'
    },
    {
        label: 'Settings',
        icon: <FiSettings />,
        path: '/admin/settings',
        subItems: [
            { label: 'General', to: '/admin/settings', icon: <FiSliders /> },
            { label: 'Appearance', to: '/admin/settings/appearance', icon: <FiPenTool /> },
            { label: 'Security', to: '/admin/settings#security', icon: <FiShield /> },
            { label: 'System', to: '/admin/settings#system', icon: <FiHardDrive /> }
        ]
    },
];

const Sidebar: React.FC = () => {
    const location = useLocation();

    const [openMenu, setOpenMenu] = useState<string | null>(null);

    useEffect(() => {
        const currentMenu = menuItems.find(item => !item.isSingle && location.pathname.startsWith(item.path));
        if (currentMenu) {
            setOpenMenu(currentMenu.label);
        } else {
            setOpenMenu(null);
        }
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
                            <NavLink
                                to={item.to!}
                                className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                            >
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
                                        <motion.div
                                            {...subMenuAnimation}
                                            className="pl-4 mt-1 space-y-1 overflow-hidden"
                                        >
                                            {item.subItems?.map(subItem => (
                                                <NavLink
                                                    key={subItem.to}
                                                    to={subItem.to}
                                                    end={!subItem.to.includes('#')}
                                                    className={({ isActive }) => {
                                                        const pathIsActive = location.pathname === subItem.to || (subItem.to.includes('#') && location.pathname === subItem.to.split('#')[0]);
                                                        const hashIsActive = subItem.to.includes('#') ? location.hash === `#${subItem.to.split('#')[1]}` : true;

                                                        // Special case for general settings
                                                        if (subItem.to === '/admin/settings' && location.pathname.startsWith('/admin/settings/')) {
                                                            return `${baseLinkClasses} text-sm`;
                                                        }
                                                        
                                                        return `${baseLinkClasses} text-sm ${(pathIsActive && hashIsActive) ? activeLinkClasses : ''}`;
                                                    }}
                                                >
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

export default Sidebar;