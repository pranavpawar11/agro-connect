import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, FileText, Bell, BookOpen, TrendingUp, Sparkles,
  ChevronRight, Sun, Cloud, Droplets, Wind, MapPin,
  Activity, Award, Target, CloudRain, CloudSnow, Zap,
  CloudDrizzle, Thermometer, Globe, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import BottomNav from '../../components/common/BottomNav';
import useAuth from '../../hooks/useAuth';
import alertService from '../../services/alertService';
import AlertCard from '../../components/farmer/AlertCard';
import Loading from '../../components/common/Loading';
import useInstallPrompt from '../../hooks/useInstallPrompt';

/* ─── Weather API (unchanged) ───────────────────────────────────────────── */
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

const WMO_CODES = {
  0:  { icon: Sun,         en: 'Clear Sky',         hi: 'साफ आसमान',       mr: 'स्वच्छ आकाश' },
  1:  { icon: Sun,         en: 'Mainly Clear',      hi: 'मुख्यतः साफ',      mr: 'मुख्यतः स्वच्छ' },
  2:  { icon: Cloud,       en: 'Partly Cloudy',     hi: 'आंशिक बादल',      mr: 'अंशतः ढगाळ' },
  3:  { icon: Cloud,       en: 'Overcast',          hi: 'पूरी तरह बादल',   mr: 'पूर्णपणे ढगाळ' },
  45: { icon: Cloud,       en: 'Foggy',             hi: 'कोहरा',           mr: 'धुके' },
  48: { icon: Cloud,       en: 'Icy Fog',           hi: 'बर्फीला कोहरा',   mr: 'बर्फाळ धुके' },
  51: { icon: CloudDrizzle,en: 'Light Drizzle',     hi: 'हल्की बूंदाबांदी', mr: 'हलकी रिमझिम' },
  53: { icon: CloudDrizzle,en: 'Drizzle',           hi: 'बूंदाबांदी',      mr: 'रिमझिम पाऊस' },
  55: { icon: CloudDrizzle,en: 'Heavy Drizzle',     hi: 'भारी बूंदाबांदी', mr: 'जड रिमझिम' },
  61: { icon: CloudRain,   en: 'Light Rain',        hi: 'हल्की बारिश',     mr: 'हलका पाऊस' },
  63: { icon: CloudRain,   en: 'Rain',              hi: 'बारिश',           mr: 'पाऊस' },
  65: { icon: CloudRain,   en: 'Heavy Rain',        hi: 'भारी बारिश',      mr: 'जड पाऊस' },
  71: { icon: CloudSnow,   en: 'Light Snow',        hi: 'हल्की बर्फ',      mr: 'हलकी बर्फ' },
  73: { icon: CloudSnow,   en: 'Snow',              hi: 'बर्फबारी',        mr: 'बर्फवृष्टी' },
  80: { icon: CloudRain,   en: 'Rain Showers',      hi: 'बौछार',           mr: 'पावसाचा सरी' },
  95: { icon: Zap,         en: 'Thunderstorm',      hi: 'तूफान',           mr: 'वादळ' },
  99: { icon: Zap,         en: 'Heavy Thunderstorm',hi: 'भारी तूफान',      mr: 'जड वादळ' },
};
const getWMO = (code) => WMO_CODES[code] || WMO_CODES[0];

const DAY_LABELS = {
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  hi: ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'],
  mr: ['रवि','सोम','मंगळ','बुध','गुरू','शुक्र','शनि'],
};
const TODAY_LABEL = { en: 'Today', hi: 'आज', mr: 'आज' };

