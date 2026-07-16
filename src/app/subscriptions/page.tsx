'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  createCardSubscription,
  subscribeToUserSubscriptions,
  type CustomerSubscription,
  type SubscriptionPlanInput,
} from '@/lib/firestore';
import { useAuth } from '../components/AuthProvider';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const tiers = [
  {
    tier: 'Tier 1',
    name: 'Pads Bloom',
    price: 'KSh 300/mo',
    amount: 300,
    summary: 'A recurring monthly box with one pack of pads, flowers, and a small treat.',
    image: '/products/kot.jpg',
    items: ['Pads - 1 pack', 'Flowers', 'Gift or treat'],
    action: 'Subscribe with card',
    href: '/subscriptions#subscription-card',
    accent: 'bg-[#ae2f34]',
  },
  {
    tier: 'Tier 2',
    name: 'Tampon Bloom',
    price: 'KSh 500/mo',
    amount: 500,
    summary: 'A recurring monthly box with one pack of tampons, flowers, and a small treat.',
    image: '/products/tampons.jpg',
    items: ['Tampons - 1 pack', 'Flowers', 'Gift or treat'],
    action: 'Subscribe with card',
    href: '/subscriptions#subscription-card',
    accent: 'bg-[#76574e]',
  },
  {
    tier: 'Tier 3',
    name: 'Double Pad Bloom',
    price: 'KSh 600/mo',
    amount: 600,
    summary: 'A recurring monthly box with two packs of pads, flowers, and a small treat.',
    image: '/products/kot.jpg',
    items: ['Pads - 2 packs', 'Flowers', 'Gift or treat'],
    action: 'Subscribe with card',
    href: '/subscriptions#subscription-card',
    accent: 'bg-[#8c1520]',
  },
  {
    tier: 'Tier 4',
    name: 'Double Tampon Bloom',
    price: 'KSh 700/mo',
    amount: 700,
    summary: 'A recurring monthly box with two packs of tampons, flowers, and a small treat.',
    image: '/products/tampons.jpg',
    items: ['Tampons - 2 packs', 'Flowers', 'Gift or treat'],
    action: 'Subscribe with card',
    href: '/subscriptions#subscription-card',
    accent: 'bg-[#006a65]',
  },
  {
    tier: 'Tier 5',
    name: 'Custom Monthly Plan',
    price: 'Custom/mo',
    amount: null,
    summary: 'Build a recurring BloomBox from the catalog and adjust the add-ons month by month.',
    image: '/products/candle.jpg',
    items: ['Choose a care base', 'Add flowers or treats', 'Custom total at checkout'],
    action: 'Build monthly plan',
    href: '/shop',
    accent: 'bg-[#FF914D]',
  },
];

const pricedTiers = tiers.filter((tier) => tier.amount !== null);
const customTier = tiers.find((tier) => tier.amount === null);

const addOns = [
  { name: 'Hot water bottle', image: '/products/waterbottles.jpg', href: '/shop' },
  { name: 'Bath bombs', image: '/products/bathbombs.jpg', href: '/shop' },
  { name: 'Scented candle', image: '/products/candle.jpg', href: '/shop' },
  { name: 'Face masks', image: '/products/facemasks.jpg', href: '/shop' },
];

const faqs = [
  ['Can I change the items?', 'Yes. The custom monthly plan is built for that, and the fixed tiers can still receive add-ons before checkout.'],
  ['Are the prices final?', 'The listed subscription tiers are starting monthly points. Flowers, gifts, and supplier-led products can change with availability.'],
  ['Can I donate instead of subscribing?', 'Yes. Donations now live on their own page so community support does not mix with customer subscriptions.'],
];

function getCardBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Card';
}

function getDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  if (value instanceof Date) {
    return value.toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return 'Not scheduled';
}

