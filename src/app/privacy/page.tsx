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
        <section className="bb-mobile-hero">
          <div className="bb-mobile-hero-inner max-w-5xl">
            <Eyebrow>Privacy</Eyebrow>
            <h1 className="bb-mobile-h1 sm:mt-4 sm:text-5xl">BloomBox Privacy Policy</h1>
            <p className="bb-mobile-lead max-w-3xl sm:mt-5 sm:text-sm sm:leading-6">
              How BloomBox handles information across shopping, subscriptions, cycle tracking, checkout, leads, and partnerships.
            </p>
            <p className="mt-2 text-xs text-stone-500">Last updated: June 2, 2026</p>
          </div>
        </section>

        <section className="bb-page-pad max-w-5xl">
          <div className="grid gap-3 sm:gap-4">
            {sections.map((section) => (
              <article key={section.title} className="rounded-md border border-stone-300 bg-white p-4 shadow-sm sm:p-5">
                <h2 className="font-serif text-lg font-semibold text-[#ae2f34] sm:text-3xl">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-stone-700 sm:mt-3">{section.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-md border border-[#e0bfbd] bg-[#fff5f0] p-4 sm:mt-8 sm:p-5">
            <h2 className="font-serif text-xl font-semibold text-[#191c1d] sm:text-3xl">Contact</h2>
            <p className="mt-2 text-sm leading-6 text-[#584140] sm:mt-3">
              For privacy requests, contact BloomBox through the partnership or support channels on the site.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:flex sm:flex-wrap sm:gap-3">
              <Link href="/terms" className="rounded-md border border-[#ae2f34] px-4 py-2.5 text-center text-sm font-semibold text-[#ae2f34] hover:bg-white">
                Terms
              </Link>
              <Link href="/partner" className="rounded-md bg-[#ae2f34] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#8c1520]">
                Contact
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
