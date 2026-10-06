import React, { createContext, useContext, useState, useEffect } from 'react';

export type TextSize = 'normal' | 'large' | 'extra_large';

export interface AccessibilitySettings {
  textSize: TextSize;
  highContrast: boolean;
  reducedMotion: boolean;
  largeTouchTargets: boolean;
  voiceAssistance: boolean;
}

interface AccessibilityContextType extends AccessibilitySettings {
  setTextSize: (size: TextSize) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setLargeTouchTargets: (enabled: boolean) => void;
  setVoiceAssistance: (enabled: boolean) => void;
  isSettingsModalOpen: boolean;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  resetAccessibilitySettings: () => void;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  largeTouchTargets: true, // Enabled by default for rural / mobile touch-friendliness
  voiceAssistance: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('shikshasetu_a11y_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        // fallback
      }

      // Check system prefers-reduced-motion
      const prefersReducedMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Check system prefers-contrast
      const prefersHighContrast =
        window.matchMedia && window.matchMedia('(prefers-contrast: more)').matches;

      return {
        ...DEFAULT_SETTINGS,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      };
    }
    return DEFAULT_SETTINGS;
  });

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync settings with DOM element attributes and classes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // 1. Text size
    root.setAttribute('data-text-size', settings.textSize);
    root.classList.remove('text-size-normal', 'text-size-large', 'text-size-extra-large');
    if (settings.textSize === 'large') root.classList.add('text-size-large');
    else if (settings.textSize === 'extra_large') root.classList.add('text-size-extra-large');
    else root.classList.add('text-size-normal');

    // 2. High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // 3. Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // 4. Large Touch Targets
    if (settings.largeTouchTargets) {
      root.classList.add('large-touch-targets');
    } else {
      root.classList.remove('large-touch-targets');
    }

    // Persist to localStorage
    try {
      localStorage.setItem('shikshasetu_a11y_settings', JSON.stringify(settings));
    } catch (e) {
      // ignore
    }
  }, [settings]);

  const setTextSize = (textSize: TextSize) => setSettings((s) => ({ ...s, textSize }));
  const setHighContrast = (highContrast: boolean) => setSettings((s) => ({ ...s, highContrast }));
  const setReducedMotion = (reducedMotion: boolean) => setSettings((s) => ({ ...s, reducedMotion }));
  const setLargeTouchTargets = (largeTouchTargets: boolean) =>
    setSettings((s) => ({ ...s, largeTouchTargets }));
  const setVoiceAssistance = (voiceAssistance: boolean) =>
    setSettings((s) => ({ ...s, voiceAssistance }));

  const openSettingsModal = () => setIsSettingsModalOpen(true);
  const closeSettingsModal = () => setIsSettingsModalOpen(false);

  const resetAccessibilitySettings = () => setSettings(DEFAULT_SETTINGS);

  return (
    <AccessibilityContext.Provider
      value={{
        ...settings,
        setTextSize,
        setHighContrast,
        setReducedMotion,
        setLargeTouchTargets,
        setVoiceAssistance,
        isSettingsModalOpen,
        openSettingsModal,
        closeSettingsModal,
        resetAccessibilitySettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
