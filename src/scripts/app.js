import { fetchForecast } from "./api/forecast.js";
import { searchPlaces } from "./api/geocoding.js";
import {
  state,
  setData,
  setLocation,
  setSelectedDay,
  setUi,
  setUnits,
} from "./state.js";
import { getDom } from "./ui/dom.js";
import {
  renderCurrent,
  renderDaily,
  renderDayMenu,
  renderHourly,
  renderMetrics,
  renderSuggestions,
} from "./ui/render.js";

const $ = (selector, root = document) => root.querySelector(selector);

let placesController = null;
let forecastController = null;
let debounceId = null;
let places = [];
let selectedPlaceId = null;

const closeAllMenus = () => {
  document.querySelectorAll("[data-menu]").forEach((menu) => {
    menu.hidden = true;
  });
  document.querySelectorAll("[data-menu-button]").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
};

const toggleMenu = (name) => {
  const menu = $(`[data-menu='${name}']`);
  const button = $(`[data-menu-button='${name}']`);
  if (!menu || !button) return;

  const isOpen = !menu.hidden;
  closeAllMenus();
  menu.hidden = isOpen;
  button.setAttribute("aria-expanded", String(!isOpen));
  if (!isOpen) {
    const firstButton = menu.querySelector("button");
    if (firstButton) firstButton.focus();
  }
};

const updateUnitsUI = (dom) => {
  const unitsMenu = dom.unitsMenu;
  if (!unitsMenu) return;

  const groupMap = {
    temperature: state.units.temperature,
    wind: state.units.wind,
    precip: state.units.precip,
  };

  unitsMenu.querySelectorAll("[data-group]").forEach((button) => {
    const group = button.getAttribute("data-group");
    const value = button.getAttribute("data-value");
    const selectedValue = group ? groupMap[group] : null;
    if (!group || !value || !selectedValue) return;
    button.classList.toggle("is-selected", value === selectedValue);
  });

  const inferredSystem =
    state.units.temperature === "f" &&
    state.units.wind === "mph" &&
    state.units.precip === "in"
      ? "imperial"
      : "metric";
  if (inferredSystem !== state.units.system)
    setUnits({ system: inferredSystem });

  const action = unitsMenu.querySelector("[data-action='toggleSystem']");
  if (action) {
    action.textContent =
      inferredSystem === "imperial" ? "Switch to Metric" : "Switch to Imperial";
  }
};

const hideSuggestions = (dom) => {
  if (!dom.suggestionsBox || !dom.searchInput) return;
  dom.suggestionsBox.hidden = true;
  dom.searchInput.setAttribute("aria-expanded", "false");
};

const schedulePlacesSearch = (dom) => {
  selectedPlaceId = null;
  const query = String(dom.searchInput?.value ?? "").trim();

  if (!query) {
    placesController?.abort();
    places = [];
    renderSuggestions(dom, []);
    return;
  }

  if (debounceId) window.clearTimeout(debounceId);
  debounceId = window.setTimeout(async () => {
    placesController?.abort();
    placesController = new AbortController();
    try {
      const nextPlaces = await searchPlaces(query, {
        signal: placesController.signal,
        limit: 6,
        language: "en",
      });
      places = nextPlaces;
      renderSuggestions(dom, places);
    } catch (error) {
      if (error?.name === "AbortError") return;
      places = [];
      renderSuggestions(dom, []);
    }
  }, 200);
};

const getSelectedPlace = (inputValue) => {
  const direct = places.find((p) => String(p.id) === String(selectedPlaceId));
  if (direct) return direct;

  const query = String(inputValue ?? "")
    .trim()
    .toLowerCase();
  if (!query) return places[0] || null;

  return (
    places.find((p) => String(p.label).toLowerCase() === query) ||
    places.find((p) => String(p.label).toLowerCase().includes(query)) ||
    places[0] ||
    null
  );
};

