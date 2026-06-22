'use client';

import { useEffect, useState } from 'react';

type FontMode = 'normal' | 'large' | 'larger';

function AccessIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM4 10h16M8 10l-1 9m9-9 1 9m-5-9v9" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 15H3V9h2l5-4v14l-5-4Zm10-6a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" />
    </svg>
  );
}

function FontIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 18h4m12 0h-4M7 18 12 6l5 12M9 14h6" />
    </svg>
  );
}

function ContrastIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3a9 9 0 1 0 0 18V3Z" />
    </svg>
  );
}

function MotionIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12h9m-4-4 4 4-4 4m3-9h3a5 5 0 0 1 0 10h-3" />
    </svg>
  );
}

export function AccessibilityAssist() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontMode, setFontMode] = useState<FontMode>('normal');
  const [darkMode, setDarkMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    const savedFont = window.localStorage.getItem('bb-font-mode') as FontMode | null;
    const savedTheme = window.localStorage.getItem('bb-dark-mode');
    const savedMotion = window.localStorage.getItem('bb-reduced-motion');

    if (savedFont === 'large' || savedFont === 'larger') setFontMode(savedFont);
    setDarkMode(savedTheme === 'true');
    setReducedMotion(savedMotion === 'true');
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (fontMode === 'normal') {
      delete root.dataset.bbFont;
    } else {
      root.dataset.bbFont = fontMode;
    }

    if (darkMode) {
      root.dataset.bbTheme = 'dark';
    } else {
      delete root.dataset.bbTheme;
    }

    if (reducedMotion) {
      root.dataset.bbMotion = 'reduced';
    } else {
      delete root.dataset.bbMotion;
    }

    window.localStorage.setItem('bb-font-mode', fontMode);
    window.localStorage.setItem('bb-dark-mode', String(darkMode));
    window.localStorage.setItem('bb-reduced-motion', String(reducedMotion));
  }, [darkMode, fontMode, reducedMotion]);

  const cycleFontMode = () => {
    setFontMode((current) => {
      if (current === 'normal') return 'large';
      if (current === 'large') return 'larger';
      return 'normal';
    });
  };

  const readPage = () => {
    if (!('speechSynthesis' in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsReading(false);
      return;
    }

    const pageText = document.querySelector('main')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 8000);
    if (!pageText) return;

    const utterance = new SpeechSynthesisUtterance(pageText);
    utterance.rate = 0.95;
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    setIsReading(true);
    window.speechSynthesis.speak(utterance);
  };

  const panelControlClass = (active = false) =>
    `bb-access-control flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm font-semibold transition ${
      active
        ? 'border-[#ae2f34] bg-[#ae2f34] text-white'
        : 'border-stone-300 bg-white text-stone-800 hover:border-[#ae2f34] hover:bg-[#fff5f0] hover:text-[#ae2f34]'
    }`;

  return (
    <div className="fixed bottom-4 left-4 z-[1200] sm:bottom-5 sm:left-5">
      {isOpen ? (
        <div id="bb-access-panel" className="bb-access-panel mb-3 w-[min(20rem,calc(100vw-2rem))] rounded-md border border-stone-300 bg-white p-3 shadow-xl">
          <div className="mb-3 border-b border-stone-200 pb-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Assist settings</p>
              <button type="button" onClick={() => setIsOpen(false)} className="text-sm font-bold text-stone-500 hover:text-[#ae2f34]" aria-label="Close accessibility settings">
                Close
              </button>
            </div>
            <p className="mt-1 text-sm leading-5 text-stone-600">Quick display, reading, and motion controls.</p>
          </div>

          <div className="grid gap-2">
            <button type="button" onClick={cycleFontMode} className={panelControlClass(fontMode !== 'normal')} aria-pressed={fontMode !== 'normal'}>
              <span className="inline-flex items-center gap-2"><FontIcon /> Font size</span>
              <span className={`text-xs uppercase ${fontMode !== 'normal' ? 'text-white' : 'text-[#ae2f34]'}`}>{fontMode}</span>
            </button>
            <button type="button" onClick={() => setDarkMode((current) => !current)} className={panelControlClass(darkMode)} aria-pressed={darkMode}>
              <span className="inline-flex items-center gap-2"><ContrastIcon /> Dark mode</span>
              <span className={`inline-flex h-6 w-14 items-center rounded-full px-1 transition ${darkMode ? 'justify-end bg-[#ae2f34]' : 'justify-start bg-stone-300'}`}>
                <span className="h-4 w-4 rounded-full bg-white" />
              </span>
            </button>
            <button type="button" onClick={readPage} className={panelControlClass(isReading)} aria-pressed={isReading}>
              <span className="inline-flex items-center gap-2"><SpeakerIcon /> Read aloud</span>
              <span className={`text-xs uppercase ${isReading ? 'text-white' : 'text-[#ae2f34]'}`}>{isReading ? 'stop' : 'start'}</span>
            </button>
            <button type="button" onClick={() => setReducedMotion((current) => !current)} className={panelControlClass(reducedMotion)} aria-pressed={reducedMotion}>
              <span className="inline-flex items-center gap-2"><MotionIcon /> Reduced motion</span>
              <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${reducedMotion ? 'border-white bg-white text-[#ae2f34]' : 'border-stone-300 bg-white text-transparent'}`} aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="bb-access-trigger inline-flex h-11 items-center gap-2 rounded-md border border-[#ae2f34] bg-white px-3 text-sm font-bold text-[#ae2f34] shadow-xl transition hover:bg-[#fff5f0]"
        aria-expanded={isOpen}
        aria-controls="bb-access-panel"
        aria-label="Open accessibility controls"
      >
        <AccessIcon />
        Assist
        <span className="h-2 w-2 rounded-full bg-[#006a65]" aria-hidden="true" />
      </button>
    </div>
  );
}
