
import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.tsx';
import { FiGrid, FiUsers, FiHeart, FiSettings, FiFileText, FiBell, FiLogOut } from 'react-icons/fi';

const Sidebar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { to: '/admin/campaigns', icon: <FiHeart />, label: 'Campaigns' },
    { to: '/admin/notices', icon: <FiBell />, label: 'Notices' },
    { to: '/admin/reports', icon: <FiFileText />, label: 'Reports' },
    { to: '/admin/settings', icon: <FiSettings />, label: 'Settings' },
  ];

  const baseLinkClasses = "flex items-center px-4 py-3 text-gray-300 hover:bg-brand-royal-navy hover:text-white transition-colors rounded-lg";
  const activeLinkClasses = "bg-brand-royal-navy text-white font-semibold";

  return (
    <div className="w-64 bg-brand-deep-blue text-white flex flex-col min-h-screen shadow-lg">
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <Link to="/" className="text-2xl font-bold font-serif">DonationHub</Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/admin/dashboard'}
            className={({ isActive }) => `${baseLinkClasses} ${isActive ? activeLinkClasses : ''}`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-700">
         <div className="flex items-center mb-4">
            <img src={user?.avatar} alt={user?.name} className="h-10 w-10 rounded-full" />
            <div className="ml-3">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
         </div>
         <button onClick={handleLogout} className={`${baseLinkClasses} w-full text-red-400 hover:bg-red-800/50`}>
            <FiLogOut className="mr-3" />
            Logout
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
