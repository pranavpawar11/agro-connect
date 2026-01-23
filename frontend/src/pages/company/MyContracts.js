import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Users, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import { formatDate, formatPrice } from '../../utils/helpers';

const MyContracts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const data = await contractService.getCompanyContracts();
      setContracts(data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    if (filter === 'all') return true;
    return contract.status === filter;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="company" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">My Contracts</h1>
            <button
              onClick={() => navigate('/company/create-contract')}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark"
            >
              Create New Contract
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto">
              {['all', 'pending', 'approved', 'active', 'in_progress', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap ${
                    filter === status
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Contracts Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <Loading />
            ) : filteredContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Crop Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Total Value</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Applications</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredContracts.map((contract) => {
                      const totalValue = contract.quantity * contract.agreedPrice;
                      return (
                        <tr key={contract._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 capitalize font-medium text-gray-800">
                            {contract.cropType}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {contract.quantity} {contract.unit}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {formatPrice(contract.agreedPrice)}
                          </td>
                          <td className="px-6 py-4 text-gray-700 font-semibold">
                            {formatPrice(totalValue)}
                          </td>
                          <td className="px-6 py-4 text-gray-700 text-sm">
                            {formatDate(contract.duration.startDate)} <br />
                            to {formatDate(contract.duration.endDate)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                              {contract.applicationsCount}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusColor(contract.status)}`}>
                              {contract.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => navigate(`/company/contracts/${contract._id}/applicants`)}
                                className="text-primary hover:text-primary-dark font-semibold flex items-center gap-1 text-sm"
                                title="View Applicants"
                              >
                                <Users className="w-4 h-4" />
                                Applicants
                              </button>
                              <button
                                onClick={() => navigate(`/company/contracts/${contract._id}`)}
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 text-sm"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                                Details
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No contracts found</p>
                <button
                  onClick={() => navigate('/company/create-contract')}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark"
                >
                  Create Your First Contract
                </button>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {!loading && contracts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Total Contracts</p>
                <p className="text-3xl font-bold text-gray-800">{contracts.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Active Contracts</p>
                <p className="text-3xl font-bold text-green-600">
                  {contracts.filter(c => c.status === 'active' || c.status === 'in_progress').length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-blue-600">
                  {contracts.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6">
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {contracts.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MyContracts;