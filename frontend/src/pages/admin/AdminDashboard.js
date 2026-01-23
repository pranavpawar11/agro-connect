import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, MessageSquare, Bell, Building, CheckCircle } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import Loading from '../../components/common/Loading';
import api from '../../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingCompanies: 0,
    totalContracts: 0,
    openDisputes: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [companiesRes, contractsRes, disputesRes] = await Promise.all([
        api.get('/users/companies/pending'),
        api.get('/contracts'),
        api.get('/disputes?status=open'),
      ]);

      setStats({
        pendingCompanies: companiesRes.data.count || 0,
        totalContracts: contractsRes.data.total || 0,
        openDisputes: disputesRes.data.count || 0,
        totalUsers: 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Pending Companies',
      value: stats.pendingCompanies,
      icon: Building,
      color: 'bg-yellow-500',
      action: () => navigate('/admin/companies'),
    },
    {
      title: 'Total Contracts',
      value: stats.totalContracts,
      icon: FileText,
      color: 'bg-blue-500',
      action: () => navigate('/admin/contracts'),
    },
    {
      title: 'Open Disputes',
      value: stats.openDisputes,
      icon: MessageSquare,
      color: 'bg-red-500',
      action: () => navigate('/admin/disputes'),
    },
    {
      title: 'Active Alerts',
      value: 0,
      icon: Bell,
      color: 'bg-green-500',
      action: () => navigate('/admin/alerts'),
    },
  ];

  const quickActions = [
    {
      title: 'Verify Companies',
      description: 'Review and verify pending company registrations',
      icon: CheckCircle,
      color: 'bg-primary',
      action: () => navigate('/admin/companies'),
    },
    {
      title: 'Manage Contracts',
      description: 'View and manage all contracts',
      icon: FileText,
      color: 'bg-blue-500',
      action: () => navigate('/admin/contracts'),
    },
    {
      title: 'Resolve Disputes',
      description: 'Handle disputes and complaints',
      icon: MessageSquare,
      color: 'bg-orange-500',
      action: () => navigate('/admin/disputes'),
    },
    {
      title: 'Add Alert',
      description: 'Create weather alerts and notifications',
      icon: Bell,
      color: 'bg-green-500',
      action: () => navigate('/admin/alerts'),
    },
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  onClick={stat.action}
                  className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
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
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div
                    key={index}
                    onClick={action.action}
                    className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${action.color} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 mb-1">{action.title}</h3>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;