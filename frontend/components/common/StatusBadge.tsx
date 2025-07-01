
import React from 'react';

type BadgeStatus = 
    | 'Approved' | 'Pending' | 'Disabled' 
    | 'Active' | 'Completed' | 'Rejected' 
    | 'Paid' | 'Failed' 
    | 'NGO' | 'Company' | 'Campaign'
    | 'System' | 'Admin';

interface StatusBadgeProps {
    status: BadgeStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const statusClasses: Record<BadgeStatus, string> = {
        // Approval Statuses
        Approved: 'bg-green-500/20 text-green-400 border border-green-500/30',
        Pending: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        Disabled: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30',
        Rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
        
        // Campaign/Payment Statuses
        Active: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        Completed: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
        Paid: 'bg-green-500/20 text-green-400 border border-green-500/30',
        Failed: 'bg-red-500/20 text-red-400 border border-red-500/30',

        // Entity Types
        NGO: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
        Company: 'bg-sky-500/20 text-sky-400 border border-sky-500/30',
        Campaign: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
        
        // User Types
        System: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
        Admin: 'bg-primary/20 text-primary-light border border-primary/30',
    };

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block ${statusClasses[status] || 'bg-gray-500/20 text-gray-400'}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
