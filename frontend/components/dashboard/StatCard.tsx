
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: string;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
    return (
        <div className="bg-surface p-5 rounded-xl shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border">
            <div>
                <p className="text-sm font-medium text-text-secondary">{title}</p>
                <p className="text-3xl font-bold font-display text-text-primary mt-1">{value}</p>
            </div>
            <div className={`text-3xl p-4 rounded-full bg-gray-100 ${color}`}>
                <ion-icon name={icon}></ion-icon>
            </div>
        </div>
    );
};
export default StatCard;