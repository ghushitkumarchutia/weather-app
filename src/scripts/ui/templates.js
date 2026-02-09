const el = (tag, className) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
};

export const createSuggestionItem = ({ label, placeId }) => {
  const button = el("button", "suggestions__item");
  button.type = "button";
  button.setAttribute("role", "option");
  button.textContent = label;
  button.dataset.placeId = String(placeId);
  return button;
};

export const createDayTile = ({ ariaLabel, name, iconSrc, high, low }) => {
  const article = el("article", "day");
  article.setAttribute("role", "listitem");
  if (ariaLabel) article.setAttribute("aria-label", ariaLabel);

  const pName = el("p", "day__name");
  pName.textContent = name;

  const img = el("img", "day__icon");
  img.src = iconSrc;
  img.alt = "";
  img.width = 36;
  img.height = 36;

  const temps = el("p", "day__temps");
  const hi = el("span", "day__high");
  hi.textContent = high;
  const lo = el("span", "day__low");
  lo.textContent = low;
  temps.append(hi, lo);

  article.append(pName, img, temps);
  return article;
};

export const createHourRow = ({ time, iconSrc, temp }) => {
  const row = el("div", "hour");
  row.setAttribute("role", "listitem");

  const img = el("img", "hour__icon");
  img.src = iconSrc;
  img.alt = "";
  img.width = 22;
  img.height = 22;

  const pTime = el("p", "hour__time");
  pTime.textContent = time;

  const pTemp = el("p", "hour__temp");
  pTemp.textContent = temp;

  row.append(img, pTime, pTemp);
  return row;
};

export const createDayMenuOption = ({ value, label, selected }) => {
  const button = el("button", "menu__option");
  button.type = "button";
  button.setAttribute("data-day", value);
  if (selected) button.classList.add("is-selected");

  const span = el("span");
  span.textContent = label;
  button.append(span);

  if (selected) {
    const check = el("img", "menu__check");
    check.src = "./assets/images/icon-checkmark.svg";
    check.alt = "";
    check.width = 14;
    check.height = 14;
    button.append(check);
  }

  return button;
};
