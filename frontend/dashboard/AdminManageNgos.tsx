
import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

type NgoStatus = 'Approved' | 'Pending' | 'Disabled';

interface NGO {
    id: string;
    name: string;
    owner: string;
    email: string;
    phone: string;
    status: NgoStatus;
    dateJoined: string;
    description: string;
}

const mockNgos: NGO[] = [
    { id: '1', name: 'Green Earth Initiative', owner: 'Samuel Green', email: 'contact@greenearth.org', phone: '123-456-7890', status: 'Approved', dateJoined: '2023-01-15', description: 'Focused on reforestation and environmental conservation.' },
    { id: '2', name: 'Helping Hands Community', owner: 'Maria Garcia', email: 'support@helpinghands.com', phone: '234-567-8901', status: 'Pending', dateJoined: '2023-03-22', description: 'Provides food and shelter for the homeless.' },
    { id: '3', name: 'Future Leaders Foundation', owner: 'David Chen', email: 'info@futureleaders.org', phone: '345-678-9012', status: 'Approved', dateJoined: '2022-11-30', description: 'Offers scholarships and mentorship to underprivileged students.' },
    { id: '4', name: 'Animal Rescue Crew', owner: 'Sarah Lee', email: 'rescue@arc.com', phone: '456-789-0123', status: 'Disabled', dateJoined: '2023-02-10', description: 'A no-kill shelter for abandoned and abused animals.' },
    { id: '5', name: 'Global Health Partners', owner: 'Dr. Emily White', email: 'contact@ghp.org', phone: '567-890-1234', status: 'Approved', dateJoined: '2021-09-05', description: 'Delivers medical supplies and aid to remote regions.' },
];

const AdminManageNgos: React.FC = () => {
    const [filter, setFilter] = useState<NgoStatus | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNgo, setSelectedNgo] = useState<NGO | null>(null);

    const filteredNgos = useMemo(() => {
        return mockNgos
            .filter(ngo => filter === 'All' || ngo.status === filter)
            .filter(ngo => 
                ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ngo.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ngo.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [filter, searchTerm]);
    
    const handleViewDetails = (ngo: NGO) => {
        setSelectedNgo(ngo);
        setIsModalOpen(true);
    };

    const tableHeaders = ["NGO Name", "Owner", "Contact", "Date Joined", "Status", "Actions"];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-copy">Manage NGOs</h1>
                <p className="mt-2 text-lg text-copy-muted">Oversee and manage all registered NGO partners.</p>
            </div>

            <div className="bg-surface p-4 rounded-xl shadow-md space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                <div className="flex items-center space-x-2">
                    {(['All', 'Approved', 'Pending', 'Disabled'] as const).map(status => (
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
                        placeholder="Search NGOs..."
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
                            {filteredNgos.map((ngo) => (
                                <tr key={ngo.id} className="border-b border-border hover:bg-background">
                                    <td className="px-6 py-4 font-medium">{ngo.name}</td>
                                    <td className="px-6 py-4">{ngo.owner}</td>
                                    <td className="px-6 py-4">{ngo.email}<br/><span className="text-copy-muted">{ngo.phone}</span></td>
                                    <td className="px-6 py-4">{ngo.dateJoined}</td>
                                    <td className="px-6 py-4"><StatusBadge status={ngo.status} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Button onClick={() => handleViewDetails(ngo)} variant="ghost" size="sm" className="p-2"><ion-icon name="eye-outline" class="text-xl"></ion-icon></Button>
                                            {ngo.status === 'Pending' && <Button variant="ghost" size="sm" className="p-2 text-green-400"><ion-icon name="checkmark-circle-outline" class="text-xl"></ion-icon></Button>}
                                            {ngo.status !== 'Disabled' && <Button variant="ghost" size="sm" className="p-2 text-red-400"><ion-icon name="ban-outline" class="text-xl"></ion-icon></Button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="NGO Details">
                {selectedNgo && (
                     <div className="space-y-4">
                        <div><h3 className="font-bold text-lg text-primary-light">{selectedNgo.name}</h3></div>
                        <p><strong className="text-copy-muted">Owner:</strong> {selectedNgo.owner}</p>
                        <p><strong className="text-copy-muted">Email:</strong> {selectedNgo.email}</p>
                        <p><strong className="text-copy-muted">Phone:</strong> {selectedNgo.phone}</p>
                        <p><strong className="text-copy-muted">Date Joined:</strong> {selectedNgo.dateJoined}</p>
                        <p><strong className="text-copy-muted">Status:</strong> <StatusBadge status={selectedNgo.status} /></p>
                        <p className="pt-2 border-t border-border mt-2"><strong className="text-copy-muted">Description:</strong> {selectedNgo.description}</p>
                        <div className="flex justify-end space-x-2 pt-4">
                            {selectedNgo.status === 'Pending' && <Button variant='primary' size='sm'>Approve</Button>}
                             <Button onClick={() => setIsModalOpen(false)} variant="outline" size="sm">Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminManageNgos;
