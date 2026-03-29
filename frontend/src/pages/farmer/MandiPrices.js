import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, TrendingUp, Search, MapPin,
  ArrowUpDown, ArrowUp, ArrowDown,
  RefreshCw, X, ChevronDown, AlertCircle,
  Trophy, Calculator, BarChart2, ChevronLeft, ChevronRight,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import BottomNav from '../../components/common/BottomNav';
import useAuth from '../../hooks/useAuth';
import {
  fetchMandiPrices,
  formatMandiDate,
  formatINR,
  toPerKg,
  calcProfit,
} from '../../services/mandiService';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50;

const STATES = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const SORT_KEYS = ['modalPrice', 'minPrice', 'maxPrice', 'arrivalDate'];

// Crop name → emoji
const CROP_EMOJI_MAP = [
  ['apple',        '🍎'], ['banana',       '🍌'], ['mango',        '🥭'],
  ['grape',        '🍇'], ['pomegranate',  '🍎'], ['orange',       '🍊'],
  ['mousambi',     '🍋'], ['lime',         '🍋'], ['lemon',        '🍋'],
  ['watermelon',   '🍉'], ['papaya',       '🍈'], ['pineapple',    '🍍'],
  ['tomato',       '🍅'], ['onion',        '🧅'], ['potato',       '🥔'],
  ['garlic',       '🧄'], ['ginger',       '🫛'], ['carrot',       '🥕'],
  ['brinjal',      '🍆'], ['capsicum',     '🫑'], ['chilly',       '🌶️'],
  ['chilli',       '🌶️'], ['gourd',        '🥒'], ['pumpkin',      '🎃'],
  ['cauliflower',  '🥦'], ['cabbage',      '🥬'], ['spinach',      '🥬'],
  ['radish',       '🫚'], ['beetroot',     '🫐'], ['sweet potato', '🍠'],
  ['wheat',        '🌾'], ['rice',         '🍚'], ['paddy',        '🌾'],
  ['maize',        '🌽'], ['corn',         '🌽'], ['jowar',        '🌾'],
  ['bajra',        '🌾'], ['ragi',         '🌾'],
  ['soybean',      '🫘'], ['soya',         '🫘'], ['groundnut',    '🥜'],
  ['mustard',      '🌻'], ['sunflower',    '🌻'], ['cotton',       '🏵️'],
  ['turmeric',     '🫚'], ['coriander',    '🌿'],
  ['moong',        '🫘'], ['urad',         '🫘'], ['arhar',        '🫘'],
  ['tur',          '🫘'], ['gram',         '🫘'],
  ['sugarcane',    '🎋'],
];

const getCropEmoji = (name = '') => {
  const lower = name.toLowerCase();
  for (const [key, emoji] of CROP_EMOJI_MAP) {
    if (lower.includes(key)) return emoji;
  }
  return '🌾';
};

// ─── Price colour helper ──────────────────────────────────────────────────────

const modalPriceColor = (modal, min, max) => {
  if (!modal || !min || !max || min === max) return 'text-neutral-900';
  const mid = (min + max) / 2;
  if (modal >= mid * 1.05) return 'text-green-600';
  if (modal <= mid * 0.95) return 'text-red-500';
  return 'text-amber-600';
};

// ─── Price row sub-component ──────────────────────────────────────────────────

