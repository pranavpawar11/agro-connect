import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Sprout } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">{t('farmer.history')}</h1>
      </div>

      <div className="p-4">
        {loading ? (
          <Loading />
        ) : predictions.length > 0 ? (
          <div className="space-y-4">
            {predictions.map((prediction) => (
              <div key={prediction._id} className="bg-white rounded-xl shadow-md p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-light p-2 rounded-lg">
                      <Sprout className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg capitalize text-gray-800">
                        {prediction.primaryCrop}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Confidence: {prediction.primaryConfidence}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-gray-600 text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{formatDate(prediction.createdAt)}</span>
                </div>

                {prediction.location?.district && (
                  <p className="text-sm text-gray-500 mt-2">
                    {prediction.location.village}, {prediction.location.district}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Sprout className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No prediction history yet</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PredictionHistory;