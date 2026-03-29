import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Users, PlusCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import useAuth from '../../hooks/useAuth';
import contractService from '../../services/contractService';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    totalApplications: 0,
    pendingApplications: 0,
  });
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await contractService.getCompanyContracts();
      setRecentContracts(data.contracts.slice(0, 5));
      
      const totalApplications = data.contracts.reduce((sum, c) => sum + c.applicationsCount, 0);
      
      setStats({
        totalContracts: data.contracts.length,
        activeContracts: data.contracts.filter(c => c.status === 'active').length,
        totalApplications,
        pendingApplications: totalApplications,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Contracts',
      value: stats.totalContracts,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Contracts',
      value: stats.activeContracts,
      icon: FileText,
      color: 'bg-green-500',
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Pending Applications',
      value: stats.pendingApplications,
      icon: AlertCircle,
      color: 'bg-yellow-500',
    },
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="company" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Verification Status Alert */}
          {user?.verificationStatus === 'pending' && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-semibold">Verification Pending</p>
                  <p className="text-sm">Your company is under verification. You can create contracts once verified by admin.</p>
                  <p className="text-sm">Try to log in again for updating Profile.</p>
                </div>
              </div>
            </div>
          )}

          {user?.verificationStatus === 'rejected' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-3" />
                <div>
                  <p className="font-semibold">Verification Rejected</p>
                  <p className="text-sm">{user?.verificationRemarks || 'Please contact admin for more information.'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => navigate('/company/create-contract')}
              disabled={user?.verificationStatus !== 'verified'}
              className="bg-primary text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PlusCircle className="w-6 h-6" />
              <span className="font-semibold">Create New Contract</span>
            </button>
            <button
              onClick={() => navigate('/company/contracts')}
              className="bg-white text-primary border-2 border-primary p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-3"
            >
              <FileText className="w-6 h-6" />
              <span className="font-semibold">My Contracts</span>
            </button>
            <button
              onClick={() => navigate('/company/disputes')}
              className="bg-white text-gray-700 border-2 border-gray-300 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-center justify-center gap-3"
            >
              <AlertCircle className="w-6 h-6" />
              <span className="font-semibold">Disputes</span>
            </button>
          </div>

          {/* Recent Contracts */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Contracts</h2>
              <button
                onClick={() => navigate('/company/contracts')}
                className="text-primary font-semibold hover:underline"
              >
                View All
              </button>
            </div>

            {recentContracts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Crop</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Applications</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentContracts.map((contract) => (
                      <tr
                        key={contract._id}
                        onClick={() => navigate(`/company/contracts/${contract._id}/applicants`)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-4 py-3 capitalize">{contract.cropType}</td>
                        <td className="px-4 py-3">{contract.quantity} {contract.unit}</td>
                        <td className="px-4 py-3">₹{contract.agreedPrice}</td>
                        <td className="px-4 py-3">{contract.applicationsCount}</td>
                        <td className="px-4 py-3">
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            {contract.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No contracts yet</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboard;