
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const NgoDashboard: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className="bg-surface p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-copy">NGO Dashboard</h1>
            <p className="mt-4 text-lg text-copy-muted">
                Welcome, <span className="font-semibold text-primary-light">{user?.fullName}</span>!
            </p>
             <p className="mt-2 text-copy-muted">
                Manage your campaigns, track donations, and generate reports for your organization.
            </p>
        </div>
    );
};

export default NgoDashboard;