function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState<CustomerSubscription[]>([]);
  const [selectedTierId, setSelectedTierId] = useState(tiers[0].tier);
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const selectedTier = tiers.find((tier) => tier.tier === selectedTierId) ?? tiers[0];

  useEffect(() => {
    if (!user) {
      setActiveSubscriptions([]);
      return undefined;
    }

    return subscribeToUserSubscriptions(user.uid, setActiveSubscriptions, (subscriptionsError) => {
      setError(`Subscriptions could not load: ${subscriptionsError.message}`);
    });
  }, [user]);

  const chooseTier = (tier: (typeof tiers)[number]) => {
    if (tier.amount === null) return;

    setSelectedTierId(tier.tier);
    setNotice('');
    setError('');
    document.getElementById('subscription-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activateSubscription = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');

    if (!user) {
      setError('Log in before activating a subscription.');
      return;
    }

    if (selectedTier.amount === null) {
      setError('Choose a priced monthly tier before adding card details.');
      return;
    }

    const digits = cardNumber.replace(/\D/g, '');

    if (cardholderName.trim().length < 2 || digits.length < 12 || cardExpiry.trim().length < 4 || cardCvv.replace(/\D/g, '').length < 3) {
      setError('Add the cardholder name, card number, expiry, and CVV.');
      return;
    }

    const plan: SubscriptionPlanInput = {
      planId: selectedTier.tier.toLowerCase().replace(/\s+/g, '-'),
      planName: selectedTier.name,
      amount: selectedTier.amount,
      amountLabel: selectedTier.price,
      summary: selectedTier.summary,
    };

    setIsActivating(true);

    try {
      const subscriptionId = await createCardSubscription(user, plan, {
        holderName: cardholderName.trim(),
        brand: getCardBrand(digits),
        last4: digits.slice(-4),
        expiry: cardExpiry.trim(),
      });
      setNotice(`${selectedTier.name} is active. Subscription ID: ${subscriptionId}`);
      setCardholderName('');
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
    } catch (subscriptionError) {
      setError(subscriptionError instanceof Error ? subscriptionError.message : 'Could not activate subscription.');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main className="pb-24 lg:pb-0">
        {/* Compact mobile hero */}
        <section className="border-b border-stone-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Subscriptions</p>
            <h1 className="mt-1.5 font-serif text-2xl font-semibold leading-tight text-[#191c1d]">
              Monthly care from KSh 300
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#584140]">
              Pick a tier, add your card, and keep period care on schedule.
            </p>
            {activeSubscriptions.length > 0 ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <p className="text-xs font-semibold text-emerald-900">
                  {activeSubscriptions.length} active plan{activeSubscriptions.length === 1 ? '' : 's'}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-emerald-800">
                  {activeSubscriptions[0].planName}
                  {activeSubscriptions.length > 1 ? ` +${activeSubscriptions.length - 1} more` : ''}
                </p>
              </div>
            ) : null}
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a
                href="#subscription-tiers"
                className="rounded-lg bg-[#ae2f34] px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Choose tier
              </a>
              <a
                href="#subscription-card"
                className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800"
              >
                Card setup
              </a>
            </div>
          </div>
        </section>

        {/* Desktop hero */}
        <section className="hidden border-b border-stone-300 bg-white lg:block">
          <div className="mx-auto grid max-w-7xl gap-8 px-8 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <Eyebrow>Subscriptions</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                Monthly care tiers, clear from the start.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#584140]">
                Choose a recurring BloomBox tier, save the subscription, and keep monthly period care moving without starting from scratch each cycle.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#subscription-card" className="rounded-md bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Activate monthly care
                </a>
                <Link href="/donate" className="rounded-md border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  Donate separately
                </Link>
              </div>
            </div>

            <div className="bb-hero-collage">
              <div className="relative overflow-hidden rounded-md border border-stone-300 bg-stone-100">
                <Image src="/products/candle.jpg" alt="BloomBox candle subscription add-on" fill sizes="(min-width: 1024px) 560px, 100vw" priority className="object-cover" />
              </div>
              <div className="grid gap-3 sm:gap-4">
                <div className="relative overflow-hidden rounded-md border border-stone-300 bg-stone-100">
                  <Image src="/products/waterbottles.jpg" alt="Hot water bottle comfort item" fill sizes="240px" className="object-cover" />
                </div>
                <div className="rounded-md border border-stone-300 bg-[#fff5f0] p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">From</p>
                  <p className="mt-2 font-serif text-3xl font-semibold text-[#191c1d] sm:text-4xl">KSh 300</p>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">Starter care tier with flowers and a treat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tiers first on mobile flow */}
        <section id="subscription-tiers" className="mx-auto max-w-7xl scroll-mt-28 px-3 py-5 sm:px-8 sm:py-14">
          <div className="mb-3 flex items-end justify-between gap-3 px-1 sm:mb-9">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">
                Monthly plans
              </p>
              <h2 className="mt-1 font-serif text-xl font-semibold text-[#191c1d] sm:mt-3 sm:text-4xl">
                Choose your tier
              </h2>
              <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-stone-600 sm:mt-2 sm:block">
                Pick a ready monthly tier, or use the custom plan when you want more control over add-ons.
              </p>
            </div>
          </div>

          {/* Mobile horizontal tier rail */}
          <div className="bb-mobile-scroll -mx-3 flex snap-x snap-mandatory gap-3 px-3 pb-1 lg:hidden">
            {pricedTiers.map((tier) => {
              const isSelected = selectedTierId === tier.tier;
              return (
                <button
                  key={tier.tier}
                  type="button"
                  onClick={() => chooseTier(tier)}
                  className={`w-[78vw] max-w-[300px] shrink-0 snap-start overflow-hidden rounded-xl border bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition ${
                    isSelected ? 'border-[#ae2f34] ring-2 ring-[#fed4c8]' : 'border-stone-200'
                  }`}
                >
                  <div className={`h-1 ${tier.accent}`} />
                  <div className="p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
                        <Image src={tier.image} alt={tier.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ae2f34]">{tier.tier}</p>
                          {isSelected ? (
                            <span className="rounded-full bg-[#ae2f34] px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                              Selected
                            </span>
                          ) : null}
                        </div>
                        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug text-[#191c1d]">{tier.name}</h3>
                        <p className="mt-1 text-base font-bold text-[#ae2f34]">{tier.price}</p>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-stone-600">{tier.summary}</p>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {tier.items.map((item) => (
                        <li key={item} className="rounded-full bg-[#fff5f0] px-2 py-1 text-[10px] font-semibold text-[#8c1520]">
                          {item}
                        </li>
                      ))}
                    </ul>
                    <span
                      className={`mt-3.5 flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold ${
                        isSelected ? 'bg-[#191c1d] text-white' : 'bg-[#ae2f34] text-white'
                      }`}
                    >
                      {isSelected ? 'Selected · set up card' : 'Select this tier'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Desktop tier grid */}
          <div className="hidden gap-4 lg:grid lg:grid-cols-4">
            {pricedTiers.map((tier) => {
              const isSelected = selectedTierId === tier.tier;

              return (
                <article
                  key={tier.tier}
                  className={`relative flex min-h-full flex-col overflow-hidden rounded-md border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                    isSelected ? 'border-[#ae2f34] ring-2 ring-[#fed4c8]' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className={`absolute inset-x-0 top-0 h-1 ${tier.accent}`} />
                  <div className="flex items-start gap-4 pt-2">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
                      <Image src={tier.image} alt={tier.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">{tier.tier}</p>
                        {isSelected ? (
                          <span className="rounded-md bg-[#ae2f34] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight text-[#191c1d]">{tier.name}</h3>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end gap-1">
                    <p className="text-3xl font-bold tracking-tight text-[#191c1d]">{tier.price.replace('/mo', '')}</p>
                    <p className="pb-1 text-xs font-bold uppercase tracking-[0.12em] text-stone-500">/mo</p>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-stone-600">{tier.summary}</p>

                  <ul className="mt-5 grid gap-2 border-t border-stone-200 pt-5">
                    {tier.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm font-medium text-stone-700">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[#ae2f34]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    onClick={() => chooseTier(tier)}
                    className={`mt-auto inline-flex w-full justify-center rounded-md px-5 py-3 text-sm font-semibold transition ${
                      isSelected ? 'bg-[#191c1d] text-white' : 'bg-[#ae2f34] text-white hover:bg-[#8c1520]'
                    }`}
                  >
                    {isSelected ? 'Selected for card setup' : 'Select this tier'}
                  </button>
                </article>
              );
            })}
          </div>

          {customTier ? (
            <article
              id="custom-plan"
              className="mt-4 scroll-mt-28 overflow-hidden rounded-xl border border-stone-200 bg-[#191c1d] text-white shadow-sm sm:mt-5 sm:rounded-md lg:grid lg:grid-cols-[0.75fr_1.25fr]"
            >
              <div className="relative hidden min-h-[240px] bg-stone-900 lg:block">
                <Image src={customTier.image} alt={customTier.name} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover opacity-85" />
                <div className="absolute inset-0 bg-[#191c1d]/20" />
              </div>
              <div className="p-4 sm:p-8">
                <div className="flex flex-col justify-between gap-3 sm:gap-5 md:flex-row md:items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#fed4c8] sm:text-xs sm:tracking-[0.16em]">
                      {customTier.tier} / Flexible
                    </p>
                    <h3 className="mt-2 font-serif text-xl font-semibold leading-tight text-white sm:mt-3 sm:text-4xl">
                      {customTier.name}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-200 sm:mt-4">{customTier.summary}</p>
                  </div>
                  <p className="w-fit shrink-0 rounded-md bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-[#191c1d] sm:px-4 sm:py-2 sm:text-sm">
                    {customTier.price}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
                  {customTier.items.map((item) => (
                    <span key={item} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white sm:rounded-md sm:px-3 sm:py-1.5 sm:text-xs">
                      {item}
                    </span>
                  ))}
                </div>
                <Link
                  href={customTier.href}
                  className="mt-5 inline-flex w-full justify-center rounded-lg bg-[#fed4c8] px-5 py-3 text-sm font-semibold text-[#191c1d] transition hover:bg-white sm:mt-7 sm:w-auto sm:rounded-md"
                >
                  {customTier.action}
                </Link>
              </div>
            </article>
          ) : null}
        </section>

        <section id="subscription-card" className="scroll-mt-28 border-y border-stone-200 bg-[#f8f9fa] sm:border-stone-300">
          <div className="mx-auto grid max-w-7xl gap-4 px-3 py-5 sm:gap-6 sm:px-8 sm:py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
            <div className="rounded-xl border border-[#241314] bg-[#191c1d] p-4 text-white shadow-sm sm:rounded-md sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#fed4c8] sm:hidden">Card subscription</p>
              <div className="hidden sm:block">
                <Eyebrow>Card subscription</Eyebrow>
              </div>
              <h2 className="mt-2 font-serif text-xl font-semibold leading-tight text-white sm:mt-5 sm:text-4xl">
                Activate with card
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#fed4c8] sm:mt-4">
                Only brand, expiry, and last four digits are stored — not the full card number.
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/10 p-3.5 sm:mt-7 sm:rounded-md sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#fed4c8]">Selected tier</p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-white sm:mt-2 sm:text-3xl">{selectedTier.name}</h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-white sm:text-2xl">{selectedTier.price.replace('/mo', '')}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#fed4c8] sm:mt-1 sm:text-xs">
                      {selectedTier.amount === null ? 'Custom' : 'Monthly'}
                    </p>
                  </div>
                </div>
                <p className="mt-2 hidden text-sm leading-6 text-stone-100 sm:mt-4 sm:block">{selectedTier.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                  {selectedTier.items.map((item) => (
                    <span key={item} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white sm:rounded-md sm:px-3 sm:py-1.5 sm:text-xs">
                      {item}
                    </span>
                  ))}
                </div>
                <a href="#subscription-tiers" className="mt-3 inline-flex text-sm font-semibold text-[#fed4c8] hover:text-white sm:mt-5">
                  Change tier
                </a>
              </div>

              {activeSubscriptions.length > 0 ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-white p-3.5 text-stone-950 sm:mt-5 sm:rounded-md sm:p-4">
                  <div className="border-b border-stone-200 pb-2">
                    <h3 className="text-sm font-semibold text-[#191c1d] sm:text-base">Your active subscriptions</h3>
                    <p className="mt-0.5 text-xs text-stone-500 sm:text-sm">
                      {activeSubscriptions.length} saved monthly plan{activeSubscriptions.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="divide-y divide-stone-200">
                    {activeSubscriptions.map((subscription) => (
                      <div key={subscription.id} className="py-2.5 text-sm sm:py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-stone-950">{subscription.planName}</p>
                            <p className="mt-0.5 text-xs text-stone-600 sm:mt-1 sm:text-sm">
                              {subscription.amount === null ? subscription.amountLabel : money(subscription.amount)} / {subscription.interval}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">
                            {subscription.status}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-5 text-stone-500 sm:mt-2 sm:text-xs">
                          {subscription.card?.brand ?? 'Card'} ···{subscription.card?.last4 ?? '----'} · Next: {getDate(subscription.nextBillingAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={activateSubscription} className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm sm:rounded-md sm:p-6">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-stone-200 pb-3 sm:mb-5 sm:gap-3 sm:pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">
                    Card details
                  </p>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-[#191c1d] sm:mt-2 sm:text-3xl">Secure setup</h3>
                </div>
                <span className="rounded-full bg-[#fff5f0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8c1520] sm:rounded-md sm:px-3 sm:py-1.5 sm:text-xs">
                  No full card saved
                </span>
              </div>
              <div className="grid gap-3.5 sm:gap-4">
                <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
                  Cardholder name
                  <input
                    value={cardholderName}
                    onChange={(event) => setCardholderName(event.target.value)}
                    className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base font-normal outline-none transition focus:border-[#ae2f34] focus:ring-2 focus:ring-[#fed4c8] sm:rounded-md sm:px-4 sm:text-sm"
                    placeholder="Name on card"
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
                  Card number
                  <input
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    inputMode="numeric"
                    className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base font-normal outline-none transition focus:border-[#ae2f34] focus:ring-2 focus:ring-[#fed4c8] sm:rounded-md sm:px-4 sm:text-sm"
                    placeholder="4242 4242 4242 4242"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
                    Expiry
                    <input
                      value={cardExpiry}
                      onChange={(event) => setCardExpiry(event.target.value)}
                      className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base font-normal outline-none transition focus:border-[#ae2f34] focus:ring-2 focus:ring-[#fed4c8] sm:rounded-md sm:px-4 sm:text-sm"
                      placeholder="MM/YY"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
                    CVV
                    <input
                      value={cardCvv}
                      onChange={(event) => setCardCvv(event.target.value)}
                      inputMode="numeric"
                      className="rounded-lg border border-stone-300 bg-white px-3 py-3 text-base font-normal outline-none transition focus:border-[#ae2f34] focus:ring-2 focus:ring-[#fed4c8] sm:rounded-md sm:px-4 sm:text-sm"
                      placeholder="123"
                    />
                  </label>
                </div>
                {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 sm:rounded-md sm:px-4 sm:py-3">{error}</p> : null}
                {notice ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900 sm:rounded-md sm:px-4 sm:py-3">{notice}</p> : null}
                <button
                  disabled={isActivating || selectedTier.amount === null}
                  className="rounded-lg bg-[#ae2f34] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#8c1520] disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-md sm:py-3"
                >
                  {isActivating ? 'Activating...' : `Activate ${selectedTier.name}`}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="border-b border-stone-200 bg-white sm:border-stone-300">
          <div className="mx-auto max-w-7xl px-3 py-6 sm:px-8 sm:py-14">
            <div className="mb-4 flex items-end justify-between gap-3 px-1 sm:mb-8">
              <div className="min-w-0">
                <h2 className="font-serif text-xl font-semibold text-[#191c1d] sm:text-4xl">Common add-ons</h2>
                <p className="mt-1 hidden text-sm leading-6 text-stone-600 sm:mt-2 sm:block">
                  Add comfort, self-care, small treats, or gift moments to any monthly tier.
                </p>
              </div>
              <Link href="/gifting" className="shrink-0 text-sm font-semibold text-[#ae2f34] sm:border sm:border-[#ae2f34] sm:px-5 sm:py-3 sm:transition sm:hover:bg-[#fff5f0]">
                Gifting
              </Link>
            </div>
            {/* Mobile horizontal add-ons */}
            <div className="bb-mobile-scroll -mx-3 flex snap-x snap-mandatory gap-2.5 px-3 pb-1 sm:hidden">
              {addOns.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="w-[42vw] max-w-[160px] shrink-0 snap-start overflow-hidden rounded-xl border border-stone-200 bg-[#f8f9fa]"
                >
                  <span className="relative block aspect-square overflow-hidden bg-stone-100">
                    <Image src={item.image} alt={item.name} fill sizes="160px" className="object-cover" />
                  </span>
                  <span className="block px-2.5 py-2 text-xs font-semibold leading-snug text-stone-950">{item.name}</span>
                </Link>
              ))}
            </div>
            <div className="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {addOns.map((item) => (
                <Link key={item.name} href={item.href} className="group overflow-hidden rounded-md border border-stone-300 bg-[#f8f9fa] shadow-sm">
                  <span className="relative block aspect-square overflow-hidden bg-stone-100">
                    <Image src={item.image} alt={item.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                  </span>
                  <span className="block p-4 font-semibold text-stone-950">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-3 py-6 sm:gap-10 sm:px-8 sm:py-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-2 font-serif text-xl font-semibold tracking-tight text-stone-950 sm:mt-4 sm:text-4xl">
              Keep it simple.
            </h2>
          </div>
          <div className="space-y-2 sm:space-y-3">
            {faqs.map(([question, answer], index) => (
              <div key={question} className="rounded-xl border border-stone-300 bg-white sm:rounded-md">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="flex w-full items-start justify-between gap-3 px-3.5 py-3.5 text-left text-sm font-semibold text-stone-950 sm:items-center sm:gap-4 sm:px-5 sm:py-4 sm:text-base"
                >
                  <span className="min-w-0 leading-snug">{question}</span>
                  <span className="shrink-0 text-[#ae2f34]">{openFaq === index ? '−' : '+'}</span>
                </button>
                {openFaq === index ? (
                  <p className="px-3.5 pb-3.5 text-sm leading-6 text-stone-600 sm:px-5 sm:pb-5">{answer}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile sticky: selected tier + go to card */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-stone-500">{selectedTier.tier}</p>
            <p className="truncate text-sm font-bold text-[#191c1d]">
              {selectedTier.name} · {selectedTier.price}
            </p>
          </div>
          <a
            href="#subscription-card"
            className="shrink-0 rounded-lg bg-[#ae2f34] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Set up card
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
