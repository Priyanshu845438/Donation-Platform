
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { FiSearch, FiMapPin, FiLoader, FiUsers } from 'react-icons/fi';

interface NGO {
    _id: string;
    organizationName: string;
    description: string;
    profileImage?: string;
    location: {
        city: string;
        state: string;
    };
}

const DonorNgoListPage: React.FC = () => {
    const [ngos, setNgos] = useState<NGO[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { addToast } = useToast();

    useEffect(() => {
        fetchNgos();
    }, [page, search]);

    const fetchNgos = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '12'
            });
            
            if (search) params.append('search', search);

            const response = await fetch(`/api/donor/ngos?${params}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNgos(data.data.ngos);
                setTotalPages(data.data.pagination.pages);
            } else {
                throw new Error('Failed to fetch NGOs');
            }
        } catch (error: any) {
            addToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchNgos();
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    NGOs & Organizations
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Discover verified NGOs making a difference in the world.
                </p>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search NGOs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* NGOs Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <FiLoader className="animate-spin h-8 w-8 text-blue-600" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {ngos.map((ngo) => (
                            <div key={ngo._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                                    {ngo.profileImage ? (
                                        <img
                                            src={ngo.profileImage}
                                            alt={ngo.organizationName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <FiUsers className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {ngo.organizationName}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                        {ngo.description}
                                    </p>
                                    
                                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-4">
                                        <FiMapPin className="mr-1" />
                                        {ngo.location.city}, {ngo.location.state}
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <Link
                                            to={`/ngo/${ngo._id}`}
                                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                                        >
                                            View Profile
                                        </Link>
                                        <Link
                                            to={`/campaigns?ngo=${ngo._id}`}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                        >
                                            View Campaigns
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {ngos.length === 0 && (
                        <div className="text-center py-12">
                            <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No NGOs found. Try adjusting your search criteria.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DonorNgoListPage;
