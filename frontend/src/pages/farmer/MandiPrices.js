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

/* ─── Constants (unchanged) ─────────────────────────────────────────────── */
const PAGE_SIZE = 50;

const STATES = [
  'Andhra Pradesh','Bihar','Chhattisgarh','Gujarat','Haryana',
  'Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu',
  'Telangana','Uttar Pradesh','Uttarakhand','West Bengal',
];

const SORT_KEYS = ['modalPrice','minPrice','maxPrice','arrivalDate'];

const CROP_EMOJI_MAP = [
  ['apple','🍎'],['banana','🍌'],['mango','🥭'],['grape','🍇'],
  ['pomegranate','🍎'],['orange','🍊'],['mousambi','🍋'],['lime','🍋'],
  ['lemon','🍋'],['watermelon','🍉'],['papaya','🍈'],['pineapple','🍍'],
  ['tomato','🍅'],['onion','🧅'],['potato','🥔'],['garlic','🧄'],
  ['ginger','🫛'],['carrot','🥕'],['brinjal','🍆'],['capsicum','🫑'],
  ['chilly','🌶️'],['chilli','🌶️'],['gourd','🥒'],['pumpkin','🎃'],
  ['cauliflower','🥦'],['cabbage','🥬'],['spinach','🥬'],['radish','🫚'],
  ['beetroot','🫐'],['sweet potato','🍠'],['wheat','🌾'],['rice','🍚'],
  ['paddy','🌾'],['maize','🌽'],['corn','🌽'],['jowar','🌾'],['bajra','🌾'],
  ['ragi','🌾'],['soybean','🫘'],['soya','🫘'],['groundnut','🥜'],
  ['mustard','🌻'],['sunflower','🌻'],['cotton','🏵️'],['turmeric','🫚'],
  ['coriander','🌿'],['moong','🫘'],['urad','🫘'],['arhar','🫘'],
  ['tur','🫘'],['gram','🫘'],['sugarcane','🎋'],
];
const getCropEmoji = (name='') => {
  const lower = name.toLowerCase();
  for (const [key, emoji] of CROP_EMOJI_MAP) if (lower.includes(key)) return emoji;
  return '🌾';
};

const modalPriceColor = (modal, min, max) => {
  if (!modal||!min||!max||min===max) return '#4a4035';
  const mid = (min+max)/2;
  if (modal >= mid*1.05) return '#2d6a4f';
  if (modal <= mid*0.95) return '#c0392b';
  return '#8a6000';
};

/* ─── Sub-components ────────────────────────────────────────────────────── */

