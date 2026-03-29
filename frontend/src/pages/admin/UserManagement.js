import React, { useEffect, useState } from 'react';
import { Users, Lock, Unlock, User, Clock } from 'lucide-react';
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

  const filterOptions = ['all', 'farmer', 'company', 'active', 'blocked'];

  const filterGradients = {
    all: 'from-neutral-500 to-neutral-600',
    farmer: 'from-green-500 to-emerald-600',
    company: 'from-blue-500 to-cyan-600',
    active: 'from-primary-500 to-violet-600',
    blocked: 'from-red-500 to-pink-600',
  };

  const getRoleColor = (role) => {
    const colors = {
      farmer: 'bg-green-100 text-green-800 border border-green-200',
      company: 'bg-blue-100 text-blue-800 border border-blue-200',
      admin: 'bg-violet-100 text-violet-800 border border-violet-200',
    };
    return colors[role] || 'bg-neutral-100 text-neutral-700 border border-neutral-200';
  };

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-700 to-indigo-900" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-4 right-40 w-32 h-32 bg-purple-300/10 rounded-full" />

            <div className="relative p-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <Users className="w-8 h-8 text-violet-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">
                    User Management
                  </h1>
                  <p className="text-violet-100 text-lg mt-1">Manage and moderate platform users</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="glass-card rounded-2xl border-2 border-white/50 shadow-soft p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filterOptions.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold capitalize whitespace-nowrap transition-all duration-200 ${
                    filter === status
                      ? `bg-gradient-to-r ${filterGradients[status]} text-white shadow-md scale-105`
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-3xl border-2 border-white/50 shadow-soft overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center">
                <Loading />
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-neutral-50 to-violet-50 border-b border-neutral-200">
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-neutral-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredUsers.map((user, index) => (
                      <tr
                        key={user._id}
                        className="hover:bg-violet-50/50 transition-colors duration-150 animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-primary-500 to-violet-600 w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-neutral-800">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 text-sm">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-neutral-600 text-sm">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {user.isActive ? 'Active' : 'Blocked'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleBlockUser(user._id, user.isActive)}
                            className={`p-2 rounded-xl hover:scale-110 transition-all duration-200 border ${
                              user.isActive
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 border-red-100'
                                : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-100'
                            }`}
                            title={user.isActive ? 'Block User' : 'Unblock User'}
                          >
                            {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gradient-to-br from-violet-100 to-primary-100 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-violet-400" />
                </div>
                <p className="text-neutral-500 font-semibold text-lg">No users found</p>
                <p className="text-neutral-400 text-sm mt-1">Users will appear here once they register</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagement;
