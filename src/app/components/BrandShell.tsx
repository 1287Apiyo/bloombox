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

const navigation = [
  { href: '/shop', label: 'Shop' },
  { href: '/gifting', label: 'Gifting' },
  { href: '/orders', label: 'Orders' },
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/about', label: 'About' },
  { href: '/faqs', label: 'FAQs' },
];

const footerSections = [
  {
    title: 'Shop',
    links: [
      { label: 'Pads', href: '/shop' },
      { label: 'Menstrual cups', href: '/shop' },
      { label: 'Self-care', href: '/shop' },
      { label: 'Gifts', href: '/gifting' },
    ],
  },
  {
    title: 'Care',
    links: [
      { label: 'Subscriptions', href: '/subscriptions' },
      { label: 'First period kits', href: '/gifting' },
      { label: 'On-demand flowers', href: '/gifting' },
      { label: 'Comfort bundles', href: '/shop' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQs', href: '/faqs' },
      { label: 'Track orders', href: '/orders' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/gifting' },
    ],
  },
];

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BrandMark({ dark = false }: { dark?: boolean }) {
  const { isAdmin, loading, user } = useAuth();
  const href = loading || user ? (isAdmin ? '/admin' : '/dashboard') : '/login';

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
  const accountHref = loading || user ? (isAdmin ? '/admin' : '/dashboard') : '/login';
  const accountLabel = loading || user ? (isAdmin ? 'Admin' : 'Dashboard') : 'Sign in';
  const visibleNavigation = isAdmin ? [...navigation, { href: '/admin', label: 'Admin' }] : navigation;

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

        <nav className="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Primary navigation">
          {visibleNavigation.map((item) => {
            const isActive = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 py-2 text-sm font-semibold transition ${
                  isActive ? 'border-rose-700 text-rose-700' : 'border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-950'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
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
            href={accountHref}
            className="bg-rose-700 px-3 py-2 text-xs font-semibold text-white transition hover:bg-stone-950 sm:px-4 sm:text-sm"
          >
            {accountLabel}
          </Link>

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
          {visibleNavigation.map((item) => {
            const isActive = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`shrink-0 border px-3 py-2 text-xs font-semibold transition ${
                  isActive ? 'border-rose-700 bg-rose-700 text-white' : 'border-stone-300 bg-white text-stone-700 hover:border-rose-700 hover:text-rose-700'
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
    <footer className="border-t border-stone-200 bg-stone-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-10 lg:py-12">
        <div>
          <BrandMark dark />
          <p className="mt-4 max-w-sm text-sm leading-6 text-stone-300">
            Period care, comfort essentials, and thoughtful gifts for women and girls across every stage of the cycle.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-white">{section.title}</h3>
            <ul className="mt-4 space-y-3">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-stone-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-stone-500">
        BloomBox by Delilah. Made with care for women everywhere.
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
