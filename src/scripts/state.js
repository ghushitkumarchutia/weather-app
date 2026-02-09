export const state = {
  location: null,
  units: {
    system: "metric",
    temperature: "c",
    wind: "kmh",
    precip: "mm",
  },
  selectedDay: null,
  data: null,
  ui: {
    status: "idle",
    message: "",
  },
};

export const setLocation = (location) => {
  state.location = location;
};

export const setUnits = (units) => {
  state.units = {
    ...state.units,
    ...units,
  };
};

export const setSelectedDay = (day) => {
  state.selectedDay = day;
};

export const setData = (data) => {
  state.data = data;
};

export const setUi = (ui) => {
  state.ui = {
    ...state.ui,
    ...ui,
  };
};
