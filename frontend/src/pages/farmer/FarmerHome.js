import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sprout, FileText, Bell, BookOpen, TrendingUp, Sparkles,
  ChevronRight, Sun, Cloud, Droplets, Wind, MapPin,
  Activity, Award, Target, CloudRain, CloudSnow, Zap,
  CloudDrizzle, Eye, Thermometer, Globe, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import BottomNav from '../../components/common/BottomNav';
import useAuth from '../../hooks/useAuth';
import alertService from '../../services/alertService';
import AlertCard from '../../components/farmer/AlertCard';
import Loading from '../../components/common/Loading';
import useInstallPrompt from '../../hooks/useInstallPrompt';

// ─── Open-Meteo is completely free, no API key needed ───────────────────────
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

// WMO weather interpretation codes → icon + label map
const WMO_CODES = {
  0: { icon: Sun, en: 'Clear Sky', hi: 'साफ आसमान', mr: 'स्वच्छ आकाश' },
  1: { icon: Sun, en: 'Mainly Clear', hi: 'मुख्यतः साफ', mr: 'मुख्यतः स्वच्छ' },
  2: { icon: Cloud, en: 'Partly Cloudy', hi: 'आंशिक बादल', mr: 'अंशतः ढगाळ' },
  3: { icon: Cloud, en: 'Overcast', hi: 'पूरी तरह बादल', mr: 'पूर्णपणे ढगाळ' },
  45: { icon: Cloud, en: 'Foggy', hi: 'कोहरा', mr: 'धुके' },
  48: { icon: Cloud, en: 'Icy Fog', hi: 'बर्फीला कोहरा', mr: 'बर्फाळ धुके' },
  51: { icon: CloudDrizzle, en: 'Light Drizzle', hi: 'हल्की बूंदाबांदी', mr: 'हलकी रिमझिम' },
  53: { icon: CloudDrizzle, en: 'Drizzle', hi: 'बूंदाबांदी', mr: 'रिमझिम पाऊस' },
  55: { icon: CloudDrizzle, en: 'Heavy Drizzle', hi: 'भारी बूंदाबांदी', mr: 'जड रिमझिम' },
  61: { icon: CloudRain, en: 'Light Rain', hi: 'हल्की बारिश', mr: 'हलका पाऊस' },
  63: { icon: CloudRain, en: 'Rain', hi: 'बारिश', mr: 'पाऊस' },
  65: { icon: CloudRain, en: 'Heavy Rain', hi: 'भारी बारिश', mr: 'जड पाऊस' },
  71: { icon: CloudSnow, en: 'Light Snow', hi: 'हल्की बर्फ', mr: 'हलकी बर्फ' },
  73: { icon: CloudSnow, en: 'Snow', hi: 'बर्फबारी', mr: 'बर्फवृष्टी' },
  80: { icon: CloudRain, en: 'Rain Showers', hi: 'बौछार', mr: 'पावसाचा सरी' },
  95: { icon: Zap, en: 'Thunderstorm', hi: 'तूफान', mr: 'वादळ' },
  99: { icon: Zap, en: 'Heavy Thunderstorm', hi: 'भारी तूफान', mr: 'जड वादळ' },
};

const getWMO = (code) => WMO_CODES[code] || WMO_CODES[0];

// Day-of-week labels
const DAY_LABELS = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
  mr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरू', 'शुक्र', 'शनि'],
};

const TODAY_LABEL = { en: 'Today', hi: 'आज', mr: 'आज' };

