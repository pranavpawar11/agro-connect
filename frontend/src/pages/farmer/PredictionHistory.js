import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Sprout, TrendingUp, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BottomNav from '../../components/common/BottomNav';
import Loading from '../../components/common/Loading';
import cropPredictionService from '../../services/cropPredictionService';
import { formatDate } from '../../utils/helpers';

const PredictionHistory = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await cropPredictionService.getPredictionHistory();
      setPredictions(data.predictions);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'from-success-500 to-success-600';
    if (confidence >= 60) return 'from-warning-500 to-warning-600';
    return 'from-neutral-400 to-neutral-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white pb-20">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
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
              <Calendar className="w-5 h-5" />
              {t('farmer.history')}
            </h1>
            <p className="text-primary-100 text-sm mt-0.5">{t('prediction.historySubtitle')}</p>
          </div>
        </div>
      </div>

      <div className="p-4 animate-fade-in">
        {loading ? (
          <div className="py-12">
            <Loading />
          </div>
        ) : predictions?.length > 0 ? (
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div 
                key={prediction._id} 
                className="glass-effect rounded-2xl shadow-soft border border-neutral-200 overflow-hidden hover:shadow-medium transition-all animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Prediction Header */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-5 py-4 border-b border-primary-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2.5 rounded-xl shadow-soft">
                        <Sprout className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg capitalize text-primary-900">
                          {prediction.primaryCrop}
                        </h3>
                        <p className="text-xs text-primary-700 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(prediction.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Confidence Meter */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-neutral-700">{t('prediction.confidenceLevel')}</span>
                      <span className="text-sm font-bold text-neutral-900">{prediction.primaryConfidence}%</span>
                    </div>
                    <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${getConfidenceColor(prediction.primaryConfidence)} rounded-full transition-all duration-500 shadow-inner`}
                        style={{ width: `${prediction.primaryConfidence}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-neutral-600 mt-1.5 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {prediction.primaryConfidence >= 80
  ? t('prediction.confidence.high')
  : prediction.primaryConfidence >= 60
  ? t('prediction.confidence.medium')
  : t('prediction.confidence.low')}
                    </p>
                  </div>

                  {/* Location Info */}
                  {prediction.location?.district && (
                    <div className="bg-neutral-50 rounded-xl p-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neutral-600 shrink-0" />
                      <span className="text-sm font-medium text-neutral-700">
                        {prediction.location?.village || t('common.unknown')}, 
{prediction.location?.district || t('common.unknown')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-effect rounded-3xl p-12 text-center border border-neutral-200">
            <div className="bg-neutral-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Sprout className="w-10 h-10 text-neutral-400" />
            </div>
            <p className="text-neutral-600 font-semibold mb-1">{t('prediction.noHistory')}</p>
            <p className="text-sm text-neutral-500 mb-4">{t('prediction.noHistoryHint')}</p>
            <button
              onClick={() => navigate('/farmer/crop-prediction')}
              className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-xl font-bold shadow-medium hover:shadow-glow transition-all"
            >
              {t('prediction.startPrediction')}
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PredictionHistory;
