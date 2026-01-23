import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  Bell, 
  BookOpen, 
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getMenuItems = () => {
    if (role === 'company') {
      return [
        { path: '/company/dashboard', icon: LayoutDashboard, label: t('company.dashboard') },
        { path: '/company/contracts', icon: FileText, label: t('company.myContracts') },
        { path: '/company/disputes', icon: MessageSquare, label: t('company.disputes') },
        { path: '/company/profile', icon: Settings, label: t('common.profile') },
      ];
    } else if (role === 'admin') {
      return [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
        { path: '/admin/companies', icon: Users, label: t('admin.verifyCompanies') },
        { path: '/admin/users', icon: Users, label: t('admin.users') },
        { path: '/admin/contracts', icon: FileText, label: t('admin.contracts') },
        { path: '/admin/disputes', icon: MessageSquare, label: t('admin.disputes') },
        { path: '/admin/alerts', icon: Bell, label: t('admin.alerts') },
        { path: '/admin/schemes', icon: BookOpen, label: t('admin.schemes') },
        { path: '/admin/profile', icon: Settings, label: t('common.profile') },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-primary text-white p-2 rounded-lg"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-primary">AgroConnect</h1>
            <p className="text-sm text-gray-600 capitalize">{role} Panel</p>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                    isActive
                      ? 'bg-primary-light text-primary border-r-4 border-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="font-medium">{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;