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
  type LeadStage,
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
import { AdminAlert, AdminFormCard, AdminPanel, AdminStatStrip } from './AdminPortalFrame';

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
    'pending-payment': 'border border-amber-200 bg-amber-50 text-amber-900',
    paid: 'border border-emerald-200 bg-emerald-50 text-emerald-800',
    preparing: 'border border-stone-200 bg-stone-100 text-stone-700',
    'out-for-delivery': 'border border-teal-200 bg-teal-50 text-teal-800',
    delivered: 'border border-emerald-200 bg-emerald-50 text-emerald-900',
    cancelled: 'border border-stone-200 bg-stone-50 text-stone-500',
    placed: 'border border-sky-200 bg-sky-50 text-sky-800',
  };
  return styles[status] || 'border border-stone-200 bg-stone-50 text-stone-600';
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
  user,
  onSignOut,
}: {
  activeSection: AdminSection;
  setActiveSection: (s: AdminSection) => void;
  metrics?: { activeOrders: number; activeProducts: number; subscribers: number; leads: number; partners: number };
  user: { email?: string | null } | null;
  onSignOut: () => void;
}) {
  const navigation: { id: AdminSection; label: string; icon: IconName }[] = [
    { id: 'overview', label: 'Overview', icon: 'chart' },
    { id: 'orders', label: 'Orders', icon: 'orders' },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar' },
    { id: 'products', label: 'Products', icon: 'products' },
    { id: 'customers', label: 'Customers', icon: 'users' },
    { id: 'subscribers', label: 'Subscribers', icon: 'mail' },
    { id: 'inventory', label: 'Inventory', icon: 'box' },
    { id: 'leads', label: 'Leads', icon: 'users' },
    { id: 'partners', label: 'Partners', icon: 'handshake' },
    { id: 'ai-assist', label: 'AI Assist', icon: 'sparkles' },
    { id: 'access', label: 'Access', icon: 'shield' },
  ];

  return (
    <aside className="border-b border-white/10 bg-black text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:border-white/10">
      <div className="flex h-full flex-col px-3 py-4 sm:px-4">
        <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-4">
          <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white">
            <Image src="/bloom1.png" alt="BloomBox" fill sizes="36px" className="object-cover" priority />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">BloomBox</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-white/70">Admin</p>
          </div>
        </div>

        <nav
          className="bb-mobile-scroll mt-4 flex gap-1 overflow-x-auto pb-1 lg:mt-5 lg:flex-1 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0"
          aria-label="Admin navigation"
        >
          {navigation.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition lg:w-full ${
                  isActive ? 'bg-[#ae2f34] text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <AdminIcon name={item.icon} className={isActive ? 'text-white' : 'text-white/70'} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ae2f34] text-xs font-bold">
              {(user?.email ?? 'A').slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-white">{user?.email ?? 'Admin'}</p>
              <p className="text-[10px] text-white/70">Administrator</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard"
              className="rounded-lg border border-white/20 px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-white/10"
            >
              View site
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
            >
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
    'order-detail': 'Order details',
    upcoming: 'Upcoming prep',
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
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ae2f34]">Admin</p>
      <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-black sm:text-3xl">{labels[section]}</h1>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-black">{desc}</p>
    </div>
  );
}

// ─── Overview Sections ──────────────────────────────────────

function RecentOrders({ orders, users, onViewAll, onSelectOrder }: any) {
  const recent = orders.slice(0, 8);
  return (
    <AdminPanel
      title="Recent orders"
      description="Latest checkout activity"
      actions={
        <button type="button" onClick={onViewAll} className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-semibold text-[#ae2f34] hover:bg-[#fff5f0]">
          View all
        </button>
      }
    >
      {recent.length === 0 ? <p className="py-4 text-sm text-black">No orders yet.</p> : null}
      <div className="divide-y divide-stone-200">
        {recent.map((order: CustomerOrder) => (
          <button
            type="button"
            key={order.id}
            onClick={() => onSelectOrder(order)}
            className="flex w-full items-center gap-3 py-3 text-left text-sm transition hover:bg-[#fff5f0]"
          >
            <span className="w-16 shrink-0 font-mono text-xs text-black">#{order.id.slice(0, 8)}</span>
            <span className="min-w-0 flex-1 truncate font-medium text-black">{getCustomerName(order, users)}</span>
            <span className="hidden text-xs text-black sm:inline">{getDate(order.createdAt)}</span>
            <span className={`inline-flex min-w-[5.5rem] justify-center px-2.5 py-1 text-[11px] font-semibold ${getStatusButtonStyle(order.status)}`}>
              {getOrderStatusLabel(order.status)}
            </span>
          </button>
        ))}
      </div>
    </AdminPanel>
  );
}

function OverviewSidebar({
  revenue,
  users,
  admins,
  memberships,
  newsletter,
}: {
  revenue: number;
  users: UserProfile[];
  admins: number;
  memberships: number;
  newsletter: number;
}) {
  return (
    <div className="grid gap-5">
      <div className="rounded-md border border-[#e0bfbd] bg-[#fff5f0] p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Paid revenue</p>
        <p className="mt-2 text-3xl font-semibold text-black">{money(revenue)}</p>
        <p className="mt-2 text-sm leading-5 text-black">
          Confirmed paid, preparing, dispatch, and delivered orders.
        </p>
      </div>
      <AdminPanel title="People" description="Accounts and memberships." bordered>
        <div className="divide-y divide-stone-200 text-sm">
          <div className="flex justify-between py-2.5">
            <span className="text-black">Accounts</span>
            <span className="font-semibold text-black">{users.length}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-black">Admins</span>
            <span className="font-semibold text-black">{admins}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-black">Paid tiers</span>
            <span className="font-semibold text-black">{memberships}</span>
          </div>
          <div className="flex justify-between py-2.5">
            <span className="text-black">Newsletter</span>
            <span className="font-semibold text-black">{newsletter}</span>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}

// ─── Orders List ─────────────────────────────────────────────

function OrdersList({ orders, users, onDeleteOrder, onSelectOrder }: any) {
  return (
    <div className="grid gap-5">
      <AdminStatStrip
        items={[
          { label: 'Total orders', value: orders.length, detail: 'All time' },
          {
            label: 'Active',
            value: orders.filter((o: CustomerOrder) => !['delivered', 'cancelled'].includes(o.status)).length,
            detail: 'In progress',
          },
          {
            label: 'Delivered',
            value: orders.filter((o: CustomerOrder) => o.status === 'delivered').length,
            detail: 'Completed',
          },
          {
            label: 'Revenue',
            value: money(
              orders
                .filter((o: CustomerOrder) => paidStatuses.includes(o.status))
                .reduce((s: number, o: CustomerOrder) => s + (o.total ?? 0), 0),
            ),
            detail: 'Paid flow totals',
          },
        ]}
      />
      <AdminPanel title="Order queue" description={`${orders.length} total orders`}>
        {orders.length === 0 ? <p className="py-6 text-sm text-black">No orders have been placed yet.</p> : null}
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            <div className="grid grid-cols-[0.9fr_1.2fr_1fr_0.8fr_0.9fr_0.9fr] border-b border-stone-300 bg-[#fff5f0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
              <span>Order</span>
              <span>Customer</span>
              <span>Location</span>
              <span>Amount</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {orders.map((order: CustomerOrder) => (
              <div
                key={order.id}
                className="grid grid-cols-[0.9fr_1.2fr_1fr_0.8fr_0.9fr_0.9fr] items-center gap-2 border-b border-stone-200 px-3 py-3 text-sm text-black"
              >
                <span className="font-mono text-xs">#{order.id.slice(0, 8)}</span>
                <span className="truncate font-medium">{getCustomerName(order, users)}</span>
                <span className="truncate">{getCustomerLocation(order)}</span>
                <span className="font-semibold text-[#ae2f34]">{money(order.total ?? 0)}</span>
                <span className={`inline-flex w-fit px-2 py-1 text-[11px] font-semibold ${getStatusButtonStyle(order.status)}`}>
                  {getOrderStatusLabel(order.status)}
                </span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => onSelectOrder(order)} className="rounded-md bg-black px-3 py-1 text-xs font-semibold text-white hover:bg-[#ae2f34]">
                    View
                  </button>
                  <button type="button" onClick={() => onDeleteOrder(order.id)} className="border border-rose-600 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AdminPanel>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111827]/50 p-4 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-stone-200 bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-stone-100 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#ae2f34]">Order detail</p>
            <h2 className="text-xl font-semibold text-[#111827]">#{order.id.slice(0, 8).toUpperCase()}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition hover:bg-stone-50"
          >
            ✕
          </button>
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
                      <Image src={item.image || '/bloom1.png'} alt={item.productName} fill sizes="48px" className="object-cover" />
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

// ─── Subscription ecosystem helpers ─────────────────────────

function formatShortDate(value: unknown) {
  if (value instanceof Date) {
    return value.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  if (value && typeof value === 'object' && 'toMillis' in value && typeof (value as { toMillis: () => number }).toMillis === 'function') {
    return new Date((value as { toMillis: () => number }).toMillis()).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return '—';
}

function subscriptionPriceLabel(sub: CustomerSubscription) {
  if (sub.amount === null || sub.amount === undefined) {
    return sub.amountLabel || 'Custom';
  }
  return money(sub.amount);
}

function getPeriodPriority(daysToPeriod: number | null) {
  if (daysToPeriod === null) return 5; // no cycle data
  if (daysToPeriod < 0) return 1; // period due / ongoing
  if (daysToPeriod <= 3) return 1;
  if (daysToPeriod <= 7) return 2;
  if (daysToPeriod <= 12) return 3;
  return 4;
}

function getPeriodPriorityLabel(priority: number) {
  if (priority === 1) return { label: 'Ship / care now', tone: 'border-rose-200 bg-rose-50 text-rose-800' };
  if (priority === 2) return { label: 'Prep this week', tone: 'border-amber-200 bg-amber-50 text-amber-900' };
  if (priority === 3) return { label: 'Upcoming', tone: 'border-teal-200 bg-[#e7fbf8] text-[#00504c]' };
  if (priority === 4) return { label: 'On track', tone: 'border-stone-200 bg-stone-50 text-stone-700' };
  return { label: 'Needs cycle setup', tone: 'border-stone-200 bg-stone-100 text-stone-600' };
}

function getUpcomingWhatsappHref(
  phone: string,
  name: string,
  type: 'remind' | 'wish' | 'tier',
  days?: number | null,
  tierName?: string,
) {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;

  let message = '';
  if (type === 'tier') {
    message = `Hi ${name || 'there'}, this is BloomBox. Your ${tierName || 'monthly care'} subscription is ready for the upcoming cycle${days != null && days >= 0 ? ` (period expected in about ${days} day${days === 1 ? '' : 's'})` : ''}. Reply if you want to adjust items or confirm delivery.`;
  } else if (type === 'remind') {
    message = `Hi ${name || 'there'}, this is BloomBox. We noticed your period is approaching ${days != null && days >= 0 ? `in about ${days} days` : 'soon'}! Your ${tierName || 'care'} plan is set — would you like anything extra before it arrives?`;
  } else {
    message = `Hi ${name || 'there'}, BloomBox is thinking of you as your period approaches. Wishing you a comfortable cycle with your ${tierName || 'BloomBox'} care.`;
  }

  return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}` : '#';
}

type EcosystemRow = {
  key: string;
  userId: string;
  user?: UserProfile;
  sub?: CustomerSubscription;
  cycle?: CycleProfile;
  nextPeriod: Date | null;
  daysToPeriod: number | null;
  priority: number;
};

// ─── Upcoming Section (subscription + cycle ecosystem) ──────

function UpcomingSection({
  subscriptions,
  users,
  cycleProfiles,
}: {
  subscriptions: CustomerSubscription[];
  users: UserProfile[];
  cycleProfiles: CycleProfile[];
}) {
  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.status === 'active'),
    [subscriptions],
  );

  const rows = useMemo(() => {
    const byUser = new Map<string, EcosystemRow>();

    // 1) Every active paid subscription is the source of truth for membership
    for (const sub of activeSubs) {
      const user = users.find((u) => u.uid === sub.userId);
      const cycle = cycleProfiles.find((c) => c.userId === sub.userId);
      const nextPeriod = getNextPeriodDate(cycle ?? null);
      const daysToPeriod =
        nextPeriod != null ? Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000) : null;
      const priority = getPeriodPriority(daysToPeriod);

      byUser.set(sub.userId, {
        key: sub.id,
        userId: sub.userId,
        user,
        sub,
        cycle,
        nextPeriod,
        daysToPeriod,
        // Subscribers without cycle still appear — priority 5 unless period data exists
        priority: cycle ? priority : 5,
      });
    }

    // 2) Cycle trackers without an active sub (still useful for outreach)
    for (const cycle of cycleProfiles) {
      if (byUser.has(cycle.userId)) continue;
      const user = users.find((u) => u.uid === cycle.userId);
      const nextPeriod = getNextPeriodDate(cycle);
      const daysToPeriod =
        nextPeriod != null ? Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000) : null;
      const priority = getPeriodPriority(daysToPeriod);

      byUser.set(cycle.userId, {
        key: cycle.id || cycle.userId,
        userId: cycle.userId,
        user,
        sub: undefined,
        cycle,
        nextPeriod,
        daysToPeriod,
        priority,
      });
    }

    return Array.from(byUser.values()).sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const dateA = a.nextPeriod ? a.nextPeriod.getTime() : Infinity;
      const dateB = b.nextPeriod ? b.nextPeriod.getTime() : Infinity;
      return dateA - dateB;
    });
  }, [activeSubs, users, cycleProfiles]);

  const sections = [
    { id: 1, label: 'Action required', desc: 'Period now or within 3 days — ship care / confirm delivery' },
    { id: 2, label: 'Preparation window', desc: 'Period in 4–7 days — prepare the box' },
    { id: 3, label: 'Upcoming cycles', desc: 'Period in 8–12 days' },
    { id: 4, label: 'On track', desc: 'Period more than 12 days out' },
    { id: 5, label: 'Subscribed · no cycle data', desc: 'Active tier but period dates not saved yet' },
  ];

  return (
    <div className="grid gap-5">
      <AdminStatStrip
        items={[
          {
            label: 'Active tiers',
            value: activeSubs.length,
            detail: 'Paid monthly members',
          },
          {
            label: 'Urgent period',
            value: rows.filter((r) => r.priority === 1).length,
            detail: 'Next 3 days',
          },
          {
            label: 'Prep window',
            value: rows.filter((r) => r.priority === 2).length,
            detail: '4–7 days',
          },
          {
            label: 'Cycles tracked',
            value: cycleProfiles.length,
            detail: 'With period profile',
          },
        ]}
      />

      <AdminPanel
        title="How this works"
        description="When a customer activates a monthly tier and saves cycle settings, they appear here with next period + plan so you can prep boxes on time."
      >
        <div className="grid gap-2 text-sm text-black sm:grid-cols-3">
          <p className="rounded-md border border-stone-200 bg-[#fff5f0] p-3">
            <span className="font-semibold text-[#ae2f34]">1. Subscribe</span>
            <br />
            Customer picks a tier and activates card on /subscriptions.
          </p>
          <p className="rounded-md border border-stone-200 bg-[#fff5f0] p-3">
            <span className="font-semibold text-[#ae2f34]">2. Track cycle</span>
            <br />
            They save last period + averages on /cycle so next period is predicted.
          </p>
          <p className="rounded-md border border-stone-200 bg-[#fff5f0] p-3">
            <span className="font-semibold text-[#ae2f34]">3. Admin prep</span>
            <br />
            You see their tier + countdown here and can WhatsApp remind.
          </p>
        </div>
      </AdminPanel>

      {sections.map((section) => {
        const sectionRows = rows.filter((r) => r.priority === section.id);
        if (sectionRows.length === 0 && section.id !== 1 && section.id !== 5) return null;

        return (
          <AdminPanel
            key={section.id}
            title={section.label}
            description={`${section.desc} · ${sectionRows.length} ${sectionRows.length === 1 ? 'person' : 'people'}`}
          >
            {sectionRows.length === 0 ? (
              <div className="rounded-md border border-dashed border-stone-300 p-6 text-center text-sm text-black">
                No one in this window right now.
              </div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="grid gap-3 lg:hidden">
                  {sectionRows.map((row) => {
                    const phone = row.user?.deliveryDetails?.phoneNumber || '';
                    const customerName =
                      row.user?.displayName || row.cycle?.displayName || row.user?.email || 'Customer';
                    const badge = getPeriodPriorityLabel(row.priority);
                    const tierName = row.sub?.planName;

                    return (
                      <article
                        key={row.key}
                        className="rounded-md border border-stone-200 bg-white p-3.5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-black">{customerName}</p>
                            <p className="truncate text-xs text-stone-500">{row.user?.email || 'No email'}</p>
                          </div>
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${badge.tone}`}>
                            {badge.label}
                          </span>
                        </div>

                        <div className="mt-3 rounded-md border border-[#e0bfbd] bg-[#fff5f0] p-3">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ae2f34]">
                            Period tier
                          </p>
                          {row.sub ? (
                            <>
                              <p className="mt-1 font-serif text-lg font-semibold text-[#191c1d]">{row.sub.planName}</p>
                              <p className="mt-0.5 text-sm font-semibold text-[#006a65]">
                                {subscriptionPriceLabel(row.sub)} / mo · {row.sub.status}
                              </p>
                              <p className="mt-1 text-xs text-stone-600">
                                Next billing: {formatShortDate(row.sub.nextBillingAt)}
                              </p>
                            </>
                          ) : (
                            <p className="mt-1 text-sm text-stone-600">No active subscription — cycle tracking only</p>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                          <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Next period</p>
                            <p className="mt-0.5 font-semibold text-black">
                              {row.nextPeriod ? formatShortDate(row.nextPeriod) : 'Not set'}
                            </p>
                            {row.daysToPeriod != null ? (
                              <p className={`text-xs font-semibold ${row.daysToPeriod <= 3 ? 'text-[#ae2f34]' : 'text-stone-600'}`}>
                                {row.daysToPeriod < 0
                                  ? 'Due / ongoing'
                                  : `In ${row.daysToPeriod} day${row.daysToPeriod === 1 ? '' : 's'}`}
                              </p>
                            ) : (
                              <p className="text-xs text-stone-500">Ask them to open /cycle</p>
                            )}
                          </div>
                          <div className="rounded-md border border-stone-200 bg-stone-50 p-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wide text-stone-500">Contact</p>
                            <p className="mt-0.5 truncate text-xs font-medium text-black">
                              {phone || 'No phone'}
                            </p>
                            <p className="truncate text-xs text-stone-500">
                              {[row.user?.deliveryDetails?.town, row.user?.deliveryDetails?.county]
                                .filter(Boolean)
                                .join(', ') || 'No location'}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <a
                            href={getUpcomingWhatsappHref(phone, customerName, 'tier', row.daysToPeriod, tierName)}
                            target="_blank"
                            rel="noreferrer"
                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                              phone
                                ? 'bg-[#006a65] text-white'
                                : 'pointer-events-none border border-stone-200 text-black/30'
                            }`}
                          >
                            Confirm tier
                          </a>
                          <a
                            href={getUpcomingWhatsappHref(phone, customerName, 'remind', row.daysToPeriod, tierName)}
                            target="_blank"
                            rel="noreferrer"
                            className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                              phone
                                ? 'border-[#006a65] text-[#006a65]'
                                : 'pointer-events-none border-stone-200 text-black/30'
                            }`}
                          >
                            Remind
                          </a>
                          <a
                            href={getUpcomingWhatsappHref(phone, customerName, 'wish', row.daysToPeriod, tierName)}
                            target="_blank"
                            rel="noreferrer"
                            className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                              phone
                                ? 'border-[#ae2f34] text-[#ae2f34]'
                                : 'pointer-events-none border-stone-200 text-black/30'
                            }`}
                          >
                            Wish well
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <div className="min-w-[980px]">
                    <div className="grid grid-cols-[1.3fr_1.15fr_1fr_0.95fr_1fr] border-b border-stone-300 bg-[#fff5f0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                      <span>Customer</span>
                      <span>Period tier</span>
                      <span>Next period</span>
                      <span>Billing / contact</span>
                      <span>WhatsApp</span>
                    </div>

                    {sectionRows.map((row) => {
                      const phone = row.user?.deliveryDetails?.phoneNumber || '';
                      const customerName =
                        row.user?.displayName || row.cycle?.displayName || row.user?.email || 'Customer';
                      const location = [row.user?.deliveryDetails?.town, row.user?.deliveryDetails?.county]
                        .filter(Boolean)
                        .join(', ');
                      const badge = getPeriodPriorityLabel(row.priority);
                      const tierName = row.sub?.planName;
                      const urgent = row.daysToPeriod != null && row.daysToPeriod <= 3;

                      return (
                        <div
                          key={row.key}
                          className="grid grid-cols-[1.3fr_1.15fr_1fr_0.95fr_1fr] items-center gap-3 border-b border-stone-200 px-3 py-3 text-sm text-black"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fff5f0] text-xs font-bold uppercase text-[#ae2f34]">
                              {customerName.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-black">{customerName}</p>
                              <p className="truncate text-xs text-stone-500">{row.user?.email || 'No email'}</p>
                              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${badge.tone}`}>
                                {badge.label}
                              </span>
                            </div>
                          </div>

                          <div className="min-w-0 rounded-md border border-[#e0bfbd] bg-[#fff5f0] px-2.5 py-2">
                            {row.sub ? (
                              <>
                                <p className="truncate font-semibold text-[#191c1d]">{row.sub.planName}</p>
                                <p className="text-xs font-semibold text-[#006a65]">
                                  {subscriptionPriceLabel(row.sub)} / mo
                                </p>
                                <p className="mt-0.5 text-[11px] text-stone-500">
                                  {row.sub.planId} · {row.sub.status}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-stone-600">No active tier</p>
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-black">
                              {row.nextPeriod ? formatShortDate(row.nextPeriod) : 'Not set'}
                            </p>
                            {row.daysToPeriod != null ? (
                              <p className={`mt-0.5 text-xs font-semibold ${urgent ? 'text-[#ae2f34]' : 'text-stone-600'}`}>
                                {row.daysToPeriod < 0
                                  ? 'Due / ongoing'
                                  : `In ${row.daysToPeriod} day${row.daysToPeriod === 1 ? '' : 's'}`}
                              </p>
                            ) : (
                              <p className="mt-0.5 text-xs text-stone-500">Cycle profile incomplete</p>
                            )}
                            {row.cycle ? (
                              <p className="mt-0.5 text-[11px] text-stone-500">
                                Avg {row.cycle.averageCycleLength}d · period {row.cycle.averagePeriodLength}d
                              </p>
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            {row.sub ? (
                              <p className="text-xs font-medium text-black">
                                Bill: {formatShortDate(row.sub.nextBillingAt)}
                              </p>
                            ) : null}
                            <p className="truncate text-xs text-stone-600">{location || 'No location'}</p>
                            <p className="truncate text-xs text-stone-500">{phone || 'No phone'}</p>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            <a
                              href={getUpcomingWhatsappHref(phone, customerName, 'tier', row.daysToPeriod, tierName)}
                              target="_blank"
                              rel="noreferrer"
                              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                                phone
                                  ? 'bg-[#006a65] text-white hover:bg-[#004b48]'
                                  : 'pointer-events-none border border-stone-200 text-black/30'
                              }`}
                            >
                              Tier
                            </a>
                            <a
                              href={getUpcomingWhatsappHref(phone, customerName, 'remind', row.daysToPeriod, tierName)}
                              target="_blank"
                              rel="noreferrer"
                              className={`rounded-md border px-3 py-1.5 text-xs font-semibold ${
                                phone
                                  ? 'border-[#006a65] text-[#006a65] hover:bg-[#e7fbf8]'
                                  : 'pointer-events-none border-stone-200 text-black/30'
                              }`}
                            >
                              Remind
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </AdminPanel>
        );
      })}
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
    <form onSubmit={onSubmit}>
      <AdminFormCard eyebrow="Catalog record" title={isEditing ? `Edit product` : 'New product'}>
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

        <div className="flex gap-3 border-t border-stone-300 pt-4">
          <button type="submit" disabled={isSaving} className="rounded-md flex-1 bg-[#ae2f34] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-50">
            {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add product'}
          </button>
          <button type="button" onClick={onClear} className="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#fff5f0]">
            Clear
          </button>
        </div>
      </div>
      </AdminFormCard>
    </form>
  );
}

function ProductList({ products, onEdit, onToggle, onDelete, updatingId }: any) {
  return (
    <AdminPanel title="Catalog" description={`${products.length} products`}>
      <div className="divide-y divide-stone-200">
        {products.map((product: CatalogProduct) => (
          <div
            key={product.id}
            className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-11 w-11 shrink-0 overflow-hidden border border-stone-200">
                <Image src={product.image || '/bloom1.png'} alt={product.name} fill sizes="44px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-black">{product.name}</p>
                <p className="mt-0.5 truncate text-xs text-black">{product.categoryName}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:shrink-0">
              <p className="text-sm font-semibold text-[#ae2f34]">
                {product.price === null ? product.priceNote ?? 'Pending' : money(product.price)}
              </p>
              <span
                className={`border px-2.5 py-0.5 text-[11px] font-semibold ${
                  product.isActive === false
                    ? 'border-stone-300 bg-white text-black'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                }`}
              >
                {product.isActive === false ? 'Hidden' : 'Live'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => onEdit(product)} className="rounded-md border border-stone-300 px-3 py-1 text-xs font-semibold text-black hover:bg-[#fff5f0]">
                  Edit
                </button>
                <button type="button" disabled={updatingId === product.id} onClick={() => onToggle(product)} className="rounded-md border border-stone-300 px-3 py-1 text-xs font-semibold text-black hover:bg-[#fff5f0] disabled:opacity-50">
                  {product.isActive === false ? 'Show' : 'Hide'}
                </button>
                <button type="button" onClick={() => onDelete(product.id)} className="border border-rose-600 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}

// ─── Customers ─────────────────────────────────────────────

function CustomersList({
  users,
  currentUserId,
  updatingId,
  onChangeRole,
  subscriptions,
  cycleProfiles,
}: {
  users: UserProfile[];
  currentUserId?: string;
  updatingId: string;
  onChangeRole: (profile: UserProfile, role: UserRole) => void;
  subscriptions: CustomerSubscription[];
  cycleProfiles: CycleProfile[];
}) {
  const admins = users.filter((u) => u.role === 'admin').length;
  const activeSubs = subscriptions.filter((s) => s.status === 'active');

  return (
    <div className="grid gap-5">
      <AdminStatStrip
        items={[
          { label: 'Users', value: users.length, detail: 'All accounts' },
          { label: 'Admins', value: admins, detail: 'Staff access' },
          { label: 'Paid tiers', value: activeSubs.length, detail: 'Active memberships' },
          { label: 'Cycles tracked', value: cycleProfiles.length, detail: 'Period profiles' },
        ]}
      />
      <AdminPanel title="Accounts" description={`${users.length} users · ${activeSubs.length} on a monthly tier`}>
        <div className="divide-y divide-stone-200">
          {users.map((profile) => {
            const sub = activeSubs.find((s) => s.userId === profile.uid);
            const cycle = cycleProfiles.find((c) => c.userId === profile.uid);
            const nextPeriod = getNextPeriodDate(cycle ?? null);
            const daysToPeriod =
              nextPeriod != null ? Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000) : null;

            return (
              <div key={profile.uid} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ae2f34] text-sm font-semibold text-white">
                    {(profile.displayName || profile.email || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-black">
                      {profile.displayName || profile.email || 'Unnamed user'}
                    </p>
                    <p className="truncate text-xs text-stone-500">{profile.email ?? profile.uid}</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {sub ? (
                        <span className="rounded-full border border-[#e0bfbd] bg-[#fff5f0] px-2 py-0.5 text-[10px] font-bold text-[#8c1520]">
                          {sub.planName} · {subscriptionPriceLabel(sub)}
                        </span>
                      ) : (
                        <span className="rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5 text-[10px] font-semibold text-stone-500">
                          No tier
                        </span>
                      )}
                      {nextPeriod ? (
                        <span className="rounded-full border border-teal-200 bg-[#e7fbf8] px-2 py-0.5 text-[10px] font-semibold text-[#00504c]">
                          Period {formatShortDate(nextPeriod)}
                          {daysToPeriod != null ? ` · ${daysToPeriod}d` : ''}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
                <p className="hidden w-24 shrink-0 truncate text-xs text-black sm:block">
                  {profile.deliveryDetails?.town ?? '—'}
                </p>
                <select
                  value={profile.role}
                  onChange={(e) => onChangeRole(profile, e.target.value as UserRole)}
                  disabled={updatingId === profile.uid || profile.uid === currentUserId}
                  className={`w-fit shrink-0 rounded-md border px-3 py-1 text-xs font-semibold outline-none disabled:opacity-50 ${
                    profile.role === 'admin'
                      ? 'border-[#e0bfbd] bg-[#fff5f0] text-[#ae2f34]'
                      : 'border-stone-300 bg-white text-black'
                  }`}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            );
          })}
        </div>
      </AdminPanel>
    </div>
  );
}

// ─── Subscribers (paid members + newsletter) ─────────────────

function SubscribersList({
  subscribers,
  subscriptions,
  users,
  cycleProfiles,
}: {
  subscribers: NewsletterSubscriber[];
  subscriptions: CustomerSubscription[];
  users: UserProfile[];
  cycleProfiles: CycleProfile[];
}) {
  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.status === 'active'),
    [subscriptions],
  );

  const membershipRows = useMemo(() => {
    return activeSubs
      .map((sub) => {
        const user = users.find((u) => u.uid === sub.userId);
        const cycle = cycleProfiles.find((c) => c.userId === sub.userId);
        const nextPeriod = getNextPeriodDate(cycle ?? null);
        const daysToPeriod =
          nextPeriod != null ? Math.ceil((nextPeriod.getTime() - Date.now()) / 86400000) : null;
        return { sub, user, cycle, nextPeriod, daysToPeriod };
      })
      .sort((a, b) => {
        const da = a.daysToPeriod ?? 999;
        const db = b.daysToPeriod ?? 999;
        return da - db;
      });
  }, [activeSubs, users, cycleProfiles]);

  return (
    <div className="grid gap-5">
      <AdminStatStrip
        items={[
          { label: 'Paid members', value: activeSubs.length, detail: 'Active monthly tiers' },
          {
            label: 'Period this week',
            value: membershipRows.filter((r) => r.daysToPeriod != null && r.daysToPeriod <= 7).length,
            detail: 'Within 7 days',
          },
          { label: 'Newsletter', value: subscribers.length, detail: 'Email list' },
          {
            label: 'Latest email',
            value: subscribers[0] ? getDate(subscribers[0].updatedAt ?? subscribers[0].createdAt) : '—',
            detail: 'Most recent signup',
          },
        ]}
      />

      <AdminPanel
        title="Monthly memberships"
        description={`${activeSubs.length} active tier${activeSubs.length === 1 ? '' : 's'} · period + plan for ops`}
      >
        {membershipRows.length === 0 ? (
          <p className="py-6 text-sm text-black">
            No active paid subscriptions yet. When someone activates a tier on /subscriptions, they appear here with plan and next period.
          </p>
        ) : (
          <div className="divide-y divide-stone-200">
            {membershipRows.map(({ sub, user, nextPeriod, daysToPeriod, cycle }) => {
              const name = user?.displayName || user?.email || 'Member';
              const urgent = daysToPeriod != null && daysToPeriod <= 3;
              return (
                <div key={sub.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-black">{name}</p>
                    <p className="truncate text-xs text-stone-500">{user?.email || sub.userId}</p>
                  </div>
                  <div className="min-w-0 rounded-md border border-[#e0bfbd] bg-[#fff5f0] px-3 py-2 sm:w-52">
                    <p className="truncate text-sm font-semibold text-[#191c1d]">{sub.planName}</p>
                    <p className="text-xs font-semibold text-[#006a65]">{subscriptionPriceLabel(sub)} / mo</p>
                  </div>
                  <div className="sm:w-36">
                    <p className="text-xs font-semibold text-black">
                      {nextPeriod ? formatShortDate(nextPeriod) : 'Period not set'}
                    </p>
                    {daysToPeriod != null ? (
                      <p className={`text-xs font-semibold ${urgent ? 'text-[#ae2f34]' : 'text-stone-600'}`}>
                        {daysToPeriod < 0 ? 'Due now' : `In ${daysToPeriod}d`}
                      </p>
                    ) : cycle ? (
                      <p className="text-xs text-stone-500">Check cycle dates</p>
                    ) : (
                      <p className="text-xs text-stone-500">No /cycle profile</p>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 sm:w-32 sm:text-right">
                    Bill {formatShortDate(sub.nextBillingAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-4 border-t border-stone-200 pt-3 text-xs text-stone-500">
          Full prep queues with WhatsApp live under <span className="font-semibold text-[#ae2f34]">Upcoming</span>.
        </p>
      </AdminPanel>

      <AdminPanel title="Newsletter list" description={`${subscribers.length} community emails`}>
        {subscribers.length === 0 ? <p className="py-6 text-sm text-black">No newsletter subscribers yet.</p> : null}
        <div className="divide-y divide-stone-200">
          {subscribers.map((subscriber) => (
            <div key={subscriber.email} className="flex items-center gap-4 py-3">
              <p className="min-w-0 flex-1 truncate text-sm text-black">{subscriber.email}</p>
              <p className="shrink-0 rounded-md border border-stone-200 px-2 py-0.5 text-xs text-black">
                {subscriber.source || 'website'}
              </p>
              <p className="hidden w-28 shrink-0 text-right text-xs text-black sm:block">
                {getDate(subscriber.updatedAt ?? subscriber.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </AdminPanel>
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
              <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="rounded-md border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]">
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-black/80">
              Movement type
              <select value={movementType} onChange={(e) => setMovementType(e.target.value as InventoryMovementType)} className="rounded-md border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]">
                <option value="incoming">Incoming stock</option>
                <option value="outgoing">Manual outgoing stock</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-black/80">
                Quantity
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="rounded-md border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-black/80">
                Unit cost
                <input type="number" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} className="rounded-md border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]" />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-black/80">
              Linked order ID
              <input value={linkedOrderId} onChange={(e) => setLinkedOrderId(e.target.value)} className="rounded-md border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]" placeholder="Optional" />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-black/80">
              Reason
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="rounded-md resize-none border border-black/20 px-3 py-2 font-normal outline-none focus:border-[#a23b35]" placeholder="Supplier delivery, shrinkage, order correction..." />
            </label>

            <button disabled={isSaving || !selectedProduct} className="rounded-md bg-[#a23b35] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c302b] disabled:opacity-60">
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
                <span className="rounded-md border border-[#e0bfbd] bg-[#fff5f0] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a23b35]">{movement.type}</span>
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
                      className="rounded-md border border-black/20 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-black outline-none focus:border-[#a23b35]"
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
                      className="rounded-md resize-none border border-black/20 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-black outline-none focus:border-[#a23b35]"
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
                      className="rounded-md border border-black/20 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-black outline-none focus:border-[#a23b35]"
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
                    className="rounded-md inline-flex justify-center border border-[#006a65] px-4 py-2 text-sm font-semibold text-[#006a65] hover:bg-[#e7fbf8]"
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
    const activeMemberships = subscriptions.filter((s) => s.status === 'active').length;
    return {
      activeOrders,
      activeProducts,
      subscribers: activeMemberships || subscribers.length,
      memberships: activeMemberships,
      newsletter: subscribers.length,
      leads: leads.filter((l) => !['won', 'nurture'].includes(l.stage)).length,
      partners: partners.filter((p) => p.status === 'new' || p.status === 'reviewing').length,
    };
  }, [orders, products, subscribers, subscriptions, leads, partners]);

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
    upcoming: 'Active tiers + next period dates so you can prep boxes on time.',
    products: 'Manage what is live in the catalog.',
    customers: 'Accounts with membership tier and period status.',
    subscribers: 'Paid monthly members and the newsletter email list.',
    access: 'How permissions work behind the scenes.',
    inventory: 'Track inventory against revenue.',
    leads: 'Qualify BloomBox leads and move them through the funnel.',
    partners: 'Review and manage partner inquiries.',
    'ai-assist': 'AI-style assistance for marketing, inventory, and sales.',
  };

  return (
    <div className="min-h-screen bg-white text-black lg:grid lg:grid-cols-[240px_1fr]">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        metrics={metrics}
        user={user}
        onSignOut={handleSignOut}
      />

      <main className="min-w-0 bg-white">
        <div className="sticky top-0 z-20 border-b border-black/10 bg-white px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SectionHeader section={activeSection} desc={sectionDesc[activeSection]} />
            {activeSection === 'products' && (
              <button
                type="button"
                onClick={resetProductForm}
                className="w-fit rounded-lg bg-[#ae2f34] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8c1520]"
              >
                + New product
              </button>
            )}
          </div>
        </div>

        <div className="bg-white px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-5">
          {error ? <AdminAlert>{error}</AdminAlert> : null}
          {notice ? <AdminAlert tone="success">{notice}</AdminAlert> : null}

          {activeSection === 'overview' && (
            <>
              <AdminStatStrip
                items={[
                  { label: 'Total orders', value: orders.length, detail: 'All time' },
                  { label: 'Active orders', value: metrics.activeOrders, detail: 'In progress' },
                  { label: 'Live products', value: metrics.activeProducts, detail: 'Visible in shop' },
                  { label: 'Paid tiers', value: metrics.memberships, detail: 'Active memberships' },
                ]}
              />
              <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
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
                  memberships={metrics.memberships}
                  newsletter={metrics.newsletter}
                />
              </div>
            </>
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
            <>
              <AdminStatStrip
                items={[
                  { label: 'Products', value: products.length, detail: 'In catalog' },
                  { label: 'Live', value: products.filter((p) => p.isActive !== false).length, detail: 'Visible' },
                  { label: 'Hidden', value: products.filter((p) => p.isActive === false).length, detail: 'Off shelf' },
                  { label: 'Categories', value: productCategories.length, detail: 'Product groups' },
                ]}
              />
              <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
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
            </>
          )}

          {activeSection === 'customers' && (
            <CustomersList
              users={users}
              currentUserId={user?.uid}
              updatingId={updatingId}
              onChangeRole={changeUserRole}
              subscriptions={subscriptions}
              cycleProfiles={cycleProfiles}
            />
          )}

          {activeSection === 'subscribers' && (
            <SubscribersList
              subscribers={subscribers}
              subscriptions={subscriptions}
              users={users}
              cycleProfiles={cycleProfiles}
            />
          )}

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
        </div>
      </main>
    </div>
  );
}