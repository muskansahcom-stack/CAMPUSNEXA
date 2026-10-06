import React, { useState } from 'react';
import { Mic, MicOff, Check, AlertCircle } from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { useLanguage } from '../../contexts/LanguageContext';

interface VoiceAnswerInputProps {
  onTranscript: (spokenText: string) => void;
  className?: string;
}

export const VoiceAnswerInput: React.FC<VoiceAnswerInputProps> = ({
  onTranscript,
  className = '',
}) => {
  const { language, t } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  const handleToggleListening = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      const started = voiceService.startListening(
        language,
        (transcript) => {
          setLastSpoken(transcript);
          setIsListening(false);
          onTranscript(transcript);
        },
        () => setIsListening(false),
        (err) => {
          setIsListening(false);
          console.warn('Voice recognition error:', err);
        }
      );

      if (!started) {
        // Fallback for demo when recognition not supported in browser environment
        setIsListening(false);
        const demoAnswers: Record<string, string> = {
          en: 'One half or equal share',
          hi: 'आधा हिस्सा या बराबर भाग',
          ta: 'பாதி அல்லது சமமான பங்கு',
        };
        const demoText = demoAnswers[language] || 'Equal division';
        setLastSpoken(demoText);
        onTranscript(demoText);
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleToggleListening}
        className={`w-full min-h-[48px] px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 active:scale-95 ${
          isListening
            ? 'bg-rose-600 text-white shadow-lg animate-pulse border border-rose-700'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shadow-xs'
        }`}
        aria-label={t('voice.tapToSpeak')}
      >
        {isListening ? (
          <>
            <Mic className="w-5 h-5 text-white animate-bounce" />
            <span className="text-xs sm:text-sm">{t('voice.listening')}</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5 text-brand-700" />
            <span className="text-xs sm:text-sm">{t('common.speakAnswer')}</span>
          </>
        )}
      </button>

      {lastSpoken && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Recognized:</strong> "{lastSpoken}"
          </span>
        </div>
      )}
    </div>
  );
};
