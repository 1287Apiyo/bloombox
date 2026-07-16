'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createSalesLead, subscribeToNewsletter } from '@/lib/firestore';
import { SiteFooter, SiteHeader } from '../components/BrandShell';
import { useAuth } from '../components/AuthProvider';

// ---------- Reusable animation presets ----------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const viewportSettings = { once: true, amount: 0.15 };

// ---------- Mockup images (local high-res assets for crisp rendering) ----------
const mockupImages = {
  delivery: '/mockups/bloombox-delivery.png',
  openBox: '/mockups/bloombox-open-box.png',
  giftFlowers: '/mockups/bloombox-gift-flowers.png',
};

/** Prefer near-lossless Next.js image optimization on the homepage */
const IMAGE_QUALITY = 95;

// ---------- Data ----------
const collections = [
  {
    title: 'Monthly Care',
    text: 'Recurring period-care essentials, comfort rituals, and little extras delivered before the urgent moment.',
    action: 'Subscribe',
    href: '/subscriptions',
    image: mockupImages.openBox,
    panel: 'bg-[#ae2f34] text-white',
    button: 'bg-white text-[#ae2f34]',
  },
  {
    title: 'Custom Monthly Plan',
    text: 'Choose a base tier, then build the add-ons that make each month easier.',
    action: 'Customize',
    href: '/subscriptions',
    image: '/products/candle.jpg',
    panel: 'bg-[#76574e] text-white',
    button: 'bg-[#fed4c8] text-[#14090c]',
  },
  {
    title: 'Care Add-ons',
    text: 'Flowers, cards, and comfort items can still support the monthly plan when the moment calls for it.',
    action: 'Browse add-ons',
    href: '/gifting',
    image: mockupImages.giftFlowers,
    panel: 'bg-[#191c1d] text-white',
    button: 'bg-[#006a65] text-white',
  },
];

const promises = [
  {
    icon: 'flower',
    title: 'Artisanal Quality',
    text: 'Every box is arranged with care, from the practical items to the finishing gift details.',
  },
  {
    icon: 'leaf',
    title: 'Thoughtful Sourcing',
    text: 'BloomBox brings together everyday essentials, comfort products, and locally meaningful gifts.',
  },
  {
    icon: 'heart',
    title: 'Community First',
    text: 'The experience is built around women, care, delivery, and the small rituals that make life easier.',
  },
];

const testimonials = [
  {
    title: 'Always prepared',
    text: 'My BloomBox arrives before the panic shopping starts, and that alone makes the month feel lighter.',
    name: 'Amanda L.',
  },
  {
    title: 'Beyond essentials',
    text: 'It is practical care, but it still feels personal. That combination is what makes BloomBox different.',
    name: 'Rebecca M.',
  },
];

const packages = [
  {
    title: 'Starter Subscription',
    price: 'From KSh 300/month',
    text: 'A simple monthly base for pads or tampons, flowers, and a small treat.',
    image: mockupImages.openBox,
    href: '/subscriptions',
   
  },
  {
    title: 'Comfort Subscription',
    price: 'From KSh 500/month',
    text: 'Period essentials with room for comfort add-ons as the customer learns what works.',
    image: '/products/waterbottles.jpg',
    href: '/subscriptions',
   
  },
  {
    title: 'Custom Monthly Plan',
    price: 'Priced by selection',
    text: 'A flexible subscription path for clients who want to choose products each month.',
    image: '/products/candle.jpg',
    href: '/subscriptions',
   
  },
];

const journeySteps = [
  {
    title: 'Subscription first',
    text: 'The first path is monthly care, not one-off shopping.',
    href: '/',
    icon: 'repeat',
  },
  {
    title: 'Create account',
    text: 'Customers save delivery, cycle preferences, orders, and subscription records.',
    href: '/signup?next=/subscriptions',
    icon: 'user',
  },
  {
    title: 'Pick a tier',
    text: 'Start with monthly pads or tampons tiers from KSh 300.',
    href: '/subscriptions',
    icon: 'options',
  },
  {
    title: 'Customize',
    text: 'Add comfort items, flowers, or custom preferences to the monthly plan.',
    href: '/subscriptions',
    icon: 'gear',
  },
  {
    title: 'Pay',
    text: 'Use card subscription setup or checkout payment records as the system grows.',
    href: '/checkout',
    icon: 'card',
  },
  {
    title: 'Track',
    text: 'Subscriptions, orders, and delivery history stay connected to the customer.',
    href: '/orders',
    icon: 'pin',
  },
];

const funnelSteps = [
  {
    step: '01',
    title: 'Capture',
    text: 'The sign-up sheet saves name, email, WhatsApp number, interest, budget, and source.',
  },
  {
    step: '02',
    title: 'Qualify',
    text: 'The team reviews the inquiry, adds notes, and decides the right care path.',
  },
  {
    step: '03',
    title: 'Follow up',
    text: 'Open WhatsApp with a ready BloomBox message and guide the customer to checkout.',
  },
];

const heroStats = [
  { label: 'Monthly subscribers', value: '2,400+' },
  { label: 'On-time delivery', value: '98%' },
  { label: 'Starting price', value: 'KSh 300' },
];

// ---------- Small icons ----------
function ArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.55.83l10.28-6.86a1 1 0 0 0 0-1.66L9.55 4.31A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 8h10M7 12h7m-9 8 3.5-3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h1v3Z" />
    </svg>
  );
}

// ---------- Signature hero visual: a 28-day delivery dial ----------
// The product's whole promise is "timed to the cycle, not the calendar."
// This dial makes that literal: 28 days ringed around a dial, with the
// delivery window highlighted, rather than a generic product photo.
function CycleDial() {
  const size = 400;
  const center = size / 2;
  const outerR = 172;
  const innerR = 156;
  const dayCount = 28;
  const deliveryDays = [26, 27, 28, 1]; // wraps: box ships just before the next cycle

  const ticks = Array.from({ length: dayCount }, (_, i) => {
    const day = i + 1;
    const angle = (i / dayCount) * 2 * Math.PI - Math.PI / 2;
    const active = deliveryDays.includes(day);
    const r1 = active ? innerR - 10 : innerR;
    return {
      day,
      active,
      x1: center + r1 * Math.cos(angle),
      y1: center + r1 * Math.sin(angle),
      x2: center + outerR * Math.cos(angle),
      y2: center + outerR * Math.sin(angle),
    };
  });

  const labelDays = [1, 7, 14, 21];
  const labels = labelDays.map((day) => {
    const angle = ((day - 1) / dayCount) * 2 * Math.PI - Math.PI / 2;
    const r = outerR + 22;
    return { day, x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
  });

  // Small parcel glyph marking the delivery moment, placed at day 27
  const parcelAngle = ((27 - 1) / dayCount) * 2 * Math.PI - Math.PI / 2;
  const parcelR = outerR + 22;
  const parcelX = center + parcelR * Math.cos(parcelAngle);
  const parcelY = center + parcelR * Math.sin(parcelAngle);

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" role="img" aria-label="28-day delivery cycle, with the delivery window shown just before day one">
      <circle cx={center} cy={center} r={innerR - 24} fill="none" stroke="#fed4c8" strokeOpacity="0.14" strokeWidth="1" />
      {ticks.map((tick) => (
        <line
          key={tick.day}
          x1={tick.x1}
          y1={tick.y1}
          x2={tick.x2}
          y2={tick.y2}
          stroke={tick.active ? '#ae2f34' : '#fed4c8'}
          strokeOpacity={tick.active ? 1 : 0.28}
          strokeWidth={tick.active ? 3.5 : 1.5}
          strokeLinecap="round"
        />
      ))}
      {labels.map((label) => (
        <text
          key={label.day}
          x={label.x}
          y={label.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="12"
          fontWeight={600}
          fill="#fed4c8"
          fillOpacity={0.75}
        >
          {label.day}
        </text>
      ))}
      <g transform={`translate(${parcelX}, ${parcelY})`}>
        <circle r="15" fill="#ae2f34" />
        <path
          d="M-5.5 -3.5 L0 -6.5 L5.5 -3.5 L5.5 3.5 L0 6.5 L-5.5 3.5 Z"
          fill="none"
          stroke="#fff5f0"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M-5.5 -3.5 L0 -0.5 L5.5 -3.5 M0 -0.5 L0 6.5" fill="none" stroke="#fff5f0" strokeWidth="1.2" />
      </g>
      
    </svg>
  );
}

function DelilahGuide() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportSettings}
      transition={{ duration: 0.5 }}
      className="mt-6 flex max-w-md items-start gap-3 border border-[#006a65] bg-white p-4 shadow-sm"
    >
      <div className="relative h-16 w-16 shrink-0 rounded-full border-2 border-[#006a65] bg-[#fed4c8]" aria-hidden="true">
        <span className="absolute left-4 top-5 h-2 w-2 rounded-full bg-[#14090c]" />
        <span className="absolute right-4 top-5 h-2 w-2 rounded-full bg-[#14090c]" />
        <span className="absolute bottom-4 left-1/2 h-3 w-6 -translate-x-1/2 rounded-b-full border-b-2 border-[#14090c]" />
        <span className="absolute -right-1 bottom-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#006a65] text-xs font-bold text-white">?</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006a65]">Delilah says</p>
        <p className="mt-1 text-sm leading-6 text-[#584140]">
          Every sign-up becomes a lead, then the team can qualify it and send a ready WhatsApp follow-up.
        </p>
      </div>
    </motion.div>
  );
}

