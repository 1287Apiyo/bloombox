'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createCardSubscription, type SubscriptionPlanInput } from '@/lib/firestore';
import { useAuth } from '../components/AuthProvider';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const tiers = [
  {
    tier: 'Tier 1',
    name: 'Pads Bloom',
    price: 'KSh 300',
    amount: 300,
    summary: 'One pack of pads with flowers and a small treat.',
    image: '/products/marvel.jpg',
    items: ['Pads - 1 pack', 'Flowers', 'Gift or treat'],
    action: 'Build this box',
    href: '/shop',
    accent: 'bg-[#ae2f34]',
  },
  {
    tier: 'Tier 2',
    name: 'Tampon Bloom',
    price: 'KSh 500',
    amount: 500,
    summary: 'One pack of tampons with flowers and a small treat.',
    image: '/products/tampons.jpg',
    items: ['Tampons - 1 pack', 'Flowers', 'Gift or treat'],
    action: 'Build this box',
    href: '/shop',
    accent: 'bg-[#76574e]',
  },
  {
    tier: 'Tier 3',
    name: 'Double Pad Bloom',
    price: 'KSh 600',
    amount: 600,
    summary: 'Two packs of pads with flowers and a small treat.',
    image: '/products/kot.jpg',
    items: ['Pads - 2 packs', 'Flowers', 'Gift or treat'],
    action: 'Build this box',
    href: '/shop',
    accent: 'bg-[#8c1520]',
  },
  {
    tier: 'Tier 4',
    name: 'Double Tampon Bloom',
    price: 'KSh 700',
    amount: 700,
    summary: 'Two packs of tampons with flowers and a small treat.',
    image: '/products/tampons.jpg',
    items: ['Tampons - 2 packs', 'Flowers', 'Gift or treat'],
    action: 'Build this box',
    href: '/shop',
    accent: 'bg-[#006a65]',
  },
  {
    tier: 'Tier 5',
    name: 'Donate a Bundle',
    price: 'Donation',
    amount: null,
    summary: 'Sponsor a care bundle for someone who needs support.',
    image: '/mockups/bloombox-gift-flowers.png',
    items: ['Care essentials', 'Comfort item', 'Community delivery'],
    action: 'Donate bundle',
    href: '/gifting',
    accent: 'bg-[#1B1F3B]',
  },
  {
    tier: 'Tier 6',
    name: 'BYOB',
    price: 'Custom costing',
    amount: null,
    summary: 'Build your own box from the catalog and price it as you go.',
    image: '/products/candle.jpg',
    items: ['Choose products', 'Add flowers or treats', 'Custom total at checkout'],
    action: 'Start custom box',
    href: '/shop',
    accent: 'bg-[#FF914D]',
  },
];

const addOns = [
  { name: 'Hot water bottle', image: '/products/waterbottles.jpg', href: '/shop' },
  { name: 'Bath bombs', image: '/products/bathbombs.jpg', href: '/shop' },
  { name: 'Scented candle', image: '/products/candle.jpg', href: '/shop' },
  { name: 'Face masks', image: '/products/facemasks.jpg', href: '/shop' },
];

const faqs = [
  ['Can I change the items?', 'Yes. Tier 6 is fully custom, and the other tiers can still be adjusted through the shop flow before checkout.'],
  ['Are the prices final?', 'The listed subscription tiers are starting points. Flowers, gifts, and supplier-led products can change with availability.'],
  ['Can I donate instead of subscribing?', 'Yes. Tier 5 is built for donations and community support bundles.'],
];

function getCardBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, '');

  if (digits.startsWith('4')) return 'Visa';
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'American Express';
  return 'Card';
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState(0);
  const [selectedTierId, setSelectedTierId] = useState(tiers[0].tier);
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  const selectedTier = tiers.find((tier) => tier.tier === selectedTierId) ?? tiers[0];

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

      <main>
        <section className="border-b border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:py-20">
            <div>
              <Eyebrow>Subscriptions</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                Monthly care tiers, clear from the start.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#584140]">
                Choose a ready tier for predictable delivery, donate a bundle, or build your own BloomBox with custom costing.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Build from catalog
                </Link>
                <Link href="/gifting" className="border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  Donate a bundle
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_0.72fr] gap-4">
              <div className="relative min-h-[430px] overflow-hidden border border-stone-300 bg-stone-100">
                <Image src="/products/candle.jpg" alt="BloomBox candle subscription add-on" fill sizes="(min-width: 1024px) 560px, 100vw" priority className="object-cover" />
              </div>
              <div className="grid gap-4">
                <div className="relative min-h-[204px] overflow-hidden border border-stone-300 bg-stone-100">
                  <Image src="/products/waterbottles.jpg" alt="Hot water bottle comfort item" fill sizes="240px" className="object-cover" />
                </div>
                <div className="border border-stone-300 bg-[#fff5f0] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">From</p>
                  <p className="mt-2 font-serif text-4xl font-semibold text-[#191c1d]">KSh 300</p>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">Starter care tier with flowers and a treat.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-serif text-4xl font-semibold text-[#ae2f34]">Subscription tiers</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Each tier includes the period-care base, flowers, and a gift or treat unless it is marked as custom or donation.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {tiers.map((tier) => (
              <article key={tier.tier} className="grid overflow-hidden border border-stone-300 bg-white">
                <div className="relative aspect-[4/3] bg-stone-100">
                  <Image src={tier.image} alt={tier.name} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                  <span className={`absolute inset-x-0 top-0 h-2 ${tier.accent}`} />
                  <span className="absolute left-4 top-4 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-950">
                    {tier.tier}
                  </span>
                </div>

                <div className="grid gap-5 p-5">
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-3xl font-semibold text-[#191c1d]">{tier.name}</h3>
                      <p className="shrink-0 text-right text-lg font-semibold text-[#ae2f34]">{tier.price}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-stone-600">{tier.summary}</p>
                  </div>

                  <ul className="border-y border-stone-200 py-4">
                    {tier.items.map((item) => (
                      <li key={item} className="flex items-center justify-between gap-4 py-2 text-sm text-stone-700">
                        <span>{item}</span>
                        <span className="h-1.5 w-1.5 bg-[#ae2f34]" />
                      </li>
                    ))}
                  </ul>

                  {tier.amount === null ? (
                    <Link href={tier.href} className="inline-flex justify-center bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1B1F3B]">
                      {tier.action}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => chooseTier(tier)}
                      className={`inline-flex justify-center px-5 py-3 text-sm font-semibold transition ${
                        selectedTierId === tier.tier ? 'bg-[#1B1F3B] text-white' : 'bg-[#ae2f34] text-white hover:bg-[#1B1F3B]'
                      }`}
                    >
                      {selectedTierId === tier.tier ? 'Selected for card setup' : 'Subscribe with card'}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="subscription-card" className="border-y border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
            <div>
              <Eyebrow>Card subscription</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl font-semibold text-[#191c1d]">Activate monthly care by card.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#584140]">
                This sets up a BloomBox subscription record and stores only card brand, expiry, and last four digits. Full card numbers and CVV are not saved.
              </p>
              <div className="mt-6 border-l-4 border-[#ae2f34] bg-[#fff5f0] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Selected tier</p>
                <p className="mt-2 font-serif text-3xl font-semibold">{selectedTier.name}</p>
                <p className="mt-1 text-sm font-semibold text-[#8c1520]">{selectedTier.price} monthly</p>
                <p className="mt-2 text-sm leading-6 text-[#584140]">{selectedTier.summary}</p>
              </div>
            </div>

            <form onSubmit={activateSubscription} className="border border-stone-300 bg-[#fff5f0] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Card details</p>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Cardholder name
                  <input value={cardholderName} onChange={(event) => setCardholderName(event.target.value)} className="border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#ae2f34]" placeholder="Name on card" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Card number
                  <input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} inputMode="numeric" className="border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#ae2f34]" placeholder="4242 4242 4242 4242" />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-stone-700">
                    Expiry
                    <input value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} className="border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#ae2f34]" placeholder="MM/YY" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-stone-700">
                    CVV
                    <input value={cardCvv} onChange={(event) => setCardCvv(event.target.value)} inputMode="numeric" className="border border-stone-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#ae2f34]" placeholder="123" />
                  </label>
                </div>
                {error ? <p className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p> : null}
                {notice ? <p className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{notice}</p> : null}
                <button disabled={isActivating || selectedTier.amount === null} className="bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:cursor-not-allowed disabled:opacity-60">
                  {isActivating ? 'Activating...' : `Activate ${selectedTier.name}`}
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="border-y border-stone-300 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
            <div className="mb-8">
              <h2 className="font-serif text-4xl font-semibold text-[#191c1d]">Common add-ons</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">Add comfort, self-care, or small treats to any tier.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {addOns.map((item) => (
                <Link key={item.name} href={item.href} className="group border border-stone-300 bg-[#f8f9fa]">
                  <span className="relative block aspect-square overflow-hidden bg-stone-100">
                    <Image src={item.image} alt={item.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                  </span>
                  <span className="block p-4 font-semibold text-stone-950">{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Questions</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-stone-950">Keep it simple.</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(([question, answer], index) => (
              <div key={question} className="border border-stone-300 bg-white">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-stone-950"
                >
                  {question}
                  <span>{openFaq === index ? '-' : '+'}</span>
                </button>
                {openFaq === index ? <p className="px-5 pb-5 text-sm leading-6 text-stone-600">{answer}</p> : null}
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
