'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createSalesLead, subscribeToNewsletter } from '@/lib/firestore';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const donationOptions = [
  {
    title: 'One Care Bundle',
    amount: 'KSh 500',
    detail: 'Sponsor period essentials and a small comfort item for one recipient.',
  },
  {
    title: 'School Support Pack',
    amount: 'KSh 2,500',
    detail: 'Help BloomBox prepare a small batch of care bundles for school or community delivery.',
  },
  {
    title: 'Monthly Sponsor',
    amount: 'KSh 5,000+',
    detail: 'Support a recurring donation pool for girls and women who need care packages.',
  },
];

const donationTypes = ['One care bundle', 'School or NGO bundle', 'Monthly sponsor', 'Corporate donation', 'Custom donation'];

const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-3 text-base font-normal outline-none transition focus:border-[#006a65] focus:ring-1 focus:ring-[#006a65] sm:rounded-md sm:text-sm';

export default function DonatePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [donationType, setDonationType] = useState(donationTypes[0]);
  const [amount, setAmount] = useState('KSh 500');
  const [mchangaReference, setMchangaReference] = useState('');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPath, setSelectedPath] = useState(donationOptions[0].title);

  const selectPath = (option: (typeof donationOptions)[number]) => {
    setSelectedPath(option.title);
    setDonationType(option.title);
    setAmount(option.amount);
    setNotice('');
    setError('');
    document.getElementById('donate-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submitDonation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !amount.trim()) {
      setError('Add your name, email, phone, and donation amount.');
      return;
    }

    setIsSubmitting(true);

    try {
      const leadId = await createSalesLead({
        name,
        email,
        phone,
        interest: `Donation - ${donationType}`,
        budget: amount,
        source: 'donate-page',
        notes: [
          mchangaReference ? `M-Changa reference: ${mchangaReference}` : '',
          notes ? `Note: ${notes}` : '',
        ]
          .filter(Boolean)
          .join('\n'),
      });
      await subscribeToNewsletter(email, 'donate-page');
      setNotice(`Thank you. BloomBox saved your donation pledge: ${leadId.slice(0, 8)}.`);
      setName('');
      setEmail('');
      setPhone('');
      setDonationType(donationTypes[0]);
      setAmount('KSh 500');
      setMchangaReference('');
      setNotes('');
      setSelectedPath(donationOptions[0].title);
    } catch (donationError) {
      setError(donationError instanceof Error ? donationError.message : 'Could not save this donation pledge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const donationForm = (
    <form onSubmit={submitDonation} className="grid gap-3.5 sm:gap-4">
      <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          Donor name
          <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          Email
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          WhatsApp or phone
          <input value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          Amount
          <input value={amount} onChange={(event) => setAmount(event.target.value)} className={inputClass} />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700 sm:col-span-2">
          Donation type
          <select value={donationType} onChange={(event) => setDonationType(event.target.value)} className={inputClass}>
            {donationTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700 sm:col-span-2">
          M-Changa reference
          <input
            value={mchangaReference}
            onChange={(event) => setMchangaReference(event.target.value)}
            className={inputClass}
            placeholder="Optional reference after payment"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700 sm:col-span-2">
          Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
            placeholder="School, NGO, preferred campaign, or reporting needs."
          />
        </label>
      </div>

      {error ? <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 sm:rounded-md">{error}</p> : null}
      {notice ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 sm:rounded-md">{notice}</p> : null}

      <button
        disabled={isSubmitting}
        className="rounded-lg bg-[#006a65] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#004b48] disabled:opacity-60 sm:rounded-md sm:py-3"
      >
        {isSubmitting ? 'Saving...' : 'Save donation pledge'}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main className="pb-24 lg:pb-0">
        {/* Mobile compact hero */}
        <section className="border-b border-stone-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#006a65]">Donate</p>
            <h1 className="mt-1.5 font-serif text-2xl font-semibold leading-tight text-[#191c1d]">
              Sponsor period care
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#584140]">
              Fund care bundles for girls, schools, NGOs, and community partners. Add an M-Changa reference if you already paid.
            </p>
            <div className="mt-3.5 grid grid-cols-2 gap-2">
              <a href="#donation-paths" className="rounded-lg bg-[#006a65] px-3 py-2.5 text-center text-sm font-semibold text-white">
                Choose path
              </a>
              <a href="#donate-form" className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800">
                Record pledge
              </a>
            </div>
            <div className="relative mt-4 h-36 overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
              <Image
                src="/mockups/bloombox-gift-flowers.png"
                alt="BloomBox donation care bundle"
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
              <Eyebrow>Donate</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                Sponsor period care for someone who needs it.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#584140]">
                Donations help BloomBox prepare care bundles for girls, schools, NGOs, and community partners. Add your M-Changa reference if you have already paid.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#donate-form" className="rounded-md bg-[#006a65] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#004b48]">
                  Record donation
                </a>
                <Link href="/subscriptions" className="rounded-md border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  View subscriptions
                </Link>
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-hidden rounded-md border border-stone-300 bg-stone-100">
              <Image
                src="/mockups/bloombox-gift-flowers.png"
                alt="BloomBox donation care bundle"
                fill
                sizes="(min-width: 1024px) 620px, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Donation paths */}
        <section id="donation-paths" className="mx-auto max-w-7xl scroll-mt-28 px-3 py-5 sm:px-8 sm:py-12">
          <div className="mb-3 px-1 sm:mb-8">
            <h2 className="font-serif text-xl font-semibold text-[#006a65] sm:text-4xl sm:text-[#ae2f34]">Donation paths</h2>
            <p className="mt-1 hidden max-w-2xl text-sm leading-6 text-stone-600 sm:mt-2 sm:block">
              Choose a starting point, then BloomBox can reconcile your pledge, M-Changa reference, and delivery plan.
            </p>
          </div>

          {/* Mobile horizontal rail */}
          <div className="bb-mobile-scroll -mx-3 flex snap-x snap-mandatory gap-3 px-3 pb-1 md:hidden">
            {donationOptions.map((option) => {
              const isSelected = selectedPath === option.title;
              return (
                <button
                  key={option.title}
                  type="button"
                  onClick={() => selectPath(option)}
                  className={`w-[78vw] max-w-[300px] shrink-0 snap-start rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-[#006a65] bg-[#e7fbf8] ring-2 ring-[#b5d4d2]'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#006a65]">{option.amount}</p>
                  <h3 className="mt-2 font-serif text-xl font-semibold leading-snug text-[#191c1d]">{option.title}</h3>
                  <p className="mt-2 line-clamp-3 text-xs leading-5 text-stone-600">{option.detail}</p>
                  <span
                    className={`mt-3.5 flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-semibold ${
                      isSelected ? 'bg-[#006a65] text-white' : 'bg-[#e7fbf8] text-[#00504c]'
                    }`}
                  >
                    {isSelected ? 'Selected · fill form' : 'Select this path'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop grid */}
          <div className="hidden gap-5 md:grid md:grid-cols-3">
            {donationOptions.map((option) => {
              const isSelected = selectedPath === option.title;
              return (
                <button
                  key={option.title}
                  type="button"
                  onClick={() => selectPath(option)}
                  className={`rounded-md border p-5 text-left shadow-sm transition ${
                    isSelected
                      ? 'border-[#006a65] bg-[#e7fbf8]'
                      : 'border-stone-300 bg-white hover:border-[#006a65] hover:bg-[#e7fbf8]'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006a65]">{option.amount}</p>
                  <h3 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">{option.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-stone-600">{option.detail}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Form */}
        <section id="donate-form" className="scroll-mt-28 border-y border-stone-200 bg-white sm:border-stone-300">
          <div className="mx-auto grid max-w-7xl gap-5 px-3 py-6 sm:gap-8 sm:px-8 sm:py-14 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#006a65] sm:text-xs sm:tracking-[0.16em]">
                Donation pledge
              </p>
              <h2 className="mt-2 font-serif text-xl font-semibold text-[#191c1d] sm:mt-4 sm:text-4xl">
                Help BloomBox match funds to care bundles.
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#584140] sm:mt-4">
                This form saves your donation details so the team can confirm the reference, recipient program, and delivery reporting.
              </p>
              <div className="mt-4 hidden rounded-md border border-[#e0bfbd] bg-[#fff5f0] p-4 sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#006a65]">Selected path</p>
                <p className="mt-1 font-semibold text-[#191c1d]">{selectedPath}</p>
                <p className="mt-0.5 text-sm text-stone-600">{amount}</p>
              </div>
            </div>

            <div className="rounded-xl border border-stone-300 bg-[#fff5f0] p-4 shadow-sm sm:rounded-md sm:p-5">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#006a65] sm:hidden">
                Your details · {amount}
              </p>
              {donationForm}
            </div>
          </div>
        </section>
      </main>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-stone-500">{selectedPath}</p>
            <p className="truncate text-sm font-bold text-[#191c1d]">{amount}</p>
          </div>
          <a href="#donate-form" className="shrink-0 rounded-lg bg-[#006a65] px-4 py-2.5 text-sm font-semibold text-white">
            Pledge
          </a>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
