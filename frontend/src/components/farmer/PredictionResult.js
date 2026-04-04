import React from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, CheckCircle, Award, Sprout } from 'lucide-react';
import useVoice from '../../hooks/useVoice';

const PredictionResult = ({ prediction, language }) => {
  const { t }  = useTranslation();
  const { speak, isEnabled } = useVoice();

  const handleSpeak = () => {
    const text = `${t('prediction.recommended')} ${prediction.primaryCrop}. Confidence ${prediction.primaryConfidence} percent.`;
    speak(text, language);
  };

  const confColor =
    prediction.primaryConfidence >= 80 ? '#2d6a4f' :
    prediction.primaryConfidence >= 60 ? '#b87a00' : '#6a6055';

  return (
    <>
      <style>{`
        .pr-result {
          background: #fff; border-radius: 20px; padding: 20px;
          border: 1px solid #e8e2da;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          font-family: 'DM Sans', sans-serif;
        }
        .pr-result-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .pr-result-title {
          font-family: 'Playfair Display', serif;
          font-size: 17px; font-weight: 700; color: #1c2e1c;
        }
        .pr-voice-btn {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          background: #f0f7f2; border: 1.5px solid #c8dcc8;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #2d6a4f; transition: all 0.15s;
        }
        .pr-voice-btn:hover { background: #d8f3dc; }

        /* primary crop banner */
        .pr-primary {
          background: #1c3a1c; border-radius: 16px; padding: 18px;
          position: relative; overflow: hidden; margin-bottom: 14px;
        }
        .pr-primary-grain {
          position: absolute; inset: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
        }
        .pr-primary-inner {
          position: relative; z-index: 1;
          display: flex; align-items: center; gap: 14px; margin-bottom: 14px;
        }
        .pr-primary-icon {
          width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        }
        .pr-recommended-label {
          font-size: 10px; font-weight: 700; color: rgba(240,237,232,0.5);
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
        }
        .pr-crop-name {
          font-family: 'Playfair Display', serif;
          font-size: 26px; font-weight: 700; color: #f0ede8;
          text-transform: capitalize; letter-spacing: -0.3px;
        }
        .pr-conf-row {
          position: relative; z-index: 1;
        }
        .pr-conf-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 7px;
        }
        .pr-conf-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 700; color: rgba(240,237,232,0.6);
        }
        .pr-conf-pct {
          font-size: 15px; font-weight: 700; color: #f0ede8;
        }
        .pr-conf-track {
          height: 8px; background: rgba(255,255,255,0.12);
          border-radius: 99px; overflow: hidden;
        }
        .pr-conf-bar {
          height: 100%; border-radius: 99px; transition: width 0.6s ease;
        }

        /* other recommendations */
        .pr-others-title {
          font-size: 12px; font-weight: 700; color: #6a6055;
          text-transform: uppercase; letter-spacing: 0.4px;
          margin-bottom: 10px;
        }
        .pr-other-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 12px; border-radius: 11px;
          background: #f7f3ee; border: 1px solid #ede8e0;
          margin-bottom: 8px;
        }
        .pr-other-item:last-child { margin-bottom: 0; }
        .pr-other-crop {
          font-size: 13px; font-weight: 700; color: #1c2e1c; text-transform: capitalize;
        }
        .pr-other-conf {
          font-size: 12px; font-weight: 700; color: #9a9080;
        }
      `}</style>

      <div className="pr-result">
        <div className="pr-result-head">
          <div className="pr-result-title">{t('prediction.result')}</div>
          {isEnabled && (
            <button className="pr-voice-btn" onClick={handleSpeak}>
              <Volume2 size={16} />
            </button>
          )}
        </div>

        {/* Primary crop */}
        <div className="pr-primary">
          <div className="pr-primary-grain" />
          <div className="pr-primary-inner">
            <div className="pr-primary-icon">
              <Award size={26} color="#fbbf24" />
            </div>
            <div>
              <div className="pr-recommended-label">{t('prediction.recommended')}</div>
              <div className="pr-crop-name">{prediction.primaryCrop}</div>
            </div>
          </div>
          <div className="pr-conf-row">
            <div className="pr-conf-header">
              <div className="pr-conf-label">
                <CheckCircle size={12} color="rgba(240,237,232,0.6)" />
                Confidence
              </div>
              <span className="pr-conf-pct">{prediction.primaryConfidence}%</span>
            </div>
            <div className="pr-conf-track">
              <div
                className="pr-conf-bar"
                style={{
                  width: `${prediction.primaryConfidence}%`,
                  background: confColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Other recommendations */}
        {prediction.otherRecommendations?.length > 0 && (
          <div>
            <div className="pr-others-title">Other Recommendations</div>
            {prediction.otherRecommendations.map((rec, i) => (
              <div key={i} className="pr-other-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sprout size={14} color="#9a9080" />
                  <span className="pr-other-crop">{rec.crop}</span>
                </div>
                <span className="pr-other-conf">{rec.confidence}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PredictionResult;