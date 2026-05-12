'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { subscribeToUserOrders, type CustomerOrder, type DeliveryDetails, type OrderItem, type OrderStatus } from '@/lib/firestore';
import { useAuth } from '../components/AuthProvider';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const paidStatuses: OrderStatus[] = ['paid', 'preparing', 'out-for-delivery', 'delivered'];
const finalStatuses: OrderStatus[] = ['delivered', 'cancelled'];
const unpaidActiveWindowMs = 2 * 60 * 60 * 1000;

const orderImageRules = [
  { prefix: 'pads-marvel-girl', image: '/products/marvel.jpg' },
  { prefix: 'pads-sunny-girl', image: '/products/sunny.jpg' },
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
  return order.payment?.status === 'successful' || order.paymentStatus === 'successful' || paidStatuses.includes(order.status);
}

function isUnpaidOrderExpired(order: CustomerOrder, now: number | null) {
  if (!now || isPaymentConfirmed(order) || !['placed', 'pending-payment'].includes(order.status)) {
    return false;
  }

  const createdAtMs = getTimestampMs(order.createdAt);
  return createdAtMs !== null && now - createdAtMs > unpaidActiveWindowMs;
}

function isActiveOrder(order: CustomerOrder, now: number | null) {
  if (finalStatuses.includes(order.status)) {
    return false;
  }

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

function getStatusStyle(order: CustomerOrder) {
  if (order.status === 'delivered') return 'border-emerald-700 bg-emerald-50 text-emerald-800';
  if (order.status === 'out-for-delivery') return 'border-[#006a65] bg-[#e7fbf8] text-[#00504c]';
  if (order.status === 'preparing' || order.status === 'paid') return 'border-[#FFC857] bg-[#fff8df] text-[#76574e]';
  if (order.status === 'cancelled') return 'border-stone-400 bg-stone-100 text-stone-700';
  return 'border-[#e0bfbd] bg-[#fff5f0] text-[#8c1520]';
}

function getTrackingSteps(order: CustomerOrder) {
  const paymentSuccessful = isPaymentConfirmed(order);
  const preparing = ['preparing', 'out-for-delivery', 'delivered'].includes(order.status) || ['preparing', 'out-for-delivery', 'delivered'].includes(order.deliveryStatus);
  const outForDelivery = ['out-for-delivery', 'delivered'].includes(order.status) || ['out-for-delivery', 'delivered'].includes(order.deliveryStatus);
  const delivered = order.status === 'delivered' || order.deliveryStatus === 'delivered';

  return [
    { label: 'Order placed', detail: 'We received the order and saved the parcel details.', complete: true },
    { label: 'Payment successful', detail: paymentSuccessful ? 'Payment is confirmed.' : 'Waiting for payment confirmation.', complete: paymentSuccessful },
    { label: 'Preparing parcel', detail: preparing ? 'The BloomBox is being packed.' : 'Packing starts after payment.', complete: preparing },
    { label: 'Out for delivery', detail: outForDelivery ? 'Courier is on the way.' : 'Courier has not been assigned yet.', complete: outForDelivery },
    { label: 'Delivered', detail: delivered ? 'Parcel delivered.' : 'Not delivered yet.', complete: delivered },
  ];
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

function OrderCard({
  order,
  index,
  isOpen,
  toggleKey,
  onToggle,
}: {
  order: CustomerOrder;
  index: number;
  isOpen: boolean;
  toggleKey: string;
  onToggle: (orderId: string) => void;
}) {
  const steps = getTrackingSteps(order);
  const deliveryDetails = getDeliveryDetails(order);
  const orderItems = getOrderItems(order);

  return (
    <article className="border border-stone-300 bg-white">
      <button
        type="button"
        onClick={() => onToggle(toggleKey)}
        className="grid w-full gap-3 p-3 text-left transition hover:bg-[#fff5f0] md:grid-cols-[40px_1fr_auto_32px]"
        aria-expanded={isOpen}
      >
        <span className="flex h-8 w-8 items-center justify-center bg-[#191c1d] text-xs font-semibold text-white">
          {index + 1}
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400">
              Order ID <span className="text-stone-700">#{order.id.slice(0, 8)}</span>
            </p>
            <span className={`border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusStyle(order)}`}>
              {getStatusLabel(order)}
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">Placed {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-left md:text-right">
          <p className="text-xs text-stone-500">Total</p>
          <p className="mt-0.5 text-base font-semibold text-stone-950">{money(order.total ?? 0)}</p>
          <p className="mt-0.5 text-xs text-stone-600">
            {order.payment?.label ?? 'Payment'}: {order.payment?.status ?? 'pending'}
          </p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center border border-stone-300 text-base font-semibold text-stone-700">
          {isOpen ? '-' : '+'}
        </span>
      </button>

      {isOpen ? (
        <div className="grid gap-4 border-t border-stone-300 p-3 lg:grid-cols-[1fr_280px]">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Tracking</h3>
            <div className="mt-3 border border-stone-200">
              {steps.map((step, stepIndex) => (
                <div key={step.label} className={`grid grid-cols-[22px_1fr] gap-2 p-3 ${stepIndex === steps.length - 1 ? '' : 'border-b border-stone-200'}`}>
                  <span className={`mt-1 h-3 w-3 border ${step.complete ? 'border-[#006a65] bg-[#006a65]' : 'border-stone-300 bg-white'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${step.complete ? 'text-stone-950' : 'text-stone-500'}`}>{step.label}</p>
                    <p className="mt-0.5 text-xs leading-5 text-stone-600">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Items</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {orderItems.length === 0 ? (
                  <p className="border border-stone-200 p-3 text-xs text-stone-600">
                    This older order does not have item details saved.
                  </p>
                ) : null}

                {orderItems.map((item) => (
                  <div key={item.productId} className="grid grid-cols-[52px_1fr] gap-2 border border-stone-200 p-2">
                    <div className="relative h-[52px] overflow-hidden bg-stone-100">
                      <Image src={getOrderImage(item)} alt={item.productName} fill sizes="52px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold leading-4 text-stone-950">{item.productName ?? 'BloomBox item'}</p>
                      <p className="mt-1 text-xs text-stone-500">Qty {item.quantity}</p>
                      <p className="mt-1 text-xs font-semibold text-[#ae2f34]">
                        {item.priceNote ?? (item.price === null ? 'Price pending' : money(item.price ?? 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="border border-stone-300 bg-[#fff5f0] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Delivery address</h3>
            {deliveryDetails ? (
              <>
                <p className="mt-3 text-sm font-semibold text-stone-950">{deliveryDetails.recipientName || 'Recipient not saved'}</p>
                <p className="mt-1 text-xs leading-5 text-stone-700">{deliveryDetails.phoneNumber || 'Phone not saved'}</p>
                <p className="mt-1 text-xs leading-5 text-stone-700">
                  {[deliveryDetails.addressLine, deliveryDetails.town, deliveryDetails.county].filter(Boolean).join(', ') || 'Address not saved'}
                </p>
                {deliveryDetails.landmark ? <p className="mt-1 text-xs leading-5 text-stone-700">Landmark: {deliveryDetails.landmark}</p> : null}
                {deliveryDetails.deliveryNotes ? <p className="mt-1 text-xs leading-5 text-stone-700">Note: {deliveryDetails.deliveryNotes}</p> : null}
              </>
            ) : (
              <p className="mt-3 text-xs leading-5 text-stone-700">
                This older order was created before delivery details were added. New checkout orders will show the full address here.
              </p>
            )}

            <div className="mt-4 border-t border-stone-300 pt-4">
              <p className="text-xs text-stone-500">Receipt</p>
              <p className="mt-1 text-sm font-semibold text-stone-950">{order.payment?.receiptNumber ?? 'Pending payment'}</p>
            </div>
          </aside>
        </div>
      ) : null}
    </article>
  );
}

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

  const latestOrder = useMemo(() => orders[0], [orders]);
  const activeOrders = useMemo(() => orders.filter((order) => isActiveOrder(order, now)), [now, orders]);
  const pastOrders = orders;
  const visibleOrders = selectedTab === 'active' ? activeOrders : pastOrders;
  const orderStats = useMemo(() => {
    const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
    const totalSpend = orders.reduce((sum, order) => sum + (order.total ?? 0), 0);

    return { activeOrders: activeOrders.length, deliveredOrders, totalSpend };
  }, [activeOrders.length, orders]);

  const toggleOrder = (orderId: string) => {
    setOpenOrderIds((current) => (current.includes(orderId) ? current.filter((id) => id !== orderId) : [...current, orderId]));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main>
        <section className="border-b border-stone-300 bg-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-5 py-9 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:py-12">
            <div>
              <Eyebrow>Orders</Eyebrow>
              <h1 className="mt-4 font-serif text-4xl font-semibold leading-none text-[#191c1d] sm:text-5xl">
                Track every BloomBox from cart to doorstep.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[#584140]">
                Follow payment status, packing progress, delivery details, and what went into each parcel.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="bg-[#ae2f34] px-5 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#8c1520]">
                  Continue shopping
                </Link>
                <Link href="/checkout" className="border border-[#ae2f34] px-5 py-2.5 text-center text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]">
                  Go to checkout
                </Link>
              </div>
            </div>

            <div className="grid border border-stone-300 bg-[#fff5f0] md:grid-cols-[1fr_1fr]">
              <div className="border-b border-stone-300 p-4 md:border-b-0 md:border-r">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Latest order</p>
                <p className="mt-2 font-serif text-2xl font-semibold text-[#191c1d]">{latestOrder ? getStatusLabel(latestOrder) : 'No orders yet'}</p>
                <p className="mt-2 text-xs leading-5 text-[#584140]">{latestOrder ? `#${latestOrder.id.slice(0, 10)}` : 'Checkout will create your first order.'}</p>
              </div>
              <div className="grid grid-cols-2">
                <div className="border-b border-r border-stone-300 p-4">
                  <p className="text-xl font-semibold text-[#ae2f34]">{orders.length}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Orders</p>
                </div>
                <div className="border-b border-stone-300 p-4">
                  <p className="text-xl font-semibold text-[#ae2f34]">{orderStats.activeOrders}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Active</p>
                </div>
                <div className="border-r border-stone-300 p-4">
                  <p className="text-xl font-semibold text-[#ae2f34]">{orderStats.deliveredOrders}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Delivered</p>
                </div>
                <div className="p-4">
                  <p className="text-xl font-semibold text-[#ae2f34]">{money(orderStats.totalSpend)}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-stone-500">Total</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          {error ? (
            <div className="mb-6 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="border border-stone-300 bg-white p-8 text-sm text-stone-600">Loading your order history...</div>
          ) : null}

          {!loading && orders.length === 0 ? (
            <div className="grid overflow-hidden border border-stone-300 bg-white lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative min-h-[320px] bg-stone-100">
                <Image src="/mockups/bloombox-open-box.png" alt="BloomBox package" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
              </div>
              <div className="p-8 lg:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">No orders yet</p>
                <h2 className="mt-4 font-serif text-4xl font-semibold text-stone-950">Your first parcel will appear here.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-stone-600">
                  Once you place and pay for an order, this page becomes your delivery timeline.
                </p>
                <Link href="/shop" className="mt-7 inline-flex bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white">
                  Shop catalog
                </Link>
              </div>
            </div>
          ) : null}

          {orders.length > 0 ? (
            <div>
              <div className="mb-5 grid border border-stone-300 bg-white p-1 sm:w-fit sm:grid-cols-2">
                {[
                  { id: 'active' as const, label: 'Active', count: activeOrders.length },
                  { id: 'past' as const, label: 'Past orders', count: pastOrders.length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedTab(tab.id)}
                    className={`px-5 py-2 text-sm font-semibold transition ${
                      selectedTab === tab.id ? 'bg-[#ae2f34] text-white' : 'text-stone-700 hover:bg-[#fff5f0] hover:text-[#ae2f34]'
                    }`}
                  >
                    {tab.label}
                    <span className="ml-2 text-xs opacity-80">{tab.count}</span>
                  </button>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
                <aside className="lg:sticky lg:top-28 lg:self-start">
                  <div className="border border-stone-300 bg-white p-4">
                    <h2 className="font-serif text-xl font-semibold text-[#191c1d]">Delivery key</h2>
                    <div className="mt-4 space-y-2 text-xs leading-5 text-stone-600">
                      <p><span className="font-semibold text-stone-950">Awaiting:</span> payment not confirmed.</p>
                      <p><span className="font-semibold text-stone-950">Active:</span> unpaid orders leave after 2 hours.</p>
                      <p><span className="font-semibold text-stone-950">Preparing:</span> parcel is being assembled.</p>
                      <p><span className="font-semibold text-stone-950">Delivery:</span> courier has left for the address.</p>
                    </div>
                    <Link href="/shop" className="mt-5 inline-flex w-full justify-center border border-[#ae2f34] px-3 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0]">
                      Add items
                    </Link>
                  </div>
                </aside>

                <section>
                  <div className="mb-4 flex flex-col justify-between gap-2 border-b border-stone-300 pb-3 sm:flex-row sm:items-end">
                    <div>
                      <h2 className="font-serif text-2xl font-semibold text-[#191c1d]">
                        {selectedTab === 'active' ? 'Active orders' : 'Past orders'}
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-stone-600">
                        {selectedTab === 'active'
                          ? 'Orders still waiting for payment, packing, courier dispatch, or delivery.'
                          : 'Full order history, including active, delivered, cancelled, and unpaid orders.'}
                      </p>
                    </div>
                    <span className="w-fit border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700">
                      {visibleOrders.length} shown
                    </span>
                  </div>

                  {visibleOrders.length === 0 ? (
                    <div className="border border-stone-300 bg-white p-5">
                      <h3 className="font-serif text-xl font-semibold text-stone-950">No active orders right now.</h3>
                      <p className="mt-2 text-xs leading-5 text-stone-600">
                        Paid and delivered orders stay in Past Orders. Unpaid orders leave Active after 2 hours.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {visibleOrders.map((order, index) => (
                        <OrderCard
                          key={`${selectedTab}-${order.id}`}
                          order={order}
                          index={index}
                          isOpen={openOrderIds.includes(`${selectedTab}-${order.id}`)}
                          toggleKey={`${selectedTab}-${order.id}`}
                          onToggle={toggleOrder}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
