export const unitsForSystem = (system) => {
  if (system === "imperial") {
    return {
      system: "imperial",
      temperature: "f",
      wind: "mph",
      precip: "in",
    };
  }

  return {
    system: "metric",
    temperature: "c",
    wind: "kmh",
    precip: "mm",
  };
};

export const inferSystem = (units) => {
  const u = units ?? {};
  return u.temperature === "f" && u.wind === "mph" && u.precip === "in"
    ? "imperial"
    : "metric";
};

export const applyUnitsPatch = (current, patch) => {
  const base = current ?? unitsForSystem("metric");
  const p = patch ?? {};

  if (
    p.system &&
    p.temperature === undefined &&
    p.wind === undefined &&
    p.precip === undefined
  ) {
    return {
      ...base,
      ...unitsForSystem(p.system),
    };
  }

  const next = {
    ...base,
    ...p,
  };

  return {
    ...next,
    system: inferSystem(next),
  };
};

export const unitsActionLabel = (units) =>
  inferSystem(units) === "imperial" ? "Switch to Metric" : "Switch to Imperial";

export const windUnitLabel = (units) =>
  units?.wind === "mph" ? "mph" : "km/h";

export const precipUnitLabel = (units) =>
  units?.precip === "in" ? "in" : "mm";
