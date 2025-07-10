import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiFetch } from '../utils/api';
import { Donation } from '../types';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const DonorDashboard: React.FC = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState<Donation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const data = await apiFetch<{donations: Donation[]}>('/donations/my-donations');
                setDonations(data.donations || []);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch donation history.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const totalDonated = donations
        .filter(d => d.status === 'Paid')
        .reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">My Dashboard</h1>
                <p className="mt-2 text-lg text-text-secondary">
                    Welcome back, <span className="font-semibold text-primary">{user?.fullName}</span>! Thank you for your support.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <StatCard title="Total Donated" value={`$${totalDonated.toLocaleString()}`} icon="heart-outline" color="text-red-500" />
                <StatCard title="Total Donations" value={donations.length.toString()} icon="receipt-outline" color="text-primary" />
            </div>
            
            <div className="bg-surface rounded-xl shadow-serene border border-border">
                <h2 className="text-xl font-bold font-display text-text-primary p-4 border-b border-border">Donation History</h2>
                <div className="w-full overflow-x-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : error ? (
                        <p className="p-6 text-center text-red-500">{error}</p>
                    ) : donations.length > 0 ? (
                        <table className="min-w-full text-sm text-left text-text-primary">
                            <thead className="bg-gray-50 text-xs text-text-secondary uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Campaign</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {donations.map((donation) => (
                                    <tr key={donation.id} className="border-b border-border hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium">{donation.campaign.title}</td>
                                        <td className="px-6 py-4 font-medium text-secondary">${donation.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">{new Date(donation.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4"><StatusBadge status={donation.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center text-text-secondary">
                            <ion-icon name="document-text-outline" className="text-5xl mx-auto text-gray-300"></ion-icon>
                            <p className="mt-4 font-semibold">You haven't made any donations yet.</p>
                             <Link to="/campaigns" className="mt-4 inline-block">
                                <Button variant="primary">Find a Cause to Support</Button>
                             </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DonorDashboard;