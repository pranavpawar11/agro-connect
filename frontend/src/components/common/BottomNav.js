import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Sprout, FileText, Bell, User,BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BottomNav = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { t }     = useTranslation();

  const navItems = [
    { path: '/farmer/home',            icon: Home,     label: t('farmer.home')           },
    { path: '/farmer/crop-prediction', icon: Sprout,   label: t('farmer.cropPrediction') },
    { path: '/farmer/contracts',       icon: FileText,  label: t('farmer.contracts')      },
    { path: '/farmer/schemes',          icon: BookOpen,      label: t('farmer.schemes')         },
    { path: '/farmer/profile',         icon: User,      label: t('common.profile')        },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&display=swap');

        .bn-root {
          position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
          font-family: 'DM Sans', sans-serif;
        }

        /* frosted bar */
        .bn-bar {
          background: rgba(252, 249, 244, 0.96);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid #e8e0d4;
          display: flex;
          align-items: stretch;
          height: 62px;
          max-width: 480px;
          margin: 0 auto;
          padding: 0 4px;
          position: relative;
        }

        /* nav button */
        .bn-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border: none;
          background: none;
          cursor: pointer;
          padding: 6px 4px;
          border-radius: 14px;
          position: relative;
          transition: all 0.18s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .bn-btn:active { transform: scale(0.92); }

        /* active pill background */
        .bn-btn.active {
          background: #f0f7f2;
        }

        /* icon wrapper */
        .bn-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
        }

        /* active dot indicator */
        .bn-btn.active .bn-icon-wrap::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #2d6a4f;
        }

        /* label */
        .bn-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1px;
          line-height: 1;
          transition: color 0.18s;
          white-space: nowrap;
        }
        .bn-btn.active  .bn-label { color: #2d6a4f; }
        .bn-btn.inactive .bn-label { color: #a09080; }
      `}</style>

      <nav className="bn-root">
        <div className="bn-bar">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                className={`bn-btn ${active ? 'active' : 'inactive'}`}
                onClick={() => navigate(path)}
              >
                <div className="bn-icon-wrap">
                  <Icon
                    size={21}
                    strokeWidth={active ? 2.2 : 1.7}
                    color={active ? '#2d6a4f' : '#b0a090'}
                  />
                </div>
                <span className="bn-label">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;