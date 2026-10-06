import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe, Check, Sparkles } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'minimal' | 'bordered';
  className?: string;
  showIconOnly?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'bordered',
  className = '',
  showIconOnly = false,
}) => {
  const { language, setLanguage, languages, initialLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-semibold rounded-2xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 ${
          variant === 'bordered'
            ? 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs'
            : 'bg-transparent text-slate-700 hover:bg-slate-100'
        }`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Current language: ${currentOption.nativeLabel}. Click to switch language.`}
      >
        <Globe className="w-4 h-4 text-brand-600 shrink-0" />
        {!showIconOnly && <span className="font-bold">{currentOption.nativeLabel}</span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-elevated border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-96 overflow-y-auto">
          {/* Primary Initial Languages (English, Hindi, Tamil) */}
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Primary Languages</span>
          </div>

          {initialLanguages.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLanguage(item.code);
                setIsOpen(false);
              }}
              className={`w-full min-h-[40px] flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                language === item.code
                  ? 'bg-brand-50 text-brand-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{item.nativeLabel}</span>
                <span className="text-[10px] text-slate-400">{item.label}</span>
              </div>
              {item.code === language && (
                <Check className="w-4 h-4 text-brand-600 stroke-[3] inline" />
              )}
            </button>
          ))}

          {/* Extended Regional Languages */}
          <div className="px-3 py-1.5 mt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            More Regional Languages
          </div>

          {languages
            .filter((l) => !l.isInitialSupport)
            .map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`w-full min-h-[38px] flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                  language === item.code
                    ? 'bg-brand-50 text-brand-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">{item.nativeLabel}</span>
                  <span className="text-[10px] text-slate-400">{item.label}</span>
                </div>
                {item.code === language && (
                  <Check className="w-4 h-4 text-brand-600 stroke-[3] inline" />
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
