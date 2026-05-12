import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type FirestoreError,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { catalogProducts, productCategories, type CatalogProduct, type ProductCategory } from '@/data/catalog';
import { getFirebaseDb } from './firebase';

export const collectionNames = {
  admins: 'admins',
  blogPosts: 'blogPosts',
  carts: 'carts',
  categories: 'categories',
  giftOrders: 'giftOrders',
  newsletterSubscribers: 'newsletterSubscribers',
  orders: 'orders',
  payments: 'payments',
  products: 'products',
  subscriptions: 'subscriptions',
  users: 'users',
  wishlists: 'wishlists',
} as const;

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  categoryId: string;
  brand: string;
  variant: string;
  price: number | null;
  priceNote?: string;
  currency: CatalogProduct['currency'];
  quantity: number;
  image: string;
  addedAt?: unknown;
  updatedAt?: unknown;
};

export type CartSummary = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

export type OrderItem = Omit<CartItem, 'id' | 'addedAt' | 'updatedAt'>;

export type DeliveryDetails = {
  recipientName: string;
  phoneNumber: string;
  county: string;
  town: string;
  addressLine: string;
  landmark: string;
  deliveryNotes: string;
};

export type PaymentMethod = 'mpesa' | 'paypal' | 'card';

export type PaymentDetails = {
  method: PaymentMethod;
  mpesaPhone?: string;
  paypalEmail?: string;
};

export type PaymentStatus = 'pending' | 'successful' | 'failed';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export type OrderStatus = 'placed' | 'pending-payment' | 'paid' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';

export type DeliveryStatus = 'pending-dispatch' | 'preparing' | 'out-for-delivery' | 'delivered';
export type UserRole = 'customer' | 'admin';

export type UserProfile = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  deliveryDetails?: DeliveryDetails;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type NewsletterSubscriber = {
  email: string;
  source: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type BlogPostType = 'story' | 'product-guide' | 'discussion';

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  type: BlogPostType;
  authorId: string;
  authorName: string;
  authorEmail: string | null;
  videoUrl?: string;
  productTags: string[];
  status: 'published';
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type SubscriptionPlanInput = {
  planId: string;
  planName: string;
  amount: number | null;
  amountLabel: string;
  summary: string;
};

export type DummyPaymentResult = {
  orderId: string;
  paymentId: string;
};

export type OrderTotals = {
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type CustomerOrder = {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: CatalogProduct['currency'];
  deliveryType: 'parcel-delivery';
  deliveryStatus: DeliveryStatus;
  deliveryDetails: DeliveryDetails;
  paymentId?: string;
  paymentStatus?: PaymentStatus;
  payment: PaymentDetails & {
    label: string;
    status: PaymentStatus;
    paymentId?: string;
    receiptNumber?: string;
  };
  createdAt?: unknown;
  updatedAt?: unknown;
  paidAt?: unknown;
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  mpesa: 'M-Pesa',
  paypal: 'PayPal',
  card: 'Debit or credit card',
};

export type FirestoreCollections = {
  [collectionNames.admins]: {
    purpose: 'Marks app administrators who may manage catalog and order data.';
    documentId: 'Firebase Auth uid';
  };
  [collectionNames.blogPosts]: BlogPost;
  [collectionNames.categories]: ProductCategory;
  [collectionNames.products]: CatalogProduct;
  [collectionNames.users]: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    role: UserRole;
    deliveryDetails?: DeliveryDetails;
  };
  [collectionNames.carts]: {
    userId: string;
    status: 'active' | 'converted';
    items: 'subcollection: carts/{uid}/items/{productId}';
  };
  [collectionNames.orders]: {
    userId: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    currency: CatalogProduct['currency'];
    deliveryDetails: DeliveryDetails;
    payment: PaymentDetails & {
      label: string;
      status: PaymentStatus;
      paymentId?: string;
      receiptNumber?: string;
    };
  };
  [collectionNames.payments]: {
    userId: string;
    orderId: string;
    method: PaymentMethod;
    provider: 'daraja-dummy' | 'paypal-dummy' | 'card-dummy';
    status: PaymentStatus;
    amount: number;
    currency: CatalogProduct['currency'];
    phoneNumber?: string;
    payerEmail?: string;
    checkoutRequestId?: string;
    receiptNumber?: string;
  };
  [collectionNames.subscriptions]: {
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    planName?: string;
    amount?: number | null;
    paymentMethod?: PaymentMethod;
  };
  [collectionNames.giftOrders]: {
    userId: string;
    recipientName: string;
    status: 'placed' | 'pending-payment' | 'paid' | 'delivered';
  };
  [collectionNames.newsletterSubscribers]: {
    email: string;
    source: string;
  };
  [collectionNames.wishlists]: {
    userId: string;
    products: 'subcollection: wishlists/{uid}/items/{productId}';
  };
};

function sortCategories(categories: ProductCategory[]) {
  return [...categories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
}

function sortProducts(products: CatalogProduct[]) {
  return [...products].sort((a, b) => {
    if (a.categoryId !== b.categoryId) {
      const categoryA = productCategories.find((category) => category.id === a.categoryId)?.order ?? 999;
      const categoryB = productCategories.find((category) => category.id === b.categoryId)?.order ?? 999;
      return categoryA - categoryB;
    }

    return a.name.localeCompare(b.name);
  });
}

function sortBlogPosts(posts: BlogPost[]) {
  return [...posts].sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));
}

