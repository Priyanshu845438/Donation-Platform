
import React, { useState, useMemo, useEffect } from 'react';
import { getAdminUsers } from '../../services/api.ts'; // Re-using admin API
import type { User } from '../../types.ts';
import { Link } from 'react-router-dom';

const UserListPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const userList = await getAdminUsers();
            setUsers(userList);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
        (user.name || '').toLowerCase().includes(filter.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(filter.toLowerCase())
      );
  }, [users, filter]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Platform Users</h1>
      <p className="text-gray-600 dark:text-gray-400">View all users who are part of the DonationHub community.</p>
      
      <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow-md">
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
      </div>

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined On</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profile</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-dark-200 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && <tr><td colSpan={4} className="text-center p-4">Loading users...</td></tr>}
            {error && <tr><td colSpan={4} className="text-center p-4 text-red-500">{error}</td></tr>}
            {!loading && filteredUsers.length === 0 && <tr><td colSpan={4} className="text-center p-4">No users found.</td></tr>}
            {!loading && !error && filteredUsers.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/profile/${user.username}`} className="text-brand-gold hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListPage;