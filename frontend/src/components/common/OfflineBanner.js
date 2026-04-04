import React from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useOnline from '../../hooks/useOnline';

const OfflineBanner = () => {
  const { t }    = useTranslation();
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <>
      <style>{`
        .ob-banner {
          position: fixed; top: 0; left: 0; right: 0; z-index: 60;
          background: #c0392b;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 9px 16px;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 2px 8px rgba(192,57,43,0.3);
        }
        .ob-text { font-size: 13px; font-weight: 700; color: #fff; }
      `}</style>

      <div className="ob-banner">
        <WifiOff size={15} color="#fff" />
        <span className="ob-text">{t('common.offline')}</span>
      </div>
    </>
  );
};

export default OfflineBanner;