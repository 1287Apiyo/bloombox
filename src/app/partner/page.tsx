'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPartnerInquiry } from '@/lib/firestore';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

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

const categories = ['Products', 'Delivery or logistics', 'Education or wellness', 'Corporate care', 'School or NGO program', 'Sponsorship or donations', 'Events or campaigns', 'Other'];

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
    } catch (inquiryError) {
      setError(inquiryError instanceof Error ? inquiryError.message : 'Could not save this partnership request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main>
        <section className="border-b border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:py-20">
            <div>
              <Eyebrow>Partner with us</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                Build care, commerce, and community partnerships with BloomBox.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#584140]">
                BloomBox can work with businesses, sponsors, schools, NGOs, corporates, wellness educators, delivery teams, and creative partners who want to support period care and thoughtful gifting.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#partner-form" className="bg-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Start partnership
                </a>
                <Link href="/shop" className="border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  View catalog
                </Link>
              </div>
            </div>

            <div className="relative min-h-[220px] overflow-hidden border border-stone-300 bg-stone-100 sm:min-h-[320px] lg:min-h-[430px]">
              <Image src="/mockups/bloombox-open-box.png" alt="Open BloomBox package for partnership ideas" fill sizes="(min-width: 1024px) 620px, 100vw" priority className="object-cover" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {partnershipModels.map((model) => (
              <article key={model.title} className="border border-stone-300 bg-white p-5">
                <h2 className="font-serif text-3xl font-semibold text-[#ae2f34]">{model.title}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">{model.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="partner-form" className="border-y border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Partner intake</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold text-[#191c1d]">Tell BloomBox what you want to build together.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#584140]">
                The request is saved to the admin partner pipeline so the BloomBox team can qualify, contact, and shape the right collaboration.
              </p>
            </div>

            <form onSubmit={submitInquiry} className="border border-stone-300 bg-[#fff5f0] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Business name
                  <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#ae2f34]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Contact name
                  <input value={contactName} onChange={(event) => setContactName(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#ae2f34]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Email
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#ae2f34]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  WhatsApp or phone
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#ae2f34]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700 sm:col-span-2">
                  Partnership area
                  <select value={productCategory} onChange={(event) => setProductCategory(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#ae2f34]">
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700 sm:col-span-2">
                  Partnership note
                  <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={5} className="resize-none border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#ae2f34]" placeholder="Tell us about your products, services, sponsorship idea, audience, delivery capacity, or campaign goal." />
                </label>
              </div>

              {error ? <p className="mt-4 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
              {notice ? <p className="mt-4 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p> : null}

              <button disabled={isSubmitting} className="mt-5 bg-[#ae2f34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-60">
                {isSubmitting ? 'Sending...' : 'Send partnership request'}
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
