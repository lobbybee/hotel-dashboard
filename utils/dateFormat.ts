import { getEffectiveTimezone } from '~/composables/useHotelTimezone';

type DateInput = string | number | Date | null | undefined;

const toValidDate = (dateInput: DateInput): Date | null => {
  if (dateInput === null || dateInput === undefined || dateInput === '') return null;

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  return Number.isNaN(date.getTime()) ? null : date;
};

const withTimezone = (options: Intl.DateTimeFormatOptions = {}): Intl.DateTimeFormatOptions => {
  const timeZone = getEffectiveTimezone();
  if (!timeZone) return options;

  return {
    ...options,
    timeZone,
  };
};

export const formatDateInHotelTz = (
  dateInput: DateInput,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'en-US'
): string => {
  const date = toValidDate(dateInput);
  if (!date) return 'N/A';

  return date.toLocaleString(locale, withTimezone(options));
};

export const formatDateOnlyInHotelTz = (
  dateInput: DateInput,
  locale = 'en-US',
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const date = toValidDate(dateInput);
  if (!date) return 'N/A';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return date.toLocaleDateString(locale, withTimezone({ ...defaultOptions, ...options }));
};

export const formatDateTimeCompactInHotelTz = (
  dateInput: DateInput,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const date = toValidDate(dateInput);
  if (!date) return 'N/A';

  const day = formatDateInHotelTz(date, { day: 'numeric' }, 'en-US');
  const month = formatDateInHotelTz(date, { month: 'short' }, 'en-US');
  const year = formatDateInHotelTz(date, { year: 'numeric' }, 'en-US');
  const time = formatDateInHotelTz(
    date,
    {
      hour: 'numeric',
      hour12: true,
      ...options,
    },
    'en-US'
  );

  return `${day} ${month} ${year} ${time}`;
};

/**
 * Expected checkout times land on quarter hours, so stepping by 1 minute is tedious.
 * Caveat: PrimeVue's minute spinner wraps inside the hour (10:45 + 15 -> 10:00), it
 * does not carry into the hour — the hour spinner or the day buttons handle that.
 */
export const CHECKOUT_MINUTE_STEP = 15;

// Fallback when the hotel has no check_out_time configured.
export const DEFAULT_CHECKOUT_TIME = '10:00';

/**
 * Snap a date to the hotel's checkout time. Without this, defaults derived from
 * Date.now() carry the current wall clock into the field ("11 Sep, 10:12 AM").
 */
export const atCheckoutTime = (
  dateInput: DateInput,
  time: string = DEFAULT_CHECKOUT_TIME
): Date => {
  const date = toValidDate(dateInput) ?? new Date();
  const [h, m] = (time || DEFAULT_CHECKOUT_TIME).split(':');
  const out = new Date(date);
  out.setHours(Number(h) || 0, Number(m) || 0, 0, 0);
  return out;
};

/** Tomorrow at the hotel's checkout time — the default stay is one night. */
export const defaultCheckoutDate = (time: string = DEFAULT_CHECKOUT_TIME): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return atCheckoutTime(tomorrow, time);
};

/** Shift a date by whole days, keeping the time of day intact. */
export const addDays = (dateInput: DateInput, days: number): Date => {
  const out = new Date(toValidDate(dateInput) ?? new Date());
  out.setDate(out.getDate() + days);
  return out;
};

/**
 * Floor a date's minutes to a step, matching how PrimeVue's DatePicker renders a
 * stepped time spinner. Without this, a stored 10:12 displays as 10:00 under
 * stepMinute=15 while the model still holds 10:12.
 */
export const snapToMinuteStep = (dateInput: DateInput, step: number): Date => {
  const out = new Date(toValidDate(dateInput) ?? new Date());
  out.setMinutes(Math.floor(out.getMinutes() / step) * step, 0, 0);
  return out;
};
