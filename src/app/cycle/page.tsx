'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  saveCycleProfile,
  subscribeToCart,
  subscribeToCycleProfile,
  updateCartItemQuantity,
  type CartSummary,
  type CycleProfile,
  type CycleTrackingMode,
} from '@/lib/firestore';
import {
  buildCycleCalendarDays,
  getCycleDay,
  getCyclePhase,
  getModeNote,
  getNextPeriodDate,
  getPhaseLabel,
  getPhaseMessage,
  toDateKey,
  type CyclePhase,
} from '@/lib/cycle';
import { useAuth } from '../components/AuthProvider';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

// ---------- Constants ----------
const emptyCart: CartSummary = { items: [], itemCount: 0, subtotal: 0 };

const trackingModes: Array<{ value: CycleTrackingMode; label: string; detail: string }> = [
  { value: 'regular', label: 'Regular', detail: 'Useful when your cycle is usually predictable.' },
  { value: 'irregular', label: 'Irregular', detail: 'Uses averages without assuming every month is the same.' },
  { value: 'pcos', label: 'PCOS', detail: 'PCOS-aware prediction rules are a future feature.' },
  { value: 'endo', label: 'Endo', detail: 'Pain and flare-aware check-ins are a future feature.' },
  { value: 'birth-control', label: 'Hormonal birth control', detail: 'Pill, implant, IUD modes are a future feature.' },
];

const phaseStyles: Record<CyclePhase, string> = {
  menstrual: 'border-[#ae2f34] bg-[#fff0ee] text-[#8c1520]',
  follicular: 'border-[#006a65] bg-[#e7fbf8] text-[#00504c]',
  ovulatory: 'border-[#c9972e] bg-[#fff8df] text-[#76574e]',
  luteal: 'border-[#76574e] bg-[#f3ebe8] text-[#584140]',
  unknown: 'border-stone-200 bg-white text-stone-500',
};

const phaseDot: Record<CyclePhase, string> = {
  menstrual: 'bg-[#ae2f34]',
  follicular: 'bg-[#006a65]',
  ovulatory: 'bg-[#c9972e]',
  luteal: 'bg-[#76574e]',
  unknown: 'bg-stone-300',
};

const inputClass =
  'w-full border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]';

// ---------- Helpers ----------
function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDisplayDate(date: Date | null) {
  if (!date) return 'Not enough data yet';
  return date.toLocaleDateString('en-KE', { weekday: 'short', day: '2-digit', month: 'short' });
}

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong.';
}

/** Donut wedge: 0° = top, clockwise */
function describeArc(cx: number, cy: number, rOuter: number, rInner: number, start: number, end: number) {
  const toXY = (angle: number, r: number) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const sweep = ((end - start) % 360 + 360) % 360;
  const large = sweep > 180 ? 1 : 0;
  const so = toXY(start, rOuter);
  const eo = toXY(end, rOuter);
  const si = toXY(start, rInner);
  const ei = toXY(end, rInner);
  return [
    `M ${so.x} ${so.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${eo.x} ${eo.y}`,
    `L ${ei.x} ${ei.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${si.x} ${si.y}`,
    'Z',
  ].join(' ');
}

