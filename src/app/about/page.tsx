import Image from 'next/image';
import Link from 'next/link';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';
import { MobilePairCarousel } from '../components/MobilePairCarousel';

const workflow = [
  ['Choose', 'Pick products, a gift direction, or a care tier.'],
  ['Personalize', 'Add flowers, treats, notes, and recipient details where needed.'],
  ['Checkout', 'Confirm location, delivery notes, and the preferred payment option.'],
  ['Track', 'Follow the order from payment to preparation, dispatch, and delivery.'],
];

const storyMoments = [
  {
    title: 'The first lesson',
    text: "Delilah's nanny did not only show her how to use a pad. She stayed close, explained gently, and made the moment feel safe.",
  },
  {
    title: 'The ritual',
    text: 'Cake, yogurt, and chocolate turned a confusing day into a memory of being welcomed into womanhood with love.',
  },
  {
    title: 'The question',
    text: 'What if every woman and girl could receive that same level of practical help, tenderness, and celebration?',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main>
        {/* Mobile compact hero */}
        <section className="bb-mobile-hero lg:hidden">
          <div className="bb-mobile-hero-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">About BloomBox</p>
            <h1 className="bb-mobile-h1">More than period care.</h1>
            <p className="bb-mobile-lead">
              Born from a first-period memory of gentleness — now care packages, gifts, and delivery that feel human.
            </p>
            <div className="bb-mobile-cta-row">
              <Link href="/shop" className="rounded-md bg-[#ae2f34] px-3 py-2.5 text-center text-sm font-semibold text-white">
                Shop
              </Link>
              <Link href="/gifting" className="rounded-md border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800">
                Gift
              </Link>
            </div>
            <div className="relative mt-4 h-40 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
              <Image src="/mockups/bloombox-open-box.png" alt="Open BloomBox" fill sizes="100vw" priority className="object-cover" />
            </div>
          </div>
        </section>

        {/* Desktop hero */}
        <section className="hidden border-b border-stone-300 bg-white lg:block">
          <div className="mx-auto grid max-w-7xl gap-8 px-8 py-20 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
            <div>
              <Eyebrow>About BloomBox</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                More than period care. A softer way to be looked after.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#584140]">
                BloomBox was born from a first-period memory filled with gentleness, food, reassurance, and love. Today it carries that same feeling into period essentials, comfort products, flowers, gifts, and delivery.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="rounded-md bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Shop care items
                </Link>
                <Link href="/gifting" className="rounded-md border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  Send a gift
                </Link>
              </div>
            </div>

            <div className="bb-hero-collage">
              <div className="relative overflow-hidden rounded-md border border-stone-300 bg-stone-100">
                <Image src="/mockups/bloombox-open-box.png" alt="Open BloomBox care package" fill sizes="(min-width: 1024px) 560px, 100vw" priority className="object-cover" />
              </div>
              <div className="grid gap-3 sm:gap-4">
                <div className="relative overflow-hidden rounded-md border border-stone-300 bg-stone-100">
                  <Image src="/products/waterbottles.jpg" alt="Comfort item for BloomBox" fill sizes="240px" className="object-cover" />
                </div>
                <div className="rounded-md border border-stone-300 bg-[#fff5f0] p-4 sm:p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">The belief</p>
                  <p className="mt-2 font-serif text-2xl font-semibold text-[#191c1d] sm:text-3xl">
                    Every woman deserves to feel celebrated, not just comfortable.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">The point is not decoration. The point is care that arrives with thought.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bb-page-pad">
          <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-10">
            <div>
              <Eyebrow>Why it exists</Eyebrow>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-[#ae2f34] sm:mt-4 sm:text-4xl">
                Because periods should never begin with shame.
              </h2>
            </div>
            <div className="grid gap-4 text-sm leading-7 text-[#584140] sm:gap-5 sm:text-base sm:leading-8">
              <p>
                BloomBox exists because practical care and emotional care belong together. A pad solves one need. A warm bottle, a note, a treat, flowers, clear information, and a safe delivery experience solve something deeper: the feeling of being seen.
              </p>
              <p className="hidden sm:block">
                The app brings that idea into a working online parcel delivery system. You can browse essentials, build a box, add recipient details, confirm location, choose a payment option, place an order, and track delivery from one calm space.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-300 bg-white">
          <div className="bb-page-pad grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch lg:gap-8">
            <div className="flex min-h-[220px] items-center justify-center rounded-md border border-stone-300 bg-[#ae2f34] p-4 sm:min-h-[340px] sm:p-6 lg:min-h-[380px]">
              <div className="w-full max-w-[280px] rounded-md border border-stone-300 bg-white p-3">
                <Image
                  src="/about/delilah-founder.png"
                  alt="Delilah Johnson, BloomBox founder"
                  width={253}
                  height={253}
                  unoptimized
                  className="mx-auto h-40 w-40 object-cover sm:h-56 sm:w-56"
                />
                <div className="border-x border-b border-stone-300 bg-white px-4 py-3">
                  <p className="font-serif text-lg font-semibold text-[#191c1d] sm:text-xl">Delilah Johnson</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Founder of BloomBox</p>
                </div>
              </div>
            </div>
            <div className="rounded-md border border-stone-300 bg-[#fff5f0] p-4 sm:p-7 lg:p-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">Our beginning</p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-[#191c1d] sm:mt-4 sm:text-4xl">A story of love and legacy.</h2>
              <p className="mt-3 border-l-4 border-[#ae2f34] bg-white px-3 py-3 font-serif text-base leading-7 text-[#191c1d] sm:mt-5 sm:px-5 sm:py-4 sm:text-2xl sm:leading-9">
                Every woman deserves to feel celebrated, not just comfortable, during her menstrual journey.
              </p>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-[#584140] sm:mt-5 sm:gap-4 sm:leading-7">
                <p>
                  BloomBox was born from Delilah Johnson&apos;s childhood memory of her first period. While her mother worked tirelessly to provide for the family, her nanny became the nurturing presence who helped turn an overwhelming moment into a beautiful celebration.
                </p>
                <p className="hidden sm:block">
                  She did not simply explain period care and move on. She created a ritual with cake, yogurt, and chocolate. In that moment, Delilah did not feel embarrassed or hidden away. She felt welcomed into womanhood with open arms and a full heart.
                </p>
                <p className="hidden sm:block">
                  That memory became the heart of BloomBox: useful care products wrapped in warmth, dignity, culture, and the quiet message that someone thought about you.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bb-page-pad">
          <div className="mb-4 sm:mb-8">
            <Eyebrow>The turning point</Eyebrow>
            <h2 className="mt-3 max-w-3xl font-serif text-xl font-semibold text-[#191c1d] sm:mt-4 sm:text-4xl">
              From one remembered moment to care for many.
            </h2>
          </div>

          <MobilePairCarousel label="Story moments">
            {storyMoments.map((moment, index) => (
              <article key={moment.title} className="bb-card-tile shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#ae2f34] text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-3 font-serif text-sm font-semibold leading-snug text-[#191c1d] sm:text-2xl">{moment.title}</h3>
                <p className="mt-2 line-clamp-4 flex-1 text-[11px] leading-4 text-stone-600 sm:text-sm sm:leading-6">{moment.text}</p>
              </article>
            ))}
          </MobilePairCarousel>

          <div className="hidden gap-5 md:grid md:grid-cols-3">
            {storyMoments.map((moment, index) => (
              <article key={moment.title} className="rounded-md border border-stone-300 bg-white p-6 shadow-sm">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ae2f34] text-sm font-semibold text-white">{index + 1}</span>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-[#191c1d]">{moment.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{moment.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bb-page-pad">
          <div className="rounded-md border border-stone-300 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <Eyebrow>How it works</Eyebrow>
            <div className="mt-3 flex flex-col justify-between gap-2 sm:mt-4 sm:gap-4 md:flex-row md:items-end">
              <h2 className="max-w-2xl font-serif text-xl font-semibold text-[#191c1d] sm:text-4xl">From need to delivery.</h2>
              <p className="hidden max-w-sm text-sm leading-6 text-stone-600 sm:block">
                Four clear steps, from choosing care items to tracking the parcel.
              </p>
            </div>

            <div className="mt-4 md:mt-8">
              <MobilePairCarousel label="How BloomBox works">
                {workflow.map(([title, text], index) => (
                  <article key={title} className="bb-card-tile bg-[#f8f9fa]">
                    <span className="inline-flex w-fit rounded-md bg-[#ae2f34] px-2 py-1 text-[10px] font-semibold text-white">
                      0{index + 1}
                    </span>
                    <h3 className="mt-3 font-serif text-sm font-semibold text-stone-950">{title}</h3>
                    <p className="mt-1.5 line-clamp-4 flex-1 text-[11px] leading-4 text-stone-600">{text}</p>
                  </article>
                ))}
              </MobilePairCarousel>

              <div className="hidden gap-4 md:grid md:grid-cols-4">
                {workflow.map(([title, text], index) => (
                  <article key={title} className="rounded-md border border-stone-200 bg-[#f8f9fa] p-5">
                    <span className="inline-flex rounded-md bg-[#ae2f34] px-3 py-1 text-xs font-semibold text-white">0{index + 1}</span>
                    <h3 className="mt-5 font-serif text-2xl font-semibold text-stone-950">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bb-page-pad">
          <div className="grid overflow-hidden rounded-md border border-stone-300 bg-white lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[180px] bg-stone-100 sm:min-h-[340px]">
              <Image src="/mockups/bloombox-gift-flowers.png" alt="BloomBox flowers and gift" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
            </div>
            <div className="p-4 sm:p-8 lg:p-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">The direction</p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-[#191c1d] sm:mt-4 sm:text-4xl">A softer way to handle necessary things.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:mt-4">
                Stronger product data, better delivery tracking, cleaner checkout, and care that feels human from the first page.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:flex sm:flex-row sm:gap-3">
                <Link href="/shop" className="rounded-md bg-[#ae2f34] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#8c1520]">
                  Explore shop
                </Link>
                <Link href="/faqs" className="rounded-md border border-[#ae2f34] px-4 py-2.5 text-center text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0]">
                  Read FAQs
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
