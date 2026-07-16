'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';
import { MobilePairCarousel } from '../components/MobilePairCarousel';

const occasions = ['All', 'First period', 'Birthday', 'Just because', 'Self-care', 'New mom'];

const gifts = [
  {
    name: 'First Bloom Gift Set',
    occasion: 'First period',
    price: 'From KSh 4,800',
    image: '/products/marvel.jpg',
    description: 'Pads, hygiene basics, a journal, a card, and one comforting add-on.',
    includes: ['Pads', 'Wipes', 'Card', 'Comfort add-on'],
  },
  {
    name: 'Comfort Drop',
    occasion: 'Just because',
    price: 'From KSh 2,400',
    image: '/products/waterbottles.jpg',
    description: 'A quiet care package for cramps, low energy days, or a hard week.',
    includes: ['Hot water bottle', 'Treat', 'Note'],
  },
  {
    name: 'Self-Care Evening',
    occasion: 'Self-care',
    price: 'From KSh 3,200',
    image: '/products/candle.jpg',
    description: 'Candles, bath items, body scrub, and a note that does not feel generic.',
    includes: ['Candle', 'Bath bomb', 'Body care'],
  },
  {
    name: 'New Mum Care Kit',
    occasion: 'New mom',
    price: 'From KSh 4,500',
    image: '/products/facemasks.jpg',
    description: 'Soft essentials and care extras for someone recovering and adjusting.',
    includes: ['Masks', 'Wipes', 'Comfort item'],
  },
  {
    name: 'Birthday Bloom',
    occasion: 'Birthday',
    price: 'From KSh 3,800',
    image: '/mockups/bloombox-gift-flowers.png',
    description: 'Flowers, a card, and self-care items arranged around her preferences.',
    includes: ['Flowers', 'Card', 'Gift treat'],
  },
  {
    name: 'Custom Gift Box',
    occasion: 'Just because',
    price: 'Priced by selection',
    image: '/products/bathbombs.jpg',
    description: 'Start with catalog items, then add message, delivery, and recipient details.',
    includes: ['Choose items', 'Set budget', 'Add note'],
  },
];

const storyCards = [
  {
    title: 'Choose the feeling',
    text: 'Start with the occasion, then select a direction that matches the recipient.',
    image: '/mockups/bloombox-open-box.png',
  },
  {
    title: 'Add useful care',
    text: 'Layer practical products with comfort items so the gift is beautiful and useful.',
    image: '/products/adbags.jpg',
  },
  {
    title: 'Send with details',
    text: 'Checkout captures address, phone, notes, and payment before delivery.',
    image: '/mockups/bloombox-delivery.png',
  },
];

