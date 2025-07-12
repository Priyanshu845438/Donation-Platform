
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminUsers, approveUser, toggleUserStatus, deleteUser } from '../../services/api.ts';
import type { User } from '../../types.ts';
import Button from '../../components/Button.tsx';
import { FiEdit, FiTrash2, FiCheck, FiPlus, FiToggleLeft, FiToggleRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import CreateUserModal from '../../components/admin/CreateUserModal.tsx';
import EditUserModal from '../../components/admin/EditUserModal.tsx';
import DeleteUserModal from '../../components/admin/DeleteUserModal.tsx';

const USERS_PER_PAGE = 10;

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortOption, setSortOption] = useState('latest');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const navigate = useNavigate();
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
        const userList = await getAdminUsers();
        // Default sort by latest
        const sortedUsers = userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUsers(sortedUsers);
    } catch (err: any) {
        setError(err.message || 'Failed to fetch users.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const processedUsers = useMemo(() => {
    let filtered = users
      .filter(user => 
        (user.name || '').toLowerCase().includes(filter.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(filter.toLowerCase())
      )
      .filter(user => roleFilter === 'all' || user.role === roleFilter);

    return [...filtered].sort((a, b) => {
        switch (sortOption) {
            case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case 'a-z': return (a.name || '').localeCompare(b.name || '');
            case 'z-a': return (b.name || '').localeCompare(a.name || '');
            case 'latest':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });
  }, [users, filter, roleFilter, sortOption]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return processedUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [processedUsers, currentPage]);

  const totalPages = Math.ceil(processedUsers.length / USERS_PER_PAGE);

  const handleApprove = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    try {
        await approveUser(userId);
        fetchUsers();
    } catch (err: any) {
        alert(`Failed to approve user: ${err.message}`);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
     try {
         await toggleUserStatus(user);
         fetchUsers();
     } catch (err: any) {
         alert(`Failed to change status: ${err.message}`);
     }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser.id);
      fetchUsers();
      setDeletingUser(null);
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
      setDeletingUser(null);
    }
  };

  const statusBadge = (status: User['status']) => {
      const base = "px-2 py-1 text-xs font-semibold rounded-full";
      switch(status) {
          case 'active': return `${base} bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300`;
          case 'pending': return `${base} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300`;
          case 'disabled': return `${base} bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`;
      }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
      
      <div className="bg-white dark:bg-brand-dark-200 p-4 rounded-lg shadow-md flex flex-wrap items-center gap-4">
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="flex-grow px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
          <select 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="ngo">NGO</option>
              <option value="company">Company</option>
              <option value="donor">Donor</option>
          </select>
          <select 
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-gold"
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
          >
              <option value="latest">Sort: Latest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="a-z">Sort: A-Z</option>
              <option value="z-a">Sort: Z-A</option>
          </select>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <FiPlus className="mr-2" /> Create User
          </Button>
      </div>

      <div className="bg-white dark:bg-brand-dark-200 shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-brand-dark">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Joined On</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-dark-200 divide-y divide-gray-200 dark:divide-gray-700">
            {loading && <tr><td colSpan={6} className="text-center p-4">Loading users...</td></tr>}
            {error && <tr><td colSpan={6} className="text-center p-4 text-red-500">{error}</td></tr>}
            {!loading && paginatedUsers.length === 0 && <tr><td colSpan={6} className="text-center p-4">No users found.</td></tr>}
            {!loading && !error && paginatedUsers.map(user => (
              <tr key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)} className="hover:bg-gray-50 dark:hover:bg-brand-dark cursor-pointer">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.phoneNumber || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={statusBadge(user.status)}>{user.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-2">
                    {user.approvalStatus === 'pending' && (
                        <Button onClick={(e) => handleApprove(e, user.id)} variant="ghost" className="p-2 text-green-500" title="Approve User">
                            <FiCheck />
                        </Button>
                    )}
                    {user.role !== 'admin' && user.approvalStatus === 'approved' && (
                        <Button 
                            onClick={(e) => handleToggleStatus(e, user)} 
                            variant="ghost" 
                            className={`p-2 ${user.isActive ? 'text-green-500' : 'text-red-500'}`}
                            title={user.isActive ? 'Disable User' : 'Enable User'}
                        >
                            {user.isActive ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                        </Button>
                    )}
                    <Button onClick={(e) => { e.stopPropagation(); setEditingUser(user); }} variant="ghost" className="p-2 text-blue-500" title="Edit User"><FiEdit /></Button>
                    {user.role !== 'admin' && <Button onClick={(e) => {e.stopPropagation(); setDeletingUser(user);}} variant="ghost" className="p-2 text-red-500" title="Delete User"><FiTrash2 /></Button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-brand-dark-200 px-4 py-3 rounded-b-lg shadow-md">
            <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="ghost" className="p-2">
                    <FiChevronLeft />
                </Button>
                <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="ghost" className="p-2">
                    <FiChevronRight />
                </Button>
            </div>
        </div>
      )}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={() => {
            fetchUsers();
            setIsCreateModalOpen(false);
        }}
      />
      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUserUpdated={() => {
            fetchUsers();
            setEditingUser(null);
        }}
        user={editingUser}
      />
      <DeleteUserModal
        isOpen={!!deletingUser}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirm}
        user={deletingUser}
      />
    </div>
  );
};

export default UserManagementPage;
