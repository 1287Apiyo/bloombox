'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  subscribeToUserOrders,
  type CustomerOrder,
  type DeliveryDetails,
  type OrderItem,
  type OrderStatus,
} from '@/lib/firestore';
import { useAuth } from '../components/AuthProvider';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const paidStatuses: OrderStatus[] = ['paid', 'preparing', 'out-for-delivery', 'delivered'];
const finalStatuses: OrderStatus[] = ['delivered', 'cancelled'];
const unpaidActiveWindowMs = 2 * 60 * 60 * 1000;

const orderImageRules = [
  { prefix: 'pads-marvel-girl', image: '/products/marvel.jpg' },
  { prefix: 'pads-sunny-girl', image: '/products/kot.jpg' },
  { prefix: 'menstrual-cups', image: '/products/menscups.jpg' },
  { prefix: 'tampons', image: '/products/tampons.jpg' },
  { prefix: 'period-panties', image: '/products/pps.jpg' },
  { prefix: 'wet-wipes', image: '/products/wet-wipes.png' },
  { prefix: 'pocket-tissues', image: '/products/pocket.jpg' },
  { prefix: 'pad-bags', image: '/products/adbags.jpg' },
  { prefix: 'face-masks', image: '/products/facemasks.jpg' },
  { prefix: 'scented-candles', image: '/products/candle.jpg' },
  { prefix: 'bath-bombs', image: '/products/bathbombs.jpg' },
  { prefix: 'shower-steamers', image: '/products/bathbombs.jpg' },
  { prefix: 'hot-water-bottles', image: '/products/waterbottles.jpg' },
  { prefix: 'body-scrub', image: '/products/bathbombs.jpg' },
  { prefix: 'flowers', image: '/mockups/bloombox-gift-flowers.png' },
] as const;

// ---------- Helpers ----------
function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
  return 'Just now';
}

function getTimestampMs(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }
  return null;
}

function isPaymentConfirmed(order: CustomerOrder) {
  return (
    order.payment?.status === 'successful' ||
    order.paymentStatus === 'successful' ||
    paidStatuses.includes(order.status)
  );
}

function isUnpaidOrderExpired(order: CustomerOrder, now: number | null) {
  if (!now || isPaymentConfirmed(order) || !['placed', 'pending-payment'].includes(order.status)) return false;
  const createdAtMs = getTimestampMs(order.createdAt);
  return createdAtMs !== null && now - createdAtMs > unpaidActiveWindowMs;
}

function isActiveOrder(order: CustomerOrder, now: number | null) {
  if (finalStatuses.includes(order.status)) return false;
  return !isUnpaidOrderExpired(order, now);
}

function getStatusLabel(order: CustomerOrder) {
  if (order.status === 'pending-payment') return 'Awaiting payment';
  if (order.status === 'paid') return 'Paid';
  if (order.status === 'preparing') return 'Preparing';
  if (order.status === 'out-for-delivery') return 'Out for delivery';
  if (order.status === 'delivered') return 'Delivered';
  if (order.status === 'cancelled') return 'Cancelled';
  return 'Placed';
}

/** Soft status chips */
function getStatusStyle(order: CustomerOrder) {
  if (order.status === 'delivered') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (order.status === 'paid') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (order.status === 'preparing') return 'border-stone-200 bg-stone-50 text-stone-700';
  if (order.status === 'out-for-delivery') return 'border-teal-200 bg-[#e7fbf8] text-[#00504c]';
  if (order.status === 'pending-payment' || order.status === 'placed') {
    return 'border-amber-200 bg-[#fff8df] text-[#76574e]';
  }
  if (order.status === 'cancelled') return 'border-stone-200 bg-stone-100 text-stone-500';
  return 'border-[#e0bfbd] bg-[#fff5f0] text-[#8c1520]';
}

