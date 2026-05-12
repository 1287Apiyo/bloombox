'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { useAuth } from './AuthProvider';

export function DashboardAccountButton() {
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setError('');
    setIsSigningOut(true);

    try {
      await signOut(getFirebaseAuth());
      router.push('/login');
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setIsSigningOut(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded-md bg-rose-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-950 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSigningOut ? 'Signing out...' : user?.displayName ? `Hi, ${user.displayName.split(' ')[0]} - Sign out` : 'Sign out'}
      </button>
      {error ? (
        <p className="absolute right-0 top-12 w-64 rounded-md border border-red-100 bg-red-50 p-3 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
