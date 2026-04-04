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
          village:  user?.farmerDetails?.village,
          district: user?.farmerDetails?.district,
          state:    user?.farmerDetails?.state,
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
      accent: '#5b21b6',
      bg: '#ede9fe',
    },
    {
      icon: Zap,
      title: t('prediction.features.instant.title'),
      description: t('prediction.features.instant.desc'),
      accent: '#b87a00',
      bg: '#fdf3e0',
    },
    {
      icon: TrendingUp,
      title: t('prediction.features.data.title'),
      description: t('prediction.features.data.desc'),
      accent: '#2d6a4f',
      bg: '#d8f3dc',
    },
  ];

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cp-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .cp-header {
          background: #1c3a1c;
          position: relative;
          overflow: hidden;
        }
        .cp-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .cp-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,195,107,0.1) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .cp-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 32px; background: #f7f3ee;
          border-radius: 32px 32px 0 0; z-index: 2;
        }
        .cp-header-inner {
          position: relative; z-index: 1; padding: 20px 18px 36px;
        }

        /* title row */
        .cp-title-row {
          display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
        }
        .cp-back-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .cp-back-btn:hover { background: rgba(255,255,255,0.18); }
        .cp-title-icon {
          width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          display: flex; align-items: center; justify-content: center;
        }
        .cp-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.3px; margin-bottom: 3px;
        }
        .cp-subtitle { font-size: 12px; color: rgba(240,237,232,0.5); font-weight: 500; }

        /* feature pills */
        .cp-pills {
          display: flex; gap: 8px;
          overflow-x: auto; padding-bottom: 4px;
        }
        .cp-pills::-webkit-scrollbar { display: none; }
        .cp-pill {
          display: flex; align-items: center; gap: 10px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 14px; padding: 10px 14px;
          flex-shrink: 0;
        }
        .cp-pill-icon {
          width: 32px; height: 32px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cp-pill-title { font-size: 12px; font-weight: 700; color: #f0ede8; margin-bottom: 2px; }
        .cp-pill-desc  { font-size: 10px; color: rgba(240,237,232,0.55); }

        /* ── BODY ── */
        .cp-body { padding: 20px 16px 0; }

        /* main form card */
        .cp-form-card {
          background: #fff; border-radius: 20px; padding: 22px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 14px;
          position: relative; overflow: hidden;
        }
        .cp-form-card-glow {
          position: absolute; top: -40px; right: -40px;
          width: 160px; height: 160px; border-radius: 50%;
          background: radial-gradient(circle, rgba(45,106,79,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .cp-form-head {
          display: flex; align-items: flex-start; gap: 14px;
          padding-bottom: 18px; margin-bottom: 20px;
          border-bottom: 1px solid #ede8e0;
          position: relative; z-index: 1;
        }
        .cp-form-head-icon {
          width: 48px; height: 48px; border-radius: 14px; flex-shrink: 0;
          background: linear-gradient(135deg, #52b788, #2d6a4f);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(45,106,79,0.25);
        }
        .cp-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1c2e1c;
          margin-bottom: 4px;
        }
        .cp-form-desc { font-size: 12px; color: #9a9080; line-height: 1.55; }

        /* history button */
        .cp-history-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 13px; border-radius: 14px;
          background: #fff; border: 1.5px solid #c8dcc8;
          color: #2d6a4f; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: all 0.15s; margin-bottom: 14px;
        }
        .cp-history-btn:hover { background: #d8f3dc; border-color: #2d6a4f; }

        /* info grid */
        .cp-info-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
          margin-bottom: 14px;
        }
        .cp-info-tile {
          border-radius: 16px; padding: 16px;
          border: 1px solid transparent;
        }
        .cp-info-tile.blue { background: #eef4fb; border-color: #c2d6f0; }
        .cp-info-tile.amber{ background: #fdf6ea; border-color: #f0d8a8; }
        .cp-info-tile-head {
          display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
        }
        .cp-info-tile-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cp-info-tile-title { font-size: 13px; font-weight: 700; }
        .cp-info-tile.blue  .cp-info-tile-title { color: #1d4e89; }
        .cp-info-tile.amber .cp-info-tile-title { color: #8a6000; }
        .cp-info-tile-body { font-size: 11px; line-height: 1.55; }
        .cp-info-tile.blue  .cp-info-tile-body { color: #2a5a8a; }
        .cp-info-tile.amber .cp-info-tile-body { color: #7a5500; }

        /* benefits dark card */
        .cp-benefits {
          background: #1c3a1c; border-radius: 20px; padding: 20px;
          position: relative; overflow: hidden; margin-bottom: 8px;
        }
        .cp-benefits-grain {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .cp-benefits-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700; color: #f0ede8;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px; position: relative; z-index: 1;
        }
        .cp-benefits-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          position: relative; z-index: 1;
        }
        .cp-benefit-item {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px; padding: 12px 14px;
          display: flex; align-items: center; gap: 10px;
        }
        .cp-benefit-emoji { font-size: 22px; flex-shrink: 0; }
        .cp-benefit-text { font-size: 12px; font-weight: 600; color: rgba(240,237,232,0.85); line-height: 1.4; }

        @media (max-width: 360px) {
          .cp-info-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cp-root">

        {/* ── HEADER ── */}
        <header className="cp-header">
          <div className="cp-header-grain" />
          <div className="cp-header-glow" />

          <div className="cp-header-inner">
            {/* Title row */}
            <div className="cp-title-row">
              <button className="cp-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
              </button>
              {/* <div className="cp-title-icon">
                <Sparkles size={20} color="#fbbf24" />
              </div> */}
              <div style={{ flex: 1 }}>
                <div className="cp-title">{t('farmer.cropPrediction')}</div>
                <div className="cp-subtitle">{t('prediction.subtitle')}</div>
              </div>
            </div>

            {/* Feature pills */}
            <div className="cp-pills">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="cp-pill">
                    <div className="cp-pill-icon" style={{ background: feature.bg }}>
                      <Icon size={16} color={feature.accent} />
                    </div>
                    <div>
                      <div className="cp-pill-title">{feature.title}</div>
                      <div className="cp-pill-desc">{feature.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cp-header-arc" />
        </header>

        {/* ── BODY ── */}
        <div className="cp-body">

          {/* Main form card */}
          <div className="cp-form-card">
            <div className="cp-form-card-glow" />
            <div className="cp-form-head">
              <div className="cp-form-head-icon">
                <Sparkles size={22} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="cp-form-title">{t('prediction.formTitle')}</div>
                <div className="cp-form-desc">{t('prediction.formDesc')}</div>
              </div>
            </div>
            {/* Form component — untouched */}
            <CropPredictionForm onSubmit={handlePredict} loading={loading} />
          </div>

          {/* Prediction result — untouched */}
          {prediction && (
            <PredictionResult prediction={prediction} language={user?.language || 'en'} />
          )}

          {/* History button */}
          <button className="cp-history-btn" onClick={() => navigate('/farmer/prediction-history')}>
            <History size={17} />
            {t('farmer.history')}
          </button>

          {/* Info tiles */}
          <div className="cp-info-grid">
            <div className="cp-info-tile blue">
              <div className="cp-info-tile-head">
                <div className="cp-info-tile-icon" style={{ background: '#dbeafe' }}>
                  <Info size={16} color="#1d4e89" />
                </div>
                <div className="cp-info-tile-title">{t('prediction.howItWorks.title')}</div>
              </div>
              <div className="cp-info-tile-body">{t('prediction.howItWorks.desc')}</div>
            </div>
            <div className="cp-info-tile amber">
              <div className="cp-info-tile-head">
                <div className="cp-info-tile-icon" style={{ background: '#fdf3e0' }}>
                  <TrendingUp size={16} color="#b87a00" />
                </div>
                <div className="cp-info-tile-title">{t('prediction.tips.title')}</div>
              </div>
              <div className="cp-info-tile-body">{t('prediction.tips.desc')}</div>
            </div>
          </div>

          {/* Benefits dark card */}
          <div className="cp-benefits">
            <div className="cp-benefits-grain" />
            <div className="cp-benefits-title">
              <Sparkles size={17} color="#fbbf24" />
              {t('prediction.benefits.title')}
            </div>
            <div className="cp-benefits-grid">
              {[
                { emoji: '🎯', text: t('prediction.benefits.items.yield') },
                { emoji: '💰', text: t('prediction.benefits.items.profit') },
                { emoji: '🌱', text: t('prediction.benefits.items.soil') },
                { emoji: '⚡', text: t('prediction.benefits.items.decisions') },
              ].map((benefit, index) => (
                <div key={index} className="cp-benefit-item">
                  <span className="cp-benefit-emoji">{benefit.emoji}</span>
                  <span className="cp-benefit-text">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default CropPrediction;