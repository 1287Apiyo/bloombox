'use client';

import { useState } from 'react';
import { signOut } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from './AuthProvider';

const accountNavigation = [
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/shop', label: 'Shop' },
  { href: '/orders', label: 'Orders' },
  { href: '/blog', label: 'Blog' },
];

const publicNavigation = [
  { href: '/', label: 'Home' },
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/shop', label: 'Shop' },
  { href: '/partner', label: 'Partner' },
  { href: '/about', label: 'About' },
  { href: '/blog', label: 'Blog' },
];

const footerSections = [
  {
    title: 'Subscriptions',
    links: [
      { label: 'Monthly tiers', href: '/subscriptions' },
      { label: 'Custom monthly plan', href: '/subscriptions#custom-plan' },
      { label: 'Card setup', href: '/subscriptions#subscription-card' },
      { label: 'Cycle tracking', href: '/cycle' },
    ],
  },
  {
    title: 'Care add-ons',
    links: [
      { label: 'Pads', href: '/shop' },
      { label: 'Menstrual cups', href: '/shop' },
      { label: 'Self-care', href: '/shop' },
      { label: 'First period kits', href: '/gifting' },
      { label: 'On-demand flowers', href: '/gifting' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Track orders', href: '/orders' },
      { label: 'Donate', href: '/donate' },
      { label: 'Partner with us', href: '/partner' },
      { label: 'About', href: '/about' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function CycleTrackerIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M22.8 8.6A9.8 9.8 0 0 0 7 12.9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M8.2 23.4A9.8 9.8 0 0 0 25 18.8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M21.8 5.4 24 9.3l-4.3.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m10.2 26.6-2.2-3.9 4.3-.7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="7.4" r="2.3" fill="#FFC857" />
      <circle cx="24.6" cy="16" r="2.2" fill="currentColor" />
      <circle cx="16" cy="24.6" r="2.3" fill="#fed4c8" />
      <circle cx="7.4" cy="16" r="2.2" fill="currentColor" opacity="0.45" />
      <circle cx="16" cy="16" r="3.2" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

export function BrandMark({ dark = false }: { dark?: boolean }) {
  const { isAdmin, loading, user } = useAuth();
  const href = loading || !user ? '/' : isAdmin ? '/admin' : '/dashboard';

  return (
    <Link href={href} className="flex items-center gap-3">
      <span className="relative h-11 w-11 overflow-hidden rounded-full border border-stone-300 bg-white">
        <Image src="/bloom1.png" alt="BloomBox" fill className="object-cover" priority />
      </span>
      <span className={dark ? 'hidden text-xl font-bold tracking-tight text-white sm:inline' : 'hidden text-xl font-bold tracking-tight text-stone-950 sm:inline'}>
        BloomBox
      </span>
    </Link>
  );
}

export function SiteHeader({ cartCount = 0, onCartClick }: { cartCount?: number; onCartClick?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, loading, user } = useAuth();
  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const accountHref = user ? (isAdmin ? '/admin' : '/partner') : '/login';
  const accountLabel = user ? (isAdmin ? 'Admin' : 'Partner') : 'Sign in';
  const visibleNavigation = user ? (isAdmin ? [...accountNavigation, { href: '/admin', label: 'Admin' }] : accountNavigation) : publicNavigation;
  const mobileNavigation = visibleNavigation;

  const handleLogout = async () => {
    setLogoutError('');
    setIsLoggingOut(true);

    try {
      await signOut(getFirebaseAuth());
      router.push('/login');
    } catch (authError) {
      setLogoutError(getAuthErrorMessage(authError));
      setIsLoggingOut(false);
    }
  };

  return (
    <>
    <header data-site-header className="fixed left-0 right-0 top-0 z-[1000] translate-y-0 transform-gpu border-b border-stone-300 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8 sm:py-4">
        <BrandMark />

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2 overflow-x-auto px-2 [scrollbar-width:none] lg:flex xl:gap-3 [&::-webkit-scrollbar]:hidden" aria-label="Primary navigation">
          {visibleNavigation.map((item) => {
            const isActive = isActiveRoute(pathname, item.href);
            const isSubscriptionLink = item.href === '/subscriptions';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border-b-2 py-2 text-xs font-semibold transition xl:text-sm ${
                  isActive
                    ? 'border-rose-700 text-rose-700'
                    : isSubscriptionLink
                      ? 'border-[#ae2f34] text-[#ae2f34] hover:border-[#8c1520] hover:text-[#8c1520]'
                      : 'border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-950'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {user ? (
            <Link
              href="/cycle"
              className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border-2 shadow-sm transition ${
                isActiveRoute(pathname, '/cycle')
                  ? 'border-[#ae2f34] bg-[#ae2f34] text-white'
                  : 'border-stone-300 bg-[#fff5f0] text-[#ae2f34] hover:border-[#ae2f34] hover:bg-[#fed4c8]'
              }`}
              aria-label="Open cycle tracker"
              title="Cycle tracker"
            >
              <CycleTrackerIcon />
            </Link>
          ) : null}

          {onCartClick ? (
            <button
              type="button"
              onClick={onCartClick}
              className="relative inline-flex h-10 w-10 items-center justify-center border border-stone-300 bg-white text-stone-700 transition hover:border-rose-700 hover:text-rose-700"
              aria-label="Open cart"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center bg-rose-700 px-1 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            </button>
          ) : null}

          <Link
            href="/donate"
            className="border border-[#006a65] bg-[#006a65] px-3 py-2 text-xs font-semibold text-white transition hover:border-[#004b48] hover:bg-[#004b48] sm:px-4 sm:text-sm"
          >
            Donate
          </Link>

          <Link
            href={accountHref}
            className="bg-rose-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-950 sm:px-4 sm:text-sm"
          >
            {accountLabel}
          </Link>

          {!loading && !user ? (
            <Link
              href="/signup"
              className="border border-rose-700 bg-white px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 sm:px-4 sm:text-sm"
            >
              Create account
            </Link>
          ) : null}

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 transition hover:border-rose-700 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:text-sm"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
              {logoutError ? (
                <p className="absolute right-0 top-11 w-64 border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                  {logoutError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <nav className="border-t border-stone-200 bg-white px-3 sm:px-8 lg:hidden" aria-label="Primary navigation">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {mobileNavigation.map((item) => {
            const isActive = isActiveRoute(pathname, item.href);
            const isSubscriptionLink = item.href === '/subscriptions';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border px-3 py-2 text-xs font-semibold transition ${
                  isActive
                    ? 'border-rose-700 bg-rose-700 text-white'
                    : isSubscriptionLink
                      ? 'border-rose-700 bg-[#fff5f0] text-rose-700 hover:bg-rose-50'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-rose-700 hover:text-rose-700'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
    <div className="h-[116px] sm:h-[130px] lg:h-[77px]" aria-hidden="true" />
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-[#14090c] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-14">
        <div className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <BrandMark dark />
            <h2 className="mt-6 max-w-2xl font-serif text-4xl font-semibold leading-tight text-white">
              Care that arrives with softness, usefulness, and a little ceremony.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-[#fed4c8]">
              Monthly period care subscriptions with comfort add-ons, cycle-aware reminders, and community support for women and girls.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/signup?next=/subscriptions" className="bg-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
              Start subscription
            </Link>
            <Link href="/donate" className="border border-[#fed4c8] px-5 py-3 text-center text-sm font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c]">
              Donate
            </Link>
          </div>
        </div>

        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.1fr_1fr_1fr_1.15fr] lg:gap-10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="border-l-4 border-[#ae2f34] pl-3 text-xs font-bold uppercase tracking-[0.16em] text-[#fed4c8]">{section.title}</h3>
              <ul className="mt-5 grid gap-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm font-medium text-stone-300 transition hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="border border-white/10 bg-white/5 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#fed4c8]">Community</p>
            <h3 className="mt-3 font-serif text-2xl font-semibold text-white">Stories make care easier to talk about.</h3>
            <p className="mt-3 text-sm leading-6 text-stone-300">
              Explore product guides, first-period stories, menstrual cup notes, and comfort rituals from the BloomBox community.
            </p>
            <Link href="/blog" className="mt-5 inline-flex border border-[#fed4c8] px-4 py-2 text-sm font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c]">
              Open blog
            </Link>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-6 text-xs text-stone-400 md:grid-cols-[1fr_auto] md:items-center">
          <p>BloomBox by Delilah. Made with care for women everywhere.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/faqs" className="hover:text-white">FAQs</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/login" className="hover:text-white">Log in</Link>
            <Link href="/orders" className="hover:text-white">Track orders</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex border-l-4 border-rose-700 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-rose-800">
      {children}
    </span>
  );
}
