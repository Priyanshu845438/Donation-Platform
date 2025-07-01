
import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

type CampaignStatus = 'Pending' | 'Active' | 'Completed' | 'Rejected';

interface Campaign {
    id: string;
    title: string;
    ngo: string;
    status: CampaignStatus;
    goal: number;
    raised: number;
    description: string;
}

const mockCampaigns: Campaign[] = [
    { id: '1', title: 'Winter Coats for Kids', ngo: 'Helping Hands Community', status: 'Pending', goal: 5000, raised: 0, description: 'Provide warm winter coats for children in low-income families.' },
    { id: '2', title: 'Build a School in Ghana', ngo: 'Future Leaders Foundation', status: 'Active', goal: 50000, raised: 27500, description: 'Fund the construction of a new primary school in a rural Ghanaian village.' },
    { id: '3', title: 'Ocean Cleanup Drive', ngo: 'Green Earth Initiative', status: 'Completed', goal: 15000, raised: 16200, description: 'Organize and fund a series of beach and ocean cleanup events.' },
    { id: '4', title: 'Emergency Vet Fund', ngo: 'Animal Rescue Crew', status: 'Rejected', goal: 10000, raised: 500, description: 'A fund for emergency veterinary care for stray animals. Rejected due to incomplete paperwork.' },
    { id: '5', title: 'Mobile Health Clinic', ngo: 'Global Health Partners', status: 'Active', goal: 75000, raised: 65000, description: 'Equip and operate a mobile health clinic to serve remote communities.' },
];

const AdminManageCampaigns: React.FC = () => {
    const [filter, setFilter] = useState<CampaignStatus | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

    const filteredCampaigns = useMemo(() => {
        return mockCampaigns
            .filter(campaign => filter === 'All' || campaign.status === filter)
            .filter(campaign => 
                campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                campaign.ngo.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [filter, searchTerm]);

    const handleViewDetails = (campaign: Campaign) => {
        setSelectedCampaign(campaign);
        setIsModalOpen(true);
    };
    
    const tableHeaders = ["Campaign Title", "NGO", "Goal / Raised", "Progress", "Status", "Actions"];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-copy">Manage Campaigns</h1>
                <p className="mt-2 text-lg text-copy-muted">Review, approve, and monitor all fundraising campaigns.</p>
            </div>

             <div className="bg-surface p-4 rounded-xl shadow-md space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                <div className="flex items-center space-x-2 flex-wrap gap-2">
                    {(['All', 'Pending', 'Active', 'Completed', 'Rejected'] as const).map(status => (
                        <Button 
                            key={status} 
                            onClick={() => setFilter(status)}
                            variant={filter === status ? 'primary' : 'outline'}
                            size="sm"
                        >
                            {status}
                        </Button>
                    ))}
                </div>
                <div className="relative">
                    <ion-icon name="search-outline" class="absolute left-3 top-1/2 -translate-y-1/2 text-copy-muted"></ion-icon>
                    <input
                        type="text"
                        placeholder="Search Campaigns..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                </div>
            </div>

            <div className="bg-surface rounded-xl shadow-md overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-copy">
                        <thead className="bg-background text-xs text-copy-muted uppercase">
                            <tr>{tableHeaders.map(h => <th key={h} scope="col" className="px-6 py-3">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {filteredCampaigns.map((campaign) => {
                                const percentage = Math.round((campaign.raised / campaign.goal) * 100);
                                return (
                                <tr key={campaign.id} className="border-b border-border hover:bg-background">
                                    <td className="px-6 py-4 font-medium">{campaign.title}</td>
                                    <td className="px-6 py-4 text-copy-muted">{campaign.ngo}</td>
                                    <td className="px-6 py-4 font-mono">
                                        <span className="text-green-400">${campaign.raised.toLocaleString()}</span> / ${campaign.goal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-background rounded-full h-2.5">
                                            <div className="bg-gradient-to-r from-primary to-secondary h-2.5 rounded-full" style={{ width: `${percentage > 100 ? 100 : percentage}%` }}></div>
                                        </div>
                                        <span className="text-xs text-copy-muted">{percentage}%</span>
                                    </td>
                                    <td className="px-6 py-4"><StatusBadge status={campaign.status} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Button onClick={() => handleViewDetails(campaign)} variant="ghost" size="sm" className="p-2"><ion-icon name="eye-outline" class="text-xl"></ion-icon></Button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Campaign Details">
                {selectedCampaign && (
                     <div className="space-y-4">
                        <div><h3 className="font-bold text-lg text-primary-light">{selectedCampaign.title}</h3><p className="text-sm text-copy-muted">by {selectedCampaign.ngo}</p></div>
                        <p><strong className="text-copy-muted">Status:</strong> <StatusBadge status={selectedCampaign.status} /></p>
                        <p><strong className="text-copy-muted">Goal:</strong> ${selectedCampaign.goal.toLocaleString()}</p>
                        <p><strong className="text-copy-muted">Raised:</strong> ${selectedCampaign.raised.toLocaleString()}</p>
                        <p className="pt-2 border-t border-border mt-2"><strong className="text-copy-muted">Description:</strong> {selectedCampaign.description}</p>
                        {selectedCampaign.status === 'Pending' && (
                            <div className="flex justify-end space-x-2 pt-4">
                                <Button variant='secondary' size='sm' className="!bg-red-600/80 hover:!bg-red-600">Reject</Button>
                                <Button variant='primary' size='sm'>Approve Campaign</Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminManageCampaigns;
