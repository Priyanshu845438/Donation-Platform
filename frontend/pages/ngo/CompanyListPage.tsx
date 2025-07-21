
import React, { useState, useEffect } from 'react';
import { organizationAPI } from '../../services/api.ts';
import type { User } from '../../types.ts';
import { FiBriefcase, FiLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const CompanyListPage: React.FC = () => {
  const [companies, setCompanies] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companyList = await organizationAPI.getCompanies();
        setCompanies(companyList);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch companies.');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Corporate Partners</h1>
      <p className="text-gray-600 dark:text-gray-400">Explore companies on our platform to find potential partners for your CSR initiatives.</p>
      
      {loading && <p>Loading companies...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(company => (
            <div key={company.id} className="bg-white dark:bg-brand-dark-200 p-6 rounded-lg shadow-md flex flex-col items-center text-center">
              <img src={company.avatar} alt={company.name} className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-brand-gold/20" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{company.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3 flex-grow">{company.profile?.description || 'No description available.'}</p>
              <Link to={`/profile/${company.username}`} className="mt-4 inline-flex items-center text-brand-gold font-semibold hover:underline">
                View Profile <FiLink className="ml-1" size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyListPage;