'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { PasswordField } from './PasswordField';

const features = [
  {
    label: 'Monthly Care Packages',
    color: 'text-rose-700',
    path: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  },
  {
    label: 'Thoughtful Gifting',
    color: 'text-pink-700',
    path: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    label: 'Community Support',
    color: 'text-yellow-700',
    path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    label: 'Cultural Heritage',
    color: 'text-orange-700',
    path: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];

function BrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-[#e85d5a] lg:flex lg:w-1/2">
      <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <div className="mb-8 flex items-center justify-center">
            <div className="relative mr-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white">
              <Image src="/bloom1.png" alt="BloomBox Flower" fill className="object-cover" priority />
            </div>
            <span className="font-serif text-2xl font-bold text-white">BloomBox</span>
          </div>

          <h1 className="mb-4 text-center font-serif text-4xl font-bold">Celebrating Womanhood</h1>
          <p className="mb-10 text-center text-lg opacity-90">
            Where we honor every woman&apos;s journey with care, love, and cultural heritage.
          </p>

          <div className="grid grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.label} className="flex items-center">
                <div className="mr-3 rounded-lg border border-white bg-white p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${feature.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={feature.path} />
                  </svg>
                </div>
                <span>{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { configError, isConfigured, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!isConfigured) {
      setError('Firebase needs your web app config before sign in can work.');
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setNotice('');

    if (!isConfigured) {
      setError('Firebase needs your web app config before Google sign in can work.');
      return;
    }

    setIsGoogleSubmitting(true);

    try {
      await setPersistence(getFirebaseAuth(), rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      router.push('/dashboard');
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setIsGoogleSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setError('');
    setNotice('');

    if (!isConfigured) {
      setError('Firebase needs your web app config before password reset can work.');
      return;
    }

    if (!email.trim()) {
      setError('Enter your email address first, then request a password reset.');
      return;
    }

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      setNotice('Password reset email sent. Check your inbox.');
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
    }
  };

  return (
    <div className="flex min-h-screen">
      <BrandPanel />

      <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                <Image src="/bloom1.png" alt="BloomBox Flower" fill className="object-cover" priority />
              </div>
            </div>
            <h1 className="mb-2 font-serif text-3xl font-bold text-gray-900">Welcome to BloomBox</h1>
            <p className="text-gray-600">Sign in to access your account</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
            {configError ? (
              <p className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm leading-6 text-yellow-900">
                Add the missing Firebase web config in <span className="font-mono">.env.local</span>: {configError}
              </p>
            ) : null}

            {error ? (
              <p className="mb-5 rounded-lg border border-pink-200 bg-pink-50 p-4 text-sm leading-6 text-pink-800">{error}</p>
            ) : null}

            {notice ? (
              <p className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800">{notice}</p>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black transition duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="you@example.com"
                />
              </div>

              <PasswordField
                label="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Enter your password"
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="ml-2">Remember me</span>
                </label>

                <button type="button" onClick={handlePasswordReset} className="text-sm font-medium text-orange-600 transition-colors duration-200 hover:text-orange-500">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isConfigured}
                className="flex w-full justify-center rounded-lg border border-transparent bg-orange-500 px-4 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-pink-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleSubmitting || !isConfigured}
                className="mt-6 inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isGoogleSubmitting ? 'Opening Google...' : 'Sign in with Google'}
              </button>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-[#e85d5a] transition-colors duration-200 hover:text-rose-700">
              Sign up
            </Link>
          </p>

          <p className="mt-6 text-center text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
