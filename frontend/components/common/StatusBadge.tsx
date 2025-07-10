
import React from 'react';

type BadgeStatus = 
    | 'Approved' | 'Pending' | 'Disabled' 
    | 'Active' | 'Completed' | 'Rejected' | 'Suspended'
    | 'Paid' | 'Failed' 
    | 'NGO' | 'Company' | 'Campaign'
    | 'System' | 'Admin'
    | 'active' | 'pending' | 'inactive'
    | 'completed' | 'rejected' | 'suspended';

interface StatusBadgeProps {
    status: BadgeStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    
    // Defensive coding: Ensure status is a string before calling .toLowerCase() or using as a fallback.
    const safeStatus = (typeof status === 'string' && status) ? status : 'pending';
    const normalizedStatus = safeStatus.toLowerCase();

    const statusMap: Record<string, {text: string, classes: string}> = {
        // Approval Statuses
        approved: { text: 'Approved', classes: 'bg-green-100 text-green-800' },
        active: { text: 'Active', classes: 'bg-green-100 text-green-800' },
        paid: { text: 'Paid', classes: 'bg-green-100 text-green-800' },
        
        pending: { text: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },

        disabled: { text: 'Disabled', classes: 'bg-gray-100 text-gray-800' },
        inactive: { text: 'Inactive', classes: 'bg-gray-100 text-gray-800' },
        
        rejected: { text: 'Rejected', classes: 'bg-red-100 text-red-800' },
        failed: { text: 'Failed', classes: 'bg-red-100 text-red-800' },
        suspended: { text: 'Suspended', classes: 'bg-orange-100 text-orange-800' },

        completed: { text: 'Completed', classes: 'bg-blue-100 text-blue-800' },

        // Entity Types
        ngo: { text: 'NGO', classes: 'bg-teal-100 text-teal-800' },
        company: { text: 'Company', classes: 'bg-sky-100 text-sky-800' },
        campaign: { text: 'Campaign', classes: 'bg-purple-100 text-purple-800' },
        
        // User Types
        system: { text: 'System', classes: 'bg-gray-200 text-gray-900' },
        admin: { text: 'Admin', classes: 'bg-primary/20 text-primary-dark' },
    };
    
    const currentStatus = statusMap[normalizedStatus] || { text: safeStatus, classes: 'bg-gray-200 text-gray-900' };

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full inline-block capitalize ${currentStatus.classes}`}>
            {currentStatus.text}
        </span>
    );
};

export default StatusBadge;
