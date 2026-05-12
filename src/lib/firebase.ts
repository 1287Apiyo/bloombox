import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const cleanEnv = (value: string | undefined) => {
  return value && value.trim().length > 0 ? value : undefined;
};

const projectId = cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) ?? 'bloombox-b2e8c';

export const firebaseConfig: FirebaseOptions = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) ?? `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) ?? `${projectId}.firebasestorage.app`,
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) ?? '844049518776',
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  measurementId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID),
};

const requiredConfig: Array<[keyof FirebaseOptions, string]> = [
  ['apiKey', 'NEXT_PUBLIC_FIREBASE_API_KEY'],
  ['authDomain', 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'],
  ['projectId', 'NEXT_PUBLIC_FIREBASE_PROJECT_ID'],
  ['appId', 'NEXT_PUBLIC_FIREBASE_APP_ID'],
];

export const missingFirebaseConfig = requiredConfig
  .filter(([configKey]) => !firebaseConfig[configKey])
  .map(([, envKey]) => envKey);

export const isFirebaseConfigured = missingFirebaseConfig.length === 0;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseApp() {
  if (!isFirebaseConfigured) {
    throw new Error(`Firebase is missing: ${missingFirebaseConfig.join(', ')}`);
  }

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return app;
}

export function getFirebaseAuth() {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }

  return auth;
}

export function getFirebaseDb() {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }

  return db;
}

export function getFirebaseStorage() {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }

  return storage;
}