const fetchWeather = async (lat, lon) => {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature',
    daily: 'temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: 6,
  });
  const res = await fetch(`${OPEN_METEO_URL}?${params}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
};

const FarmerHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { language, changeLanguage } = React.useContext(LanguageContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { canInstall, install } = useInstallPrompt();

  // Weather state
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    fetchAlerts();
    loadWeather();
    // eslint-disable-next-line
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await alertService.getWeatherAlerts({
        district: user?.farmerDetails?.district,
        state: user?.farmerDetails?.state,
      });
      setAlerts(data.alerts.slice(0, 3));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeather = useCallback(() => {
    setWeatherLoading(true);
    setWeatherError(null);

    if (!navigator.geolocation) {
      setWeatherError('Geolocation not supported');
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const data = await fetchWeather(latitude, longitude);
          const cur = data.current;
          setWeather({
            temp: Math.round(cur.temperature_2m),
            feelsLike: Math.round(cur.apparent_temperature),
            humidity: cur.relative_humidity_2m,
            windSpeed: Math.round(cur.wind_speed_10m),
            code: cur.weather_code,
          });

          // Build 5-day forecast (skip index 0 = today)
          const daily = data.daily;
          const days = daily.time.slice(1, 6).map((dateStr, i) => {
            const idx = i + 1;
            const d = new Date(dateStr);
            return {
              dayIndex: d.getDay(),
              code: daily.weather_code[idx],
              max: Math.round(daily.temperature_2m_max[idx]),
              min: Math.round(daily.temperature_2m_min[idx]),
              rain: daily.precipitation_probability_max[idx],
            };
          });
          setForecast(days);

          // Reverse geocode using nominatim (free)
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const geoData = await geoRes.json();
            const addr = geoData.address;
            setLocationName(
              addr.village || addr.town || addr.city || addr.county || addr.state || ''
            );
          } catch (_) {
            setLocationName('');
          }
        } catch (err) {
          console.error(err);
          setWeatherError('Failed to load weather');
        } finally {
          setWeatherLoading(false);
        }
      },
      (err) => {
        console.error(err);
        setWeatherError('Location access denied');
        setWeatherLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  const quickActions = [
    {
      icon: Sprout,
      label: t('farmer.predict'),
      description: 'AI recommendations',
      gradient: 'from-emerald-500 via-green-500 to-emerald-600',
      bgGradient: 'from-emerald-50 to-green-50',
      iconBg: 'from-emerald-500 to-green-600',
      path: '/farmer/crop-prediction',
      highlight: true,
    },
    {
      icon: FileText,
      label: t('farmer.contracts'),
      description: 'Browse opportunities',
      gradient: 'from-blue-500 via-cyan-500 to-blue-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'from-blue-500 to-cyan-600',
      path: '/farmer/contracts',
    },
    {
      icon: TrendingUp,
      label: t('farmer.mandiPrices'),
      description: 'Market rates',
      gradient: 'from-amber-500 via-orange-500 to-amber-600',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'from-amber-500 to-orange-600',
      path: '/farmer/mandi-prices',
    },
    {
      icon: BookOpen,
      label: t('farmer.schemes'),
      description: 'Government programs',
      gradient: 'from-purple-500 via-violet-500 to-purple-600',
      bgGradient: 'from-purple-50 to-violet-50',
      iconBg: 'from-purple-500 to-violet-600',
      path: '/farmer/schemes',
    },
  ];

  const farmStats = [
    { icon: Target, label: 'Active Contracts', value: '0', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Activity, label: 'Predictions', value: '0', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Award, label: 'Applications', value: '0', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // ── Weather icon helper ───────────────────────────────────────────────────
  const WeatherIcon = ({ code, className }) => {
    const Icon = getWMO(code).icon;
    return <Icon className={className} />;
  };

  const conditionLabel = (code) => {
    const entry = getWMO(code);
    return entry[language] || entry.en;
  };

  const dayLabel = (dayIndex, isToday) => {
    if (isToday) return TODAY_LABEL[language] || TODAY_LABEL.en;
    const days = DAY_LABELS[language] || DAY_LABELS.en;
    return days[dayIndex];
  };

  return (
    <div className="min-h-screen bg-gradient-mesh-light pb-20 farmland-pattern">
      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden topo-pattern">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute top-1/2 -left-32 w-80 h-80 bg-primary-400 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-300 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
        </div>


        <div className="relative p-6 pb-8">
          {/* Header Row */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse-soft" />
                  <span className="text-xs font-bold text-white/90">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                </div>

                {/* ── Language Switcher ─────────────────────────────────────────── */}
                <div className="flex items-center gap-2 ">
                  <Globe className="w-4 h-4 text-white/70" />
                  <div className="flex gap-1.5">
                    {[
                      { code: 'en', label: 'EN' },
                      { code: 'hi', label: 'हि' },
                      { code: 'mr', label: 'म' },
                    ].map((l) => (
                      <button
                        key={l.code}
                        onClick={() => changeLanguage(l.code)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${language === l.code
                            ? 'bg-white text-primary-700 shadow-md'
                            : 'bg-white/20 text-white/80 hover:bg-white/30'
                          }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 tracking-tight">
                {t('common.welcome')}, {user?.name}! 👋
              </h1>
              <div className="flex items-center gap-2 text-primary-100 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">
                  {locationName || `${user?.farmerDetails?.village}, ${user?.farmerDetails?.district}`}
                </span>
              </div>
            </div>

            {/* Profile Avatar */}
            <button
              onClick={() => navigate('/farmer/profile')}
              className="group relative bg-white/20 backdrop-blur-sm w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-all duration-300 border-2 border-white/30 hover:border-white/50 hover:scale-105 shadow-lg"
            >
              <span className="text-2xl font-bold group-hover:scale-110 transition-transform">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-400 rounded-full border-2 border-primary-700 status-pulse"></div>
            </button>
          </div>



          {/* ── Current Weather Widget ────────────────────────────────────── */}
          <div className="glass-effect backdrop-blur-xl border border-white/30 rounded-2xl p-4 mb-4 shadow-lg">
            {weatherLoading ? (
              <div className="flex items-center justify-center py-4 gap-3">
                <RefreshCw className="w-5 h-5 text-white/60 animate-spin" />
                <span className="text-white/70 text-sm">
                  {language === 'hi' ? 'मौसम लोड हो रहा है...' : language === 'mr' ? 'हवामान लोड होत आहे...' : 'Loading weather...'}
                </span>
              </div>
            ) : weatherError ? (
              <div className="flex items-center justify-between">
                <span className="text-white/70 text-sm">
                  {language === 'hi' ? 'मौसम उपलब्ध नहीं' : language === 'mr' ? 'हवामान उपलब्ध नाही' : 'Weather unavailable'}
                </span>
                <button onClick={loadWeather} className="text-white/80 hover:text-white text-xs underline flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" />
                  {language === 'hi' ? 'पुनः प्रयास' : language === 'mr' ? 'पुन्हा प्रयत्न' : 'Retry'}
                </button>
              </div>
            ) : weather ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-soft">
                    <WeatherIcon code={weather.code} className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{weather.temp}</span>
                      <span className="text-lg text-white/80">°C</span>
                    </div>
                    <p className="text-sm text-white/90 font-medium">{conditionLabel(weather.code)}</p>
                    <p className="text-xs text-white/60">
                      {language === 'hi' ? `तापमान: ${weather.feelsLike}°C` : language === 'mr' ? `तापमान: ${weather.feelsLike}°C` : `Feels like ${weather.feelsLike}°C`}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1.5">
                  <div className="flex items-center gap-1.5 text-white/90 text-xs justify-end">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{weather.humidity}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/90 text-xs justify-end">
                    <Wind className="w-3.5 h-3.5" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                  <button onClick={loadWeather} className="flex items-center gap-1 text-white/50 hover:text-white/80 text-xs transition-colors justify-end">
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

         
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="px-4 -mt-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          {farmStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="glass-card rounded-2xl p-4 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${stat.bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-neutral-900 mb-0.5">{stat.value}</div>
                <div className="text-xs text-neutral-600 font-medium leading-tight">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* ── 5-Day Forecast ──────────────────────────────────────────────── */}
        {!weatherLoading && !weatherError && forecast.length > 0 && (
          <div className="glass-card rounded-3xl shadow-strong p-5 border-2 border-white/50 animate-fade-in" style={{ animationDelay: '0.15s' }}>
            <h2 className="text-base font-display font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-cyan-600 rounded-full"></div>
              {language === 'hi' ? '5 दिनों का पूर्वानुमान' : language === 'mr' ? '5 दिवसांचा अंदाज' : '5-Day Forecast'}
            </h2>

            <div className="grid grid-cols-5 gap-2">
              {forecast.map((day, i) => {
                const todayDayIndex = new Date().getDay();
                const isToday = i === 0; // first forecast day is tomorrow actually; adjust as needed
                return (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50 border border-blue-100/60 animate-scale-in"
                    style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                  >
                    <span className="text-xs font-bold text-neutral-600">
                      {dayLabel(day.dayIndex, false)}
                    </span>
                    <div className="bg-gradient-to-br from-blue-400 to-sky-600 p-2 rounded-xl">
                      <WeatherIcon code={day.code} className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-bold text-neutral-900">{day.max}°</span>
                    <span className="text-xs text-neutral-400">{day.min}°</span>
                    {day.rain > 0 && (
                      <div className="flex items-center gap-0.5">
                        <Droplets className="w-2.5 h-2.5 text-blue-500" />
                        <span className="text-[10px] text-blue-600 font-semibold">{day.rain}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Condition labels below */}
            <div className="grid grid-cols-5 gap-2 mt-2">
              {forecast.map((day, i) => (
                <p key={i} className="text-[9px] text-center text-neutral-500 leading-tight font-medium px-0.5">
                  {conditionLabel(day.code)}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="glass-card rounded-3xl shadow-strong p-6 border-2 border-white/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                {t('farmer.quickActions')}
              </h2>
              <p className="text-sm text-neutral-600 mt-1 ml-5">
                {language === 'hi' ? 'आज आप क्या करना चाहेंगे?' : language === 'mr' ? 'आज काय करायचे आहे?' : 'What would you like to do today?'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className={`group relative bg-gradient-to-br ${action.bgGradient} rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-white interactive-card animate-scale-in ${action.highlight ? 'ring-2 ring-primary-300 ring-offset-2' : ''}`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                  {action.highlight && (
                    <div className="absolute top-3 right-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                      </span>
                    </div>
                  )}

                  <div className="relative flex flex-col items-start gap-3">
                    <div className={`bg-gradient-to-br ${action.iconBg} p-4 rounded-2xl shadow-medium group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-bold text-neutral-900 mb-1 leading-tight">{action.label}</div>
                      <div className="text-xs text-neutral-600 font-medium leading-tight">{action.description}</div>
                    </div>
                  </div>

                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Latest Alerts */}
        <div className="glass-card rounded-3xl shadow-strong p-6 border-2 border-white/50 animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-red-500 to-orange-600 p-2.5 rounded-xl shadow-soft">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white animate-pulse-soft">
                    {alerts.length}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-neutral-900">{t('farmer.latestAlerts')}</h2>
                <p className="text-xs text-neutral-600">
                  {language === 'hi' ? 'मौसम अपडेट' : language === 'mr' ? 'हवामान अपडेट' : 'Stay updated with weather'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/farmer/alerts')}
              className="text-primary-700 text-sm font-bold hover:text-primary-800 transition-colors flex items-center gap-1 group bg-primary-50 px-3 py-2 rounded-xl hover:bg-primary-100"
            >
              {t('farmer.viewAll')}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {loading ? (
            <div className="py-8"><Loading /></div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={alert._id} className="animate-slide-in-right" style={{ animationDelay: `${0.7 + index * 0.1}s` }}>
                  <AlertCard alert={alert} language={language} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300">
              <div className="bg-neutral-200 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-neutral-400" />
              </div>
              <p className="text-neutral-600 font-semibold mb-1">{t('farmer.noAlerts')}</p>
              <p className="text-sm text-neutral-500">
                {language === 'hi' ? 'महत्वपूर्ण अपडेट आने पर सूचित किया जाएगा' : language === 'mr' ? 'महत्त्वाच्या अपडेटसाठी सूचित केले जाईल' : "We'll notify you of important updates"}
              </p>
            </div>
          )}
        </div>

         {/* Install App Banner */}
          {canInstall && (
            <button
              onClick={install}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3.5 rounded-2xl font-bold shadow-glow-amber hover:shadow-xl transition-all flex items-center justify-between group animate-bounce-in border-2 border-yellow-300/50"
            >
              <span className="flex items-center gap-2.5">
                <span className="text-xl">📲</span>
                <span>{t('farmer.installApp')}</span>
              </span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

        {/* Motivational Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 text-white shadow-strong animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="absolute inset-0 bg-farmland-pattern opacity-10"></div>
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-float" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                {language === 'hi' ? 'बढ़ते रहें! 🌱' : language === 'mr' ? 'वाढत राहा! 🌱' : 'Keep Growing! 🌱'}
              </h3>
              <p className="text-sm text-primary-100 leading-relaxed">
                {language === 'hi'
                  ? 'स्मार्ट खेती की ओर हर छोटा कदम कल की बड़ी फसल बनाता है।'
                  : language === 'mr'
                    ? 'स्मार्ट शेतीकडे प्रत्येक छोटे पाऊल उद्याची मोठी कापणी घडवते.'
                    : 'Every small step towards smarter farming creates a bigger harvest tomorrow.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FarmerHome;