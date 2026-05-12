This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Firebase Authentication

This app uses Firebase Auth for email/password accounts, Google sign-in, password reset, and protected dashboard access.

1. In Firebase, open **Project settings > General > Your apps** and add a Web app for BloomBox.
2. Copy the Firebase web config values into `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=bloombox-b2e8c.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=bloombox-b2e8c
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=bloombox-b2e8c.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=844049518776
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

3. In **Authentication > Sign-in method**, enable **Email/Password** and **Google**.
4. In **Authentication > Settings > Authorized domains**, make sure `localhost` is allowed for local development and add your production domain before launch.
5. Restart the dev server after changing `.env.local`.

## Firestore Collections

The app is set up around these Firestore collections:

- `admins`: user ids that can manage catalog/order data.
- `categories`: product categories shown in the shop filters.
- `products`: catalog items, prices, variants, badges, and stock states.
- `users`: customer profiles synced from Firebase Auth.
- `carts/{uid}/items`: signed-in customer carts.
- `orders`: draft and paid customer orders.
- `subscriptions`: customer subscription records.
- `giftOrders`: gift checkout records.
- `wishlists/{uid}/items`: saved customer products.
- `newsletterSubscribers`: newsletter signups.

To seed the product catalog:

1. Sign up in the app with an email/password account.
2. In Firebase Authentication, copy that user UID.
3. In Firestore, create `admins/{uid}` for that UID. Any fields are fine, for example `{ "role": "admin" }`.
4. Add these local-only seed credentials to `.env.local`:

```bash
FIREBASE_SEED_EMAIL=your-admin-email
FIREBASE_SEED_PASSWORD=your-admin-password
```

5. Deploy or paste the rules from `firestore.rules`, then run:

```bash
npm run seed:firestore
```

This creates the `categories` and `products` documents from `src/data/catalog.ts`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
