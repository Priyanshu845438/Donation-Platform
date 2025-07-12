
import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { getAdminDashboardStats } from '../../services/api.ts';
import { FaUsers, FaHeart, FaDollarSign, FaCheckCircle } from 'react-icons/fa';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const AdminStatCard = ({ icon, title, value, colorClass }) => (
    <div className={`bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md flex items-center space-x-4 border-l-4 ${colorClass}`}>
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getAdminDashboardStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div>Loading dashboard...</div>;
    }
    
    if (!stats) {
        return <div>Failed to load dashboard statistics.</div>;
    }

    const userRolesData = {
        labels: ['Donors', 'NGOs', 'Companies'],
        datasets: [{
            label: 'User Roles',
            data: [
                stats.userDistribution.donor,
                stats.userDistribution.ngo,
                stats.userDistribution.company,
            ],
            backgroundColor: ['#ffa600', '#003f5c', '#2f4b7c'],
        }]
    };

    const campaignStatusData = {
        labels: ['Active', 'Completed', 'Disabled'],
        datasets: [{
            data: [
                stats.campaignStatus.active,
                stats.campaignStatus.completed,
                stats.campaignStatus.disabled,
            ],
            backgroundColor: ['#2ecc71', '#3498db', '#e74c3c'],
        }]
    };
    
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
                 labels: {
                    color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
                }
            },
            title: {
                display: true,
                color: document.documentElement.classList.contains('dark') ? 'white' : 'black',
            }
        },
        scales: {
            y: {
                ticks: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' },
                grid: { color: document.documentElement.classList.contains('dark') ? '#4a5568' : '#e2e8f0' }
            },
            x: {
                 ticks: { color: document.documentElement.classList.contains('dark') ? 'white' : 'black' },
                 grid: { color: document.documentElement.classList.contains('dark') ? '#4a5568' : '#e2e8f0' }
            }
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard icon={<FaUsers />} title="Total Users" value={stats.totalUsers} colorClass="border-blue-500" />
                <AdminStatCard icon={<FaHeart />} title="Total Campaigns" value={stats.totalCampaigns} colorClass="border-red-500" />
                <AdminStatCard icon={<FaDollarSign />} title="Total Donations" value={`₹${(stats.totalDonations / 100000).toFixed(1)}L`} colorClass="border-green-500" />
                <AdminStatCard icon={<FaCheckCircle />} title="Pending Approvals" value={stats.pendingApprovals} colorClass="border-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">User Distribution</h2>
                    <Bar options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Users by Role'}}}} data={userRolesData} />
                </div>
                <div className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Campaign Status</h2>
                     <div className="max-w-xs mx-auto">
                        <Pie options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Campaigns by Status'}}}} data={campaignStatusData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
