'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  saveCycleLog,
  saveCycleProfile,
  subscribeToCycleLogs,
  subscribeToCycleProfile,
  type CycleFlowLevel,
  type CycleLog,
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
} from '@/lib/cycle';
import { useAuth } from '../components/AuthProvider';
import { Eyebrow, SiteFooter, SiteHeader } from '../components/BrandShell';

const trackingModes: Array<{ value: CycleTrackingMode; label: string; detail: string }> = [
  { value: 'regular', label: 'Regular', detail: 'Useful when your cycle is usually predictable.' },
  { value: 'irregular', label: 'Irregular', detail: 'Uses averages and logs without pretending every month is the same.' },
  { value: 'pcos', label: 'PCOS', detail: 'Future: PCOS-aware prediction rules and symptom support.' },
  { value: 'endo', label: 'Endo', detail: 'Future: pain and flare-aware check-ins.' },
  { value: 'birth-control', label: 'Hormonal birth control', detail: 'Future: pill, implant, IUD, and withdrawal-bleed modes.' },
];

const flowOptions: Array<{ value: CycleFlowLevel; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const symptomOptions = ['Cramps', 'Cravings', 'Bloating', 'Tenderness', 'Headache', 'Low energy'];

const phaseStyles = {
  menstrual: 'border-[#ae2f34] bg-[#fff0ee] text-[#8c1520]',
  follicular: 'border-[#006a65] bg-[#e7fbf8] text-[#00504c]',
  ovulatory: 'border-[#FFC857] bg-[#fff8df] text-[#76574e]',
  luteal: 'border-[#76574e] bg-[#f3ebe8] text-[#584140]',
  unknown: 'border-stone-200 bg-white text-stone-500',
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const viewportSettings = { once: true, amount: 0.1 };

function formatDisplayDate(date: Date | null) {
  if (!date) return 'Not enough data yet';
  return date.toLocaleDateString('en-KE', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function CyclePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CycleProfile | null>(null);
  const [logs, setLogs] = useState<CycleLog[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [trackingMode, setTrackingMode] = useState<CycleTrackingMode>('regular');
  const [averageCycleLength, setAverageCycleLength] = useState(28);
  const [averagePeriodLength, setAveragePeriodLength] = useState(5);
  const [lastPeriodStart, setLastPeriodStart] = useState(toDateKey(new Date()));
  const [reminderOptIn, setReminderOptIn] = useState(true);
  const [notificationDay, setNotificationDay] = useState('Monday');
  const [cycleNotes, setCycleNotes] = useState('');
  const [logDate, setLogDate] = useState(toDateKey(new Date()));
  const [flow, setFlow] = useState<CycleFlowLevel>('none');
  const [mood, setMood] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [logNotes, setLogNotes] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingLog, setIsSavingLog] = useState(false);

  useEffect(() => {
    if (!user) return;
    return subscribeToCycleProfile(user.uid, setProfile, (err) => setError(err.message));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeToCycleLogs(user.uid, setLogs, (err) => setError(err.message));
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
  const logByDate = useMemo(() => new Map(logs.map((log) => [log.date, log])), [logs]);

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
      setError(err instanceof Error ? err.message : 'Could not save your cycle profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const saveLog = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!user) return;
    setIsSavingLog(true);
    try {
      await saveCycleLog(user.uid, {
        date: logDate,
        flow,
        mood,
        symptoms,
        notes: logNotes,
      });
      setNotice('Today has been logged.');
      setMood('');
      setSymptoms([]);
      setLogNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this log.');
    } finally {
      setIsSavingLog(false);
    }
  };

  const changeCalendarMonth = (amount: number) => {
    setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-stone-950">
      <SiteHeader />

      <main className="pb-16">
        {/* Hero */}
        <section className="border-b border-stone-200 bg-white">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportSettings}
            transition={{ duration: 0.6 }}
            className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
          >
            <div>
              <Eyebrow>Cycle tracking</Eyebrow>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-none text-[#191c1d] sm:text-6xl">
                A calendar for care before the urgent moment.
              </h1>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-[#584140]">
                Save your cycle pattern, track irregular months, and preview the message BloomBox can use for weekly care notifications.
              </p>
            </div>

            <div className="grid divide-y divide-stone-200 border border-stone-200 bg-[#fff5f0] md:grid-cols-3 md:divide-x md:divide-y-0">
              {[
                ['Today', todayCycleDay ? `Day ${todayCycleDay}` : 'Learning'],
                ['Phase', getPhaseLabel(currentPhase)],
                ['Next period', formatDisplayDate(nextPeriodDate)],
              ].map(([label, value], index) => (
                <div key={label} className="p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">{label}</p>
                  <p className="mt-2 font-serif text-2xl font-semibold text-[#191c1d]">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Content grid */}
        <section className="mx-auto grid max-w-7xl gap-7 px-5 py-10 sm:px-8 lg:grid-cols-[380px_1fr]">
          {/* Sidebar (sticky) */}
          <aside className="grid gap-5 lg:sticky lg:top-28 lg:self-start">
            {/* Profile form */}
            <motion.form
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              transition={{ duration: 0.5 }}
              onSubmit={saveProfile}
              className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Profile</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#191c1d]">Cycle settings</h2>

              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Preferred name
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Tracking context
                  <select
                    value={trackingMode}
                    onChange={(e) => setTrackingMode(e.target.value as CycleTrackingMode)}
                    className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                  >
                    {trackingModes.map((mode) => (
                      <option key={mode.value} value={mode.value}>{mode.label}</option>
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
                      className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
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
                      className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Last period start
                  <input
                    type="date"
                    value={lastPeriodStart}
                    onChange={(e) => setLastPeriodStart(e.target.value)}
                    className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Weekly notification day
                  <select
                    value={notificationDay}
                    onChange={(e) => setNotificationDay(e.target.value)}
                    className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                  >
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </label>

                <label className="flex items-start gap-3 rounded border border-[#e0bfbd] bg-[#fff5f0] p-3 text-sm leading-5 text-[#584140]">
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
                    className="resize-none rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                    placeholder="Optional context for yourself"
                  />
                </label>

                <button
                  disabled={isSavingProfile}
                  className="rounded bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-60"
                >
                  {isSavingProfile ? 'Saving...' : 'Save cycle profile'}
                </button>
              </div>
            </motion.form>

            {/* Daily log form */}
            <motion.form
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              transition={{ duration: 0.5 }}
              onSubmit={saveLog}
              className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Daily log</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#191c1d]">How do you feel?</h2>
              <div className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Date
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                  />
                </label>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Flow
                  <select
                    value={flow}
                    onChange={(e) => setFlow(e.target.value as CycleFlowLevel)}
                    className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                  >
                    {flowOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Mood or energy
                  <input
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                    placeholder="Calm, tired, emotional..."
                  />
                </label>

                <fieldset className="grid gap-2">
                  <legend className="text-sm font-semibold text-stone-700">Symptoms</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {symptomOptions.map((symptom) => (
                      <label
                        key={symptom}
                        className="flex items-center gap-2 rounded border border-stone-200 px-3 py-2 text-xs font-semibold text-stone-700"
                      >
                        <input
                          type="checkbox"
                          checked={symptoms.includes(symptom)}
                          onChange={(e) =>
                            setSymptoms((current) =>
                              e.target.checked ? [...current, symptom] : current.filter((item) => item !== symptom)
                            )
                          }
                          className="h-4 w-4 accent-[#ae2f34]"
                        />
                        {symptom}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Note
                  <textarea
                    value={logNotes}
                    onChange={(e) => setLogNotes(e.target.value)}
                    rows={3}
                    className="resize-none rounded border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34] focus:ring-1 focus:ring-[#ae2f34]"
                  />
                </label>

                <button
                  disabled={isSavingLog}
                  className="rounded border border-[#ae2f34] px-5 py-3 text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0] disabled:opacity-60"
                >
                  {isSavingLog ? 'Logging...' : 'Log today'}
                </button>
              </div>
            </motion.form>
          </aside>

          {/* Right column */}
          <div className="grid gap-7">
            {error && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800"
              >
                {error}
              </motion.div>
            )}
            {notice && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"
              >
                {notice}
              </motion.div>
            )}

            {/* Calendar */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-stone-200 bg-white shadow-sm"
            >
              <div className="flex flex-col justify-between gap-4 border-b border-stone-200 p-5 md:flex-row md:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Calendar</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold text-[#191c1d]">
                    {calendarMonth.toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })}
                  </h2>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => changeCalendarMonth(-1)} className="rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                    Prev
                  </button>
                  <button type="button" onClick={() => setCalendarMonth(new Date())} className="rounded border border-[#ae2f34] px-3 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0]">
                    Today
                  </button>
                  <button type="button" onClick={() => changeCalendarMonth(1)} className="rounded border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 border-b border-stone-200 bg-[#fff5f0] text-center text-xs font-bold uppercase tracking-[0.12em] text-[#584140]">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="border-r border-stone-200 px-2 py-2 last:border-r-0">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day) => {
                  const savedLog = logByDate.get(day.dateKey);
                  return (
                    <div
                      key={day.dateKey}
                      className={`min-h-[108px] border-b border-r border-stone-200 p-2 last:border-r-0 ${
                        day.isCurrentMonth ? 'bg-white' : 'bg-stone-50 text-stone-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                            day.isToday ? 'bg-[#ae2f34] text-white' : ''
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                        {savedLog && (
                          <span className="rounded bg-[#006a65] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                            Logged
                          </span>
                        )}
                      </div>
                      <div className={`mt-2 rounded border px-2 py-1 text-[10px] font-semibold ${phaseStyles[day.phase]}`}>
                        {getPhaseLabel(day.phase)}
                      </div>
                      {day.cycleDay && (
                        <p className="mt-1 text-[11px] text-stone-500">Cycle day {day.cycleDay}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Notification preview + pattern note */}
            <div className="grid gap-5 lg:grid-cols-[1fr_0.88fr]">
              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                transition={{ duration: 0.5 }}
                className="rounded-lg border border-stone-200 bg-[#fff5f0] p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Weekly notification preview</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">{getPhaseLabel(currentPhase)} message</h2>
                <p className="mt-4 text-base leading-7 text-[#584140]">&quot;{reminderMessage}&quot;</p>
                <p className="mt-4 text-xs leading-5 text-stone-600">
                  Saved reminder preference: {reminderOptIn ? `weekly on ${notificationDay}` : 'not opted in'}.
                </p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportSettings}
                transition={{ duration: 0.5 }}
                className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Pattern note</p>
                <h2 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">Regular, irregular, and future modes.</h2>
                <p className="mt-4 text-sm leading-6 text-stone-600">{getModeNote(trackingMode)}</p>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  This feature is for planning and comfort support, not diagnosis or medical advice.
                </p>
              </motion.div>
            </div>

            {/* Recent logs */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportSettings}
              transition={{ duration: 0.5 }}
              className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-col justify-between gap-2 border-b border-stone-200 pb-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Recent logs</p>
                  <h2 className="mt-2 font-serif text-3xl font-semibold text-[#191c1d]">How you have been feeling</h2>
                </div>
                <Link
                  href="/shop"
                  className="rounded border border-[#ae2f34] px-4 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0]"
                >
                  Restock care items
                </Link>
              </div>
              {logs.length === 0 ? (
                <p className="text-sm leading-6 text-stone-600">No logs yet. Add today’s entry to begin building your pattern.</p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {logs.slice(0, 6).map((log) => (
                    <article key={log.id} className="rounded border border-stone-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-stone-950">{log.date}</p>
                        <span className="rounded border border-[#e0bfbd] bg-[#fff5f0] px-2 py-1 text-xs font-semibold text-[#8c1520]">
                          {log.flow}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-5 text-stone-600">{log.mood || 'Mood not added'}</p>
                      {log.symptoms.length > 0 && (
                        <p className="mt-2 text-xs leading-5 text-stone-500">{log.symptoms.join(', ')}</p>
                      )}
                      {log.notes && <p className="mt-2 text-xs leading-5 text-stone-500">{log.notes}</p>}
                    </article>
                  ))}
                </div>
              )}
            </motion.section>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}