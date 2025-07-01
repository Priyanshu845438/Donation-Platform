
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const DonorDashboard: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className="bg-surface p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-copy">Donor Dashboard</h1>
            <p className="mt-4 text-lg text-copy-muted">
                Welcome, <span className="font-semibold text-primary-light">{user?.fullName}</span>!
            </p>
             <p className="mt-2 text-copy-muted">
                Here you can view your donation history, manage recurring payments, and update your profile information.
            </p>
        </div>
    );
};

export default DonorDashboard;