function getTrackingSteps(order: CustomerOrder) {
  const paymentSuccessful = isPaymentConfirmed(order);
  const preparing =
    ['preparing', 'out-for-delivery', 'delivered'].includes(order.status) ||
    ['preparing', 'out-for-delivery', 'delivered'].includes(order.deliveryStatus);
  const outForDelivery =
    ['out-for-delivery', 'delivered'].includes(order.status) ||
    ['out-for-delivery', 'delivered'].includes(order.deliveryStatus);
  const delivered = order.status === 'delivered' || order.deliveryStatus === 'delivered';

  return [
    { label: 'Placed', complete: true },
    { label: 'Paid', complete: paymentSuccessful },
    { label: 'Preparing', complete: preparing },
    { label: 'On the way', complete: outForDelivery },
    { label: 'Delivered', complete: delivered },
  ];
}

function getActiveStepIndex(order: CustomerOrder) {
  const steps = getTrackingSteps(order);
  let last = 0;
  steps.forEach((step, i) => {
    if (step.complete) last = i;
  });
  return last;
}

function getDeliveryDetails(order: CustomerOrder): DeliveryDetails | null {
  return order.deliveryDetails ?? null;
}

function getOrderItems(order: CustomerOrder): OrderItem[] {
  return Array.isArray(order.items) ? order.items : [];
}

function getOrderImage(item: OrderItem) {
  const match = orderImageRules.find((rule) => item.productId?.startsWith(rule.prefix));
  return match?.image ?? item.image ?? '/bloom1.png';
}

