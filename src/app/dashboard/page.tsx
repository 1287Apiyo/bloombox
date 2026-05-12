'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SiteFooter, SiteHeader } from '../components/BrandShell';

const mockupImages = {
  delivery: '/mockups/bloombox-delivery.png',
  openBox: '/mockups/bloombox-open-box.png',
  giftFlowers: '/mockups/bloombox-gift-flowers.png',
};

const collections = [
  {
    title: 'Seasonal Blooms',
    text: 'Freshly styled care packages with flowers, cards, and warm extras for thoughtful gifting.',
    action: 'Explore now',
    href: '/gifting',
    image: mockupImages.giftFlowers,
    panel: 'bg-[#ae2f34] text-white',
  },
  {
    title: 'Monthly Care',
    text: 'A recurring edit of period-care essentials and comfort rituals.',
    action: 'Subscribe',
    href: '/subscriptions',
    image: mockupImages.openBox,
    panel: 'bg-[#76574e] text-white',
  },
  {
    title: 'Thoughtful Gifting',
    text: 'Wrapped boxes, flowers, and handwritten notes for someone you love.',
    action: 'Shop gifts',
    href: '/gifting',
    image: mockupImages.delivery,
    panel: 'bg-[#191c1d] text-white',
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
    title: 'Gifting redefined',
    text: 'I sent a package for a birthday, and the presentation felt beautiful before it was even opened.',
    name: 'Amanda L.',
  },
  {
    title: 'Beyond flowers',
    text: 'It feels useful and emotional at the same time. That combination is what makes BloomBox different.',
    name: 'Rebecca M.',
  },
];

const packages = [
  {
    title: 'Essentials Box',
    price: 'From KSh 850',
    text: 'Pads or cups, wipes, tissues, and a discreet carry bag for monthly care.',
    image: mockupImages.openBox,
    href: '/shop',
    includes: ['Cycle care', 'Hygiene', 'Carry bag'],
  },
  {
    title: 'Comfort Box',
    price: 'From KSh 1,500',
    text: 'Heat therapy, self-care extras, and calming comfort items for home care.',
    image: mockupImages.giftFlowers,
    href: '/shop',
    includes: ['Heat therapy', 'Self-care', 'Candle'],
  },
  {
    title: 'Gift Bloom Box',
    price: 'From KSh 2,500',
    text: 'Flowers, a card, and selected comfort items packed for gifting.',
    image: mockupImages.delivery,
    href: '/gifting',
    includes: ['Flowers', 'Greeting card', 'Gift wrap'],
  },
];

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

