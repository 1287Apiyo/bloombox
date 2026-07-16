'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  calculateOrderTotals,
  completeDummyPayment,
  createOrderFromCart,
  fetchUserDeliveryDetails,
  paymentMethodLabels,
  saveUserDeliveryDetails,
  subscribeToCart,
  updateCartItemQuantity,
  type CartSummary,
  type DeliveryDetails,
  type PaymentDetails,
  type PaymentMethod,
} from '@/lib/firestore';
import { useAuth } from '../components/AuthProvider';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const emptyCart: CartSummary = {
  items: [],
  itemCount: 0,
  subtotal: 0,
};

const blankDeliveryDetails: DeliveryDetails = {
  recipientName: '',
  phoneNumber: '',
  county: '',
  town: '',
  addressLine: '',
  landmark: '',
  deliveryNotes: '',
};

const paymentOptions: Array<{ id: PaymentMethod; note: string }> = [
  { id: 'mpesa', note: 'Mobile money number for this delivery.' },
  { id: 'paypal', note: 'Pay with your PayPal account.' },
  { id: 'card', note: 'Debit or credit card payment.' },
  { id: 'mchanga', note: 'Donation or sponsored bundle reference.' },
];

function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}

export default function CheckoutPage() {
  const router = useRouter();
  const { loading, user } = useAuth();
  const [cart, setCart] = useState<CartSummary>(emptyCart);
  const [submittedCart, setSubmittedCart] = useState<CartSummary | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>(blankDeliveryDetails);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [mchangaReference, setMchangaReference] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'successful'>('idle');
  const [mpesaPin, setMpesaPin] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [submittedTotal, setSubmittedTotal] = useState(0);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/checkout');
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (!user) return;

    return subscribeToCart(user.uid, setCart, (cartError) => {
      setError(`Cart could not load: ${cartError.message}`);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    fetchUserDeliveryDetails(user.uid)
      .then((savedDetails) => {
        if (!isMounted) return;

        setDeliveryDetails({
          ...blankDeliveryDetails,
          recipientName: user.displayName ?? '',
          ...(savedDetails ?? {}),
        });

        if (savedDetails?.phoneNumber) {
          setMpesaPhone(savedDetails.phoneNumber);
        }
      })
      .catch((deliveryError) => {
        if (isMounted) {
          setError(`Delivery details could not load: ${getMessage(deliveryError)}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayCart = submittedCart ?? cart;
  const totals = useMemo(() => calculateOrderTotals(cart), [cart]);
  const displayTotals = useMemo(() => calculateOrderTotals(displayCart), [displayCart]);

  const updateDeliveryField = (field: keyof DeliveryDetails, value: string) => {
    setDeliveryDetails((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateDelivery = () => {
    const requiredFields: Array<keyof DeliveryDetails> = ['recipientName', 'phoneNumber', 'county', 'town', 'addressLine'];
    return requiredFields.every((field) => deliveryDetails[field].trim().length > 0);
  };

  const handlePlaceOrder = async (event?: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault();
    setError('');
    setOrderId('');
    setPaymentId('');
    setPaymentStatus('idle');
    setReceiptNumber('');
    setMpesaPin('');
    setSubmittedCart(null);
    setOrderSubmitted(false);

    if (!user) {
      router.push('/login?next=/checkout');
      return;
    }

    if (cart.items.length === 0) {
      setError('Your cart is empty. Add items before checkout.');
      return;
    }

    if (!validateDelivery()) {
      setError('Add the recipient, phone number, county, town, and full delivery address.');
      return;
    }

    const paymentDetails: PaymentDetails = { method: paymentMethod };

    if (paymentMethod === 'mpesa') {
      paymentDetails.mpesaPhone = mpesaPhone.trim() || deliveryDetails.phoneNumber.trim();
    }

    if (paymentMethod === 'paypal' && paypalEmail.trim()) {
      paymentDetails.paypalEmail = paypalEmail.trim();
    }

    if (paymentMethod === 'mchanga' && mchangaReference.trim()) {
      paymentDetails.mchangaReference = mchangaReference.trim();
    }

    setIsPlacingOrder(true);

    try {
      const orderTotal = totals.total;
      setSubmittedCart(cart);
      await saveUserDeliveryDetails(user.uid, deliveryDetails);
      const paymentResult = await createOrderFromCart(user.uid, cart, deliveryDetails, paymentDetails);
      setOrderId(paymentResult.orderId);
      setPaymentId(paymentResult.paymentId);
      setSubmittedTotal(orderTotal);
      setPaymentStatus('pending');
      setOrderSubmitted(true);
      window.setTimeout(() => {
        paymentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (orderError) {
      setError(`Could not place order: ${getMessage(orderError)}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleDummyPaymentConfirmation = async () => {
    setError('');

    if (!orderId || !paymentId) {
      setError('Place the order before confirming payment.');
      return;
    }

    if (paymentMethod === 'mpesa' && mpesaPin.trim().length < 4) {
      setError('Enter the M-Pesa PIN to complete the dummy STK payment.');
      return;
    }

    setIsConfirmingPayment(true);

    try {
      const receipt = await completeDummyPayment(orderId, paymentId);
      setReceiptNumber(receipt);
      setPaymentStatus('successful');
      setMpesaPin('');
      setCart(emptyCart);
    } catch (paymentError) {
      setError(`Could not confirm payment: ${getMessage(paymentError)}`);
    } finally {
      setIsConfirmingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf7] text-stone-950">
      <SiteHeader cartCount={cart.itemCount} />

      <main>
        <section className="border-b border-stone-300 bg-[#f4ddd7]">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-12 lg:py-16">
            <Eyebrow>Checkout</Eyebrow>
            <div className="mt-5 grid gap-6 sm:mt-6 sm:gap-8 lg:grid-cols-[0.85fr_0.65fr] lg:items-end">
              <div>
                <h1 className="text-4xl font-semibold leading-[0.98] tracking-tight text-stone-950 sm:text-6xl">
                  Confirm delivery, choose payment, place the order.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-stone-700">
                  BloomBox now works like a parcel checkout: add a location, review your cart, and submit an order for delivery.
                </p>
              </div>
              <div className="rounded-md border border-stone-300 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Current total</p>
                <p className="mt-2 text-4xl font-semibold text-stone-950">{money(displayTotals.total)}</p>
                <p className="mt-2 text-sm text-stone-600">
                  {displayCart.itemCount} item{displayCart.itemCount === 1 ? '' : 's'} {orderId ? 'submitted' : 'in cart'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:gap-8 sm:px-8 sm:py-10 lg:grid-cols-[1fr_380px]">
          <form onSubmit={handlePlaceOrder} className="space-y-8">
            {error ? (
              <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">
                {error}
              </div>
            ) : null}

            <div ref={paymentSectionRef} className="scroll-mt-28">
            {orderSubmitted ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
                <p className="text-lg font-semibold">Order submitted successfully.</p>
                <p className="mt-1">
                  {paymentStatus === 'successful'
                    ? 'Payment has been confirmed and your order is now paid.'
                    : 'Your cart has been submitted. Complete the payment step below so BloomBox can start processing it.'}
                </p>
                <p className="mt-1">Order ID: {orderId}</p>
                <p className="mt-1">Payment ID: {paymentId}</p>
              </div>
            ) : null}

            {orderId && paymentStatus === 'pending' ? (
              <section className="rounded-md border border-stone-300 bg-white p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">
                  {paymentMethod === 'mpesa' ? 'Dummy STK push' : paymentMethod === 'mchanga' ? 'Donation reference' : 'Dummy payment'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                  {paymentMethod === 'mpesa' ? 'Now complete payment' : 'Now confirm payment'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {paymentMethod === 'mpesa'
                    ? `A dummy STK request has been sent to ${mpesaPhone || deliveryDetails.phoneNumber}. No real money is charged yet.`
                    : paymentMethod === 'mchanga'
                      ? `A dummy M-Changa donation payment has been created${mchangaReference ? ` with reference ${mchangaReference}` : ''}.`
                    : `A dummy ${paymentMethodLabels[paymentMethod]} payment has been created in Firestore.`}
                </p>

                <div className="mt-5 rounded-md border border-stone-300 bg-[#fffaf7] p-4">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-stone-600">Status</span>
                    <span className="rounded-sm bg-amber-100 px-2 py-1 font-semibold text-amber-900">Pending</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-4 text-sm">
                    <span className="text-stone-600">Amount</span>
                    <span className="font-semibold text-stone-950">{money(submittedTotal)}</span>
                  </div>
                </div>

                {paymentMethod === 'mpesa' ? (
                  <label className="mt-5 block text-sm font-semibold text-stone-800">
                    M-Pesa PIN
                    <input
                      type="password"
                      inputMode="numeric"
                      value={mpesaPin}
                      onChange={(event) => setMpesaPin(event.target.value)}
                      className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                      placeholder="Enter PIN"
                    />
                  </label>
                ) : null}

                <button
                  type="button"
                  onClick={handleDummyPaymentConfirmation}
                  disabled={isConfirmingPayment}
                  className="mt-5 w-full rounded-md bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isConfirmingPayment ? 'Confirming payment...' : paymentMethod === 'mpesa' ? 'Pay with dummy STK' : 'Mark dummy payment successful'}
                </button>
              </section>
            ) : null}
            </div>

            {paymentStatus === 'successful' ? (
              <section className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
                <p className="font-semibold">Payment successful.</p>
                <p className="mt-1">Receipt: {receiptNumber}</p>
                <p className="mt-1">Your order status is now paid.</p>
                <Link href="/orders" className="mt-4 inline-flex rounded-md bg-emerald-900 px-4 py-2 text-sm font-semibold text-white">
                  Track delivery
                </Link>
              </section>
            ) : null}

            <section className="rounded-md border border-stone-300 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Delivery details</p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-950">Where should the parcel go?</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-stone-800">
                  Recipient name
                  <input
                    value={deliveryDetails.recipientName}
                    onChange={(event) => updateDeliveryField('recipientName', event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="Full name"
                  />
                </label>

                <label className="block text-sm font-semibold text-stone-800">
                  Phone number
                  <input
                    value={deliveryDetails.phoneNumber}
                    onChange={(event) => {
                      updateDeliveryField('phoneNumber', event.target.value);
                      if (!mpesaPhone) {
                        setMpesaPhone(event.target.value);
                      }
                    }}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="07..."
                  />
                </label>

                <label className="block text-sm font-semibold text-stone-800">
                  County
                  <input
                    value={deliveryDetails.county}
                    onChange={(event) => updateDeliveryField('county', event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="Nairobi"
                  />
                </label>

                <label className="block text-sm font-semibold text-stone-800">
                  Town / area
                  <input
                    value={deliveryDetails.town}
                    onChange={(event) => updateDeliveryField('town', event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="Westlands"
                  />
                </label>

                <label className="block text-sm font-semibold text-stone-800 sm:col-span-2">
                  Street, building, house number
                  <input
                    value={deliveryDetails.addressLine}
                    onChange={(event) => updateDeliveryField('addressLine', event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="Building, apartment, road, gate, or estate"
                  />
                </label>

                <label className="block text-sm font-semibold text-stone-800">
                  Landmark
                  <input
                    value={deliveryDetails.landmark}
                    onChange={(event) => updateDeliveryField('landmark', event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="Near..."
                  />
                </label>

                <label className="block text-sm font-semibold text-stone-800">
                  Delivery notes
                  <input
                    value={deliveryDetails.deliveryNotes}
                    onChange={(event) => updateDeliveryField('deliveryNotes', event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="Call on arrival, discreet packaging..."
                  />
                </label>
              </div>
            </section>

            <section className="rounded-md border border-stone-300 bg-white p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Payment</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-950">Choose how to pay</h2>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setPaymentMethod(option.id)}
                    className={`rounded-md border p-3 text-left transition sm:p-4 ${
                      paymentMethod === option.id ? 'border-rose-700 bg-rose-50' : 'border-stone-300 bg-white hover:border-rose-300'
                    }`}
                  >
                    <span className="block font-semibold text-stone-950">{paymentMethodLabels[option.id]}</span>
                    <span className="mt-2 block text-sm leading-5 text-stone-600">{option.note}</span>
                  </button>
                ))}
              </div>

              {paymentMethod === 'mpesa' ? (
                <label className="mt-5 block text-sm font-semibold text-stone-800">
                  M-Pesa phone
                  <input
                    value={mpesaPhone}
                    onChange={(event) => setMpesaPhone(event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="07..."
                  />
                </label>
              ) : null}

              {paymentMethod === 'paypal' ? (
                <label className="mt-5 block text-sm font-semibold text-stone-800">
                  PayPal email
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(event) => setPaypalEmail(event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="paypal@example.com"
                  />
                </label>
              ) : null}

              {paymentMethod === 'mchanga' ? (
                <label className="mt-5 block text-sm font-semibold text-stone-800">
                  M-Changa reference
                  <input
                    value={mchangaReference}
                    onChange={(event) => setMchangaReference(event.target.value)}
                    className="mt-2 w-full rounded-md border border-stone-300 bg-stone-50 px-4 py-3 font-normal text-stone-950 outline-none transition focus:border-rose-700 focus:bg-white focus:ring-2 focus:ring-rose-100"
                    placeholder="Donation reference or phone"
                  />
                </label>
              ) : null}
            </section>
          </form>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-stone-300 bg-white">
              <div className="border-b border-stone-300 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Order summary</p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">{displayCart.itemCount} items</h2>
              </div>

              <div className="max-h-[420px] overflow-y-auto p-5">
                {displayCart.items.length === 0 ? (
                  <div className="rounded-md bg-[#fff4f1] p-5 text-sm leading-6 text-stone-700">
                    Your cart is empty. <Link href="/shop" className="font-semibold text-rose-700">Go back to shop</Link>.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayCart.items.map((item) => (
                      <div key={item.id} className="grid grid-cols-[72px_1fr] gap-3 border-b border-stone-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="relative h-20 overflow-hidden rounded-md bg-stone-100">
                          <Image src={item.image} alt={item.productName} fill sizes="72px" className="object-cover" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold leading-5 text-stone-950">{item.productName}</h3>
                          <p className="mt-1 text-xs text-stone-500">{item.brand} / {item.variant}</p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center rounded-md border border-stone-300">
                              <button
                                type="button"
                                disabled={!user || Boolean(orderId)}
                                onClick={() => user && updateCartItemQuantity(user.uid, item.productId, item.quantity - 1)}
                                className="h-8 w-8 text-stone-700 disabled:opacity-40"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                disabled={!user || Boolean(orderId)}
                                onClick={() => user && updateCartItemQuantity(user.uid, item.productId, item.quantity + 1)}
                                className="h-8 w-8 text-stone-700 disabled:opacity-40"
                              >
                                +
                              </button>
                            </div>
                            <p className="text-sm font-semibold text-stone-950">{item.price === null ? 'Pending' : money(item.price * item.quantity)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-stone-300 p-5">
                <div className="space-y-3 text-sm text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-stone-950">{money(displayTotals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold text-stone-950">{displayTotals.deliveryFee === 0 ? 'Free' : money(displayTotals.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-3 text-base">
                    <span className="font-semibold text-stone-950">Total</span>
                    <span className="font-semibold text-stone-950">{money(displayTotals.total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || cart.items.length === 0 || Boolean(orderId)}
                  className="mt-5 w-full rounded-md bg-rose-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-950 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPlacingOrder ? 'Placing order...' : orderId ? 'Order submitted' : 'Place order'}
                </button>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
