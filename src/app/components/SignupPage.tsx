'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithPopup, updateProfile } from 'firebase/auth';
import { getAuthErrorMessage } from '@/lib/authErrors';
import { getFirebaseAuth } from '@/lib/firebase';
import { useAuth } from './AuthProvider';
import { PasswordField } from './PasswordField';

const signupFeatures = [
  'Saved delivery details',
  'Reusable carts',
  'Order tracking',
  'Payment records',
];

export default function SignupPage() {
  const { configError, isConfigured, user } = useAuth();
  const router = useRouter();
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
      router.push('/dashboard');
    }
  }, [router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!isConfigured) {
      setError('Firebase needs your web app config before sign up can work.');
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

      router.push('/dashboard');
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');

    if (!isConfigured) {
      setError('Firebase needs your web app config before Google sign up can work.');
      return;
    }

    setIsGoogleSubmitting(true);

    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
      router.push('/dashboard');
    } catch (authError) {
      setError(getAuthErrorMessage(authError));
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden overflow-hidden bg-[#e85d5a] lg:flex lg:w-1/2">
        <div className="relative z-10 flex w-full flex-col items-center justify-center p-12 text-white">
          <div className="max-w-md">
            <div className="mb-8 flex items-center justify-center">
              <div className="relative mr-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white">
                <Image src="/bloom1.png" alt="BloomBox Flower" fill className="object-cover" priority />
              </div>
              <span className="font-serif text-2xl font-bold text-white">BloomBox</span>
            </div>

            <h1 className="mb-4 text-center font-serif text-4xl font-bold">Start Your Care Journey</h1>
            <p className="mb-10 text-center text-lg opacity-90">
              Keep the products, parcels, and payment details that make checkout feel easy.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {signupFeatures.map((feature) => (
                <div key={feature} className="rounded-lg border border-white bg-white p-4 text-center text-sm font-medium text-rose-800">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-gray-50 p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <div className="mb-6 flex justify-center lg:hidden">
              <div className="relative h-20 w-20 overflow-hidden rounded-full">
                <Image src="/bloom1.png" alt="BloomBox Flower" fill className="object-cover" priority />
              </div>
            </div>
            <h1 className="mb-2 font-serif text-3xl font-bold text-gray-900">Create your BloomBox account</h1>
            <p className="text-gray-600">Sign up to save your cart, orders, and delivery details</p>
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

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={isGoogleSubmitting || !isConfigured}
              className="inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {isGoogleSubmitting ? 'Opening Google...' : 'Sign up with Google'}
            </button>

            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or use email</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-black transition duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500"
                  placeholder="Your name"
                />
              </div>

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

              <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span>I agree to the BloomBox Terms of Service and Privacy Policy.</span>
              </label>

              <button
                type="submit"
                disabled={isSubmitting || !isConfigured}
                className="flex w-full justify-center rounded-lg border border-transparent bg-[#e85d5a] px-4 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-[#e85d5a] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-orange-600 transition-colors duration-200 hover:text-orange-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
