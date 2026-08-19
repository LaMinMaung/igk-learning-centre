import React from 'react';
import { Edit, Trash2, Link as LinkIcon, Mail, Phone } from 'lucide-react';

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

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onLinkParent: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({ users, onEdit, onDelete, onLinkParent }) => {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-900/30 text-red-400 border-red-600';
      case 'teacher':
        return 'bg-amber-900/30 text-amber-400 border-amber-600';
      case 'student':
        return 'bg-blue-900/30 text-blue-400 border-blue-600';
      case 'parent':
        return 'bg-green-900/30 text-green-400 border-green-600';
      default:
        return 'bg-gray-700 text-gray-300 border-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-2">No users found</p>
        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-700/50 border-b-2 border-gray-600">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-bold text-amber-300">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-amber-300">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-amber-300">Phone</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-amber-300">Role</th>
            <th className="px-6 py-4 text-left text-sm font-bold text-amber-300">Created</th>
            <th className="px-6 py-4 text-center text-sm font-bold text-amber-300">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-amber-500 mr-3"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center text-gray-900 font-bold mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-gray-200">{user.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center text-gray-300">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <a href={`mailto:${user.email}`} className="hover:text-amber-400 transition">
                    {user.email}
                  </a>
                </div>
              </td>
              <td className="px-6 py-4">
                {user.phone ? (
                  <div className="flex items-center text-gray-300">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    <a href={`tel:${user.phone}`} className="hover:text-amber-400 transition">
                      {user.phone}
                    </a>
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Not provided</span>
                )}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(user.created)}</td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  {user.role === 'parent' && (
                    <button
                      onClick={() => onLinkParent(user)}
                      className="p-2 bg-green-900/30 text-green-400 rounded-lg hover:bg-green-900/50 transition-all duration-300 border border-green-600"
                      title="Link to Student"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(user)}
                    className="p-2 bg-amber-900/30 text-amber-400 rounded-lg hover:bg-amber-900/50 transition-all duration-300 border border-amber-600"
                    title="Edit User"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="p-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-all duration-300 border border-red-600"
                    title="Delete User"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;