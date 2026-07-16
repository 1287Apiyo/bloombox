'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '../components/AuthProvider';

export type AdminSection =
  | 'overview'
  | 'orders'
  | 'upcoming'
  | 'products'
  | 'customers'
  | 'subscribers'
  | 'access'
  | 'inventory'
  | 'leads'
  | 'partners'
  | 'ai-assist';

type IconName =
  | 'chart'
  | 'orders'
  | 'calendar'
  | 'products'
  | 'users'
  | 'mail'
  | 'shield'
  | 'inventory'
  | 'pipeline'
  | 'partners'
  | 'ai';

const navigation: { id: AdminSection; href: string; label: string; icon: IconName }[] = [
  { id: 'overview', href: '/admin?section=overview', label: 'Overview', icon: 'chart' },
  { id: 'orders', href: '/admin?section=orders', label: 'Orders', icon: 'orders' },
  { id: 'upcoming', href: '/admin?section=upcoming', label: 'Upcoming', icon: 'calendar' },
  { id: 'products', href: '/admin?section=products', label: 'Products', icon: 'products' },
  { id: 'inventory', href: '/admin/inventory', label: 'Inventory', icon: 'inventory' },
  { id: 'leads', href: '/admin/leads', label: 'Leads', icon: 'pipeline' },
  { id: 'partners', href: '/admin/partners', label: 'Partners', icon: 'partners' },
  { id: 'ai-assist', href: '/admin/ai-assist', label: 'AI Assist', icon: 'ai' },
  { id: 'customers', href: '/admin?section=customers', label: 'Customers', icon: 'users' },
  { id: 'subscribers', href: '/admin?section=subscribers', label: 'Subscribers', icon: 'mail' },
  { id: 'access', href: '/admin?section=access', label: 'Access', icon: 'shield' },
];

function AdminIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    chart: 'M4 19V5m0 14h16M8 16V9m4 7V7m4 9v-5',
    orders: 'M7 7h10M7 12h10M7 17h6M5 3h14v18H5z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    products: 'M4 7l8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10',
    inventory: 'M4 6h16M6 6v14h12V6M9 10h6m-6 4h6',
    pipeline: 'M4 6h5v5H4V6Zm11 0h5v5h-5V6ZM4 16h5v2H4v-2Zm11 0h5v2h-5v-2ZM9 8h6M9 17h6',
    partners: 'M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 8v-1a5 5 0 0 0-10 0v1m12-10 2 2 2-3',
    ai: 'M12 3v3m0 12v3M3 12h3m12 0h3M7 7l2 2m6 6 2 2m0-10-2 2m-6 6-2 2M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z',
    users: 'M16 19v-1a4 4 0 0 0-8 0v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6 8v-1a3 3 0 0 0-2-2.83M18 7a3 3 0 0 1 0 6',
    mail: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
    shield: 'M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z',
  };

  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={paths[name]} />
    </svg>
  );
}

export function AdminPortalFrame({
  activeSection,
  eyebrow = 'Admin',
  title,
  description,
  actions,
  children,
}: {
  activeSection: AdminSection;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
  };

  const initials = (user?.email ?? 'A').slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-white text-black lg:grid lg:grid-cols-[240px_1fr]">
      {/* Black sidebar */}
      <aside className="border-b border-white/10 bg-black text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex h-full flex-col px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-3 border-b border-white/10 px-1 pb-3 sm:px-2 sm:pb-4">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white">
              <Image src="/bloom1.png" alt="BloomBox" fill sizes="36px" className="object-cover" priority />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">BloomBox</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">Admin</p>
            </div>
          </div>

          <nav className="bb-mobile-scroll mt-3 flex gap-1 overflow-x-auto pb-1 lg:mt-5 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0">
            {navigation.map((item) => {
              const active = activeSection === item.id;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition sm:gap-2.5 sm:px-3 sm:py-2.5 lg:w-full ${
                    active ? 'bg-[#ae2f34] text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <AdminIcon name={item.icon} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 hidden space-y-3 border-t border-white/10 pt-4 lg:block">
            <div className="flex items-center gap-3 px-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ae2f34] text-xs font-bold">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{user?.email ?? 'Admin'}</p>
                <p className="text-[10px] text-white/70">Administrator</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard"
                className="rounded-lg border border-white/20 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/10"
              >
                View site
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* White content area — same structure on every page */}
      <div className="min-w-0 overflow-x-hidden bg-white">
        <header className="sticky top-0 z-20 border-b border-black/10 bg-white px-3 py-4 sm:px-6 sm:py-5 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ae2f34]">{eyebrow}</p>
              <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-black sm:truncate sm:text-3xl">
                {title}
              </h1>
              {description ? (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-black">{description}</p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {actions}
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-black/30"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <main className="bg-white px-3 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

/** Shared building blocks — same structure as Inventory */

export function AdminAlert({
  tone = 'error',
  children,
}: {
  tone?: 'error' | 'success';
  children: ReactNode;
}) {
  const styles =
    tone === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-800'
      : 'border-emerald-200 bg-emerald-50 text-emerald-900';
  return <div className={`border p-4 text-sm leading-6 ${styles}`}>{children}</div>;
}

export function AdminStatStrip({
  items,
}: {
  items: Array<{ label: string; value: ReactNode; detail?: string }>;
}) {
  return (
    <div
      className={`grid border-y border-stone-300 bg-white sm:grid-cols-2 ${
        items.length >= 6
          ? 'xl:grid-cols-6'
          : items.length === 5
            ? 'xl:grid-cols-5'
            : items.length === 4
              ? 'xl:grid-cols-4'
              : items.length === 3
                ? 'xl:grid-cols-3'
                : 'xl:grid-cols-2'
      }`}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={`px-4 py-3 ${
            index < items.length - 1 ? 'border-b border-stone-200 sm:border-r xl:border-b-0' : ''
          }`}
        >
          <p className="text-2xl font-semibold text-[#ae2f34]">{item.value}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black">{item.label}</p>
          {item.detail ? <p className="mt-1 text-xs text-black">{item.detail}</p> : null}
        </div>
      ))}
    </div>
  );
}

export function AdminPanel({
  title,
  description,
  actions,
  children,
  bordered = false,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  bordered?: boolean;
}) {
  return (
    <section className={bordered ? 'rounded-md border border-stone-300 bg-white p-5 shadow-sm' : 'bg-white'}>
      <div className="mb-3 flex flex-col justify-between gap-2 border-b border-stone-300 pb-2 md:flex-row md:items-end">
        <div>
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          {description ? <p className="mt-0.5 text-sm text-black">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function AdminFormCard({
  eyebrow = 'Record',
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-stone-300 bg-white p-5 shadow-sm xl:sticky xl:top-6 xl:self-start">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">{eyebrow}</p>
      <h2 className="mt-2 font-serif text-3xl font-semibold text-black">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}
