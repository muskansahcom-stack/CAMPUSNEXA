import React, { useState } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { voiceService } from '../../services/voiceService';
import { useLanguage } from '../../contexts/LanguageContext';

interface VoiceInstructionButtonProps {
  textToSpeak: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceInstructionButton: React.FC<VoiceInstructionButtonProps> = ({
  textToSpeak,
  label,
  className = '',
  size = 'md',
}) => {
  const { language, t } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      voiceService.stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      voiceService.speak(
        textToSpeak,
        language,
        () => setIsPlaying(false),
        () => setIsPlaying(true)
      );
    }
  };

  const buttonSizeClasses =
    size === 'sm'
      ? 'min-h-[38px] px-2.5 py-1 text-xs'
      : size === 'lg'
      ? 'min-h-[52px] px-5 py-3 text-base'
      : 'min-h-[44px] px-3.5 py-2 text-xs sm:text-sm';

  return (
    <button
      type="button"
      onClick={handleTogglePlay}
      className={`inline-flex items-center gap-2 rounded-2xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 active:scale-95 ${buttonSizeClasses} ${
        isPlaying
          ? 'bg-amber-500 text-slate-950 border border-amber-600 shadow-md animate-gentle-pulse'
          : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 shadow-xs'
      } ${className}`}
      aria-label={label || t('voice.listenToQuestion')}
      title={label || t('voice.listenToQuestion')}
    >
      {isPlaying ? (
        <>
          <Volume2 className="w-4 h-4 text-slate-950 animate-bounce" />
          <span>{label || 'सुन रहे हैं... / Listening...'}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4 text-amber-700 shrink-0" />
          <span>{label || t('common.listenAudio')}</span>
        </>
      )}
    </button>
  );
};
