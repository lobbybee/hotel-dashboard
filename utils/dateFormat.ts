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
