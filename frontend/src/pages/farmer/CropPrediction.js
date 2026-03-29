import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Sparkles, History, Brain, Zap, TrendingUp, Info } from 'lucide-react';
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
      toast.success(t('prediction.success'));
    } catch (error) {
      console.error('Prediction error:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Brain,
      title: t('prediction.features.ai.title'),
      description: t('prediction.features.ai.desc'),
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Zap,
      title: t('prediction.features.instant.title'),
      description: t('prediction.features.instant.desc'),
      color: 'from-yellow-500 to-orange-600'
    },
    {
      icon: TrendingUp,
      title: t('prediction.features.data.title'),
      description: t('prediction.features.data.desc'),
      color: 'from-green-500 to-emerald-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh-light pb-20 farmland-pattern">
      {/* Enhanced Header with Gradient */}
      <div className="relative bg-gradient-to-br from-primary-700 via-emerald-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute top-1/2 -left-24 w-64 h-64 bg-emerald-400 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-white/20 rounded-xl transition-colors active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold flex items-center gap-2.5 tracking-tight">
                <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse-soft" />
                </div>
                {t('farmer.cropPrediction')}
              </h1>
              <p className="text-primary-100 text-sm mt-1.5 ml-1">{t('prediction.subtitle')}</p>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="glass-effect backdrop-blur-xl border border-white/30 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shrink-0 animate-slide-in-right shadow-soft"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`bg-gradient-to-br ${feature.color} p-1.5 rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{feature.title}</div>
                    <div className="text-[10px] text-white/80">{feature.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-5 animate-fade-in">
        {/* Main Prediction Card */}
        <div className="glass-card rounded-3xl shadow-xl p-6 md:p-8 border-2 border-white/50 relative overflow-hidden">
          {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-200/20 to-emerald-200/20 rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10">
            {/* Card Header */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b-2 border-neutral-100">
              <div className="bg-gradient-to-br from-emerald-500 to-primary-700 p-4 rounded-2xl shadow-medium">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-display font-bold text-neutral-900 mb-1">
                  {t('prediction.formTitle')}
                </h2>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {t('prediction.formDesc')}
                </p>
              </div>
            </div>

            {/* Form Component */}
            <CropPredictionForm onSubmit={handlePredict} loading={loading} />
          </div>
        </div>

        {/* Prediction Result */}
        {prediction && (
          <div className="animate-scale-in">
            <PredictionResult prediction={prediction} language={user?.language || 'en'} />
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex gap-3">
          {/* View History Button */}
          <button
            onClick={() => navigate('/farmer/prediction-history')}
            className="group flex-1 glass-card border-2 border-primary-300 text-primary-800 py-4 rounded-2xl font-bold text-base shadow-soft hover:shadow-card-hover hover:border-primary-500 transition-all flex items-center justify-center gap-2.5 active:scale-[0.98]"
          >
            <History className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span>{t('farmer.history')}</span>
          </button>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* How It Works Card */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border-2 border-blue-200/50 shadow-soft">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2.5 rounded-xl shadow-soft shrink-0">
                <Info className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-blue-900 text-base">{t('prediction.howItWorks.title')}</h3>
            </div>
            <p className="text-sm text-blue-800 leading-relaxed ml-11">
              {t('prediction.howItWorks.desc')}
            </p>
          </div>

          {/* Accuracy Tips Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-200/50 shadow-soft">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2.5 rounded-xl shadow-soft shrink-0">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-amber-900 text-base">{t('prediction.tips.title')}</h3>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed ml-11">
              {t('prediction.tips.desc')}
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-emerald-600 to-primary-700 p-6 text-white shadow-xl">
          <div className="absolute inset-0 bg-farmland-pattern opacity-10"></div>
          <div className="relative">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              {t('prediction.benefits.title')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🎯', text: t('prediction.benefits.items.yield') },
                { icon: '💰', text: t('prediction.benefits.items.profit') },
                { icon: '🌱', text: t('prediction.benefits.items.soil') },
                { icon: '⚡', text: t('prediction.benefits.items.decisions') },
              ].map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2.5 border border-white/20"
                >
                  <span className="text-2xl">{benefit.icon}</span>
                  <span className="text-sm font-semibold">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default CropPrediction;
