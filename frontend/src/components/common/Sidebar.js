import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Users, MessageSquare,
  Bell, BookOpen, Settings, LogOut, Menu, X, Sprout,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ role }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useTranslation();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getMenuItems = () => {
    if (role === 'company') {
      return [
        { path: '/company/dashboard', icon: LayoutDashboard, label: t('company.dashboard') },
        { path: '/company/contracts', icon: FileText,         label: t('company.myContracts') },
        { path: '/company/disputes',  icon: MessageSquare,    label: t('company.disputes') },
        { path: '/company/profile',   icon: Settings,         label: t('common.profile') },
      ];
    } else if (role === 'admin') {
      return [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
        { path: '/admin/companies', icon: Users,           label: t('admin.verifyCompanies') },
        { path: '/admin/users',     icon: Users,           label: t('admin.users') },
        { path: '/admin/contracts', icon: FileText,        label: t('admin.contracts') },
        { path: '/admin/disputes',  icon: MessageSquare,   label: t('admin.disputes') },
        { path: '/admin/alerts',    icon: Bell,            label: t('admin.alerts') },
        { path: '/admin/schemes',   icon: BookOpen,        label: t('admin.schemes') },
        { path: '/admin/profile',   icon: Settings,        label: t('common.profile') },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      <style>{`
        .sb-toggle {
          display: none;
          position: fixed; top: 16px; left: 16px; z-index: 50;
          width: 40px; height: 40px; border-radius: 11px;
          background: #1c3a1c; border: none;
          align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8;
          box-shadow: 0 3px 10px rgba(28,58,28,0.3);
          transition: background 0.15s;
        }
        .sb-toggle:hover { background: #2a5a2a; }
        @media (max-width: 1023px) { .sb-toggle { display: flex; } }

        .sb-overlay {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45); z-index: 30;
        }
        @media (max-width: 1023px) { .sb-overlay { display: block; } }

        .sb-root {
          position: fixed; left: 0; top: 0;
          height: 100%; width: 256px;
          background: #fff;
          border-right: 1px solid #e8e2da;
          box-shadow: 2px 0 12px rgba(0,0,0,0.06);
          z-index: 40;
          display: flex; flex-direction: column;
          transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
          font-family: 'DM Sans', sans-serif;
        }
        @media (max-width: 1023px) {
          .sb-root.closed { transform: translateX(-100%); }
          .sb-root.open   { transform: translateX(0); }
        }
        @media (min-width: 1024px) {
          .sb-root { transform: translateX(0) !important; }
        }

        /* logo area */
        .sb-logo {
          padding: 22px 20px 18px;
          border-bottom: 1px solid #e8e2da;
          display: flex; align-items: center; gap: 12px;
        }
        .sb-logo-icon {
          width: 40px; height: 40px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg, #52b788, #1c3a1c);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(28,58,28,0.25);
        }
        .sb-logo-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #1c2e1c;
          letter-spacing: -0.3px; margin-bottom: 1px;
        }
        .sb-logo-role {
          font-size: 10px; font-weight: 700; color: #9a9080;
          text-transform: uppercase; letter-spacing: 0.5px;
        }

        /* nav */
        .sb-nav {
          flex: 1; overflow-y: auto; padding: 10px 10px;
        }
        .sb-nav::-webkit-scrollbar { display: none; }

        .sb-nav-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 12px; border: none;
          background: transparent; cursor: pointer; text-align: left;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          color: #6a6055; transition: all 0.15s;
          margin-bottom: 2px;
        }
        .sb-nav-item:hover { background: #f7f3ee; color: #1c2e1c; }
        .sb-nav-item.active {
          background: #f0f7f2; color: #2d6a4f;
          border-right: 3px solid #2d6a4f;
        }
        .sb-nav-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: #f7f3ee; transition: background 0.15s;
        }
        .sb-nav-item.active .sb-nav-icon { background: #d8f3dc; }
        .sb-nav-item:hover:not(.active) .sb-nav-icon { background: #ede8e0; }

        /* logout */
        .sb-footer {
          padding: 12px 10px;
          border-top: 1px solid #e8e2da;
        }
        .sb-logout {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 12px; border: none;
          background: transparent; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
          color: #c0392b; transition: background 0.15s;
        }
        .sb-logout:hover { background: #fff5f5; }
        .sb-logout-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: #fff5f5;
        }
      `}</style>

      {/* Mobile toggle */}
      <button className="sb-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {isOpen && <div className="sb-overlay" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div className={`sb-root ${isOpen ? 'open' : 'closed'}`}>

        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-icon">
            <Sprout size={20} color="#fff" />
          </div>
          <div>
            <div className="sb-logo-name">AgroConnect</div>
            <div className="sb-logo-role">{role} Panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          {menuItems.map((item) => {
            const Icon    = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`sb-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => { navigate(item.path); setIsOpen(false); }}
              >
                <div className="sb-nav-icon">
                  <Icon size={16} color={isActive ? '#2d6a4f' : '#9a9080'} />
                </div>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="sb-footer">
          <button className="sb-logout" onClick={handleLogout}>
            <div className="sb-logout-icon">
              <LogOut size={15} color="#c0392b" />
            </div>
            {t('common.logout')}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;