'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from '../components/AuthProvider';

export type AdminSection = 'overview' | 'orders' | 'upcoming' | 'products' | 'customers' | 'subscribers' | 'access' | 'inventory' | 'leads' | 'partners' | 'ai-assist';
type IconName = 'chart' | 'orders' | 'calendar' | 'products' | 'users' | 'mail' | 'shield' | 'inventory' | 'pipeline' | 'partners' | 'ai';

const navigation: { id: AdminSection; href: string; label: string; detail: string; icon: IconName }[] = [
  { id: 'overview', href: '/admin?section=overview', label: 'Overview', detail: 'Metrics and activity', icon: 'chart' },
  { id: 'orders', href: '/admin?section=orders', label: 'Orders', detail: 'Delivery workflow', icon: 'orders' },
  { id: 'upcoming', href: '/admin?section=upcoming', label: 'Upcoming', detail: 'Cycle prep', icon: 'calendar' },
  { id: 'products', href: '/admin?section=products', label: 'Products', detail: 'Catalog and images', icon: 'products' },
  { id: 'inventory', href: '/admin/inventory', label: 'Inventory', detail: 'Stock and revenue', icon: 'inventory' },
  { id: 'leads', href: '/admin/leads', label: 'Leads', detail: 'Sales pipeline', icon: 'pipeline' },
  { id: 'partners', href: '/admin/partners', label: 'Partners', detail: 'Merchant intake', icon: 'partners' },
  { id: 'ai-assist', href: '/admin/ai-assist', label: 'AI Assist', detail: 'Marketing and ops', icon: 'ai' },
  { id: 'customers', href: '/admin?section=customers', label: 'Customers', detail: 'Users and roles', icon: 'users' },
  { id: 'subscribers', href: '/admin?section=subscribers', label: 'Subscribers', detail: 'Community emails', icon: 'mail' },
  { id: 'access', href: '/admin?section=access', label: 'Access', detail: 'Permissions model', icon: 'shield' },
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={paths[name]} />
    </svg>
  );
}

export function AdminPortalFrame({
  activeSection,
  eyebrow = 'Back office',
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-stone-300 bg-[#14090c] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col px-4 py-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="relative h-9 w-9 overflow-hidden rounded-full border border-white/30 bg-white">
              <Image src="/bloom1.png" alt="BloomBox" fill sizes="44px" className="object-cover" priority />
            </span>
            <div>
              <p className="text-base font-bold">BloomBox</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#fed4c8]">Admin portal</p>
            </div>
          </div>

          <nav className="mt-5 grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-2 py-2 text-left transition ${
                  activeSection === item.id ? 'bg-white/10 text-[#fed4c8]' : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <AdminIcon name={item.icon} />
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-5">{item.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-stone-400">{item.detail}</span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">Signed in</p>
            <p className="mt-1 break-all text-xs text-[#fed4c8]">{user?.email ?? 'Admin'}</p>
            <div className="mt-4 grid gap-1">
              <Link href="/dashboard" className="px-2 py-2 text-sm font-semibold text-stone-300 hover:bg-white/5 hover:text-white">
                View site
              </Link>
              <button type="button" onClick={handleSignOut} className="px-2 py-2 text-left text-sm font-semibold text-stone-300 hover:bg-white/5 hover:text-white">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <section className="border-b border-stone-300 bg-white px-4 py-3 sm:px-6">
          <div className="w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">{eyebrow}</p>
            <div className="mt-1 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <h1 className="font-serif text-3xl font-semibold leading-tight">{title}</h1>
                {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-[#584140]">{description}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {actions}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-fit border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-4 py-5 sm:px-6">{children}</section>
      </main>
    </div>
  );
}