const PriceRow = React.memo(({ price, quantityKg, language, tr }) => {
  const color     = modalPriceColor(price.modalPrice, price.minPrice, price.maxPrice);
  const dateDisplay = formatMandiDate(price.arrivalDate, language);
  const perKg     = toPerKg(price.modalPrice);
  const totalVal  = calcProfit(price.modalPrice, quantityKg);
  const showVariety = price.variety && price.variety.toLowerCase() !== 'other';
  const showGrade   = price.grade   && price.grade.toLowerCase()   !== 'local';

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      {/* Main row */}
      <div className="p-4 flex items-start gap-3">
        {/* Emoji icon */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-amber-100/80">
          {getCropEmoji(price.commodity)}
        </div>

        {/* Commodity details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-neutral-900 capitalize text-base leading-tight">
            {price.commodity}
          </h3>
          {showVariety && (
            <p className="text-xs text-neutral-500 mt-0.5">
              {tr('variety')}: <span className="font-medium text-neutral-700 capitalize">{price.variety}</span>
            </p>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-neutral-500">
            <MapPin className="w-3 h-3 shrink-0 text-amber-500" />
            <span className="truncate">
              {price.market}
              {price.district && price.district !== price.market && `, ${price.district}`}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-neutral-400">📅 {dateDisplay}</span>
            {showGrade && (
              <span className="text-[10px] text-neutral-400 font-medium bg-neutral-100 px-2 py-0.5 rounded-full capitalize">
                {price.grade}
              </span>
            )}
          </div>
        </div>

        {/* Modal price — quintal + kg */}
        <div className="shrink-0 text-right pl-2">
          <div className={`text-xl font-bold tracking-tight ${color}`}>
            {formatINR(price.modalPrice)}
          </div>
          <div className="text-[10px] text-neutral-400 leading-tight">{tr('perQuintal')}</div>
          {perKg != null && (
            <div className="text-xs font-semibold text-neutral-500 mt-0.5">
              {formatINR(perKg, 2)} / kg
            </div>
          )}
        </div>
      </div>

      {/* Bottom bar: min / max / profit */}
      <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/50 border-t border-neutral-100/80 px-4 py-2 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <ArrowDown className="w-3 h-3 text-green-500 shrink-0" />
          <span className="text-xs text-neutral-600">
            {tr('minPrice')}:&nbsp;
            <span className="font-bold text-green-600">{formatINR(price.minPrice)}</span>
            <span className="text-neutral-400 ml-1">({formatINR(toPerKg(price.minPrice), 2)}/kg)</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowUp className="w-3 h-3 text-red-500 shrink-0" />
          <span className="text-xs text-neutral-600">
            {tr('maxPrice')}:&nbsp;
            <span className="font-bold text-red-500">{formatINR(price.maxPrice)}</span>
            <span className="text-neutral-400 ml-1">({formatINR(toPerKg(price.maxPrice), 2)}/kg)</span>
          </span>
        </div>
        {totalVal != null && quantityKg > 0 && (
          <div className="ml-auto flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-full">
            <Calculator className="w-3 h-3" />
            {formatINR(totalVal)} for {quantityKg} kg
          </div>
        )}
      </div>
    </div>
  );
});

PriceRow.displayName = 'PriceRow';

// ─── Best Mandi Banner ────────────────────────────────────────────────────────

const BestMandiBanner = ({ record, language, tr }) => {
  if (!record) return null;
  return (
    <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-2xl p-4 shadow-md mb-4">
      <div className="flex items-start gap-3">
        <div className="bg-white/30 w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-0.5">
            🏆 {tr('bestMandi')}
          </p>
          <h3 className="text-white font-bold text-base leading-tight capitalize">{record.commodity}</h3>
          <p className="text-white/90 text-xs mt-0.5 truncate">
            {record.market}, {record.district}
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-white font-bold text-xl">{formatINR(record.modalPrice)}</div>
          <div className="text-white/80 text-[10px]">{tr('perQuintal')}</div>
          <div className="text-white/90 text-xs font-semibold mt-0.5">{formatINR(toPerKg(record.modalPrice), 2)} / kg</div>
        </div>
      </div>
    </div>
  );
};

// ─── Trend Chart ──────────────────────────────────────────────────────────────

const TrendChart = ({ data, language, tr }) => {
  if (!data || data.length < 2) return null;
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-bold text-neutral-800">{tr('priceTrend')}</span>
        <span className="text-xs text-neutral-400 ml-1">{tr('avgModalPrice')}</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={(v) => {
              const d = new Date(v);
              return isNaN(d) ? v : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            }}
          />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} tickFormatter={(v) => `₹${v}`} />
          <Tooltip
            formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, tr('avgModalPrice')]}
            labelFormatter={(v) => {
              const d = new Date(v);
              return isNaN(d) ? v : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            }}
          />
          <Line type="monotone" dataKey="avgPrice" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Profit Calculator ────────────────────────────────────────────────────────

