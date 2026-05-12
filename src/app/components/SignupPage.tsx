'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { getFirebaseAuth } from '@/lib/firebase';
import { AuthShell } from './AuthShell';
import { useAuth } from './AuthProvider';
import { PasswordField } from './PasswordField';

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function SignupPage() {
  const { configError, isConfigured, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const nextPath = searchParams.get('next');
      const safeNextPath = nextPath?.startsWith('/') ? nextPath : null;
      router.push(safeNextPath ?? '/dashboard');
    }
  }, [router, searchParams, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!isConfigured) {
      setError('Firebase needs the BloomBox web app config before sign up can work.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Please make sure both passwords match.');
      return;
    }

    if (!acceptedTerms) {
      setError('Please accept the terms before creating your account.');
      return;
    }

    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);

      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() });
      }

      const nextPath = searchParams.get('next');
      const safeNextPath = nextPath?.startsWith('/') ? nextPath : null;
      router.push(safeNextPath ?? '/dashboard');
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');

    if (!isConfigured) {
      setError('Firebase needs the BloomBox web app config before Google sign up can work.');
      return;
    }

    setIsGoogleSubmitting(true);

    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      const nextPath = searchParams.get('next');
      const safeNextPath = nextPath?.startsWith('/') ? nextPath : null;
      router.push(safeNextPath ?? '/dashboard');
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Join BloomBox"
      title="Create an account that carries the care forward."
      text="Save the essentials, delivery details, and gifting choices that make each BloomBox easier to send next time."
      image="/mockups/bloombox-open-box.png"
      imageAlt="Open BloomBox care package"
      panelTitle="Built for repeat care."
      panelText="Your account keeps the practical parts close, from reusable carts to delivery and order history."
      details={['Reusable carts', 'Saved delivery', 'Order history', 'Payment records']}
    >
      <div className="mb-7 border-b border-stone-200 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Start your care flow</p>
        <h2 className="mt-3 font-serif text-4xl font-semibold text-[#191c1d]">Create account</h2>
        <p className="mt-2 text-sm leading-6 text-[#584140]">Keep shopping, gifting, and subscriptions connected.</p>
      </div>

      {configError ? (
        <p className="mb-5 border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Firebase config is missing: {configError}
        </p>
      ) : null}

      {error ? (
        <p className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</p>
      ) : null}

      <button
        type="button"
        onClick={handleGoogleSignup}
        disabled={isGoogleSubmitting || !isConfigured}
        className="inline-flex w-full items-center justify-center gap-3 border border-stone-300 bg-white px-4 py-3 text-sm font-semibold text-stone-800 transition hover:border-[#ae2f34] hover:bg-[#fff5f0] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark />
        {isGoogleSubmitting ? 'Opening Google...' : 'Continue with Google'}
      </button>

      <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
        <span className="h-px bg-stone-200" />
        <span>Email</span>
        <span className="h-px bg-stone-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Full name</label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="block w-full border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none transition focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-700">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="block w-full border border-stone-300 bg-white px-4 py-3 text-stone-950 outline-none transition focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100"
            placeholder="you@example.com"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            placeholder="6+ characters"
          />

          <PasswordField
            label="Confirm"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={6}
            placeholder="Repeat"
          />
        </div>

        <label className="flex items-start gap-3 border border-[#e0bfbd] bg-[#fff5f0] p-4 text-sm leading-6 text-[#584140]">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(event) => setAcceptedTerms(event.target.checked)}
            className="mt-1 h-4 w-4 border-stone-300 text-[#ae2f34] focus:ring-[#ae2f34]"
          />
          <span>I agree to the BloomBox Terms of Service and Privacy Policy.</span>
        </label>

        <button
          type="submit"
          disabled={isSubmitting || !isConfigured}
          className="flex w-full justify-center bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520] focus:outline-none focus:ring-2 focus:ring-[#fed4c8] disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-stone-600">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#ae2f34] transition hover:text-[#8c1520]">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
