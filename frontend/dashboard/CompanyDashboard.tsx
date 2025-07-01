
import React from 'react';
import { useAuth } from '../hooks/useAuth';

const CompanyDashboard: React.FC = () => {
    const { user } = useAuth();
    return (
        <div className="bg-surface p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-copy">Company Dashboard</h1>
            <p className="mt-4 text-lg text-copy-muted">
                Welcome, <span className="font-semibold text-primary-light">{user?.fullName}</span>!
            </p>
            <p className="mt-2 text-copy-muted">
                Oversee your corporate social responsibility initiatives, track company-wide donations, and manage partnerships.
            </p>
        </div>
    );
};

export default CompanyDashboard;
