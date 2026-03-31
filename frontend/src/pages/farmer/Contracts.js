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
  approved:    'from-blue-500 to-cyan-500',
  active:      'from-success-500 to-success-600',
  in_progress: 'from-purple-500 to-violet-600',
  completed:   'from-neutral-400 to-neutral-500',
  pending:     'from-warning-500 to-warning-600',
  cancelled:   'from-danger-500 to-danger-600',
};

const APP_BADGE = {
  pending:  'bg-blue-100 text-blue-700',
  accepted: 'bg-success-100 text-success-700',
  rejected: 'bg-danger-100 text-danger-700',
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

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden cursor-pointer"
    >
      {/* Colour top bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${STATUS_BAR[contract.status] || STATUS_BAR.pending}`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Crop emoji */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-primary-100">
            {getCropEmoji(contract.cropType)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-neutral-900 capitalize text-base leading-tight truncate">
                {contract.cropType}
              </h3>
              {/* Applied status badge */}
              {appStatus && (
                <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full ${APP_BADGE[appStatus] || APP_BADGE.pending}`}>
                  {t(`applications.status.${appStatus}`)}
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1 truncate">
              <Building className="w-3 h-3 shrink-0" />
              {contract.company?.companyDetails?.companyName || t('common.notAvailable')}
            </p>
            <p className="text-xs text-neutral-400 mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              {contract.location?.district}, {contract.location?.state}
            </p>
          </div>
        </div>

        {/* Price / Qty / Duration */}
        <div className="mt-3 pt-3 border-t border-neutral-50 grid grid-cols-3 gap-2">
          <div>
            <p className="text-[10px] text-neutral-400 mb-0.5">{t('contractDetail.price')}</p>
            <p className="text-sm font-bold text-success-700 flex items-center gap-0.5">
              <IndianRupee className="w-3 h-3" />
              {formatPrice(contract.agreedPrice)}
              <span className="text-[10px] font-normal text-neutral-400">/{contract.unit}</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 mb-0.5">{t('contractDetail.quantity')}</p>
            <p className="text-sm font-bold text-neutral-800">{contract.quantity} {contract.unit}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 mb-0.5">{t('contract.duration')}</p>
            <p className="text-xs font-medium text-neutral-600">{formatDate(contract.duration?.startDate)}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-neutral-50 px-4 py-2 flex items-center justify-between border-t border-neutral-100">
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white bg-gradient-to-r ${STATUS_BAR[contract.status] || STATUS_BAR.pending}`}>
          {t(`contract.status.${contract.status}`)}
        </span>
        <span className="text-xs text-primary-600 font-semibold flex items-center gap-1">
          {appStatus ? t('contract.viewDetails') : t('contract.apply')}
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const Contracts = () => {
  const navigate            = useNavigate();
  const { t }               = useTranslation();
  const { user }            = useAuth();
  const { language }        = React.useContext(LanguageContext);

  const [contracts,      setContracts]      = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [searchTerm,     setSearchTerm]     = useState('');
  const [showFilters,    setShowFilters]    = useState(false);
  const [activeStatus,   setActiveStatus]   = useState('all');

  const [filters, setFilters] = useState({
    cropType: '',
    district: '',
    state:    '',
    minPrice: '',
    maxPrice: '',
  });

  // ── Fetch contracts + farmer's own applications in parallel ───────────────
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

  // ── contractId → application lookup map ──────────────────────────────────
  const appMap = useMemo(() => {
    const map = {};
    myApplications.forEach((app) => {
      const cid = app.contract?._id || app.contract;
      if (cid) map[String(cid)] = app;
    });
    return map;
  }, [myApplications]);

  // ── Client-side filter + search ───────────────────────────────────────────
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
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-64 h-64 bg-primary-300 rounded-full blur-3xl" />
        </div>

        <div className="relative p-4">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold">{t('farmer.contracts')}</h1>
              <p className="text-primary-100 text-xs mt-0.5">{t('contract.Browsefarmingopportunities')}</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('contract.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl text-neutral-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/95 shadow-sm"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full glass-effect backdrop-blur-sm border border-white/30 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/30 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4" />
            {t('contract.filters')}
            {hasActiveFilters && (
              <span className="bg-secondary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {t('contract.active')}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── Filter Panel ───────────────────────────────────────────────── */}
      {showFilters && (
        <div className="mx-4 mt-3 bg-white rounded-2xl shadow-lg border border-neutral-200 overflow-hidden animate-slide-down">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-4 py-3 flex items-center justify-between border-b border-primary-200">
            <h3 className="font-bold text-primary-900 flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4" />
              {t('contract.filterContracts')}
            </h3>
            <button onClick={() => setShowFilters(false)} className="p-1.5 hover:bg-primary-200 rounded-lg">
              <X className="w-4 h-4 text-primary-700" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-600 mb-1.5">{t('contract.cropType')}</label>
              <input type="text" value={filters.cropType}
                onChange={(e) => setFilters({ ...filters, cropType: e.target.value })}
                placeholder={t('contract.cropPlaceholder')}
                className="w-full px-3 py-2.5 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm font-medium outline-none transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">{t('contract.district')}</label>
                <input type="text" value={filters.district}
                  onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm font-medium outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">{t('contract.state')}</label>
                <input type="text" value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">{t('contract.minPrice')}</label>
                <input type="number" value={filters.minPrice} placeholder="₹"
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm font-medium outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-600 mb-1.5">{t('contract.maxPrice')}</label>
                <input type="number" value={filters.maxPrice} placeholder="₹"
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2.5 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm font-medium outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={clearFilters}
                className="flex-1 bg-neutral-100 text-neutral-700 py-2.5 rounded-xl font-bold text-sm hover:bg-neutral-200 transition-colors">
                {t('contract.clearAll')}
              </button>
              <button onClick={() => setShowFilters(false)}
                className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md transition-all">
                {t('contract.applyFilters')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="p-4 space-y-4">

        {/* My Applications quick link */}
        <button
          onClick={() => navigate('/farmer/applications')}
          className="group w-full bg-white border-2 border-primary-200 text-primary-800 py-3.5 rounded-2xl font-bold shadow-sm hover:shadow-md hover:border-primary-400 transition-all flex items-center justify-between px-4"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <span>{t('farmer.applications')}</span>
            {myApplications.length > 0 && (
              <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {myApplications.length}
              </span>
            )}
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Status tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
          {STATUS_TABS.map((status) => (
            <button
              key={status}
              onClick={() => setActiveStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all shrink-0 ${
                activeStatus === status
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-md'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary-300'
              }`}
            >
              {status === 'all' ? t('filterAll') : t(`contract.status.${status}`)}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-neutral-500 px-1">
            {filteredContracts.length} {t('contract.contractsFound')}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="ml-2 text-primary-600 font-semibold underline">
                {t('contract.clearAll')}
              </button>
            )}
          </p>
        )}

        {/* List */}
        {loading ? (
          <div className="py-12"><Loading /></div>
        ) : filteredContracts.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {filteredContracts.map((contract) => {
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
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 shadow-sm">
            <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-700 font-bold mb-1">{t('contract.noContracts')}</p>
            {(searchTerm || hasActiveFilters) && (
              <button onClick={clearFilters} className="mt-3 text-primary-600 font-bold text-sm underline">
                {t('contract.clearAll')}
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Contracts;