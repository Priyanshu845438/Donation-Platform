
import React, { useState, useEffect } from 'react';
import { organizationAPI } from '../../services/api.ts';
import type { User } from '../../types.ts';
import { FiLink, FiLoader } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const DonorNgoListPage: React.FC = () => {
  const [ngos, setNgos] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNgos = async () => {
      try {
        const ngoList = await organizationAPI.getNgos();
        setNgos(ngoList);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch NGOs.');
      } finally {
        setLoading(false);
      }
    };
    fetchNgos();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><FiLoader className="animate-spin h-8 w-8 text-brand-gold"/></div>;
  }

  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Verified NGOs</h1>
      <p className="text-gray-600 dark:text-gray-400">Discover and support verified NGOs on our platform.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ngos.map(ngo => (
          <div key={ngo.id} className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md flex flex-col items-center text-center transition-transform hover:-translate-y-1">
            <img src={ngo.avatar} alt={ngo.name} className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-brand-gold/20" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{ngo.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3 flex-grow">{ngo.profile?.description || 'No description available.'}</p>
            <Link to={`/profile/${ngo.username}`} className="mt-4 inline-flex items-center text-brand-gold font-semibold hover:underline">
              View Profile <FiLink className="ml-1" size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonorNgoListPage;