// ---------- Progress line (shown inside dropdown) ----------
function TrackingProgress({ order }: { order: CustomerOrder }) {
  const steps = getTrackingSteps(order);
  const activeIndex = getActiveStepIndex(order);
  const progressPct = Math.round((activeIndex / Math.max(steps.length - 1, 1)) * 100);

  return (
    <div className="w-full">
      {/* Mobile: compact current status + bar */}
      <div className="sm:hidden">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#191c1d]">{steps[activeIndex]?.label ?? 'Placed'}</p>
          <p className="text-[11px] font-medium text-stone-500">
            Step {activeIndex + 1} of {steps.length}
          </p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full rounded-full bg-[#006a65] transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="mt-2 flex justify-between gap-1">
          {steps.map((step, index) => (
            <span
              key={step.label}
              className={`h-1.5 flex-1 rounded-full ${
                index <= activeIndex ? (step.complete || index === activeIndex ? 'bg-[#006a65]' : 'bg-[#ae2f34]') : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[9px] font-medium text-stone-400">
          <span>Placed</span>
          <span>Delivered</span>
        </div>
      </div>

      {/* Desktop: full step rail */}
      <div className="hidden sm:block">
        <div className="flex items-start justify-between gap-1">
          {steps.map((step, index) => {
            const done = step.complete;
            const current = index === activeIndex;
            return (
              <div key={step.label} className="flex flex-1 flex-col items-center text-center">
                <div className="relative flex w-full items-center justify-center">
                  {index > 0 && (
                    <span
                      className={`absolute right-1/2 left-0 top-1/2 h-px -translate-y-1/2 ${
                        steps[index - 1].complete ? 'bg-[#006a65]' : 'bg-stone-200'
                      }`}
                    />
                  )}
                  {index < steps.length - 1 && (
                    <span
                      className={`absolute left-1/2 right-0 top-1/2 h-px -translate-y-1/2 ${
                        done ? 'bg-[#006a65]' : 'bg-stone-200'
                      }`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-bold ${
                      done
                        ? 'border-[#006a65] bg-[#006a65] text-white'
                        : current
                          ? 'border-[#ae2f34] bg-white text-[#ae2f34]'
                          : 'border-stone-200 bg-white text-stone-400'
                    }`}
                  >
                    {done ? '✓' : index + 1}
                  </span>
                </div>
                <p
                  className={`mt-1.5 text-[11px] font-medium ${
                    done || current ? 'text-[#191c1d]' : 'text-stone-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ---------- Order card (thin rounded box + dropdown) ----------
function OrderCard({
  order,
  isOpen,
  toggleKey,
  onToggle,
}: {
  order: CustomerOrder;
  isOpen: boolean;
  toggleKey: string;
  onToggle: (orderId: string) => void;
}) {
  const deliveryDetails = getDeliveryDetails(order);
  const orderItems = getOrderItems(order);
  const thumb = orderItems[0] ? getOrderImage(orderItems[0]) : '/mockups/bloombox-open-box.png';

  const activeStep = getTrackingSteps(order)[getActiveStepIndex(order)];

  return (
    <article className="overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-2xl">
      <button
        type="button"
        onClick={() => onToggle(toggleKey)}
        className="flex w-full items-start gap-3 px-3 py-3 text-left transition hover:bg-[#fafaf9] sm:items-center sm:gap-4 sm:px-5 sm:py-3.5"
        aria-expanded={isOpen}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-stone-100 bg-stone-50 sm:h-12 sm:w-12">
          <Image src={thumb} alt="" fill sizes="48px" className="object-cover" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#191c1d] sm:text-base">
                #{order.id.slice(0, 8).toUpperCase()}
              </p>
              <p className="mt-0.5 text-[11px] text-stone-500 sm:text-xs">
                {formatDate(order.createdAt)}
                {orderItems.length > 0
                  ? ` · ${orderItems.length} item${orderItems.length === 1 ? '' : 's'}`
                  : ''}
              </p>
            </div>
            <p className="shrink-0 text-sm font-bold text-[#191c1d] sm:hidden">{money(order.total ?? 0)}</p>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusStyle(order)}`}
            >
              {getStatusLabel(order)}
            </span>
            {!isOpen ? (
              <span className="text-[11px] text-stone-500 sm:hidden">
                {activeStep?.label ?? 'Placed'}
              </span>
            ) : null}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <p className="text-sm font-semibold text-[#191c1d]">{money(order.total ?? 0)}</p>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition ${
              isOpen ? 'border-[#ae2f34] bg-[#fff5f0] text-[#ae2f34]' : 'bg-white'
            }`}
          >
            <ChevronIcon open={isOpen} />
          </span>
        </div>

        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition sm:hidden ${
            isOpen ? 'border-[#ae2f34] bg-[#fff5f0] text-[#ae2f34]' : 'bg-white'
          }`}
        >
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-stone-100 px-3 pb-3.5 pt-3 sm:px-5 sm:pb-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
            Tracking
          </p>
          <TrackingProgress order={order} />

          <div className="mt-4 grid gap-2.5 sm:mt-5 sm:gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                Items
              </p>
              <div className="space-y-2">
                {orderItems.length === 0 && (
                  <p className="rounded-xl border border-stone-100 bg-[#fafaf9] px-3 py-2.5 text-xs text-stone-500">
                    No item details saved for this order.
                  </p>
                )}
                {orderItems.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2.5 rounded-xl border border-stone-100 bg-[#fafaf9] px-2 py-2 sm:gap-3 sm:px-2.5"
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-stone-100 bg-white sm:h-10 sm:w-10">
                      <Image
                        src={getOrderImage(item)}
                        alt={item.productName}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-medium leading-snug text-[#191c1d] sm:truncate">
                        {item.productName ?? 'BloomBox item'}
                      </p>
                      <p className="text-xs text-stone-500">Qty {item.quantity}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-[#ae2f34]">
                      {item.priceNote ?? (item.price === null ? '—' : money(item.price ?? 0))}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:space-y-0 sm:gap-2">
              <div className="rounded-xl border border-stone-100 bg-[#fff5f0] px-3 py-2.5 sm:px-3.5 sm:py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ae2f34]">
                  Delivery
                </p>
                {deliveryDetails ? (
                  <div className="mt-1.5 space-y-0.5 text-sm leading-6 text-[#584140] sm:mt-2">
                    <p className="font-medium text-[#191c1d]">
                      {deliveryDetails.recipientName || 'Recipient not saved'}
                    </p>
                    <p className="text-xs">{deliveryDetails.phoneNumber || 'Phone not saved'}</p>
                    <p className="text-xs">
                      {[deliveryDetails.addressLine, deliveryDetails.town, deliveryDetails.county]
                        .filter(Boolean)
                        .join(', ') || 'Address not saved'}
                    </p>
                    {deliveryDetails.landmark ? (
                      <p className="text-xs">Landmark: {deliveryDetails.landmark}</p>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-[#584140] sm:mt-2">No delivery details on this order.</p>
                )}
              </div>

              <div className="rounded-xl border border-stone-100 bg-white px-3 py-2.5 sm:px-3.5 sm:py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-stone-400">
                    Payment
                  </p>
                  <p className="text-sm font-bold text-[#191c1d] sm:hidden">{money(order.total ?? 0)}</p>
                </div>
                <p className="mt-1 text-sm font-medium text-[#191c1d] sm:mt-1.5">
                  {order.payment?.label ?? 'Payment method'}
                </p>
                <p className="text-xs text-stone-500">
                  {order.payment?.status ?? 'pending'}
                  {order.payment?.receiptNumber ? ` · ${order.payment.receiptNumber}` : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

// ---------- Page ----------
export default function OrdersPage() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [error, setError] = useState('');
  const [openOrderIds, setOpenOrderIds] = useState<string[]>([]);
  const [now, setNow] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState<'active' | 'past'>('active');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/orders');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;
    return subscribeToUserOrders(
      user.uid,
      setOrders,
      (ordersError) => setError(`Orders could not load: ${ordersError.message}`),
    );
  }, [user]);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const activeOrders = useMemo(() => orders.filter((order) => isActiveOrder(order, now)), [now, orders]);
  const pastOrders = orders;
  const visibleOrders = selectedTab === 'active' ? activeOrders : pastOrders;

  const orderStats = useMemo(() => {
    const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
    const totalSpend = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);
    return { activeOrders: activeOrders.length, deliveredOrders, totalSpend };
  }, [activeOrders.length, orders]);

  const toggleOrder = (orderId: string) => {
    setOpenOrderIds((current) =>
      current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId],
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main className="pb-4">
        {/* Mobile compact hero — matches landing structure */}
        <section className="bb-mobile-hero sm:hidden">
          <div className="bb-mobile-hero-inner">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Orders</p>
            <h1 className="bb-mobile-h1">Your parcels</h1>
            <p className="bb-mobile-lead">Track payment, packing, and delivery in one place.</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {[
                { label: 'All', value: String(orders.length) },
                { label: 'Active', value: String(orderStats.activeOrders) },
                { label: 'Done', value: String(orderStats.deliveredOrders) },
                { label: 'Spent', value: money(orderStats.totalSpend).replace('KSh', '').trim() },
              ].map((stat) => (
                <div key={stat.label} className="rounded-md border border-stone-200/80 bg-[#fff5f0] px-1.5 py-2 text-center">
                  <p className="truncate text-xs font-bold text-[#191c1d]">{stat.value}</p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#ae2f34]">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="bb-mobile-cta-row">
              <Link href="/shop" className="rounded-md bg-[#ae2f34] px-3 py-2.5 text-center text-sm font-semibold text-white">
                Shop
              </Link>
              <Link href="/checkout" className="rounded-md border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800">
                Checkout
              </Link>
            </div>
          </div>
        </section>

        {/* Desktop hero */}
        <section className="hidden border-b border-stone-200 bg-white sm:block">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-12 lg:py-14">
            <div className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <Eyebrow>Orders</Eyebrow>
                <h1 className="mt-4 font-serif text-4xl font-semibold leading-none text-[#191c1d] sm:text-5xl">
                  Your BloomBox parcels
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-[#584140]">
                  Track payment, packing, and delivery for every order — all in one calm place.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/shop"
                    className="rounded-md bg-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]"
                  >
                    Continue shopping
                  </Link>
                  <Link
                    href="/checkout"
                    className="rounded-md border border-[#ae2f34] px-5 py-3 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]"
                  >
                    Go to checkout
                  </Link>
                </div>
              </div>

              <div className="grid w-full max-w-md grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { label: 'Orders', value: String(orders.length) },
                  { label: 'Active', value: String(orderStats.activeOrders) },
                  { label: 'Delivered', value: String(orderStats.deliveredOrders) },
                  { label: 'Spent', value: money(orderStats.totalSpend) },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-stone-200/80 bg-[#fff5f0] px-3 py-3"
                  >
                    <p className="text-base font-semibold text-[#191c1d] sm:text-lg">{stat.value}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ae2f34]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bb-page-pad">
          {error && (
            <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800 sm:mb-6 sm:p-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-md border border-stone-200 bg-white p-6 text-sm text-stone-600 sm:p-8">
              Loading your orders…
            </div>
          )}

          {!loading && orders.length === 0 && (
            <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm sm:rounded-md lg:grid lg:grid-cols-[0.85fr_1.15fr]">
              <div className="relative hidden min-h-[280px] bg-stone-100 lg:block">
                <Image
                  src="/mockups/bloombox-open-box.png"
                  alt="BloomBox package"
                  fill
                  sizes="(min-width: 1024px) 480px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">
                  No orders yet
                </p>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#191c1d] sm:mt-3 sm:text-4xl">
                  Your first parcel will show up here.
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-stone-600 sm:mt-3">
                  After you place and pay for an order, you can track packing and delivery on this page.
                </p>
                <Link
                  href="/shop"
                  className="mt-5 inline-flex w-full justify-center rounded-lg bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520] sm:mt-6 sm:w-fit sm:rounded-md"
                >
                  Browse the shop
                </Link>
              </div>
            </div>
          )}

          {orders.length > 0 && (
            <>
              {/* Sticky tabs on mobile */}
              <div className="sticky top-[var(--bb-header-offset,60px)] z-20 -mx-3 mb-3 border-b border-stone-200 bg-[#f8f9fa]/95 px-3 py-2 backdrop-blur sm:static sm:mx-0 sm:mb-6 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
                <div className="flex flex-col gap-3 border-b border-transparent sm:flex-row sm:items-end sm:justify-between sm:border-stone-200 sm:pb-4">
                  <div className="hidden sm:block">
                    <h2 className="font-serif text-2xl font-semibold text-[#191c1d] sm:text-3xl">
                      {selectedTab === 'active' ? 'Active orders' : 'All orders'}
                    </h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {selectedTab === 'active'
                        ? 'Orders still moving through payment, packing, or delivery.'
                        : 'Full history including delivered and cancelled orders.'}
                    </p>
                  </div>
                  <div className="inline-flex w-full overflow-hidden rounded-full border border-stone-200 bg-white p-0.5 sm:w-auto">
                    {[
                      { id: 'active' as const, label: 'Active', count: activeOrders.length },
                      { id: 'past' as const, label: 'All', count: pastOrders.length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition sm:flex-none sm:px-4 ${
                          selectedTab === tab.id
                            ? 'bg-[#ae2f34] text-white'
                            : 'text-stone-600 hover:text-[#ae2f34]'
                        }`}
                      >
                        {tab.label}
                        <span className="ml-1 opacity-80">({tab.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {visibleOrders.length === 0 ? (
                <div className="rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:rounded-md sm:p-10">
                  <h3 className="font-serif text-xl font-semibold text-[#191c1d] sm:text-2xl">No active orders</h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-600">
                    Delivered orders live under All. Unpaid orders leave Active after 2 hours.
                  </p>
                  <Link
                    href="/shop"
                    className="mt-5 inline-flex w-full justify-center rounded-lg bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] sm:mt-6 sm:w-auto sm:rounded-md"
                  >
                    Shop care items
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-2.5">
                  {visibleOrders.map((order) => (
                    <OrderCard
                      key={`${selectedTab}-${order.id}`}
                      order={order}
                      isOpen={openOrderIds.includes(`${selectedTab}-${order.id}`)}
                      toggleKey={`${selectedTab}-${order.id}`}
                      onToggle={toggleOrder}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
