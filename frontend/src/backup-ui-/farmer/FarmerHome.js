import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sprout, FileText, Bell, BookOpen, TrendingUp, Sparkles, 
  ChevronRight, Sun, Cloud, Droplets, Wind, MapPin, Calendar,
  Activity, Award, Target
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import useAuth from '../../hooks/useAuth';
import alertService from '../../services/alertService';
import AlertCard from '../../components/farmer/AlertCard';
import Loading from '../../components/common/Loading';
import useInstallPrompt from '../../hooks/useInstallPrompt';

const FarmerHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { canInstall, install } = useInstallPrompt();

  useEffect(() => {
    fetchAlerts();
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

  // Mock stats - replace with real data from your API
  const farmStats = [
    { icon: Target, label: 'Active Contracts', value: '0', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Activity, label: 'Predictions', value: '0', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Award, label: 'Applications', value: '0', color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  // Mock weather - replace with real API data
  const currentWeather = {
    temp: '28',
    condition: 'Partly Cloudy',
    humidity: '65',
    windSpeed: '12',
  };

  return (
    <div className="min-h-screen bg-gradient-mesh-light pb-20 farmland-pattern">
      {/* Enhanced Hero Header with Weather */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden topo-pattern">
        {/* Animated Background Elements */}
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
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 tracking-tight">
                {t('common.welcome')}, {user?.name}! 👋
              </h1>
              <div className="flex items-center gap-2 text-primary-100 text-sm">
                <MapPin className="w-4 h-4" />
                <span className="font-medium">
                  {user?.farmerDetails?.village}, {user?.farmerDetails?.district}
                </span>
              </div>
            </div>
            
            {/* Enhanced Profile Avatar */}
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

          {/* Compact Weather Widget */}
          <div className="glass-effect backdrop-blur-xl border border-white/30 rounded-2xl p-4 mb-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-soft">
                  <Sun className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-white">{currentWeather.temp}</span>
                    <span className="text-lg text-white/80">°C</span>
                  </div>
                  <p className="text-sm text-white/90 font-medium">{currentWeather.condition}</p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center gap-1.5 text-white/90 text-xs">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{currentWeather.humidity}%</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/90 text-xs">
                  <Wind className="w-3.5 h-3.5" />
                  <span>{currentWeather.windSpeed} km/h</span>
                </div>
              </div>
            </div>
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
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 -mt-6 space-y-6">
        {/* Quick Stats Cards - New Section */}
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

        {/* Quick Actions - Enhanced with Hover Effects */}
        <div className="glass-card rounded-3xl shadow-strong p-6 border-2 border-white/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
                <div className="w-1.5 h-8 bg-gradient-to-b from-primary-500 to-primary-700 rounded-full"></div>
                {t('farmer.quickActions')}
              </h2>
              <p className="text-sm text-neutral-600 mt-1 ml-5">What would you like to do today?</p>
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
                  {/* Gradient Shine Effect on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  {/* Highlight Badge */}
                  {action.highlight && (
                    <div className="absolute top-3 right-3">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                      </span>
                    </div>
                  )}
                  
                  <div className="relative flex flex-col items-start gap-3">
                    {/* Icon with Enhanced Gradient */}
                    <div className={`bg-gradient-to-br ${action.iconBg} p-4 rounded-2xl shadow-medium group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    <div className="text-left">
                      <div className="text-sm font-bold text-neutral-900 mb-1 leading-tight">
                        {action.label}
                      </div>
                      <div className="text-xs text-neutral-600 font-medium leading-tight">
                        {action.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow Indicator */}
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-neutral-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Latest Alerts Section - Enhanced */}
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
                <h2 className="text-lg font-display font-bold text-neutral-900">
                  {t('farmer.latestAlerts')}
                </h2>
                <p className="text-xs text-neutral-600">Stay updated with weather</p>
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
            <div className="py-8">
              <Loading />
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={alert._id}
                  className="animate-slide-in-right"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <AlertCard alert={alert} language={user?.language || 'en'} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gradient-to-br from-neutral-50 to-neutral-100 rounded-2xl border-2 border-dashed border-neutral-300">
              <div className="bg-neutral-200 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-neutral-400" />
              </div>
              <p className="text-neutral-600 font-semibold mb-1">
                {t('farmer.noAlerts')}
              </p>
              <p className="text-sm text-neutral-500">
                We'll notify you of important updates
              </p>
            </div>
          )}
        </div>

        {/* Motivational Card - New */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 p-6 text-white shadow-strong animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="absolute inset-0 bg-farmland-pattern opacity-10"></div>
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Sparkles className="w-8 h-8 text-yellow-300 animate-float" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">Keep Growing! 🌱</h3>
              <p className="text-sm text-primary-100 leading-relaxed">
                Every small step towards smarter farming creates a bigger harvest tomorrow.
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
