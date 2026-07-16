import Link from 'next/link';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const faqs = [
  {
    question: 'What is BloomBox?',
    answer:
      'BloomBox is the ultimate gift-giver for women. We curate thoughtful care packages designed to bring comfort during your period and other meaningful moments in life.',
    category: 'About',
  },
  {
    question: 'How do I place an order?',
    answer:
      'Create an account, browse our colorful pages, choose what you would like, fill in your delivery details, and check out.',
    category: 'Ordering',
  },
  {
    question: 'Do I have to create an account to use BloomBox?',
    answer:
      'You can browse and begin one-time shopping directly from the website. Checkout, subscriptions, saved delivery details, community features, and order tracking use an account so your details stay tied to you.',
    category: 'Account',
  },
  {
    question: 'Can I gift someone else?',
    answer:
      'Yes. You can select from our pre-arranged gift packages or create your own. Once you complete payment, provide the recipient details and we will deliver your gift with love.',
    category: 'Gifting',
  },
  {
    question: 'Can I create my own package?',
    answer:
      'Absolutely. Browse through our listed items, pick what you would like, and let us know where to deliver your custom package.',
    category: 'Gifting',
  },
  {
    question: 'Is my information safe on your website?',
    answer:
      'Yes. BloomBox is duly registered under Kenyan law, including registration with the Office of the Data Commissioner of Kenya. Your information is handled securely and responsibly.',
    category: 'Privacy',
  },
  {
    question: 'How do I get my monthly packages delivered?',
    answer:
      'Once you subscribe to your preferred bundle, you will receive monthly notifications confirming delivery details. You will also be able to confirm or update your drop-off location.',
    category: 'Subscriptions',
  },
  {
    question: 'How do I join the BloomBox community?',
    answer:
      'Follow us on our social media platforms to connect, share, and engage in meaningful discussions with other women.',
    category: 'Community',
  },
  {
    question: 'What impact does BloomBox have on the environment?',
    answer:
      'We use eco-friendly, recyclable packaging to extend the experience of receiving your gift. We also offer reusable menstrual solutions, which help reduce both costs for women and the number of single-use pads that end up in landfills.',
    category: 'Impact',
  },
  {
    question: 'What impact does BloomBox have in the community?',
    answer:
      'BloomBox exists to bring joy and care to women, because happy women are healthy women. We also run a donation program where generous contributors can help gift underprivileged girls and women.',
    category: 'Impact',
  },
];

const quickLinks = [
  { label: 'Shop products', href: '/shop' },
  { label: 'Build a gift', href: '/gifting' },
  { label: 'View subscriptions', href: '/subscriptions' },
  { label: 'Track orders', href: '/orders' },
];

export default function FAQsPage() {
  const topics = Array.from(new Set(faqs.map((faq) => faq.category)));

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main>
        {/* Mobile compact hero */}
        <section className="bb-mobile-hero lg:hidden">
          <div className="bb-mobile-hero-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Help center</p>
            <h1 className="bb-mobile-h1">BloomBox FAQs</h1>
            <p className="bb-mobile-lead">Ordering, gifting, subscriptions, privacy, delivery, and community.</p>
            <div className="bb-mobile-scroll mt-3 flex gap-2 pb-0.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 rounded-full border border-[#e0bfbd] bg-white px-3 py-1.5 text-xs font-semibold text-[#191c1d]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Desktop hero */}
        <section className="hidden border-b border-stone-300 bg-white lg:block">
          <div className="mx-auto grid max-w-7xl gap-8 px-8 py-20 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
            <div>
              <Eyebrow>Help center</Eyebrow>
              <h1 className="mt-6 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                BloomBox FAQs
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#584140]">
                Answers about ordering, gifting, subscriptions, privacy, delivery, community, and impact.
              </p>
            </div>

            <div className="rounded-md border border-stone-300 bg-[#fff5f0] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Need something faster?</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-md border border-[#e0bfbd] bg-white px-4 py-3 text-sm font-semibold text-[#191c1d] transition hover:border-[#ae2f34] hover:text-[#ae2f34]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bb-page-pad grid gap-5 lg:grid-cols-[280px_1fr] lg:gap-8">
          <aside className="h-fit rounded-md border border-stone-300 bg-white p-3 shadow-sm sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">Topics</p>
            <div className="bb-mobile-scroll mt-3 flex gap-2 lg:mt-4 lg:grid lg:gap-2 lg:overflow-visible">
              {topics.map((category) => (
                <span
                  key={category}
                  className="shrink-0 rounded-full border border-stone-200 bg-[#f8f9fa] px-3 py-1.5 text-xs font-semibold text-stone-700 sm:rounded-md sm:py-2 sm:text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </aside>

          <div className="grid gap-2.5 sm:gap-3">
            {faqs.map((faq, index) => (
              <details key={faq.question} className="group overflow-hidden rounded-md border border-stone-300 bg-white shadow-sm" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-3.5 py-3.5 text-sm font-semibold text-stone-950 sm:items-center sm:gap-4 sm:px-5 sm:py-4">
                  <span className="min-w-0 leading-snug">{faq.question}</span>
                  <span className="shrink-0 text-lg leading-none text-[#ae2f34] group-open:hidden">+</span>
                  <span className="hidden shrink-0 text-lg leading-none text-[#ae2f34] group-open:inline">−</span>
                </summary>
                <div className="border-t border-stone-200 px-3.5 py-3.5 sm:px-5 sm:py-4">
                  <span className="inline-flex rounded-full bg-[#fff5f0] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#ae2f34] sm:text-[11px]">
                    {faq.category}
                  </span>
                  <p className="mt-2.5 text-sm leading-6 text-stone-600 sm:mt-3">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
