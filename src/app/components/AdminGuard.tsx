'use client';

import Link from 'next/link';
import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AdminGuard({ children }: { children: ReactNode }) {
  const { configError, isAdmin, isConfigured, loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isConfigured && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/admin')}`);
    }
  }, [isConfigured, loading, pathname, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6">
        <div className="border border-stone-300 bg-white p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin border-4 border-rose-200 border-t-rose-700" />
          <p className="font-medium text-stone-700">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6">
        <div className="max-w-lg border border-stone-300 bg-white p-8">
          <h1 className="mb-3 text-2xl font-semibold text-stone-950">Firebase setup needed</h1>
          <p className="mb-4 text-stone-700">Admin access needs Firebase config to be available.</p>
          <p className="bg-rose-50 p-4 text-sm text-rose-800">{configError}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6">
        <div className="border border-stone-300 bg-white p-8 text-center">
          <p className="font-medium text-stone-700">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] px-5 py-12 text-[#191c1d] sm:px-8">
        <div className="mx-auto max-w-2xl border border-stone-300 bg-white p-8 shadow-[8px_8px_0_#e0bfbd]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Admin access</p>
          <h1 className="mt-4 font-serif text-4xl font-semibold">This area is for BloomBox admins.</h1>
          <p className="mt-4 text-sm leading-6 text-[#584140]">
            You are signed in as a customer. Ask an existing admin to add your Firebase uid to the admins collection before opening this page.
          </p>
          <Link href="/dashboard" className="rounded-md mt-7 inline-flex bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520]">
            Back to customer dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
