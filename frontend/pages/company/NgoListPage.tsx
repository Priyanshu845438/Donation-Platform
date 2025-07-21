
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import Button from '../../components/common/Button';

interface NGO {
    _id: string;
    ngoName: string;
    email: string;
    ngoType: string;
    is80GCertified: boolean;
    is12ACertified: boolean;
    logo: string;
    description?: string;
    location?: string;
    website?: string;
}

const CompanyNgoListPage: React.FC = () => {
    const { addToast } = useToast();
    const [ngos, setNgos] = useState<NGO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchNgos = async () => {
            try {
                const response = await apiFetch<{ ngos: NGO[] }>('/company/ngos');
                setNgos(response.ngos);
            } catch (error: any) {
                addToast(error.message || 'Failed to fetch NGOs', 'error');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNgos();
    }, [addToast]);

    const handleViewProfile = (ngoId: string) => {
        console.log('View NGO profile:', ngoId);
    };

    const filteredNgos = ngos.filter(ngo =>
        ngo.ngoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.ngoType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Partner NGOs</h1>
                <p className="mt-2 text-gray-600">Connect with verified NGOs for your CSR initiatives</p>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="Search NGOs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="text-sm text-gray-600">
                    {filteredNgos.length} NGOs found
                </div>
            </div>

            {filteredNgos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNgos.map((ngo) => (
                        <div key={ngo._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center space-x-4 mb-4">
                                <img
                                    src={ngo.logo || `https://ui-avatars.com/api/?name=${ngo.ngoName}&background=0d6efd&color=fff&size=64`}
                                    alt={ngo.ngoName}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{ngo.ngoName}</h3>
                                    <p className="text-sm text-gray-600">{ngo.ngoType}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <p className="text-sm text-gray-600">
                                    <strong>Email:</strong> {ngo.email}
                                </p>
                                {ngo.website && (
                                    <p className="text-sm text-gray-600">
                                        <strong>Website:</strong> 
                                        <a href={ngo.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
                                            {ngo.website}
                                        </a>
                                    </p>
                                )}
                                {ngo.description && (
                                    <p className="text-sm text-gray-600 line-clamp-3">{ngo.description}</p>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {ngo.is80GCertified && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        80G Certified
                                    </span>
                                )}
                                {ngo.is12ACertified && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        12A Certified
                                    </span>
                                )}
                            </div>

                            <div className="flex space-x-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleViewProfile(ngo._id)}
                                    className="flex-1"
                                >
                                    View Profile
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                >
                                    View Campaigns
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No NGOs found</p>
                </div>
            )}
        </div>
    );
};

export default CompanyNgoListPage;
