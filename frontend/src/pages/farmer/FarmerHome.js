import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, FileText, Bell, BookOpen, TrendingUp } from 'lucide-react';
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
      color: 'bg-green-100 text-green-600',
      path: '/farmer/crop-prediction',
    },
    {
      icon: FileText,
      label: t('farmer.contracts'),
      color: 'bg-blue-100 text-blue-600',
      path: '/farmer/contracts',
    },
    {
      icon: TrendingUp,
      label: 'Mandi Prices',
      color: 'bg-yellow-100 text-yellow-600',
      path: '/farmer/mandi-prices',
    },
    {
      icon: BookOpen,
      label: t('farmer.schemes'),
      color: 'bg-purple-100 text-purple-600',
      path: '/farmer/schemes',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-b-3xl">
        <h1 className="text-2xl font-bold mb-1">{t('common.welcome')}, {user?.name}!</h1>
        <p className="text-sm opacity-90">
          {user?.farmerDetails?.village}, {user?.farmerDetails?.district}
        </p>
      </div>

      <div className="px-4 -mt-3">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions..</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center justify-center p-4 rounded-xl hover:shadow-md transition-shadow"
                  style={{ background: action.color.split(' ')[0].replace('bg-', '#') + '20' }}
                >
                  <div className={`${action.color} p-3 rounded-full mb-2`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 text-center">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
         {canInstall && (
  <button
    onClick={install}
    className="mt-3 bg-white text-primary px-4 py-2 rounded-lg font-semibold shadow"
  >
    📲 Install AgroConnect App
  </button>
)}

        </div>

        {/* Latest Alerts */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Latest Alerts
            </h2>
            <button
              onClick={() => navigate('/farmer/alerts')}
              className="text-primary text-sm font-semibold"
            >
              View All
            </button>
          </div>

          {loading ? (
            <Loading />
          ) : alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <AlertCard key={alert._id} alert={alert} language={user?.language || 'en'} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No alerts available</p>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default FarmerHome;