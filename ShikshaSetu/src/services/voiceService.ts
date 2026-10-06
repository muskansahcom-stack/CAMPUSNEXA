/**
 * ShikshaSetu Voice-Ready Architecture Service
 * 
 * Provides:
 * 1. Voice instructions (Text-to-Speech read-aloud)
 * 2. Voice questions (Reads question prompts aloud)
 * 3. Voice answers (Speech-to-Text speech recognition for oral answers)
 * 
 * Essential for young rural learners with emerging literacy.
 */

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private _isListening: boolean = false;
  private _isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  /**
   * Voice Instructions / Voice Questions (Text-to-Speech)
   */
  public speak(
    text: string,
    langCode: string = 'hi',
    onEnd?: () => void,
    onStart?: () => void
  ): boolean {
    if (!this.isSpeechSynthesisSupported() || !this.synth) {
      console.warn('Speech synthesis is not supported on this device/browser.');
      // Execute simulated read-aloud callback for headless/test environments
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 500);
      return false;
    }

    try {
      this.synth.cancel(); // Stop any pending utterances

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Map regional language codes to standard BCP-47 speech tags
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        or: 'or-IN',
        pa: 'pa-IN',
      };
      utterance.lang = langMap[langCode] || `${langCode}-IN`;
      utterance.rate = 0.9; // Slightly slower, clear cadence for young learners
      utterance.pitch = 1.05; // Friendly, warm pitch

      utterance.onstart = () => {
        this._isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        this._isSpeaking = false;
        this.currentUtterance = null;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        this._isSpeaking = false;
        this.currentUtterance = null;
        console.warn('Speech synthesis error:', e);
        if (onEnd) onEnd();
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
      return true;
    } catch (err) {
      console.warn('Speech synthesis invocation failed:', err);
      if (onEnd) onEnd();
      return false;
    }
  }

  /**
   * Stop any current speech
   */
  public stopSpeech(): void {
    if (this.synth) {
      this.synth.cancel();
    }
    this._isSpeaking = false;
    this.currentUtterance = null;
  }

  /**
   * Voice Answers (Speech-to-Text Recognition)
   */
  public startListening(
    langCode: string = 'hi',
    onResult: (transcript: string) => void,
    onEnd?: () => void,
    onError?: (error: any) => void
  ): boolean {
    if (!this.isSpeechRecognitionSupported()) {
      console.warn('Speech recognition is not supported in this browser.');
      if (onError) onError(new Error('Speech recognition not supported'));
      return false;
    }

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();

      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
      };
      this.recognition.lang = langMap[langCode] || `${langCode}-IN`;
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this._isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onResult(transcript);
      };

      this.recognition.onerror = (event: any) => {
        this._isListening = false;
        if (onError) onError(event.error);
      };

      this.recognition.onend = () => {
        this._isListening = false;
        if (onEnd) onEnd();
      };

      this.recognition.start();
      return true;
    } catch (err) {
      this._isListening = false;
      if (onError) onError(err);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this._isListening) {
      this.recognition.stop();
    }
    this._isListening = false;
  }

  public get isSpeaking(): boolean {
    return this._isSpeaking;
  }

  public get isListening(): boolean {
    return this._isListening;
  }
}

export const voiceService = new VoiceService();
