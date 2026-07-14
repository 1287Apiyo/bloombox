'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { deleteDoc, doc, getFirestore } from 'firebase/firestore';
import { getFirebaseAuth } from '@/lib/firebase';
import {
  saveProduct,
  subscribeToAdminProducts,
  subscribeToAllOrders,
  subscribeToAllUsers,
  subscribeToAllSubscriptions,
  subscribeToAllCycleProfiles,
  subscribeToNewsletterSubscribers,
  subscribeToLeads,
  subscribeToPartnerInquiries,
  subscribeToInventoryMovements,
  recordInventoryMovement,
  updateUserRole,
  updateOrderStatus,
  updateLeadStage,
  updatePartnerInquiryStatus,
  type CustomerOrder,
  type CustomerSubscription,
  type NewsletterSubscriber,
  type OrderStatus,
  type UserProfile,
  type UserRole,
  type CycleProfile,
  type SalesLead,
  type PartnerInquiry,
  type PartnerInquiryStatus,
  type InventoryMovement,
  type InventoryMovementType,
} from '@/lib/firestore';
import { productCategories, type CatalogProduct, type StockStatus } from '@/data/catalog';
import { useAuth } from '../components/AuthProvider';
import { getNextPeriodDate } from '@/lib/cycle';

// ─── Helpers ───────────────────────────────────────────────

const inputCls =
  'w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm font-normal outline-none transition focus:border-[#a23b35] focus:ring-1 focus:ring-[#a23b35]';

type AdminSection =
  | 'overview'
  | 'orders'
  | 'order-detail'
  | 'upcoming'
  | 'products'
  | 'customers'
  | 'subscribers'
  | 'access'
  | 'inventory'
  | 'leads'
  | 'partners'
  | 'ai-assist';

type IconName = 'chart' | 'orders' | 'products' | 'users' | 'mail' | 'shield' | 'box' | 'handshake' | 'sparkles' | 'calendar';

// ─── Order item type (used for typed flatMap callbacks) ──────
type OrderItem = NonNullable<CustomerOrder['items']>[0];

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
  const labels: Record<OrderStatus, string> = {
    'pending-payment': 'Awaiting',
    'paid': 'Paid',
    'preparing': 'Pending',
    'out-for-delivery': 'Out for delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'placed': 'Placed',
  };
  return labels[status] || status;
}

