import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore';

const root = process.cwd();

async function loadEnvFile() {
  const envPath = path.join(root, '.env.local');

  try {
    const file = await fs.readFile(envPath, 'utf8');

    file.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) {
        return;
      }

      const equalsIndex = trimmed.indexOf('=');

      if (equalsIndex === -1) {
        return;
      }

      const key = trimmed.slice(0, equalsIndex).trim();
      const value = trimmed.slice(equalsIndex + 1).trim();

      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
  } catch {
    // The explicit environment can still be used in CI.
  }
}

function requiredEnv(key) {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing ${key}. Add it to .env.local or your shell environment.`);
  }

  return value;
}

async function loadCatalog() {
  const catalogPath = path.join(root, 'src', 'data', 'catalog.ts');
  const source = await fs.readFile(catalogPath, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ES2022,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const tempPath = path.join(os.tmpdir(), `bloombox-catalog-${Date.now()}.mjs`);

  await fs.writeFile(tempPath, transpiled, 'utf8');

  try {
    return await import(pathToFileURL(tempPath).href);
  } finally {
    await fs.rm(tempPath, { force: true });
  }
}

await loadEnvFile();

const firebaseConfig = {
  apiKey: requiredEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: requiredEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: requiredEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (process.env.FIREBASE_SEED_EMAIL && process.env.FIREBASE_SEED_PASSWORD) {
  await signInWithEmailAndPassword(auth, process.env.FIREBASE_SEED_EMAIL, process.env.FIREBASE_SEED_PASSWORD);
  console.log(`Signed in as ${process.env.FIREBASE_SEED_EMAIL}`);
} else {
  console.log('No FIREBASE_SEED_EMAIL/FIREBASE_SEED_PASSWORD found. Attempting seed without auth.');
}

const { productCategories, catalogProducts } = await loadCatalog();
const batch = writeBatch(db);

productCategories.forEach((category) => {
  batch.set(
    doc(db, 'categories', category.id),
    {
      ...category,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
});

catalogProducts.forEach((product) => {
  batch.set(
    doc(db, 'products', product.id),
    {
      ...product,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
});

await batch.commit();

console.log(`Seeded ${productCategories.length} categories and ${catalogProducts.length} products.`);
