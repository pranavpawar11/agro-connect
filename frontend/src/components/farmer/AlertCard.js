import React from 'react';
import { AlertTriangle, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useVoice from '../../hooks/useVoice';

const SEVERITY_META = {
  critical: { bar: '#c0392b', bg: '#fff5f5', border: '#f0d0d0', text: '#c0392b', iconBg: '#ffe0e0' },
  high:     { bar: '#e67e22', bg: '#fff8f0', border: '#f0d8b8', text: '#b86000', iconBg: '#fdecd8' },
  medium:   { bar: '#b87a00', bg: '#fdf6ea', border: '#f0d8a8', text: '#8a6000', iconBg: '#fdf3e0' },
  default:  { bar: '#1d4e89', bg: '#eef4fb', border: '#c2d6f0', text: '#1d4e89', iconBg: '#dbeafe' },
};

const AlertCard = ({ alert, language }) => {
  const { t }  = useTranslation();
  const { speak, isEnabled } = useVoice();

  const severity = alert.weatherAlert?.severity;
  const meta     = SEVERITY_META[severity] || SEVERITY_META.default;

  const getMessage = () => {
    if (alert.weatherAlert?.message) {
      return alert.weatherAlert.message[language] || alert.weatherAlert.message.en;
    }
    return '';
  };

  const handleSpeak = () => {
    const message = getMessage();
    if (message) speak(message, language);
  };

  return (
    <>
      <style>{`
        .ac-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #e8e2da;
          border-left: 4px solid transparent;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          font-family: 'DM Sans', sans-serif;
        }
        .ac-inner {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 14px;
        }
        .ac-icon-wrap {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .ac-severity {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.6px;
          margin-bottom: 5px;
          display: flex; align-items: center; gap: 6px;
        }
        .ac-severity-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }
        .ac-message {
          font-size: 13px; font-weight: 500; color: #2a2a2a; line-height: 1.55;
        }
        .ac-location {
          font-size: 11px; color: #9a9080; margin-top: 6px; font-weight: 500;
        }
        .ac-voice-btn {
          width: 34px; height: 34px; flex-shrink: 0; border-radius: 10px;
          background: none; border: 1px solid #e8e2da;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: #9a9080;
          transition: all 0.15s; margin-left: auto;
        }
        .ac-voice-btn:hover { background: #f0ede8; border-color: #c8bfb2; }
      `}</style>

      <div
        className="ac-card"
        style={{ borderLeftColor: meta.bar, background: meta.bg, borderColor: meta.border }}
      >
        <div className="ac-inner">
          <div className="ac-icon-wrap" style={{ background: meta.iconBg }}>
            <AlertTriangle size={18} color={meta.text} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="ac-severity" style={{ color: meta.text }}>
              <span className="ac-severity-dot" style={{ background: meta.bar }} />
              {severity} Alert
            </div>
            <p className="ac-message">{getMessage()}</p>
            {alert.weatherAlert?.district && (
              <p className="ac-location">
                {alert.weatherAlert.district}, {alert.weatherAlert.state}
              </p>
            )}
          </div>

          {isEnabled && (
            <button className="ac-voice-btn" onClick={handleSpeak}>
              <Volume2 size={15} />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AlertCard;