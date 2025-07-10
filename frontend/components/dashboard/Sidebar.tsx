
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const getDashboardLinks = (role: UserRole) => {
    const base = `/dashboard/${role}`;
    switch (role) {
        case UserRole.ADMIN:
            return [
                { name: 'Dashboard', path: base, icon: 'grid-outline' },
                { name: 'NGOs', path: `${base}/ngos`, icon: 'people-outline' },
                { name: 'Companies', path: `${base}/companies`, icon: 'business-outline' },
                { name: 'Campaigns', path: `${base}/campaigns`, icon: 'megaphone-outline' },
                { name: 'Reports', path: `${base}/reports`, icon: 'document-text-outline' },
            ];
        case UserRole.NGO:
            return [
                { name: 'Dashboard', path: base, icon: 'grid-outline' }, 
                { name: 'My Campaigns', path: `${base}/campaigns`, icon: 'megaphone-outline' }, // Example link
                { name: 'NGO Profile', path: `${base}/organization-profile`, icon: 'library-outline' }, 
            ];
        case UserRole.COMPANY:
            return [
                { name: 'Dashboard', path: base, icon: 'grid-outline' }, 
                { name: 'My Initiatives', path: `${base}/initiatives`, icon: 'bulb-outline' }, // Example link
                { name: 'Company Profile', path: `${base}/organization-profile`, icon: 'briefcase-outline' },
            ];
        case UserRole.USER:
            return [
                { name: 'Dashboard', path: base, icon: 'grid-outline' }, 
            ];
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
    const profileLink = { name: 'My Account', path: `/dashboard/${user.role}/profile`, icon: 'person-circle-outline' };

    const activeClass = 'bg-primary/10 text-primary font-semibold';
    const inactiveClass = 'hover:bg-gray-100 text-text-secondary hover:text-text-primary';

    return (
        <>
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
            <div className={`fixed inset-y-0 left-0 w-64 bg-surface text-text-primary transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-40 flex flex-col border-r border-border`}>
                <div className="flex items-center justify-center h-20 border-b border-border">
                    <NavLink to="/" className="text-2xl font-bold font-display text-primary">CharityPlus</NavLink>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                    {links.map(link => (
                        <NavLink
                            to={link.path}
                            key={link.name}
                            end
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-base font-medium ${
                                    isActive ? activeClass : inactiveClass
                                }`
                            }
                        >
                            <ion-icon name={link.icon} className="text-xl mr-4"></ion-icon>
                            <span>{link.name}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="px-4 py-6 border-t border-border">
                    <NavLink
                        to={profileLink.path}
                        key={profileLink.name}
                        end
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 text-base font-medium mb-2 ${
                                    isActive ? activeClass : inactiveClass
                                }`
                            }
                    >
                         <ion-icon name={profileLink.icon} className="text-xl mr-4"></ion-icon>
                        <span>{profileLink.name}</span>
                    </NavLink>
                    <div className="flex items-center my-4">
                        <img 
                            className="h-10 w-10 rounded-full object-cover border-2 border-primary/50" 
                            src={user.profileImageUrl || `https://i.pravatar.cc/150?u=${user.email}`} 
                            alt="User Avatar" />
                        <div className="ml-3 overflow-hidden">
                            <p className="text-sm font-semibold text-text-primary truncate">{user.fullName}</p>
                            <p className="text-xs text-text-secondary capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2.5 rounded-lg text-red-600 bg-red-500/10 hover:bg-red-500/20 transition-colors"
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
