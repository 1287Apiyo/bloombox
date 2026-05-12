'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured, missingFirebaseConfig } from '@/lib/firebase';
import { upsertUserProfile } from '@/lib/firestore';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  configError: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setConfigError(`Firebase config missing: ${missingFirebaseConfig.join(', ')}`);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      (currentUser) => {
        setUser(currentUser);
        setConfigError(null);
        setLoading(false);

        if (currentUser) {
          upsertUserProfile(currentUser).catch((error) => {
            console.warn('Unable to sync user profile', error);
          });
        }
      },
      (error) => {
        setConfigError(error.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isConfigured: isFirebaseConfigured,
      configError,
    }),
    [configError, loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
