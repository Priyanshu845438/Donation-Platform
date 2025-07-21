
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiGrid, FiHeart, FiSettings, FiFileText, FiBriefcase, FiUsers } from 'react-icons/fi';

const menuItems = [
    { label: 'Dashboard', icon: <FiGrid />, to: '/company/dashboard' },
    { label: 'Campaigns', icon: <FiHeart />, to: '/company/campaigns' },
    { label: 'NGOs', icon: <FiUsers />, to: '/company/ngos' },
    { label: 'My Reports', icon: <FiFileText />, to: '/company/reports' },
    { label: 'My Profile', icon: <FiBriefcase />, to: '/company/profile' },
    { label: 'Settings', icon: <FiSettings />, to: '/company/settings' },
];

const CompanySidebar: React.FC = () => {
    const baseLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-brand-royal-navy hover:text-white transition-colors rounded-lg";
    const activeLinkClasses = "bg-brand-royal-navy text-white font-semibold";

    return (
        <div className="w-64 bg-brand-deep-blue text-white flex flex-col min-h-screen shadow-lg">
            <div className="flex items-center h-20 px-6 border-b border-gray-700">
                <Link to="/" className="text-2xl font-bold font-serif">DonationHub</Link>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map(item => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        end
                        className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
                    >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.label}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
};

export default CompanySidebar;