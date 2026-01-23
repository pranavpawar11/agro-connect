class VoiceService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.speaking = false;
  }

  speak(text, language = 'en-IN') {
    if (!this.synth) {
      console.error('Speech synthesis not supported');
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const langMap = {
      'en': 'en-IN',
      'hi': 'hi-IN',
      'mr': 'mr-IN',
    };

    utterance.lang = langMap[language] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      this.speaking = true;
    };

    utterance.onend = () => {
      this.speaking = false;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.speaking = false;
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth && this.speaking) {
      this.synth.cancel();
      this.speaking = false;
    }
  }

  isSpeaking() {
    return this.speaking;
  }
}

export default new VoiceService();