function labelPos(cx: number, cy: number, r: number, mid: number) {
  const a = ((mid - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

const PHASE_RING: Array<{ id: CyclePhase; label: string; color: string; muted: string }> = [
  { id: 'menstrual', label: 'Menstrual', color: '#ae2f34', muted: '#e8c4c2' },
  { id: 'follicular', label: 'Follicular', color: '#006a65', muted: '#b5d4d2' },
  { id: 'ovulatory', label: 'Ovulatory', color: '#c9972e', muted: '#e8d9a8' },
  { id: 'luteal', label: 'Luteal', color: '#76574e', muted: '#d4c4bc' },
];

/** Simple 4-phase cycle circle — current phase is solid, others muted. Center shows day. */
function PhaseCircle({
  cycleDay,
  currentPhase,
  size = 280,
}: {
  cycleDay: number | null;
  currentPhase: CyclePhase;
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.46;
  const rInner = size * 0.28;
  const rLabel = size * 0.37;
  const dayText = cycleDay ? `Day ${cycleDay}` : '—';
  const activeLabel = getPhaseLabel(currentPhase === 'unknown' ? 'unknown' : currentPhase);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      className="mx-auto block max-w-full"
      role="img"
      aria-label={`Current phase: ${activeLabel}. Cycle day ${cycleDay ?? 'unknown'}.`}
    >
      {PHASE_RING.map((phase, index) => {
        const start = index * 90;
        const end = start + 90;
        const mid = start + 45;
        const isActive = currentPhase === phase.id;
        const label = labelPos(cx, cy, rLabel, mid);

        return (
          <g key={phase.id}>
            <path
              d={describeArc(cx, cy, rOuter, rInner, start + 1, end - 1)}
              fill={isActive ? phase.color : phase.muted}
              stroke="#ffffff"
              strokeWidth="3"
            />
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isActive ? '#ffffff' : '#584140'}
              style={{ fontSize: isActive ? 11 : 10, fontWeight: 700 }}
            >
              {phase.label}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r={rInner - 2} fill="#191c1d" />
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        fill="#fed4c8"
        style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em' }}
      >
        TODAY
      </text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#ffffff" style={{ fontSize: 22, fontWeight: 700 }}>
        {dayText}
      </text>
    </svg>
  );
}

// ---------- Simple cart drawer ----------
function CartDrawer({
  cart,
  isOpen,
  onClose,
  onCheckout,
  userId,
}: {
  cart: CartSummary;
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  userId?: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close cart" onClick={onClose} className="absolute inset-0 bg-stone-900/30" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-stone-200 bg-white">
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ae2f34]">Cart</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-900">{cart.itemCount} items ready</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.items.length === 0 ? (
            <div className="border border-[#e0bfbd] bg-[#fff5f0] p-6 text-sm leading-6 text-stone-700">
              Your cart is empty.
              <Link href="/shop" className="mt-3 block font-semibold text-[#ae2f34] hover:underline">
                Open shop →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="border border-stone-200 bg-white p-4">
                  <div className="grid grid-cols-[76px_1fr] gap-4">
                    <div className="relative aspect-square overflow-hidden border border-stone-200 bg-stone-100">
                      <Image
                        src={item.image || '/bloom1.png'}
                        alt={item.productName}
                        fill
                        sizes="76px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold leading-5 text-stone-900">{item.productName}</h3>
                          <p className="mt-1 text-sm text-stone-500">
                            {item.brand} / {item.variant}
                          </p>
                        </div>
                        <p className="shrink-0 text-sm font-semibold text-[#ae2f34]">
                          {item.priceNote ?? (item.price === null ? 'Price pending' : money(item.price))}
                        </p>
                      </div>
                      <div className="mt-4 flex w-fit items-center overflow-hidden border border-stone-200">
                        <button
                          type="button"
                          disabled={!userId}
                          onClick={() => userId && updateCartItemQuantity(userId, item.productId, item.quantity - 1)}
                          className="h-9 w-9 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={!userId}
                          onClick={() => userId && updateCartItemQuantity(userId, item.productId, item.quantity + 1)}
                          className="h-9 w-9 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-stone-200 px-6 py-5">
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span className="text-lg font-semibold text-stone-900">{money(cart.subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={cart.items.length === 0}
            className="mt-4 w-full bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Go to checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

// ---------- Page ----------
export default function CyclePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<CycleProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [trackingMode, setTrackingMode] = useState<CycleTrackingMode>('regular');
  const [averageCycleLength, setAverageCycleLength] = useState(28);
  const [averagePeriodLength, setAveragePeriodLength] = useState(5);
  const [lastPeriodStart, setLastPeriodStart] = useState(toDateKey(new Date()));
  const [reminderOptIn, setReminderOptIn] = useState(true);
  const [notificationDay, setNotificationDay] = useState('Monday');
  const [cycleNotes, setCycleNotes] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [cart, setCart] = useState<CartSummary>(emptyCart);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToCycleProfile(user.uid, setProfile, (err) => setError(err.message));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setCart(emptyCart);
      return;
    }
    return subscribeToCart(user.uid, setCart, (err) => setError(`Cart could not load: ${err.message}`));
  }, [user]);

  useEffect(() => {
    if (!profile) {
      setDisplayName(user?.displayName ?? '');
      return;
    }
    setDisplayName(profile.displayName);
    setTrackingMode(profile.trackingMode);
    setAverageCycleLength(profile.averageCycleLength);
    setAveragePeriodLength(profile.averagePeriodLength);
    setLastPeriodStart(profile.lastPeriodStart);
    setReminderOptIn(profile.reminderOptIn);
    setNotificationDay(profile.notificationDay);
    setCycleNotes(profile.notes ?? '');
  }, [profile, user?.displayName]);

  const todayCycleDay = profile ? getCycleDay(profile) : null;
  const currentPhase = profile
    ? getCyclePhase(todayCycleDay, profile.averagePeriodLength, profile.averageCycleLength)
    : 'unknown';
  const nextPeriodDate = getNextPeriodDate(profile);
  const reminderMessage = getPhaseMessage(profile, displayName);

  const calendarDays = useMemo(
    () => buildCycleCalendarDays(calendarMonth.getFullYear(), calendarMonth.getMonth(), profile),
    [calendarMonth, profile],
  );

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!user) return;
    if (averageCycleLength < 15 || averageCycleLength > 90) {
      setError('Use an average cycle length between 15 and 90 days.');
      return;
    }
    if (averagePeriodLength < 1 || averagePeriodLength > 14) {
      setError('Use an average period length between 1 and 14 days.');
      return;
    }
    setIsSavingProfile(true);
    try {
      await saveCycleProfile(user, {
        displayName,
        trackingMode,
        averageCycleLength,
        averagePeriodLength,
        lastPeriodStart,
        reminderOptIn,
        notificationDay,
        notes: cycleNotes,
      });
      setNotice('Cycle profile saved. Your calendar and weekly reminder preview have updated.');
    } catch (err) {
      setError(getMessage(err) || 'Could not save your cycle profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const openCart = () => setIsCartOpen(true);

  const handleCheckout = () => {
    if (!user) {
      router.push('/login?next=/checkout');
      return;
    }
    if (cart.items.length === 0) {
      setNotice('Your cart is empty.');
      return;
    }
    router.push('/checkout');
  };

  const changeCalendarMonth = (amount: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader cartCount={cart.itemCount} onCartClick={openCart} />
      <CartDrawer
        cart={cart}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
        userId={user?.uid}
      />

      <main className="pb-16">
        {/* Hero — solid white like shop/about */}
        <section className="border-b border-stone-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end lg:py-14">
            <div>
              <Eyebrow>Cycle tracking</Eyebrow>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                A calendar for care before the urgent moment.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#584140]">
                Save your cycle pattern, track irregular months, and open your cart when you need to restock.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openCart}
                  className="bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520]"
                >
                  Open cart ({cart.itemCount})
                </button>
                <Link
                  href="/shop"
                  className="border border-[#ae2f34] px-5 py-3 text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]"
                >
                  Shop care items
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <PhaseCircle cycleDay={todayCycleDay} currentPhase={currentPhase} size={280} />
              <p className="mt-4 text-center text-sm text-[#584140]">
                Phase: <span className="font-semibold text-[#191c1d]">{getPhaseLabel(currentPhase)}</span>
                {' · '}
                Next period: <span className="font-semibold text-[#191c1d]">{formatDisplayDate(nextPeriodDate)}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-8 lg:grid-cols-[360px_1fr]">
          {/* Sidebar */}
          <aside className="grid gap-5 lg:sticky lg:top-28 lg:self-start">
            {/* Settings form */}
            <form onSubmit={saveProfile} className="border border-stone-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Profile</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#191c1d]">Cycle settings</h2>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Preferred name
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Tracking context
                  <select
                    value={trackingMode}
                    onChange={(e) => setTrackingMode(e.target.value as CycleTrackingMode)}
                    className={inputClass}
                  >
                    {trackingModes.map((mode) => (
                      <option key={mode.value} value={mode.value}>
                        {mode.label}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs font-normal leading-5 text-stone-500">
                    {trackingModes.find((mode) => mode.value === trackingMode)?.detail}
                  </span>
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-stone-700">
                    Avg cycle
                    <input
                      type="number"
                      min={15}
                      max={90}
                      value={averageCycleLength}
                      onChange={(e) => setAverageCycleLength(Number(e.target.value))}
                      className={inputClass}
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-stone-700">
                    Avg period
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={averagePeriodLength}
                      onChange={(e) => setAveragePeriodLength(Number(e.target.value))}
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Last period start
                  <input
                    type="date"
                    value={lastPeriodStart}
                    onChange={(e) => setLastPeriodStart(e.target.value)}
                    className={inputClass}
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Weekly notification day
                  <select
                    value={notificationDay}
                    onChange={(e) => setNotificationDay(e.target.value)}
                    className={inputClass}
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-start gap-3 border border-[#e0bfbd] bg-[#fff5f0] p-3 text-sm leading-5 text-[#584140]">
                  <input
                    type="checkbox"
                    checked={reminderOptIn}
                    onChange={(e) => setReminderOptIn(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-[#ae2f34]"
                  />
                  Save me as opted in for weekly BloomBox reminders.
                </label>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Notes
                  <textarea
                    value={cycleNotes}
                    onChange={(e) => setCycleNotes(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Optional context for yourself"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-60"
                >
                  {isSavingProfile ? 'Saving...' : 'Save cycle profile'}
                </button>
              </div>
            </form>

            <div className="border border-stone-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Cart</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-[#191c1d]">
                {cart.itemCount === 0 ? 'Empty for now' : `${cart.itemCount} items`}
              </h2>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={openCart}
                  className="flex-1 border border-stone-300 px-3 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                >
                  View cart
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cart.items.length === 0}
                  className="flex-1 bg-[#ae2f34] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-50"
                >
                  Checkout
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-stone-500">{money(cart.subtotal)} subtotal</p>
            </div>
          </aside>

          {/* Right column */}
          <div className="grid gap-7">
            {error && (
              <div className="border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div>
            )}
            {notice && (
              <div className="border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div>
            )}

            {/* Calendar */}
            <section className="border border-stone-200 bg-white">
              <div className="flex flex-col justify-between gap-4 border-b border-stone-200 p-5 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Calendar</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold text-[#191c1d]">
                    {calendarMonth.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => changeCalendarMonth(-1)}
                    className="border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date())}
                    className="border border-[#ae2f34] px-3 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0]"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => changeCalendarMonth(1)}
                    className="border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 border-b border-stone-200 bg-[#fff5f0] px-5 py-3">
                {(['menstrual', 'follicular', 'ovulatory', 'luteal'] as CyclePhase[]).map((phase) => (
                  <span key={phase} className={`border px-2 py-1 text-[10px] font-bold uppercase ${phaseStyles[phase]}`}>
                    {getPhaseLabel(phase)}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 border-b border-stone-200 bg-white text-center text-xs font-bold uppercase tracking-[0.12em] text-[#584140]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="border-r border-stone-200 px-2 py-2 last:border-r-0">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day) => (
                  <button
                    type="button"
                    key={day.dateKey}
                    onClick={() => setSelectedDate(day.dateKey)}
                    className={`min-h-[88px] border-b border-r border-stone-200 p-2 text-left last:border-r-0 hover:bg-[#fff5f0] sm:min-h-[100px] ${
                      day.isCurrentMonth ? 'bg-white' : 'bg-stone-50 text-stone-400'
                    } ${selectedDate === day.dateKey ? 'ring-2 ring-inset ring-[#ae2f34]' : ''}`}
                  >
                    <span
                      className={`inline-flex h-7 w-7 items-center justify-center text-xs font-semibold ${
                        day.isToday ? 'bg-[#ae2f34] text-white' : ''
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.isCurrentMonth && day.phase !== 'unknown' && (
                      <div className={`mt-2 border px-2 py-1 text-[10px] font-semibold ${phaseStyles[day.phase]}`}>
                        {getPhaseLabel(day.phase)}
                      </div>
                    )}
                    {day.cycleDay && day.isCurrentMonth && (
                      <p className="mt-1 text-[11px] text-stone-500">Cycle day {day.cycleDay}</p>
                    )}
                    {day.isCurrentMonth && day.phase !== 'unknown' && (
                      <span className={`mt-1 block h-1.5 w-1.5 sm:hidden ${phaseDot[day.phase]}`} />
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Notification + pattern */}
            <div className="grid gap-5 lg:grid-cols-[1fr_0.88fr]">
              <div className="border border-stone-200 bg-[#fff5f0] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Weekly notification preview</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">
                  {getPhaseLabel(currentPhase)} message
                </h2>
                <p className="mt-4 text-base leading-7 text-[#584140]">&quot;{reminderMessage}&quot;</p>
                <p className="mt-4 text-xs leading-5 text-stone-600">
                  Saved reminder preference: {reminderOptIn ? `weekly on ${notificationDay}` : 'not opted in'}.
                </p>
              </div>

              <div className="border border-stone-200 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Pattern note</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">
                  Regular, irregular, and future modes.
                </h2>
                <p className="mt-4 text-sm leading-6 text-stone-600">{getModeNote(trackingMode)}</p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  This feature is for planning and comfort support, not diagnosis or medical advice.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