const PriceRow = React.memo(({ price, quantityKg, language, tr }) => {
  const color       = modalPriceColor(price.modalPrice, price.minPrice, price.maxPrice);
  const dateDisplay = formatMandiDate(price.arrivalDate, language);
  const perKg       = toPerKg(price.modalPrice);
  const totalVal    = calcProfit(price.modalPrice, quantityKg);
  const showVariety = price.variety && price.variety.toLowerCase() !== 'other';
  const showGrade   = price.grade   && price.grade.toLowerCase()   !== 'local';

  return (
    <div className="mp-price-card">
      <div className="mp-price-card-inner">
        {/* Emoji */}
        <div className="mp-price-emoji">{getCropEmoji(price.commodity)}</div>

        {/* Info */}
        <div className="mp-price-info">
          <h3 className="mp-price-name">{price.commodity}</h3>
          {showVariety && (
            <p className="mp-price-variety">
              {tr('variety')}: <span>{price.variety}</span>
            </p>
          )}
          <div className="mp-price-loc">
            <MapPin size={11} color="#c8a060" />
            <span>{price.market}{price.district && price.district !== price.market ? `, ${price.district}` : ''}</span>
          </div>
          <div className="mp-price-meta">
            <span>📅 {dateDisplay}</span>
            {showGrade && <span className="mp-grade-pill">{price.grade}</span>}
          </div>
        </div>

        {/* Modal price */}
        <div className="mp-price-modal">
          <div className="mp-modal-val" style={{ color }}>{formatINR(price.modalPrice)}</div>
          <div className="mp-modal-unit">{tr('perQuintal')}</div>
          {perKg != null && <div className="mp-modal-kg">{formatINR(perKg, 2)}/kg</div>}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mp-price-bar">
        <div className="mp-bar-stat">
          <ArrowDown size={11} color="#2d6a4f" />
          <span>{tr('minPrice')}: <strong style={{color:'#2d6a4f'}}>{formatINR(price.minPrice)}</strong>
            <em> ({formatINR(toPerKg(price.minPrice),2)}/kg)</em>
          </span>
        </div>
        <div className="mp-bar-stat">
          <ArrowUp size={11} color="#c0392b" />
          <span>{tr('maxPrice')}: <strong style={{color:'#c0392b'}}>{formatINR(price.maxPrice)}</strong>
            <em> ({formatINR(toPerKg(price.maxPrice),2)}/kg)</em>
          </span>
        </div>
        {totalVal != null && quantityKg > 0 && (
          <div className="mp-profit-pill">
            <Calculator size={10} />
            {formatINR(totalVal)} for {quantityKg}kg
          </div>
        )}
      </div>
    </div>
  );
});
PriceRow.displayName = 'PriceRow';

const BestMandiBanner = ({ record, language, tr }) => {
  if (!record) return null;
  return (
    <div className="mp-best-banner">
      <div className="mp-best-grain" />
      <div className="mp-best-left">
        <div className="mp-best-icon"><Trophy size={18} color="#f0ede8" /></div>
        <div>
          <p className="mp-best-eyebrow">🏆 {tr('bestMandi')}</p>
          <h3 className="mp-best-name">{record.commodity}</h3>
          <p className="mp-best-loc">{record.market}, {record.district}</p>
        </div>
      </div>
      <div className="mp-best-right">
        <div className="mp-best-price">{formatINR(record.modalPrice)}</div>
        <div className="mp-best-unit">{tr('perQuintal')}</div>
        <div className="mp-best-kg">{formatINR(toPerKg(record.modalPrice),2)}/kg</div>
      </div>
    </div>
  );
};

