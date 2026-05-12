'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured, missingFirebaseConfig } from '@/lib/firebase';
import { isUserAdmin, upsertUserProfile, type UserRole } from '@/lib/firestore';

type AuthContextValue = {
  user: User | null;
  role: UserRole;
  isAdmin: boolean;
  loading: boolean;
  isConfigured: boolean;
  configError: string | null;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (!isFirebaseConfigured) {
      setConfigError(`Firebase config missing: ${missingFirebaseConfig.join(', ')}`);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      getFirebaseAuth(),
      async (currentUser) => {
        if (!currentUser) {
          if (!cancelled) {
            setUser(null);
            setRole('customer');
            setConfigError(null);
            setLoading(false);
          }
          return;
        }

        try {
          const admin = await isUserAdmin(currentUser.uid);
          const nextRole: UserRole = admin ? 'admin' : 'customer';
          await upsertUserProfile(currentUser, nextRole);

          if (!cancelled) {
            setUser(currentUser);
            setRole(nextRole);
            setConfigError(null);
            setLoading(false);
          }
        } catch (error) {
          console.warn('Unable to sync user profile', error);

          if (!cancelled) {
            setUser(currentUser);
            setRole('customer');
            setConfigError(null);
            setLoading(false);
          }
        }
      },
      (error) => {
        setConfigError(error.message);
        setLoading(false);
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      isAdmin: role === 'admin',
      loading,
      isConfigured: isFirebaseConfigured,
      configError,
    }),
    [configError, loading, role, user],
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
