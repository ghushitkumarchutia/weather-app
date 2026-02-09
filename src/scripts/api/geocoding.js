const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";

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
      `Geocoding request failed (${response.status})${body ? `: ${body}` : ""}`,
    );
  }

  return response.json();
};

const formatPlaceLabel = (place) => {
  const parts = [place.name, place.admin1, place.country].filter(Boolean);
  return parts.join(", ");
};

export const searchPlaces = async (
  name,
  { signal, limit = 6, language = "en" } = {},
) => {
  const query = String(name ?? "").trim();
  if (!query) return [];

  const url = buildUrl(GEOCODING_URL, {
    name: query,
    count: limit,
    language,
    format: "json",
  });

  const data = await fetchJson(url, { signal });
  const results = Array.isArray(data?.results) ? data.results : [];

  return results.map((place) => ({
    id: place.id ?? `${place.latitude},${place.longitude}`,
    name: place.name ?? "",
    country: place.country ?? "",
    admin1: place.admin1 ?? "",
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone ?? null,
    label: formatPlaceLabel(place),
  }));
};
