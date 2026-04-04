import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Package,
  IndianRupee, ChevronRight, MapPin, Calendar, Building,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import { formatDate, formatPrice } from '../../utils/helpers';

// ── Status config with new palette ───────────────────────────────────────────
const STATUS_CONFIG = {
  pending:  {
    bar: '#b87a00', badgeBg: '#fdf3e0', badgeText: '#8a6000',
    icon: Clock,       iconBg: '#fdf3e0', iconColor: '#b87a00',
    remarksBorder: '#f0d8a8', remarksBg: '#fdf6ea',
  },
  accepted: {
    bar: '#2d6a4f', badgeBg: '#d8f3dc', badgeText: '#2d6a4f',
    icon: CheckCircle, iconBg: '#d8f3dc', iconColor: '#2d6a4f',
    remarksBorder: '#c8dcc8', remarksBg: '#f0f7f2',
  },
  rejected: {
    bar: '#c0392b', badgeBg: '#fff5f5', badgeText: '#c0392b',
    icon: XCircle,     iconBg: '#ffe0e0', iconColor: '#c0392b',
    remarksBorder: '#f0d0d0', remarksBg: '#fff5f5',
  },
};

const FILTER_TABS = ['all', 'pending', 'accepted', 'rejected'];

const MyApplications = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();

  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await contractService.getFarmerApplications();
        setApplications(data.applications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = activeTab === 'all'
    ? applications
    : applications.filter((a) => a.status === activeTab);

  const handleView = (application) => {
    const contractId = application.contract?._id || application.contract;
    navigate(`/farmer/contracts/${contractId}`, { state: { myApplication: application } });
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ma-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .ma-header {
          background: #1c3a1c;
          position: relative; overflow: hidden;
        }
        .ma-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .ma-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,195,107,0.1) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .ma-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 32px; background: #f7f3ee;
          border-radius: 32px 32px 0 0; z-index: 2;
        }
        .ma-header-inner {
          position: relative; z-index: 1; padding: 20px 18px 36px;
          display: flex; align-items: center; gap: 12px;
        }
        .ma-back-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .ma-back-btn:hover { background: rgba(255,255,255,0.18); }
        .ma-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.3px; margin-bottom: 2px;
        }
        .ma-subtitle { font-size: 11px; color: rgba(240,237,232,0.5); font-weight: 500; }
        .ma-count-pill {
          background: rgba(255,255,255,0.15); color: #f0ede8;
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 99px;
          flex-shrink: 0;
        }

        /* ── BODY ── */
        .ma-body { padding: 20px 16px 0; }

        /* filter tabs */
        .ma-tabs {
          display: flex; gap: 8px; overflow-x: auto;
          padding-bottom: 4px; margin-bottom: 14px;
        }
        .ma-tabs::-webkit-scrollbar { display: none; }
        .ma-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 12px; border-radius: 10px;
          font-size: 12px; font-weight: 700;
          white-space: nowrap; flex-shrink: 0;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; border: none;
        }
        .ma-tab.active  { background: #1c3a1c; color: #f0ede8; }
        .ma-tab.inactive { background: #fff; color: #6a6055; border: 1px solid #e8e2da; }
        .ma-tab.inactive:hover { border-color: #2d6a4f; color: #2d6a4f; }
        .ma-tab-count {
          font-size: 10px; font-weight: 700;
          padding: 1px 6px; border-radius: 99px;
        }
        .ma-tab.active   .ma-tab-count { background: rgba(255,255,255,0.2); color: #f0ede8; }
        .ma-tab.inactive .ma-tab-count { background: #f0ede8; color: #9a9080; }

        /* application card */
        .ma-card {
          background: #fff; border-radius: 18px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 12px; overflow: hidden; cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .ma-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .ma-card-topbar { height: 4px; width: 100%; }
        .ma-card-body   { padding: 14px; }

        /* top row */
        .ma-top-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .ma-card-icon {
          width: 48px; height: 48px; border-radius: 13px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .ma-crop-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #1c2e1c;
          text-transform: capitalize; margin-bottom: 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ma-name-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
        }
        .ma-badge {
          flex-shrink: 0; display: flex; align-items: center; gap: 4px;
          font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 99px;
        }
        .ma-meta-row {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: #9a9080; margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* stats grid */
        .ma-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 10px; }
        .ma-stat {
          background: #f7f3ee; border-radius: 11px; padding: 10px;
          text-align: center;
        }
        .ma-stat-label { font-size: 10px; color: #9a9080; font-weight: 500; margin-bottom: 3px; }
        .ma-stat-val   { font-size: 13px; font-weight: 700; color: #1c2e1c; }
        .ma-stat-val.green { color: #2d6a4f; }

        /* company remarks */
        .ma-remarks {
          border-left: 3px solid transparent;
          border-radius: 0 10px 10px 0;
          padding: 10px 12px; margin-bottom: 10px;
        }
        .ma-remarks-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 3px; }
        .ma-remarks-text  { font-size: 11px; font-style: italic; line-height: 1.5; }

        /* footer */
        .ma-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding-top: 10px; border-top: 1px solid #f0ede8;
        }
        .ma-status-label { font-size: 11px; color: #9a9080; line-height: 1.35; }
        .ma-cta {
          display: flex; align-items: center; gap: 3px;
          font-size: 12px; font-weight: 700; color: #2d6a4f; flex-shrink: 0; margin-left: 8px;
        }

        /* empty state */
        .ma-empty {
          background: #fff; border-radius: 20px; padding: 48px 24px;
          text-align: center; border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .ma-empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: #f0ede8; border: 1px solid #e8e2da;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .ma-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1c2e1c; margin-bottom: 6px;
        }
        .ma-empty-sub { font-size: 13px; color: #9a9080; margin-bottom: 20px; line-height: 1.55; }
        .ma-empty-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 14px;
          background: #1c3a1c; border: none;
          color: #f0ede8; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
          box-shadow: 0 4px 14px rgba(28,58,28,0.25);
        }
        .ma-empty-btn:hover { background: #2a5a2a; }
      `}</style>

      <div className="ma-root">

        {/* ── HEADER ── */}
        <header className="ma-header">
          <div className="ma-header-grain" />
          <div className="ma-header-glow" />
          <div className="ma-header-inner">
            <button className="ma-back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ flex: 1 }}>
              <div className="ma-title">{t('applications.title')}</div>
              <div className="ma-subtitle">{t('applications.subtitle')}</div>
            </div>
            {!loading && applications.length > 0 && (
              <span className="ma-count-pill">{applications.length} {t('applications.total')}</span>
            )}
          </div>
          <div className="ma-header-arc" />
        </header>

        {/* ── BODY ── */}
        <div className="ma-body">

          {/* Filter tabs */}
          <div className="ma-tabs">
            {FILTER_TABS.map((tab) => {
              const count = tab === 'all'
                ? applications.length
                : applications.filter((a) => a.status === tab).length;
              return (
                <button
                  key={tab}
                  className={`ma-tab ${activeTab === tab ? 'active' : 'inactive'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' ? t('filterAll') : t(`applications.status.${tab}`)}
                  <span className="ma-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          {loading ? (
            <div style={{ padding: '48px 0' }}><Loading /></div>

          ) : filtered.length > 0 ? (
            filtered.map((application) => {
              const config     = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;
              const StatusIcon = config.icon;
              const contract   = application.contract;

              return (
                <div key={application._id} className="ma-card" onClick={() => handleView(application)}>

                  {/* colour bar */}
                  <div className="ma-card-topbar" style={{ background: config.bar }} />

                  <div className="ma-card-body">
                    {/* top row */}
                    <div className="ma-top-row">
                      <div className="ma-card-icon" style={{ background: config.iconBg }}>
                        <Package size={22} color={config.iconColor} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ma-name-row">
                          <div className="ma-crop-name">{contract?.cropType || t('common.notAvailable')}</div>
                          <span className="ma-badge" style={{ background: config.badgeBg, color: config.badgeText }}>
                            <StatusIcon size={10} />
                            {t(`applications.status.${application.status}`)}
                          </span>
                        </div>
                        <div className="ma-meta-row">
                          <Building size={11} style={{ flexShrink: 0 }} />
                          {contract?.company?.companyDetails?.companyName || t('common.notAvailable')}
                        </div>
                        {contract?.location && (
                          <div className="ma-meta-row">
                            <MapPin size={11} style={{ flexShrink: 0 }} />
                            {contract.location.district}, {contract.location.state}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* stats grid */}
                    <div className="ma-stats">
                      <div className="ma-stat">
                        <div className="ma-stat-label">{t('applications.quantity')}</div>
                        <div className="ma-stat-val">
                          {application.proposedQuantity}
                          <span style={{ fontSize: 10, fontWeight: 400, color: '#9a9080' }}> {contract?.unit}</span>
                        </div>
                      </div>
                      <div className="ma-stat">
                        <div className="ma-stat-label">{t('applications.pricePerUnit')}</div>
                        <div className="ma-stat-val green">₹{formatPrice(contract?.agreedPrice)}</div>
                      </div>
                      <div className="ma-stat">
                        <div className="ma-stat-label">{t('common.appliedOn')}</div>
                        <div className="ma-stat-val" style={{ fontSize: 11 }}>{formatDate(application.createdAt)}</div>
                      </div>
                    </div>

                    {/* company remarks */}
                    {application.companyRemarks && (
                      <div className="ma-remarks" style={{
                        borderLeftColor: config.bar,
                        background: config.remarksBg,
                      }}>
                        <div className="ma-remarks-label" style={{ color: config.badgeText }}>
                          {t('applications.companyRemarks')}
                        </div>
                        <div className="ma-remarks-text" style={{ color: config.badgeText }}>
                          "{application.companyRemarks}"
                        </div>
                      </div>
                    )}

                    {/* footer */}
                    <div className="ma-card-footer">
                      <span className="ma-status-label">{t(`applications.statusLabel.${application.status}`)}</span>
                      <span className="ma-cta">
                        {t('contract.viewDetails')}
                        <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })

          ) : (
            <div className="ma-empty">
              <div className="ma-empty-icon">
                <Clock size={32} color="#b0a898" />
              </div>
              <div className="ma-empty-title">{t('applications.noApplications')}</div>
              <div className="ma-empty-sub">{t('applications.noApplicationsHint')}</div>
              <button className="ma-empty-btn" onClick={() => navigate('/farmer/contracts')}>
                {t('applications.browseContracts')}
              </button>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default MyApplications;