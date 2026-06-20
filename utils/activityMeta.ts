// Single source of truth for how each activity action looks in the timeline.
// `node` holds FULL Tailwind classes (not interpolated) so the JIT compiler keeps them.

export interface ActionMeta {
  icon: string; // PrimeVue icon class
  node: string; // full bg/text classes for the timeline node
  label: string; // human label for the filter
}

export const ACTION_META: Record<string, ActionMeta> = {
  guest_created: { icon: 'pi pi-user-plus', node: 'bg-blue-50 text-blue-600', label: 'Guest created' },
  checked_in: { icon: 'pi pi-sign-in', node: 'bg-emerald-50 text-emerald-600', label: 'Checked in' },
  checked_out: { icon: 'pi pi-sign-out', node: 'bg-rose-50 text-rose-600', label: 'Checked out' },
  stay_extended: { icon: 'pi pi-calendar-plus', node: 'bg-amber-50 text-amber-600', label: 'Stay extended' },
  checkin_rejected: { icon: 'pi pi-times-circle', node: 'bg-red-50 text-red-600', label: 'Check-in rejected' },
  room_status: { icon: 'pi pi-refresh', node: 'bg-cyan-50 text-cyan-600', label: 'Room status' },
  staff_created: { icon: 'pi pi-users', node: 'bg-violet-50 text-violet-600', label: 'Staff created' },
  room_created: { icon: 'pi pi-home', node: 'bg-indigo-50 text-indigo-600', label: 'Room created' },
  rooms_created: { icon: 'pi pi-home', node: 'bg-indigo-50 text-indigo-600', label: 'Rooms created' },
};

const DEFAULT_META: ActionMeta = { icon: 'pi pi-circle-fill', node: 'bg-slate-100 text-slate-500', label: 'Activity' };

export const actionMeta = (action: string): ActionMeta => ACTION_META[action] ?? DEFAULT_META;

// Options for the action-type MultiSelect filter.
export const ACTION_OPTIONS = Object.entries(ACTION_META).map(([value, m]) => ({
  value,
  label: m.label,
}));

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31536000],
  ['month', 2592000],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

// "2h ago" / "just now" — relative time for the feed. Exact time stays on hover.
export const timeAgo = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.round((then - Date.now()) / 1000); // negative = past
  const abs = Math.abs(diff);
  if (abs < 45) return 'just now';
  for (const [unit, secs] of UNITS) {
    if (abs >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return 'just now';
};
