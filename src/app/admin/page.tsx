'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  saveProduct,
  subscribeToAdminProducts,
  subscribeToAllOrders,
  subscribeToAllUsers,
  subscribeToNewsletterSubscribers,
  updateProductStatus,
  updateUserRole,
  type CustomerOrder,
  type NewsletterSubscriber,
  type OrderStatus,
  type UserProfile,
  type UserRole,
} from '@/lib/firestore';
import { getFirebaseAuth, getFirebaseStorage } from '@/lib/firebase';
import { productCategories, type CatalogProduct, type StockStatus } from '@/data/catalog';
import { useAuth } from '../components/AuthProvider';

type AdminSection = 'overview' | 'orders' | 'products' | 'customers' | 'subscribers' | 'access';
type IconName = 'chart' | 'orders' | 'products' | 'users' | 'mail' | 'shield';
type ProductFormState = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  variant: string;
  categoryId: string;
  description: string;
  price: string;
  priceNote: string;
  stockStatus: StockStatus;
  image: string;
  badge: string;
  featured: boolean;
  isActive: boolean;
  tags: string;
  rating: string;
  reviewCount: string;
};

const emptyProductForm: ProductFormState = {
  id: '',
  sku: '',
  name: '',
  brand: 'BloomBox',
  variant: '',
  categoryId: productCategories[0]?.id ?? 'pads',
  description: '',
  price: '',
  priceNote: '',
  stockStatus: 'available',
  image: '',
  badge: '',
  featured: false,
  isActive: true,
  tags: '',
  rating: '4.8',
  reviewCount: '0',
};

function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function getDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return 'Not dated';
}

function getOrderStatusLabel(status: OrderStatus) {
  if (status === 'pending-payment') return 'Awaiting payment';
  if (status === 'out-for-delivery') return 'Out for delivery';
  return status.replaceAll('-', ' ');
}

function getStatusStyle(status: OrderStatus) {
  if (status === 'delivered') return 'border-emerald-700 bg-emerald-50 text-emerald-800';
  if (status === 'out-for-delivery') return 'border-[#006a65] bg-[#e7fbf8] text-[#00504c]';
  if (status === 'paid' || status === 'preparing') return 'border-[#FFC857] bg-[#fff8df] text-[#76574e]';
  if (status === 'cancelled') return 'border-stone-400 bg-stone-100 text-stone-700';
  return 'border-[#e0bfbd] bg-[#fff5f0] text-[#8c1520]';
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makeKeywords(...values: string[]) {
  return values
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function isLocalImagePath(value: string) {
  const trimmedValue = value.trim();
  return /^[a-zA-Z]:[\\/]/.test(trimmedValue) || trimmedValue.startsWith('file:') || trimmedValue.startsWith('\\\\');
}

function getUploadErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? String(error.code) : '';
  const message = error instanceof Error ? error.message : 'Could not upload this product image.';

  if (code.includes('unauthorized') || message.toLowerCase().includes('unauthorized')) {
    return 'Firebase blocked the image upload. Make sure Storage rules are deployed and this signed-in account is an admin.';
  }

  if (code.includes('bucket-not-found') || message.toLowerCase().includes('bucket')) {
    return 'Firebase Storage bucket could not be found. Check NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET in Vercel and .env.local.';
  }

  return message;
}

function getCustomerName(order: CustomerOrder, users: UserProfile[]) {
  const user = users.find((item) => item.uid === order.userId);
  return user?.displayName || user?.email || order.deliveryDetails?.recipientName || 'Customer';
}

function productToForm(product: CatalogProduct): ProductFormState {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    brand: product.brand,
    variant: product.variant,
    categoryId: product.categoryId,
    description: product.description,
    price: product.price === null ? '' : String(product.price),
    priceNote: product.priceNote ?? '',
    stockStatus: product.stockStatus,
    image: product.image,
    badge: product.badge ?? '',
    featured: product.featured,
    isActive: product.isActive,
    tags: product.tags.join(', '),
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
  };
}

