import React from 'react';
import { WifiOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useOnline from '../../hooks/useOnline';

const OfflineBanner = () => {
  const { t } = useTranslation();
  const isOnline = useOnline();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white py-2 px-4 flex items-center justify-center z-50">
      <WifiOff className="w-5 h-5 mr-2" />
      <span className="text-sm font-medium">{t('common.offline')}</span>
    </div>
  );
};

export default OfflineBanner;