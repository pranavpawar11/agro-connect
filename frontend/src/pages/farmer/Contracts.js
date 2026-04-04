import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Filter, Search, X, ChevronRight, FileText,
  SlidersHorizontal, MapPin, IndianRupee, Package,
  CheckCircle, Clock, Building, ChevronDown, XCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import contractService from '../../services/contractService';
import useAuth from '../../hooks/useAuth';
import { formatDate, formatPrice } from '../../utils/helpers';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUS_TABS = ['all', 'approved', 'active', 'in_progress', 'completed'];

const STATUS_BAR = {
  approved:    { bar: '#1d4e89', bg: '#dbeafe', text: '#1d4e89' },
  active:      { bar: '#2d6a4f', bg: '#d8f3dc', text: '#2d6a4f' },
  in_progress: { bar: '#5b21b6', bg: '#ede9fe', text: '#5b21b6' },
  completed:   { bar: '#6a6055', bg: '#f0ede8', text: '#6a6055' },
  pending:     { bar: '#b87a00', bg: '#fdf3e0', text: '#8a6000' },
  cancelled:   { bar: '#c0392b', bg: '#fff5f5', text: '#c0392b' },
};

const APP_BADGE = {
  pending:  { bg: '#dbeafe', text: '#1d4e89' },
  accepted: { bg: '#d8f3dc', text: '#2d6a4f' },
  rejected: { bg: '#fff5f5', text: '#c0392b' },
};

const CROP_EMOJI_MAP = [
  ['wheat','🌾'],['rice','🍚'],['paddy','🌾'],['maize','🌽'],['cotton','🏵️'],
  ['tomato','🍅'],['onion','🧅'],['potato','🥔'],['banana','🍌'],['mango','🥭'],
  ['soybean','🫘'],['groundnut','🥜'],['sugarcane','🎋'],['chilli','🌶️'],
  ['garlic','🧄'],['ginger','🫛'],['carrot','🥕'],['grape','🍇'],['apple','🍎'],
];
const getCropEmoji = (name = '') => {
  const lower = name.toLowerCase();
  for (const [k, e] of CROP_EMOJI_MAP) if (lower.includes(k)) return e;
  return '🌾';
};

