import React from 'react';
import { Bell, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <style>{`
        .nb-root {
          background: #fff;
          border-bottom: 1px solid #e8e2da;
          position: fixed; top: 0; right: 0; left: 0; z-index: 30;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
        }
        @media (min-width: 1024px) { .nb-root { left: 256px; } }

        .nb-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 22px;
        }

        .nb-welcome {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1c2e1c;
          margin-bottom: 2px; letter-spacing: -0.2px;
        }
        .nb-email { font-size: 12px; color: #9a9080; font-weight: 500; }

        .nb-actions { display: flex; align-items: center; gap: 8px; }

        .nb-icon-btn {
          position: relative;
          width: 38px; height: 38px; border-radius: 11px;
          background: #f7f3ee; border: 1px solid #e8e2da;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6a6055; transition: all 0.15s;
        }
        .nb-icon-btn:hover { background: #ede8e0; border-color: #c8bfb2; }

        .nb-bell-dot {
          position: absolute; top: 7px; right: 7px;
          width: 7px; height: 7px; border-radius: 50%;
          background: #c0392b; border: 1.5px solid #fff;
        }
      `}</style>

      <div className="nb-root">
        <div className="nb-inner">
          <div>
            <div className="nb-welcome">Welcome, {user?.name}</div>
            <div className="nb-email">{user?.email}</div>
          </div>

          <div className="nb-actions">
            <button className="nb-icon-btn">
              <Bell size={17} />
              <span className="nb-bell-dot" />
            </button>
            <button
              className="nb-icon-btn"
              onClick={() => navigate(`/${user?.role}/profile`)}
            >
              <User size={17} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;