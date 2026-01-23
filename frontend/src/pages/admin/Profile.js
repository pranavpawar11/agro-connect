import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, User, LogOut } from 'lucide-react';
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar role="admin" />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pt-20 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Profile</h1>

          <div className="max-w-2xl">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-primary text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
                  <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail className="w-5 h-5 text-primary" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <User className="w-5 h-5 text-primary" />
                  <span>Administrator</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-4 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 mt-6"
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