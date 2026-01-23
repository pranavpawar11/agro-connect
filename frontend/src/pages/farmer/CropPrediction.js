import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/common/BottomNav';
import CropPredictionForm from '../../components/farmer/CropPredictionForm';
import PredictionResult from '../../components/farmer/PredictionResult';
import cropPredictionService from '../../services/cropPredictionService';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const CropPrediction = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async (formData) => {
    setLoading(true);
    try {
      const data = await cropPredictionService.predictCrop({
        ...formData,
        location: {
          village: user?.farmerDetails?.village,
          district: user?.farmerDetails?.district,
          state: user?.farmerDetails?.state,
        },
      });
      setPrediction(data.prediction);
      toast.success('Crop prediction successful!');
    } catch (error) {
      console.error('Prediction error:', error);
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
        <h1 className="text-xl font-bold">{t('farmer.cropPrediction')}</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Enter Soil & Weather Data</h2>
          <CropPredictionForm onSubmit={handlePredict} loading={loading} />
        </div>

        {prediction && (
          <PredictionResult prediction={prediction} language={user?.language || 'en'} />
        )}

        <button
          onClick={() => navigate('/farmer/prediction-history')}
          className="w-full bg-white text-primary py-3 rounded-lg font-semibold border-2 border-primary hover:bg-primary-light transition-colors"
        >
          {t('farmer.history')}
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default CropPrediction;