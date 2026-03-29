import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, LogOut, Shield, Activity } from 'lucide-react';
import Sidebar from '../../components/common/Sidebar';
import Navbar from '../../components/common/Navbar';
import useAuth from '../../hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gradient-mesh-light farmland-pattern">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main className="flex-1 overflow-y-auto pt-20 p-6">
          {/* Hero Header */}
          <div className="relative mb-8 rounded-3xl overflow-hidden shadow-xl animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-800 to-indigo-900" />
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-4 right-40 w-32 h-32 bg-violet-300/10 rounded-full" />

            <div className="relative p-8">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <Shield className="w-8 h-8 text-violet-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-display font-black text-white tracking-tight">
                    Admin Profile
                  </h1>
                  <p className="text-violet-100 text-lg mt-1">Your account information and settings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl">
            {/* Profile Card */}
            <div className="glass-card rounded-3xl border-2 border-white/50 shadow-soft overflow-hidden animate-bounce-in">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-primary-600 to-violet-700 p-8">
                <div className="flex items-center gap-5">
                  <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-black text-white shadow-lg border border-white/30">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">{user?.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="bg-white/20 px-3 py-1 rounded-full">
                        <p className="text-violet-100 text-sm font-bold capitalize">{user?.role}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-green-500/30 px-3 py-1 rounded-full">
                        <Activity className="w-3 h-3 text-green-300 animate-pulse" />
                        <span className="text-green-200 text-xs font-bold">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="p-6 space-y-3">
                <div className="flex items-center gap-4 bg-neutral-50 rounded-2xl p-4 border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200">
                  <div className="bg-gradient-to-br from-primary-500 to-violet-600 p-2.5 rounded-xl shadow-sm">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Email Address</p>
                    <p className="font-bold text-neutral-800 mt-0.5">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-neutral-50 rounded-2xl p-4 border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200">
                  <div className="bg-gradient-to-br from-primary-500 to-violet-600 p-2.5 rounded-xl shadow-sm">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Role</p>
                    <p className="font-bold text-neutral-800 mt-0.5">Administrator</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-neutral-50 rounded-2xl p-4 border border-neutral-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all duration-200">
                  <div className="bg-gradient-to-br from-primary-500 to-violet-600 p-2.5 rounded-xl shadow-sm">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Access Level</p>
                    <p className="font-bold text-neutral-800 mt-0.5">Full System Access</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-6 bg-gradient-to-r from-red-500 to-pink-600 text-white py-4 rounded-2xl font-black hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg animate-slide-up"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;
