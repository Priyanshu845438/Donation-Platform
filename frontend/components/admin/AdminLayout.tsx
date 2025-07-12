
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.tsx';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-brand-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 md:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
