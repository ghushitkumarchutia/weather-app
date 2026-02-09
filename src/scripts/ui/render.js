import {
  formatFullDate,
  formatHour12,
  formatNumber,
  formatWeekdayLong,
  formatWeekdayShort,
} from "../utils/format.js";
import { iconForWeatherCode } from "../utils/weatherCodes.js";
import {
  createDayMenuOption,
  createDayTile,
  createHourRow,
  createSuggestionItem,
} from "./templates.js";

export const renderSuggestions = (dom, places) => {
  const box = dom.suggestionsBox;
  const input = dom.searchInput;
  if (!box || !input) return;

  box.textContent = "";

  if (!Array.isArray(places) || places.length === 0) {
    box.hidden = true;
    input.setAttribute("aria-expanded", "false");
    return;
  }

  places.forEach((place) => {
    const item = createSuggestionItem({
      label: place.label,
      placeId: place.id,
    });
    item.addEventListener("mousedown", (event) => event.preventDefault());
    box.append(item);
  });

  box.hidden = false;
  input.setAttribute("aria-expanded", "true");
};

export const renderCurrent = (
  dom,
  { placeLabel, dateIso, timezone, current },
) => {
  if (dom.todayPlace) dom.todayPlace.textContent = placeLabel;
  if (dom.todayDate)
    dom.todayDate.textContent = formatFullDate(dateIso, timezone);
  if (dom.todayIcon)
    dom.todayIcon.src = iconForWeatherCode(current?.weather_code);
  if (dom.todayTempValue) {
    dom.todayTempValue.textContent = formatNumber(current?.temperature_2m, {
      maximumFractionDigits: 0,
    });
  }
  if (dom.todayTempUnit) dom.todayTempUnit.textContent = "°";
};

export const renderMetrics = (dom, { units, current }) => {
  const values = dom.metricsValues;
  if (!Array.isArray(values) || values.length < 4) return;

  const windUnit = units?.wind === "mph" ? "mph" : "km/h";
  const precipUnit = units?.precip === "in" ? "in" : "mm";

  values[0].textContent = `${formatNumber(current?.apparent_temperature, { maximumFractionDigits: 0 })}°`;
  values[1].textContent = `${formatNumber(current?.relative_humidity_2m, { maximumFractionDigits: 0 })}%`;
  values[2].textContent = `${formatNumber(current?.wind_speed_10m, { maximumFractionDigits: 0 })} ${windUnit}`;
  values[3].textContent = `${formatNumber(current?.precipitation, { maximumFractionDigits: 1 })} ${precipUnit}`;
};

export const renderDaily = (dom, { timezone, daily }) => {
  if (!dom.dailyList) return;
  const days = Array.isArray(daily?.time) ? daily.time : [];
  const codes = Array.isArray(daily?.weather_code) ? daily.weather_code : [];
  const highs = Array.isArray(daily?.temperature_2m_max)
    ? daily.temperature_2m_max
    : [];
  const lows = Array.isArray(daily?.temperature_2m_min)
    ? daily.temperature_2m_min
    : [];

  dom.dailyList.textContent = "";
  days.slice(0, 7).forEach((iso, idx) => {
    dom.dailyList.append(
      createDayTile({
        ariaLabel: formatWeekdayLong(iso, timezone),
        name: formatWeekdayShort(iso, timezone),
        iconSrc: iconForWeatherCode(codes[idx]),
        high: `${formatNumber(highs[idx], { maximumFractionDigits: 0 })}°`,
        low: `${formatNumber(lows[idx], { maximumFractionDigits: 0 })}°`,
      }),
    );
  });
};

export const renderDayMenu = (dom, { timezone, days, selectedDay }) => {
  if (!dom.daysMenu || !dom.daySelectLabel) return;
  const list = Array.isArray(days) ? days : [];

  dom.daysMenu.textContent = "";
  list.forEach((iso) => {
    dom.daysMenu.append(
      createDayMenuOption({
        value: iso,
        label: formatWeekdayLong(iso, timezone),
        selected: iso === selectedDay,
      }),
    );
  });

  dom.daySelectLabel.textContent =
    selectedDay && list.includes(selectedDay)
      ? formatWeekdayLong(selectedDay, timezone)
      : "Select day";
};

export const renderHourly = (dom, { timezone, hourly, selectedDay }) => {
  if (!dom.hourlyList) return;
  const times = Array.isArray(hourly?.time) ? hourly.time : [];
  const temps = Array.isArray(hourly?.temperature_2m)
    ? hourly.temperature_2m
    : [];
  const codes = Array.isArray(hourly?.weather_code) ? hourly.weather_code : [];

  const indices = [];
  for (let i = 0; i < times.length; i += 1) {
    if (!selectedDay || String(times[i]).slice(0, 10) !== selectedDay) continue;
    indices.push(i);
  }

  const afternoon = indices.filter((i) => {
    const h = Number(String(times[i]).slice(11, 13));
    return Number.isFinite(h) && h >= 15 && h <= 22;
  });

  const picked = (afternoon.length ? afternoon : indices).slice(0, 8);
  dom.hourlyList.textContent = "";

  picked.forEach((i) => {
    dom.hourlyList.append(
      createHourRow({
        time: formatHour12(times[i], timezone),
        iconSrc: iconForWeatherCode(codes[i]),
        temp: `${formatNumber(temps[i], { maximumFractionDigits: 0 })}°`,
      }),
    );
  });
};
