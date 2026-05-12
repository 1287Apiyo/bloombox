'use client';

// src/app/page.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './components/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading) return;

    router.replace(user ? '/dashboard' : '/login');
  }, [loading, router, user]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6 text-stone-700">
      <p className="text-sm font-semibold">Loading BloomBox...</p>
    </main>
  );
}
