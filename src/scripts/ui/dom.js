const $ = (selector, root = document) => root.querySelector(selector);

export const getDom = () => {
  const metricsValues = Array.from(
    document.querySelectorAll(".metrics .metric__value"),
  );

  return {
    page: $(".page"),
    content: $(".content"),
    unitsButton: $("[data-menu-button='units']"),
    unitsMenu: $(".menu--units"),
    daysButton: $("[data-menu-button='days']"),
    daysMenu: $(".menu--days"),
    daySelectLabel: $(".daySelect__label"),
    searchForm: $(".search"),
    searchInput: $(".search__input"),
    suggestionsBox: $("#search-suggestions"),
    searchStatus: $(".searchStatus"),
    emptyState: $(".emptyState"),
    grid: $(".grid"),
    todayPlace: $(".today__place"),
    todayDate: $(".today__date"),
    todayIcon: $(".today__icon"),
    todayTempValue: $(".today__tempValue"),
    todayTempUnit: $(".today__tempUnit"),
    metricsValues,
    dailyList: $(".daily__list"),
    hourlyList: $(".hourly__list"),
  };
};
