import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAccessibility, TextSize } from '../../contexts/AccessibilityContext';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  Globe,
  Type,
  Eye,
  Activity,
  Volume2,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    reducedMotion,
    setReducedMotion,
    voiceAssistance,
    setVoiceAssistance,
    resetAccessibilitySettings,
  } = useAccessibility();

  const { language, setLanguage, languages, t } = useLanguage();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('accessibility.title')}
      description="Personalize your display, language, and audio preferences for the most comfortable reading experience."
      maxWidth="lg"
    >
      <div className="space-y-6 pt-1 text-slate-800">
        {/* 1. LANGUAGE SWITCHER (In Settings) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-brand-600" />
              UI Language / भाषा / மொழி
            </span>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
              Instant Switching
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {languages.map((item) => {
              const isSelected = language === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLanguage(item.code)}
                  className={`min-h-[50px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/80 text-brand-950 font-bold ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div>
                    <div className="text-sm font-bold">{item.nativeLabel}</div>
                    <div className="text-[11px] text-slate-500">{item.label}</div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. TEXT SIZE CONTROLS (Large Readable Text) */}
        <section className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-emerald-600" />
              {t('accessibility.textSize')}
            </span>
            <span className="text-xs text-slate-400 font-medium">Comfortable Reading</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'normal', title: t('accessibility.textSizeNormal'), sample: 'Aa' },
              { id: 'large', title: t('accessibility.textSizeLarge'), sample: 'Aa+' },
              { id: 'extra_large', title: t('accessibility.textSizeExtraLarge'), sample: 'Aa++' },
            ].map((sz) => {
              const isSelected = textSize === sz.id;
              return (
                <button
                  key={sz.id}
                  type="button"
                  onClick={() => setTextSize(sz.id as TextSize)}
                  className={`min-h-[50px] p-3 rounded-2xl border text-left flex items-center justify-between transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div>
                    <span className="text-xs font-bold block">{sz.title}</span>
                  </div>
                  <span className="text-base font-black text-slate-400 shrink-0">
                    {sz.sample}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. CONTRAST & MOTION TOGGLES */}
        <section className="space-y-3 pt-3 border-t border-slate-100">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-purple-600" />
            Display Contrast & Screen Stability
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* High Contrast Toggle */}
            <div
              onClick={() => setHighContrast(!highContrast)}
              className={`min-h-[52px] p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                highContrast
                  ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">{t('accessibility.highContrast')}</span>
                <span className="text-[11px] text-slate-500">Dark borders and crisp visibility</span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold text-xs ${
                  highContrast ? 'bg-purple-600 text-white border-purple-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {highContrast && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>

            {/* Reduced Motion Toggle */}
            <div
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`min-h-[52px] p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                reducedMotion
                  ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <div>
                <span className="text-xs font-bold block">{t('accessibility.reducedMotion')}</span>
                <span className="text-[11px] text-slate-500">Turns off animations and pulses</span>
              </div>
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold text-xs ${
                  reducedMotion ? 'bg-amber-600 text-white border-amber-700' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {reducedMotion && <Check className="w-4 h-4 stroke-[3]" />}
              </div>
            </div>
          </div>
        </section>

        {/* 4. VOICE ASSISTANCE TOGGLE */}
        <section className="space-y-3 pt-3 border-t border-slate-100">
          <div
            onClick={() => setVoiceAssistance(!voiceAssistance)}
            className={`min-h-[52px] p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
              voiceAssistance
                ? 'border-saffron-600 bg-saffron-50 text-saffron-950 ring-2 ring-saffron-500/20 shadow-xs'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-saffron-100 text-saffron-800 flex items-center justify-center shrink-0">
                <Volume2 className="w-5 h-5 text-saffron-700" />
              </div>
              <div>
                <span className="text-xs font-bold block">{t('accessibility.voiceAssistance')}</span>
                <span className="text-[11px] text-slate-500">
                  Always display listen & speak buttons next to questions
                </span>
              </div>
            </div>
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center border font-bold text-xs ${
                voiceAssistance ? 'bg-saffron-600 text-white border-saffron-700' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {voiceAssistance && <Check className="w-4 h-4 stroke-[3]" />}
            </div>
          </div>
        </section>

        {/* Action Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetAccessibilitySettings}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard Defaults</span>
          </button>

          <Button
            variant="primary"
            size="md"
            onClick={onClose}
            className="min-h-[48px] px-6 text-sm"
          >
            {t('accessibility.applySettings')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