function getStatusButtonStyle(status: OrderStatus) {
  const styles: Record<OrderStatus, string> = {
    'pending-payment': 'bg-[#a23b35] text-white',
    'paid': 'bg-green-600 text-white',
    'preparing': 'bg-yellow-500 text-white',
    'out-for-delivery': 'bg-sky-600 text-white',
    'delivered': 'bg-emerald-600 text-white',
    'cancelled': 'bg-gray-500 text-white',
    'placed': 'bg-blue-600 text-white',
  };
  return styles[status] || 'bg-gray-500 text-white';
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateUniqueProductId(baseId: string, existingProducts: CatalogProduct[], currentId = '') {
  if (currentId && currentId === baseId) return baseId;

  let candidate = baseId;
  let counter = 2;

  while (existingProducts.some((product) => product.id === candidate && product.id !== currentId)) {
    candidate = `${baseId}-${counter}`;
    counter += 1;
  }

  return candidate;
}

const adminSections: AdminSection[] = [
  'overview',
  'orders',
  'order-detail',
  'upcoming',
  'products',
  'customers',
  'subscribers',
  'access',
  'inventory',
  'leads',
  'partners',
  'ai-assist',
];

function makeKeywords(...values: string[]) {
  return values
    .join(' ')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function isLocalImagePath(value: string) {
  const trimmed = value.trim();
  return /^[a-zA-Z]:[\\/]/.test(trimmed) || trimmed.startsWith('file:') || trimmed.startsWith('\\\\');
}

function getUploadErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : 'Could not process this product image.';
  return message;
}
function fileToDataUrl(file: File, maxWidth = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read the image file.'));
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('The chosen file is not a valid image.'));
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
function getCustomerName(order: CustomerOrder, users: UserProfile[]) {
  const user = users.find((item) => item.uid === order.userId);
  return user?.displayName || user?.email || order.deliveryDetails?.recipientName || 'Customer';
}

function getCustomerLocation(order: CustomerOrder) {
  const town = order.deliveryDetails?.town || '';
  const county = order.deliveryDetails?.county || '';
  return [town, county].filter(Boolean).join(', ') || '—';
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

// ─── Types ──────────────────────────────────────────────────

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

// ─── Constants ──────────────────────────────────────────────

const paidStatuses = ['paid', 'preparing', 'out-for-delivery', 'delivered'];

// ─── Components ─────────────────────────────────────────────

function AdminIcon({ name, className = '' }: { name: IconName; className?: string }) {
  const paths: Record<IconName, string> = {
    chart: 'M4 19V5m0 14h16M8 16V9m4 7V7m4 9v-5',
    orders: 'M7 7h10M7 12h10M7 17h6M5 3h14v18H5z',
    products: 'M4 7l8-4 8 4-8 4-8-4Zm0 0v10l8 4 8-4V7M12 11v10',
    users: 'M16 19v-1a4 4 0 0 0-8 0v1M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm6 8v-1a3 3 0 0 0-2-2.83M18 7a3 3 0 0 1 0 6',
    mail: 'M4 6h16v12H4V6Zm0 1 8 6 8-6',
    shield: 'M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z',
    box: 'M20 7l-8-4-8 4 8 4 8-4Zm0 0v10l-8 4-8-4V7M12 11v10',
    handshake: 'M17 12l-4 4-4-4M7 12h10M4 8h16M4 16h16',
    sparkles: 'M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z',
    calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  };

  return (
    <svg className={`h-5 w-5 shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={paths[name]} />
    </svg>
  );
}

function Sidebar({
  activeSection,
  setActiveSection,
  metrics,
  user,
  onSignOut,
}: {
  activeSection: AdminSection;
  setActiveSection: (s: AdminSection) => void;
  metrics: { activeOrders: number; activeProducts: number; subscribers: number; leads: number; partners: number };
  user: { email?: string | null } | null;
  onSignOut: () => void;
}) {
  const navigation: { id: AdminSection; label: string; icon: IconName; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'orders', label: 'Orders', icon: 'orders', count: metrics.activeOrders },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar' },
    { id: 'products', label: 'Products', icon: 'products', count: metrics.activeProducts },
    { id: 'customers', label: 'Customers', icon: 'users' },
    { id: 'subscribers', label: 'Subscribers', icon: 'mail', count: metrics.subscribers },
    { id: 'inventory', label: 'Inventory', icon: 'box' },
    { id: 'leads', label: 'Leads', icon: 'users', count: metrics.leads },
    { id: 'partners', label: 'Partners', icon: 'handshake', count: metrics.partners },
    { id: 'ai-assist', label: 'AI Assist', icon: 'sparkles' },
    { id: 'access', label: 'Access', icon: 'shield' },
  ];

  return (
    <aside className="bg-black text-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-white/10">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4 sm:px-6 sm:py-5">
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20">
            <Image src="/bloom1.png" alt="BloomBox" fill sizes="32px" className="object-cover" priority />
          </span>
          <div>
            <p className="text-base font-semibold leading-tight text-white">BloomBox</p>
            <p className="text-[10px] uppercase tracking-widest text-white/50">Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="bb-mobile-scroll mt-2 flex gap-1 px-3 py-2 lg:mt-4 lg:grid lg:overflow-visible lg:px-4" aria-label="Admin navigation">
          {navigation.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex shrink-0 items-center gap-2 px-3 py-2 text-left text-sm transition-colors lg:w-full lg:gap-3 lg:px-4 lg:py-2.5 ${
                  isActive
                    ? 'border border-[#a23b35] bg-white/10 text-white lg:border-l-4 lg:border-[#a23b35] lg:border-y-0 lg:border-r-0 lg:pl-3'
                    : 'border border-transparent text-white/70 hover:bg-white/10 hover:text-white lg:border-l-4 lg:border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <AdminIcon name={item.icon} className={isActive ? 'text-[#a23b35]' : 'text-white/50'} />
                <span className="whitespace-nowrap font-medium lg:flex-1">{item.label}</span>
                {item.count !== undefined ? (
                  <span className={`text-xs tabular-nums ${isActive ? 'text-white/90' : 'text-white/40'}`}>
                    {item.count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-white/10 px-4 py-4 sm:px-6">
          <p className="truncate text-sm font-medium text-white/80">{user?.email ?? 'Admin'}</p>
          <div className="mt-2 flex flex-wrap gap-4">
            <Link href="/dashboard" className="text-sm text-[#a23b35] hover:underline">
              View site
            </Link>
            <button type="button" onClick={onSignOut} className="text-sm text-white/50 hover:text-white">
              Log out
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionHeader({ section, desc }: { section: AdminSection; desc: string }) {
  const labels: Record<AdminSection, string> = {
    overview: 'Overview',
    orders: 'Orders',
    'order-detail': 'Order Details',
    upcoming: 'Upcoming Prep',
    products: 'Products',
    customers: 'Customers',
    subscribers: 'Subscribers',
    access: 'Access',
    inventory: 'Inventory',
    leads: 'Leads',
    partners: 'Partners',
    'ai-assist': 'AI Assist',
  };
  return (
    <div className="border-b border-black/10 pb-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">{labels[section]}</h1>
        <p className="mt-1 text-sm text-black/60">{desc}</p>
      </div>
    </div>
  );
}

// ─── Overview Sections ──────────────────────────────────────

function MetricsCards({ orders, activeOrders, activeProducts, subscribers }: any) {
  const items = [
    ['Total orders', orders.length],
    ['Active orders', activeOrders],
    ['Live products', activeProducts],
    ['Subscribers', subscribers],
  ];
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label as string} className="border border-black/10 rounded-md p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-black/50">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-black">{value}</p>
        </div>
      ))}
    </div>
  );
}

function RecentOrders({ orders, users, onViewAll, onSelectOrder }: any) {
  const recent = orders.slice(0, 8);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-3">
        <p className="text-xs font-medium uppercase tracking-wider text-black/50">Recent orders</p>
        <button type="button" onClick={onViewAll} className="text-sm font-medium text-[#a23b35] hover:underline">
          View all
        </button>
      </div>
      {recent.length === 0 ? <p className="py-4 text-sm text-black/50">No orders yet.</p> : null}
      <div className="divide-y divide-black/10">
        {recent.map((order: CustomerOrder) => (
          <div
            key={order.id}
            onClick={() => onSelectOrder(order)}
            className="flex items-center gap-3 py-3 text-sm hover:bg-black/5 cursor-pointer -mx-2 px-2 rounded-md"
          >
            <span className="w-20 shrink-0 font-mono text-xs text-black/40">#{order.id.slice(0, 8)}</span>
            <span className="flex-1 truncate font-medium text-black">{getCustomerName(order, users)}</span>
            <span className="hidden text-xs text-black/40 sm:inline">{getDate(order.createdAt)}</span>
            <span className={`inline-block w-24 text-center px-2 py-0.5 text-xs font-medium ${getStatusButtonStyle(order.status)} rounded-none`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverviewSidebar({ revenue, users, admins, subscribers }: any) {
  return (
    <div className="grid gap-4">
      <div className="border border-[#a23b35] p-6 rounded-md text-[#a23b35] bg-white">
        <p className="text-xs font-medium uppercase tracking-wider text-black/50">Paid value to date</p>
        <p className="mt-2 text-3xl font-semibold">{money(revenue)}</p>
        <p className="mt-3 text-sm leading-5 text-black/60">Paid, preparing, dispatched, and delivered orders.</p>
      </div>
      <div className="border border-black/10 rounded-md p-5">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-black/50">People</p>
        <div className="divide-y divide-black/10 text-sm">
          <div className="flex justify-between py-2.5"><span className="text-black/60">Customers & admins</span><span className="font-medium text-black">{users.length}</span></div>
          <div className="flex justify-between py-2.5"><span className="text-black/60">Admins</span><span className="font-medium text-black">{admins}</span></div>
          <div className="flex justify-between py-2.5"><span className="text-black/60">Newsletter emails</span><span className="font-medium text-black">{subscribers}</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── Orders List ─────────────────────────────────────────────

function OrdersList({ orders, users, onDeleteOrder, onSelectOrder }: any) {
  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-black/50">{orders.length} total</p>
      {orders.length === 0 ? <p className="py-6 text-sm text-black/50">No orders have been placed yet.</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-black/10 text-left text-xs font-medium uppercase tracking-wider text-black/50">
              <th className="py-3 pr-4 font-medium">Order ID</th>
              <th className="py-3 pr-4 font-medium">Customer</th>
              <th className="py-3 pr-4 font-medium">Location</th>
              <th className="py-3 pr-4 font-medium text-right">Amount</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {orders.map((order: CustomerOrder) => {
              const statusLabel = getOrderStatusLabel(order.status);
              const statusButtonClass = getStatusButtonStyle(order.status);
              return (
                <tr key={order.id} className="hover:bg-black/5 transition">
                  <td className="py-3 pr-4 font-mono text-xs text-black/60">#{order.id.slice(0, 8)}</td>
                  <td className="py-3 pr-4 font-medium text-black">{getCustomerName(order, users)}</td>
                  <td className="py-3 pr-4 text-black/60">{getCustomerLocation(order)}</td>
                  <td className="py-3 pr-4 text-right font-semibold text-[#a23b35]">{money(order.total ?? 0)}</td>
                  <td className="py-3 pr-4">
                    <span className={`inline-block w-24 text-center px-2 py-1 text-xs font-medium ${statusButtonClass} rounded-none`}>
                      {statusLabel}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="inline-block bg-black text-white px-3 py-1 text-xs font-medium hover:bg-gray-800 transition rounded-none"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onDeleteOrder(order.id)}
                        className="inline-block bg-red-600 text-white px-3 py-1 text-xs font-medium hover:bg-red-700 transition rounded-none"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Order Detail Modal ──────────────────────────────────────

function OrderDetailModal({
  order,
  users,
  onClose,
  onStatusChange,
  updating,
}: {
  order: CustomerOrder | null;
  users: UserProfile[];
  onClose: () => void;
  onStatusChange: (status: OrderStatus) => void;
  updating: boolean;
}) {
  if (!order) return null;

  const customer = users.find((u) => u.uid === order.userId);
  const statuses: OrderStatus[] = ['pending-payment', 'paid', 'preparing', 'out-for-delivery', 'delivered', 'cancelled'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-md shadow-xl">
        <div className="sticky top-0 bg-white border-b border-black/10 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Order #{order.id.slice(0, 8)}</h2>
          <button onClick={onClose} className="text-black/50 hover:text-black text-xl">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">Customer</p>
              <p className="text-lg font-semibold">{getCustomerName(order, users)}</p>
              <p className="text-sm text-black/60">{customer?.email || order.userId}</p>
              <p className="text-sm text-black/60">{order.deliveryDetails?.phoneNumber || 'No phone'}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">Status</p>
              <select
                value={order.status}
                onChange={(e) => onStatusChange(e.target.value as OrderStatus)}
                disabled={updating}
                className="w-full border border-black/20 rounded-md px-3 py-2 text-sm outline-none focus:border-[#a23b35] disabled:opacity-50"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>{getOrderStatusLabel(s)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-black/50 mb-2">Items</p>
            <div className="divide-y divide-black/10">
              {(order.items ?? []).map((item, idx) => (
                <div key={idx} className="py-2 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-md bg-black/5">
                      <Image src={item.image || '/bloom1.png'} alt={item.productName} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-black/50">{item.brand} / {item.variant}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-[#a23b35]">{item.quantity} × {money(item.price ?? 0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery & Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">Delivery</p>
              <p className="text-sm">{order.deliveryDetails?.recipientName || 'Recipient not saved'}</p>
              <p className="text-sm text-black/60">
                {[order.deliveryDetails?.addressLine, order.deliveryDetails?.town, order.deliveryDetails?.county].filter(Boolean).join(', ') || 'No address'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-black/50">Payment</p>
              <p className="text-sm font-medium">{order.payment?.label || 'Unknown'}</p>
              <p className="text-sm text-black/60">Status: {order.payment?.status || order.paymentStatus || 'pending'}</p>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-3 gap-4 border-t border-black/10 pt-4">
            <div><p className="text-xs uppercase text-black/50">Subtotal</p><p className="font-semibold">{money(order.subtotal ?? 0)}</p></div>
            <div><p className="text-xs uppercase text-black/50">Delivery</p><p className="font-semibold">{money(order.deliveryFee ?? 0)}</p></div>
            <div><p className="text-xs uppercase text-black/50">Total</p><p className="font-semibold text-[#a23b35]">{money(order.total ?? 0)}</p></div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 border-t border-black/10 pt-4">
            {order.deliveryDetails?.phoneNumber && (
              <a href={`tel:${order.deliveryDetails.phoneNumber}`} className="border border-black/20 px-3 py-1.5 text-xs rounded-md hover:bg-black/5">Call</a>
            )}
            {(customer?.email || order.payment?.paypalEmail) && (
              <a href={`mailto:${customer?.email ?? order.payment?.paypalEmail}`} className="border border-black/20 px-3 py-1.5 text-xs rounded-md hover:bg-black/5">Email</a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Upcoming Section ───────────────────────────────────────

function UpcomingSection({
  subscriptions,
  users,
  cycleProfiles,
}: {
  subscriptions: CustomerSubscription[];
  users: UserProfile[];
  cycleProfiles: CycleProfile[];
}) {
  const rows = useMemo(() => {
    return cycleProfiles.map((cycle) => {
      const user = users.find((u) => u.uid === cycle.userId);
      const sub = subscriptions.find((s) => s.userId === cycle.userId && s.status === 'active');
      const nextPeriod = getNextPeriodDate(cycle);
      
      const periodMillis = nextPeriod ? nextPeriod.getTime() : null;
      const daysToPeriod = periodMillis ? Math.ceil((periodMillis - Date.now()) / 86400000) : null;

      let priority = 4; // Tracking
      if (daysToPeriod !== null) {
        if (daysToPeriod <= 3) priority = 1; // Immediate
        else if (daysToPeriod <= 7) priority = 2; // Ship Now
        else if (daysToPeriod <= 12) priority = 3; // Prepare
      }

      return {
        sub,
        user,
        cycle,
        nextPeriod,
        daysToPeriod,
        priority,
      };
    }).sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const dateA = a.nextPeriod ? a.nextPeriod.getTime() : Infinity;
      const dateB = b.nextPeriod ? b.nextPeriod.getTime() : Infinity;
      return dateA - dateB;
    });
  }, [subscriptions, users, cycleProfiles]);

  function getTimestampMillis(value: unknown) {
    if (value && typeof value === 'object' && 'toMillis' in value && typeof value.toMillis === 'function') {
      return value.toMillis();
    }
    if (value instanceof Date) return value.getTime();
    return 0;
  }

  function formatValueDate(value: unknown) {
    const millis = getTimestampMillis(value);
    if (!millis) return 'Not dated';
    return new Date(millis).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  function getUpcomingWhatsappHref(phone: string, name: string, type: 'remind' | 'wish', days?: number | null) {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
    
    let message = '';
    if (type === 'remind') {
      message = `Hi ${name || 'there'}, this is BloomBox. We noticed your period is approaching ${days ? `in about ${days} days` : 'soon'}! Just a reminder that we have comfort boxes ready to help you through. Would you like to see what's new in our shop?`;
    } else {
      message = `Hi ${name || 'there'}, BloomBox is thinking of you as your period approaches. We wish you a comfortable and peaceful cycle. Remember to be patient with yourself this week!`;
    }
    
    const encoded = encodeURIComponent(message);
    return normalized ? `https://wa.me/${normalized}?text=${encoded}` : '#';
  }

  const sections = [
    { id: 1, label: 'Action Required', desc: 'Arriving in 3 days or less', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 2, label: 'Preparation Window', desc: 'Arriving in 4-7 days', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { id: 3, label: 'Upcoming Cycles', desc: 'Arriving in 8-12 days', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: 4, label: 'Future Tracking', desc: 'Logged profiles with later dates', color: 'bg-stone-50 text-stone-600 border-stone-200' },
  ];

  return (
    <div className="space-y-10">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-black/5 p-6 rounded-xl shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-black/40">Network reach</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold text-black">{cycleProfiles.length}</span>
            <span className="text-sm text-black/40">Tracked cycles</span>
          </div>
        </div>
        <div className="bg-[#a23b35] p-6 rounded-xl shadow-sm text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">Urgent support</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold">{rows.filter(r => r.priority === 1).length}</span>
            <span className="text-sm text-white/70 text-balance">Arriving in next 72 hours</span>
          </div>
        </div>
        <div className="bg-[#006a65] p-6 rounded-xl shadow-sm text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60">Subscription health</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-serif font-bold">{subscriptions.filter(s => s.status === 'active').length}</span>
            <span className="text-sm text-white/70">Active members</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-12">
        {sections.map((section) => {
          const sectionRows = rows.filter(r => r.priority === section.id);
          if (sectionRows.length === 0 && section.id !== 1) return null;

          return (
            <section key={section.id} className="space-y-5">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold tracking-tight text-black">{section.label}</h2>
                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${section.color}`}>
                  {sectionRows.length} {sectionRows.length === 1 ? 'User' : 'Users'}
                </span>
                <div className="h-px flex-1 bg-black/5" />
              </div>
              
              {sectionRows.length === 0 ? (
                <div className="py-8 text-center bg-white border border-dashed border-black/10 rounded-xl text-black/30 text-sm italic">
                  No users in this window right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {sectionRows.map(({ sub, user, nextPeriod, daysToPeriod }, idx) => {
                    const phone = user?.deliveryDetails?.phoneNumber || '';
                    const customerName = user?.displayName || user?.email || 'Valued Customer';
                    const location = [user?.deliveryDetails?.town, user?.deliveryDetails?.county].filter(Boolean).join(', ');

                    return (
                      <article key={user?.uid || idx} className="group bg-white border border-black/10 rounded-xl p-5 hover:border-[#a23b35]/30 hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row gap-5">
                          {/* Left: User Initials & Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-full bg-[#fdf2f2] text-[#a23b35] font-bold text-sm uppercase">
                                  {customerName.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <h3 className="font-bold text-black truncate">{customerName}</h3>
                                  <p className="text-xs text-black/40 truncate">{user?.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Next Period</p>
                                <p className="text-sm font-bold text-black mt-0.5">
                                  {nextPeriod ? formatValueDate(nextPeriod) : 'TBD'}
                                </p>
                                {daysToPeriod !== null && (
                                  <p className={`text-[10px] font-black uppercase mt-1 ${daysToPeriod <= 3 ? 'text-rose-600' : 'text-black/50'}`}>
                                    In {daysToPeriod} days
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="mt-5 grid grid-cols-2 gap-4 border-t border-black/5 pt-4">
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Subscription</p>
                                <div className="mt-1">
                                  {sub ? (
                                    <>
                                      <p className="text-xs font-bold text-black">{sub.planName}</p>
                                      <p className="text-[10px] text-[#006a65] font-bold">{money(sub.amount ?? 0)}</p>
                                    </>
                                  ) : (
                                    <p className="text-xs text-black/40 italic">One-time / No sub</p>
                                  )}
                                </div>
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30">Logistics</p>
                                <div className="mt-1 min-w-0">
                                  <p className="text-xs text-black/60 truncate">{location || 'No location saved'}</p>
                                  <p className="text-[10px] text-black/40 font-mono">{phone || 'No phone number'}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-row sm:flex-col gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-black/5 pt-4 sm:pt-0 sm:pl-4">
                            <a
                              href={getUpcomingWhatsappHref(phone, customerName, 'remind', daysToPeriod)}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition ${
                                phone ? 'bg-white border border-[#006a65] text-[#006a65] hover:bg-[#006a65] hover:text-white' : 'bg-black/5 text-black/20 pointer-events-none'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.539 2.016 2.126-.54c1.029.59 2.067.928 3.162.929h.001c3.181 0 5.767-2.587 5.768-5.766 0-3.181-2.587-5.766-5.769-5.766z" /></svg>
                              Remind
                            </a>
                            <a
                              href={getUpcomingWhatsappHref(phone, customerName, 'wish', daysToPeriod)}
                              target="_blank"
                              rel="noreferrer"
                              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition ${
                                phone ? 'bg-white border border-[#a23b35] text-[#a23b35] hover:bg-[#a23b35] hover:text-white' : 'bg-black/5 text-black/20 pointer-events-none'
                              }`}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                              Wish Well
                            </a>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ─── Products ─────────────────────────────────────────────

function ProductForm({
  form,
  setForm,
  imageFile,
  setImageFile,
  imagePreview,
  isEditing,
  isSaving,
  onSubmit,
  onClear,
}: {
  form: ProductFormState;
  setForm: (field: keyof ProductFormState, value: string | boolean) => void;
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  imagePreview: string;
  isEditing: boolean;
  isSaving: boolean;
  onSubmit: (e: FormEvent) => void;
  onClear: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="border border-black/10 rounded-md p-6 xl:sticky xl:top-8 xl:self-start">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#a23b35]">
        {isEditing ? `Editing — ${form.name}` : 'New product'}
      </p>

      <div className="grid gap-4">
        <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
          Name
          <input value={form.name} onChange={(e) => setForm('name', e.target.value)} className={inputCls} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
            Brand
            <input value={form.brand} onChange={(e) => setForm('brand', e.target.value)} className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
            Variant
            <input value={form.variant} onChange={(e) => setForm('variant', e.target.value)} className={inputCls} />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
            Category
            <select value={form.categoryId} onChange={(e) => setForm('categoryId', e.target.value)} className={inputCls}>
              {productCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
            Stock
            <select value={form.stockStatus} onChange={(e) => setForm('stockStatus', e.target.value as StockStatus)} className={inputCls}>
              <option value="available">Available</option>
              <option value="on-demand">On demand</option>
              <option value="pending-price">Pending price</option>
            </select>
          </label>
        </div>

        <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
          Description
          <textarea value={form.description} onChange={(e) => setForm('description', e.target.value)} rows={3} className={`${inputCls} resize-none`} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
            Price
            <input value={form.price} onChange={(e) => setForm('price', e.target.value)} inputMode="numeric" placeholder="850" className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
            Price note
            <input value={form.priceNote} onChange={(e) => setForm('priceNote', e.target.value)} placeholder="From KSh..." className={inputCls} />
          </label>
        </div>

        <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
          Image URL
          <input value={form.image} onChange={(e) => setForm('image', e.target.value)} placeholder="/products/item.jpg or https://..." className={inputCls} />
        </label>

        <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
          Upload image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => { setImageFile(e.target.files?.[0] ?? null); }}
            className="block w-full text-sm text-black/60 file:mr-3 file:rounded-md file:border-0 file:bg-[#a23b35] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#8c302b]"
          />
        </label>

        {imagePreview && (
          <div className="overflow-hidden rounded-md border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Product preview" className="h-40 w-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
            Badge
            <input value={form.badge} onChange={(e) => setForm('badge', e.target.value)} placeholder="NEW" className={inputCls} />
          </label>
          <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-black/50">
            Tags
            <input value={form.tags} onChange={(e) => setForm('tags', e.target.value)} placeholder="pads, comfort" className={inputCls} />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-black/10 pt-4 text-sm text-black">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm('featured', e.target.checked)} className="h-4 w-4 rounded border-black/20 text-[#a23b35] focus:ring-[#a23b35]" />
            Featured
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm('isActive', e.target.checked)} className="h-4 w-4 rounded border-black/20 text-[#a23b35] focus:ring-[#a23b35]" />
            Visible in shop
          </label>
        </div>

        <div className="flex gap-3 border-t border-black/10 pt-4">
          <button type="submit" disabled={isSaving} className="flex-1 rounded-md bg-[#a23b35] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#8c302b] disabled:opacity-50">
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}
          </button>
          <button type="button" onClick={onClear} className="rounded-md border border-black/20 px-4 py-2.5 text-sm font-medium text-black/70 hover:bg-black/5">
            Clear
          </button>
        </div>
      </div>
    </form>
  );
}

function ProductList({ products, onEdit, onToggle, onDelete, updatingId }: any) {
  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-black/50">{products.length} products</p>
      <div className="divide-y divide-black/10">
        {products.map((product: CatalogProduct) => (
          <div key={product.id} className="-mx-2 flex flex-col gap-3 rounded-md px-2 py-3 hover:bg-black/5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-black/10">
                <Image src={product.image || '/bloom1.png'} alt={product.name} fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-black">{product.name}</p>
                <p className="mt-0.5 truncate text-xs text-black/50">{product.categoryName}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:shrink-0">
              <p className="text-sm font-semibold text-[#a23b35]">
                {product.price === null ? product.priceNote ?? 'Pending' : money(product.price)}
              </p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${product.isActive === false ? 'bg-black/10 text-black/50' : 'bg-emerald-100 text-emerald-800'}`}>
                {product.isActive === false ? 'Hidden' : 'Live'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => onEdit(product)} className="rounded-md border border-black/20 px-3 py-1 text-xs font-medium text-black/70 hover:bg-black/5">
                  Edit
                </button>
                <button type="button" disabled={updatingId === product.id} onClick={() => onToggle(product)} className="rounded-md border border-black/20 px-3 py-1 text-xs font-medium text-black/70 hover:bg-black/5 disabled:opacity-50">
                  {product.isActive === false ? 'Show' : 'Hide'}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  className="rounded-md border border-red-600 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Customers ─────────────────────────────────────────────

function CustomersList({ users, currentUserId, updatingId, onChangeRole }: any) {
  const admins = users.filter((u: UserProfile) => u.role === 'admin').length;
  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-black/50">{users.length} users · {admins} admins</p>
      <div className="divide-y divide-black/10">
        {users.map((profile: UserProfile) => (
          <div key={profile.uid} className="flex items-center gap-4 py-3 hover:bg-black/5 -mx-2 px-2 rounded-md">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#a23b35] text-sm font-medium text-white">
              {(profile.displayName || profile.email || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-black">{profile.displayName || profile.email || 'Unnamed user'}</p>
              <p className="truncate text-xs text-black/50">{profile.email ?? profile.uid}</p>
            </div>
            <p className="hidden w-28 shrink-0 truncate text-xs text-black/50 sm:block">
              {profile.deliveryDetails?.town ?? '—'}
            </p>
            <select
              value={profile.role}
              onChange={(e) => onChangeRole(profile, e.target.value as UserRole)}
              disabled={updatingId === profile.uid || profile.uid === currentUserId}
              className={`shrink-0 rounded-full border-0 px-3 py-1 text-xs font-medium outline-none transition disabled:opacity-50 ${
                profile.role === 'admin' ? 'bg-[#a23b35]/10 text-[#a23b35]' : 'bg-black/10 text-black/60'
              }`}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Subscribers ─────────────────────────────────────────────

function SubscribersList({ subscribers }: { subscribers: NewsletterSubscriber[] }) {
  return (
    <div>
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-black/50">{subscribers.length} community emails</p>
      {subscribers.length === 0 ? <p className="py-6 text-sm text-black/50">No newsletter subscribers yet.</p> : null}
      <div className="divide-y divide-black/10">
        {subscribers.map((subscriber) => (
          <div key={subscriber.email} className="flex items-center gap-4 py-3 hover:bg-black/5 -mx-2 px-2 rounded-md">
            <p className="min-w-0 flex-1 truncate text-sm text-black">{subscriber.email}</p>
            <p className="shrink-0 text-xs text-black/50">{subscriber.source || 'website'}</p>
            <p className="w-20 shrink-0 text-right text-xs text-black/50">{getDate(subscriber.updatedAt ?? subscriber.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Access ────────────────────────────────────────────────

function AccessSection() {
  const items = [
    'View all orders and delivery details.',
    'Move orders through payment, preparation, dispatch, delivery, or cancellation.',
    'Add catalog products with uploaded or linked images.',
    'Edit product copy, price, category, status, tags, and visibility.',
    'Promote users to admin or return them to customer access.',
    'Review customers and saved delivery coverage.',
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="border border-black/10 rounded-md p-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-black/50">What admins can do</p>
        <ul className="grid gap-3 text-sm leading-6 text-black">
          {items.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#a23b35]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-[#a23b35] p-6 rounded-md text-white">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/70">Access model</p>
        <p className="text-white/90">
          The visible role lives on <code className="rounded bg-white/20 px-1.5 py-0.5 text-xs">users/uid.role</code>. Real admin permission is backed by{' '}
          <code className="rounded bg-white/20 px-1.5 py-0.5 text-xs">admins/uid</code>, which keeps customers from self-promoting.
        </p>
        <p className="mt-3 text-white/90">
         Product images are saved directly inside the Firestore document as resized base64 data URLs. No Firebase Storage bucket or paid plan is required. The upload button on the product form handles everything automatically.
        </p>
      </div>
    </div>
  );
}

// ─── Inventory ─────────────────────────────────────────────

type InventoryRow = {
  product: CatalogProduct;
  incoming: number;
  manualOutgoing: number;
  soldQuantity: number;
  adjustment: number;
  stockOnHand: number;
  revenue: number;
  averageUnitCost: number;
  stockValue: number;
};

function InventorySection({
  products,
  orders,
  movements,
  user,
}: {
  products: CatalogProduct[];
  orders: CustomerOrder[];
  movements: InventoryMovement[];
  user: any;
}) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<InventoryMovementType>('incoming');
  const [quantity, setQuantity] = useState(12);
  const [unitCost, setUnitCost] = useState(0);
  const [reason, setReason] = useState('');
  const [linkedOrderId, setLinkedOrderId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const inventoryRows = useMemo<InventoryRow[]>(() => {
    return products.map((product) => {
      const productMovements = movements.filter((m) => m.productId === product.id);
      const incoming = productMovements
        .filter((m: InventoryMovement) => m.type === 'incoming')
        .reduce((s: number, m: InventoryMovement) => s + m.quantity, 0);
      const manualOutgoing = productMovements
        .filter((m: InventoryMovement) => m.type === 'outgoing')
        .reduce((s: number, m: InventoryMovement) => s + m.quantity, 0);
      const adjustment = productMovements
        .filter((m: InventoryMovement) => m.type === 'adjustment')
        .reduce((s: number, m: InventoryMovement) => s + m.quantity, 0);
      const incomingCost = productMovements
        .filter((m: InventoryMovement) => m.type === 'incoming')
        .reduce((s: number, m: InventoryMovement) => s + m.quantity * m.unitCost, 0);

      // Fixed: explicit types for order and item
      const soldQuantity = orders
        .filter((o: CustomerOrder) => paidStatuses.includes(o.status))
        .reduce((acc: number, order: CustomerOrder) => {
          const items: OrderItem[] = order.items ?? [];
          return acc + items.reduce((sum: number, item: OrderItem) => {
            if (item.productId === product.id) {
              return sum + item.quantity;
            }
            return sum;
          }, 0);
        }, 0);

      const revenue = orders
        .filter((o: CustomerOrder) => paidStatuses.includes(o.status))
        .reduce((acc: number, order: CustomerOrder) => {
          const items: OrderItem[] = order.items ?? [];
          return acc + items.reduce((sum: number, item: OrderItem) => {
            if (item.productId === product.id) {
              return sum + (item.price ?? 0) * item.quantity;
            }
            return sum;
          }, 0);
        }, 0);

      const stockOnHand = incoming + adjustment - manualOutgoing - soldQuantity;
      const averageUnitCost = incoming > 0 ? incomingCost / incoming : 0;

      return {
        product,
        incoming,
        manualOutgoing,
        soldQuantity,
        adjustment,
        stockOnHand,
        revenue,
        averageUnitCost,
        stockValue: Math.max(0, stockOnHand) * averageUnitCost,
      };
    });
  }, [movements, orders, products]);

  const summary = useMemo(() => {
    return {
      products: inventoryRows.length,
      lowStock: inventoryRows.filter((row: InventoryRow) => row.stockOnHand <= 5).length,
      stockValue: inventoryRows.reduce((s: number, row: InventoryRow) => s + row.stockValue, 0),
      revenue: inventoryRows.reduce((s: number, row: InventoryRow) => s + row.revenue, 0),
    };
  }, [inventoryRows]);

  const submitMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');

    if (!user || !selectedProduct) return;
    if (quantity <= 0) { setError('Quantity must be greater than zero.'); return; }

    setIsSaving(true);
    try {
      await recordInventoryMovement(user, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        type: movementType,
        quantity,
        unitCost,
        reason: reason || `${movementType} stock movement`,
        linkedOrderId,
      });
      setNotice(`${movementType} movement saved for ${selectedProduct.name}.`);
      setQuantity(12);
      setUnitCost(0);
      setReason('');
      setLinkedOrderId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save stock movement.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid gap-5">
      {error && <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div>}
      {notice && <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div>}

      <div className="grid border-y border-black/10 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Products', summary.products, 'Catalog items monitored'],
          ['Low stock', summary.lowStock, 'Five units or fewer'],
          ['Stock value', money(summary.stockValue), 'Based on incoming unit cost'],
          ['Matched revenue', money(summary.revenue), 'Paid order item totals'],
        ].map(([label, value, detail], index) => (
          <div key={label} className={`px-4 py-3 ${index < 3 ? 'border-b border-black/10 sm:border-r xl:border-b-0' : ''}`}>
            <p className="text-2xl font-semibold text-[#a23b35]">{value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/50">{label}</p>
            <p className="mt-1 text-xs text-black/50">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={submitMovement} className="border border-black/10 bg-white p-5 xl:sticky xl:top-6 xl:self-start">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a23b35]">Stock record</p>
          <h2 className="mt-2 font-serif text-3xl font-semibold">Record movement</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-black/80">
              Product
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]">
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-black/80">
              Movement type
              <select value={movementType} onChange={(e) => setMovementType(e.target.value as InventoryMovementType)} className="border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]">
                <option value="incoming">Incoming stock</option>
                <option value="outgoing">Manual outgoing stock</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-black/80">
                Quantity
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-black/80">
                Unit cost
                <input type="number" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} className="border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-black/80">
              Linked order ID
              <input value={linkedOrderId} onChange={(e) => setLinkedOrderId(e.target.value)} className="border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]" placeholder="Optional" />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-black/80">
              Reason
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="resize-none border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]" placeholder="Supplier delivery, shrinkage, order correction..." />
            </label>

            <button disabled={isSaving || !selectedProduct} className="bg-[#a23b35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c302b] disabled:opacity-60">
              {isSaving ? 'Saving...' : 'Save movement'}
            </button>
          </div>
        </form>

        <section className="bg-white">
          <div className="mb-3 flex flex-col justify-between gap-2 border-b border-black/10 pb-2 md:flex-row md:items-end">
            <div>
              <h2 className="text-lg font-semibold">Inventory position</h2>
              <p className="mt-0.5 text-sm text-black/50">Incoming stock minus manual outgoing stock and paid order quantities.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[860px]">
              <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr] border-b border-black/10 bg-[#fff5f0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black/60">
                <span>Product</span>
                <span>Incoming</span>
                <span>Sold</span>
                <span>Manual out</span>
                <span>On hand</span>
                <span>Revenue</span>
              </div>
              {inventoryRows.map((row: InventoryRow) => (
                <div key={row.product.id} className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-3 border-b border-black/10 px-3 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-black">{row.product.name}</p>
                    <p className="mt-1 text-xs text-black/50">{row.product.sku}</p>
                  </div>
                  <p>{row.incoming}</p>
                  <p>{row.soldQuantity}</p>
                  <p>{row.manualOutgoing}</p>
                  <p className={`font-semibold ${row.stockOnHand <= 5 ? 'text-[#a23b35]' : 'text-[#006a65]'}`}>{row.stockOnHand}</p>
                  <p className="font-semibold text-[#a23b35]">{money(row.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="border border-black/10 bg-white p-5">
        <h2 className="text-lg font-semibold">Recent stock movements</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {movements.slice(0, 9).map((movement) => (
            <article key={movement.id} className="border border-black/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-black">{movement.productName}</p>
                  <p className="mt-1 text-xs text-black/50">{getDate(movement.createdAt)}</p>
                </div>
                <span className="border border-[#e0bfbd] bg-[#fff5f0] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a23b35]">{movement.type}</span>
              </div>
              <p className="mt-3 text-sm text-black/80">Qty {movement.quantity} / Cost {money(movement.unitCost)}</p>
              <p className="mt-2 text-xs leading-5 text-black/50">{movement.reason}</p>
            </article>
          ))}
          {movements.length === 0 ? <p className="text-sm text-black/50">No inventory movements recorded yet.</p> : null}
        </div>
      </section>
    </div>
  );
}

// ─── Leads ─────────────────────────────────────────────────

const leadStages: Array<{ value: LeadStage; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'whatsapp-contacted', label: 'WhatsApp contacted' },
  { value: 'checkout-ready', label: 'Checkout ready' },
  { value: 'won', label: 'Won' },
  { value: 'nurture', label: 'Nurture' },
];

function LeadsSection({ leads }: { leads: SalesLead[] }) {
  const [notesByLead, setNotesByLead] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const next: Record<string, string> = {};
    leads.forEach((lead) => {
      next[lead.id] = lead.notes ?? '';
    });
    setNotesByLead(next);
  }, [leads]);

  const updateLead = async (lead: SalesLead, stage: LeadStage) => {
    setError('');
    setNotice('');
    setUpdatingId(lead.id);
    try {
      await updateLeadStage(lead.id, stage, notesByLead[lead.id] ?? lead.notes ?? '');
      setNotice(`${lead.name || lead.email} moved to ${leadStages.find((s) => s.value === stage)?.label}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update this lead.');
    } finally {
      setUpdatingId('');
    }
  };

  const stats = leadStages.map((stage) => ({
    ...stage,
    count: leads.filter((lead) => lead.stage === stage.value).length,
  }));

  function getWhatsappHref(phone: string, lead: SalesLead) {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
    const message = encodeURIComponent(`Hi ${lead.name || 'there'}, this is BloomBox. We saw your interest in ${lead.interest || 'a care package'} and can help you choose a package or build your own box.`);
    return normalized ? `https://wa.me/${normalized}?text=${message}` : '#';
  }

  return (
    <div className="grid gap-5">
      {error && <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div>}
      {notice && <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div>}

      <div className="border border-[#006a65] bg-[#e7fbf8] p-5">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006a65]">WhatsApp sales funnel</p>
            <h2 className="mt-2 text-2xl font-semibold text-black">Sign-up sheet data lands here.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#00504c]">
              Each submission becomes a lead card with stage, notes, and a visible WhatsApp follow-up action.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ['Capture', 'Homepage sign-up sheet creates the lead record.'],
              ['Qualify', 'Move the lead by interest, budget, and readiness.'],
              ['WhatsApp', 'Open WhatsApp with a prefilled BloomBox follow-up message.'],
            ].map(([title, text]) => (
              <div key={title} className="bg-white px-4 py-3">
                <p className="text-sm font-semibold text-[#006a65]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-black/60">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid border-y border-black/10 bg-white sm:grid-cols-2 xl:grid-cols-6">
        {stats.map((stage, index) => (
          <div key={stage.value} className={`px-4 py-3 ${index < stats.length - 1 ? 'border-b border-black/10 sm:border-r xl:border-b-0' : ''}`}>
            <p className="text-2xl font-semibold text-[#a23b35]">{stage.count}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/50">{stage.label}</p>
          </div>
        ))}
      </div>

      <section className="bg-white">
        <div className="mb-3 border-b border-black/10 pb-2">
          <h2 className="text-lg font-semibold">Lead pipeline</h2>
          <p className="mt-0.5 text-sm text-black/50">Leads are created by the homepage care-planning form and can be contacted through WhatsApp.</p>
        </div>

        {leads.length === 0 ? (
          <div className="border border-black/10 p-6 text-sm leading-6 text-black/50">No leads yet.</div>
        ) : (
          <div className="grid gap-4">
            {leads.map((lead) => (
              <article key={lead.id} className="grid gap-4 border border-black/10 p-4 xl:grid-cols-[1.1fr_0.9fr_0.85fr_220px] xl:items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a23b35]">{lead.source || 'website'}</p>
                  <h3 className="mt-1 text-lg font-semibold text-black">{lead.name || 'Unnamed lead'}</h3>
                  <p className="mt-1 break-all text-sm text-black/60">{lead.email}</p>
                  <p className="mt-1 text-sm text-black/60">{lead.phone || 'No phone'}</p>
                  <p className="mt-2 text-xs text-black/50">Created {getDate(lead.createdAt)}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/50">Interest</p>
                  <p className="mt-2 text-sm font-semibold text-black">{lead.interest || 'Not specified'}</p>
                  <p className="mt-1 text-sm text-black/60">Budget: {lead.budget || 'Not specified'}</p>
                </div>

                <div>
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black/50">
                    Stage
                    <select
                      value={lead.stage}
                      disabled={updatingId === lead.id}
                      onChange={(e) => updateLead(lead, e.target.value as LeadStage)}
                      className="border border-black/20 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-black outline-none focus:border-[#a23b35]"
                    >
                      {leadStages.map((stage) => (
                        <option key={stage.value} value={stage.value}>{stage.label}</option>
                      ))}
                    </select>
                  </label>

                  <div className="mt-3 border border-[#006a65] bg-[#e7fbf8] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#006a65]">WhatsApp follow-up</p>
                    <a
                      href={getWhatsappHref(lead.phone, lead)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (!lead.phone.replace(/\D/g, '').length) e.preventDefault();
                      }}
                      className={`mt-2 inline-flex w-full justify-center px-4 py-2 text-sm font-semibold text-white ${
                        lead.phone.replace(/\D/g, '').length ? 'bg-[#006a65] hover:bg-[#004b48]' : 'cursor-not-allowed bg-black/30'
                      }`}
                    >
                      {lead.phone.replace(/\D/g, '').length ? 'Open WhatsApp' : 'No WhatsApp number'}
                    </a>
                  </div>
                </div>

                <div>
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black/50">
                    Notes
                    <textarea
                      value={notesByLead[lead.id] ?? ''}
                      onChange={(e) => setNotesByLead((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                      onBlur={() => updateLead(lead, lead.stage)}
                      rows={4}
                      className="resize-none border border-black/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-black outline-none focus:border-[#a23b35]"
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Partners ──────────────────────────────────────────────

const partnerStatuses: Array<{ value: PartnerInquiryStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
];

function PartnersSection({ inquiries }: { inquiries: PartnerInquiry[] }) {
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const updateStatus = async (inquiry: PartnerInquiry, status: PartnerInquiryStatus) => {
    setError('');
    setNotice('');
    setUpdatingId(inquiry.id);
    try {
      await updatePartnerInquiryStatus(inquiry.id, status);
      setNotice(`${inquiry.businessName} moved to ${partnerStatuses.find((s) => s.value === status)?.label}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update partner request.');
    } finally {
      setUpdatingId('');
    }
  };

  const stats = partnerStatuses.map((status) => ({
    ...status,
    count: inquiries.filter((inquiry) => inquiry.status === status.value).length,
  }));

  function getWhatsappHref(inquiry: PartnerInquiry) {
    const digits = inquiry.phone.replace(/\D/g, '');
    const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
    const message = encodeURIComponent(`Hi ${inquiry.contactName || 'there'}, this is BloomBox. Thank you for your partnership request for ${inquiry.businessName}. We would like to learn more about your ${inquiry.productCategory} idea.`);
    return normalized ? `https://wa.me/${normalized}?text=${message}` : '#';
  }

  return (
    <div className="grid gap-5">
      {error && <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div>}
      {notice && <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div>}

      <div className="grid border-y border-black/10 bg-white sm:grid-cols-2 xl:grid-cols-5">
        {stats.map((status, index) => (
          <div key={status.value} className={`px-4 py-3 ${index < stats.length - 1 ? 'border-b border-black/10 sm:border-r xl:border-b-0' : ''}`}>
            <p className="text-2xl font-semibold text-[#a23b35]">{status.count}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/50">{status.label}</p>
          </div>
        ))}
      </div>

      <section className="bg-white">
        <div className="mb-3 border-b border-black/10 pb-2">
          <h2 className="text-lg font-semibold">Partner inbox</h2>
          <p className="mt-0.5 text-sm text-black/50">Each inquiry comes from the public Partner with us form and can represent products, services, sponsorships, or programs.</p>
        </div>

        {inquiries.length === 0 ? (
          <div className="border border-black/10 p-6 text-sm leading-6 text-black/50">No partner requests yet.</div>
        ) : (
          <div className="grid gap-4">
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="grid gap-4 border border-black/10 p-4 xl:grid-cols-[1fr_0.85fr_0.65fr] xl:items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a23b35]">{inquiry.productCategory}</p>
                  <h3 className="mt-1 text-lg font-semibold text-black">{inquiry.businessName}</h3>
                  <p className="mt-1 text-sm text-black/60">{inquiry.contactName}</p>
                  <p className="mt-1 break-all text-sm text-black/60">{inquiry.email}</p>
                  <p className="mt-1 text-sm text-black/60">{inquiry.phone}</p>
                  <p className="mt-2 text-xs text-black/50">Submitted {getDate(inquiry.createdAt)}</p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-black/50">Message</p>
                  <p className="mt-2 text-sm leading-6 text-black/80">{inquiry.message}</p>
                </div>

                <div className="grid gap-3">
                  <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black/50">
                    Status
                    <select
                      value={inquiry.status}
                      disabled={updatingId === inquiry.id}
                      onChange={(e) => updateStatus(inquiry, e.target.value as PartnerInquiryStatus)}
                      className="border border-black/20 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-black outline-none focus:border-[#a23b35]"
                    >
                      {partnerStatuses.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </label>

                  <a
                    href={getWhatsappHref(inquiry)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex justify-center border border-[#006a65] px-4 py-2 text-sm font-semibold text-[#006a65] hover:bg-[#e7fbf8]"
                  >
                    Contact partner
                  </a>
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="inline-flex justify-center border border-[#a23b35] px-4 py-2 text-sm font-semibold text-[#a23b35] hover:bg-[#fff5f0]"
                  >
                    Email partner
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── AI Assist ──────────────────────────────────────────────

function AiAssistSection({ products, orders, leads, movements }: any) {
  const [copied, setCopied] = useState('');

  const insights = useMemo(() => {
    const revenue = orders
      .filter((o: CustomerOrder) => paidStatuses.includes(o.status))
      .reduce((s: number, o: CustomerOrder) => s + (o.total ?? 0), 0);

    const topProduct = (() => {
      const totals = new Map<string, { name: string; quantity: number; revenue: number }>();
      orders
        .filter((o: CustomerOrder) => paidStatuses.includes(o.status))
        // ✅ FIX: explicit return type and callback parameter
        .flatMap((o: CustomerOrder): OrderItem[] => o.items ?? [])
        .forEach((item: OrderItem) => {
          const current = totals.get(item.productId) ?? { name: item.productName, quantity: 0, revenue: 0 };
          current.quantity += item.quantity;
          current.revenue += (item.price ?? 0) * item.quantity;
          totals.set(item.productId, current);
        });
      return [...totals.values()].sort((a, b) => b.quantity - a.quantity)[0] ?? null;
    })();

    const activeLeads = leads.filter((l: SalesLead) => !['won', 'nurture'].includes(l.stage));

    const incomingByProduct = new Map<string, number>();
    const manualOutgoingByProduct = new Map<string, number>();
    movements.forEach((m: InventoryMovement) => {
      if (m.type === 'incoming') incomingByProduct.set(m.productId, (incomingByProduct.get(m.productId) ?? 0) + m.quantity);
      if (m.type === 'outgoing') manualOutgoingByProduct.set(m.productId, (manualOutgoingByProduct.get(m.productId) ?? 0) + m.quantity);
    });
    const soldByProduct = new Map<string, number>();
    orders
      .filter((o: CustomerOrder) => paidStatuses.includes(o.status))
      // ✅ FIX: explicit return type
      .flatMap((o: CustomerOrder): OrderItem[] => o.items ?? [])
      .forEach((item: OrderItem) => {
        soldByProduct.set(item.productId, (soldByProduct.get(item.productId) ?? 0) + item.quantity);
      });

    const lowStock = products
      .map((p: CatalogProduct) => ({
        product: p,
        stock: (incomingByProduct.get(p.id) ?? 0) - (manualOutgoingByProduct.get(p.id) ?? 0) - (soldByProduct.get(p.id) ?? 0),
      }))
      .filter((row: { product: CatalogProduct; stock: number }) => row.stock <= 5)
      .slice(0, 6);

    return { revenue, topProduct, activeLeads, lowStock };
  }, [orders, leads, movements, products]);

  const drafts = useMemo(() => {
    const topProductName = insights.topProduct?.name ?? 'Comfort Box';
    const newLead = insights.activeLeads[0];
    const lowStockName = insights.lowStock[0]?.product.name ?? 'period care essentials';

    return [
      {
        title: 'Marketing campaign brief',
        type: 'Marketing',
        text: `Launch a 7-day BloomBox campaign around ${topProductName}. Angle: useful care before urgency. CTA: Build your own box or subscribe. Include M-Pesa checkout, cycle-aware reminders, and a partner product spotlight.`,
      },
      {
        title: 'WhatsApp lead follow-up',
        type: 'Sales',
        text: newLead
          ? `Hi ${newLead.name || 'there'}, this is BloomBox. I saw your interest in ${newLead.interest || 'a care package'}. Would you like a ready package, a subscription, or help building your own box today?`
          : 'Hi there, this is BloomBox. Would you like a ready package, a subscription, or help building your own box today?',
      },
      {
        title: 'Inventory alert',
        type: 'Inventory',
        text: `Restock review: ${lowStockName} is at or below the low-stock threshold. Check supplier lead time, incoming quantity, and whether a substitute should be promoted in the shop.`,
      },
      {
        title: 'Cycle notification copy',
        type: 'Customer care',
        text: 'Hey Cindy, you have entered your Luteal phase, and we are getting ready for that period. The appetite and cravings just hit. Remember to be patient with yourself this week.',
      },
      {
        title: 'Delivery delight copy',
        type: 'Fulfilment',
        text: 'Hey Girl, your delivery is on the way. We will see you soon. P.S. we tucked in a little surprise for you.',
      },
    ];
  }, [insights]);

  const copyDraft = async (title: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(title);
    setTimeout(() => setCopied(''), 1600);
  };

  return (
    <div className="grid gap-5">
      <div className="grid border-y border-black/10 bg-white sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Paid revenue', money(insights.revenue), 'Orders that reached paid flow'],
          ['Active leads', insights.activeLeads.length, 'Need sales action'],
          ['Low-stock items', insights.lowStock.length, 'Five units or fewer'],
          ['Top product', insights.topProduct?.name ?? 'Not enough data', 'By paid quantity'],
        ].map(([label, value, detail], index) => (
          <div key={label} className={`px-4 py-3 ${index < 3 ? 'border-b border-black/10 sm:border-r xl:border-b-0' : ''}`}>
            <p className="text-2xl font-semibold text-[#a23b35]">{value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-black/50">{label}</p>
            <p className="mt-1 text-xs text-black/50">{detail}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="border border-black/10 bg-[#fff5f0] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a23b35]">Agent roadmap</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-black">What these assistants should automate next.</h2>
          <div className="mt-5 divide-y divide-black/10 border-y border-black/10">
            {[
              'Marketing agent: turn leads, subscribers, cycle phases, and top products into campaign briefs.',
              'Inventory agent: flag low stock, slow movers, incoming purchase needs, and revenue exposure.',
              'WhatsApp agent: draft consent-based follow-up messages and sales qualification questions.',
              'Donation agent: reconcile M-Changa references with sponsored bundle fulfilment.',
            ].map((item) => (
              <p key={item} className="py-3 text-sm leading-6 text-black/60">{item}</p>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {drafts.map((draft) => (
            <article key={draft.title} className="border border-black/10 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#a23b35]">{draft.type}</p>
                  <h3 className="mt-2 text-lg font-semibold text-black">{draft.title}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => copyDraft(draft.title, draft.text)}
                  className="border border-[#a23b35] px-3 py-1.5 text-xs font-semibold text-[#a23b35] hover:bg-[#fff5f0]"
                >
                  {copied === draft.title ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="mt-4 text-sm leading-6 text-black/80">{draft.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border border-black/10 bg-white p-5">
        <h2 className="text-lg font-semibold text-black">Low-stock recommendations</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {insights.lowStock.map((row: any) => (
            <article key={row.product.id} className="border border-black/10 p-4">
              <p className="font-semibold text-black">{row.product.name}</p>
              <p className="mt-1 text-sm text-[#a23b35]">Estimated stock: {row.stock}</p>
              <p className="mt-2 text-xs leading-5 text-black/60">Suggested action: restock, hide if unavailable, or promote a substitute package.</p>
            </article>
          ))}
          {insights.lowStock.length === 0 ? <p className="text-sm text-black/50">No low-stock alerts based on recorded inventory.</p> : null}
        </div>
      </section>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [subscriptions, setSubscriptions] = useState<CustomerSubscription[]>([]);
  const [cycleProfiles, setCycleProfiles] = useState<CycleProfile[]>([]);
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [partners, setPartners] = useState<PartnerInquiry[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  // ── Subscriptions ──

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    if (section && adminSections.includes(section as AdminSection)) {
      setActiveSection(section as AdminSection);
    }
  }, []);

  useEffect(() => {
    const unsubscribers = [
      subscribeToAllOrders(setOrders, (e) => setError(`Orders could not load: ${e.message}`)),
      subscribeToAllSubscriptions(setSubscriptions, (e) => setError(`Subscriptions could not load: ${e.message}`)),
      subscribeToAllCycleProfiles(setCycleProfiles, (e) => setError(`Cycle profiles could not load: ${e.message}`)),
      subscribeToAdminProducts(setProducts, (e) => setError(`Products could not load: ${e.message}`)),
      subscribeToAllUsers(setUsers, (e) => setError(`Customers could not load: ${e.message}`)),
      subscribeToNewsletterSubscribers(setSubscribers, (e) => setError(`Subscribers could not load: ${e.message}`)),
      subscribeToLeads(setLeads, (e) => setError(`Leads could not load: ${e.message}`)),
      subscribeToPartnerInquiries(setPartners, (e) => setError(`Partners could not load: ${e.message}`)),
      subscribeToInventoryMovements(setMovements, (e) => setError(`Inventory could not load: ${e.message}`)),
    ];
    return () => unsubscribers.forEach((u) => u());
  }, []);

  // ── Metrics ──

  const metrics = useMemo(() => {
    const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;
    const activeProducts = products.filter((p) => p.isActive !== false).length;
    return {
      activeOrders,
      activeProducts,
      subscribers: subscribers.length,
      leads: leads.filter((l) => !['won', 'nurture'].includes(l.stage)).length,
      partners: partners.filter((p) => p.status === 'new' || p.status === 'reviewing').length,
    };
  }, [orders, products, subscribers, leads, partners]);

  // ── Product Form ──

  const setFormField = useCallback((field: keyof ProductFormState, value: string | boolean) => {
    setProductForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetProductForm = useCallback(() => {
    setProductForm(emptyProductForm);
    setImageFile(null);
    setIsEditingProduct(false);
  }, []);

  const editProduct = useCallback((product: CatalogProduct) => {
    setProductForm(productToForm(product));
    setImageFile(null);
    setIsEditingProduct(true);
    setActiveSection('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

const uploadImage = useCallback(async (_productId: string) => {
  if (!imageFile) throw new Error('No file selected');
  if (!imageFile.type.startsWith('image/')) throw new Error('Choose a valid image file.');
  // Limit file size before conversion (optional)
  if (imageFile.size > 2 * 1024 * 1024) throw new Error('Image must be smaller than 2MB.');
  return fileToDataUrl(imageFile);
}, [imageFile]);

  const submitProduct = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!productForm.name.trim()) { setError('Product name is required.'); return; }
    if (!productForm.description.trim()) { setError('Product description is required.'); return; }

    const baseProductId = productForm.id.trim() || slugify(`${productForm.brand}-${productForm.name}-${productForm.variant}`);
    const productId = isEditingProduct
      ? baseProductId
      : generateUniqueProductId(baseProductId, products, productForm.id.trim());
    setUpdatingId(productId);

    try {
      let image = productForm.image.trim();
      if (imageFile) {
        image = await uploadImage(productId);
      } else if (isLocalImagePath(image)) {
        throw new Error('Local paths cannot be used. Choose "Upload image" to save online.');
      }

      const product = buildProduct({ ...productForm, id: productId }, image);
      await saveProduct(product);
      setNotice(`${product.name} ${isEditingProduct ? 'updated' : 'added'}.`);
      resetProductForm();
    } catch (err) {
      setError(getUploadErrorMessage(err));
    } finally {
      setUpdatingId('');
    }
  }, [productForm, isEditingProduct, imageFile, uploadImage, resetProductForm, products]);

  const toggleProduct = useCallback(async (product: CatalogProduct) => {
    setError('');
    setNotice('');
    setUpdatingId(product.id);
    try {
      const nextActive = product.isActive === false;
      await saveProduct({ ...product, isActive: nextActive });
      setNotice(`${product.name} is now ${nextActive ? 'visible' : 'hidden'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update product.');
    } finally {
      setUpdatingId('');
    }
  }, []);

  const db = getFirestore();

  const deleteProductHandler = useCallback(async (productId: string) => {
    if (!confirm('Delete this product?')) return;
    setError('');
    setNotice('');
    setUpdatingId(productId);
    try {
      await deleteDoc(doc(db, 'products', productId));
      setNotice('Product deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete product.');
    } finally {
      setUpdatingId('');
    }
  }, [db]);

  const deleteOrderHandler = useCallback(async (orderId: string) => {
    if (!confirm('Delete this order?')) return;
    setError('');
    setNotice('');
    setUpdatingId(orderId);
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      setNotice('Order deleted.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete order.');
    } finally {
      setUpdatingId('');
    }
  }, [db]);

  const changeUserRole = useCallback(async (profile: UserProfile, role: UserRole) => {
    if (profile.uid === user?.uid) {
      setError('You cannot change your own admin role.');
      return;
    }
    setError('');
    setNotice('');
    setUpdatingId(profile.uid);
    try {
      await updateUserRole(profile, role);
      setNotice(`${profile.email ?? profile.displayName ?? 'User'} is now a ${role}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update role.');
    } finally {
      setUpdatingId('');
    }
  }, [user]);

  const handleStatusChange = useCallback(async (orderId: string, status: OrderStatus) => {
    setError('');
    setNotice('');
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setNotice(`Order #${orderId.slice(0, 8)} moved to ${getOrderStatusLabel(status)}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update order status.');
    } finally {
      setUpdatingId('');
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(getFirebaseAuth());
  }, []);

  // ── Render ──

  const sectionDesc: Record<AdminSection, string> = {
    overview: 'A snapshot of how the shop is doing right now.',
    orders: 'Track and move every order through delivery.',
    'order-detail': 'Review and manage order details.',
    upcoming: 'Prepare for next subscription cycles and period dates.',
    products: 'Manage what is live in the catalog.',
    customers: 'Manage accounts and admin access.',
    subscribers: 'Everyone signed up to hear from BloomBox.',
    access: 'How permissions work behind the scenes.',
    inventory: 'Track inventory against revenue.',
    leads: 'Qualify BloomBox leads and move them through the funnel.',
    partners: 'Review and manage partner inquiries.',
    'ai-assist': 'AI-style assistance for marketing, inventory, and sales.',
  };

  return (
    <div className="min-h-screen bg-white text-black lg:grid lg:grid-cols-[220px_1fr]">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        metrics={metrics}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-8 lg:pr-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
            <SectionHeader section={activeSection} desc={sectionDesc[activeSection]} />
            {activeSection === 'products' && (
              <button
                type="button"
                onClick={resetProductForm}
                className="w-fit rounded-md bg-[#a23b35] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#8c302b]"
              >
                + New product
              </button>
            )}
          </div>

          {error && <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
          {notice && <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

          {activeSection === 'overview' && (
            <div className="grid gap-6">
              <MetricsCards
                orders={orders}
                activeOrders={metrics.activeOrders}
                activeProducts={metrics.activeProducts}
                subscribers={metrics.subscribers}
              />
              <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
                <RecentOrders
                  orders={orders}
                  users={users}
                  onViewAll={() => setActiveSection('orders')}
                  onSelectOrder={(order: CustomerOrder) => {
                    setSelectedOrder(order);
                    setActiveSection('order-detail');
                  }}
                />
                <OverviewSidebar
                  revenue={orders
                    .filter((o) => paidStatuses.includes(o.status))
                    .reduce((s, o) => s + (o.total ?? 0), 0)}
                  users={users}
                  admins={users.filter((u) => u.role === 'admin').length}
                  subscribers={subscribers.length}
                />
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <OrdersList
              orders={orders}
              users={users}
              onDeleteOrder={deleteOrderHandler}
              onSelectOrder={(order: CustomerOrder) => {
                setSelectedOrder(order);
                setActiveSection('order-detail');
              }}
            />
          )}

          {activeSection === 'order-detail' && (
            <OrderDetailModal
              order={selectedOrder}
              users={users}
              onClose={() => {
                setSelectedOrder(null);
                setActiveSection('orders');
              }}
              onStatusChange={(status) => {
                if (selectedOrder) handleStatusChange(selectedOrder.id, status);
              }}
              updating={updatingId === selectedOrder?.id}
            />
          )}

          {activeSection === 'upcoming' && (
            <UpcomingSection
              subscriptions={subscriptions}
              users={users}
              cycleProfiles={cycleProfiles}
            />
          )}

          {activeSection === 'products' && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
              <ProductForm
                form={productForm}
                setForm={setFormField}
                imageFile={imageFile}
                setImageFile={setImageFile}
                imagePreview={imageFile ? URL.createObjectURL(imageFile) : productForm.image}
                isEditing={isEditingProduct}
                isSaving={Boolean(updatingId)}
                onSubmit={submitProduct}
                onClear={resetProductForm}
              />
              <ProductList
                products={products}
                onEdit={editProduct}
                onToggle={toggleProduct}
                onDelete={deleteProductHandler}
                updatingId={updatingId}
              />
            </div>
          )}

          {activeSection === 'customers' && (
            <CustomersList
              users={users}
              currentUserId={user?.uid}
              updatingId={updatingId}
              onChangeRole={changeUserRole}
            />
          )}

          {activeSection === 'subscribers' && <SubscribersList subscribers={subscribers} />}

          {activeSection === 'access' && <AccessSection />}

          {activeSection === 'inventory' && (
            <InventorySection
              products={products}
              orders={orders}
              movements={movements}
              user={user}
            />
          )}

          {activeSection === 'leads' && (
            <LeadsSection leads={leads} />
          )}

          {activeSection === 'partners' && (
            <PartnersSection inquiries={partners} />
          )}

          {activeSection === 'ai-assist' && (
            <AiAssistSection
              products={products}
              orders={orders}
              leads={leads}
              movements={movements}
            />
          )}
        </div>
      </main>
    </div>
  );
}