// ─────────────────────────────────────────────────────────────────────────────
// mandiService.js  →  src/services/mandiService.js
//
// Live mandi prices from Government of India — data.gov.in (Agmarknet)
// Resource ID : 9ef84268-d588-465a-a308-a864a43d0070
// ─────────────────────────────────────────────────────────────────────────────

const API_KEY     = import.meta.env.VITE_MANDI_API_KEY
  || '579b464db66ec23bdd000001cfda5c8e2acc4967457ef3f9f300a982';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const BASE_URL    = `https://api.data.gov.in/resource/${RESOURCE_ID}`;

// ─── Date helpers ─────────────────────────────────────────────────────────────

/**
 * Parse the API's "DD/MM/YYYY" string into a JS Date.
 */
export const parseMandiDate = (str) => {
  if (!str || typeof str !== 'string') return null;
  const parts = str.trim().split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  return new Date(`${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`);
};

/**
 * Format "DD/MM/YYYY" for display in the user's selected language.
 */
export const formatMandiDate = (dateStr, language = 'en') => {
  const d = parseMandiDate(dateStr);
  if (!d || isNaN(d)) return dateStr || '—';
  const localeMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
  return d.toLocaleDateString(localeMap[language] || 'en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ─── Price helpers ────────────────────────────────────────────────────────────

/** Convert ₹/quintal to ₹/kg (1 quintal = 100 kg) */
export const toPerKg = (pricePerQuintal) =>
  pricePerQuintal != null ? pricePerQuintal / 100 : null;

/** Format INR with Indian locale */
export const formatINR = (n, decimals = 0) =>
  n != null && n !== 0
    ? `₹${Number(n).toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`
    : '—';

/** Calculate total sale value for a given quantity in kg */
export const calcProfit = (modalPricePerQuintal, quantityKg) =>
  modalPricePerQuintal != null && quantityKg != null
    ? (modalPricePerQuintal / 100) * quantityKg
    : null;

// ─── Normalise raw record ─────────────────────────────────────────────────────

const normalise = (r) => ({
  id:          `${r.state}-${r.district}-${r.market}-${r.commodity}-${r.arrival_date}-${r.variety}`,
  state:       r.state        || '',
  district:    r.district     || '',
  market:      r.market       || '',
  commodity:   r.commodity    || '',
  variety:     r.variety      || '',
  grade:       r.grade        || '',
  arrivalDate: r.arrival_date || '',
  minPrice:    Number(r.min_price   ?? 0),
  maxPrice:    Number(r.max_price   ?? 0),
  modalPrice:  Number(r.modal_price ?? 0),
  unit:        'quintal',
});

// ─── Main fetch function ──────────────────────────────────────────────────────

/**
 * @param {object} opts
 * @param {string} [opts.state]
 * @param {string} [opts.district]
 * @param {string} [opts.commodity]
 * @param {number} [opts.limit=50]
 * @param {number} [opts.offset=0]
 * @returns {Promise<{ records: object[], total: number }>}
 */
export const fetchMandiPrices = async ({
  state     = '',
  district  = '',
  commodity = '',
  limit     = 50,
  offset    = 0,
} = {}) => {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    format:    'json',
    limit:     String(limit),
    offset:    String(offset),
  });

  if (state)     params.append('filters[state.keyword]', state);
  if (district)  params.append('filters[district]',      district);
  if (commodity) params.append('filters[commodity]',     commodity);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  if (!res.ok) throw new Error(`Mandi API error ${res.status}: ${res.statusText}`);

  const json = await res.json();
  if (!Array.isArray(json.records)) {
    throw new Error('Unexpected API response — no records array');
  }
  console.log(`Fetched ${json.records.length} mandi price records (total: ${json.total})`);
  console.log('Sample record:', json.records); 
  return {
    records: json.records.map(normalise),
    total:   Number(json.total ?? 0),
    count:   Number(json.count ?? 0),
  };
};