function CollectionCard({ collection, large = false }: { collection: (typeof collections)[number]; large?: boolean }) {
  return (
    <Link
      href={collection.href}
      className={`group relative block overflow-hidden border border-[#e0bfbd] bg-white ${large ? 'min-h-[340px] sm:min-h-[420px] md:col-span-8 lg:min-h-[500px]' : 'min-h-[320px] md:col-span-4 lg:min-h-[360px]'}`}
    >
      <Image
        src={collection.image}
        alt={collection.title}
        fill
        sizes={large ? '(min-width: 768px) 760px, 100vw' : '(min-width: 768px) 420px, 100vw'}
        className="object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className={`absolute inset-x-0 bottom-0 ${collection.panel} p-6 md:p-8`}>
        <h3 className="font-serif text-3xl font-semibold">{collection.title}</h3>
        <p className="mt-2 max-w-lg text-sm leading-6 opacity-90">{collection.text}</p>
        <span className="mt-5 inline-flex bg-white px-5 py-2 text-sm font-semibold text-[#ae2f34]">
          {collection.action}
        </span>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d]">
      <SiteHeader />

      <main>
        <section className="relative flex min-h-[calc(100svh-116px)] items-center overflow-hidden bg-[#14090c] sm:min-h-[680px] lg:min-h-[760px]">
          <Image
            src={mockupImages.giftFlowers}
            alt="BloomBox floral gift box"
            fill
            sizes="100vw"
            priority
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-[#14090c]/78" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[#14090c]" />

          <div className="relative z-10 mx-auto flex w-full max-w-7xl justify-center px-4 py-14 text-center sm:px-6 sm:py-20 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <p className="mx-auto mb-5 w-fit border border-white/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fed4c8]">
                BloomBox care delivery
              </p>
              <h1 className="font-serif text-6xl font-bold leading-[0.95] tracking-tight text-white sm:text-7xl">
                Care packages for the moments women remember.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[#fff5f0]">
                Period essentials, flowers, comfort rituals, and thoughtful gifts packed into one calm delivery experience.
              </p>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[#fed4c8]">
                Build a box for yourself, send one to someone you love, or choose a monthly tier before the basics become urgent.
              </p>
              <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link href="/shop" className="bg-[#ae2f34] px-7 py-3 text-center text-base font-semibold text-white transition hover:bg-[#8c1520] sm:px-10 sm:py-4">
                  Shop collections
                </Link>
                <Link href="/gifting" className="border border-[#fed4c8] bg-transparent px-7 py-3 text-center text-base font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c] sm:px-10 sm:py-4">
                  Send a gift
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-serif text-4xl font-semibold text-[#ae2f34]">Curated collections</h2>
              <p className="mt-2 text-base leading-7 text-[#584140]">Find the perfect expression of your sentiment.</p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#ae2f34]">
              View all categories
              <ArrowIcon />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            <CollectionCard collection={collections[0]} large />
            <CollectionCard collection={collections[1]} />
            <CollectionCard collection={collections[2]} />

            <div className="bg-[#fed4c8] p-6 sm:p-8 md:col-span-8 md:min-h-[360px] md:p-12">
              <div className="max-w-xl">
                <h3 className="font-serif text-4xl font-semibold italic text-[#76574e]">
                  &quot;Every flower is a small memory in motion.&quot;
                </h3>
                <p className="mt-5 text-base leading-7 text-[#795950]">
                  Join the BloomBox community and receive updates on care boxes, gift edits, and new delivery drops.
                </p>
                <form className="mt-7 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => event.preventDefault()}>
                  <input
                    className="min-w-0 flex-1 border border-white bg-white px-6 py-3 text-sm outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-[#fed4c8]"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <button className="bg-[#ae2f34] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                    Join us
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-serif text-4xl font-semibold text-[#ae2f34]">BloomBox packages</h2>
              <p className="mt-2 max-w-2xl text-base leading-7 text-[#584140]">
                Clear package options for shopping, comfort, and gifting. Each one can lead into the shop or gift flow.
              </p>
            </div>
            <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-[#ae2f34]">
              Build your own
              <ArrowIcon />
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {packages.map((item) => (
              <article key={item.title} className="border border-[#e0bfbd] bg-white">
                <div className="relative aspect-[4/3] overflow-hidden border-b border-[#e0bfbd] bg-[#edeeef]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">{item.price}</p>
                  <h3 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">{item.text}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.includes.map((include) => (
                      <span key={include} className="border border-[#e0bfbd] bg-[#f8f9fa] px-3 py-1 text-xs font-semibold text-[#584140]">
                        {include}
                      </span>
                    ))}
                  </div>
                  <Link href={item.href} className="mt-6 inline-flex w-full items-center justify-between bg-[#ae2f34] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                    View package
                    <ArrowIcon />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#edeeef] py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="font-serif text-4xl font-semibold text-[#ae2f34]">The BloomBox promise</h2>
              <p className="mt-4 text-base leading-7 text-[#584140]">
                We believe care packages are more than products. They are a medium for connection, relief, and ritual.
              </p>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {promises.map((promise) => (
                <div key={promise.title} className="flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center bg-white text-[#ae2f34]">
                    <PromiseIcon type={promise.icon} />
                  </div>
                  <h3 className="font-serif text-2xl font-semibold">{promise.title}</h3>
                  <p className="mt-3 text-base leading-7 text-[#584140]">{promise.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            <div className="relative">
              <div className="aspect-square overflow-hidden border border-[#e0bfbd] bg-[#edeeef]">
                <Image
                  src={mockupImages.delivery}
                  alt="BloomBox handoff"
                  width={900}
                  height={900}
                  className="h-full w-full object-cover"
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
            </div>

            <div className="lg:pl-10">
              <h2 className="font-serif text-4xl font-semibold italic text-[#ae2f34]">Voices of the BloomBox family</h2>
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
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />

      <Link href="/shop" className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center bg-[#ae2f34] text-white md:bottom-10" aria-label="Quick help">
        <ChatIcon />
      </Link>
    </div>
  );
}
