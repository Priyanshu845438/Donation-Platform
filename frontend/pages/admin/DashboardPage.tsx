



import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, TimeScale } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.ts';
import type { DashboardData, SystemHealth, Activity } from '../../types.ts';
import { FiUsers, FiHeart, FiDollarSign, FiCheckCircle, FiTrendingUp, FiTrendingDown, FiAlertCircle, FiUserCheck, FiCpu, FiHardDrive, FiActivity, FiShield, FiLoader, FiArrowRight } from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, TimeScale);

const kpiCardAnimation = {
    whileHover: { y: -5 },
    transition: { duration: 0.2 }
};

const KPICard = ({ icon, title, value, growth, link, linkText, colorClass }) => (
    <motion.div 
        className={`bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg border-l-4 ${colorClass} flex flex-col justify-between`}
        {...kpiCardAnimation}
    >
        <div className="flex justify-between items-start">
            <div className={`p-3 rounded-full bg-gray-100 dark:bg-brand-dark`}>{icon}</div>
            {growth !== undefined && (
                <div className={`flex items-center text-sm font-semibold ${growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {growth >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    <span className="ml-1">{Math.abs(growth)}%</span>
                </div>
            )}
        </div>
        <div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        </div>
        <Link to={link} className="text-sm font-semibold text-brand-gold hover:underline mt-4 flex items-center">
            {linkText} <FiArrowRight className="ml-1" />
        </Link>
    </motion.div>
);

const QuickActionCard = ({ icon, title, value, link }) => (
    <Link to={link} className="bg-gray-50 dark:bg-brand-dark p-4 rounded-lg flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-brand-dark-200 transition-colors">
        <div className="text-brand-gold text-2xl">{icon}</div>
        <div>
            <p className="font-bold text-lg text-gray-800 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        </div>
    </Link>
);


const DashboardPage: React.FC = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [timeRange, setTimeRange] = useState('30d');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [overviewRes, healthRes] = await Promise.all([
                    adminAPI.dashboard.getOverview(timeRange),
                    adminAPI.dashboard.getSystemHealth()
                ]);

                if (overviewRes.success) setDashboardData(overviewRes);
                if (healthRes.success) setSystemHealth(healthRes.data);

            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [timeRange]);

    if (loading) {
        return <div className="flex items-center justify-center h-full"><FiLoader className="animate-spin h-10 w-10 text-brand-gold"/></div>;
    }
    
    if (!dashboardData) {
        return <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 text-red-700 rounded-lg">Failed to load dashboard statistics. Please try again later.</div>;
    }

    const kpis = dashboardData?.kpis;
    
    // Chart data setup
    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? 'white' : 'black';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: textColor } },
        },
    };

    const lineChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Donations (in ₹)',
                data: [65000, 59000, 80000, 81000, 56000, 55000, 120000],
                borderColor: '#ffa600',
                backgroundColor: 'rgba(255, 166, 0, 0.2)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'New Users',
                data: [28, 48, 40, 19, 86, 27, 90],
                borderColor: '#003f5c',
                backgroundColor: 'rgba(0, 63, 92, 0.2)',
                fill: true,
                tension: 0.4,
            }
        ]
    };

    const completedCampaigns = Math.round((kpis?.campaigns?.total || 0) * (kpis?.campaigns?.stats?.completionRate || 0));

    const campaignChartData = {
        labels: ['Active', 'Pending', 'Completed'],
        datasets: [{
            data: [
                kpis?.campaigns?.active || 0,
                kpis?.campaigns?.pending || 0,
                completedCampaigns
            ],
            backgroundColor: ['#2ecc71', '#f1c40f', '#3498db'],
            borderColor: isDark ? '#2d3748' : '#ffffff',
            borderWidth: 2,
        }]
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
                <div className="flex items-center gap-2 bg-gray-200 dark:bg-brand-dark p-1 rounded-lg">
                    {['7d', '30d', '90d', '1y'].map(range => (
                        <button key={range} onClick={() => setTimeRange(range)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${timeRange === range ? 'bg-white dark:bg-brand-dark-200 shadow' : 'text-gray-600 dark:text-gray-300'}`}>
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard icon={<FiUsers size={24} className="text-blue-500" />} title="Total Users" value={(kpis?.users?.total || 0).toLocaleString()} growth={kpis?.users?.growth} link="/admin/users" linkText="Manage Users" colorClass="border-blue-500" />
                <KPICard icon={<FiDollarSign size={24} className="text-green-500" />} title="Total Donations" value={`₹${((kpis?.donations?.totalAmount || 0) / 100000).toFixed(2)}L`} growth={20} link="/admin/donations" linkText="View Donations" colorClass="border-green-500" />
                <KPICard icon={<FiHeart size={24} className="text-red-500" />} title="Active Campaigns" value={kpis?.campaigns?.active || 0} growth={kpis?.campaigns?.growth} link="/admin/campaigns" linkText="Manage Campaigns" colorClass="border-red-500" />
                <KPICard icon={<FiCheckCircle size={24} className="text-yellow-500" />} title="Pending Approvals" value={(kpis?.campaigns?.pending || 0) + (kpis?.users?.pending || 0)} growth={-5} link="/admin/users" linkText="Review Approvals" colorClass="border-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Donation & User Growth</h2>
                    <div className="h-80">
                        <Line options={{...commonChartOptions, scales: { y: { grid: { color: gridColor }, ticks: { color: textColor } }, x: { grid: { color: gridColor }, ticks: { color: textColor } } }}} data={lineChartData} />
                    </div>
                </div>
                 <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Campaign Status</h2>
                    <div className="h-80 flex items-center justify-center">
                        <Doughnut options={commonChartOptions} data={campaignChartData} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Quick Actions</h2>
                    <QuickActionCard icon={<FiUserCheck />} title="Pending Approvals" value={dashboardData?.quickActions?.pendingApprovals || 0} link="/admin/users" />
                    <QuickActionCard icon={<FiAlertCircle />} title="Flagged Activities" value={dashboardData?.quickActions?.flaggedActivities || 0} link="/admin/security" />
                </div>
                <div className="lg:col-span-2 bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Activity</h2>
                    <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
                        {(dashboardData?.recentActivities || []).map((activity: Activity) => (
                            <li key={activity._id} className="flex items-center gap-4">
                                <div className="p-3 bg-gray-100 dark:bg-brand-dark rounded-full"><FiActivity className="text-gray-500"/></div>
                                <div className="flex-grow">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: activity.details }}></p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(activity.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {systemHealth && (
                    <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><FiHardDrive /> System Health</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between"><span>Database:</span> <span className={`font-semibold ${systemHealth?.database?.status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>{systemHealth?.database?.status || 'N/A'}</span></div>
                            <div className="flex justify-between"><span>Memory Usage:</span> <span className="font-semibold">{systemHealth?.memory?.percentage || 0}%</span></div>
                            <div className="flex justify-between"><span>CPU Load (1m):</span> <span className="font-semibold">{systemHealth?.cpu?.loadAverage[0]?.toFixed(2) || 'N/A'}</span></div>
                            <div className="flex justify-between"><span>Uptime:</span> <span className="font-semibold">{Math.floor((systemHealth?.server?.uptime || 0) / 3600)}h {Math.floor(((systemHealth?.server?.uptime || 0) % 3600) / 60)}m</span></div>
                        </div>
                    </div>
                )}
                 <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-lg">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><FiShield /> Security</h2>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>Status:</span> <span className={`font-semibold ${dashboardData?.security?.status === 'secure' ? 'text-green-500' : 'text-red-500'}`}>{dashboardData?.security?.status || 'N/A'}</span></div>
                        <div className="flex justify-between"><span>Risk Score:</span> <span className="font-semibold">{dashboardData?.security?.riskScore || 'N/A'}/100</span></div>
                        <div className="flex justify-between"><span>Failed Logins (24h):</span> <span className="font-semibold">{dashboardData?.security?.failedLogins24h || 0}</span></div>
                        <div className="flex justify-between"><span>Suspicious Activity:</span> <span className="font-semibold">{dashboardData?.security?.suspiciousActivities || 0}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;