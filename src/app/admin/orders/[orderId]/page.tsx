'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  paymentMethodLabels,
  subscribeToAllUsers,
  subscribeToOrder,
  updateOrderStatus,
  type CustomerOrder,
  type OrderStatus,
  type UserProfile,
} from '@/lib/firestore';
import { AdminPortalFrame } from '../../AdminPortalFrame';

const orderStatuses: OrderStatus[] = [
  'pending-payment',
  'paid',
  'preparing',
  'out-for-delivery',
  'delivered',
  'cancelled',
];

function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function getDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

function getCustomerName(order: CustomerOrder, users: UserProfile[]) {
  const user = users.find((item) => item.uid === order.userId);
  return user?.displayName || user?.email || order.deliveryDetails?.recipientName || 'Customer';
}

export default function AdminOrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!orderId) return undefined;

    const unsubscribers = [
      subscribeToOrder(
        orderId,
        (nextOrder) => {
          setOrder(nextOrder);
          setLoading(false);
        },
        (orderError) => {
          setError(`Order could not load: ${orderError.message}`);
          setLoading(false);
        },
      ),
      subscribeToAllUsers(setUsers, (usersError) => setError(`Customers could not load: ${usersError.message}`)),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [orderId]);

  const customer = useMemo(() => {
    if (!order) return undefined;
    return users.find((profile) => profile.uid === order.userId);
  }, [order, users]);

  const changeStatus = async (status: OrderStatus) => {
    if (!order) return;

    setError('');
    setNotice('');
    setUpdating(true);

    try {
      await updateOrderStatus(order.id, status);
      setNotice(`Order #${order.id.slice(0, 8)} moved to ${getOrderStatusLabel(status)}.`);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not update order status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminPortalFrame
      activeSection="orders"
      title="Order details"
      description={order ? `Review #${order.id.slice(0, 10)}, update fulfilment, and confirm customer delivery details.` : 'Review and manage a BloomBox order.'}
      actions={(
        <Link href="/admin?section=orders" className="border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]">
          Back to orders
        </Link>
      )}
    >
        {loading ? <div className="border-y border-stone-300 bg-white p-5 text-sm text-stone-600">Loading order...</div> : null}
        {error ? <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div> : null}
        {notice ? <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div> : null}

        {!loading && !order ? (
          <div className="border-y border-stone-300 bg-white p-5 text-sm text-stone-600">This order was not found.</div>
        ) : null}

        {order ? (
          <div className="grid gap-5">
            <section className="border-y border-stone-300 bg-white px-4 py-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">#{order.id}</p>
                  <h2 className="mt-2 font-serif text-4xl font-semibold">{getCustomerName(order, users)}</h2>
                  <p className="mt-1 text-sm text-stone-500">{getDate(order.createdAt)} / {order.itemCount} item{order.itemCount === 1 ? '' : 's'}</p>
                </div>
                <div className="flex flex-col gap-2 sm:min-w-56">
                  <span className={`w-fit border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getStatusStyle(order.status)}`}>
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(event) => changeStatus(event.target.value as OrderStatus)}
                    disabled={updating}
                    className="border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 outline-none focus:border-[#ae2f34] focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>{getOrderStatusLabel(status)}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="border-y border-stone-300 bg-white px-4 py-3">
              <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-lg font-semibold">Order actions</h2>
                  <p className="mt-0.5 text-sm text-stone-500">Move the order through the fulfilment flow.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ['Mark paid', 'paid'],
                  ['Prepare', 'preparing'],
                  ['Send out', 'out-for-delivery'],
                  ['Delivered', 'delivered'],
                  ['Cancel', 'cancelled'],
                ].map(([label, status]) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => changeStatus(status as OrderStatus)}
                    disabled={updating || order.status === status}
                    className={`px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                      status === 'cancelled'
                        ? 'border border-stone-300 text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]'
                        : 'bg-[#ae2f34] text-white hover:bg-[#8c1520]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {order.deliveryDetails?.phoneNumber ? (
                  <a href={`tel:${order.deliveryDetails.phoneNumber}`} className="border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]">
                    Call customer
                  </a>
                ) : null}
                {(customer?.email || order.payment?.paypalEmail) ? (
                  <a href={`mailto:${customer?.email ?? order.payment?.paypalEmail}`} className="border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#ae2f34] hover:text-[#ae2f34]">
                    Email customer
                  </a>
                ) : null}
              </div>
            </section>

            <section className="grid border-y border-stone-300 bg-white sm:grid-cols-4">
              {[
                ['Total', money(order.total ?? 0)],
                ['Subtotal', money(order.subtotal ?? 0)],
                ['Delivery', money(order.deliveryFee ?? 0)],
                ['Payment', order.payment?.status ?? order.paymentStatus ?? 'pending'],
              ].map(([label, value], index) => (
                <div key={label} className={`px-4 py-3 ${index < 3 ? 'border-b border-stone-200 sm:border-b-0 sm:border-r' : ''}`}>
                  <p className="text-lg font-semibold text-[#ae2f34]">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500">{label}</p>
                </div>
              ))}
            </section>

            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <section className="bg-white">
                <div className="border-b border-stone-300 pb-2">
                  <h2 className="text-lg font-semibold">Items</h2>
                  <p className="mt-0.5 text-sm text-stone-500">Products included in this order.</p>
                </div>
                <div className="divide-y divide-stone-200">
                  {(order.items ?? []).map((item) => (
                    <div key={`${order.id}-${item.productId}`} className="grid gap-3 py-3 sm:grid-cols-[64px_1fr_auto] sm:items-center">
                      <div className="relative h-16 w-16 overflow-hidden bg-stone-100">
                        <Image src={item.image || '/bloom1.png'} alt={item.productName} fill sizes="64px" className="object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-stone-950">{item.productName}</p>
                        <p className="mt-1 text-xs text-stone-500">{item.brand} / {item.variant}</p>
                      </div>
                      <p className="text-sm font-semibold text-[#8c1520]">
                        {item.quantity} x {item.price === null ? item.priceNote ?? 'Price pending' : money(item.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="grid gap-4">
                <section className="border-l-4 border-[#ae2f34] bg-[#fff5f0] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Customer</p>
                  <p className="mt-2 text-sm font-semibold">{customer?.displayName || customer?.email || order.deliveryDetails?.recipientName || 'Customer'}</p>
                  <p className="mt-1 break-all text-sm text-[#584140]">{customer?.email ?? order.userId}</p>
                  <p className="mt-1 text-sm text-[#584140]">{order.deliveryDetails?.phoneNumber ?? 'No phone saved'}</p>
                </section>

                <section className="border-l-4 border-[#ae2f34] bg-[#fff5f0] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Delivery</p>
                  <p className="mt-2 text-sm font-semibold">{order.deliveryDetails?.recipientName ?? 'Recipient not saved'}</p>
                  <p className="mt-1 text-sm leading-5 text-[#584140]">
                    {[order.deliveryDetails?.addressLine, order.deliveryDetails?.town, order.deliveryDetails?.county].filter(Boolean).join(', ') || 'No address saved'}
                  </p>
                  {order.deliveryDetails?.landmark ? <p className="mt-2 text-sm text-[#584140]">Landmark: {order.deliveryDetails.landmark}</p> : null}
                  {order.deliveryDetails?.deliveryNotes ? <p className="mt-2 text-sm text-[#584140]">Notes: {order.deliveryDetails.deliveryNotes}</p> : null}
                </section>

                <section className="border-l-4 border-[#ae2f34] bg-[#fff5f0] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Payment</p>
                  <p className="mt-2 text-sm font-semibold">{order.payment?.label ?? paymentMethodLabels[order.payment?.method ?? 'mpesa']}</p>
                  <p className="mt-1 text-sm text-[#584140]">Status: {order.payment?.status ?? order.paymentStatus ?? 'pending'}</p>
                  {order.payment?.receiptNumber ? <p className="mt-1 text-sm text-[#584140]">Receipt: {order.payment.receiptNumber}</p> : null}
                </section>
              </aside>
            </div>
          </div>
        ) : null}
    </AdminPortalFrame>
  );
}
