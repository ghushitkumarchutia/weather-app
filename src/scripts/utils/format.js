const cleanTimezone = (timezone) => {
  const tz = typeof timezone === "string" ? timezone.trim() : "";
  return tz || undefined;
};

export const formatFullDate = (isoDate, timezone) => {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: cleanTimezone(timezone),
  }).format(date);
};

export const formatWeekdayShort = (isoDate, timezone) => {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: cleanTimezone(timezone),
  }).format(date);
};

export const formatWeekdayLong = (isoDate, timezone) => {
  const date = new Date(`${isoDate}T12:00:00`);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: cleanTimezone(timezone),
  }).format(date);
};

export const formatHour12 = (isoDateTime, timezone) => {
  const date = new Date(isoDateTime);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: true,
    timeZone: cleanTimezone(timezone),
  }).format(date);
};

export const formatNumber = (value, { maximumFractionDigits = 0 } = {}) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "–";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(num);
};
