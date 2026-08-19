import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/lms/DashboardLayout';
import { Search, Plus, Filter } from 'lucide-react';
import pb from '../../../lib/pocketbase';
import CreateUserModal from '../../../components/lms/admin/CreateUserModal';
import EditUserModal from '../../../components/lms/admin/EditUserModal';
import DeleteUserModal from '../../../components/lms/admin/DeleteUserModal';
import LinkParentModal from '../../../components/lms/admin/LinkParentModal';
import UserTable from '../../../components/lms/admin/UserTable';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student' | 'parent';
  phone?: string;
  address?: string;
  avatar?: string;
  created: string;
  updated: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const records = await pb.collection('users').getFullList<User>({
        sort: '-created',
        requestKey: null,
      });
      console.log('✅ Users fetched:', records.length);
      setUsers(records);
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter effect
  useEffect(() => {
    let filtered = [...users];

    if (roleFilter !== 'all') {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q)
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, roleFilter, users]);

  const handleEditUser = (user: User) => { setSelectedUser(user); setShowEditModal(true); };
  const handleDeleteUser = (user: User) => { setSelectedUser(user); setShowDeleteModal(true); };
  const handleLinkParent = (user: User) => { setSelectedUser(user); setShowLinkModal(true); };

  const handleUserCreated = async () => {
    setShowCreateModal(false);
    console.log('🔄 Refreshing after create...');
    await fetchUsers();
  };

  const handleUserUpdated = async () => {
    setShowEditModal(false);
    setSelectedUser(null);
    console.log('🔄 Refreshing after update...');
    await fetchUsers();
  };

  const handleUserDeleted = async () => {
    setShowDeleteModal(false);
    setSelectedUser(null);
    console.log('🔄 Refreshing after delete...');
    await fetchUsers();
  };

  const handleParentLinked = () => {
    setShowLinkModal(false);
    setSelectedUser(null);
  };

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    teachers: users.filter((u) => u.role === 'teacher').length,
    students: users.filter((u) => u.role === 'student').length,
    parents: users.filter((u) => u.role === 'parent').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent mb-2">
                User Management
              </h1>
              <p className="text-gray-400">Manage all users, roles, and permissions</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center bg-gradient-to-r from-red-700 to-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add User
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total', value: stats.total, color: 'text-amber-400' },
              { label: 'Admins', value: stats.admins, color: 'text-red-400' },
              { label: 'Teachers', value: stats.teachers, color: 'text-amber-400' },
              { label: 'Students', value: stats.students, color: 'text-red-400' },
              { label: 'Parents', value: stats.parents, color: 'text-amber-400' },
            ].map((s) => (
              <div key={s.label} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 border-2 border-gray-600">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-gray-400 text-sm">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all duration-300 text-gray-200 appearance-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admins</option>
                  <option value="teacher">Teachers</option>
                  <option value="student">Students</option>
                  <option value="parent">Parents</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-gray-600 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading users...</p>
            </div>
          ) : (
            <UserTable
              users={filteredUsers}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onLinkParent={handleLinkParent}
            />
          )}
        </div>

        {!loading && (
          <div className="mt-4 text-center text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleUserCreated}
        />
      )}
      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => { setShowEditModal(false); setSelectedUser(null); }}
          onSuccess={handleUserUpdated}
        />
      )}
      {showDeleteModal && selectedUser && (
        <DeleteUserModal
          user={selectedUser}
          onClose={() => { setShowDeleteModal(false); setSelectedUser(null); }}
          onSuccess={handleUserDeleted}
        />
      )}
      {showLinkModal && selectedUser && (
        <LinkParentModal
          user={selectedUser}
          onClose={() => { setShowLinkModal(false); setSelectedUser(null); }}
          onSuccess={handleParentLinked}
        />
      )}
    </DashboardLayout>
  );
};

export default Users;