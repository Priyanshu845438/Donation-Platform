
import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import DonorSidebar from './DonorSidebar.tsx';
import DonorHeader from './DonorHeader.tsx';
import { FiHeart } from 'react-icons/fi';

const PageLoader = () => (
    <div className="flex justify-center items-center h-full w-full">
        <div className="relative flex justify-center items-center">
            <FiHeart className="animate-ping absolute h-10 w-10 text-brand-gold opacity-75" />
            <FiHeart className="relative h-10 w-10 text-brand-gold" />
        </div>
    </div>
);

const DonorLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-brand-dark overflow-hidden">
      <DonorSidebar />
      <div className="flex-1 flex flex-col">
        <DonorHeader />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};

export default DonorLayout;
