import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, MessageSquare, Bell, Building, CheckCircle, Shield, TrendingUp, Activity } from 'lucide-react';
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
      gradient: 'from-yellow-500 to-orange-600',
      bgGradient: 'from-yellow-50 to-orange-50',
      action: () => navigate('/admin/companies'),
    },
    {
      title: 'Total Contracts',
      value: stats.totalContracts,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      action: () => navigate('/admin/contracts'),
    },
    {
      title: 'Open Disputes',
      value: stats.openDisputes,
      icon: MessageSquare,
      gradient: 'from-red-500 to-pink-600',
      bgGradient: 'from-red-50 to-pink-50',
      action: () => navigate('/admin/disputes'),
    },
    {
      title: 'Active Alerts',
      value: 0,
      icon: Bell,
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      action: () => navigate('/admin/alerts'),
    },
  ];

  const quickActions = [
    {
      title: 'Verify Companies',
      description: 'Review and verify pending company registrations',
      icon: CheckCircle,
      gradient: 'from-primary-600 to-emerald-600',
      action: () => navigate('/admin/companies'),
    },
    {
      title: 'Manage Contracts',
      description: 'View and manage all contracts',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-600',
      action: () => navigate('/admin/contracts'),
    },
    {
      title: 'Resolve Disputes',
      description: 'Handle disputes and complaints',
      icon: MessageSquare,
      gradient: 'from-orange-500 to-red-600',
      action: () => navigate('/admin/disputes'),
    },
    {
      title: 'Add Alert',
      description: 'Create weather alerts and notifications',
      icon: Bell,
      gradient: 'from-green-500 to-emerald-600',
      action: () => navigate('/admin/alerts'),
    },
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1400&auto=format&fit=crop')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/95 to-emerald-900/95 backdrop-blur-sm"></div>
            
            <div className="relative p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                      <Shield className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div>
                      <h1 className="text-4xl font-display font-black text-white tracking-tight">
                        Admin Dashboard
                      </h1>
                      <p className="text-primary-100 text-lg mt-1">System control and management</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
                  <div className="flex items-center gap-2 text-white">
                    <Activity className="w-5 h-5 text-green-400 animate-pulse" />
                    <span className="text-sm font-semibold">System Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  onClick={stat.action}
                  className={`glass-card rounded-2xl p-6 border-2 border-white/50 shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer group animate-bounce-in bg-gradient-to-br ${stat.bgGradient}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`bg-gradient-to-br ${stat.gradient} p-3 rounded-xl shadow-medium group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <p className={`text-4xl font-black bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                  <p className="text-neutral-700 text-sm font-bold">{stat.title}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-neutral-500">
                    <TrendingUp className="w-3 h-3" />
                    <span>Click to view</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-2xl font-black text-neutral-900 mb-6 flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary-500 to-emerald-600 p-2 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div
                    key={index}
                    onClick={action.action}
                    className="group glass-card rounded-2xl p-6 border-2 border-white/50 shadow-soft hover:shadow-card-hover transition-all duration-300 cursor-pointer animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`bg-gradient-to-br ${action.gradient} p-4 rounded-xl shadow-medium group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-neutral-900 mb-2 text-lg group-hover:text-primary-700 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Stats */}
          <div className="mt-8 relative overflow-hidden rounded-3xl shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/95 to-primary-900/95 backdrop-blur-sm"></div>
            
            <div className="relative p-8">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <Activity className="w-7 h-7 text-green-400" />
                System Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-2">Platform Health</p>
                  <p className="text-5xl font-black text-green-400 mb-1">98%</p>
                  <p className="text-green-400 text-xs font-bold">Excellent</p>
                </div>
                <div className="text-center border-l border-r border-white/20">
                  <p className="text-white/80 text-sm mb-2">Avg Response Time</p>
                  <p className="text-5xl font-black text-blue-400 mb-1">1.2s</p>
                  <p className="text-blue-400 text-xs font-bold">Fast</p>
                </div>
                <div className="text-center">
                  <p className="text-white/80 text-sm mb-2">Active Sessions</p>
                  <p className="text-5xl font-black text-yellow-400 mb-1">247</p>
                  <p className="text-yellow-400 text-xs font-bold">Live Now</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;