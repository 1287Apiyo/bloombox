'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createSalesLead } from '@/lib/firestore';
import { useAuth } from './AuthProvider';

type FontMode = 'normal' | 'large' | 'larger';

/** Business WhatsApp for inbound leads — set NEXT_PUBLIC_WHATSAPP_NUMBER in .env (e.g. 2547XXXXXXXX) */
const BLOOMBOX_WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '254700000000').replace(/\D/g, '');

const fabClass =
  'bb-fab inline-flex shrink-0 items-center justify-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ae2f34]';

function AccessIcon() {
  return (
    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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

function MotionIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 12h9m-4-4 4 4-4 4m3-9h3a5 5 0 0 1 0 10h-3" />
    </svg>
  );
}

function SubscriptionIcon() {
  return (
    <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h7m-9 8 3.5-3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h1v3Z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="h-[1.15rem] w-[1.15rem] sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Keep export name so layout imports stay stable */
export function AccessibilityAssist() {
  return <FloatingActions />;
}

export function FloatingActions() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [fontMode, setFontMode] = useState<FontMode>('normal');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [waBusy, setWaBusy] = useState(false);

  useEffect(() => {
    const savedFont = window.localStorage.getItem('bb-font-mode') as FontMode | null;
    const savedMotion = window.localStorage.getItem('bb-reduced-motion');

    if (savedFont === 'large' || savedFont === 'larger') setFontMode(savedFont);
    setReducedMotion(savedMotion === 'true');
    window.localStorage.removeItem('bb-dark-mode');
    delete document.documentElement.dataset.bbTheme;
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (fontMode === 'normal') {
      delete root.dataset.bbFont;
    } else {
      root.dataset.bbFont = fontMode;
    }

    if (reducedMotion) {
      root.dataset.bbMotion = 'reduced';
    } else {
      delete root.dataset.bbMotion;
    }

    window.localStorage.setItem('bb-font-mode', fontMode);
    window.localStorage.setItem('bb-reduced-motion', String(reducedMotion));
  }, [fontMode, reducedMotion]);

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

  const openWhatsAppLead = async () => {
    if (waBusy) return;
    setWaBusy(true);

    const page = typeof window !== 'undefined' ? window.location.pathname : pathname || '/';
    const name = user?.displayName?.trim() || 'Website visitor';
    const email = user?.email?.trim() || `whatsapp-float+${Date.now()}@bloombox.co.ke`;
    const phone = 'WhatsApp inbound';

    const message = encodeURIComponent(
      `Hi BloomBox! I found you on the website (${page}) and would like help with period care / a subscription. Please add me to your lead pipeline.`,
    );

    try {
      await createSalesLead({
        name,
        email,
        phone,
        interest: 'WhatsApp chat — floating button',
        budget: 'To discuss',
        source: 'whatsapp-float',
        notes: `Visitor opened WhatsApp from floating button on ${page}. Stage ready for whatsapp-contacted follow-up.`,
      });
    } catch {
      // Still open WhatsApp even if lead write fails (offline / rules)
    } finally {
      setWaBusy(false);
    }

    window.open(`https://wa.me/${BLOOMBOX_WHATSAPP}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  const panelControlClass = (active = false) =>
    `bb-access-control flex items-center justify-between rounded-md border px-3 py-2.5 text-left text-sm font-semibold transition ${
      active
        ? 'border-[#ae2f34] bg-[#ae2f34] text-white'
        : 'border-stone-300 bg-white text-stone-800 hover:border-[#ae2f34] hover:bg-[#fff5f0] hover:text-[#ae2f34]'
    }`;

  return (
    <div className="bb-float-stack" aria-label="Quick actions">
      {/* Panel opens to the left of the stack so the vertical FABs stay free */}
      {isOpen ? (
        <div
          id="bb-access-panel"
          className="bb-access-panel absolute bottom-0 right-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-5.5rem))] rounded-md border border-stone-300 bg-white p-3 shadow-xl sm:w-[min(20rem,calc(100vw-6rem))]"
        >
          <div className="mb-3 border-b border-stone-200 pb-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Assist settings</p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm font-bold text-stone-500 hover:text-[#ae2f34]"
                aria-label="Close accessibility settings"
              >
                Close
              </button>
            </div>
            <p className="mt-1 text-sm leading-5 text-stone-600">Quick display, reading, and motion controls.</p>
          </div>

          <div className="grid gap-2">
            <button type="button" onClick={cycleFontMode} className={panelControlClass(fontMode !== 'normal')} aria-pressed={fontMode !== 'normal'}>
              <span className="inline-flex items-center gap-2">
                <FontIcon /> Font size
              </span>
              <span className={`text-xs uppercase ${fontMode !== 'normal' ? 'text-white' : 'text-[#ae2f34]'}`}>{fontMode}</span>
            </button>
            <button type="button" onClick={readPage} className={panelControlClass(isReading)} aria-pressed={isReading}>
              <span className="inline-flex items-center gap-2">
                <SpeakerIcon /> Read aloud
              </span>
              <span className={`text-xs uppercase ${isReading ? 'text-white' : 'text-[#ae2f34]'}`}>{isReading ? 'stop' : 'start'}</span>
            </button>
            <button type="button" onClick={() => setReducedMotion((current) => !current)} className={panelControlClass(reducedMotion)} aria-pressed={reducedMotion}>
              <span className="inline-flex items-center gap-2">
                <MotionIcon /> Reduced motion
              </span>
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
                  reducedMotion ? 'border-white bg-white text-[#ae2f34]' : 'border-stone-300 bg-white text-transparent'
                }`}
                aria-hidden="true"
              >
                <span className="h-2 w-2 rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Top → bottom: Subscriptions, WhatsApp lead, Assist */}
      <Link
        href="/subscriptions"
        className={`${fabClass} bg-[#ae2f34] text-white hover:bg-[#8c1520]`}
        aria-label="Open subscription plans"
        title="Subscriptions"
      >
        <SubscriptionIcon />
      </Link>

      <button
        type="button"
        onClick={() => void openWhatsAppLead()}
        disabled={waBusy}
        className={`${fabClass} bg-[#25D366] text-white hover:bg-[#1ebe57] disabled:opacity-70`}
        aria-label="Chat on WhatsApp — saves a lead for BloomBox"
        title="WhatsApp BloomBox"
      >
        <WhatsAppIcon />
      </button>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={`${fabClass} border border-[#ae2f34] bg-white text-[#ae2f34] hover:bg-[#fff5f0] ${isOpen ? 'ring-2 ring-[#fed4c8]' : ''}`}
        aria-expanded={isOpen}
        aria-controls="bb-access-panel"
        aria-label="Open accessibility controls"
        title="Accessibility assist"
      >
        <AccessIcon />
      </button>
    </div>
  );
}
