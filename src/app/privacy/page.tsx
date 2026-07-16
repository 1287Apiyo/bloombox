import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How BloomBox handles account, checkout, cycle, lead, and partner information.',
};

const sections = [
  {
    title: 'Information we collect',
    text: 'BloomBox may collect account details, delivery details, order history, cart items, payment method labels, newsletter signups, lead form submissions, partner inquiries, and cycle tracking details that you choose to save.',
  },
  {
    title: 'How we use information',
    text: 'We use information to create accounts, deliver orders, support subscriptions, manage inventory, qualify leads, respond to partner requests, send opted-in communications, and improve the BloomBox customer experience.',
  },
  {
    title: 'Cycle and wellness data',
    text: 'Cycle tracking information is sensitive. BloomBox stores it for your account experience and planning reminders. It is not medical advice, diagnosis, or treatment.',
  },
  {
    title: 'Payments',
    text: 'The current app stores payment records, provider labels, receipt references, and limited card metadata such as brand and last four digits. Full card numbers and CVV should not be stored in BloomBox.',
  },
  {
    title: 'Sharing',
    text: 'BloomBox may share only the information needed with fulfilment, delivery, payment, analytics, or support providers. Merchant partner submissions may be reviewed by the BloomBox team for marketplace fit.',
  },
  {
    title: 'Your choices',
    text: 'You can update account and delivery details, opt out of marketing reminders, and contact BloomBox to request access, correction, or deletion of personal information where legally available.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main>
        <section className="border-b border-stone-300 bg-white">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
            <Eyebrow>Privacy</Eyebrow>
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d]">BloomBox Privacy Policy</h1>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-[#584140]">
              This policy explains how BloomBox handles information across shopping, subscriptions, cycle tracking, checkout, lead capture, and partnerships.
            </p>
            <p className="mt-3 text-xs text-stone-500">Last updated: June 2, 2026</p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <div className="grid gap-4">
            {sections.map((section) => (
              <article key={section.title} className="border border-stone-300 bg-white p-5">
                <h2 className="font-serif text-3xl font-semibold text-[#ae2f34]">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-stone-700">{section.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 border border-[#e0bfbd] bg-[#fff5f0] p-5">
            <h2 className="font-serif text-3xl font-semibold text-[#191c1d]">Contact</h2>
            <p className="mt-3 text-sm leading-6 text-[#584140]">
              For privacy requests, contact BloomBox through the partnership or support channels on the site.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/terms" className="rounded-md border border-[#ae2f34] px-4 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-white">
                Terms and Conditions
              </Link>
              <Link href="/partner" className="rounded-md bg-[#ae2f34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c1520]">
                Contact BloomBox
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
