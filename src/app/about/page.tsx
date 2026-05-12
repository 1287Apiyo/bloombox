import Image from 'next/image';
import Link from 'next/link';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const careStandards = [
  {
    title: 'Celebrate',
    text: 'Dignity and joy, never shame.',
  },
  {
    title: 'Care',
    text: 'Useful products with thoughtful extras.',
  },
  {
    title: 'Culture',
    text: 'Womanhood welcomed with warmth.',
  },
  {
    title: 'Sustain',
    text: 'Reusable options and recyclable packaging.',
  },
];

const workflow = [
  ['Choose', 'Pick products, a gift direction, or a care tier.'],
  ['Personalize', 'Add flowers, treats, notes, and recipient details where needed.'],
  ['Checkout', 'Confirm location, delivery notes, and the preferred payment option.'],
  ['Track', 'Follow the order from payment to preparation, dispatch, and delivery.'],
];

const impactNotes = [
  {
    stat: '1',
    label: 'Origin',
    text: 'A first-period memory of care.',
  },
  {
    stat: '6',
    label: 'Tiers',
    text: 'Monthly, gifts, donations, custom.',
  },
  {
    stat: '10',
    label: 'Categories',
    text: 'Period care, comfort, flowers, gifts.',
  },
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
        <section className="border-b border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end lg:py-20">
            <div>
              <Eyebrow>About BloomBox</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                More than period care. A softer way to be looked after.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#584140]">
                BloomBox was born from a first-period memory filled with gentleness, food, reassurance, and love. Today it carries that same feeling into period essentials, comfort products, flowers, gifts, and delivery.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Shop care items
                </Link>
                <Link href="/gifting" className="border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  Send a gift
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-[1.05fr_0.75fr] gap-4">
              <div className="relative min-h-[440px] overflow-hidden border border-stone-300 bg-stone-100">
                <Image src="/mockups/bloombox-open-box.png" alt="Open BloomBox care package" fill sizes="(min-width: 1024px) 560px, 100vw" priority className="object-cover" />
              </div>
              <div className="grid gap-4">
                <div className="relative min-h-[210px] overflow-hidden border border-stone-300 bg-stone-100">
                  <Image src="/products/waterbottles.jpg" alt="Comfort item for BloomBox" fill sizes="240px" className="object-cover" />
                </div>
                <div className="border border-stone-300 bg-[#fff5f0] p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">The belief</p>
                  <p className="mt-2 font-serif text-3xl font-semibold text-[#191c1d]">
                    Every woman deserves to feel celebrated, not just comfortable.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">The point is not decoration. The point is care that arrives with thought.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <Eyebrow>Why it exists</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl font-semibold text-[#ae2f34]">Because periods should never begin with shame.</h2>
            </div>
            <div className="grid gap-5 text-base leading-8 text-[#584140]">
              <p>
                BloomBox exists because practical care and emotional care belong together. A pad solves one need. A warm bottle, a note, a treat, flowers, clear information, and a safe delivery experience solve something deeper: the feeling of being seen.
              </p>
              <p>
                The app brings that idea into a working online parcel delivery system. You can browse essentials, build a box, add recipient details, confirm location, choose a payment option, place an order, and track delivery from one calm space.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
            <div className="flex min-h-[380px] items-center justify-center border border-stone-300 bg-[#ae2f34] p-6">
              <div className="border border-stone-300 bg-white p-3">
                <Image
                  src="/about/delilah-founder.png"
                  alt="Delilah Johnson, BloomBox founder"
                  width={253}
                  height={253}
                  unoptimized
                  className="h-52 w-52 object-cover sm:h-56 sm:w-56"
                />
                <div className="border-x border-b border-stone-300 bg-white px-4 py-3">
                  <p className="font-serif text-xl font-semibold text-[#191c1d]">Delilah Johnson</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Founder of BloomBox</p>
                </div>
              </div>
            </div>
            <div className="border border-stone-300 bg-[#fff5f0] p-7 lg:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Our beginning</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold text-[#191c1d]">A story of love and legacy.</h2>
              <p className="mt-5 border-l-4 border-[#ae2f34] bg-white px-5 py-4 font-serif text-2xl leading-9 text-[#191c1d]">
                Every woman deserves to feel celebrated, not just comfortable, during her menstrual journey.
              </p>
              <div className="mt-5 grid gap-4 text-sm leading-7 text-[#584140]">
                <p>
                  BloomBox was born from Delilah Johnson&apos;s childhood memory of her first period. While her mother worked tirelessly to provide for the family, her nanny became the nurturing presence who helped turn an overwhelming moment into a beautiful celebration.
                </p>
                <p>
                  She did not simply explain period care and move on. She created a ritual with cake, yogurt, and chocolate. In that moment, Delilah did not feel embarrassed or hidden away. She felt welcomed into womanhood with open arms and a full heart.
                </p>
                <p>
                  That memory became the heart of BloomBox: useful care products wrapped in warmth, dignity, culture, and the quiet message that someone thought about you.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-8">
            <Eyebrow>The turning point</Eyebrow>
            <h2 className="mt-4 max-w-3xl font-serif text-4xl font-semibold text-[#191c1d]">From one remembered moment to a care system for many women.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {storyMoments.map((moment, index) => (
              <article key={moment.title} className="border border-stone-300 bg-white p-6">
                <span className="flex h-9 w-9 items-center justify-center bg-[#ae2f34] text-sm font-semibold text-white">{index + 1}</span>
                <h3 className="mt-5 font-serif text-2xl font-semibold text-[#191c1d]">{moment.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{moment.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-stone-300 bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-[#191c1d]">The BloomBox standard</h2>
                <p className="mt-1 text-sm leading-6 text-stone-600">Useful, warm, clear.</p>
              </div>
              <Link href="/subscriptions" className="w-fit border border-[#ae2f34] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#ae2f34] hover:bg-[#fff5f0]">
                View tiers
              </Link>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {careStandards.map((standard, index) => (
                <article key={standard.title} className="border border-stone-300 bg-[#f8f9fa] p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">0{index + 1}</p>
                  <h3 className="mt-2 font-serif text-xl font-semibold text-[#191c1d]">{standard.title}</h3>
                  <p className="mt-2 text-sm leading-5 text-stone-600">{standard.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="border border-stone-300 bg-white p-6 lg:p-8">
            <Eyebrow>How it works</Eyebrow>
            <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h2 className="max-w-2xl font-serif text-4xl font-semibold text-[#191c1d]">A simple path from need to delivery.</h2>
              <p className="max-w-sm text-sm leading-6 text-stone-600">
                Four clear steps, from choosing care items to tracking the parcel.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {workflow.map(([title, text], index) => (
                <article key={title} className="border border-stone-200 bg-[#f8f9fa] p-5">
                  <span className="inline-flex bg-[#ae2f34] px-3 py-1 text-xs font-semibold text-white">0{index + 1}</span>
                  <h3 className="mt-5 font-serif text-2xl font-semibold text-stone-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-stone-300 bg-[#fff5f0]">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
            <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <h2 className="font-serif text-3xl font-semibold text-[#191c1d]">Already built in</h2>
                <p className="mt-1 text-sm leading-6 text-[#584140]">A working care-commerce flow.</p>
              </div>
              <Link href="/shop" className="w-fit border border-[#ae2f34] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#ae2f34] hover:bg-white">
                Browse shop
              </Link>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {impactNotes.map((note) => (
                <article key={note.label} className="grid grid-cols-[64px_1fr] gap-4 border border-[#e0bfbd] bg-white p-4">
                  <p className="font-serif text-4xl font-semibold leading-none text-[#ae2f34]">{note.stat}</p>
                  <div>
                    <h3 className="text-base font-semibold text-stone-950">{note.label}</h3>
                    <p className="mt-1 text-sm leading-5 text-stone-600">{note.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="grid overflow-hidden border border-stone-300 bg-white lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[340px] bg-stone-100">
              <Image src="/mockups/bloombox-gift-flowers.png" alt="BloomBox flowers and gift" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover" />
            </div>
            <div className="p-8 lg:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">The direction</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold text-[#191c1d]">A softer way to handle necessary things.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-600">
                The future of BloomBox is simple: stronger product data, better delivery tracking, cleaner checkout, and a care experience that feels human from the first page.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="bg-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#8c1520]">
                  Explore shop
                </Link>
                <Link href="/faqs" className="border border-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0]">
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
