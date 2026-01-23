import React from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2, CheckCircle, Award } from 'lucide-react';
import useVoice from '../../hooks/useVoice';

const PredictionResult = ({ prediction, language }) => {
  const { t } = useTranslation();
  const { speak, isEnabled } = useVoice();

  const handleSpeak = () => {
    const text = `${t('prediction.recommended')} ${prediction.primaryCrop}. Confidence ${prediction.primaryConfidence} percent.`;
    speak(text, language);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-800">{t('prediction.result')}</h3>
        {isEnabled && (
          <button
            onClick={handleSpeak}
            className="p-2 bg-primary-light text-primary rounded-full hover:bg-primary hover:text-white transition-colors"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Award className="w-8 h-8" />
          <div>
            <p className="text-sm opacity-90">{t('prediction.recommended')}</p>
            <h2 className="text-3xl font-bold capitalize">{prediction.primaryCrop}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          <span className="text-lg">Confidence: {prediction.primaryConfidence}%</span>
        </div>
      </div>

      {prediction.otherRecommendations && prediction.otherRecommendations.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Other Recommendations:</h4>
          <div className="space-y-2">
            {prediction.otherRecommendations.map((rec, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="capitalize font-medium text-gray-700">{rec.crop}</span>
                <span className="text-sm text-gray-600">{rec.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionResult;