'use client';

import { useState } from 'react';
import { X, Pencil, Trash2, UserPlus } from 'lucide-react';
import { addUser, updateUser, deleteUser, resetPassword } from '@/app/actions';

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function UsersClient({ users }: { users: User[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add User Form State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('owner');

  // Edit User Form State
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', newUserEmail);
    formData.append('password', newUserPassword);
    formData.append('role', newUserRole);

    const result = await addUser(formData);
    
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setIsAddModalOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('owner');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('email', editUserEmail);
    formData.append('role', editUserRole);
    if (editUserPassword) {
      formData.append('password', editUserPassword);
    }

    const result = await updateUser(editingUser.id, formData);
    
    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      setEditingUser(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch {
        alert('Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (confirm('Are you sure you want to reset the password for this user to "admin"?')) {
      try {
        await resetPassword(userId);
        alert('Password reset successfully');
      } catch {
        alert('Failed to reset password');
      }
    }
  };

  const startEditing = (user: User) => {
    setEditingUser(user);
    setEditUserEmail(user.email);
    setEditUserRole(user.role || 'owner');
    setEditUserPassword('');
  };

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
            User Management
          </h2>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="ml-3 inline-flex items-center rounded-md bg-black dark:bg-white px-3 py-2 text-sm font-semibold text-white dark:text-black shadow-sm hover:bg-gray-800 dark:hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            <UserPlus className="-ml-0.5 mr-1.5 h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow overflow-hidden sm:rounded-lg border border-gray-200 dark:border-zinc-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {user.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'}`}>
                      {user.role === 'superadmin' ? 'Superadmin' : 'Owner'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" suppressHydrationWarning>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => startEditing(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit User"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Reset Password"
                      >
                        <span className="sr-only">Reset Password</span>
                        KEY
                      </button>
                      {user.role !== 'superadmin' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New User</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 text-sm"
                >
                  <option value="owner">Owner</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {loading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white px-3 py-2 text-sm"
                >
                  <option value="owner">Owner</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
