const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const buildUrl = (base, params) => {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url;
};

const fetchJson = async (url, { signal } = {}) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Forecast request failed (${response.status})${body ? `: ${body}` : ""}`,
    );
  }

  return response.json();
};

const normalizeUnits = (units = {}) => {
  const temperatureUnit = units.temperature === "f" ? "fahrenheit" : "celsius";
  const windSpeedUnit = units.wind === "mph" ? "mph" : "kmh";
  const precipitationUnit = units.precip === "in" ? "inch" : "mm";

  return {
    temperature_unit: temperatureUnit,
    wind_speed_unit: windSpeedUnit,
    precipitation_unit: precipitationUnit,
  };
};

export const fetchForecast = async (
  { latitude, longitude, timezone = "auto", units, pastDays, forecastDays = 7 },
  { signal } = {},
) => {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("Invalid latitude/longitude");
  }

  const unitParams = normalizeUnits(units);

  const url = buildUrl(FORECAST_URL, {
    latitude: lat,
    longitude: lon,
    timezone,
    forecast_days: forecastDays,
    past_days: pastDays,
    ...unitParams,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
    hourly: "temperature_2m,precipitation,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
  });

  return fetchJson(url, { signal });
};
