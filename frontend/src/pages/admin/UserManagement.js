import React, { useEffect, useState } from 'react';
import { Users, Lock, Unlock } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import api from '../../services/api';
import { formatDate } from '../../utils/helpers';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/companies');
      setUsers(response.data.companies);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, isActive) => {
    try {
      if (isActive) {
        await api.put(`/users/users/${userId}/block`, { reason: 'Blocked by admin' });
        toast.success('User blocked successfully');
      } else {
        await api.put(`/users/users/${userId}/unblock`);
        toast.success('User unblocked successfully');
      }
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    if (filter === 'active') return user.isActive;
    if (filter === 'blocked') return !user.isActive;
    return user.role === filter;
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">User Management</h1>

          {/* Filter Buttons */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'farmer', 'company', 'active', 'blocked'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <Loading />
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{user.name}</td>
                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full capitalize">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleBlockUser(user._id, user.isActive)}
                            className={`p-2 rounded-lg ${
                              user.isActive
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={user.isActive ? 'Block User' : 'Unblock User'}
                          >
                            {user.isActive ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;