export default function GiftingPage() {
  const [activeOccasion, setActiveOccasion] = useState('All');
  const visibleGifts = useMemo(
    () => gifts.filter((gift) => activeOccasion === 'All' || gift.occasion === activeOccasion),
    [activeOccasion],
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main>
        {/* Mobile compact hero */}
        <section className="bb-mobile-hero lg:hidden">
          <div className="bb-mobile-hero-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Gifting</p>
            <h1 className="bb-mobile-h1">Personal, not packaged.</h1>
            <p className="bb-mobile-lead">
              First period kits, birthday flowers, self-care evenings — useful gifts that feel held.
            </p>
            <div className="bb-mobile-cta-row">
              <Link href="/shop" className="rounded-md bg-[#ae2f34] px-3 py-2.5 text-center text-sm font-semibold text-white">
                Build gift
              </Link>
              <Link href="/subscriptions" className="rounded-md border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800">
                Care tiers
              </Link>
            </div>
          </div>
        </section>

        {/* Desktop hero */}
        <section className="hidden border-b border-stone-300 bg-white lg:block">
          <div className="mx-auto grid max-w-7xl gap-8 px-8 py-20 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
            <div>
              <Eyebrow>Gifting</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                Send something that feels personal, not packaged.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#584140]">
                Build gifts around real moments: first period care, birthday flowers, self-care evenings, recovery, or a simple reminder that someone is held.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="rounded-md bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Build from catalog
                </Link>
                <Link href="/subscriptions" className="rounded-md border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  View care tiers
                </Link>
              </div>
            </div>

            <div className="bb-hero-collage">
              <div className="relative overflow-hidden rounded-md border border-stone-300 bg-stone-100">
                <Image src="/mockups/bloombox-gift-flowers.png" alt="BloomBox flowers and gift box" fill sizes="(min-width: 1024px) 560px, 100vw" priority className="object-cover" />
              </div>
              <div className="grid gap-3 sm:gap-4">
                <div className="relative overflow-hidden rounded-md border border-stone-300 bg-stone-100">
                  <Image src="/products/candle.jpg" alt="Scented candle gift add-on" fill sizes="240px" className="object-cover" />
                </div>
                <div className="rounded-md border border-stone-300 bg-[#fff5f0] p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Gift flow</p>
                  <p className="mt-2 font-serif text-2xl font-semibold text-[#191c1d] sm:text-3xl">Pick, personalize, deliver.</p>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">Each direction leads back to the catalog and checkout details.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bb-page-pad">
          <div className="mb-3 flex items-end justify-between gap-3 sm:mb-8">
            <div className="min-w-0">
              <h2 className="font-serif text-xl font-semibold text-[#ae2f34] sm:text-4xl">Gift directions</h2>
              <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-stone-600 sm:mt-2 sm:block">
                Filter by occasion, choose a starting point, then complete products from the shop.
              </p>
            </div>
            <Link href="/checkout" className="shrink-0 text-sm font-semibold text-[#ae2f34] sm:rounded-md sm:border sm:border-[#ae2f34] sm:px-5 sm:py-2 sm:hover:bg-[#ae2f34] sm:hover:text-white">
              Checkout
            </Link>
          </div>

          <div className="bb-mobile-scroll sticky top-[var(--bb-header-offset,60px)] z-20 -mx-1 flex gap-1.5 border-y border-stone-200 bg-[#f8f9fa]/95 py-2.5 backdrop-blur sm:static sm:mx-0 sm:border-y sm:border-stone-300 sm:bg-transparent sm:py-3 sm:backdrop-blur-none">
            {occasions.map((occasion) => (
              <button
                key={occasion}
                type="button"
                onClick={() => setActiveOccasion(occasion)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:py-2 sm:text-sm ${
                  activeOccasion === occasion
                    ? 'border-[#ae2f34] bg-[#ae2f34] text-white'
                    : 'border-stone-300 bg-white text-stone-700'
                }`}
              >
                {occasion}
              </button>
            ))}
          </div>

          {/* Mobile: 2-up swipe pairs */}
          <div className="mt-4 md:hidden">
            <MobilePairCarousel label="Gift directions">
              {visibleGifts.map((gift) => (
                <article key={gift.name} className="flex h-full flex-col overflow-hidden rounded-md border border-stone-300 bg-white shadow-sm">
                  <div className="relative aspect-[4/3] bg-stone-100">
                    <Image src={gift.image} alt={gift.name} fill sizes="50vw" className="object-cover" />
                    <span className="absolute left-2 top-2 rounded bg-white/95 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#ae2f34]">
                      {gift.occasion}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-2.5">
                    <p className="text-[10px] font-bold text-[#ae2f34]">{gift.price}</p>
                    <h3 className="mt-1 font-serif text-sm font-semibold leading-snug text-stone-950">{gift.name}</h3>
                    <p className="mt-1 line-clamp-2 flex-1 text-[11px] leading-4 text-stone-600">{gift.description}</p>
                    <Link href="/shop" className="mt-2 rounded-md bg-[#ae2f34] px-2 py-2 text-center text-[11px] font-semibold text-white">
                      Choose
                    </Link>
                  </div>
                </article>
              ))}
            </MobilePairCarousel>
          </div>

          {/* Desktop gift grid */}
          <div className="mt-8 hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
            {visibleGifts.map((gift) => (
              <article key={gift.name} className="group overflow-hidden rounded-md border border-stone-300 bg-white shadow-sm transition hover:border-[#ae2f34]">
                <div className="relative aspect-[4/3] bg-stone-100">
                  <Image src={gift.image} alt={gift.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-[1.04]" />
                  <span className="absolute left-4 top-4 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#ae2f34]">
                    {gift.occasion}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-serif text-3xl font-semibold text-stone-950">{gift.name}</h3>
                    <p className="shrink-0 text-right text-sm font-semibold text-[#ae2f34]">{gift.price}</p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{gift.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {gift.includes.map((item) => (
                      <span key={item} className="rounded-md border border-[#e0bfbd] bg-[#fff5f0] px-3 py-1 text-xs font-semibold text-[#584140]">
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-7 flex items-center justify-between gap-4 border-t border-stone-200 pt-5">
                    <Link href="/shop" className="rounded-md bg-[#ae2f34] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1B1F3B]">
                      Choose
                    </Link>
                    <Link href="/subscriptions" className="text-sm font-semibold text-[#ae2f34] hover:text-[#8c1520]">
                      Compare tiers
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-stone-300 bg-white">
          <div className="bb-page-pad">
            <div className="mb-4 sm:mb-8">
              <h2 className="font-serif text-xl font-semibold text-[#191c1d] sm:text-4xl">How gifting works</h2>
              <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-stone-600 sm:mt-2 sm:block">
                The page gives a direction, the shop handles the cart, and checkout collects delivery details.
              </p>
            </div>

            <MobilePairCarousel label="How gifting works">
              {storyCards.map((card, index) => (
                <article key={card.title} className="flex h-full flex-col overflow-hidden rounded-md border border-stone-300 bg-[#f8f9fa] shadow-sm">
                  <div className="relative aspect-[4/3] bg-stone-100">
                    <Image src={card.image} alt={card.title} fill sizes="50vw" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ae2f34]">Step {index + 1}</p>
                    <h3 className="mt-1.5 font-serif text-sm font-semibold leading-snug text-stone-950">{card.title}</h3>
                    <p className="mt-1 line-clamp-3 flex-1 text-[11px] leading-4 text-stone-600">{card.text}</p>
                  </div>
                </article>
              ))}
            </MobilePairCarousel>

            <div className="hidden gap-5 md:grid md:grid-cols-3">
              {storyCards.map((card, index) => (
                <article key={card.title} className="rounded-md border border-stone-300 bg-[#f8f9fa] shadow-sm">
                  <div className="relative aspect-[4/3] bg-stone-100">
                    <Image src={card.image} alt={card.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Step {index + 1}</p>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-stone-950">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{card.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bb-page-pad">
          <div className="grid overflow-hidden rounded-md border border-stone-300 bg-[#fff5f0] lg:grid-cols-[1fr_0.8fr]">
            <div className="p-4 sm:p-8 lg:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">Recipient details</p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-[#191c1d] sm:mt-4 sm:text-4xl">
                A gift is finished when delivery feels handled.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#584140] sm:mt-4">
                Checkout captures recipient name, phone, county, town, address, landmark, notes, and payment.
              </p>
              <Link href="/shop" className="mt-5 inline-flex w-full justify-center rounded-md bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] sm:mt-7 sm:w-auto">
                Start with products
              </Link>
            </div>
            <div className="relative min-h-[160px] bg-stone-100 sm:min-h-[320px]">
              <Image src="/mockups/bloombox-delivery.png" alt="BloomBox delivery handoff" fill sizes="(min-width: 1024px) 460px, 100vw" className="object-cover" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