export function calculateOrderTotals(cart: CartSummary): OrderTotals {
  const deliveryFee = cart.itemCount === 0 || cart.subtotal >= 3500 ? 0 : 250;

  return {
    subtotal: cart.subtotal,
    deliveryFee,
    total: cart.subtotal + deliveryFee,
  };
}

export async function seedCatalogCollections() {
  const db = getFirebaseDb();
  const batch = writeBatch(db);

  productCategories.forEach((category) => {
    batch.set(
      doc(db, collectionNames.categories, category.id),
      {
        ...category,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  catalogProducts.forEach((product) => {
    batch.set(
      doc(db, collectionNames.products, product.id),
      {
        ...product,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  });

  await batch.commit();

  return {
    categories: productCategories.length,
    products: catalogProducts.length,
  };
}

export async function fetchCategories() {
  const snapshot = await getDocs(collection(getFirebaseDb(), collectionNames.categories));
  const categories = snapshot.docs.map((categoryDoc) => categoryDoc.data() as ProductCategory);
  return categories.length > 0 ? sortCategories(categories) : productCategories;
}

export async function fetchProducts() {
  const snapshot = await getDocs(collection(getFirebaseDb(), collectionNames.products));
  const products = snapshot.docs.map((productDoc) => productDoc.data() as CatalogProduct);
  return products.length > 0 ? sortProducts(products.filter((product) => product.isActive !== false)) : catalogProducts;
}

export function subscribeToProducts(
  onProducts: (products: CatalogProduct[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(getFirebaseDb(), collectionNames.products)),
    (snapshot) => {
      const products = snapshot.docs.map((productDoc) => productDoc.data() as CatalogProduct);
      onProducts(products.length > 0 ? sortProducts(products.filter((product) => product.isActive !== false)) : catalogProducts);
    },
    onError,
  );
}

export function subscribeToCategories(
  onCategories: (categories: ProductCategory[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(getFirebaseDb(), collectionNames.categories)),
    (snapshot) => {
      const categories = snapshot.docs.map((categoryDoc) => categoryDoc.data() as ProductCategory);
      onCategories(categories.length > 0 ? sortCategories(categories) : productCategories);
    },
    onError,
  );
}

export async function isUserAdmin(userId: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), collectionNames.admins, userId));
  return snapshot.exists();
}

export async function fetchUserProfile(userId: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), collectionNames.users, userId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    uid: userId,
    ...(snapshot.data() as Omit<UserProfile, 'uid'>),
  };
}

export async function upsertUserProfile(user: FirebaseUser, role: UserRole = 'customer') {
  const existingProfile = await fetchUserProfile(user.uid);
  const nextRole: UserRole = role === 'admin' || existingProfile?.role === 'admin' ? 'admin' : 'customer';

  await setDoc(
    doc(getFirebaseDb(), collectionNames.users, user.uid),
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      role: nextRole,
      createdAt: existingProfile?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function fetchUserDeliveryDetails(userId: string) {
  const snapshot = await getDoc(doc(getFirebaseDb(), collectionNames.users, userId));

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<FirestoreCollections[typeof collectionNames.users]>;
  return data.deliveryDetails ?? null;
}

export async function saveUserDeliveryDetails(userId: string, deliveryDetails: DeliveryDetails) {
  await setDoc(
    doc(getFirebaseDb(), collectionNames.users, userId),
    {
      deliveryDetails,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function addProductToCart(userId: string, product: CatalogProduct, quantity = 1) {
  const db = getFirebaseDb();
  const cartRef = doc(db, collectionNames.carts, userId);
  const cartItemRef = doc(db, collectionNames.carts, userId, 'items', product.id);
  const cartItemData: Record<string, unknown> = {
    productId: product.id,
    productName: product.name,
    categoryId: product.categoryId,
    brand: product.brand,
    variant: product.variant,
    price: product.price,
    currency: product.currency,
    quantity: increment(quantity),
    image: product.image,
    updatedAt: serverTimestamp(),
  };

  if (product.priceNote !== undefined) {
    cartItemData.priceNote = product.priceNote;
  }

  await setDoc(
    cartRef,
    {
      userId,
      status: 'active',
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await setDoc(
    cartItemRef,
    cartItemData,
    { merge: true },
  );
}

export function subscribeToCart(
  userId: string,
  onCart: (summary: CartSummary) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), collectionNames.carts, userId, 'items'),
    (snapshot) => {
      const items = snapshot.docs.map((itemDoc) => ({
        id: itemDoc.id,
        ...(itemDoc.data() as Omit<CartItem, 'id'>),
      }));

      onCart({
        items,
        itemCount: items.reduce((total, item) => total + item.quantity, 0),
        subtotal: items.reduce((total, item) => total + (item.price ?? 0) * item.quantity, 0),
      });
    },
    onError,
  );
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  const itemRef = doc(getFirebaseDb(), collectionNames.carts, userId, 'items', productId);

  if (quantity <= 0) {
    await deleteDoc(itemRef);
    return;
  }

  await updateDoc(itemRef, {
    quantity,
    updatedAt: serverTimestamp(),
  });
}

export async function createOrderFromCart(
  userId: string,
  cart: CartSummary,
  deliveryDetails: DeliveryDetails,
  paymentDetails: PaymentDetails,
): Promise<DummyPaymentResult> {
  if (cart.items.length === 0) {
    throw new Error('Cannot create an order from an empty cart.');
  }

  const orderItems: OrderItem[] = cart.items.map((item) => {
    const orderItem: OrderItem = {
      productId: item.productId,
      productName: item.productName,
      categoryId: item.categoryId,
      brand: item.brand,
      variant: item.variant,
      price: item.price,
      currency: item.currency,
      quantity: item.quantity,
      image: item.image,
    };

    if (item.priceNote !== undefined) {
      orderItem.priceNote = item.priceNote;
    }

    return orderItem;
  });
  const db = getFirebaseDb();
  const totals = calculateOrderTotals(cart);
  const providerByMethod: Record<PaymentMethod, FirestoreCollections[typeof collectionNames.payments]['provider']> = {
    mpesa: 'daraja-dummy',
    paypal: 'paypal-dummy',
    card: 'card-dummy',
  };
  const orderRef = doc(collection(db, collectionNames.orders));
  const paymentRef = doc(collection(db, collectionNames.payments));
  const payment: FirestoreCollections[typeof collectionNames.orders]['payment'] = {
    ...paymentDetails,
    label: paymentMethodLabels[paymentDetails.method],
    status: 'pending',
    paymentId: paymentRef.id,
  };
  const paymentData: Record<string, unknown> = {
    userId,
    orderId: orderRef.id,
    method: paymentDetails.method,
    methodLabel: paymentMethodLabels[paymentDetails.method],
    provider: providerByMethod[paymentDetails.method],
    status: 'pending',
    amount: totals.total,
    currency: 'KES',
    checkoutRequestId: `DUMMY-${Date.now()}`,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (paymentDetails.mpesaPhone) {
    paymentData.phoneNumber = paymentDetails.mpesaPhone;
  }

  if (paymentDetails.paypalEmail) {
    paymentData.payerEmail = paymentDetails.paypalEmail;
  }

  const cartRef = doc(db, collectionNames.carts, userId);
  const cartItemsSnapshot = await getDocs(collection(db, collectionNames.carts, userId, 'items'));
  const batch = writeBatch(db);

  batch.set(orderRef, {
    userId,
    status: 'pending-payment',
    items: orderItems,
    itemCount: cart.itemCount,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    currency: 'KES',
    deliveryType: 'parcel-delivery',
    deliveryStatus: 'pending-dispatch',
    deliveryDetails,
    payment,
    paymentId: paymentRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(paymentRef, paymentData);

  cartItemsSnapshot.docs.forEach((itemDoc) => {
    batch.delete(itemDoc.ref);
  });

  batch.set(
    cartRef,
    {
      status: 'converted',
      lastOrderId: orderRef.id,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();

  return {
    orderId: orderRef.id,
    paymentId: paymentRef.id,
  };
}

export async function completeDummyPayment(orderId: string, paymentId: string) {
  const db = getFirebaseDb();
  const paymentRef = doc(db, collectionNames.payments, paymentId);
  const orderRef = doc(db, collectionNames.orders, orderId);
  const receiptNumber = `BB${Date.now().toString().slice(-8)}`;
  const batch = writeBatch(db);

  batch.update(paymentRef, {
    status: 'successful',
    receiptNumber,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.update(orderRef, {
    status: 'paid',
    paymentStatus: 'successful',
    'payment.status': 'successful',
    'payment.receiptNumber': receiptNumber,
    paidAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return receiptNumber;
}

export async function createCardSubscription(
  user: FirebaseUser,
  plan: SubscriptionPlanInput,
  card: {
    holderName: string;
    brand: string;
    last4: string;
    expiry: string;
  },
) {
  const db = getFirebaseDb();
  const subscriptionRef = doc(collection(db, collectionNames.subscriptions));
  const paymentRef = doc(collection(db, collectionNames.payments));
  const now = new Date();
  const nextBillingAt = new Date(now);
  nextBillingAt.setMonth(nextBillingAt.getMonth() + 1);
  const amount = plan.amount ?? 0;
  const batch = writeBatch(db);

  batch.set(subscriptionRef, {
    userId: user.uid,
    planId: plan.planId,
    planName: plan.planName,
    planSummary: plan.summary,
    status: 'active',
    amount: plan.amount,
    amountLabel: plan.amountLabel,
    currency: 'KES',
    interval: 'monthly',
    paymentMethod: 'card',
    card: {
      holderName: card.holderName,
      brand: card.brand,
      last4: card.last4,
      expiry: card.expiry,
    },
    startedAt: serverTimestamp(),
    nextBillingAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  batch.set(paymentRef, {
    userId: user.uid,
    subscriptionId: subscriptionRef.id,
    method: 'card',
    methodLabel: paymentMethodLabels.card,
    provider: 'card-dummy',
    status: 'successful',
    amount,
    currency: 'KES',
    receiptNumber: `SUB${Date.now().toString().slice(-8)}`,
    paidAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return subscriptionRef.id;
}

function getTimestampMillis(value: unknown) {
  if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  return 0;
}

export function subscribeToUserOrders(
  userId: string,
  onOrders: (orders: CustomerOrder[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    query(collection(getFirebaseDb(), collectionNames.orders), where('userId', '==', userId)),
    (snapshot) => {
      const orders = snapshot.docs
        .map((orderDoc) => ({
          id: orderDoc.id,
          ...(orderDoc.data() as Omit<CustomerOrder, 'id'>),
        }))
        .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));

      onOrders(orders);
    },
    onError,
  );
}

export function subscribeToAllOrders(
  onOrders: (orders: CustomerOrder[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), collectionNames.orders),
    (snapshot) => {
      const orders = snapshot.docs
        .map((orderDoc) => ({
          id: orderDoc.id,
          ...(orderDoc.data() as Omit<CustomerOrder, 'id'>),
        }))
        .sort((a, b) => getTimestampMillis(b.createdAt) - getTimestampMillis(a.createdAt));

      onOrders(orders);
    },
    onError,
  );
}

export function subscribeToBlogPosts(
  onPosts: (posts: BlogPost[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), collectionNames.blogPosts),
    (snapshot) => {
      const posts = snapshot.docs
        .map((postDoc) => ({
          id: postDoc.id,
          ...(postDoc.data() as Omit<BlogPost, 'id'>),
        }))
        .filter((post) => post.status === 'published');

      onPosts(sortBlogPosts(posts));
    },
    onError,
  );
}

export async function createBlogPost(
  user: FirebaseUser,
  post: {
    title: string;
    excerpt: string;
    body: string;
    type: BlogPostType;
    productTags: string[];
    videoUrl?: string;
  },
) {
  const postRef = doc(collection(getFirebaseDb(), collectionNames.blogPosts));

  await setDoc(postRef, {
    ...post,
    authorId: user.uid,
    authorName: user.displayName || user.email || 'BloomBox community member',
    authorEmail: user.email,
    status: 'published',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToOrder(
  orderId: string,
  onOrder: (order: CustomerOrder | null) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    doc(getFirebaseDb(), collectionNames.orders, orderId),
    (snapshot) => {
      onOrder(snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() as Omit<CustomerOrder, 'id'>) } : null);
    },
    onError,
  );
}

export function subscribeToAllUsers(
  onUsers: (users: UserProfile[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), collectionNames.users),
    (snapshot) => {
      const users = snapshot.docs
        .map((userDoc) => ({
          uid: userDoc.id,
          ...(userDoc.data() as Omit<UserProfile, 'uid'>),
        }))
        .sort((a, b) => {
          if (a.role !== b.role) return a.role === 'admin' ? -1 : 1;
          return (a.email ?? '').localeCompare(b.email ?? '');
        });

      onUsers(users);
    },
    onError,
  );
}

export function subscribeToAdminProducts(
  onProducts: (products: CatalogProduct[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), collectionNames.products),
    (snapshot) => {
      const products = snapshot.docs.map((productDoc) => productDoc.data() as CatalogProduct);
      onProducts(products.length > 0 ? sortProducts(products) : catalogProducts);
    },
    onError,
  );
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const deliveryStatusByOrderStatus: Partial<Record<OrderStatus, DeliveryStatus>> = {
    preparing: 'preparing',
    'out-for-delivery': 'out-for-delivery',
    delivered: 'delivered',
  };
  const deliveryStatus = deliveryStatusByOrderStatus[status];
  const updates: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
  };

  if (deliveryStatus) {
    updates.deliveryStatus = deliveryStatus;
  }

  await updateDoc(doc(getFirebaseDb(), collectionNames.orders, orderId), updates);
}

export async function updateProductStatus(productId: string, isActive: boolean) {
  await updateDoc(doc(getFirebaseDb(), collectionNames.products, productId), {
    isActive,
    updatedAt: serverTimestamp(),
  });
}

export async function saveProduct(product: CatalogProduct) {
  await setDoc(
    doc(getFirebaseDb(), collectionNames.products, product.id),
    {
      ...product,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateUserRole(user: UserProfile, role: UserRole) {
  const db = getFirebaseDb();
  const userRef = doc(db, collectionNames.users, user.uid);
  const adminRef = doc(db, collectionNames.admins, user.uid);
  const batch = writeBatch(db);

  batch.set(
    userRef,
    {
      role,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  if (role === 'admin') {
    batch.set(
      adminRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: 'admin',
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    batch.delete(adminRef);
  }

  await batch.commit();
}

export function subscribeToNewsletterSubscribers(
  onSubscribers: (subscribers: NewsletterSubscriber[]) => void,
  onError?: (error: FirestoreError) => void,
): Unsubscribe {
  return onSnapshot(
    collection(getFirebaseDb(), collectionNames.newsletterSubscribers),
    (snapshot) => {
      const subscribers = snapshot.docs
        .map((subscriberDoc) => ({
          email: subscriberDoc.id,
          ...(subscriberDoc.data() as Omit<NewsletterSubscriber, 'email'>),
        }))
        .sort((a, b) => getTimestampMillis(b.updatedAt) - getTimestampMillis(a.updatedAt));

      onSubscribers(subscribers);
    },
    onError,
  );
}

export async function subscribeToNewsletter(email: string, source = 'website-footer') {
  const normalizedEmail = email.trim().toLowerCase();

  await setDoc(
    doc(getFirebaseDb(), collectionNames.newsletterSubscribers, normalizedEmail),
    {
      email: normalizedEmail,
      source,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