const TrendChart = ({ data, tr }) => {
  if (!data || data.length < 2) return null;
  return (
    <div className="mp-chart-card">
      <div className="mp-chart-head">
        <BarChart2 size={15} color="#b87a00" />
        <span className="mp-chart-title">{tr('priceTrend')}</span>
        <span className="mp-chart-sub">{tr('avgModalPrice')}</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top:4, right:8, bottom:0, left:-20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ede8e0" />
          <XAxis dataKey="date" tick={{ fontSize:10, fill:'#9a9080', fontFamily:'DM Sans' }}
            tickFormatter={v => { const d=new Date(v); return isNaN(d)?v:d.toLocaleDateString('en-IN',{day:'2-digit',month:'short'}); }} />
          <YAxis tick={{ fontSize:10, fill:'#9a9080', fontFamily:'DM Sans' }} tickFormatter={v=>`₹${v}`} />
          <Tooltip
            formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, tr('avgModalPrice')]}
            labelFormatter={v => { const d=new Date(v); return isNaN(d)?v:d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }}
            contentStyle={{ fontFamily:'DM Sans', fontSize:12, borderRadius:10, border:'1px solid #e8e2da' }}
          />
          <Line type="monotone" dataKey="avgPrice" stroke="#b87a00" strokeWidth={2.5} dot={false} activeDot={{ r:4, fill:'#b87a00' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

const ProfitCalculator = ({ quantityKg, onChange, tr }) => (
  <div className="mp-calc-card">
    <div className="mp-calc-icon"><Calculator size={16} color="#b87a00" /></div>
    <div className="mp-calc-text">
      <p className="mp-calc-label">{tr('profitCalc')}</p>
      <p className="mp-calc-hint">{tr('profitCalcHint')}</p>
    </div>
    <div className="mp-calc-input-wrap">
      <input
        type="number" min="1" max="100000"
        value={quantityKg}
        onChange={e => onChange(Math.max(1, Number(e.target.value)||1))}
        className="mp-calc-input"
      />
      <span className="mp-calc-unit">kg</span>
    </div>
  </div>
);

const Pagination = ({ page, total, pageSize, loading, onPrev, onNext, tr }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="mp-pagination">
      <button onClick={onPrev} disabled={page===0||loading} className="mp-page-btn mp-page-prev">
        <ChevronLeft size={14} /> {tr('prev')}
      </button>
      <span className="mp-page-info">
        {tr('page')} {page+1} / {totalPages}
        <em> ({total} {tr('total')})</em>
      </span>
      <button onClick={onNext} disabled={(page+1)*pageSize>=total||loading} className="mp-page-btn mp-page-next">
        {tr('next')} <ChevronRight size={14} />
      </button>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────────────────── */
const MandiPrices = () => {
  const navigate = useNavigate();
  const { t }    = useTranslation();
  const { user } = useAuth();
  const { language } = React.useContext(LanguageContext);
  const tr = useCallback(key => t(`mandi.${key}`), [t]);

  const [prices, setPrices]           = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [page, setPage]               = useState(0);

  const [apiState,      setApiState]      = useState(user?.farmerDetails?.state    || '');
  const [apiDistrict,   setApiDistrict]   = useState(user?.farmerDetails?.district || '');
  const [districtInput, setDistrictInput] = useState(user?.farmerDetails?.district || '');
  const [search,        setSearch]        = useState('');
  const [sortKey,       setSortKey]       = useState('modalPrice');
  const [sortDir,       setSortDir]       = useState('asc');
  const [quantityKg,    setQuantityKg]    = useState(100);
  const [showStateDD,   setShowStateDD]   = useState(false);
  const [showSortDD,    setShowSortDD]    = useState(false);
  const [showChart,     setShowChart]     = useState(false);
  const stateRef = useRef(null);
  const sortRef  = useRef(null);

  const loadPrices = useCallback(async (targetPage=0) => {
    setLoading(true); setError(null);
    try {
      const { records, total: apiTotal } = await fetchMandiPrices({
        state: apiState, district: apiDistrict,
        limit: PAGE_SIZE, offset: targetPage*PAGE_SIZE,
      });
      setPrices(records); setTotal(apiTotal); setPage(targetPage); setLastUpdated(new Date());
    } catch (err) {
      console.error(err); setError(err.message || 'Failed to load');
    } finally { setLoading(false); }
  }, [apiState, apiDistrict]);

  useEffect(() => { loadPrices(0); }, [loadPrices]);

  useEffect(() => {
    const h = e => {
      if (stateRef.current && !stateRef.current.contains(e.target)) setShowStateDD(false);
      if (sortRef.current  && !sortRef.current.contains(e.target))  setShowSortDD(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const applyDistrict = () => setApiDistrict(districtInput.trim());

  const displayPrices = useMemo(() => {
    let list = prices;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.commodity.toLowerCase().includes(q) ||
        p.market.toLowerCase().includes(q)    ||
        p.district.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a,b) => {
      let va=a[sortKey], vb=b[sortKey];
      if (sortKey==='arrivalDate') {
        const parse = s => { const [dd,mm,yyyy]=(s||'').split('/'); return dd?new Date(`${yyyy}-${mm}-${dd}`).getTime():0; };
        va=parse(va); vb=parse(vb);
      }
      if (va===vb) return 0;
      return sortDir==='asc' ? (va>vb?1:-1) : (va<vb?1:-1);
    });
  }, [prices, search, sortKey, sortDir]);

  const bestMandi = useMemo(() => {
    if (!displayPrices.length) return null;
    return displayPrices.reduce((best,cur) => cur.modalPrice>(best?.modalPrice??0)?cur:best, null);
  }, [displayPrices]);

  const trendData = useMemo(() => {
    const byDate = {};
    for (const p of prices) {
      if (!p.arrivalDate||!p.modalPrice) continue;
      const [dd,mm,yyyy] = p.arrivalDate.split('/');
      if (!dd) continue;
      const key = `${yyyy}-${mm.padStart(2,'0')}-${dd.padStart(2,'0')}`;
      if (!byDate[key]) byDate[key]={sum:0,count:0};
      byDate[key].sum+=p.modalPrice; byDate[key].count+=1;
    }
    return Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b))
      .map(([date,{sum,count}]) => ({ date, avgPrice: Math.round(sum/count) }));
  }, [prices]);

  const clearFilters = () => {
    setSearch('');
    setApiState(user?.farmerDetails?.state    || '');
    setApiDistrict(user?.farmerDetails?.district || '');
    setDistrictInput(user?.farmerDetails?.district || '');
    setSortKey('modalPrice'); setSortDir('asc');
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

  const toggleSort = key => {
    if (sortKey===key) setSortDir(d=>d==='asc'?'desc':'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setShowSortDD(false);
  };

  return (
    <>
      <style>{`

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mp-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .mp-header {
          background: #1c3a1c;
          position: relative; overflow: hidden;
          z-index: 30;
        }
        .mp-header-grain {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .mp-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 240px; height: 240px; border-radius: 50%;
          background: radial-gradient(circle, rgba(184,122,0,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .mp-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 28px; background: #f7f3ee;
          border-radius: 28px 28px 0 0; z-index: 2;
        }
        .mp-header-inner { position: relative; z-index: 1; padding: 18px 18px 32px; }

        /* title row */
        .mp-title-row {
          display: flex; align-items: center; gap: 10px; margin-bottom: 18px;
        }
        .mp-icon-btn {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.14);
          display: flex; align-items: center; justify-content: center;
          color: #f0ede8; cursor: pointer; transition: background 0.15s;
        }
        .mp-icon-btn:hover { background: rgba(255,255,255,0.18); }
        .mp-icon-btn.active { background: rgba(184,122,0,0.3); border-color: rgba(184,122,0,0.4); }
        .mp-icon-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .mp-title-block { flex: 1; }
        .mp-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.3px; display: flex; align-items: center; gap: 8px;
        }
        .mp-subtitle { font-size: 11px; color: rgba(240,237,232,0.45); margin-top: 2px; }

        /* search */
        .mp-search-wrap { position: relative; margin-bottom: 12px; }
        .mp-search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); pointer-events: none; }
        .mp-search-input {
          width: 100%; padding: 11px 38px;
          background: rgba(255,255,255,0.95); border: none; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #1c2e1c;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .mp-search-input::placeholder { color: #b0a890; }
        .mp-search-input:focus { outline: none; box-shadow: 0 2px 12px rgba(0,0,0,0.18); }
        .mp-search-clear {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #9a9080;
          display: flex; align-items: center;
        }

        /* filter row */
        .mp-filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .mp-filter-chip {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.16);
          border-radius: 10px; padding: 7px 12px;
          color: #f0ede8; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background 0.15s;
          white-space: nowrap;
        }
        .mp-filter-chip:hover { background: rgba(255,255,255,0.2); }
        .mp-district-chip {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.16);
          border-radius: 10px; padding: 7px 10px;
          flex: 1; min-width: 90px; max-width: 140px;
        }
        .mp-district-input {
          background: transparent; border: none; outline: none;
          color: #f0ede8; font-size: 12px; font-weight: 600;
          font-family: 'DM Sans', sans-serif; width: 100%;
        }
        .mp-district-input::placeholder { color: rgba(240,237,232,0.45); }
        .mp-sort-chip {
          display: flex; align-items: center; gap: 5px;
          background: rgba(184,122,0,0.25); border: 1px solid rgba(184,122,0,0.35);
          border-radius: 10px; padding: 7px 12px;
          color: #f0ede8; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
          margin-left: auto;
        }

        /* dropdowns */
        .mp-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0;
          width: 200px; background: #fff; border-radius: 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.14); border: 1px solid #e8e2da;
          z-index: 60; max-height: 220px; overflow-y: auto;
        }
        .mp-dropdown-right { left: auto; right: 0; width: 170px; }
        .mp-dd-btn {
          width: 100%; text-align: left; padding: 9px 14px;
          font-size: 12px; font-weight: 500; color: #4a4035;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.1s;
          display: flex; align-items: center; justify-content: space-between;
        }
        .mp-dd-btn:hover { background: #f7f3ee; }
        .mp-dd-btn.active { background: #fdf3e0; color: #8a6000; font-weight: 700; }
        .mp-dd-btn:first-child { border-radius: 14px 14px 0 0; }
        .mp-dd-btn:last-child  { border-radius: 0 0 14px 14px; }

        /* ── STATS BAR ── */
        .mp-stats-bar {
          background: #fff; border-bottom: 1px solid #e8e2da;
          padding: 9px 18px; display: flex; align-items: center; justify-content: space-between;
        }
        .mp-stats-count { font-size: 12px; color: #9a9080; font-weight: 500; }
        .mp-stats-right { display: flex; align-items: center; gap: 12px; }
        .mp-stats-time  { font-size: 11px; color: #b0a890; }
        .mp-clear-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 700; color: #b87a00;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── BODY ── */
        .mp-body { padding: 18px 16px 0; }

        /* ── BEST BANNER ── */
        .mp-best-banner {
          background: #1c3a1c; border-radius: 18px; padding: 18px;
          margin-bottom: 14px; display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
          position: relative; overflow: hidden;
          box-shadow: 0 4px 16px rgba(28,58,28,0.2);
        }
        .mp-best-grain {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .mp-best-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; position: relative; z-index: 1; }
        .mp-best-icon {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(184,122,0,0.3); display: flex; align-items: center; justify-content: center;
        }
        .mp-best-eyebrow { font-size: 10px; font-weight: 700; color: rgba(240,237,232,0.5); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px; }
        .mp-best-name {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #f0ede8;
          text-transform: capitalize; line-height: 1.1; margin-bottom: 3px;
        }
        .mp-best-loc { font-size: 11px; color: rgba(240,237,232,0.45); }
        .mp-best-right { text-align: right; flex-shrink: 0; position: relative; z-index: 1; }
        .mp-best-price {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #f6c94e;
        }
        .mp-best-unit { font-size: 10px; color: rgba(240,237,232,0.4); }
        .mp-best-kg   { font-size: 12px; font-weight: 600; color: rgba(240,237,232,0.6); margin-top: 2px; }

        /* ── CHART ── */
        .mp-chart-card {
          background: #fff; border-radius: 16px; border: 1px solid #e8e2da;
          padding: 16px; margin-bottom: 14px;
        }
        .mp-chart-head { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; }
        .mp-chart-title { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 700; color: #1c2e1c; }
        .mp-chart-sub   { font-size: 11px; color: #9a9080; }

        /* ── CALCULATOR ── */
        .mp-calc-card {
          background: #fff; border-radius: 14px; border: 1px solid #e8ddc8;
          padding: 12px 14px; margin-bottom: 14px;
          display: flex; align-items: center; gap: 12px;
        }
        .mp-calc-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #fdf3e0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mp-calc-text { flex: 1; }
        .mp-calc-label { font-size: 13px; font-weight: 600; color: #1c2e1c; }
        .mp-calc-hint  { font-size: 10px; color: #9a9080; margin-top: 1px; }
        .mp-calc-input-wrap { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .mp-calc-input {
          width: 70px; border: 1.5px solid #e8ddc8; border-radius: 9px;
          padding: 7px 8px; font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 700; color: #1c2e1c;
          text-align: center;
        }
        .mp-calc-input:focus { outline: none; border-color: #b87a00; }
        .mp-calc-unit { font-size: 12px; font-weight: 600; color: #6a6055; }

        /* ── PRICE CARDS ── */
        .mp-price-card {
          background: #fff; border-radius: 16px;
          border: 1px solid #e8e2da; border-left: 3px solid #b87a00;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          margin-bottom: 10px; overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .mp-price-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.09);
          transform: translateY(-1px);
        }
        .mp-price-card-inner {
          display: flex; align-items: flex-start; gap: 12px; padding: 14px;
        }
        .mp-price-emoji {
          width: 48px; height: 48px; flex-shrink: 0;
          background: #fdf8f0; border-radius: 12px; border: 1px solid #ede8e0;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; line-height: 1;
        }
        .mp-price-info { flex: 1; min-width: 0; }
        .mp-price-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 700; color: #1c2e1c;
          text-transform: capitalize; line-height: 1.2; margin-bottom: 3px;
        }
        .mp-price-variety { font-size: 11px; color: #9a9080; margin-bottom: 3px; }
        .mp-price-variety span { font-weight: 600; color: #6a6055; text-transform: capitalize; }
        .mp-price-loc {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: #9a9080; margin-bottom: 3px;
        }
        .mp-price-loc span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mp-price-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #b0a890; }
        .mp-grade-pill {
          background: #f0ede8; padding: 2px 7px; border-radius: 6px;
          font-size: 10px; font-weight: 600; color: #6a6055; text-transform: capitalize;
        }
        .mp-price-modal { text-align: right; flex-shrink: 0; padding-left: 8px; }
        .mp-modal-val {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; line-height: 1;
        }
        .mp-modal-unit { font-size: 9px; color: #b0a890; margin-top: 1px; }
        .mp-modal-kg   { font-size: 11px; font-weight: 600; color: #6a6055; margin-top: 3px; }

        /* price bar */
        .mp-price-bar {
          background: #fdf8f0; border-top: 1px solid #ede8e0;
          padding: 8px 14px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .mp-bar-stat {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; color: #6a6055;
        }
        .mp-bar-stat strong { font-weight: 700; }
        .mp-bar-stat em { color: #b0a890; font-style: normal; }
        .mp-profit-pill {
          margin-left: auto; display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 700; color: #8a6000;
          background: #fde8b0; padding: 4px 10px; border-radius: 99px;
        }

        /* ── PAGINATION ── */
        .mp-pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 0 4px;
        }
        .mp-page-btn {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; font-weight: 700; padding: 9px 16px; border-radius: 11px;
          border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .mp-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .mp-page-prev { background: #fff; border: 1.5px solid #e8e2da; color: #4a4035; }
        .mp-page-prev:hover:not(:disabled) { border-color: #b87a00; color: #8a6000; }
        .mp-page-next { background: #1c3a1c; color: #f0ede8; }
        .mp-page-next:hover:not(:disabled) { background: #2a5a2a; }
        .mp-page-info { font-size: 11px; color: #9a9080; }
        .mp-page-info em { color: #b0a890; font-style: normal; }

        /* ── LOADING SKELETONS ── */
        .mp-skeleton {
          background: #fff; border-radius: 16px; border: 1px solid #e8e2da;
          border-left: 3px solid #ede8e0; padding: 14px; margin-bottom: 10px;
          display: flex; align-items: center; gap: 12px;
        }
        .mp-skel-box { background: #f0ede8; border-radius: 10px; flex-shrink: 0; animation: mpPulse 1.4s ease-in-out infinite; }
        .mp-skel-line { background: #f0ede8; border-radius: 6px; animation: mpPulse 1.4s ease-in-out infinite; }
        @keyframes mpPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        /* ── ERROR / EMPTY ── */
        .mp-center-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 64px 20px; text-align: center; }
        .mp-state-icon { width: 64px; height: 64px; border-radius: 18px; background: #f0ede8; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .mp-state-title { font-family: 'Playfair Display', serif; font-size: 17px; font-weight: 700; color: #1c2e1c; margin-bottom: 6px; }
        .mp-state-sub   { font-size: 13px; color: #9a9080; margin-bottom: 18px; }
        .mp-retry-btn {
          display: flex; align-items: center; gap: 7px; padding: 10px 22px;
          background: #1c3a1c; color: #f0ede8; border: none; border-radius: 12px;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .mp-retry-btn:hover { background: #2a5a2a; }
        .mp-underline-btn { background: none; border: none; color: #b87a00; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: underline; }

        .mp-spin { animation: mpSpin 0.8s linear infinite; }
        @keyframes mpSpin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="mp-root">

        {/* ── HEADER ── */}
        <header className="mp-header ">
          <div className="mp-header-grain" />
          <div className="mp-header-glow" />

          <div className="mp-header-inner">
            {/* Title row */}
            <div className="mp-title-row">
              <button className="mp-icon-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
              </button>
              <div className="mp-title-block">
                <div className="mp-title">
                  {/* <TrendingUp size={18} color="#f6c94e" /> */}
                  {tr('title')}
                </div>
                <div className="mp-subtitle">{tr('subtitle')}</div>
              </div>
              <button
                className={`mp-icon-btn ${showChart ? 'active' : ''}`}
                onClick={() => setShowChart(v => !v)}
                title="Toggle trend chart"
              >
                <BarChart2 size={17} />
              </button>
              <button
                className="mp-icon-btn"
                onClick={() => loadPrices(page)}
                disabled={loading}
              >
                <RefreshCw size={17} className={loading ? 'mp-spin' : ''} />
              </button>
            </div>

            {/* Search */}
            <div className="mp-search-wrap">
              <Search size={15} color="#9a9080" className="mp-search-icon" />
              <input
                type="text"
                className="mp-search-input"
                placeholder={tr('searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="mp-search-clear" onClick={() => setSearch('')}>
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="mp-filter-row mb-3">
              {/* State */}
              <div style={{ position: 'relative' }} ref={stateRef}>
                <button
                  className="mp-filter-chip"
                  onClick={() => { setShowStateDD(!showStateDD); setShowSortDD(false); }}
                >
                  <MapPin size={13} />
                  <span style={{ maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {apiState || tr('allStates')}
                  </span>
                  <ChevronDown size={12} />
                </button>
                {showStateDD && (
                  <div className="mp-dropdown">
                    <button
                      className={`mp-dd-btn ${!apiState ? 'active' : ''}`}
                      onClick={() => { setApiState(''); setDistrictInput(''); setApiDistrict(''); setShowStateDD(false); }}
                    >{tr('allStates')}</button>
                    {STATES.map(s => (
                      <button
                        key={s}
                        className={`mp-dd-btn ${apiState===s ? 'active' : ''}`}
                        onClick={() => { setApiState(s); setShowStateDD(false); }}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* District */}
              <div className="mp-district-chip">
                <MapPin size={12} color="rgba(240,237,232,0.5)" style={{ flexShrink: 0 }} />
                <input
                  type="text"
                  className="mp-district-input"
                  placeholder={tr('districtPlaceholder')}
                  value={districtInput}
                  onChange={e => setDistrictInput(e.target.value)}
                  onBlur={applyDistrict}
                  onKeyDown={e => { if (e.key==='Enter') { applyDistrict(); e.target.blur(); } }}
                />
                {districtInput && districtInput !== apiDistrict && (
                  <button onClick={applyDistrict} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(240,237,232,0.6)', display:'flex', alignItems:'center' }}>
                    <ArrowUpDown size={11} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div style={{ position:'relative', marginLeft:'auto' }} ref={sortRef}>
                <button
                  className="mp-sort-chip"
                  onClick={() => { setShowSortDD(!showSortDD); setShowStateDD(false); }}
                >
                  <ArrowUpDown size={13} />
                  <span style={{ display:'none' }}>{sortKeyLabel[sortKey]}</span>
                  {sortDir==='asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                </button>
                {showSortDD && (
                  <div className="mp-dropdown mp-dropdown-right">
                    {SORT_KEYS.map(key => (
                      <button
                        key={key}
                        className={`mp-dd-btn ${sortKey===key ? 'active' : ''}`}
                        onClick={() => toggleSort(key)}
                      >
                        {sortKeyLabel[key]}
                        {sortKey===key && (sortDir==='asc' ? <ArrowUp size={12}/> : <ArrowDown size={12}/>)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mp-header-arc" />
        </header>

        {/* Stats bar */}
        <div className="mp-stats-bar">
          <span className="mp-stats-count">
            {loading ? tr('loading') : `${displayPrices.length} ${tr('recordsFound')} (${total} ${tr('total')})`}
          </span>
          <div className="mp-stats-right">
            {lastUpdated && !loading && (
              <span className="mp-stats-time">
                {tr('lastUpdated')}: {lastUpdated.toLocaleTimeString(
                  language==='en'?'en-IN':language==='hi'?'hi-IN':'mr-IN',
                  { hour:'2-digit', minute:'2-digit' }
                )}
              </span>
            )}
            {hasActiveFilters && (
              <button className="mp-clear-btn" onClick={clearFilters}>
                <X size={12} /> {tr('clearFilters')}
              </button>
            )}
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div className="mp-body">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="mp-skeleton">
                <div className="mp-skel-box" style={{ width:48, height:48 }} />
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:7 }}>
                  <div className="mp-skel-line" style={{ height:14, width:'60%' }} />
                  <div className="mp-skel-line" style={{ height:11, width:'40%' }} />
                  <div className="mp-skel-line" style={{ height:11, width:'30%' }} />
                </div>
                <div className="mp-skel-box" style={{ width:64, height:40 }} />
              </div>
            ))
          ) : error ? (
            <div className="mp-center-state">
              <div className="mp-state-icon"><AlertCircle size={28} color="#c0392b" /></div>
              <div className="mp-state-title">{tr('errorTitle')}</div>
              <div className="mp-state-sub">{tr('errorHint')}</div>
              <button className="mp-retry-btn" onClick={() => loadPrices(0)}>
                <RefreshCw size={15} /> {tr('retry')}
              </button>
            </div>
          ) : displayPrices.length === 0 ? (
            <div className="mp-center-state">
              <div className="mp-state-icon" style={{ fontSize:28 }}>🌾</div>
              <div className="mp-state-title">{tr('noResults')}</div>
              <div className="mp-state-sub">{tr('noResultsHint')}</div>
              <button className="mp-underline-btn" onClick={clearFilters}>{tr('clearFilters')}</button>
            </div>
          ) : (
            <>
              <BestMandiBanner record={bestMandi} language={language} tr={tr} />
              {showChart && <TrendChart data={trendData} tr={tr} />}
              <ProfitCalculator quantityKg={quantityKg} onChange={setQuantityKg} tr={tr} />
              {displayPrices.map((price, idx) => (
                <PriceRow
                  key={price.id || idx}
                  price={price}
                  quantityKg={quantityKg}
                  language={language}
                  tr={tr}
                />
              ))}
              <Pagination
                page={page} total={total} pageSize={PAGE_SIZE} loading={loading}
                onPrev={() => loadPrices(page-1)}
                onNext={() => loadPrices(page+1)}
                tr={tr}
              />
            </>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default MandiPrices;