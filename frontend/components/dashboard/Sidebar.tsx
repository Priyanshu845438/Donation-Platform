
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const getDashboardLinks = (role: UserRole) => {
    const base = `/dashboard/${role.toLowerCase()}`;
    switch (role) {
        case UserRole.ADMIN:
            return [
                { name: 'Dashboard', path: base, icon: 'grid-outline' },
                { name: 'NGOs', path: `${base}/ngos`, icon: 'people-outline' },
                { name: 'Companies', path: `${base}/companies`, icon: 'business-outline' },
                { name: 'Campaigns', path: `${base}/campaigns`, icon: 'megaphone-outline' },
                { name: 'Donations', path: `${base}/donations`, icon: 'cash-outline' },
                { name: 'Profile', path: `${base}/profile`, icon: 'person-circle-outline' },
            ];
        case UserRole.NGO:
            return [{ name: 'Overview', path: base, icon: 'grid-outline' }, { name: 'My Campaigns', path: `${base}/my-campaigns`, icon: 'document-text-outline' }, { name: 'Reports', path: `${base}/reports`, icon: 'stats-chart-outline' }];
        case UserRole.COMPANY:
            return [{ name: 'Overview', path: base, icon: 'grid-outline' }, { name: 'Donations', path: `${base}/donations`, icon: 'gift-outline' }, { name: 'Partnerships', path: `${base}/partnerships`, icon: 'briefcase-outline' }];
        case UserRole.DONOR:
            return [{ name: 'Overview', path: base, icon: 'grid-outline' }, { name: 'Donation History', path: `${base}/history`, icon: 'receipt-outline' }, { name: 'Profile', path: `${base}/profile`, icon: 'person-circle-outline' }];
        default:
            return [];
    }
};

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    const links = getDashboardLinks(user.role);

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-70 z-20 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed inset-y-0 left-0 w-64 bg-surface text-copy transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-200 ease-in-out z-30 flex flex-col`}>
                <div className="flex items-center justify-center h-20 border-b border-border">
                    <NavLink to="/" className="text-2xl font-bold text-primary-light">CharityPlus</NavLink>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    {links.map(link => (
                        <NavLink
                            to={link.path}
                            key={link.name}
                            end={link.path.split('/').length <= 3} // for "Dashboard" and "Overview" links
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                                    isActive ? 'bg-primary text-white' : 'hover:bg-background'
                                }`
                            }
                        >
                            <ion-icon name={link.icon} className="text-xl mr-3"></ion-icon>
                            <span className="font-medium">{link.name}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-6 border-t border-border">
                    <div className="flex items-center mb-4">
                        <img className="h-10 w-10 rounded-full object-cover" src={`https://i.pravatar.cc/150?u=${user.email}`} alt="User Avatar" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-copy">{user.fullName}</p>
                            <p className="text-xs text-copy-muted">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-copy bg-red-600/80 hover:bg-red-600 transition-colors"
                    >
                        <ion-icon name="log-out-outline" className="text-xl mr-3"></ion-icon>
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