const ProfitCalculator = ({ quantityKg, onChange, tr }) => (
  <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-3 mb-4 flex items-center gap-3">
    <div className="bg-amber-50 w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
      <Calculator className="w-4 h-4 text-amber-600" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-neutral-500 font-medium">{tr('profitCalc')}</p>
      <p className="text-[10px] text-neutral-400">{tr('profitCalcHint')}</p>
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <input
        type="number"
        min="1"
        max="100000"
        value={quantityKg}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
        className="w-20 border border-amber-200 rounded-lg px-2 py-1.5 text-sm font-bold text-neutral-800 text-center focus:outline-none focus:ring-2 focus:ring-amber-300"
      />
      <span className="text-xs font-semibold text-neutral-600">kg</span>
    </div>
  </div>
);

// ─── Pagination ───────────────────────────────────────────────────────────────

const Pagination = ({ page, total, pageSize, loading, onPrev, onNext, tr }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-4 pb-2">
      <button
        onClick={onPrev}
        disabled={page === 0 || loading}
        className="flex items-center gap-1.5 bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40 hover:bg-neutral-50 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        {tr('prev')}
      </button>
      <span className="text-xs text-neutral-500">
        {tr('page')} {page + 1} / {totalPages}
        <span className="text-neutral-400 ml-1">({total} {tr('total')})</span>
      </span>
      <button
        onClick={onNext}
        disabled={(page + 1) * pageSize >= total || loading}
        className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl disabled:opacity-40 transition-colors"
      >
        {tr('next')}
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const MandiPrices = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const { user } = useAuth();
  const { language } = React.useContext(LanguageContext);

  const tr = useCallback((key) => t(`mandi.${key}`), [t]);

  // ── API / data state ────────────────────────────────────────────────────
  const [prices,      setPrices]      = useState([]);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── Pagination ──────────────────────────────────────────────────────────
  const [page, setPage] = useState(0);

  // ── Filter state ────────────────────────────────────────────────────────
  const [apiState,      setApiState]      = useState(user?.farmerDetails?.state    || '');
  const [apiDistrict,   setApiDistrict]   = useState(user?.farmerDetails?.district || '');
  const [districtInput, setDistrictInput] = useState(user?.farmerDetails?.district || '');

  // Client-side filters
  const [search,   setSearch]   = useState('');
  const [sortKey,  setSortKey]  = useState('modalPrice');
  const [sortDir,  setSortDir]  = useState('asc');

  // ── UI state ────────────────────────────────────────────────────────────
  const [quantityKg,   setQuantityKg]   = useState(100);
  const [showStateDD,  setShowStateDD]  = useState(false);
  const [showSortDD,   setShowSortDD]   = useState(false);
  const [showChart,    setShowChart]    = useState(false);
  const stateRef = useRef(null);
  const sortRef  = useRef(null);

  // ── Fetch ───────────────────────────────────────────────────────────────
  const loadPrices = useCallback(async (targetPage = 0) => {
    setLoading(true);
    setError(null);
    try {
      const { records, total: apiTotal } = await fetchMandiPrices({
        state:    apiState,
        district: apiDistrict,
        limit:    PAGE_SIZE,
        offset:   targetPage * PAGE_SIZE,
      });
      setPrices(records);
      setTotal(apiTotal);
      setPage(targetPage);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [apiState, apiDistrict]);

  useEffect(() => { loadPrices(0); }, [loadPrices]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (stateRef.current && !stateRef.current.contains(e.target)) setShowStateDD(false);
      if (sortRef.current  && !sortRef.current.contains(e.target))  setShowSortDD(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Apply district filter ────────────────────────────────────────────────
  const applyDistrict = () => setApiDistrict(districtInput.trim());

  // ── Client-side search + sort ────────────────────────────────────────────
  const displayPrices = useMemo(() => {
    let list = prices;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.commodity.toLowerCase().includes(q) ||
          p.market.toLowerCase().includes(q)    ||
          p.district.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (sortKey === 'arrivalDate') {
        const parse = (s) => {
          const [dd, mm, yyyy] = (s || '').split('/');
          return dd ? new Date(`${yyyy}-${mm}-${dd}`).getTime() : 0;
        };
        va = parse(va); vb = parse(vb);
      }
      if (va === vb) return 0;
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }, [prices, search, sortKey, sortDir]);

  // ── Best mandi ───────────────────────────────────────────────────────────
  const bestMandi = useMemo(() => {
    if (!displayPrices.length) return null;
    return displayPrices.reduce((best, cur) =>
      cur.modalPrice > (best?.modalPrice ?? 0) ? cur : best, null
    );
  }, [displayPrices]);

  // ── Trend data: avg modal price per date across all loaded records ────────
  const trendData = useMemo(() => {
    const byDate = {};
    for (const p of prices) {
      if (!p.arrivalDate || !p.modalPrice) continue;
      const [dd, mm, yyyy] = p.arrivalDate.split('/');
      if (!dd) continue;
      const key = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
      if (!byDate[key]) byDate[key] = { sum: 0, count: 0 };
      byDate[key].sum   += p.modalPrice;
      byDate[key].count += 1;
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { sum, count }]) => ({ date, avgPrice: Math.round(sum / count) }));
  }, [prices]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const clearFilters = () => {
    setSearch('');
    setApiState(user?.farmerDetails?.state    || '');
    setApiDistrict(user?.farmerDetails?.district || '');
    setDistrictInput(user?.farmerDetails?.district || '');
    setSortKey('modalPrice');
    setSortDir('asc');
  };

  const sortKeyLabel = {
    modalPrice:  tr('sortModal'),
    minPrice:    tr('sortMin'),
    maxPrice:    tr('sortMax'),
    arrivalDate: tr('sortDate'),
  };

  const hasActiveFilters =
    search.trim() ||
    apiState    !== (user?.farmerDetails?.state    || '') ||
    apiDistrict !== (user?.farmerDetails?.district || '');

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setShowSortDD(false);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pb-20">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-amber-600 via-orange-500 to-amber-700 text-white z-30">
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 bg-yellow-300 rounded-full blur-3xl" />
        </div>

        <div className="relative p-4 pb-5">
          {/* Title row */}
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-white/20 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-display font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                {tr('title')}
              </h1>
              <p className="text-amber-100 text-xs mt-0.5">{tr('subtitle')}</p>
            </div>
            <button
              onClick={() => setShowChart(v => !v)}
              className={`p-2.5 hover:bg-white/20 rounded-xl transition-colors ${showChart ? 'bg-white/20' : ''}`}
              title="Toggle trend chart"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => loadPrices(page)}
              disabled={loading}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder={tr('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-3 rounded-xl text-neutral-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/40 bg-white/95 shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* State dropdown */}
            <div className="relative" ref={stateRef}>
              <button
                onClick={() => { setShowStateDD(!showStateDD); setShowSortDD(false); }}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors min-w-[110px]"
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[80px]">{apiState || tr('allStates')}</span>
                <ChevronDown className="w-3 h-3 shrink-0" />
              </button>
              {showStateDD && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-2xl border border-neutral-100 z-50 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => { setApiState(''); setDistrictInput(''); setApiDistrict(''); setShowStateDD(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold rounded-t-2xl transition-colors ${!apiState ? 'bg-amber-50 text-amber-700' : 'text-neutral-500 hover:bg-neutral-50'}`}
                  >
                    {tr('allStates')}
                  </button>
                  {STATES.map((s) => (
                    <button
                      key={s}
                      onClick={() => { setApiState(s); setShowStateDD(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-amber-50 ${apiState === s ? 'bg-amber-50 text-amber-700 font-bold' : 'text-neutral-700'}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* District input */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2.5 flex-1 min-w-[100px] max-w-[150px]">
              <input
                type="text"
                placeholder={tr('districtPlaceholder')}
                value={districtInput}
                onChange={(e) => setDistrictInput(e.target.value)}
                onBlur={applyDistrict}
                onKeyDown={(e) => { if (e.key === 'Enter') { applyDistrict(); e.target.blur(); } }}
                className="bg-transparent text-white placeholder-white/60 text-xs font-semibold w-full focus:outline-none"
              />
              {districtInput && districtInput !== apiDistrict && (
                <button onClick={applyDistrict} className="text-white/70 hover:text-white shrink-0">
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative ml-auto" ref={sortRef}>
              <button
                onClick={() => { setShowSortDD(!showSortDD); setShowStateDD(false); }}
                className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{sortKeyLabel[sortKey]}</span>
                {sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              </button>
              {showSortDD && (
                <div className="absolute top-full right-0 mt-1 w-44 bg-white rounded-2xl shadow-2xl border border-neutral-100 z-50">
                  {SORT_KEYS.map((key) => (
                    <button
                      key={key}
                      onClick={() => toggleSort(key)}
                      className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-amber-50 transition-colors flex items-center justify-between ${sortKey === key ? 'bg-amber-50 text-amber-700 font-bold' : 'text-neutral-700'}`}
                    >
                      {sortKeyLabel[key]}
                      {sortKey === key && (
                        sortDir === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100 px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-neutral-500">
          {loading
            ? tr('loading')
            : `${displayPrices.length} ${tr('recordsFound')} (${total} ${tr('total')})`
          }
        </span>
        <div className="flex items-center gap-3">
          {lastUpdated && !loading && (
            <span className="text-xs text-neutral-400">
              {tr('lastUpdated')}: {lastUpdated.toLocaleTimeString(
                language === 'en' ? 'en-IN' : language === 'hi' ? 'hi-IN' : 'mr-IN',
                { hour: '2-digit', minute: '2-digit' }
              )}
            </span>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-xs text-amber-600 font-semibold hover:text-amber-700 flex items-center gap-1">
              <X className="w-3 h-3" />
              {tr('clearFilters')}
            </button>
          )}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3 mt-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-neutral-100 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-neutral-200 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-2/3" />
                    <div className="h-3 bg-neutral-100 rounded w-1/2" />
                    <div className="h-3 bg-neutral-100 rounded w-1/3" />
                  </div>
                  <div className="w-20 h-12 bg-neutral-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-red-400" />
            </div>
            <p className="font-bold text-neutral-800 mb-1">{tr('errorTitle')}</p>
            <p className="text-sm text-neutral-500 mb-5">{tr('errorHint')}</p>
            <button
              onClick={() => loadPrices(0)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {tr('retry')}
            </button>
          </div>

        ) : displayPrices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-amber-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-4 text-4xl">🌾</div>
            <p className="font-bold text-neutral-700 mb-1">{tr('noResults')}</p>
            <p className="text-sm text-neutral-500 mb-4">{tr('noResultsHint')}</p>
            <button onClick={clearFilters} className="text-sm text-amber-600 font-semibold underline">
              {tr('clearFilters')}
            </button>
          </div>

        ) : (
          <div className="animate-fade-in">
            {/* Best Mandi */}
            <BestMandiBanner record={bestMandi} language={language} tr={tr} />

            {/* Trend Chart */}
            {showChart && <TrendChart data={trendData} language={language} tr={tr} />}

            {/* Profit Calculator */}
            <ProfitCalculator quantityKg={quantityKg} onChange={setQuantityKg} tr={tr} />

            {/* Price cards */}
            <div className="space-y-3">
              {displayPrices.map((price, idx) => (
                <PriceRow
                  key={price.id || idx}
                  price={price}
                  quantityKg={quantityKg}
                  language={language}
                  tr={tr}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              total={total}
              pageSize={PAGE_SIZE}
              loading={loading}
              onPrev={() => loadPrices(page - 1)}
              onNext={() => loadPrices(page + 1)}
              tr={tr}
            />
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MandiPrices;