const fetchWeather = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
    timezone: 'auto', forecast_days: 6,
  });
  const res = await fetch(`${OPEN_METEO_URL}?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
};

/* ─── Component ─────────────────────────────────────────────────────────── */
const FarmerHome = () => {
  const navigate  = useNavigate();
  const { t }     = useTranslation();
  const { user }  = useAuth();
  const { language, changeLanguage } = React.useContext(LanguageContext);
  const [alerts, setAlerts]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const { canInstall, install }       = useInstallPrompt();

  const [weather, setWeather]           = useState(null);
  const [forecast, setForecast]         = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => { fetchAlerts(); loadWeather(); }, []);

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getWeatherAlerts({
        district: user?.farmerDetails?.district,
        state:    user?.farmerDetails?.state,
      });
      setAlerts(data.alerts.slice(0, 3));
    } catch (e) { console.error(e); }
    finally     { setLoading(false); }
  };

  const loadWeather = useCallback(() => {
    setWeatherLoading(true); setWeatherError(null);
    if (!navigator.geolocation) {
      setWeatherError('Geolocation not supported'); setWeatherLoading(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const data = await fetchWeather(latitude, longitude);
          const cur  = data.current;
          setWeather({
            temp:      Math.round(cur.temperature_2m),
            feelsLike: Math.round(cur.apparent_temperature),
            humidity:  cur.relative_humidity_2m,
            windSpeed: Math.round(cur.wind_speed_10m),
            code:      cur.weather_code,
          });
          const daily = data.daily;
          setForecast(daily.time.slice(1, 6).map((dateStr, i) => {
            const idx = i + 1, d = new Date(dateStr);
            return {
              dayIndex: d.getDay(),
              code:     daily.weather_code[idx],
              max:      Math.round(daily.temperature_2m_max[idx]),
              min:      Math.round(daily.temperature_2m_min[idx]),
              rain:     daily.precipitation_probability_max[idx],
            };
          }));
          try {
            const geoRes  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const geoData = await geoRes.json();
            const addr    = geoData.address;
            setLocationName(addr.village || addr.town || addr.city || addr.county || addr.state || '');
          } catch (_) { setLocationName(''); }
        } catch (err) { console.error(err); setWeatherError('Failed to load weather'); }
        finally       { setWeatherLoading(false); }
      },
      (err) => { console.error(err); setWeatherError('Location access denied'); setWeatherLoading(false); },
      { timeout: 10000 }
    );
  }, []);

  /* helpers */
  const WeatherIcon = ({ code, size = 24, color = 'currentColor' }) => {
    const Icon = getWMO(code).icon;
    return <Icon size={size} color={color} />;
  };
  const conditionLabel = (code) => { const e = getWMO(code); return e[language] || e.en; };
  const dayLabel = (dayIndex) => { const d = DAY_LABELS[language] || DAY_LABELS.en; return d[dayIndex]; };

  const quickActions = [
    { icon: Sprout,    label: t('farmer.predict'),      desc: language==='hi'?'AI सिफारिशें':language==='mr'?'AI शिफारसी':'AI recommendations',    path: '/farmer/crop-prediction', accent: '#2d6a4f', bg: '#d8f3dc', highlight: true },
    { icon: FileText,  label: t('farmer.contracts'),    desc: language==='hi'?'अवसर देखें':language==='mr'?'संधी पहा':'Browse opportunities',       path: '/farmer/contracts',       accent: '#1d4e89', bg: '#dbeafe' },
    { icon: TrendingUp,label: t('farmer.mandiPrices'),  desc: language==='hi'?'बाजार दर':language==='mr'?'बाजार दर':'Market rates',                 path: '/farmer/mandi-prices',    accent: '#92400e', bg: '#fef3c7' },
    { icon: BookOpen,  label: t('farmer.schemes'),      desc: language==='hi'?'सरकारी कार्यक्रम':language==='mr'?'सरकारी कार्यक्रम':'Gov. programs', path: '/farmer/schemes',         accent: '#5b21b6', bg: '#ede9fe' },
  ];

  const farmStats = [
    { icon: Target,   label: language==='hi'?'सक्रिय अनुबंध':language==='mr'?'सक्रिय करार':'Active Contracts', value: '0', accent: '#1d4e89', bg: '#dbeafe' },
    { icon: Activity, label: language==='hi'?'भविष्यवाणियां':language==='mr'?'अंदाज':'Predictions',             value: '0', accent: '#2d6a4f', bg: '#d8f3dc' },
    { icon: Award,    label: language==='hi'?'आवेदन':language==='mr'?'अर्ज':'Applications',                     value: '0', accent: '#5b21b6', bg: '#ede9fe' },
  ];

  const todayStr = new Date().toLocaleDateString(
    language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN',
    { weekday: 'long', day: 'numeric', month: 'long' }
  );

  return (
    <>
      <style>{`

        .fh-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .fh-header {
          background: #1c3a1c;
          position: relative;
          overflow: hidden;
          padding: 0 0 28px;
        }
        .fh-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
        }
        .fh-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 32px; background: #f7f3ee;
          border-radius: 32px 32px 0 0;
          z-index: 2;
        }
        .fh-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,195,107,0.12) 0%, transparent 70%);
          pointer-events: none;
        }
        .fh-header-inner {
          position: relative; z-index: 1;
          padding: 20px 20px 0;
        }

        /* top bar */
        .fh-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .fh-date-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 99px; padding: 5px 12px;
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.75);
          letter-spacing: 0.3px;
        }
        .fh-lang-row {
          display: flex; align-items: center; gap: 6px;
        }
        .fh-lang-btn {
          border: none; cursor: pointer; border-radius: 8px;
          padding: 5px 10px; font-size: 11px; font-weight: 700;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .fh-lang-btn.active  { background: #ffffff; color: #1c3a1c; }
        .fh-lang-btn.inactive{ background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
        .fh-lang-btn.inactive:hover { background: rgba(255,255,255,0.2); }

        /* welcome */
        .fh-welcome-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 20px;
        }
        .fh-greeting {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 700; color: #f0ede8;
          line-height: 1.15; letter-spacing: -0.3px;
          margin-bottom: 6px;
        }
        .fh-location {
          display: flex; align-items: center; gap: 5px;
          font-size: 12px; color: rgba(240,237,232,0.55); font-weight: 500;
        }
        .fh-avatar-btn {
          width: 50px; height: 50px; border-radius: 16px;
          background: rgba(255,255,255,0.13);
          border: 1.5px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; flex-shrink: 0;
          font-size: 20px; font-weight: 700; color: #f0ede8;
          font-family: 'Playfair Display', serif;
          position: relative;
        }
        .fh-avatar-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.04); }
        .fh-avatar-dot {
          position: absolute; bottom: -3px; right: -3px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #5cb85c; border: 2px solid #1c3a1c;
        }

        /* weather card */
        .fh-weather-card {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 18px; padding: 16px 18px;
        }
        .fh-weather-main {
          display: flex; align-items: center; justify-content: space-between;
        }
        .fh-weather-left { display: flex; align-items: center; gap: 14px; }
        .fh-weather-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          background: linear-gradient(135deg, #f6b73c, #e8841f);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .fh-weather-temp {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 700; color: #f0ede8; line-height: 1;
        }
        .fh-weather-deg { font-size: 18px; color: rgba(240,237,232,0.6); }
        .fh-weather-cond { font-size: 13px; color: rgba(240,237,232,0.85); font-weight: 500; margin-top: 2px; }
        .fh-weather-feels { font-size: 11px; color: rgba(240,237,232,0.45); margin-top: 1px; }
        .fh-weather-right { text-align: right; }
        .fh-weather-stat {
          display: flex; align-items: center; gap: 5px;
          color: rgba(240,237,232,0.75); font-size: 12px; font-weight: 500;
          justify-content: flex-end; margin-bottom: 4px;
        }
        .fh-weather-error {
          display: flex; align-items: center; justify-content: space-between;
          color: rgba(240,237,232,0.5); font-size: 13px;
        }
        .fh-weather-retry {
          background: none; border: none; cursor: pointer;
          color: rgba(240,237,232,0.6); font-size: 12px; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 4px; text-decoration: underline;
        }
        .fh-weather-loading {
          display: flex; align-items: center; justify-content: center; gap: 10px; padding: 12px 0;
          color: rgba(240,237,232,0.5); font-size: 13px;
        }
        .fh-spin { animation: fhSpin 0.8s linear infinite; }
        @keyframes fhSpin { to { transform: rotate(360deg); } }

        /* ── BODY ── */
        .fh-body { padding: 20px 16px 0; }

        /* ── STATS ROW ── */
        .fh-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 20px; }
        .fh-stat-card {
          background: #fff; border-radius: 16px; padding: 14px 12px;
          border: 1px solid #e8e2da;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .fh-stat-icon {
          width: 36px; height: 36px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center; margin-bottom: 10px;
        }
        .fh-stat-val {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #1c2e1c; line-height: 1;
          margin-bottom: 3px;
        }
        .fh-stat-label { font-size: 10px; font-weight: 600; color: #9a9080; letter-spacing: 0.2px; line-height: 1.3; }

        /* ── SECTION CARD ── */
        .fh-section {
          background: #fff; border-radius: 20px; padding: 20px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 16px;
        }
        .fh-section-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .fh-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1c2e1c; letter-spacing: -0.2px;
        }
        .fh-section-sub { font-size: 11px; color: #9a9080; margin-top: 2px; font-weight: 500; }
        .fh-view-all {
          display: flex; align-items: center; gap: 3px;
          font-size: 12px; font-weight: 700; color: #2d6a4f;
          background: #d8f3dc; border: none; cursor: pointer;
          padding: 6px 12px; border-radius: 99px;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .fh-view-all:hover { background: #b7e4c7; }

        /* ── FORECAST ── */
        .fh-forecast-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 6px; }
        .fh-forecast-day {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          background: #f7f3ee; border-radius: 14px; padding: 10px 4px;
          border: 1px solid #ede8e0;
        }
        .fh-fc-day-label { font-size: 10px; font-weight: 700; color: #6a6055; }
        .fh-fc-icon {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, #74c0fc, #4dabf7);
          display: flex; align-items: center; justify-content: center;
        }
        .fh-fc-max { font-size: 13px; font-weight: 700; color: #1c2e1c; }
        .fh-fc-min { font-size: 11px; color: #b0a898; }
        .fh-fc-rain { display: flex; align-items: center; gap: 2px; font-size: 10px; color: #4dabf7; font-weight: 700; }
        .fh-fc-cond { font-size: 9px; color: #9a9080; text-align: center; line-height: 1.3; padding: 0 2px; }

        /* ── QUICK ACTIONS ── */
        .fh-actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .fh-action-btn {
          position: relative; border: none; cursor: pointer;
          border-radius: 16px; padding: 16px; text-align: left;
          transition: all 0.2s; font-family: 'DM Sans', sans-serif;
          border: 1px solid transparent;
          overflow: hidden;
        }
        .fh-action-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        .fh-action-icon {
          width: 42px; height: 42px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 10px;
          transition: transform 0.2s;
        }
        .fh-action-btn:hover .fh-action-icon { transform: scale(1.1) rotate(3deg); }
        .fh-action-name { font-size: 13px; font-weight: 700; color: #1c2e1c; margin-bottom: 2px; }
        .fh-action-desc { font-size: 11px; color: #9a9080; font-weight: 500; }
        .fh-action-arrow {
          position: absolute; bottom: 12px; right: 12px;
          opacity: 0; transition: opacity 0.2s;
        }
        .fh-action-btn:hover .fh-action-arrow { opacity: 1; }
        .fh-action-pulse {
          position: absolute; top: 12px; right: 12px;
          width: 8px; height: 8px; border-radius: 50%; background: #2d6a4f;
        }
        .fh-action-pulse::before {
          content: ''; position: absolute; inset: -3px; border-radius: 50%;
          border: 2px solid #2d6a4f; opacity: 0.4;
          animation: fhPulse 1.5s ease-out infinite;
        }
        @keyframes fhPulse { 0%{transform:scale(1);opacity:0.4} 100%{transform:scale(2);opacity:0} }

        /* ── ALERTS EMPTY ── */
        .fh-alerts-empty {
          text-align: center; padding: 28px 20px;
          background: #f7f3ee; border-radius: 14px;
          border: 2px dashed #ddd6cc;
        }
        .fh-alerts-empty-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: #ede8e0; display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .fh-alerts-empty-title { font-size: 14px; font-weight: 700; color: #4a4035; margin-bottom: 4px; }
        .fh-alerts-empty-sub   { font-size: 12px; color: #9a9080; }

        /* ── INSTALL BANNER ── */
        .fh-install-btn {
          width: 100%; border: none; cursor: pointer; margin-bottom: 16px;
          background: linear-gradient(135deg, #f6b73c 0%, #e67e22 100%);
          border-radius: 16px; padding: 16px 18px;
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
          color: white; box-shadow: 0 4px 16px rgba(230,126,34,0.3);
          transition: all 0.2s;
        }
        .fh-install-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(230,126,34,0.35); }

        /* ── MOTIVATIONAL ── */
        .fh-motive {
          border-radius: 20px; padding: 20px;
          background: #1c3a1c; margin-bottom: 8px;
          display: flex; align-items: center; gap: 14px;
          position: relative; overflow: hidden;
        }
        .fh-motive-grain {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .fh-motive-icon {
          width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center;
          position: relative; z-index: 1;
        }
        .fh-motive-title {
          font-family: 'Playfair Display', serif;
          font-size: 16px; font-weight: 700; color: #f0ede8; margin-bottom: 5px;
          position: relative; z-index: 1;
        }
        .fh-motive-body {
          font-size: 12px; color: rgba(240,237,232,0.55); line-height: 1.55;
          position: relative; z-index: 1;
        }

        /* alert badge */
        .fh-alert-badge {
          position: absolute; top: -4px; right: -4px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #dc3545; border: 2px solid #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 800; color: white;
        }

        @media (max-width: 360px) {
          .fh-greeting { font-size: 22px; }
          .fh-actions-grid { gap: 8px; }
          .fh-action-btn { padding: 13px; }
        }
      `}</style>

      <div className="fh-root">

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <header className="fh-header">
          <div className="fh-header-grain" />
          <div className="fh-header-glow" />

          <div className="fh-header-inner">
            {/* Top bar: date + language */}
            <div className="fh-topbar">
              <div className="fh-date-chip">
                <Sparkles size={11} color="#fbbf24" />
                {todayStr}
              </div>
              <div className="fh-lang-row">
                <Globe size={14} color="rgba(255,255,255,0.45)" />
                {[{code:'en',label:'EN'},{code:'hi',label:'हि'},{code:'mr',label:'म'}].map(l => (
                  <button
                    key={l.code}
                    onClick={() => changeLanguage(l.code)}
                    className={`fh-lang-btn ${language===l.code?'active':'inactive'}`}
                  >{l.label}</button>
                ))}
              </div>
            </div>

            {/* Welcome row */}
            <div className="fh-welcome-row">
              <div style={{ flex: 1, marginRight: 12 }}>
                <div className="fh-greeting">
                  {t('common.welcome')}, {user?.name}
                </div>
                <div className="fh-location">
                  <MapPin size={12} color="rgba(240,237,232,0.45)" />
                  <span>{locationName || `${user?.farmerDetails?.village || ''}, ${user?.farmerDetails?.district || ''}`}</span>
                </div>
              </div>
              <button className="fh-avatar-btn" onClick={() => navigate('/farmer/alerts')}>
                {/* {user?.name?.charAt(0).toUpperCase()} */}
                <Bell size={20} color="#f0ede8" />
                {alerts.length > 0 && <div className="fh-alert-badge">{alerts.length}</div>}
                <div />
              </button>
            </div>

            {/* Weather */}
            <div className="fh-weather-card mb-5">
              {weatherLoading ? (
                <div className="fh-weather-loading">
                  <RefreshCw size={16} className="fh-spin" color="rgba(240,237,232,0.4)" />
                  <span>{language==='hi'?'मौसम लोड हो रहा है...':language==='mr'?'हवामान लोड होत आहे...':'Loading weather…'}</span>
                </div>
              ) : weatherError ? (
                <div className="fh-weather-error">
                  <span>{language==='hi'?'मौसम उपलब्ध नहीं':language==='mr'?'हवामान उपलब्ध नाही':'Weather unavailable'}</span>
                  <button className="fh-weather-retry" onClick={loadWeather}>
                    <RefreshCw size={11} />
                    {language==='hi'?'पुनः प्रयास':language==='mr'?'पुन्हा प्रयत्न':'Retry'}
                  </button>
                </div>
              ) : weather ? (
                <div className="fh-weather-main">
                  <div className="fh-weather-left">
                    <div className="fh-weather-icon-wrap">
                      <WeatherIcon code={weather.code} size={26} color="white" />
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'baseline', gap:2 }}>
                        <span className="fh-weather-temp">{weather.temp}</span>
                        <span className="fh-weather-deg">°C</span>
                      </div>
                      <div className="fh-weather-cond">{conditionLabel(weather.code)}</div>
                      <div className="fh-weather-feels">
                        {language==='hi'?`तापमान: ${weather.feelsLike}°C`:language==='mr'?`तापमान: ${weather.feelsLike}°C`:`Feels like ${weather.feelsLike}°C`}
                      </div>
                    </div>
                  </div>
                  <div className="fh-weather-right">
                    <div className="fh-weather-stat"><Droplets size={13}/>{weather.humidity}%</div>
                    <div className="fh-weather-stat"><Wind size={13}/>{weather.windSpeed} km/h</div>
                    <button className="fh-weather-retry" style={{marginTop:4,justifyContent:'flex-end'}} onClick={loadWeather}>
                      <RefreshCw size={11}/>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="fh-header-arc" />
        </header>

        {/* ── BODY ─────────────────────────────────────────────────────── */}
        <div className="fh-body">

          {/* Stats */}
          <div className="fh-stats">
            {farmStats.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="fh-stat-card">
                  <div className="fh-stat-icon" style={{ background: s.bg }}>
                    <Icon size={18} color={s.accent} />
                  </div>
                  <div className="fh-stat-val">{s.value}</div>
                  <div className="fh-stat-label">{s.label}</div>
                </div>
              );
            })}
          </div>

          {/* 5-Day Forecast */}
          {!weatherLoading && !weatherError && forecast.length > 0 && (
            <div className="fh-section">
              <div className="fh-section-head">
                <div>
                  <div className="fh-section-title">
                    {language==='hi'?'5 दिनों का पूर्वानुमान':language==='mr'?'5 दिवसांचा अंदाज':'5-Day Forecast'}
                  </div>
                </div>
              </div>
              <div className="fh-forecast-grid">
                {forecast.map((day, i) => (
                  <div key={i} className="fh-forecast-day">
                    <span className="fh-fc-day-label">{dayLabel(day.dayIndex)}</span>
                    <div className="fh-fc-icon">
                      <WeatherIcon code={day.code} size={18} color="white" />
                    </div>
                    <span className="fh-fc-max">{day.max}°</span>
                    <span className="fh-fc-min">{day.min}°</span>
                    {day.rain > 0 && (
                      <div className="fh-fc-rain">
                        <Droplets size={9}/>{day.rain}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginTop:8 }}>
                {forecast.map((day, i) => (
                  <p key={i} className="fh-fc-cond">{conditionLabel(day.code)}</p>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="fh-section">
            <div className="fh-section-head">
              <div>
                <div className="fh-section-title">{t('farmer.quickActions')}</div>
                <div className="fh-section-sub">
                  {language==='hi'?'आज क्या करना चाहेंगे?':language==='mr'?'आज काय करायचे आहे?':'What would you like to do today?'}
                </div>
              </div>
            </div>
            <div className="fh-actions-grid">
              {quickActions.map((a, i) => {
                const Icon = a.icon;
                return (
                  <button
                    key={i}
                    className="fh-action-btn"
                    style={{ background: a.bg, borderColor: `${a.accent}22` }}
                    onClick={() => navigate(a.path)}
                  >
                    {a.highlight && <div className="fh-action-pulse" />}
                    <div className="fh-action-icon" style={{ background: `${a.accent}18` }}>
                      <Icon size={20} color={a.accent} />
                    </div>
                    <div className="fh-action-name">{a.label}</div>
                    <div className="fh-action-desc">{a.desc}</div>
                    <div className="fh-action-arrow">
                      <ChevronRight size={16} color={a.accent} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Install Banner */}
          {canInstall && (
            <button className="fh-install-btn" onClick={install}>
              <span style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>📲</span>
                <span>{t('farmer.installApp')}</span>
              </span>
              <ChevronRight size={18} />
            </button>
          )}

          {/* Alerts */}
          <div className="fh-section">
            <div className="fh-section-head">
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:38, height:38, borderRadius:11, background:'#fff0e6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Bell size={18} color="#e67e22" />
                  </div>
                  {alerts.length > 0 && (
                    <div className="fh-alert-badge">{alerts.length}</div>
                  )}
                </div>
                <div>
                  <div className="fh-section-title">{t('farmer.latestAlerts')}</div>
                  <div className="fh-section-sub">
                    {language==='hi'?'मौसम अपडेट':language==='mr'?'हवामान अपडेट':'Weather & field updates'}
                  </div>
                </div>
              </div>
              <button className="fh-view-all" onClick={() => navigate('/farmer/alerts')}>
                {t('farmer.viewAll')} <ChevronRight size={13}/>
              </button>
            </div>

            {loading ? (
              <div style={{ padding:'24px 0' }}><Loading /></div>
            ) : alerts.length > 0 ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {alerts.map(alert => (
                  <AlertCard key={alert._id} alert={alert} language={language} />
                ))}
              </div>
            ) : (
              <div className="fh-alerts-empty">
                <div className="fh-alerts-empty-icon">
                  <Bell size={22} color="#b0a898" />
                </div>
                <div className="fh-alerts-empty-title">{t('farmer.noAlerts')}</div>
                <div className="fh-alerts-empty-sub">
                  {language==='hi'?'महत्वपूर्ण अपडेट आने पर सूचित किया जाएगा':language==='mr'?'महत्त्वाच्या अपडेटसाठी सूचित केले जाईल':"We'll notify you of important updates"}
                </div>
              </div>
            )}
          </div>

          {/* Motivational */}
          <div className="fh-motive">
            <div className="fh-motive-grain" />
            <div className="fh-motive-icon">
              <Sparkles size={24} color="#fbbf24" />
            </div>
            <div style={{ flex:1, position:'relative', zIndex:1 }}>
              <div className="fh-motive-title">
                {language==='hi'?'बढ़ते रहें! 🌱':language==='mr'?'वाढत राहा! 🌱':'Keep Growing! 🌱'}
              </div>
              <div className="fh-motive-body">
                {language==='hi'
                  ?'स्मार्ट खेती की ओर हर छोटा कदम कल की बड़ी फसल बनाता है।'
                  :language==='mr'
                  ?'स्मार्ट शेतीकडे प्रत्येक छोटे पाऊल उद्याची मोठी कापणी घडवते.'
                  :'Every small step towards smarter farming creates a bigger harvest tomorrow.'}
              </div>
            </div>
          </div>

        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default FarmerHome;