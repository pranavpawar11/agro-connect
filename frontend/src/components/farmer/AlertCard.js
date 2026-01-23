import React from 'react';
import { AlertTriangle, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useVoice from '../../hooks/useVoice';

const AlertCard = ({ alert, language }) => {
  const { t } = useTranslation();
  const { speak, isEnabled } = useVoice();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-500 text-red-800';
      case 'high':
        return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      default:
        return 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getMessage = () => {
    if (alert.weatherAlert?.message) {
      return alert.weatherAlert.message[language] || alert.weatherAlert.message.en;
    }
    return '';
  };

  const handleSpeak = () => {
    const message = getMessage();
    if (message) {
      speak(message, language);
    }
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${getSeverityColor(alert.weatherAlert?.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold uppercase text-xs">
                {alert.weatherAlert?.severity} Alert
              </span>
            </div>
            <p className="text-sm">{getMessage()}</p>
            {alert.weatherAlert?.district && (
              <p className="text-xs mt-2 opacity-75">
                {alert.weatherAlert.district}, {alert.weatherAlert.state}
              </p>
            )}
          </div>
        </div>
        {isEnabled && (
          <button
            onClick={handleSpeak}
            className="ml-2 p-2 hover:bg-white hover:bg-opacity-50 rounded-full transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;