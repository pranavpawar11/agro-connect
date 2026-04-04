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
  const [loading, setLoading]         = useState(true);

  useEffect(() => { fetchHistory(); }, []);

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

  /* confidence colour — same logic, new palette */
  const getConfidenceMeta = (confidence) => {
    if (confidence >= 80) return { bar: '#2d6a4f', label: t('prediction.confidence.high'),   bg: '#d8f3dc', text: '#2d6a4f' };
    if (confidence >= 60) return { bar: '#b87a00', label: t('prediction.confidence.medium'), bg: '#fdf3e0', text: '#8a6000' };
    return                       { bar: '#9a9080', label: t('prediction.confidence.low'),    bg: '#f0ede8', text: '#6a6055' };
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ph-root {
          min-height: 100vh;
          background: #f7f3ee;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 84px;
        }

        /* ── HEADER ── */
        .ph-header {
          background: #1c3a1c;
          position: relative; overflow: hidden;
        }
        .ph-header-grain {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .ph-header-glow {
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,195,107,0.1) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .ph-header-arc {
          position: absolute; bottom: -2px; left: 0; right: 0;
          height: 32px; background: #f7f3ee;
          border-radius: 32px 32px 0 0; z-index: 2;
        }
        .ph-header-inner {
          position: relative; z-index: 1; padding: 20px 18px 36px;
        }
        .ph-title-row {
          display: flex; align-items: center; gap: 12px;
        }
        .ph-back-btn {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #f0ede8; transition: background 0.15s;
        }
        .ph-back-btn:hover { background: rgba(255,255,255,0.18); }
        .ph-title-icon {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .ph-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #f0ede8;
          letter-spacing: -0.3px; margin-bottom: 3px;
        }
        .ph-subtitle { font-size: 12px; color: rgba(240,237,232,0.5); font-weight: 500; }

        /* ── BODY ── */
        .ph-body { padding: 20px 16px 0; }

        /* prediction card */
        .ph-card {
          background: #fff; border-radius: 20px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          margin-bottom: 12px; overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .ph-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.09);
          transform: translateY(-1px);
        }

        /* card header strip */
        .ph-card-strip {
          background: #f0f7f2; padding: 16px 18px;
          border-bottom: 1px solid #c8dcc8;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ph-card-strip-left { display: flex; align-items: center; gap: 12px; }
        .ph-strip-icon {
          width: 44px; height: 44px; border-radius: 13px; flex-shrink: 0;
          background: linear-gradient(135deg, #52b788, #2d6a4f);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(45,106,79,0.22);
        }
        .ph-crop-name {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700; color: #1c2e1c;
          text-transform: capitalize; margin-bottom: 4px;
        }
        .ph-crop-date {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: #6a8a6a; font-weight: 500;
        }

        /* card body */
        .ph-card-body { padding: 16px 18px; }

        /* confidence meter */
        .ph-conf-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 8px;
        }
        .ph-conf-label { font-size: 12px; font-weight: 700; color: #4a4035; }
        .ph-conf-pct   { font-size: 13px; font-weight: 700; color: #1c2e1c; }
        .ph-conf-track {
          height: 10px; background: #f0ede8; border-radius: 99px;
          overflow: hidden; margin-bottom: 6px;
        }
        .ph-conf-bar {
          height: 100%; border-radius: 99px;
          transition: width 0.5s ease;
        }
        .ph-conf-note {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600;
          padding: 4px 10px; border-radius: 99px; display: inline-flex;
        }

        /* location row */
        .ph-location {
          display: flex; align-items: center; gap: 8px;
          background: #f7f3ee; border-radius: 12px;
          padding: 10px 12px; margin-top: 12px;
          border: 1px solid #ede8e0;
        }
        .ph-location-text {
          font-size: 12px; font-weight: 600; color: #4a4035;
        }

        /* divider */
        .ph-divider { height: 1px; background: #ede8e0; margin: 12px 0; }

        /* empty state */
        .ph-empty {
          background: #fff; border-radius: 20px; padding: 48px 24px;
          text-align: center; border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .ph-empty-icon {
          width: 72px; height: 72px; border-radius: 20px;
          background: #f0ede8; border: 1px solid #e8e2da;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
        }
        .ph-empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1c2e1c; margin-bottom: 6px;
        }
        .ph-empty-sub { font-size: 13px; color: #9a9080; margin-bottom: 20px; line-height: 1.55; }
        .ph-empty-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px; border-radius: 14px;
          background: #1c3a1c; border: none;
          color: #f0ede8; font-size: 14px; font-weight: 700;
          cursor: pointer; font-family: 'DM Sans', sans-serif;
          transition: background 0.15s;
          box-shadow: 0 4px 14px rgba(28,58,28,0.25);
        }
        .ph-empty-btn:hover { background: #2a5a2a; }
      `}</style>

      <div className="ph-root">

        {/* ── HEADER ── */}
        <header className="ph-header">
          <div className="ph-header-grain" />
          <div className="ph-header-glow" />

          <div className="ph-header-inner">
            <div className="ph-title-row">
              <button className="ph-back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
              </button>
              <div className="ph-title-icon">
                <Calendar size={18} color="#f0ede8" />
              </div>
              <div style={{ flex: 1 }}>
                <div className="ph-title">{t('farmer.history')}</div>
                <div className="ph-subtitle">{t('prediction.historySubtitle')}</div>
              </div>
            </div>
          </div>

          <div className="ph-header-arc" />
        </header>

        {/* ── BODY ── */}
        <div className="ph-body">
          {loading ? (
            <div style={{ padding: '48px 0' }}>
              <Loading />
            </div>

          ) : predictions?.length > 0 ? (
            predictions.map((prediction, index) => {
              const meta = getConfidenceMeta(prediction.primaryConfidence);
              return (
                <div key={prediction._id} className="ph-card">

                  {/* strip */}
                  <div className="ph-card-strip">
                    <div className="ph-card-strip-left">
                      <div className="ph-strip-icon">
                        <Sprout size={20} color="#fff" />
                      </div>
                      <div>
                        <div className="ph-crop-name">{prediction.primaryCrop}</div>
                        <div className="ph-crop-date">
                          <Calendar size={11} color="#6a8a6a" />
                          {formatDate(prediction.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* body */}
                  <div className="ph-card-body">

                    {/* confidence */}
                    <div className="ph-conf-header">
                      <span className="ph-conf-label">{t('prediction.confidenceLevel')}</span>
                      <span className="ph-conf-pct">{prediction.primaryConfidence}%</span>
                    </div>
                    <div className="ph-conf-track">
                      <div
                        className="ph-conf-bar"
                        style={{
                          width: `${prediction.primaryConfidence}%`,
                          background: meta.bar,
                        }}
                      />
                    </div>
                    <div
                      className="ph-conf-note"
                      style={{ background: meta.bg, color: meta.text }}
                    >
                      <TrendingUp size={11} />
                      {meta.label}
                    </div>

                    {/* location */}
                    {prediction.location?.district && (
                      <div className="ph-location">
                        <MapPin size={14} color="#9a9080" style={{ flexShrink: 0 }} />
                        <span className="ph-location-text">
                          {prediction.location?.village || t('common.unknown')},{' '}
                          {prediction.location?.district || t('common.unknown')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })

          ) : (
            <div className="ph-empty">
              <div className="ph-empty-icon">
                <Sprout size={32} color="#b0a898" />
              </div>
              <div className="ph-empty-title">{t('prediction.noHistory')}</div>
              <div className="ph-empty-sub">{t('prediction.noHistoryHint')}</div>
              <button
                className="ph-empty-btn"
                onClick={() => navigate('/farmer/crop-prediction')}
              >
                <Sprout size={16} />
                {t('prediction.startPrediction')}
              </button>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
    </>
  );
};

export default PredictionHistory;