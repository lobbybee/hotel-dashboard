export const HOTEL_TIMEZONE_KEY = 'hotel_time_zone';

const canUseBrowserStorage = (): boolean => {
  return process.client && typeof window !== 'undefined' && typeof localStorage !== 'undefined';
};

export const isValidTimezone = (timeZone: string): boolean => {
  if (!timeZone || typeof timeZone !== 'string') return false;

  try {
    new Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
};

export const setHotelTimezone = (timeZone: string): void => {
  if (!canUseBrowserStorage()) return;
  if (!isValidTimezone(timeZone)) return;

  localStorage.setItem(HOTEL_TIMEZONE_KEY, timeZone);
};

export const getHotelTimezone = (): string | undefined => {
  if (!canUseBrowserStorage()) return undefined;

  const timeZone = localStorage.getItem(HOTEL_TIMEZONE_KEY) || undefined;
  if (!timeZone || !isValidTimezone(timeZone)) return undefined;

  return timeZone;
};

export const clearHotelTimezone = (): void => {
  if (!canUseBrowserStorage()) return;
  localStorage.removeItem(HOTEL_TIMEZONE_KEY);
};

export const getEffectiveTimezone = (): string | undefined => {
  const hotelTimezone = getHotelTimezone();
  if (hotelTimezone) return hotelTimezone;

  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
};