const loadForecast = async (dom, place) => {
  if (!place) return;

  forecastController?.abort();
  forecastController = new AbortController();
  setUi({ status: "loading", message: "" });

  const forecast = await fetchForecast(
    {
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone || "auto",
      units: state.units,
      forecastDays: 7,
    },
    { signal: forecastController.signal },
  );

  const timezone = forecast?.timezone || place.timezone || "auto";
  const dailyDays = Array.isArray(forecast?.daily?.time)
    ? forecast.daily.time.slice(0, 7)
    : [];
  const defaultDay = dailyDays[0] || null;
  const nextSelectedDay =
    state.selectedDay && dailyDays.includes(state.selectedDay)
      ? state.selectedDay
      : defaultDay;

  setLocation({
    id: place.id,
    label: place.label,
    latitude: place.latitude,
    longitude: place.longitude,
    timezone,
  });
  setData(forecast);
  setSelectedDay(nextSelectedDay);
  setUi({ status: "ready", message: "" });

  renderDayMenu(dom, {
    timezone,
    days: dailyDays,
    selectedDay: nextSelectedDay,
  });

  const todayIso =
    (Array.isArray(forecast?.daily?.time) && forecast.daily.time[0]) ||
    String(forecast?.current?.time || "").slice(0, 10) ||
    nextSelectedDay ||
    "1970-01-01";

  renderCurrent(dom, {
    placeLabel: place.label,
    dateIso: todayIso,
    timezone,
    current: forecast?.current,
  });

  renderMetrics(dom, {
    units: state.units,
    current: forecast?.current,
  });

  renderDaily(dom, {
    timezone,
    daily: forecast?.daily,
  });

  renderHourly(dom, {
    timezone,
    hourly: forecast?.hourly,
    selectedDay: nextSelectedDay,
  });
};

const init = () => {
  const dom = getDom();
  updateUnitsUI(dom);

  dom.unitsButton?.addEventListener("click", () => toggleMenu("units"));
  dom.daysButton?.addEventListener("click", () => toggleMenu("days"));

  dom.unitsMenu?.addEventListener("click", async (event) => {
    const target =
      event.target instanceof Element ? event.target.closest("button") : null;
    if (!target) return;

    const action = target.getAttribute("data-action");
    if (action === "toggleSystem") {
      const nextSystem =
        state.units.system === "imperial" ? "metric" : "imperial";
      if (nextSystem === "imperial") {
        setUnits({
          system: "imperial",
          temperature: "f",
          wind: "mph",
          precip: "in",
        });
      } else {
        setUnits({
          system: "metric",
          temperature: "c",
          wind: "kmh",
          precip: "mm",
        });
      }
      updateUnitsUI(dom);
      if (state.location) {
        try {
          await loadForecast(dom, state.location);
        } catch (error) {
          if (error?.name === "AbortError") return;
          setUi({ status: "error", message: "" });
        }
      }
      return;
    }

    const group = target.getAttribute("data-group");
    const value = target.getAttribute("data-value");
    if (!group || !value) return;

    setUnits({ [group]: value });
    updateUnitsUI(dom);

    if (state.location) {
      try {
        await loadForecast(dom, state.location);
      } catch (error) {
        if (error?.name === "AbortError") return;
        setUi({ status: "error", message: "" });
      }
    }
  });

  dom.daysMenu?.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element ? event.target.closest("button") : null;
    if (!target) return;
    const day = target.getAttribute("data-day");
    if (!day) return;

    setSelectedDay(day);
    if (state.data && state.location) {
      const days = Array.isArray(state.data?.daily?.time)
        ? state.data.daily.time.slice(0, 7)
        : [];
      renderDayMenu(dom, {
        timezone: state.location.timezone,
        days,
        selectedDay: state.selectedDay,
      });
      renderHourly(dom, {
        timezone: state.location.timezone,
        hourly: state.data.hourly,
        selectedDay: state.selectedDay,
      });
    }
    closeAllMenus();
  });

  dom.searchForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    closeAllMenus();
    hideSuggestions(dom);

    const picked = getSelectedPlace(dom.searchInput?.value);
    if (!picked) return;

    try {
      await loadForecast(dom, picked);
    } catch (error) {
      if (error?.name === "AbortError") return;
      setUi({ status: "error", message: "" });
    }
  });

  dom.searchInput?.addEventListener("input", () => schedulePlacesSearch(dom));
  dom.searchInput?.addEventListener("focus", () => schedulePlacesSearch(dom));

  dom.suggestionsBox?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const item = target ? target.closest(".suggestions__item") : null;
    if (!item) return;
    const id = item.dataset.placeId;
    if (!id) return;
    const picked = places.find((p) => String(p.id) === String(id));
    if (!picked || !dom.searchInput) return;
    selectedPlaceId = id;
    dom.searchInput.value = picked.label;
    hideSuggestions(dom);
    dom.searchInput.focus();
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const clickedMenuButton = target.closest("[data-menu-button]");
    const clickedMenu = target.closest("[data-menu]");
    const clickedSuggestions = target.closest("#search-suggestions");
    const clickedSearchPanel = target.closest(".search__panel");

    if (!clickedMenuButton && !clickedMenu) closeAllMenus();
    if (!clickedSuggestions && !clickedSearchPanel) hideSuggestions(dom);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeAllMenus();
    hideSuggestions(dom);
    dom.searchInput?.blur();
  });
};

init();
