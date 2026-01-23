import { useState, useEffect } from 'react';
import voiceService from '../services/voiceService';

const useVoice = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const voiceEnabled = localStorage.getItem('voiceEnabled');
    setIsEnabled(voiceEnabled !== 'false');
  }, []);

  const speak = (text, language) => {
    if (isEnabled) {
      voiceService.speak(text, language);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 100);
    }
  };

  const stop = () => {
    voiceService.stop();
    setIsSpeaking(false);
  };

  const toggleVoice = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    localStorage.setItem('voiceEnabled', newState);
    if (!newState) {
      stop();
    }
  };

  return {
    speak,
    stop,
    isSpeaking,
    isEnabled,
    toggleVoice,
  };
};

export default useVoice;