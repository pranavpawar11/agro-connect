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
        state: user?.farmerDetails?.state,
      });
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative p-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-display font-bold flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t('farmer.alerts')}
            </h1>
            <p className="text-primary-100 text-sm mt-0.5">Weather & important updates</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4 animate-fade-in">
        {/* Quick Action - Mandi Prices */}
        <button
          onClick={() => navigate('/farmer/mandi-prices')}
          className="group w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-4 rounded-2xl font-bold text-base shadow-medium hover:shadow-glow transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5 group-hover:scale-110 transition-transform" />
          View Mandi Prices
        </button>

        {/* Alerts Section */}
        {loading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard key={alert._id} alert={alert} language={user?.language || 'en'} />
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-3xl p-12 text-center border border-neutral-200">
            <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-semibold mb-1">No alerts available</p>
            <p className="text-sm text-neutral-500">We'll notify you when there are weather updates</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Alerts;