function buildProduct(form: ProductFormState, image: string): CatalogProduct {
  const category = productCategories.find((item) => item.id === form.categoryId) ?? productCategories[0];
  const id = form.id.trim() || slugify(`${form.brand}-${form.name || form.variant || category.name}`);
  const price = form.price.trim() ? Number(form.price) : null;
  const tags = form.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    id,
    sku: form.sku.trim() || `BB-${id.toUpperCase()}`,
    name: form.name.trim(),
    brand: form.brand.trim() || 'BloomBox',
    variant: form.variant.trim() || 'Regular',
    categoryId: category.id,
    categoryName: category.name,
    description: form.description.trim(),
    price: Number.isFinite(price) ? price : null,
    ...(form.priceNote.trim() ? { priceNote: form.priceNote.trim() } : {}),
    currency: 'KES',
    stockStatus: form.stockStatus,
    image: image || '/bloom1.png',
    color: category.color,
    ...(form.badge.trim() ? { badge: form.badge.trim() } : {}),
    featured: form.featured,
    rating: Number(form.rating) || 4.8,
    reviewCount: Number(form.reviewCount) || 0,
    tags: tags.length > 0 ? tags : [category.name, form.brand, form.variant].filter(Boolean),
    searchKeywords: makeKeywords(category.name, form.brand, form.variant, form.name, form.description, form.tags),
    isActive: form.isActive,
  };
}

function AdminIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    chart: 'M4 19V5m0 14h16M8 16V9m4 7V7m4 9v-5',
    orders: 'M7 7h10M7 12h10M7 17h6M5 3h14v18H5z',
    products: 'M4 7l8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10',
    users: 'M16 19v-1a4 4 0 0 0-8 0v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6 8v-1a3 3 0 0 0-2-2.83M18 7a3 3 0 0 1 0 6',
    mail: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
    shield: 'M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z',
  };

  return (
    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d={paths[name]} />
    </svg>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get('section');
    const validSections: AdminSection[] = ['overview', 'orders', 'products', 'customers', 'subscribers', 'access'];

    if (validSections.includes(section as AdminSection)) {
      setActiveSection(section as AdminSection);
    }
  }, []);

  useEffect(() => {
    const unsubscribers = [
      subscribeToAllOrders(setOrders, (ordersError) => setError(`Orders could not load: ${ordersError.message}`)),
      subscribeToAdminProducts(setProducts, (productsError) => setError(`Products could not load: ${productsError.message}`)),
      subscribeToAllUsers(setUsers, (usersError) => setError(`Customers could not load: ${usersError.message}`)),
      subscribeToNewsletterSubscribers(setSubscribers, (subscribersError) => setError(`Subscribers could not load: ${subscribersError.message}`)),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  const metrics = useMemo(() => {
    const paidOrders = orders.filter((order) => ['paid', 'preparing', 'out-for-delivery', 'delivered'].includes(order.status));
    const revenue = paidOrders.reduce((sum, order) => sum + (order.total ?? 0), 0);
    const activeOrders = orders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length;
    const activeProducts = products.filter((product) => product.isActive !== false).length;
    const admins = users.filter((profile) => profile.role === 'admin').length;

    return { revenue, activeOrders, activeProducts, admins, subscribers: subscribers.length };
  }, [orders, products, users, subscribers]);

  const recentOrders = orders.slice(0, 5);
  const draftProducts = products.filter((product) => product.isActive === false).slice(0, 5);
  const imagePreview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : productForm.image), [imageFile, productForm.image]);

  useEffect(() => {
    if (!imagePreview.startsWith('blob:')) return undefined;

    return () => URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const setFormField = (field: keyof ProductFormState, value: string | boolean) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const resetProductForm = () => {
    setProductForm(emptyProductForm);
    setImageFile(null);
    setIsEditingProduct(false);
  };

  const editProduct = (product: CatalogProduct) => {
    setProductForm(productToForm(product));
    setImageFile(null);
    setIsEditingProduct(true);
    setActiveSection('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadImage = async (productId: string) => {
    const typedImage = productForm.image.trim();

    if (!imageFile && isLocalImagePath(typedImage)) {
      throw new Error('Local computer paths cannot be used on the website. Choose the image with Upload image so it can be saved online.');
    }

    if (!imageFile) return typedImage;

    if (!imageFile.type.startsWith('image/')) {
      throw new Error('Choose a valid image file for this product.');
    }

    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Product images must be smaller than 5MB.');
    }

    const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const storageRef = ref(getFirebaseStorage(), `product-images/${productId}-${Date.now()}-${safeName}`);
    await uploadBytes(storageRef, imageFile, { contentType: imageFile.type });
    return getDownloadURL(storageRef);
  };

  const submitProduct = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');

    if (!productForm.name.trim()) {
      setError('Product name is required.');
      return;
    }

    if (!productForm.description.trim()) {
      setError('Product description is required.');
      return;
    }

    const productId = productForm.id.trim() || slugify(`${productForm.brand}-${productForm.name}-${productForm.variant}`);
    setUpdatingId(productId);

    try {
      const image = await uploadImage(productId);
      const product = buildProduct({ ...productForm, id: productId }, image);
      await saveProduct(product);
      setNotice(`${product.name} has been ${isEditingProduct ? 'updated' : 'added'} in the catalog.`);
      resetProductForm();
    } catch (productError) {
      setError(getUploadErrorMessage(productError));
    } finally {
      setUpdatingId('');
    }
  };

  const toggleProduct = async (product: CatalogProduct) => {
    setError('');
    setNotice('');
    setUpdatingId(product.id);

    try {
      await updateProductStatus(product.id, product.isActive === false);
      setNotice(`${product.name} is now ${product.isActive === false ? 'visible' : 'hidden'} in the shop.`);
    } catch (productError) {
      setError(productError instanceof Error ? productError.message : 'Could not update product.');
    } finally {
      setUpdatingId('');
    }
  };

  const changeUserRole = async (profile: UserProfile, role: UserRole) => {
    if (profile.uid === user?.uid) {
      setError('You cannot change your own admin role while signed in.');
      return;
    }

    setError('');
    setNotice('');
    setUpdatingId(profile.uid);

    try {
      await updateUserRole(profile, role);
      setNotice(`${profile.email ?? profile.displayName ?? 'User'} is now a ${role}.`);
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : 'Could not update this user role.');
    } finally {
      setUpdatingId('');
    }
  };

  const handleSignOut = async () => {
    await signOut(getFirebaseAuth());
  };

  const navigation: { id: AdminSection; label: string; detail: string; icon: IconName }[] = [
    { id: 'overview', label: 'Overview', detail: 'Metrics and activity', icon: 'chart' },
    { id: 'orders', label: 'Orders', detail: 'Delivery workflow', icon: 'orders' },
    { id: 'products', label: 'Products', detail: 'Catalog and images', icon: 'products' },
    { id: 'customers', label: 'Customers', detail: 'Users and roles', icon: 'users' },
    { id: 'subscribers', label: 'Subscribers', detail: 'Community emails', icon: 'mail' },
    { id: 'access', label: 'Access', detail: 'Permissions model', icon: 'shield' },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-stone-300 bg-[#14090c] text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col px-4 py-4">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <span className="relative h-9 w-9 overflow-hidden rounded-full border border-white/30 bg-white">
              <Image src="/bloom1.png" alt="BloomBox" fill sizes="44px" className="object-cover" priority />
            </span>
            <div>
              <p className="text-base font-bold">BloomBox</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#fed4c8]">Admin portal</p>
            </div>
          </div>

          <nav className="mt-5 grid gap-1">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 px-2 py-2 text-left transition ${
                  activeSection === item.id ? 'bg-white/10 text-[#fed4c8]' : 'text-stone-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <AdminIcon name={item.icon} />
                <span className="min-w-0">
                  <span className="block text-[15px] font-semibold leading-5">{item.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-stone-400">{item.detail}</span>
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-auto border-t border-white/10 pt-4">
            <p className="text-[10px] uppercase tracking-[0.14em] text-stone-400">Signed in</p>
            <p className="mt-1 break-all text-xs text-[#fed4c8]">{user?.email ?? 'Admin'}</p>
            <div className="mt-4 grid gap-1">
              <Link href="/dashboard" className="px-2 py-2 text-sm font-semibold text-stone-300 hover:bg-white/5 hover:text-white">
                View site
              </Link>
              <button type="button" onClick={handleSignOut} className="px-2 py-2 text-left text-sm font-semibold text-stone-300 hover:bg-white/5 hover:text-white">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-w-0">
        <section className="border-b border-stone-300 bg-white px-4 py-3 sm:px-6">
          <div className="w-full">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Back office</p>
            <div className="mt-1 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
              <div>
                <h1 className="font-serif text-3xl font-semibold leading-tight">Run BloomBox operations.</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-[#584140]">
                  Manage orders, product catalog, customer roles, and the work that keeps every parcel moving.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetProductForm();
                    setActiveSection('products');
                  }}
                  className="w-fit bg-[#ae2f34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c1520]"
                >
                  Add product
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-fit border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]"
                >
                  Log out
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full px-4 py-5 sm:px-6">
          {error ? <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div> : null}
          {notice ? <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div> : null}

          {activeSection === 'overview' ? (
            <div className="grid gap-5">
              <div className="grid border-y border-stone-300 bg-white sm:grid-cols-2 xl:grid-cols-4">
                {[
                  ['Orders', orders.length, 'All customer orders'],
                  ['Active orders', metrics.activeOrders, 'Still need action'],
                  ['Live products', metrics.activeProducts, 'Visible in shop'],
                  ['Subscribers', metrics.subscribers, 'Community emails'],
                ].map(([label, value, detail], index) => (
                  <div key={label} className={`px-4 py-3 ${index < 3 ? 'border-b border-stone-200 sm:border-r xl:border-b-0' : ''}`}>
                    <p className="text-2xl font-semibold text-[#ae2f34]">{value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">{label}</p>
                    <p className="mt-1 text-xs text-stone-500">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
                <div className="grid gap-5">
                  <section className="bg-white">
                    <div className="mb-3 flex items-center justify-between gap-4 border-b border-stone-300 pb-2">
                      <div>
                        <h2 className="text-lg font-semibold">Operations queue</h2>
                        <p className="mt-0.5 text-sm text-stone-500">A quick scan of what needs movement.</p>
                      </div>
                      <button type="button" onClick={() => setActiveSection('orders')} className="text-xs font-semibold text-[#ae2f34]">
                        Open orders
                      </button>
                    </div>
                    <div className="grid border-y border-stone-200 sm:grid-cols-4">
                      {[
                        ['Awaiting', orders.filter((order) => ['placed', 'pending-payment'].includes(order.status)).length],
                        ['Preparing', orders.filter((order) => ['paid', 'preparing'].includes(order.status)).length],
                        ['Out', orders.filter((order) => order.status === 'out-for-delivery').length],
                        ['Done', orders.filter((order) => order.status === 'delivered').length],
                      ].map(([label, value], index) => (
                        <div key={label} className={`px-3 py-3 ${index < 3 ? 'border-b border-stone-200 sm:border-b-0 sm:border-r' : ''}`}>
                          <p className="text-xl font-semibold text-[#ae2f34]">{value}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white">
                    <div className="mb-2 flex items-center justify-between gap-4 border-b border-stone-300 pb-2">
                      <div>
                        <h2 className="text-lg font-semibold">Recent orders</h2>
                        <p className="mt-0.5 text-sm text-stone-500">Newest orders with direct view access.</p>
                      </div>
                      <button type="button" onClick={() => setActiveSection('orders')} className="text-xs font-semibold text-[#ae2f34]">
                        Manage
                      </button>
                    </div>
                    <div className="divide-y divide-stone-200 border-b border-stone-200">
                      {recentOrders.length === 0 ? <p className="py-3 text-sm text-stone-600">No orders yet.</p> : null}
                      {recentOrders.map((order, index) => (
                        <div key={order.id} className="grid gap-3 py-3 md:grid-cols-[40px_1fr_auto_auto] md:items-center">
                          <p className="text-sm font-semibold text-stone-500">{index + 1}</p>
                          <div>
                            <p className="text-[15px] font-semibold">#{order.id.slice(0, 10)} / {getCustomerName(order, users)}</p>
                            <p className="mt-0.5 text-sm text-stone-500">{getDate(order.createdAt)} / {order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
                          </div>
                          <span className={`w-fit border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusStyle(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                          <Link href={`/admin/orders/${order.id}`} className="w-fit bg-[#ae2f34] px-3 py-2 text-sm font-semibold text-white hover:bg-[#8c1520]">
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <aside className="grid gap-4">
                  <section className="border-l-4 border-[#ae2f34] bg-[#fff5f0] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Paid value</p>
                    <p className="mt-2 font-serif text-3xl font-semibold">{money(metrics.revenue)}</p>
                    <p className="mt-2 text-xs leading-5 text-[#584140]">Revenue counts paid, preparing, dispatched, and delivered orders.</p>
                  </section>

                  <section className="bg-white">
                    <div className="border-b border-stone-300 pb-2">
                      <h2 className="text-base font-semibold">Catalog health</h2>
                      <p className="mt-0.5 text-sm text-stone-500">{products.length} products tracked.</p>
                    </div>
                    <div className="divide-y divide-stone-200">
                      <div className="flex justify-between py-2 text-sm">
                        <span className="text-stone-600">Live products</span>
                        <span className="font-semibold text-[#ae2f34]">{metrics.activeProducts}</span>
                      </div>
                      <div className="flex justify-between py-2 text-sm">
                        <span className="text-stone-600">Hidden products</span>
                        <span className="font-semibold text-[#ae2f34]">{draftProducts.length}</span>
                      </div>
                      <button type="button" onClick={() => setActiveSection('products')} className="py-2 text-sm font-semibold text-[#ae2f34]">
                        Review products
                      </button>
                    </div>
                  </section>

                  <section className="bg-white">
                    <div className="border-b border-stone-300 pb-2">
                      <h2 className="text-base font-semibold">People</h2>
                      <p className="mt-0.5 text-sm text-stone-500">Customers, admins, and newsletter audience.</p>
                    </div>
                    <div className="grid grid-cols-3 divide-x divide-stone-200 border-b border-stone-200">
                      <button type="button" onClick={() => setActiveSection('customers')} className="px-2 py-3 text-left">
                        <p className="text-lg font-semibold text-[#ae2f34]">{users.length}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-stone-500">Users</p>
                      </button>
                      <button type="button" onClick={() => setActiveSection('customers')} className="px-2 py-3 text-left">
                        <p className="text-lg font-semibold text-[#ae2f34]">{metrics.admins}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-stone-500">Admins</p>
                      </button>
                      <button type="button" onClick={() => setActiveSection('subscribers')} className="px-2 py-3 text-left">
                        <p className="text-lg font-semibold text-[#ae2f34]">{metrics.subscribers}</p>
                        <p className="text-[10px] uppercase tracking-[0.12em] text-stone-500">Emails</p>
                      </button>
                    </div>
                  </section>
                </aside>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ['Add product', 'Create a new shop item with images, pricing, tags, and visibility.', 'products'],
                  ['Review roles', 'Promote trusted users to admin or return them to customer access.', 'customers'],
                  ['Open subscribers', 'See the emails collected from the BloomBox community form.', 'subscribers'],
                ].map(([title, text, section]) => (
                  <button
                    key={title}
                    type="button"
                    onClick={() => {
                      if (section === 'products') resetProductForm();
                      setActiveSection(section as AdminSection);
                    }}
                    className="bg-white px-4 py-3 text-left hover:bg-[#fff5f0]"
                  >
                    <h3 className="text-base font-semibold text-stone-950">{title}</h3>
                    <p className="mt-1 text-sm leading-5 text-stone-600">{text}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {activeSection === 'orders' ? (
            <div className="grid gap-4">
              <div className="flex items-end justify-between border-b border-stone-300 pb-2">
                <div>
                  <h2 className="text-lg font-semibold">Orders</h2>
                  <p className="mt-0.5 text-sm text-stone-500">{orders.length} total records arranged for dispatch work</p>
                </div>
              </div>

              <div className="grid border-y border-stone-300 bg-white sm:grid-cols-4">
                {[
                  ['Awaiting', orders.filter((order) => ['placed', 'pending-payment'].includes(order.status)).length],
                  ['Preparing', orders.filter((order) => ['paid', 'preparing'].includes(order.status)).length],
                  ['On the road', orders.filter((order) => order.status === 'out-for-delivery').length],
                  ['Delivered', orders.filter((order) => order.status === 'delivered').length],
                ].map(([label, value], index) => (
                  <div key={label} className={`px-3 py-2 ${index < 3 ? 'border-b border-stone-200 sm:border-b-0 sm:border-r' : ''}`}>
                    <p className="text-xl font-semibold text-[#ae2f34]">{value}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</p>
                  </div>
                ))}
              </div>

              {orders.length === 0 ? <div className="border-y border-stone-300 bg-white p-5 text-sm text-stone-600">No orders have been placed yet.</div> : null}

              {orders.length > 0 ? (
                <div className="border-y border-stone-300 bg-white">
                  <div className="hidden grid-cols-[56px_150px_1fr_1fr_120px_150px_90px] gap-4 border-b border-stone-300 bg-[#fff5f0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#584140] xl:grid">
                    <span>No.</span>
                    <span>Order</span>
                    <span>Customer</span>
                    <span>Delivery</span>
                    <span>Total</span>
                    <span>Status</span>
                    <span>Action</span>
                  </div>
                  {orders.map((order, index) => (
                    <article key={order.id} className="grid gap-3 border-b border-stone-200 px-3 py-3 last:border-b-0 xl:grid-cols-[56px_150px_1fr_1fr_120px_150px_90px] xl:items-center xl:gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 xl:hidden">No.</p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">{index + 1}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 xl:hidden">Order</p>
                        <h3 className="mt-1 text-[15px] font-semibold text-stone-950">#{order.id.slice(0, 10)}</h3>
                        <p className="mt-1 text-xs text-stone-500">{getDate(order.createdAt)}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 xl:hidden">Customer</p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">{getCustomerName(order, users)}</p>
                        <p className="mt-1 text-sm text-stone-600">{order.deliveryDetails?.phoneNumber ?? 'No phone'}</p>
                        <p className="mt-1 text-xs text-stone-500">{order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 xl:hidden">Delivery</p>
                        <p className="mt-1 text-sm font-semibold text-stone-950">{order.deliveryDetails?.recipientName ?? 'Recipient not saved'}</p>
                        <p className="mt-1 line-clamp-1 text-sm leading-5 text-stone-600">{[order.deliveryDetails?.town, order.deliveryDetails?.county].filter(Boolean).join(', ') || 'No address saved'}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 xl:hidden">Total</p>
                        <p className="mt-1 text-sm font-semibold text-[#8c1520]">{money(order.total ?? 0)}</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className={`w-fit border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusStyle(order.status)}`}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>

                      <div>
                        <Link href={`/admin/orders/${order.id}`} className="inline-flex bg-[#ae2f34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c1520]">
                          View
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {activeSection === 'products' ? (
            <div className="grid gap-7 xl:grid-cols-[420px_1fr]">
              <form onSubmit={submitProduct} className="border border-stone-300 bg-white p-5 xl:sticky xl:top-6 xl:self-start">
                <div className="mb-5 border-b border-stone-200 pb-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">{isEditingProduct ? 'Edit product' : 'New product'}</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold">{isEditingProduct ? productForm.name : 'Add catalog item'}</h2>
                </div>

                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm font-semibold text-stone-700">
                    Product name
                    <input value={productForm.name} onChange={(event) => setFormField('name', event.target.value)} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-stone-700">
                      Brand
                      <input value={productForm.brand} onChange={(event) => setFormField('brand', event.target.value)} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-stone-700">
                      Variant
                      <input value={productForm.variant} onChange={(event) => setFormField('variant', event.target.value)} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-stone-700">
                      Category
                      <select value={productForm.categoryId} onChange={(event) => setFormField('categoryId', event.target.value)} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100">
                        {productCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-stone-700">
                      Status
                      <select value={productForm.stockStatus} onChange={(event) => setFormField('stockStatus', event.target.value as StockStatus)} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100">
                        <option value="available">Available</option>
                        <option value="on-demand">On demand</option>
                        <option value="pending-price">Pending price</option>
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-semibold text-stone-700">
                    Description
                    <textarea value={productForm.description} onChange={(event) => setFormField('description', event.target.value)} rows={4} className="resize-none border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-stone-700">
                      Price
                      <input value={productForm.price} onChange={(event) => setFormField('price', event.target.value)} inputMode="numeric" placeholder="e.g. 850" className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-stone-700">
                      Price note
                      <input value={productForm.priceNote} onChange={(event) => setFormField('priceNote', event.target.value)} placeholder="From KSh..." className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-semibold text-stone-700">
                    Hosted image URL
                    <input value={productForm.image} onChange={(event) => setFormField('image', event.target.value)} placeholder="/products/item.jpg or https://..." className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                    <span className="text-xs font-normal leading-5 text-stone-500">Use this only for an image already online. For a photo from your computer, use Upload image.</span>
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-stone-700">
                    Upload image from this computer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const nextFile = event.target.files?.[0] ?? null;
                        setImageFile(nextFile);
                        setError('');
                      }}
                      className="border border-stone-300 bg-white px-3 py-2 text-sm font-normal"
                    />
                    <span className="text-xs font-normal leading-5 text-stone-500">Choose a JPG, PNG, or WebP under 5MB. It uploads to Firebase Storage when you save.</span>
                  </label>

                  {imagePreview ? (
                    <div className="overflow-hidden border border-stone-300 bg-stone-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Product preview" className="h-44 w-full object-cover" />
                      {imageFile ? (
                        <div className="border-t border-stone-300 bg-white px-3 py-2 text-xs text-stone-600">
                          Selected from this computer: <span className="font-semibold text-stone-900">{imageFile.name}</span>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-stone-700">
                      Badge
                      <input value={productForm.badge} onChange={(event) => setFormField('badge', event.target.value)} placeholder="NEW" className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-stone-700">
                      Tags
                      <input value={productForm.tags} onChange={(event) => setFormField('tags', event.target.value)} placeholder="pads, comfort" className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100" />
                    </label>
                  </div>

                  <div className="grid gap-3 border border-[#e0bfbd] bg-[#fff5f0] p-4">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#584140]">
                      <input type="checkbox" checked={productForm.featured} onChange={(event) => setFormField('featured', event.target.checked)} className="h-4 w-4 accent-[#ae2f34]" />
                      Featured product
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#584140]">
                      <input type="checkbox" checked={productForm.isActive} onChange={(event) => setFormField('isActive', event.target.checked)} className="h-4 w-4 accent-[#ae2f34]" />
                      Visible in shop
                    </label>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button type="submit" disabled={Boolean(updatingId)} className="flex-1 bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-60">
                      {updatingId ? 'Saving...' : isEditingProduct ? 'Save changes' : 'Add product'}
                    </button>
                    <button type="button" onClick={resetProductForm} className="border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]">
                      Clear
                    </button>
                  </div>
                </div>
              </form>

              <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {products.map((product) => (
                  <article key={product.id} className={`border bg-white ${product.isActive === false ? 'border-stone-200 opacity-75' : 'border-stone-300'}`}>
                    <div className="relative aspect-[4/3] bg-stone-100">
                      <Image src={product.image || '/bloom1.png'} alt={product.name} fill sizes="(min-width: 1280px) 33vw, 100vw" className="object-cover" />
                      <span className="absolute left-4 top-4 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#ae2f34]">
                        {product.isActive === false ? 'Hidden' : 'Live'}
                      </span>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{product.categoryName}</p>
                      <h2 className="mt-2 text-lg font-semibold leading-6">{product.name}</h2>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => editProduct(product)} className="border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]">
                          Edit
                        </button>
                        <button type="button" disabled={updatingId === product.id} onClick={() => toggleProduct(product)} className="border border-[#ae2f34] px-4 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#ae2f34] hover:text-white disabled:opacity-60">
                          {product.isActive === false ? 'Show' : 'Hide'}
                        </button>
                        <span className="ml-auto font-semibold text-[#ae2f34]">{product.price === null ? product.priceNote ?? 'Price pending' : money(product.price)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          {activeSection === 'customers' ? (
            <div className="bg-white">
              <div className="mb-3 flex items-end justify-between border-b border-stone-300 pb-2">
                <div>
                  <h2 className="text-lg font-semibold">Customers</h2>
                  <p className="mt-0.5 text-sm text-stone-500">{users.length} users / {metrics.admins} admins</p>
                </div>
              </div>
              <div className="grid grid-cols-[1.2fr_0.7fr_0.7fr] border-b border-stone-300 bg-[#fff5f0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#584140]">
                <span>User</span>
                <span>Role</span>
                <span>Delivery</span>
              </div>
              {users.map((profile) => (
                <div key={profile.uid} className="grid grid-cols-[1.2fr_0.7fr_0.7fr] gap-3 border-b border-stone-200 px-3 py-2.5 text-sm last:border-b-0">
                  <div>
                    <p className="font-semibold text-stone-950">{profile.displayName || profile.email || 'Unnamed user'}</p>
                    <p className="mt-1 text-xs text-stone-500">{profile.email ?? profile.uid}</p>
                  </div>
                  <div>
                    <select
                      value={profile.role}
                      onChange={(event) => changeUserRole(profile, event.target.value as UserRole)}
                      disabled={updatingId === profile.uid || profile.uid === user?.uid}
                      className={`w-full border-0 bg-transparent px-0 py-1 text-xs font-semibold uppercase tracking-[0.12em] outline-none focus:text-[#ae2f34] disabled:cursor-not-allowed disabled:opacity-60 ${
                        profile.role === 'admin' ? 'text-[#8c1520]' : 'text-stone-600'
                      }`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                    {profile.uid === user?.uid ? <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-stone-400">Current session</p> : null}
                  </div>
                    <p className="text-sm text-stone-600">{profile.deliveryDetails?.town ? `${profile.deliveryDetails.town}, ${profile.deliveryDetails.county}` : 'Not saved'}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeSection === 'subscribers' ? (
            <div className="bg-white">
              <div className="mb-3 flex items-end justify-between border-b border-stone-300 pb-2">
                <div>
                  <h2 className="text-lg font-semibold">Subscribers</h2>
                  <p className="mt-0.5 text-sm text-stone-500">{subscribers.length} community emails</p>
                </div>
              </div>
              <div className="grid grid-cols-[1.3fr_0.8fr_0.7fr] border-b border-stone-300 bg-[#fff5f0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#584140]">
                <span>Email</span>
                <span>Source</span>
                <span>Joined</span>
              </div>
              {subscribers.length === 0 ? (
                <div className="border-b border-stone-200 px-3 py-5 text-sm text-stone-600">No newsletter subscribers yet.</div>
              ) : null}
              {subscribers.map((subscriber) => (
                <div key={subscriber.email} className="grid grid-cols-[1.3fr_0.8fr_0.7fr] gap-3 border-b border-stone-200 px-3 py-2.5 text-sm last:border-b-0">
                  <div>
                    <p className="break-all font-semibold text-stone-950">{subscriber.email}</p>
                    <p className="mt-1 text-xs text-stone-500">Saved to community list</p>
                  </div>
                  <p className="text-sm text-stone-600">{subscriber.source || 'website'}</p>
                  <p className="text-sm text-stone-600">{getDate(subscriber.updatedAt ?? subscriber.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : null}

          {activeSection === 'access' ? (
            <div className="grid gap-5 lg:grid-cols-[1fr_0.75fr]">
              <section className="bg-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Admin actions</p>
                <h2 className="mt-2 text-lg font-semibold">What admins can do</h2>
                <div className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
                  {[
                    'View all orders and delivery details.',
                    'Move orders from payment to preparation, dispatch, delivery, or cancellation.',
                    'Add new catalog products with uploaded or linked images.',
                    'Edit product copy, price, category, status, tags, and storefront visibility.',
                    'Promote users to admin or return them to customer access.',
                    'Review customers and saved delivery coverage.',
                  ].map((item) => (
                    <div key={item} className="py-2.5 text-sm text-stone-700">{item}</div>
                  ))}
                </div>
              </section>

              <aside className="border-l-4 border-[#ae2f34] bg-[#fff5f0] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Access model</p>
                <h2 className="mt-2 text-base font-semibold">Roles are backed by Firestore.</h2>
                <p className="mt-3 text-sm leading-5 text-[#584140]">
                  The visible role lives on <span className="font-mono">users/uid.role</span>. Real admin permission is backed by <span className="font-mono">admins/uid</span>, which keeps customers from self-promoting.
                </p>
                <p className="mt-3 text-sm leading-5 text-[#584140]">
                  Product image upload uses Firebase Storage. If uploads fail, check Storage rules for admin write access or paste an existing public image path into the image field.
                </p>
              </aside>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
