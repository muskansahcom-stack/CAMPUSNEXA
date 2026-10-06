import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAccessibility, TextSize } from '../../contexts/AccessibilityContext';
import {
  Globe,
  Type,
  Sparkles,
  Volume2,
  Mic,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Heart,
  Smile,
} from 'lucide-react';

interface RuralStudentOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const RuralStudentOnboardingModal: React.FC<RuralStudentOnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { language, setLanguage, languages, t } = useLanguage();
  const { textSize, setTextSize, setVoiceAssistance } = useAccessibility();
  const [step, setStep] = useState<number>(1);

  const totalSteps = 4;

  const handleFinish = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('shikshasetu_onboarding_completed', 'true');
    }
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md"
    >
      <div className="py-2 space-y-6 text-slate-800">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-brand-700 text-white font-extrabold text-xs flex items-center justify-center">
              {step}
            </span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx + 1 === step
                    ? 'w-6 bg-brand-600'
                    : idx + 1 < step
                    ? 'w-2.5 bg-emerald-500'
                    : 'w-2.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ======================================================= */}
        {/* STEP 1: LANGUAGE SWITCHER IN ONBOARDING */}
        {/* ======================================================= */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Badge variant="brand" size="sm" dot>
                {t('onboarding.stepLanguageTitle')}
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {t('onboarding.stepLanguageTitle')}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('onboarding.stepLanguageDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {[
                { code: 'hi', label: 'Hindi', native: 'हिन्दी', greeting: 'नमस्ते!' },
                { code: 'en', label: 'English', native: 'English', greeting: 'Hello!' },
                { code: 'ta', label: 'Tamil', native: 'தமிழ்', greeting: 'வணக்கம்!' },
              ].map((langItem) => {
                const isSelected = language === langItem.code;
                return (
                  <button
                    key={langItem.code}
                    type="button"
                    onClick={() => setLanguage(langItem.code)}
                    className={`min-h-[64px] p-4 rounded-2xl border text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50 text-brand-950 font-bold ring-2 ring-brand-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black">{langItem.native}</span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-normal">{langItem.label}</span>
                      )}
                    </div>
                    <span className="text-xs text-amber-700 font-medium mt-1">
                      {langItem.greeting}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-500 italic pt-1">
              * More regional languages (Telugu, Bengali, Marathi, Gujarati, Kannada, Odia) available in settings anytime.
            </p>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 2: CHOOSE TEXT SIZE FOR EASY READING */}
        {/* ======================================================= */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Badge variant="forest" size="sm" dot>
                {t('onboarding.stepDisplayTitle')}
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {t('onboarding.stepDisplayTitle')}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('onboarding.stepDisplayDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {[
                { id: 'normal', title: 'Normal Size', sample: '14px', desc: 'Standard display' },
                { id: 'large', title: 'Large Size', sample: '18px', desc: 'Easy on phone' },
                { id: 'extra_large', title: 'Extra Large', sample: '20px', desc: 'High visibility' },
              ].map((sz) => {
                const isSelected = textSize === sz.id;
                return (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setTextSize(sz.id as TextSize)}
                    className={`min-h-[64px] p-4 rounded-2xl border text-left flex flex-col justify-between transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">{sz.title}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 mt-1">{sz.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 3: ONE MAIN ACTION DAILY (LOW DIGITAL LITERACY) */}
        {/* ======================================================= */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Badge variant="saffron" size="sm" dot>
                {t('onboarding.stepPracticeTitle')}
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {t('onboarding.stepPracticeTitle')}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('onboarding.stepPracticeDesc')}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {t('common.practice')} (5–10 Minutes)
                  </h4>
                  <p className="text-xs text-slate-600">
                    No complicated menus. Just tap and learn.
                  </p>
                </div>
              </div>

              <div className="min-h-[44px] px-4 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-xs shrink-0">
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            <p className="text-xs text-slate-600">
              ✓ <strong>Zero Stress:</strong> No grades are shown to other students. You only see <em>"{t('common.yourProgress')}"</em>.
            </p>
          </div>
        )}

        {/* ======================================================= */}
        {/* STEP 4: VOICE-READY (LISTEN & SPEAK ANYTIME) */}
        {/* ======================================================= */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <Badge variant="brand" size="sm" dot>
                {t('onboarding.stepVoiceTitle')}
              </Badge>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {t('onboarding.stepVoiceTitle')}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t('onboarding.stepVoiceDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Volume2 className="w-5 h-5 text-amber-700" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Voice Questions</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tap the speaker on any question to hear it read aloud in your language.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <Mic className="w-5 h-5 text-blue-700" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">Voice Answers</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Struggling to type? Speak your thoughts and answer directly with your voice.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                You are all set! You can change language and text size in settings anytime.
              </span>
            </div>
          </div>
        )}

        {/* ======================================================= */}
        {/* NAVIGATION CONTROLS */}
        {/* ======================================================= */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          {step > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep((s) => s - 1)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="min-h-[48px] text-xs font-bold px-4"
            >
              {t('common.back')}
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2"
            >
              Skip Intro
            </button>
          )}

          {step < totalSteps ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep((s) => s + 1)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="min-h-[48px] text-xs font-bold px-6"
            >
              {t('common.continue')}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleFinish}
              rightIcon={<Smile className="w-4 h-4" />}
              className="min-h-[48px] text-xs font-bold px-6 bg-emerald-600 hover:bg-emerald-700"
            >
              {t('onboarding.startLearningNow')}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
