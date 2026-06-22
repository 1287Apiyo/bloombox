import type { CycleProfile } from './firestore';

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';

export type CycleCalendarDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  cycleDay: number | null;
  phase: CyclePhase;
};

const phaseLabels: Record<CyclePhase, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulatory: 'Ovulatory',
  luteal: 'Luteal',
  unknown: 'Learning',
};

const phaseMessages: Record<CyclePhase, string> = {
  menstrual: 'Your period window is active. Keep hydration, comfort, and rest close.',
  follicular: 'Energy may begin to lift. This is a good week for planning and lighter routines.',
  ovulatory: 'You may be near ovulation. Track body cues and keep essentials topped up.',
  luteal: 'Hey Girl, you have entered your Luteal phase, and we are getting ready for that period. The appetite and cravings just hit. Remember to be patient with yourself this week.',
  unknown: 'BloomBox is still learning your pattern. Keep logging dates so reminders become more useful.',
};

const futureModeNotes: Partial<Record<CycleProfile['trackingMode'], string>> = {
  pcos: 'PCOS-aware predictions are marked as a future feature, so this calendar uses your saved average length and logged dates for now.',
  endo: 'Endometriosis-aware symptom support is marked as a future feature, so this calendar keeps the phase estimate simple for now.',
  'birth-control': 'Hormonal birth-control modes are marked as a future feature, so reminders are based on your saved withdrawal or bleed pattern for now.',
};

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1, 12);
}

export function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function daysBetween(startDate: Date, endDate: Date) {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function getCycleDay(profile: Pick<CycleProfile, 'lastPeriodStart' | 'averageCycleLength'>, date = new Date()) {
  if (!profile.lastPeriodStart || profile.averageCycleLength <= 0) {
    return null;
  }

  const lastPeriodStart = parseDateKey(profile.lastPeriodStart);
  const diff = daysBetween(lastPeriodStart, date);
  const normalized = ((diff % profile.averageCycleLength) + profile.averageCycleLength) % profile.averageCycleLength;
  return normalized + 1;
}

export function getCyclePhase(
  cycleDay: number | null,
  averagePeriodLength: number,
  averageCycleLength: number,
): CyclePhase {
  if (!cycleDay) return 'unknown';

  const ovulationDay = Math.max(10, averageCycleLength - 14);
  const periodLength = Math.max(2, Math.min(10, averagePeriodLength));

  if (cycleDay <= periodLength) return 'menstrual';
  if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) return 'ovulatory';
  if (cycleDay > ovulationDay + 1) return 'luteal';
  return 'follicular';
}

export function getPhaseLabel(phase: CyclePhase) {
  return phaseLabels[phase];
}

export function getPhaseMessage(profile: CycleProfile | null, displayName: string, date = new Date()) {
  if (!profile) {
    return 'Add your last period start date to unlock cycle-aware BloomBox reminders.';
  }

  const cycleDay = getCycleDay(profile, date);
  const phase = getCyclePhase(cycleDay, profile.averagePeriodLength, profile.averageCycleLength);
  const name = displayName.trim() || profile.displayName || 'Girl';
  const baseMessage = phaseMessages[phase].replace('Hey Girl', `Hey ${name}`);
  const modeNote = futureModeNotes[profile.trackingMode];

  return modeNote ? `${baseMessage} ${modeNote}` : baseMessage;
}

export function getModeNote(mode: CycleProfile['trackingMode']) {
  return futureModeNotes[mode] ?? 'This profile can use regular or irregular period history with the average cycle length you save.';
}

export function getNextPeriodDate(profile: CycleProfile | null, date = new Date()) {
  if (!profile) return null;

  const cycleDay = getCycleDay(profile, date);
  if (!cycleDay) return null;

  const daysUntilNextPeriod = profile.averageCycleLength - cycleDay + 1;
  return addDays(date, daysUntilNextPeriod);
}

export function buildCycleCalendarDays(year: number, monthIndex: number, profile: CycleProfile | null, today = new Date()) {
  const monthStart = new Date(year, monthIndex, 1, 12);
  const firstGridDate = addDays(monthStart, -monthStart.getDay());
  const todayKey = toDateKey(today);

  return Array.from({ length: 42 }, (_, index): CycleCalendarDay => {
    const date = addDays(firstGridDate, index);
    const cycleDay = profile ? getCycleDay(profile, date) : null;
    const phase = profile ? getCyclePhase(cycleDay, profile.averagePeriodLength, profile.averageCycleLength) : 'unknown';

    return {
      date,
      dateKey: toDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === monthIndex,
      isToday: toDateKey(date) === todayKey,
      cycleDay,
      phase,
    };
  });
}
