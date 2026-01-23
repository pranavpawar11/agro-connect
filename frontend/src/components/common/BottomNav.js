import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Sprout, FileText, Bell, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/farmer/home', icon: Home, label: t('farmer.home') },
    { path: '/farmer/crop-prediction', icon: Sprout, label: t('farmer.cropPrediction') },
    { path: '/farmer/contracts', icon: FileText, label: t('farmer.contracts') },
    { path: '/farmer/alerts', icon: Bell, label: t('farmer.alerts') },
    { path: '/farmer/profile', icon: User, label: t('common.profile') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'stroke-2' : ''}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;