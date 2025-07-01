
import React, { useState, useMemo } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

type CompanyStatus = 'Active' | 'Disabled';

interface Company {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: CompanyStatus;
    totalDonated: number;
    dateJoined: string;
}

const mockCompanies: Company[] = [
    { id: '1', name: 'TechCorp Solutions', email: 'csr@techcorp.com', phone: '555-0101', status: 'Active', totalDonated: 150000, dateJoined: '2022-08-10' },
    { id: '2', name: 'Innovate Inc.', email: 'giving@innovate.io', phone: '555-0102', status: 'Active', totalDonated: 75000, dateJoined: '2023-01-20' },
    { id: '3', name: 'Global Goods Co.', email: 'community@globalgoods.com', phone: '555-0103', status: 'Disabled', totalDonated: 25000, dateJoined: '2022-05-15' },
    { id: '4', name: 'Quantum Industries', email: 'foundation@quantum.com', phone: '555-0104', status: 'Active', totalDonated: 500000, dateJoined: '2021-12-01' },
    { id: '5', name: 'Pioneer Logistics', email: 'outreach@pioneer.logistics', phone: '555-0105', status: 'Active', totalDonated: 95000, dateJoined: '2023-04-01' },
];

const AdminManageCompanies: React.FC = () => {
    const [filter, setFilter] = useState<CompanyStatus | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

    const filteredCompanies = useMemo(() => {
        return mockCompanies
            .filter(company => filter === 'All' || company.status === filter)
            .filter(company => 
                company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [filter, searchTerm]);

    const handleViewDetails = (company: Company) => {
        setSelectedCompany(company);
        setIsModalOpen(true);
    };

    const tableHeaders = ["Company Name", "Contact", "Total Donated", "Date Joined", "Status", "Actions"];
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-copy">Manage Companies</h1>
                <p className="mt-2 text-lg text-copy-muted">View and manage all corporate partners.</p>
            </div>

            <div className="bg-surface p-4 rounded-xl shadow-md space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
                <div className="flex items-center space-x-2">
                    {(['All', 'Active', 'Disabled'] as const).map(status => (
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
                        placeholder="Search Companies..."
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
                            {filteredCompanies.map((company) => (
                                <tr key={company.id} className="border-b border-border hover:bg-background">
                                    <td className="px-6 py-4 font-medium">{company.name}</td>
                                    <td className="px-6 py-4">{company.email}<br/><span className="text-copy-muted">{company.phone}</span></td>
                                    <td className="px-6 py-4">${company.totalDonated.toLocaleString()}</td>
                                    <td className="px-6 py-4">{company.dateJoined}</td>
                                    <td className="px-6 py-4"><StatusBadge status={company.status} /></td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <Button onClick={() => handleViewDetails(company)} variant="ghost" size="sm" className="p-2"><ion-icon name="eye-outline" class="text-xl"></ion-icon></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Company Details">
                {selectedCompany && (
                    <div className="space-y-4">
                        <div><h3 className="font-bold text-lg text-primary-light">{selectedCompany.name}</h3></div>
                        <p><strong className="text-copy-muted">Email:</strong> {selectedCompany.email}</p>
                        <p><strong className="text-copy-muted">Phone:</strong> {selectedCompany.phone}</p>
                        <p><strong className="text-copy-muted">Date Joined:</strong> {selectedCompany.dateJoined}</p>
                        <p><strong className="text-copy-muted">Status:</strong> <StatusBadge status={selectedCompany.status} /></p>
                        <p><strong className="text-copy-muted">Total Donated:</strong> <span className="text-green-400 font-bold">${selectedCompany.totalDonated.toLocaleString()}</span></p>
                        <div className="pt-2 border-t border-border mt-2">
                            <h4 className="font-bold text-copy-muted">Recent Donation History (mock)</h4>
                            <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
                                <li>$5,000 to "Clean Water Initiative" on 2023-06-15</li>
                                <li>$10,000 to "Education for All" on 2023-05-20</li>
                                <li>$2,500 to "Animal Shelter Aid" on 2023-04-10</li>
                            </ul>
                        </div>
                        <div className="flex justify-end pt-4">
                             <Button onClick={() => setIsModalOpen(false)} variant="outline" size="sm">Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminManageCompanies;
