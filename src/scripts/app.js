const $ = (selector, root = document) => root.querySelector(selector);

const state = {
  system: "metric",
  temperature: "c",
  wind: "kmh",
  precip: "mm",
  day: "Tuesday",
};

const suggestionsSource = [
  "Berlin, Germany",
  "New York, United States",
  "London, United Kingdom",
  "Tokyo, Japan",
  "Sydney, Australia",
];

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

const setSystem = (system) => {
  state.system = system;

  if (system === "imperial") {
    state.temperature = "f";
    state.wind = "mph";
    state.precip = "in";
  } else {
    state.temperature = "c";
    state.wind = "kmh";
    state.precip = "mm";
  }

  const action = $(".menu--units [data-action='toggleSystem']");
  if (action)
    action.textContent =
      system === "imperial" ? "Switch to Metric" : "Switch to Imperial";

  updateUnitsUI();
  updateDummyValues();
};

const updateUnitsUI = () => {
  const unitsMenu = $(".menu--units");
  if (!unitsMenu) return;

  const groupMap = {
    temperature: state.temperature,
    wind: state.wind,
    precip: state.precip,
  };

  unitsMenu.querySelectorAll("[data-group]").forEach((button) => {
    const group = button.getAttribute("data-group");
    const value = button.getAttribute("data-value");
    const selectedValue = group ? groupMap[group] : null;
    if (!group || !value || !selectedValue) return;
    button.classList.toggle("is-selected", value === selectedValue);
  });

  const inferredSystem =
    state.temperature === "f" && state.wind === "mph" && state.precip === "in"
      ? "imperial"
      : "metric";
  state.system = inferredSystem;

  const action = unitsMenu.querySelector("[data-action='toggleSystem']");
  if (action)
    action.textContent =
      inferredSystem === "imperial" ? "Switch to Metric" : "Switch to Imperial";
};

const updateDayUI = () => {
  const label = $(".daySelect__label");
  if (label) label.textContent = state.day;

  const menu = $(".menu--days");
  if (!menu) return;
  menu.querySelectorAll("[data-day]").forEach((button) => {
    const day = button.getAttribute("data-day");
    const isSelected = day === state.day;
    button.classList.toggle("is-selected", isSelected);
    const existingCheck = button.querySelector(".menu__check");
    if (isSelected && !existingCheck) {
      const check = document.createElement("img");
      check.className = "menu__check";
      check.src = "./assets/images/icon-checkmark.svg";
      check.alt = "";
      check.width = 14;
      check.height = 14;
      button.append(check);
    }
    if (!isSelected && existingCheck) existingCheck.remove();
  });
};

const updateDummyValues = () => {
  const isImperial = state.temperature === "f";
  const temp = $(".today__tempValue");
  const feels = document.querySelectorAll(".metric__value")[0];
  const wind = document.querySelectorAll(".metric__value")[2];
  const precip = document.querySelectorAll(".metric__value")[3];

  if (temp) temp.textContent = isImperial ? "68" : "20";
  if (feels) feels.textContent = isImperial ? "64°" : "18°";
  if (wind) wind.textContent = state.wind === "mph" ? "9 mph" : "14 km/h";
  if (precip) precip.textContent = state.precip === "in" ? "0 in" : "0 mm";
};

const renderSuggestions = (items) => {
  const box = $("#search-suggestions");
  const input = $(".search__input");
  if (!box || !input) return;

  box.textContent = "";
  if (items.length === 0) {
    box.hidden = true;
    input.setAttribute("aria-expanded", "false");
    return;
  }

  items.forEach((text) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "suggestions__item";
    button.setAttribute("role", "option");
    button.textContent = text;
    button.addEventListener("mousedown", (event) => event.preventDefault());
    button.addEventListener("click", () => {
      input.value = text;
      box.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.focus();
    });
    box.append(button);
  });

  box.hidden = false;
  input.setAttribute("aria-expanded", "true");
};

const init = () => {
  const unitsButton = $("[data-menu-button='units']");
  const dayButton = $("[data-menu-button='days']");
  const unitsMenu = $(".menu--units");
  const daysMenu = $(".menu--days");
  const searchForm = $(".search");
  const searchInput = $(".search__input");
  const suggestionsBox = $("#search-suggestions");

  updateUnitsUI();
  updateDayUI();
  updateDummyValues();

  unitsButton?.addEventListener("click", () => toggleMenu("units"));
  dayButton?.addEventListener("click", () => toggleMenu("days"));

  unitsMenu?.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element ? event.target.closest("button") : null;
    if (!target) return;

    const action = target.getAttribute("data-action");
    if (action === "toggleSystem") {
      setSystem(state.system === "imperial" ? "metric" : "imperial");
      return;
    }

    const group = target.getAttribute("data-group");
    const value = target.getAttribute("data-value");
    if (!group || !value) return;
    state[group] = value;
    updateUnitsUI();
    updateDummyValues();
  });

  daysMenu?.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element ? event.target.closest("button") : null;
    if (!target) return;
    const day = target.getAttribute("data-day");
    if (!day) return;
    state.day = day;
    updateDayUI();
    closeAllMenus();
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    closeAllMenus();
    suggestionsBox.hidden = true;
    searchInput.setAttribute("aria-expanded", "false");
  });

  searchInput?.addEventListener("input", () => {
    const value = searchInput.value.trim().toLowerCase();
    if (!value) {
      renderSuggestions([]);
      return;
    }
    const matches = suggestionsSource
      .filter((item) => item.toLowerCase().includes(value))
      .slice(0, 6);
    renderSuggestions(matches);
  });

  searchInput?.addEventListener("focus", () => {
    const value = searchInput.value.trim().toLowerCase();
    if (!value) return;
    const matches = suggestionsSource
      .filter((item) => item.toLowerCase().includes(value))
      .slice(0, 6);
    renderSuggestions(matches);
  });

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const clickedMenuButton = target.closest("[data-menu-button]");
    const clickedMenu = target.closest("[data-menu]");
    const clickedSuggestions = target.closest("#search-suggestions");
    const clickedSearchPanel = target.closest(".search__panel");

    if (!clickedMenuButton && !clickedMenu) closeAllMenus();
    if (!clickedSuggestions && !clickedSearchPanel) {
      const box = $("#search-suggestions");
      const input = $(".search__input");
      if (box && input) {
        box.hidden = true;
        input.setAttribute("aria-expanded", "false");
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    closeAllMenus();
    const box = $("#search-suggestions");
    const input = $(".search__input");
    if (box && input) {
      box.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.blur();
    }
  });
};

init();
