'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPartnerInquiry } from '@/lib/firestore';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';
import { MobilePairCarousel } from '../components/MobilePairCarousel';

const partnershipModels = [
  {
    title: 'Marketplace partners',
    text: 'List care, comfort, hygiene, wellness, stationery, floral, or gifting products that fit BloomBox packages.',
  },
  {
    title: 'Service partners',
    text: 'Support BloomBox through delivery, packaging, wellness education, counselling, events, photography, or fulfilment services.',
  },
  {
    title: 'Community campaigns',
    text: 'Sponsor period-care bundles, donations, and education moments with tracked fulfilment.',
  },
  {
    title: 'Corporate and school care',
    text: 'Build workplace, school, campus, or NGO care programs with subscriptions, sponsored bundles, and reporting.',
  },
];

const categories = [
  'Products',
  'Delivery or logistics',
  'Education or wellness',
  'Corporate care',
  'School or NGO program',
  'Sponsorship or donations',
  'Events or campaigns',
  'Other',
];

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base font-normal outline-none transition focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34] sm:rounded-md sm:text-sm';

export default function PartnerPage() {
  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [productCategory, setProductCategory] = useState(categories[0]);
  const [message, setMessage] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [activeModel, setActiveModel] = useState(partnershipModels[0].title);

  useEffect(() => {
    if (!formOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [formOpen]);

  const submitInquiry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');

    if (!businessName.trim() || !contactName.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setError('Add the business, contact, email, phone, and partnership note.');
      return;
    }

    setIsSubmitting(true);

    try {
      const inquiryId = await createPartnerInquiry({
        businessName,
        contactName,
        email,
        phone,
        productCategory,
        message,
      });
      setNotice(`Thanks. BloomBox saved your partnership request: ${inquiryId.slice(0, 8)}.`);
      setBusinessName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setProductCategory(categories[0]);
      setMessage('');
      setFormOpen(false);
    } catch (inquiryError) {
      setError(inquiryError instanceof Error ? inquiryError.message : 'Could not save this partnership request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnerForm = (
    <form onSubmit={submitInquiry} className="grid gap-3.5 sm:gap-4">
      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          Business name
          <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          Contact name
          <input value={contactName} onChange={(event) => setContactName(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          WhatsApp or phone
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700 sm:col-span-2">
          Partnership area
          <select
            value={productCategory}
            onChange={(event) => setProductCategory(event.target.value)}
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700 sm:col-span-2">
          Partnership note
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Products, services, sponsorship idea, audience, delivery capacity, or campaign goal."
          />
        </label>
      </div>

      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:rounded-md">{error}</p> : null}
      {notice ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 sm:rounded-md">{notice}</p> : null}

      <button
        disabled={isSubmitting}
        className="rounded-lg bg-[#ae2f34] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-60 sm:rounded-md sm:py-3"
      >
        {isSubmitting ? 'Sending...' : 'Send partnership request'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main className="pb-[4.25rem] lg:pb-0">
        {/* Mobile compact hero — matches landing structure */}
        <section className="bb-mobile-hero lg:hidden">
          <div className="bb-mobile-hero-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Partner with us</p>
            <h1 className="bb-mobile-h1">Build with BloomBox</h1>
            <p className="bb-mobile-lead">
              Products, delivery, schools, NGOs, corporates, and community campaigns — one intake for collaboration.
            </p>
            <div className="bb-mobile-cta-row">
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="rounded-md bg-[#ae2f34] px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Start partnership
              </button>
              <Link
                href="/shop"
                className="rounded-md border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800"
              >
                View catalog
              </Link>
            </div>
            <div className="relative mt-4 h-40 overflow-hidden rounded-md border border-stone-200 bg-stone-100">
              <Image
                src="/mockups/bloombox-open-box.png"
                alt="Open BloomBox package for partnership ideas"
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Desktop hero */}
        <section className="hidden border-b border-stone-300 bg-white lg:block">
          <div className="mx-auto grid max-w-7xl gap-8 px-8 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <Eyebrow>Partner with us</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                Build care, commerce, and community partnerships with BloomBox.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#584140]">
                BloomBox can work with businesses, sponsors, schools, NGOs, corporates, wellness educators, delivery teams, and creative partners who want to support period care and thoughtful gifting.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#partner-form" className="rounded-md bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Start partnership
                </a>
                <Link href="/shop" className="rounded-md border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  View catalog
                </Link>
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-md border border-stone-300 bg-stone-100">
              <Image
                src="/mockups/bloombox-open-box.png"
                alt="Open BloomBox package for partnership ideas"
                fill
                sizes="(min-width: 1024px) 620px, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Partnership models */}
        <section className="bb-page-pad">
          <div className="mb-3 md:hidden">
            <h2 className="font-serif text-xl font-semibold text-[#ae2f34]">How partners work with us</h2>
            <p className="mt-1 text-sm text-stone-600">Swipe pairs to explore models, then send a request.</p>
          </div>

          {/* Mobile 2-up model pages */}
          <MobilePairCarousel label="Partnership models">
            {partnershipModels.map((model, index) => {
              const isActive = activeModel === model.title;
              return (
                <button
                  key={model.title}
                  type="button"
                  onClick={() => {
                    setActiveModel(model.title);
                    setFormOpen(true);
                  }}
                  className={`bb-card-tile w-full text-left transition ${
                    isActive ? 'border-[#ae2f34] bg-[#fff5f0] ring-2 ring-[#fed4c8]' : ''
                  }`}
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ae2f34] text-[10px] font-bold text-white">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-2 font-serif text-sm font-semibold leading-snug text-[#191c1d]">{model.title}</h3>
                  <p className="mt-1.5 line-clamp-4 flex-1 text-[11px] leading-4 text-stone-600">{model.text}</p>
                  <span className="mt-2.5 flex w-full items-center justify-center rounded-md bg-[#ae2f34] py-2 text-xs font-semibold text-white">
                    Partner
                  </span>
                </button>
              );
            })}
          </MobilePairCarousel>

          {/* Desktop grid */}
          <div className="hidden gap-5 md:grid md:grid-cols-2 xl:grid-cols-4">
            {partnershipModels.map((model) => (
              <article key={model.title} className="rounded-md border border-stone-300 bg-white p-5 shadow-sm">
                <h2 className="font-serif text-3xl font-semibold text-[#ae2f34]">{model.title}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">{model.text}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Form — desktop always; mobile via sheet + optional inline section */}
        <section id="partner-form" className="scroll-mt-28 border-y border-stone-200 bg-white sm:border-stone-300">
          <div className="bb-page-pad grid gap-5 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">
                Partner intake
              </p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-[#191c1d] sm:mt-4 sm:text-4xl">
                Tell BloomBox what you want to build together.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#584140] sm:mt-4">
                The request is saved to the admin partner pipeline so the team can qualify, contact, and shape the right collaboration.
              </p>
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="mt-4 w-full rounded-md bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white lg:hidden"
              >
                Open partnership form
              </button>
              {notice ? (
                <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 lg:hidden">
                  {notice}
                </p>
              ) : null}
            </div>

            <div className="hidden rounded-md border border-stone-300 bg-[#fff5f0] p-5 shadow-sm lg:block">{partnerForm}</div>
          </div>
        </section>
      </main>

      {/* Mobile form bottom sheet */}
      {formOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40"
            aria-label="Close form"
            onClick={() => setFormOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-stone-200 bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-300" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Partner intake</p>
                <h2 className="font-serif text-xl font-semibold text-[#191c1d]">Send a request</h2>
              </div>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700"
              >
                Close
              </button>
            </div>
            {activeModel ? (
              <p className="mb-3 rounded-lg border border-[#e0bfbd] bg-[#fff5f0] px-3 py-2 text-xs text-[#584140]">
                Interest: <span className="font-semibold text-[#191c1d]">{activeModel}</span>
              </p>
            ) : null}
            {partnerForm}
          </div>
        </div>
      ) : null}

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-7xl gap-2">
          <Link
            href="/shop"
            className="flex-1 rounded-md border border-stone-300 py-2.5 text-center text-sm font-semibold text-stone-800"
          >
            Catalog
          </Link>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex-1 rounded-md bg-[#ae2f34] py-2.5 text-center text-sm font-semibold text-white"
          >
            Partner with us
          </button>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
