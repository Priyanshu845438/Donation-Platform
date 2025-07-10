
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import StatCard from '../components/dashboard/StatCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatusBadge from '../components/common/StatusBadge';
import { apiFetch } from '../utils/api';
import { ADMIN_ENDPOINTS } from '../utils/adminEndpoints';
import { AdminAnalytics } from '../types';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#0a60c8', '#10b981', '#f59e0b', '#6b7280'];

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<AdminAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const data = await apiFetch<AdminAnalytics>(ADMIN_ENDPOINTS.ANALYTICS);
                setStats(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load dashboard analytics.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const entityDistribution = stats ? [
        { name: 'NGOs', value: stats.totalNgos ?? 0 },
        { name: 'Companies', value: stats.totalCompanies ?? 0 },
    ] : [];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">Admin Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">
                    Welcome back, <span className="font-semibold text-primary">{user?.fullName}</span>! Here's what's happening.
                </p>
            </div>

            {isLoading ? (
                 <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-surface border border-border p-5 rounded-xl h-28 animate-pulse"></div>
                    ))}
                 </div>
            ) : error ? (
                <p className="text-center text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
            ) : stats ? (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Link to="ngos"><StatCard title="Total NGOs" value={(stats.totalNgos ?? 0).toLocaleString()} icon="people-outline" color="text-primary" /></Link>
                        <Link to="companies"><StatCard title="Total Companies" value={(stats.totalCompanies ?? 0).toLocaleString()} icon="business-outline" color="text-teal-500" /></Link>
                        <Link to="campaigns"><StatCard title="Active Campaigns" value={(stats.activeCampaigns ?? 0).toLocaleString()} icon="megaphone-outline" color="text-secondary" /></Link>
                        <Link to="reports"><StatCard title="Total Donations" value={`$${((stats.totalDonations ?? 0) / 1000000).toFixed(1)}M`} icon="cash-outline" color="text-amber-500" /></Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3 bg-surface p-6 rounded-lg shadow-sm border border-border">
                            <h3 className="text-xl font-bold font-display text-text-primary mb-6">Monthly Donations</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.monthlyDonations ?? []} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
                                        <XAxis dataKey="month" tick={{ fill: '#6c757d' }} axisLine={{ stroke: '#dee2e6' }} tickLine={{ stroke: '#dee2e6' }} />
                                        <YAxis tick={{ fill: '#6c757d' }} axisLine={{ stroke: '#dee2e6' }} tickLine={{ stroke: '#dee2e6' }} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                                        <Tooltip
                                            cursor={{ stroke: '#0d6efd', strokeWidth: 1, strokeDasharray: '3 3' }}
                                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '0.5rem' }}
                                        />
                                        <Legend wrapperStyle={{ color: '#212529' }} />
                                        <Line type="monotone" dataKey="donations" stroke="#0d6efd" strokeWidth={2} dot={{ r: 4, fill: '#0d6efd' }} activeDot={{ r: 8, stroke: '#3c8cfd', strokeWidth: 2, fill: '#ffffff' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-sm border border-border">
                            <h3 className="text-xl font-bold font-display text-text-primary mb-6">Recent Activity</h3>
                            <ul className="space-y-4 max-h-80 overflow-y-auto">
                                {(stats.recentActivity ?? []).length > 0 ? (stats.recentActivity ?? []).map((item: any) => (
                                    <li key={item.id} className="flex items-start space-x-3">
                                        <div className="mt-1">
                                            <StatusBadge status={item.action as any} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-text-primary">{item.target} was {item.action.toLowerCase()} by {item.user}.</p>
                                            <p className="text-xs text-text-secondary">{item.timestamp}</p>
                                        </div>
                                    </li>
                                )) : <p className="text-sm text-text-secondary">No recent activity.</p>}
                            </ul>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                         <div className="lg:col-span-2 bg-surface p-6 rounded-lg shadow-sm border border-border">
                            <h3 className="text-xl font-bold font-display text-text-primary mb-6">Entity Distribution</h3>
                            <div className="h-80">
                               <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={entityDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {entityDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #dee2e6', color: '#212529', borderRadius: '0.5rem' }}/>
                                        <Legend wrapperStyle={{ color: '#212529' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default AdminDashboard;
