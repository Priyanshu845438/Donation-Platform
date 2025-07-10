
import React, { useState } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './Sidebar';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-background text-text-primary">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-surface border-b border-border lg:hidden">
                     <button onClick={() => setSidebarOpen(true)} className="text-text-secondary focus:outline-none">
                         <ion-icon name="menu-outline" className="text-2xl"></ion-icon>
                     </button>
                    <h1 className="text-xl font-bold font-display text-primary capitalize">{user?.role} Dashboard</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
