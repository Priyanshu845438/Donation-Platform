
import React from 'react';

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300">
            <div className="text-sky-blue mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-sky-blue/10 mb-4">
                {icon}
            </div>
            <p className="text-4xl font-bold font-serif text-navy-blue">{value}</p>
            <p className="text-warm-gray-600 mt-1">{label}</p>
        </div>
    );
}

export default StatCard;