function PromiseIcon({ type }: { type: string }) {
  if (type === 'leaf') {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M25 5C13 5 7 11 7 21c0 4 3 6 6 6 9 0 14-10 12-22Z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M7 25c4-8 9-12 16-16" />
      </svg>
    );
  }

  if (type === 'heart') {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 27S5 20 5 11.5A5.5 5.5 0 0 1 15 8.3 5.5 5.5 0 0 1 27 11.5C27 20 16 27 16 27Z" />
      </svg>
    );
  }

  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 32 32" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 15C10 9 11 4 16 2c5 2 6 7 0 13Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17 16c8-3 12 0 12 5-5 4-9 2-12-5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 16C7 13 3 16 3 21c5 4 9 2 12-5Z" />
      <circle cx="16" cy="16" r="4" strokeWidth={1.7} />
    </svg>
  );
}

// ---------- Step Icons (no background) ----------
function StepIcon({ name, className = 'h-8 w-8' }: { name: string; className?: string }) {
  const props = {
    className,
    fill: 'none',
    viewBox: '0 0 24 24',
    stroke: 'currentColor',
    'aria-hidden': 'true' as const,
  };

  switch (name) {
    case 'repeat':
      return (
        <svg {...props} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      );
    case 'user':
      return (
        <svg {...props} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    case 'options':
      return (
        <svg {...props} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      );
    case 'gear':
      return (
        <svg {...props} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case 'card':
      return (
        <svg {...props} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="14" rx="2" />
          <path d="M3 10h18M7 15h1m4 0h1" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...props} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    default:
      return null;
  }
}

// ---------- Collection card – static (no animation) ----------
function CollectionCard({ collection, large = false }: { collection: (typeof collections)[number]; large?: boolean }) {
  return (
    <Link
      href={collection.href}
      className={`group relative block overflow-hidden border border-[#e0bfbd] bg-white h-full ${
        large
          ? 'min-h-[340px] sm:min-h-[420px] md:col-span-8 lg:min-h-[500px]'
          : 'min-h-[320px] md:col-span-4 lg:min-h-[360px]'
      }`}
    >
      <Image
        src={collection.image}
        alt={collection.title}
        fill
        sizes={large ? '(min-width: 768px) 760px, 100vw' : '(min-width: 768px) 420px, 100vw'}
        quality={IMAGE_QUALITY}
        priority
        className="object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className={`absolute inset-x-0 bottom-0 ${collection.panel} p-6 md:p-8`}>
        <h3 className="font-sans text-3xl font-semibold">{collection.title}</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 opacity-90">{collection.text}</p>
        <span className={`mt-5 inline-flex px-5 py-2 text-sm font-semibold ${collection.button}`}>
          {collection.action}
        </span>
      </div>
    </Link>
  );
}

/** Format a Kenyan / international phone number for WhatsApp API link */
function formatPhoneForWhatsApp(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return `254${digits.slice(1)}`;
  }
  return digits;
}

// ---------- Main Dashboard Page ----------
export default function DashboardPage() {
  const { loading, user } = useAuth();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [isJoiningNewsletter, setIsJoiningNewsletter] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadInterest, setLeadInterest] = useState('Monthly subscription');
  const [leadBudget, setLeadBudget] = useState('KSh 300 - 1,000');
  const [leadStatus, setLeadStatus] = useState('');
  const [leadError, setLeadError] = useState('');
  const [isSavingLead, setIsSavingLead] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterError('');
    setNewsletterStatus('');
    if (!newsletterEmail.trim()) {
      setNewsletterError('Enter an email address to join.');
      return;
    }
    setIsJoiningNewsletter(true);
    try {
      await subscribeToNewsletter(newsletterEmail, 'dashboard-community');
      setNewsletterStatus('You have subscribed. BloomBox updates and newsletters will arrive in your email.');
      setNewsletterEmail('');
    } catch (error) {
      setNewsletterError(error instanceof Error ? error.message : 'Could not save your email. Please try again.');
    } finally {
      setIsJoiningNewsletter(false);
    }
  };

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLeadError('');
    setLeadStatus('');
    setWhatsappUrl(null);
    if (!leadName.trim() || !leadEmail.trim() || !leadPhone.trim()) {
      setLeadError('Add your name, email, and phone so BloomBox can follow up.');
      return;
    }
    setIsSavingLead(true);
    try {
      const leadId = await createSalesLead({
        name: leadName,
        email: leadEmail,
        phone: leadPhone,
        interest: leadInterest,
        budget: leadBudget,
        source: 'homepage-care-planner',
      });
      await subscribeToNewsletter(leadEmail, 'homepage-care-planner');
      const cleanPhone = formatPhoneForWhatsApp(leadPhone);
      const message = encodeURIComponent(
        `Hi BloomBox, I've just submitted a request for ${leadInterest}. My name is ${leadName}.`
      );
      setWhatsappUrl(`https://wa.me/${cleanPhone}?text=${message}`);
      setLeadStatus(
        `Saved to the BloomBox lead pipeline. Reference: ${leadId.slice(0, 8)}. You can now open WhatsApp directly below.`
      );
      setLeadName('');
      setLeadEmail('');
      setLeadInterest('Monthly subscription');
      setLeadBudget('KSh 300 - 1,000');
    } catch (leadSaveError) {
      setLeadError(leadSaveError instanceof Error ? leadSaveError.message : 'Could not save your request.');
    } finally {
      setIsSavingLead(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <SiteHeader />

      <main>
        {/* ---------- HERO ---------- */}
        <section className="relative min-h-[600px] overflow-hidden bg-bb-red lg:min-h-[800px]">
          {/* Background Split */}
          <div className="absolute inset-0 flex flex-col lg:flex-row">
            <div className="flex-1 bg-bb-red" />
            <div className="relative w-full lg:w-1/2 h-[400px] lg:h-auto shrink-0">
              <Image
                src="/family-hero.jpg"
                alt="BloomBox care ritual"
                sizes="(min-width: 1536px) 50vw, (min-width: 1024px) 50vw, 100vw"
                quality={100}
                fill
                priority
                className="object-cover object-center [image-rendering:high-quality]"
              />
              {/* Soft edge only — keep the photo bright and crisp */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-transparent lg:to-black/10" />
            </div>
          </div>

          {/* Content layer constrained by max-w-7xl for alignment with Navbar */}
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[800px]">
              <div className="flex-1 flex items-center py-20 lg:py-0">
                <div className="max-w-xl w-full">
                  <motion.div
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="space-y-8"
                  >
                    <span className="inline-block text-xs font-bold uppercase tracking-[0.26em] text-white/70">
                      Timed to your cycle, not the calendar
                    </span>

                    <h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-7xl lg:text-8xl">
                      Monthly Period Care, a Timed{' '}
                      <span className="text-bb-pink">Ritual.</span>
                    </h1>

                    <p className="max-w-prose text-lg leading-relaxed text-white/95 sm:text-xl">
                      The first cycle‑aware subscription in Kenya. BloomBox delivers a curated
                      monthly ritual of period essentials, comfort extras, and a reminder a day
                      ahead — so you’re never caught off guard. Starting at KSh 300.
                    </p>

                    <div className="flex flex-wrap gap-5">
                      <Link
                        href="/subscriptions"
                        className="inline-flex items-center justify-center rounded-full bg-bb-pink px-8 py-4 text-sm font-bold text-[#14090c] shadow-lg transition hover:bg-white"
                      >
                        Get started
                      </Link>
                      <Link
                        href="/cycle"
                        className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/10"
                      >
                        Track your cycle
                      </Link>
                    </div>

                    <dl className="mt-16 grid grid-cols-3 gap-x-8 gap-y-6 sm:gap-x-14">
                      {heroStats.map((stat) => (
                        <div key={stat.label}>
                          <dd className="text-4xl font-bold tracking-tight text-bb-pink sm:text-5xl">
                            {stat.value}
                          </dd>
                          <dt className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
                            {stat.label}
                          </dt>
                        </div>
                      ))}
                    </dl>
                  </motion.div>
                </div>
              </div>
              {/* Spacer for the image side */}
              <div className="flex-1 hidden lg:block" />
            </div>
          </div>
        </section>

        {/* ---------- SUBSCRIPTION JOURNEY ---------- */}
        <section className="border-b border-stone-300 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              transition={{ duration: 0.6 }}
              className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end md:mb-14"
            >
              <div>
                <h2 className="font-sans text-4xl font-semibold text-[#ae2f34]">Subscription journey</h2>
                <p className="mt-2 max-w-2xl text-base leading-7 text-[#584140]">
                  The customer path is designed around recurring monthly care first, with customization, cycle support, and delivery tracking wrapped around it.
                </p>
              </div>
              <Link href="/signup?next=/subscriptions" className="w-fit bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520]">
                Start subscription
              </Link>
            </motion.div>

            {/* Connected circle path — horizontal on desktop, vertical on mobile */}
            <motion.ol
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              className="relative flex flex-col gap-0 md:flex-row md:items-start md:justify-between"
            >
              {/* Continuous line behind circles (desktop) */}
              <div
                className="pointer-events-none absolute left-0 right-0 top-10 hidden h-0.5 bg-[#e0bfbd] md:block"
                aria-hidden="true"
              />
              {/* Continuous line (mobile) */}
              <div
                className="pointer-events-none absolute bottom-4 left-10 top-4 w-0.5 bg-[#e0bfbd] md:hidden"
                aria-hidden="true"
              />

              {journeySteps.map((step, index) => (
                <motion.li
                  key={step.title}
                  variants={fadeUp}
                  transition={{ duration: 0.45 }}
                  className="relative z-10 flex flex-1 flex-row gap-4 pb-10 last:pb-0 md:flex-col md:items-center md:gap-0 md:pb-0 md:text-center"
                >
                  <Link
                    href={step.href}
                    className="group flex flex-row items-start gap-4 md:flex-col md:items-center"
                  >
                    {/* Numbered circle */}
                    <span className="relative z-10 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-[#ae2f34] bg-white text-[#ae2f34] shadow-sm transition group-hover:bg-[#ae2f34] group-hover:text-white">
                      <span className="flex flex-col items-center justify-center">
                        <StepIcon name={step.icon} className="h-6 w-6" />
                        <span className="mt-0.5 text-[10px] font-bold tracking-wide">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </span>
                    </span>

                    <span className="min-w-0 flex-1 pt-1 md:mt-5 md:px-2 md:pt-0">
                      <span className="block font-sans text-lg font-semibold text-[#191c1d] group-hover:text-[#ae2f34] md:text-xl">
                        {step.title}
                      </span>
                      <span className="mt-1.5 block text-sm leading-6 text-stone-600">
                        {step.text}
                      </span>
                    </span>
                  </Link>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ---------- SUBSCRIPTION PATHS (original, no animations) ---------- */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-sans text-4xl font-semibold text-[#ae2f34]">Subscription paths</h2>
              <p className="mt-2 text-base leading-7 text-[#584140]">Start with monthly care, then add customization only where it helps.</p>
            </div>
            <Link href="/subscriptions" className="inline-flex items-center gap-2 text-sm font-semibold text-[#ae2f34]">
              View monthly tiers
              <ArrowIcon />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            <CollectionCard collection={collections[0]} large />
            <CollectionCard collection={collections[1]} />
            <CollectionCard collection={collections[2]} />

            <div className="bg-[#fed4c8] p-6 sm:p-8 md:col-span-8 md:min-h-[360px] md:p-12">
              <div className="max-w-xl">
                <h3 className="font-sans text-4xl font-semibold italic text-[#76574e]">
                  &quot;Care feels different when it arrives on time.&quot;
                </h3>
                <p className="mt-5 text-base leading-7 text-[#795950]">
                  Join the BloomBox community and receive updates on monthly tiers, cycle-aware reminders, and delivery drops.
                </p>
                <form className="mt-7 flex flex-col gap-3 sm:flex-row" onSubmit={handleNewsletterSubmit}>
                  <input
                    value={newsletterEmail}
                    onChange={(event) => setNewsletterEmail(event.target.value)}
                    className="min-w-0 flex-1 border border-white bg-white px-6 py-3 text-sm outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-[#fed4c8]"
                    placeholder="Enter your email"
                    type="email"
                    required
                  />
                  <button className="bg-[#006a65] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#004b48]">
                    {isJoiningNewsletter ? 'Joining...' : 'Join us'}
                  </button>
                </form>
                {newsletterStatus ? (
                  <p className="mt-3 border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">{newsletterStatus}</p>
                ) : null}
                {newsletterError ? (
                  <p className="mt-3 border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">{newsletterError}</p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- MONTHLY SUBSCRIPTION PLANS ---------- */}
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            transition={{ duration: 0.6 }}
            className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end"
          >
            <div>
              <h2 className="font-sans text-4xl font-semibold text-[#ae2f34]">Monthly subscription plans</h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#584140]">
                The core BloomBox experience is recurring care: pick a base, save the customer record, then adjust over time.
              </p>
            </div>
            <Link href="/subscriptions" className="inline-flex items-center gap-2 text-sm font-semibold text-[#ae2f34]">
              Compare all tiers
              <ArrowIcon />
            </Link>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            className="grid gap-5 md:grid-cols-3"
          >
            {packages.map((item) => (
              <motion.article
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex flex-col border border-[#e0bfbd] bg-white"
              >
                <div className="relative aspect-[4/3] overflow-hidden border-b border-[#e0bfbd] bg-[#edeeef]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    quality={IMAGE_QUALITY}
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">{item.price}</p>
                  <h3 className="mt-3 font-sans text-3xl font-semibold text-[#191c1d]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">{item.text}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                   
                  </div>
                  <div className="mt-auto pt-6">
                    <Link href={item.href} className="inline-flex w-full items-center justify-between bg-[#ae2f34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                      View subscription
                      <ArrowIcon />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ---------- HOW FOLLOW-UP WORKS ---------- */}
        <section className="border-b border-stone-300 bg-[#fff5f0]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                transition={{ duration: 0.6 }}
              >
                <p className="w-fit bg-[#006a65] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">
                  Care follow-up
                </p>
                <h2 className="mt-4 font-sans text-4xl font-semibold text-[#191c1d]">
                  From form to WhatsApp, without the scramble.
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-[#584140]">
                  When someone shares their details below, BloomBox saves the request, the team reviews it, and follow-up can open in WhatsApp with a ready message.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#care-planner" className="bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                    Fill the form
                  </a>
                  <Link href="/admin/leads" className="border border-[#191c1d] px-5 py-3 text-sm font-semibold text-[#191c1d] transition hover:bg-white">
                    Open lead list
                  </Link>
                </div>
                <DelilahGuide />
              </motion.div>

              {/* Simple 3-step path with connecting line */}
              <motion.ol
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                className="relative grid gap-0"
              >
                <div
                  className="pointer-events-none absolute bottom-8 left-8 top-8 w-0.5 bg-[#e0bfbd]"
                  aria-hidden="true"
                />
                {funnelSteps.map((step, index) => (
                  <motion.li
                    key={step.title}
                    variants={fadeUp}
                    transition={{ duration: 0.45 }}
                    className="relative z-10 flex gap-5 pb-8 last:pb-0"
                  >
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#006a65] bg-white font-sans text-lg font-bold text-[#006a65]">
                      {step.step}
                    </span>
                    <div className="flex-1 border border-stone-300 bg-white p-5">
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-2xl font-semibold text-[#191c1d]">{step.title}</h3>
                        {index < funnelSteps.length - 1 && (
                          <span className="hidden text-xs font-semibold uppercase tracking-wide text-stone-400 sm:inline">
                            then
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{step.text}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </div>
          </div>
        </section>

        {/* ---------- SIGN-UP SHEET (Lead Form with direct WhatsApp) ---------- */}
        <section id="care-planner" className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.78fr_1fr] lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <p className="w-fit bg-[#006a65] px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white">Sign-up sheet</p>
            <h2 className="mt-4 font-sans text-4xl font-semibold text-[#ae2f34]">Find your BloomBox fit.</h2>
            <p className="mt-3 max-w-xl text-base leading-7 text-[#584140]">
              Choose the care path you are considering. We save your details so the team can follow up with the right plan and a WhatsApp message when needed.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            transition={{ duration: 0.6 }}
            className="border border-stone-200 bg-white p-6 sm:p-8"
          >
            <form onSubmit={handleLeadSubmit} className="space-y-6">
              <div className="border border-[#006a65] bg-[#e7fbf8] p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006a65]">WhatsApp follow-up</p>
                <p className="mt-2 text-sm leading-6 text-[#00504c]">
                  Add a WhatsApp number so BloomBox can reply quickly after you send this form.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Name
                  <input value={leadName} onChange={(event) => setLeadName(event.target.value)} className="rounded border border-stone-300 px-4 py-3 font-normal outline-none transition focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Email
                  <input type="email" value={leadEmail} onChange={(event) => setLeadEmail(event.target.value)} className="rounded border border-stone-300 px-4 py-3 font-normal outline-none transition focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  WhatsApp number
                  <input value={leadPhone} onChange={(event) => setLeadPhone(event.target.value)} className="rounded border border-stone-300 px-4 py-3 font-normal outline-none transition focus:border-[#006a65] focus:ring-1 focus:ring-[#006a65]" placeholder="e.g. 0712 345 678" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Budget
                  <select value={leadBudget} onChange={(event) => setLeadBudget(event.target.value)} className="rounded border border-stone-300 px-4 py-3 font-normal outline-none transition focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]">
                    {['KSh 300 - 1,000', 'KSh 1,000 - 2,500', 'KSh 2,500 - 5,000', 'Donation / sponsor', 'Custom'].map((budget) => (
                      <option key={budget} value={budget}>{budget}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700 sm:col-span-2">
                  Interest
                  <select value={leadInterest} onChange={(event) => setLeadInterest(event.target.value)} className="rounded border border-stone-300 px-4 py-3 font-normal outline-none transition focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]">
                    {['Monthly subscription', 'Custom monthly plan', 'First period kit', 'Donate a bundle', 'Corporate or school care', 'Partnership or sponsor'].map((interest) => (
                      <option key={interest} value={interest}>{interest}</option>
                    ))}
                  </select>
                </label>
              </div>

              {leadError ? (
                <p className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{leadError}</p>
              ) : null}
              {leadStatus ? (
                <div className="space-y-3">
                  <p className="rounded border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{leadStatus}</p>
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#128C7E] sm:w-auto"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Open WhatsApp
                    </a>
                  )}
                </div>
              ) : null}

              <button
                disabled={isSavingLead}
                className="w-full rounded bg-[#1B1F3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#006a65] disabled:opacity-60 sm:w-auto"
              >
                {isSavingLead ? 'Saving...' : 'Send request'}
              </button>
            </form>
          </motion.div>
        </section>

        {/* ---------- BLOOMBOX PROMISE ---------- */}
        <section className="relative overflow-hidden bg-[#14090c] py-12 sm:py-16">
          <Image
            src={mockupImages.giftFlowers}
            alt="Darkened BloomBox floral gift arrangement"
            fill
            sizes="100vw"
            quality={IMAGE_QUALITY}
            priority
            className="object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-[#14090c]/70" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              transition={{ duration: 0.6 }}
              className="mx-auto mb-14 max-w-2xl text-center"
            >
              <h2 className="font-sans text-4xl font-semibold text-white">The BloomBox promise</h2>
              <p className="mt-4 text-base leading-7 text-[#fff5f0]">
                We believe care packages are more than products. They are a medium for connection, relief, and ritual.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              className="grid gap-10 md:grid-cols-3"
            >
              {promises.map((promise) => (
                <motion.div
                  key={promise.title}
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center bg-white text-[#ae2f34]">
                    <PromiseIcon type={promise.icon} />
                  </div>
                  <h3 className="font-sans text-2xl font-semibold text-white">{promise.title}</h3>
                  <p className="mt-3 text-base leading-7 text-[#fed4c8]">{promise.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ---------- TESTIMONIALS ---------- */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] overflow-hidden border border-[#e0bfbd] bg-[#edeeef]">
                <Image
                  src="/gift.png"
                  alt="BloomBox gift collection"
                  fill
                  quality={100}
                  sizes="(min-width: 1024px) 560px, 90vw"
                  priority
                  className="object-cover object-center [image-rendering:high-quality]"
                />
              </div>
              <div className="mt-5 max-w-sm border border-[#e0bfbd] bg-white p-7 lg:absolute lg:-bottom-8 lg:-right-8 lg:mt-0">
                <div className="mb-3 flex gap-1 text-[#ae2f34]" aria-label="Five star rating">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span key={index}>*</span>
                  ))}
                </div>
                <p className="text-base italic leading-7 text-[#191c1d]">
                  &quot;The care and detail in my package made it feel genuinely personal.&quot;
                </p>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">BloomBox family</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              transition={{ duration: 0.6 }}
              className="lg:pl-10"
            >
              <h2 className="font-sans text-4xl font-semibold italic text-[#ae2f34]">Voices of the BloomBox family</h2>
              <div className="mt-9 space-y-9">
                {testimonials.map((item) => (
                  <div key={item.title} className="border-b border-[#e0bfbd] pb-8">
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.16em] text-[#584140]">&quot;{item.title}&quot;</h3>
                    <p className="text-lg leading-8 text-[#191c1d]">&quot;{item.text}&quot;</p>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-[#76574e]">{item.name}</p>
                  </div>
                ))}
              </div>
              <Link href="/about" className="mt-11 inline-flex items-center gap-4 text-sm font-bold text-[#ae2f34]">
                <span className="flex h-12 w-12 items-center justify-center border border-[#ae2f34]">
                  <PlayIcon />
                </span>
                Watch our story
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <SiteFooter />

      <Link href="/subscriptions" className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center bg-[#ae2f34] text-white md:bottom-10" aria-label="Open subscription plans">
        <ChatIcon />
      </Link>
    </div>
  );
}