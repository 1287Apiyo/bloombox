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

/** Soft fill for calendar cells by phase */
const phaseCellBg: Record<CyclePhase, string> = {
  menstrual: 'bg-[#fff0ee]',
  follicular: 'bg-[#e7fbf8]',
  ovulatory: 'bg-[#fff8df]',
  luteal: 'bg-[#f3ebe8]',
  unknown: 'bg-white',
};

const inputClass =
  'w-full border border-stone-300 bg-white px-3 py-2.5 text-base sm:text-sm outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]';

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
      className="mx-auto block h-auto w-full max-w-full"
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
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-stone-200 bg-white pb-[env(safe-area-inset-bottom,0px)]">
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ae2f34]">Cart</p>
            <h2 className="mt-1 text-xl font-semibold text-stone-900">{cart.itemCount} items ready</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-stone-200 px-3 py-1.5 text-sm font-semibold text-stone-600 hover:bg-stone-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {cart.items.length === 0 ? (
            <div className="border border-[#e0bfbd] bg-[#fff5f0] p-5 text-sm leading-6 text-stone-700 sm:p-6">
              Your cart is empty.
              <Link href="/shop" className="mt-3 block font-semibold text-[#ae2f34] hover:underline">
                Open shop →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="border border-stone-200 bg-white p-3 sm:p-4">
                  <div className="grid grid-cols-[64px_1fr] gap-3 sm:grid-cols-[76px_1fr] sm:gap-4">
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

        <div className="border-t border-stone-200 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center justify-between text-sm text-stone-600">
            <span>Subtotal</span>
            <span className="text-lg font-semibold text-stone-900">{money(cart.subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={onCheckout}
            disabled={cart.items.length === 0}
            className="rounded-md mt-4 w-full bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520] disabled:cursor-not-allowed disabled:opacity-60"
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToCycleProfile(user.uid, setProfile, (err) => setError(err.message));
  }, [user]);

  useEffect(() => {
    if (!settingsOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [settingsOpen]);

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

  const selectedDay = useMemo(
    () => calendarDays.find((day) => day.dateKey === selectedDate) ?? null,
    [calendarDays, selectedDate],
  );

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

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
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
      setSettingsOpen(false);
    } catch (err) {
      setError(getMessage(err) || 'Could not save your cycle profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const renderSettingsForm = () => (
    <form onSubmit={handleSaveProfile} className="grid gap-4">
      <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
        Preferred name
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
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

      <div className="grid grid-cols-2 gap-3">
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          Avg cycle (days)
          <input
            type="number"
            min={15}
            max={90}
            value={averageCycleLength}
            onChange={(e) => setAverageCycleLength(Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
          Avg period (days)
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

      <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
        Last period start
        <input
          type="date"
          value={lastPeriodStart}
          onChange={(e) => setLastPeriodStart(e.target.value)}
          className={inputClass}
        />
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
        Weekly reminder day
        <select value={notificationDay} onChange={(e) => setNotificationDay(e.target.value)} className={inputClass}>
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-start gap-3 rounded-lg border border-[#e0bfbd] bg-[#fff5f0] p-3 text-sm leading-5 text-[#584140]">
        <input
          type="checkbox"
          checked={reminderOptIn}
          onChange={(e) => setReminderOptIn(e.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[#ae2f34]"
        />
        Opt in for weekly BloomBox reminders
      </label>

      <label className="grid gap-1.5 text-sm font-semibold text-stone-700">
        Notes
        <textarea
          value={cycleNotes}
          onChange={(e) => setCycleNotes(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="Optional notes for yourself"
        />
      </label>

      <button
        type="submit"
        disabled={isSavingProfile}
        className="rounded-lg bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-60"
      >
        {isSavingProfile ? 'Saving...' : 'Save cycle profile'}
      </button>
    </form>
  );

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

      <main className="pb-24 lg:pb-16">
        {/* ---------- MOBILE STATUS HERO ---------- */}
        <section className="border-b border-stone-200 bg-white lg:hidden">
          <div className="mx-auto max-w-7xl px-4 py-5">
            <div className="flex items-center gap-4">
              <div className="w-[118px] shrink-0">
                <PhaseCircle cycleDay={todayCycleDay} currentPhase={currentPhase} size={200} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Today</p>
                <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight text-[#191c1d]">
                  {getPhaseLabel(currentPhase)}
                </h1>
                <p className="mt-1 text-sm text-stone-600">
                  {todayCycleDay ? `Cycle day ${todayCycleDay}` : 'Set last period to start'}
                </p>
                <div className="mt-3 grid grid-cols-1 gap-1.5">
                  <div className="rounded-lg border border-stone-200 bg-[#fff5f0] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#ae2f34]">Next period</p>
                    <p className="mt-0.5 text-sm font-semibold text-[#191c1d]">{formatDisplayDate(nextPeriodDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-center text-sm font-semibold text-stone-800"
              >
                Edit settings
              </button>
              <Link
                href="/shop"
                className="rounded-lg bg-[#ae2f34] px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Shop care
              </Link>
            </div>

            {!profile ? (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
                Tip: set your last period start and average cycle length so the calendar can colour your phases.
              </p>
            ) : null}
          </div>
        </section>

        {/* ---------- DESKTOP HERO ---------- */}
        <section className="hidden border-b border-stone-200 bg-white lg:block">
          <div className="mx-auto grid max-w-7xl gap-8 px-8 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
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
                  className="rounded-md bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#8c1520]"
                >
                  Open cart ({cart.itemCount})
                </button>
                <Link
                  href="/shop"
                  className="rounded-md border border-[#ae2f34] px-5 py-3 text-sm font-semibold text-[#ae2f34] transition hover:bg-[#fff5f0]"
                >
                  Shop care items
                </Link>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-2">
              <div className="w-full max-w-[280px]">
                <PhaseCircle cycleDay={todayCycleDay} currentPhase={currentPhase} size={280} />
              </div>
              <p className="mt-4 text-center text-sm leading-6 text-[#584140]">
                Phase: <span className="font-semibold text-[#191c1d]">{getPhaseLabel(currentPhase)}</span>
                {' · '}
                Next period: <span className="font-semibold text-[#191c1d]">{formatDisplayDate(nextPeriodDate)}</span>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- MAIN CONTENT ---------- */}
        <section className="mx-auto grid max-w-7xl gap-5 px-3 py-4 sm:gap-7 sm:px-8 sm:py-10 lg:grid-cols-[360px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden gap-5 lg:sticky lg:top-28 lg:grid lg:self-start">
            <div className="border border-stone-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Profile</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#191c1d]">Cycle settings</h2>
              <div className="mt-5">{renderSettingsForm()}</div>
            </div>

            <div className="border border-stone-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Cart</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-[#191c1d]">
                {cart.itemCount === 0 ? 'Empty for now' : `${cart.itemCount} items`}
              </h2>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={openCart}
                  className="rounded-md flex-1 border border-stone-300 px-3 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
                >
                  View cart
                </button>
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={cart.items.length === 0}
                  className="rounded-md flex-1 bg-[#ae2f34] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-50"
                >
                  Checkout
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-stone-500">{money(cart.subtotal)} subtotal</p>
            </div>
          </aside>

          <div className="grid gap-4 sm:gap-7">
            {error ? (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800 sm:p-4">
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900 sm:p-4">
                {notice}
              </div>
            ) : null}

            {/* Calendar — primary mobile surface */}
            <section className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:rounded-md sm:shadow-sm">
              <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-3 py-3 sm:flex-row sm:p-5">
                <div className="min-w-0">
                  <p className="hidden text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34] sm:block">Calendar</p>
                  <h2 className="font-serif text-lg font-semibold text-[#191c1d] sm:mt-2 sm:text-3xl">
                    {calendarMonth.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => changeCalendarMonth(-1)}
                    aria-label="Previous month"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 sm:h-auto sm:w-auto sm:rounded-md sm:px-3 sm:py-2 sm:text-sm sm:font-semibold"
                  >
                    <span className="sm:hidden">‹</span>
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      setCalendarMonth(now);
                      setSelectedDate(toDateKey(now));
                    }}
                    className="rounded-full border border-[#ae2f34] px-3 py-1.5 text-xs font-semibold text-[#ae2f34] hover:bg-[#fff5f0] sm:rounded-md sm:px-3 sm:py-2 sm:text-sm"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => changeCalendarMonth(1)}
                    aria-label="Next month"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-300 text-stone-700 hover:bg-stone-50 sm:h-auto sm:w-auto sm:rounded-md sm:px-3 sm:py-2 sm:text-sm sm:font-semibold"
                  >
                    <span className="sm:hidden">›</span>
                    <span className="hidden sm:inline">Next</span>
                  </button>
                </div>
              </div>

              {/* Legend — compact chips */}
              <div className="bb-mobile-scroll flex gap-1.5 border-b border-stone-200 bg-[#fffaf7] px-3 py-2 sm:flex-wrap sm:gap-2 sm:px-5 sm:py-3">
                {(['menstrual', 'follicular', 'ovulatory', 'luteal'] as CyclePhase[]).map((phase) => (
                  <span
                    key={phase}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${phaseStyles[phase]}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${phaseDot[phase]}`} />
                    {getPhaseLabel(phase)}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 border-b border-stone-100 bg-white text-center text-[10px] font-bold uppercase tracking-wide text-stone-500 sm:text-xs">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={`${day}-${index}`} className="py-2 sm:border-r sm:border-stone-200 sm:py-2.5 sm:last:border-r-0">
                    <span className="sm:hidden">{day}</span>
                    <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index]}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                  const isSelected = selectedDate === day.dateKey;
                  const phaseBg =
                    day.isCurrentMonth && day.phase !== 'unknown' ? phaseCellBg[day.phase] : day.isCurrentMonth ? 'bg-white' : 'bg-stone-50';

                  return (
                    <button
                      type="button"
                      key={day.dateKey}
                      onClick={() => setSelectedDate(day.dateKey)}
                      className={`relative flex min-h-[48px] flex-col items-center justify-start gap-0.5 border-b border-r border-stone-100 p-1 last:border-r-0 sm:min-h-[100px] sm:items-start sm:p-2 ${phaseBg} ${
                        !day.isCurrentMonth ? 'text-stone-300' : 'text-stone-800'
                      } ${isSelected ? 'z-[1] ring-2 ring-inset ring-[#ae2f34]' : ''}`}
                    >
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 ${
                          day.isToday ? 'bg-[#ae2f34] text-white' : ''
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {/* Desktop phase label */}
                      {day.isCurrentMonth && day.phase !== 'unknown' ? (
                        <div className={`bb-cal-phase-label mt-1 hidden border px-1.5 py-0.5 text-[10px] font-semibold sm:block ${phaseStyles[day.phase]}`}>
                          {getPhaseLabel(day.phase)}
                        </div>
                      ) : null}
                      {day.cycleDay && day.isCurrentMonth ? (
                        <p className="bb-cal-cycle-day hidden text-[11px] text-stone-500 sm:block">Day {day.cycleDay}</p>
                      ) : null}

                      {/* Mobile phase bar */}
                      {day.isCurrentMonth && day.phase !== 'unknown' ? (
                        <span className={`mt-auto h-1 w-5 rounded-full sm:hidden ${phaseDot[day.phase]}`} />
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {/* Selected day detail — always useful on mobile */}
              {selectedDay ? (
                <div className="border-t border-stone-200 bg-white px-3 py-3.5 sm:px-5 sm:py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Selected day</p>
                      <h3 className="mt-1 font-serif text-lg font-semibold text-[#191c1d] sm:text-xl">
                        {selectedDay.date.toLocaleDateString('en-KE', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase ${phaseStyles[selectedDay.phase]}`}>
                          {getPhaseLabel(selectedDay.phase)}
                        </span>
                        {selectedDay.cycleDay ? (
                          <span className="text-xs font-medium text-stone-600">Cycle day {selectedDay.cycleDay}</span>
                        ) : (
                          <span className="text-xs text-stone-500">Outside predicted cycle window</span>
                        )}
                      </div>
                    </div>
                    <Link
                      href="/shop"
                      className="shrink-0 rounded-lg border border-[#ae2f34] px-3 py-2 text-xs font-semibold text-[#ae2f34] hover:bg-[#fff5f0] sm:text-sm"
                    >
                      Restock
                    </Link>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#584140]">
                    {selectedDay.phase === 'menstrual'
                      ? 'Period phase — keep pads, cups, and comfort items close.'
                      : selectedDay.phase === 'follicular'
                        ? 'Energy often rises here — a good window to plan care routines.'
                        : selectedDay.phase === 'ovulatory'
                          ? 'Fertile window for many people — hydrate and rest as needed.'
                          : selectedDay.phase === 'luteal'
                            ? 'PMS can show up — soft care extras help before your next period.'
                            : 'Save your cycle settings to predict phases on this day.'}
                  </p>
                </div>
              ) : null}
            </section>

            {/* Today's care message — compact on mobile */}
            <div className="rounded-xl border border-stone-200 bg-[#fff5f0] p-4 shadow-sm sm:rounded-md sm:p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34] sm:text-xs sm:tracking-[0.16em]">
                Care note
              </p>
              <h2 className="mt-1.5 font-serif text-xl font-semibold text-[#191c1d] sm:mt-3 sm:text-3xl">
                {getPhaseLabel(currentPhase)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#584140] sm:mt-4 sm:text-base sm:leading-7">
                &quot;{reminderMessage}&quot;
              </p>
              <p className="mt-2 text-[11px] text-stone-500 sm:mt-4 sm:text-xs">
                Reminders: {reminderOptIn ? `weekly on ${notificationDay}` : 'off'} · Not medical advice
              </p>
            </div>

            {/* Pattern note — desktop only (reduces mobile scroll) */}
            <div className="hidden rounded-md border border-stone-200 bg-white p-5 shadow-sm lg:block">
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
        </section>
      </main>

      {/* Mobile settings bottom sheet */}
      {settingsOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/40"
            aria-label="Close settings"
            onClick={() => setSettingsOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl border border-stone-200 bg-white px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-stone-300" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">Profile</p>
                <h2 className="font-serif text-xl font-semibold text-[#191c1d]">Cycle settings</h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700"
              >
                Close
              </button>
            </div>
            {renderSettingsForm()}
          </div>
        </div>
      ) : null}

      {/* Mobile sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 px-3 py-2 backdrop-blur lg:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-7xl gap-2">
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex-1 rounded-lg border border-stone-300 py-2.5 text-sm font-semibold text-stone-800"
          >
            Settings
          </button>
          <button
            type="button"
            onClick={openCart}
            className="flex-1 rounded-lg border border-stone-300 py-2.5 text-sm font-semibold text-stone-800"
          >
            Cart ({cart.itemCount})
          </button>
          <Link
            href="/shop"
            className="flex-1 rounded-lg bg-[#ae2f34] py-2.5 text-center text-sm font-semibold text-white"
          >
            Shop
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
