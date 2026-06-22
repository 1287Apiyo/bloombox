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
        ].filter(Boolean).join('\n'),
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
    } catch (donationError) {
      setError(donationError instanceof Error ? donationError.message : 'Could not save this donation pledge.');
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
              <Eyebrow>Donate</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                Sponsor period care for someone who needs it.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#584140]">
                Donations help BloomBox prepare care bundles for girls, schools, NGOs, and community partners. Add your M-Changa reference if you have already paid.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#donate-form" className="bg-[#006a65] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#004b48]">
                  Record donation
                </a>
                <Link href="/subscriptions" className="border border-[#ae2f34] px-6 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  View subscriptions
                </Link>
              </div>
            </div>

            <div className="relative min-h-[430px] overflow-hidden border border-stone-300 bg-stone-100">
              <Image src="/mockups/bloombox-gift-flowers.png" alt="BloomBox donation care bundle" fill sizes="(min-width: 1024px) 620px, 100vw" priority className="object-cover" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="mb-8">
            <h2 className="font-serif text-4xl font-semibold text-[#ae2f34]">Donation paths</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Choose a starting point, then BloomBox can reconcile your pledge, M-Changa reference, and delivery plan.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {donationOptions.map((option) => (
              <button
                key={option.title}
                type="button"
                onClick={() => {
                  setDonationType(option.title);
                  setAmount(option.amount);
                  document.getElementById('donate-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="border border-stone-300 bg-white p-5 text-left transition hover:border-[#006a65] hover:bg-[#e7fbf8]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006a65]">{option.amount}</p>
                <h3 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">{option.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">{option.detail}</p>
              </button>
            ))}
          </div>
        </section>

        <section id="donate-form" className="border-y border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.72fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006a65]">Donation pledge</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold text-[#191c1d]">Help BloomBox match funds to care bundles.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#584140]">
                This form saves your donation details to the BloomBox sales/support pipeline. The team can then confirm the reference, recipient program, and delivery reporting.
              </p>
            </div>

            <form onSubmit={submitDonation} className="border border-stone-300 bg-[#fff5f0] p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Donor name
                  <input value={name} onChange={(event) => setName(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#006a65]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Email
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#006a65]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  WhatsApp or phone
                  <input value={phone} onChange={(event) => setPhone(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#006a65]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Amount
                  <input value={amount} onChange={(event) => setAmount(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#006a65]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700 sm:col-span-2">
                  Donation type
                  <select value={donationType} onChange={(event) => setDonationType(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#006a65]">
                    {donationTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700 sm:col-span-2">
                  M-Changa reference
                  <input value={mchangaReference} onChange={(event) => setMchangaReference(event.target.value)} className="border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#006a65]" placeholder="Optional reference after payment" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700 sm:col-span-2">
                  Notes
                  <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={4} className="resize-none border border-stone-300 bg-white px-3 py-3 font-normal outline-none focus:border-[#006a65]" placeholder="School, NGO, preferred campaign, or reporting needs." />
                </label>
              </div>

              {error ? <p className="mt-4 border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p> : null}
              {notice ? <p className="mt-4 border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p> : null}

              <button disabled={isSubmitting} className="mt-5 bg-[#006a65] px-6 py-3 text-sm font-semibold text-white hover:bg-[#004b48] disabled:opacity-60">
                {isSubmitting ? 'Saving...' : 'Save donation pledge'}
              </button>
            </form>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
