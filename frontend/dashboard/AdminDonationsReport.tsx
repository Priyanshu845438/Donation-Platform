
import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';

type PaymentStatus = 'Paid' | 'Failed';

interface Donation {
    id: string;
    donor: string;
    campaign: string;
    amount: number;
    date: string;
    status: PaymentStatus;
}

const mockDonations: Donation[] = [
    { id: 'tx_101', donor: 'Alex Johnson', campaign: 'Build a School in Ghana', amount: 100, date: '2023-06-20', status: 'Paid' },
    { id: 'tx_102', donor: 'TechCorp Solutions', campaign: 'Mobile Health Clinic', amount: 5000, date: '2023-06-19', status: 'Paid' },
    { id: 'tx_103', donor: 'Maria Garcia', campaign: 'Ocean Cleanup Drive', amount: 50, date: '2023-06-18', status: 'Failed' },
    { id: 'tx_104', donor: 'David Chen', campaign: 'Build a School in Ghana', amount: 250, date: '2023-06-18', status: 'Paid' },
    { id: 'tx_105', donor: 'Innovate Inc.', campaign: 'Mobile Health Clinic', amount: 2500, date: '2023-06-17', status: 'Paid' },
    { id: 'tx_106', donor: 'Sarah Lee', campaign: 'Ocean Cleanup Drive', amount: 75, date: '2023-06-15', status: 'Paid' },
];

const AdminDonationsReport: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDonations = useMemo(() => {
        return mockDonations.filter(donation => 
            donation.donor.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donation.campaign.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donation.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const tableHeaders = ["Transaction ID", "Donor", "Campaign", "Amount", "Date", "Status"];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-copy">Donations Report</h1>
                <p className="mt-2 text-lg text-copy-muted">View a detailed history of all transactions.</p>
            </div>

            <div className="bg-surface p-4 rounded-xl shadow-md space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                <div className="relative">
                    <ion-icon name="search-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-copy-muted"></ion-icon>
                    <input
                        type="text"
                        placeholder="Search by donor, campaign, ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-80 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>
                <Button variant="primary" size="sm">
                    <ion-icon name="download-outline" class="mr-2"></ion-icon>
                    Export CSV
                </Button>
            </div>

            <div className="bg-surface rounded-xl shadow-md overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-copy">
                        <thead className="bg-background text-xs text-copy-muted uppercase">
                           <tr>{tableHeaders.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {filteredDonations.map((donation) => (
                                <tr key={donation.id} className="border-b border-border hover:bg-background">
                                    <td className="px-6 py-4 font-mono text-copy-muted">{donation.id}</td>
                                    <td className="px-6 py-4 font-medium">{donation.donor}</td>
                                    <td className="px-6 py-4">{donation.campaign}</td>
                                    <td className="px-6 py-4 font-medium text-green-400">${donation.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">{donation.date}</td>
                                    <td className="px-6 py-4"><StatusBadge status={donation.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDonationsReport;
