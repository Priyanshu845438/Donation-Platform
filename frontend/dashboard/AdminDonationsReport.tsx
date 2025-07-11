
import React, { useState, useMemo, useEffect } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import { apiFetch } from '../utils/api';
import { Donation } from '../types';
import { useToast } from '../components/ui/Toast';

const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || rows.length === 0) return;

    const flattenedRows = rows.map(row => ({
        id: (row as any).id,
        donorName: (row as any).donor?.name || 'Anonymous',
        campaignTitle: (row as any).campaign?.title,
        amount: (row as any).amount,
        date: new Date((row as any).date).toLocaleDateString(),
        status: (row as any).status
    }));

    const separator = ',';
    const keys = Object.keys(flattenedRows[0]);
    const csvContent =
        keys.join(separator) + '\n' +
        flattenedRows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = cell.toString().replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const AdminReports: React.FC = () => {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState('Donations');

    useEffect(() => {
        const fetchDonations = async () => {
            setIsLoading(true);
            try {
                const data = await apiFetch<{ donations: Donation[] }>('/donations');
                setDonations(data.donations || []);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch donations report.');
                addToast(err.message || 'Failed to fetch donations report.', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        if (activeTab === 'Donations') {
            fetchDonations();
        }
    }, [addToast, activeTab]);

    const filteredDonations = useMemo(() => {
        return donations.filter(donation => 
            (donation.donor?.name || 'anonymous').toLowerCase().includes(searchTerm.toLowerCase()) ||
            donation.campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            donation.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, donations]);

    const TABS = ['Donations', 'NGOs', 'Companies', 'Campaigns', 'Activity'];
    const tableHeaders = ["Transaction ID", "Donor", "Campaign", "Amount", "Date", "Status"];

    const handleExport = () => {
        exportToCsv('donations-report.csv', filteredDonations);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-display text-text-primary">Reports</h1>
                <p className="mt-2 text-lg text-text-secondary">View detailed reports and export data.</p>
            </div>

             <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`${tab === activeTab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'}
                                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'Donations' && (
                <div className="space-y-6">
                    <div className="bg-surface p-4 rounded-xl shadow-serene border border-border space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                        <div className="relative">
                            <ion-icon name="search-outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"></ion-icon>
                            <input
                                type="text"
                                placeholder="Search by donor, campaign, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-80 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                        </div>
                        <Button variant="primary" size="sm" onClick={handleExport}>
                            <ion-icon name="download-outline" className="mr-2"></ion-icon>
                            Export CSV
                        </Button>
                    </div>

                    <div className="bg-surface rounded-xl shadow-serene border border-border overflow-hidden">
                        <div className="w-full overflow-x-auto">
                            {isLoading ? (
                                <div className="text-center p-8 text-text-secondary">Loading donations...</div>
                            ) : error ? (
                                <div className="text-center p-8 text-red-500">{error}</div>
                            ) : (
                                <table className="min-w-full text-sm text-left text-text-primary">
                                    <thead className="bg-gray-50 text-xs text-text-secondary uppercase">
                                       <tr>{tableHeaders.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredDonations.length > 0 ? filteredDonations.map((donation) => (
                                            <tr key={donation.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 font-mono text-text-secondary">{donation.id.substring(0, 8)}...</td>
                                                <td className="px-6 py-4 font-medium">{donation.donor?.name || 'Anonymous'}</td>
                                                <td className="px-6 py-4">{donation.campaign.title}</td>
                                                <td className="px-6 py-4 font-medium text-secondary">${donation.amount.toLocaleString()}</td>
                                                <td className="px-6 py-4">{new Date(donation.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4"><StatusBadge status={donation.status} /></td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={tableHeaders.length} className="text-center p-8 text-text-secondary">
                                                    No donations found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
             {activeTab !== 'Donations' && (
                <div className="bg-surface rounded-xl shadow-serene border border-border p-12 text-center">
                    <ion-icon name="analytics-outline" class="text-6xl text-gray-300"></ion-icon>
                    <h3 className="mt-4 text-xl font-semibold text-text-primary">{activeTab} Report</h3>
                    <p className="mt-2 text-text-secondary">This report is not yet available. Please check back later.</p>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
