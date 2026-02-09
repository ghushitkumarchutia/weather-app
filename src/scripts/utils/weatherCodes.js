const asInt = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? Math.trunc(num) : null;
};

export const iconForWeatherCode = (code) => {
  const c = asInt(code);
  if (c === 0) return "./assets/images/icon-sunny.webp";
  if (c === 1 || c === 2) return "./assets/images/icon-partly-cloudy.webp";
  if (c === 3) return "./assets/images/icon-overcast.webp";
  if (c === 45 || c === 48) return "./assets/images/icon-fog.webp";
  if (c >= 51 && c <= 57) return "./assets/images/icon-drizzle.webp";
  if ((c >= 61 && c <= 67) || (c >= 80 && c <= 82)) {
    return "./assets/images/icon-rain.webp";
  }
  if (c >= 71 && c <= 77) return "./assets/images/icon-snow.webp";
  if (c >= 95 && c <= 99) return "./assets/images/icon-storm.webp";
  return "./assets/images/icon-overcast.webp";
};
