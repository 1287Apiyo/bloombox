'use client';

import { useState, type InputHTMLAttributes } from 'react';

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
};

export function PasswordField({ label, className = '', ...props }: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className={`block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-black transition duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 transition hover:bg-orange-50 hover:text-orange-600"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 3l18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 4.24A9.9 9.9 0 0 1 12 4c5 0 8.5 4.5 9.5 8a11.7 11.7 0 0 1-2.1 3.7M6.1 6.1C4.35 7.45 3.15 9.55 2.5 12c1 3.5 4.5 8 9.5 8 1.55 0 2.95-.43 4.16-1.12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M2.5 12S6 4 12 4s9.5 8 9.5 8S18 20 12 20s-9.5-8-9.5-8z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
