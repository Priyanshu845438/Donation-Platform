
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatusBadge from '../components/common/StatusBadge';

const monthlyData = [
    { month: 'Jan', donations: 4200 },
    { month: 'Feb', donations: 3800 },
    { month: 'Mar', donations: 5500 },
    { month: 'Apr', donations: 4800 },
    { month: 'May', donations: 6200 },
    { month: 'Jun', donations: 7500 },
];

const activityLog = [
    { id: 1, user: 'Admin', action: 'Approved', target: 'NGO "Green Earth"', type: 'NGO', timestamp: '2 hours ago' },
    { id: 2, user: 'Admin', action: 'Rejected', target: 'Campaign "Winter Coats"', type: 'Campaign', timestamp: '5 hours ago' },
    { id: 3, user: 'System', action: 'Registered', target: 'Company "TechCorp"', type: 'Company', timestamp: '1 day ago' },
    { id: 4, user: 'Admin', action: 'Disabled', target: 'NGO "Helping Hands"', type: 'NGO', timestamp: '2 days ago' },
    { id: 5, user: 'System', action: 'Completed', target: 'Campaign "School Supplies"', type: 'Campaign', timestamp: '3 days ago' },
];

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-copy">Admin Dashboard</h1>
                <p className="mt-2 text-lg text-copy-muted">
                    Welcome back, <span className="font-semibold text-primary-light">{user?.fullName}</span>! Here's what's happening.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total NGOs" value="1,258" icon="people-outline" color="text-primary-light" />
                <StatCard title="Total Companies" value="435" icon="business-outline" color="text-secondary" />
                <StatCard title="Active Campaigns" value="312" icon="megaphone-outline" color="text-green-400" />
                <StatCard title="Total Donations" value="$2.4M" icon="cash-outline" color="text-yellow-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Donations Chart */}
                <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-6 text-copy">Monthly Donations</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                <XAxis dataKey="month" tick={{ fill: '#9CA3AF' }} axisLine={{ stroke: '#374151' }} tickLine={{ stroke: '#374151' }} />
                                <YAxis tick={{ fill: '#9CA3AF' }} axisLine={{ stroke: '#374151' }} tickLine={{ stroke: '#374151' }} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                                <Tooltip
                                    cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '3 3' }}
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', color: '#F9FAFB', borderRadius: '0.5rem' }}
                                />
                                <Legend wrapperStyle={{ color: '#F9FAFB' }} />
                                <Line type="monotone" dataKey="donations" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8, stroke: '#6366F1', strokeWidth: 2, fill: '#1F2937' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-surface p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-6 text-copy">Recent Activity</h3>
                    <ul className="space-y-4">
                        {activityLog.map(item => (
                            <li key={item.id} className="flex items-start space-x-3">
                                <div className="mt-1">
                                    <StatusBadge status={item.action as any} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-copy">{item.target} was {item.action.toLowerCase()} by {item.user}.</p>
                                    <p className="text-xs text-copy-muted">{item.timestamp}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
