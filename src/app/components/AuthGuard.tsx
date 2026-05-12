'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { configError, isConfigured, loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isConfigured && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname || '/dashboard')}`);
    }
  }, [isConfigured, loading, pathname, router, user]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6">
        <div className="rounded-md border border-stone-300 bg-white p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-md border-4 border-rose-200 border-t-rose-700" />
          <p className="font-medium text-gray-700">Checking your BloomBox session...</p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6">
        <div className="max-w-lg rounded-md border border-stone-300 bg-white p-8">
          <h1 className="mb-3 text-2xl font-semibold text-gray-900">Firebase setup needed</h1>
          <p className="mb-4 text-gray-700">
            Add your Firebase web app values to <span className="font-mono text-sm">.env.local</span>, then restart the dev server.
          </p>
          <p className="rounded-md bg-pink-50 p-4 text-sm text-pink-800">{configError}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6">
        <div className="rounded-md border border-stone-300 bg-white p-8 text-center">
          <p className="font-medium text-gray-700">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return children;
}