// ── Contract Card ─────────────────────────────────────────────────────────────
const ContractCard = ({ contract, myApplication, onClick }) => {
  const { t } = useTranslation();
  const appStatus = myApplication?.status;
  const statusMeta = STATUS_BAR[contract.status] || STATUS_BAR.pending;
  const appBadge   = APP_BADGE[appStatus]         || APP_BADGE.pending;

  return (
    <div onClick={onClick} className="ct-card">
      {/* colour top bar */}
      <div className="ct-card-topbar" style={{ background: statusMeta.bar }} />

      <div className="ct-card-body">
        <div className="ct-card-row">
          {/* emoji */}
          <div className="ct-emoji-wrap">
            {getCropEmoji(contract.cropType)}
          </div>

          <div className="ct-card-info">
            <div className="ct-card-name-row">
              <h3 className="ct-crop-name">{contract.cropType}</h3>
              {appStatus && (
                <span className="ct-app-badge" style={{ background: appBadge.bg, color: appBadge.text }}>
                  {t(`applications.status.${appStatus}`)}
                </span>
              )}
            </div>
            <p className="ct-meta-row">
              <Building size={11} style={{ flexShrink: 0 }} />
              {contract.company?.companyDetails?.companyName || t('common.notAvailable')}
            </p>
            <p className="ct-meta-row">
              <MapPin size={11} style={{ flexShrink: 0 }} />
              {contract.location?.district}, {contract.location?.state}
            </p>
          </div>
        </div>

        {/* stats strip */}
        <div className="ct-stats-strip">
          <div className="ct-stat">
            <span className="ct-stat-label">{t('contractDetail.price')}</span>
            <span className="ct-stat-val" style={{ color: '#2d6a4f' }}>
              ₹{formatPrice(contract.agreedPrice)}
              <em>/{contract.unit}</em>
            </span>
          </div>
          <div className="ct-stat">
            <span className="ct-stat-label">{t('contractDetail.quantity')}</span>
            <span className="ct-stat-val">{contract.quantity} {contract.unit}</span>
          </div>
          <div className="ct-stat">
            <span className="ct-stat-label">{t('contract.duration')}</span>
            <span className="ct-stat-val" style={{ fontSize: 11 }}>{formatDate(contract.duration?.startDate)}</span>
          </div>
        </div>
      </div>

      {/* footer */}
      <div className="ct-card-footer">
        <span className="ct-status-pill" style={{ background: statusMeta.bg, color: statusMeta.text }}>
          {t(`contract.status.${contract.status}`)}
        </span>
        <span className="ct-footer-cta">
          {appStatus ? t('contract.viewDetails') : t('contract.apply')}
          <ChevronRight size={13} />
        </span>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Contracts = () => {
  const navigate     = useNavigate();
  const { t }        = useTranslation();
  const { user }     = useAuth();
  const { language } = React.useContext(LanguageContext);

  const [contracts,      setContracts]      = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [showFilters,    setShowFilters]    = useState(false);
  const [activeStatus,   setActiveStatus]   = useState('all');

  const [filters, setFilters] = useState({
    cropType: '', district: '', state: '', minPrice: '', maxPrice: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = {};
      if (activeStatus !== 'all') queryParams.status = activeStatus;
      const [contractsRes, appsRes] = await Promise.all([
        contractService.getAllContracts(queryParams),
        contractService.getFarmerApplications(),
      ]);
      setContracts(contractsRes.contracts || []);
      setMyApplications(appsRes.applications || []);
    } catch (err) {
      console.error('Error loading contracts:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const appMap = useMemo(() => {
    const map = {};
    myApplications.forEach((app) => {
      const cid = app.contract?._id || app.contract;
      if (cid) map[String(cid)] = app;
    });
    return map;
  }, [myApplications]);

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        c.cropType?.toLowerCase().includes(q) ||
        c.company?.companyDetails?.companyName?.toLowerCase().includes(q) ||
        c.location?.district?.toLowerCase().includes(q) ||
        c.location?.state?.toLowerCase().includes(q);
      const matchCrop     = !filters.cropType || c.cropType?.toLowerCase().includes(filters.cropType.toLowerCase());
      const matchDistrict = !filters.district  || c.location?.district?.toLowerCase().includes(filters.district.toLowerCase());
      const matchState    = !filters.state     || c.location?.state?.toLowerCase().includes(filters.state.toLowerCase());
      const matchMin      = !filters.minPrice  || c.agreedPrice >= parseFloat(filters.minPrice);
      const matchMax      = !filters.maxPrice  || c.agreedPrice <= parseFloat(filters.maxPrice);
      return matchSearch && matchCrop && matchDistrict && matchState && matchMin && matchMax;
    });
  }, [contracts, searchTerm, filters]);

  const hasActiveFilters = !!(filters.cropType || filters.district || filters.state || filters.minPrice || filters.maxPrice);

  const clearFilters = () => {
    setFilters({ cropType: '', district: '', state: '', minPrice: '', maxPrice: '' });
    setSearchTerm('');
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ct-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .ct-header {
          background: #1c3a1c;
          position: relative; overflow: hidden; z-index: 30;
        }
        .ct-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .ct-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,195,107,0.1) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .ct-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 32px; background: #f7f3ee;
          border-radius: 32px 32px 0 0; z-index: 2;
        }
        .ct-header-inner { position: relative; z-index: 1; padding: 20px 18px 36px; }

        .ct-title-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 18px;
        }
        .ct-back-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .ct-back-btn:hover { background: rgba(255,255,255,0.18); }
        .ct-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.3px; margin-bottom: 2px;
        }
        .ct-subtitle { font-size: 11px; color: rgba(240,237,232,0.5); font-weight: 500; }

        /* search */
        .ct-search-wrap { position: relative; margin-bottom: 10px; }
        .ct-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .ct-search-input {
          width: 100%; padding: 11px 38px;
          background: rgba(255,255,255,0.95); border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #1c2e1c;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .ct-search-input::placeholder { color: #b0a890; }
        .ct-search-input:focus { outline: none; box-shadow: 0 2px 12px rgba(0,0,0,0.18); }
        .ct-search-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #9a9080;
          display: flex; align-items: center;
        }

        /* filter toggle */
        .ct-filter-toggle {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 14px; border-radius: 12px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.16);
          color: #f0ede8; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .ct-filter-toggle:hover { background: rgba(255,255,255,0.18); }
        .ct-filter-active-pill {
          background: #b87a00; color: #fff;
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px;
        }
        .ct-chevron { transition: transform 0.2s; }
        .ct-chevron.open { transform: rotate(180deg); }

        /* ── FILTER PANEL ── */
        .ct-filter-panel {
          margin: 0 16px 14px;
          background: #fff; border-radius: 18px;
          border: 1px solid #e8e2da;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        .ct-filter-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 13px 16px; background: #f0f7f2;
          border-bottom: 1px solid #c8dcc8;
        }
        .ct-filter-head-title {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 700; color: #1c2e1c;
        }
        .ct-filter-close {
          width: 28px; height: 28px; border-radius: 8px;
          background: none; border: 1px solid #c8dcc8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #6a6055; transition: background 0.15s;
        }
        .ct-filter-close:hover { background: #d8f3dc; }
        .ct-filter-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .ct-field-label {
          font-size: 11px; font-weight: 700; color: #6a6055;
          text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 5px;
        }
        .ct-field-input {
          width: 100%; background: #fff;
          border: 1.5px solid #ddd5c8; border-radius: 10px;
          padding: 9px 12px; font-size: 13px; font-weight: 500; color: #1c2e1c;
          font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.15s;
        }
        .ct-field-input:focus { border-color: #2d6a4f; }
        .ct-field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .ct-filter-actions { display: flex; gap: 10px; padding-top: 4px; }
        .ct-btn-clear-filter {
          flex: 1; padding: 10px; border-radius: 11px;
          background: #f7f3ee; border: 1.5px solid #e8e2da;
          color: #6a6055; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .ct-btn-clear-filter:hover { background: #ede8e0; }
        .ct-btn-apply-filter {
          flex: 1; padding: 10px; border-radius: 11px;
          background: #1c3a1c; border: none;
          color: #f0ede8; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
          box-shadow: 0 3px 10px rgba(28,58,28,0.2);
        }
        .ct-btn-apply-filter:hover { background: #2a5a2a; }

        /* ── BODY ── */
        .ct-body { padding: 20px 16px 0; }

        /* my applications link */
        .ct-apps-link {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          padding: 14px 16px; border-radius: 16px;
          background: #fff; border: 1.5px solid #c8dcc8;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; margin-bottom: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .ct-apps-link:hover { border-color: #2d6a4f; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .ct-apps-link-left {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; font-weight: 700; color: #1c2e1c;
        }
        .ct-apps-count {
          background: #1c3a1c; color: #f0ede8;
          font-size: 11px; font-weight: 700;
          padding: 2px 8px; border-radius: 99px;
        }
        .ct-apps-arrow { transition: transform 0.15s; color: #9a9080; }
        .ct-apps-link:hover .ct-apps-arrow { transform: translateX(3px); }

        /* status tabs */
        .ct-tabs {
          display: flex; gap: 8px;
          overflow-x: auto; padding-bottom: 4px; margin-bottom: 12px;
        }
        .ct-tabs::-webkit-scrollbar { display: none; }
        .ct-tab {
          padding: 7px 14px; border-radius: 10px;
          font-size: 12px; font-weight: 700;
          white-space: nowrap; flex-shrink: 0;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; border: none;
        }
        .ct-tab.active { background: #1c3a1c; color: #f0ede8; }
        .ct-tab.inactive { background: #fff; color: #6a6055; border: 1px solid #e8e2da; }
        .ct-tab.inactive:hover { border-color: #2d6a4f; color: #2d6a4f; }

        /* results count */
        .ct-results-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 12px; color: #9a9080; margin-bottom: 12px;
        }
        .ct-clear-link {
          background: none; border: none; cursor: pointer;
          color: #b87a00; font-size: 12px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; text-decoration: underline;
        }

        /* ── CONTRACT CARD ── */
        .ct-card {
          background: #fff; border-radius: 18px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 12px; overflow: hidden; cursor: pointer;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .ct-card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .ct-card-topbar { height: 4px; width: 100%; }
        .ct-card-body { padding: 14px; }
        .ct-card-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
        .ct-emoji-wrap {
          width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
          background: #fdf8f0; border: 1px solid #ede8e0;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
        }
        .ct-card-info { flex: 1; min-width: 0; }
        .ct-card-name-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
          margin-bottom: 4px;
        }
        .ct-crop-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #1c2e1c;
          text-transform: capitalize; line-height: 1.2;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ct-app-badge {
          flex-shrink: 0; font-size: 10px; font-weight: 700;
          padding: 3px 9px; border-radius: 99px;
        }
        .ct-meta-row {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: #9a9080; margin-top: 3px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* stats strip */
        .ct-stats-strip {
          display: grid; grid-template-columns: repeat(3,1fr);
          border-top: 1px solid #f0ede8; padding-top: 12px; gap: 4px;
        }
        .ct-stat {}
        .ct-stat-label { font-size: 10px; color: #b0a898; font-weight: 500; margin-bottom: 3px; }
        .ct-stat-val {
          font-size: 13px; font-weight: 700; color: #1c2e1c;
          display: flex; align-items: baseline; gap: 2px;
        }
        .ct-stat-val em { font-size: 10px; font-weight: 400; color: #b0a898; font-style: normal; }

        /* card footer */
        .ct-card-footer {
          background: #fdf8f0; border-top: 1px solid #ede8e0;
          padding: 9px 14px; display: flex; align-items: center; justify-content: space-between;
        }
        .ct-status-pill {
          font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 99px;
          text-transform: capitalize;
        }
        .ct-footer-cta {
          display: flex; align-items: center; gap: 3px;
          font-size: 12px; font-weight: 700; color: #2d6a4f;
        }

        /* ── EMPTY STATE ── */
        .ct-empty {
          background: #fff; border-radius: 20px; padding: 48px 24px;
          text-align: center; border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .ct-empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: #f0ede8; border: 1px solid #e8e2da;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .ct-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700; color: #1c2e1c; margin-bottom: 6px;
        }
      `}</style>

      <div className="ct-root">

        {/* ── HEADER ── */}
        <header className="ct-header">
          <div className="ct-header-grain" />
          <div className="ct-header-glow" />
          <div className="ct-header-inner">

            <div className="ct-title-row">
              <button className="ct-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
              </button>
              <div style={{ flex: 1 }}>
                <div className="ct-title">{t('farmer.contracts')}</div>
                <div className="ct-subtitle">{t('contract.Browsefarmingopportunities')}</div>
              </div>
            </div>

            {/* Search */}
            <div className="ct-search-wrap">
              <Search size={15} color="#9a9080" className="ct-search-icon" />
              <input
                type="text"
                className="ct-search-input"
                placeholder={t('contract.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="ct-search-clear" onClick={() => setSearchTerm('')}>
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button className="ct-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={15} />
              {t('contract.filters')}
              {hasActiveFilters && (
                <span className="ct-filter-active-pill">{t('contract.active')}</span>
              )}
              <ChevronDown size={14} className={`ct-chevron ${showFilters ? 'open' : ''}`} />
            </button>
          </div>
          <div className="ct-header-arc" />
        </header>

        {/* ── FILTER PANEL ── */}
        {showFilters && (
          <div className="ct-filter-panel">
            <div className="ct-filter-head">
              <div className="ct-filter-head-title">
                <Filter size={14} color="#2d6a4f" />
                {t('contract.filterContracts')}
              </div>
              <button className="ct-filter-close" onClick={() => setShowFilters(false)}>
                <X size={13} />
              </button>
            </div>
            <div className="ct-filter-body">
              <div>
                <div className="ct-field-label">{t('contract.cropType')}</div>
                <input className="ct-field-input" type="text" value={filters.cropType}
                  placeholder={t('contract.cropPlaceholder')}
                  onChange={(e) => setFilters({ ...filters, cropType: e.target.value })} />
              </div>
              <div className="ct-field-grid">
                <div>
                  <div className="ct-field-label">{t('contract.district')}</div>
                  <input className="ct-field-input" type="text" value={filters.district}
                    onChange={(e) => setFilters({ ...filters, district: e.target.value })} />
                </div>
                <div>
                  <div className="ct-field-label">{t('contract.state')}</div>
                  <input className="ct-field-input" type="text" value={filters.state}
                    onChange={(e) => setFilters({ ...filters, state: e.target.value })} />
                </div>
              </div>
              <div className="ct-field-grid">
                <div>
                  <div className="ct-field-label">{t('contract.minPrice')}</div>
                  <input className="ct-field-input" type="number" value={filters.minPrice} placeholder="₹"
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                </div>
                <div>
                  <div className="ct-field-label">{t('contract.maxPrice')}</div>
                  <input className="ct-field-input" type="number" value={filters.maxPrice} placeholder="₹"
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                </div>
              </div>
              <div className="ct-filter-actions">
                <button className="ct-btn-clear-filter" onClick={clearFilters}>{t('contract.clearAll')}</button>
                <button className="ct-btn-apply-filter" onClick={() => setShowFilters(false)}>{t('contract.applyFilters')}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── BODY ── */}
        <div className="ct-body">

          {/* My applications link */}
          <button className="ct-apps-link" onClick={() => navigate('/farmer/applications')}>
            <div className="ct-apps-link-left">
              <FileText size={18} color="#2d6a4f" />
              {t('farmer.applications')}
              {myApplications.length > 0 && (
                <span className="ct-apps-count">{myApplications.length}</span>
              )}
            </div>
            <ChevronRight size={18} className="ct-apps-arrow" />
          </button>

          {/* Status tabs */}
          <div className="ct-tabs">
            {STATUS_TABS.map((status) => (
              <button
                key={status}
                className={`ct-tab ${activeStatus === status ? 'active' : 'inactive'}`}
                onClick={() => setActiveStatus(status)}
              >
                {status === 'all' ? t('filterAll') : t(`contract.status.${status}`)}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!loading && (
            <div className="ct-results-row">
              <span>{filteredContracts.length} {t('contract.contractsFound')}</span>
              {hasActiveFilters && (
                <button className="ct-clear-link" onClick={clearFilters}>{t('contract.clearAll')}</button>
              )}
            </div>
          )}

          {/* List */}
          {loading ? (
            <div style={{ padding: '48px 0' }}><Loading /></div>
          ) : filteredContracts.length > 0 ? (
            filteredContracts.map((contract) => {
              const myApp = appMap[String(contract._id)];
              return (
                <ContractCard
                  key={contract._id}
                  contract={contract}
                  myApplication={myApp || null}
                  onClick={() => navigate(`/farmer/contracts/${contract._id}`, {
                    state: { myApplication: myApp || null }
                  })}
                />
              );
            })
          ) : (
            <div className="ct-empty">
              <div className="ct-empty-icon">
                <FileText size={32} color="#b0a898" />
              </div>
              <div className="ct-empty-title">{t('contract.noContracts')}</div>
              {(searchTerm || hasActiveFilters) && (
                <button className="ct-clear-link" onClick={clearFilters} style={{ marginTop: 12 }}>
                  {t('contract.clearAll')}
                </button>
              )}
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default Contracts;