import type { Metadata } from 'next';
import Link from 'next/link';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'BloomBox account, checkout, subscription, donation, merchant, and cycle tracking terms.',
};

const sections = [
  {
    title: 'Accounts',
    text: 'Customers are responsible for keeping account information accurate and for protecting login details. BloomBox may restrict access if an account is misused or used to interfere with the service.',
  },
  {
    title: 'Orders and delivery',
    text: 'Orders depend on product availability, delivery coverage, and successful payment confirmation. Delivery notes help fulfilment but cannot guarantee exact timing or courier behavior.',
  },
  {
    title: 'Subscriptions',
    text: 'Subscription tiers create recurring care records. Pricing, product availability, add-ons, and delivery windows may change with supplier availability and customer preferences.',
  },
  {
    title: 'Payments and donations',
    text: 'BloomBox may support M-Pesa, M-Changa donation references, card options, and other payment methods. Payment provider confirmations, receipts, and reference numbers may be required before fulfilment.',
  },
  {
    title: 'Cycle tracking',
    text: 'Cycle tracking is a planning and reminder tool. It is not medical advice. People with severe pain, heavy bleeding, PCOS, endometriosis, hormonal birth control questions, or other health concerns should speak with a qualified clinician.',
  },
  {
    title: 'Merchant partnerships',
    text: 'Partner submissions do not guarantee listing, approval, exclusivity, or purchase orders. BloomBox may review product fit, quality, pricing, fulfilment capacity, brand alignment, and safety before approval.',
  },
  {
    title: 'Changes',
    text: 'BloomBox may update products, prices, features, policies, and terms as the service evolves. Continued use of the service means the updated terms apply.',
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main>
        <section className="bb-mobile-hero">
          <div className="bb-mobile-hero-inner max-w-5xl">
            <Eyebrow>Terms</Eyebrow>
            <h1 className="bb-mobile-h1 sm:mt-4 sm:text-5xl">Terms and Conditions</h1>
            <p className="bb-mobile-lead max-w-3xl sm:mt-5 sm:text-sm sm:leading-6">
              Expectations for accounts, shopping, subscriptions, donations, cycle tracking, and merchant partnerships.
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
            <h2 className="font-serif text-xl font-semibold text-[#191c1d] sm:text-3xl">Related policy</h2>
            <p className="mt-2 text-sm leading-6 text-[#584140] sm:mt-3">
              The Privacy Policy explains what information BloomBox collects and how it is handled.
            </p>
            <Link href="/privacy" className="mt-4 inline-flex w-full justify-center rounded-md bg-[#ae2f34] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8c1520] sm:mt-5 sm:w-auto">
              Privacy Policy
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
