import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Bell, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import AlertCard from '../../components/farmer/AlertCard';
import Loading from '../../components/common/Loading';
import alertService from '../../services/alertService';
import useAuth from '../../hooks/useAuth';

const Alerts = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getWeatherAlerts({
        district: user?.farmerDetails?.district,
        state:    user?.farmerDetails?.state,
      });
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .al-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .al-header {
          background: #1c3a1c;
          position: relative;
          overflow: hidden;
        }
        .al-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .al-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,195,107,0.1) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .al-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 32px; background: #f7f3ee;
          border-radius: 32px 32px 0 0; z-index: 2;
        }
        .al-header-inner {
          position: relative; z-index: 1;
          padding: 20px 18px 36px;
          display: flex; align-items: center; gap: 12px;
        }

        .al-back-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8;
          transition: background 0.15s;
        }
        .al-back-btn:hover { background: rgba(255,255,255,0.18); }

        .al-header-icon {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        }

        .al-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.3px; margin-bottom: 3px;
        }
        .al-subtitle {
          font-size: 12px; color: rgba(240,237,232,0.5); font-weight: 500;
        }

        /* ── BODY ── */
        .al-body { padding: 20px 16px 0; }

        /* mandi button */
        .al-mandi-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 14px; border-radius: 16px; border: none;
          background: linear-gradient(135deg, #f6b73c 0%, #e67e22 100%);
          color: #fff; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          box-shadow: 0 4px 16px rgba(230,126,34,0.3);
          transition: all 0.2s;
          margin-bottom: 16px;
        }
        .al-mandi-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(230,126,34,0.35);
        }
        .al-mandi-icon { flex-shrink: 0; transition: transform 0.2s; }
        .al-mandi-btn:hover .al-mandi-icon { transform: scale(1.12); }

        /* alerts list */
        .al-list { display: flex; flex-direction: column; gap: 12px; }

        /* empty state */
        .al-empty {
          background: #fff; border-radius: 20px; padding: 48px 24px;
          text-align: center; border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .al-empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: #f0ede8; border: 1px solid #e8e2da;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .al-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1c2e1c;
          margin-bottom: 6px;
        }
        .al-empty-sub {
          font-size: 13px; color: #9a9080; line-height: 1.55;
        }
      `}</style>

      <div className="al-root">

        {/* ── HEADER ── */}
        <header className="al-header">
          <div className="al-header-grain" />
          <div className="al-header-glow" />

          <div className="al-header-inner">
            <button className="al-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </button>
            {/* <div className="al-header-icon">
              <Bell size={18} color="#f0ede8" />
            </div> */}
            <div style={{ flex: 1 }}>
              <div className="al-title">{t('farmer.alerts')}</div>
              <div className="al-subtitle">{t('alerts.subtitle')}</div>
            </div>
          </div>

          <div className="al-header-arc" />
        </header>

        {/* ── BODY ── */}
        <div className="al-body">

          {/* Mandi prices CTA */}
          <button className="al-mandi-btn" onClick={() => navigate('/farmer/mandi-prices')}>
            <TrendingUp size={18} className="al-mandi-icon" />
            {t('alerts.viewMandi')}
          </button>

          {/* Alerts */}
          {loading ? (
            <div style={{ padding: '48px 0' }}>
              <Loading />
            </div>
          ) : alerts.length > 0 ? (
            <div className="al-list">
              {alerts.map((alert) => (
                <AlertCard key={alert._id} alert={alert} language={user?.language || 'en'} />
              ))}
            </div>
          ) : (
            <div className="al-empty">
              <div className="al-empty-icon">
                <AlertTriangle size={32} color="#b0a898" />
              </div>
              <div className="al-empty-title">{t('alerts.noAlerts')}</div>
              <div className="al-empty-sub">{t('alerts.noAlertsHint')}</div>
            </div>
          )}

        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default Alerts;