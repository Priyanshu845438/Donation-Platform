
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import CompanySidebar from './CompanySidebar.tsx';
import CompanyHeader from './CompanyHeader.tsx';
import { FiHeart } from 'react-icons/fi';

const PageLoader = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="relative flex justify-center items-center">
            <FiHeart className="animate-ping absolute h-10 w-10 text-brand-gold opacity-75" />
            <FiHeart className="relative h-10 w-10 text-brand-gold" />
        </div>
    </div>
);

const CompanyLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-brand-dark overflow-hidden">
      <CompanySidebar />
      <div className="flex-1 flex flex-col">
        <CompanyHeader />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
           <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default CompanyLayout;
