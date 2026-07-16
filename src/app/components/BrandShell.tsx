'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from './AuthProvider';

/** Compact primary nav — same on desktop bar and mobile menu */
const accountNavigation = [
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/shop', label: 'Shop' },
  { href: '/orders', label: 'Orders' },
  { href: '/blog', label: 'Blog' },
];

const publicNavigation = [
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

function navLinkClass(isActive: boolean) {
  return isActive
    ? 'border-rose-700 text-rose-700 font-bold'
    : 'border-transparent text-stone-600 font-medium hover:border-stone-300 hover:text-stone-950';
}

function mobileNavLinkClass(isActive: boolean) {
  return isActive
    ? 'text-[#ae2f34] font-bold'
    : 'text-stone-800 font-semibold hover:text-[#ae2f34]';
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 6l12 12M18 6 6 18" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
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
    <Link href={href} className="flex min-w-0 items-center gap-2 sm:gap-3">
      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-stone-300 bg-white sm:h-12 sm:w-12">
        <Image src="/bloom1.png" alt="BloomBox" fill sizes="48px" className="object-cover" priority />
      </span>
      <span className={dark ? 'truncate text-lg font-serif font-bold tracking-tight text-white sm:text-2xl' : 'truncate text-lg font-serif font-bold tracking-tight text-stone-950 sm:text-2xl'}>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const accountHref = user ? (isAdmin ? '/admin' : '/partner') : '/login';
  const accountLabel = user ? (isAdmin ? 'Admin' : 'Partner') : 'Sign in';
  const primaryNavigation = user
    ? isAdmin
      ? [...accountNavigation, { href: '/admin', label: 'Admin' }]
      : accountNavigation
    : publicNavigation;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [mobileMenuOpen]);

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
    <header data-site-header className="fixed left-0 right-0 top-0 z-[1000] translate-y-0 transform-gpu border-b border-stone-200 bg-white/95 shadow-[0_1px_0_rgba(28,25,23,0.06)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6 sm:py-3.5 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((current) => !current)}
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition lg:hidden ${
              mobileMenuOpen
                ? 'border-[#ae2f34] bg-[#ae2f34] text-white'
                : 'border-stone-200 bg-white text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]'
            }`}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-primary-nav"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>
          <BrandMark />
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-x-auto px-4 lg:flex xl:gap-8 [&::-webkit-scrollbar]:hidden" aria-label="Primary navigation">
          {primaryNavigation.map((item) => {
            const isActive = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border-b-2 py-2 text-sm font-semibold transition xl:text-base ${navLinkClass(isActive)}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {user ? (
            <Link
              href="/cycle"
              className={`relative inline-flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-sm transition sm:h-11 sm:w-11 ${
                isActiveRoute(pathname, '/cycle')
                  ? 'border-[#ae2f34] bg-[#ae2f34] text-white'
                  : 'border-stone-200 bg-[#fff5f0] text-[#ae2f34] hover:border-[#ae2f34] hover:bg-[#fed4c8]'
              }`}
              aria-label="Open cycle tracker"
              title="Cycle tracker"
            >
              <CycleTrackerIcon />
            </Link>
          ) : null}

          <Link
            href="/donate"
            className="hidden rounded-md border border-[#006a65] bg-[#006a65] px-4 py-2 text-sm font-semibold text-white transition hover:border-[#004b48] hover:bg-[#004b48] sm:inline-flex sm:px-6"
          >
            Donate
          </Link>

          <Link
            href={accountHref}
            className="rounded-md bg-[#ae2f34] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#8c1520] sm:px-6"
          >
            {accountLabel}
          </Link>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:border-[#ae2f34] hover:text-[#ae2f34] disabled:cursor-not-allowed disabled:opacity-60 sm:inline-flex"
            >
              {isLoggingOut ? '...' : 'Logout'}
            </button>
          ) : null}
        </div>
      </div>
      {logoutError ? (
        <p className="border-t border-rose-200 bg-rose-50 px-4 py-2 text-center text-xs text-rose-800 sm:px-6">
          {logoutError}
        </p>
      ) : null}
    </header>

    {mobileMenuOpen ? (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[999] bg-[#14090c]/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileMenuOpen(false)}
        />
        <nav
          id="mobile-primary-nav"
          className="fixed left-0 right-0 top-[var(--bb-header-offset,60px)] z-[1001] max-h-[min(78dvh,calc(100dvh-var(--bb-header-offset,60px)-0.5rem))] overflow-y-auto border-b border-stone-200 bg-white lg:hidden"
          aria-label="Primary navigation"
        >
          <div className="mx-auto max-w-7xl px-4 pb-3 pt-1 sm:px-6">
            {/* Same compact set as desktop — flat list on panel bg */}
            <ul className="divide-y divide-stone-100">
              {primaryNavigation.map((item) => {
                const isActive = isActiveRoute(pathname, item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between py-3.5 text-[15px] transition ${mobileNavLinkClass(isActive)}`}
                    >
                      <span className="flex items-center gap-2.5">
                        {isActive ? (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ae2f34]" aria-hidden="true" />
                        ) : (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-transparent" aria-hidden="true" />
                        )}
                        {item.label}
                      </span>
                      <span className={`text-lg leading-none ${isActive ? 'text-[#ae2f34]' : 'text-stone-300'}`} aria-hidden="true">
                        ›
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-1 border-t border-stone-200 pt-3 pb-1">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
                <Link
                  href="/donate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#006a65] hover:underline"
                >
                  Donate
                </Link>
                <Link
                  href={accountHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#ae2f34] hover:underline"
                >
                  {accountLabel}
                </Link>
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      void handleLogout();
                    }}
                    disabled={isLoggingOut}
                    className="text-stone-600 hover:text-[#ae2f34] disabled:opacity-60"
                  >
                    {isLoggingOut ? 'Signing out…' : 'Log out'}
                  </button>
                ) : (
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-stone-700 hover:text-[#ae2f34]"
                  >
                    Create account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </>
    ) : null}

    <div className="h-[var(--bb-header-offset,60px)]" aria-hidden="true" />
    </>
  );
}

export function SiteFooter() {
  const mobileQuickLinks = [
    { label: 'Subscriptions', href: '/subscriptions' },
    { label: 'Shop', href: '/shop' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Donate', href: '/donate' },
    { label: 'About', href: '/about' },
  ];

  return (
    <footer className="mt-0 border-t border-stone-200 bg-[#14090c] text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10 lg:py-14">
        <div className="grid gap-4 border-b border-white/10 pb-5 sm:gap-6 sm:pb-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-8 lg:pb-10">
          <div>
            <BrandMark dark />
            <h2 className="mt-4 hidden max-w-2xl font-serif text-3xl font-semibold leading-tight text-white md:block sm:text-4xl">
              Care that arrives with softness, usefulness, and a little ceremony.
            </h2>
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-[#fed4c8] md:mt-4">
              Monthly period care subscriptions with comfort add-ons, cycle-aware reminders, and community support.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Link href="/signup?next=/subscriptions" className="rounded-md bg-[#ae2f34] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520] sm:px-5 sm:py-3">
              Start subscription
            </Link>
            <Link href="/donate" className="rounded-md border border-[#fed4c8] px-4 py-2.5 text-center text-sm font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c] sm:px-5 sm:py-3">
              Donate
            </Link>
          </div>
        </div>

        <div className="py-5 lg:hidden">
          <h3 className="border-l-4 border-[#ae2f34] pl-3 text-xs font-bold uppercase tracking-[0.16em] text-[#fed4c8]">Quick links</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2.5">
            {mobileQuickLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-sm font-medium text-stone-300 transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden gap-8 py-10 sm:grid-cols-2 lg:grid lg:grid-cols-[1.1fr_1fr_1fr_1.15fr] lg:gap-10">
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
            <Link href="/blog" className="rounded-md mt-5 inline-flex border border-[#fed4c8] px-4 py-2 text-sm font-semibold text-[#fed4c8] transition hover:bg-[#fed4c8] hover:text-[#14090c]">
              Open blog
            </Link>
          </div>
        </div>

        <div className="grid gap-4 border-t border-white/10 pt-5 text-xs text-stone-400 md:grid-cols-[1fr_auto] md:items-center lg:pt-6">
          <p>BloomBox by Delilah. Made with care for women everywhere.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/faqs" className="hover:text-white">FAQs</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
            <Link href="/login" className="hidden hover:text-white sm:inline">Log in</Link>
            <Link href="/orders" className="hidden hover:text-white sm:inline">Track orders</Link>
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
