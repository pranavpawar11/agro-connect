import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{t('farmer.alerts')}</h1>
      </div>

      <div className="p-4">
        <button
          onClick={() => navigate('/farmer/mandi-prices')}
          className="w-full bg-white text-primary border-2 border-primary py-3 rounded-lg font-semibold hover:bg-primary-light transition-colors mb-4 flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-5 h-5" />
          View Mandi Prices
        </button>

        {loading ? (
          <Loading />
        ) : alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard key={alert._id} alert={alert} language={user?.language || 'en'} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No alerts available</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Alerts;