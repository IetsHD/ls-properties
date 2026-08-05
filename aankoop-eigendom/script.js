"use strict";

const SHELLS = {
  small: { name: "Kleine Loods", price: 35000, stashKg: 600 },
  medium: { name: "Middelgrote Loods", price: 50000, stashKg: 900 },
  large: { name: "Grote Loods", price: 70000, stashKg: 1200 }
};

const GARDENS = {
  1: { name: "Geen tuin", price: 0 },
  2: { name: "Kleine tuin", price: 10000 },
  3: { name: "Kleine tuin met zwembad", price: 25000 },
  4: { name: "Middel tuin", price: 30000 },
  5: { name: "Middel tuin met zwembad", price: 50000 },
  6: { name: "Grote tuin", price: 75000 },
  7: { name: "Grote tuin met zwembad", price: 100000 },
  8: { name: "Hele grote tuin", price: 150000 },
  9: { name: "Hele grote tuin met alles", price: 200000 }
};

const LOCATIONS = {
  K5: { title: "Klasse 5: Achterbuurt", percentage: 0 },
  K4: { title: "Klasse 4: Randgebied", percentage: 5 },
  K3: { title: "Klasse 3: Gemiddelde buurt", percentage: 10 },
  K2: { title: "Klasse 2: Goede buurt", percentage: 15 },
  K1: { title: "Klasse 1: Toplocatie", percentage: 25 }
};

const FINISHES = {
  0: { title: "Standaard afwerking", percentage: 0 },
  1: { title: "Comfort afwerking", percentage: 5 },
  2: { title: "Luxe afwerking", percentage: 10 },
  3: { title: "Premium afwerking", percentage: 15 }
};

const STASH_PRICE_PER_100_KG = 5000;
const MAX_STASH_KG = 3000;

const elements = {
  shellSelect: document.querySelector("#shellSelect"),
  gardenSelect: document.querySelector("#gardenSelect"),
  locationButtons: [...document.querySelectorAll(".location-button")],
  locationDescription: document.querySelector("#locationDescription"),
  starButtons: [...document.querySelectorAll(".star-button")],
  finishDescription: document.querySelector("#finishDescription"),
  stashToggle: document.querySelector("#stashToggle"),
  desiredKg: document.querySelector("#desiredKg"),
  quoteText: document.querySelector("#quoteText"),
  copyQuoteButton: document.querySelector("#copyQuoteButton"),
  resetButton: document.querySelector("#resetButton"),
  discountButton: document.querySelector("#discountButton"),
  housePrice: document.querySelector("#housePrice"),
  gardenPrice: document.querySelector("#gardenPrice"),
  locationPrice: document.querySelector("#locationPrice"),
  finishPrice: document.querySelector("#finishPrice"),
  stashKg: document.querySelector("#stashKg"),
  stashUpgradeCost: document.querySelector("#stashUpgradeCost"),
  stashTotalPrice: document.querySelector("#stashTotalPrice"),
  discountPrice: document.querySelector("#discountPrice"),
  totalPrice: document.querySelector("#totalPrice"),
  toast: document.querySelector("#toast")
};

const state = {
  location: "K5",
  finish: 0,
  discountApplied: false
};

const euroFormatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0
});

function formatEuro(value) {
  return euroFormatter.format(Math.round(value)).replace(/\u00a0/g, " ");
}

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getCalculation() {
  const shell = SHELLS[elements.shellSelect.value];
  const garden = GARDENS[elements.gardenSelect.value];
  const location = LOCATIONS[state.location];
  const finish = FINISHES[state.finish];

  const baseForSurcharges = shell.price + garden.price;
  const locationCost = baseForSurcharges * (location.percentage / 100);
  const finishBase = baseForSurcharges + locationCost;
  const finishCost = finishBase * (finish.percentage / 100);

  const desiredKg = Math.min(
    MAX_STASH_KG,
    Math.max(0, safeNumber(elements.desiredKg.value, shell.stashKg))
  );
  const extraKg = elements.stashToggle.checked
    ? Math.max(0, desiredKg - shell.stashKg)
    : 0;
  const stashCost = (extraKg / 100) * STASH_PRICE_PER_100_KG;

  const subtotal = shell.price + garden.price + locationCost + finishCost + stashCost;
  const discount = state.discountApplied ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  return {
    shell,
    garden,
    location,
    finish,
    desiredKg,
    extraKg,
    locationCost,
    finishCost,
    stashCost,
    subtotal,
    discount,
    total
  };
}

function buildQuote(calculation) {
  const stashLine = elements.stashToggle.checked
    ? `${calculation.shell.stashKg} kg + ${calculation.extraKg} kg extra (${formatEuro(calculation.stashCost)})`
    : `${calculation.shell.stashKg} kg basis`;

  return [
    "🏠 LS PROPERTIES — OFFERTE",
    "────────────────────",
    "",
    "PRODUCTEN:",
    `• Shell: ${calculation.shell.name} (${formatEuro(calculation.shell.price)})`,
    `• Tuin: ${calculation.garden.name} (${formatEuro(calculation.garden.price)})`,
    "",
    "CONFIGURATIE:",
    `• Locatie: ${calculation.location.title} (${calculation.location.percentage}%)`,
    `• Afwerking: ${calculation.finish.title} (+${calculation.finish.percentage}%)`,
    `• Stash: ${stashLine}`,
    "",
    "KOSTEN:",
    `• Locatietoeslag: ${formatEuro(calculation.locationCost)}`,
    `• Luxe afwerking: ${formatEuro(calculation.finishCost)}`,
    `• Stash upgrade: ${formatEuro(calculation.stashCost)}`,
    `• Subtotaal: ${formatEuro(calculation.subtotal)}`,
    `• Korting: -${formatEuro(calculation.discount)}`,
    "────────────────────",
    `TOTAAL: ${formatEuro(calculation.total)}`
  ].join("\n");
}

function renderLocationButtons() {
  elements.locationButtons.forEach((button) => {
    const active = button.dataset.location === state.location;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const location = LOCATIONS[state.location];
  elements.locationDescription.textContent = `${location.title} (${location.percentage}%)`;
}

function renderFinishButtons() {
  elements.starButtons.forEach((button) => {
    const buttonLevel = Number(button.dataset.finish);
    const active = buttonLevel <= state.finish;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(buttonLevel === state.finish));
  });

  const finish = FINISHES[state.finish];
  elements.finishDescription.textContent = `${finish.title} (+${finish.percentage}%)`;
}

function render() {
  const calculation = getCalculation();

  if (safeNumber(elements.desiredKg.value) !== calculation.desiredKg) {
    elements.desiredKg.value = String(calculation.desiredKg);
  }

  renderLocationButtons();
  renderFinishButtons();

  elements.housePrice.textContent = formatEuro(calculation.shell.price);
  elements.gardenPrice.textContent = formatEuro(calculation.garden.price);
  elements.locationPrice.textContent = formatEuro(calculation.locationCost);
  elements.finishPrice.textContent = formatEuro(calculation.finishCost);
  elements.stashKg.textContent = `${calculation.shell.stashKg} kg / +${calculation.extraKg} kg`;
  elements.stashUpgradeCost.textContent = `Upgrade kost: ${formatEuro(calculation.stashCost)}`;
  elements.stashTotalPrice.textContent = formatEuro(calculation.stashCost);
  elements.discountPrice.textContent = formatEuro(calculation.discount);
  elements.totalPrice.textContent = formatEuro(calculation.total);
  elements.quoteText.value = buildQuote(calculation);

  elements.discountButton.classList.toggle("is-active", state.discountApplied);
  elements.discountButton.setAttribute("aria-pressed", String(state.discountApplied));
  elements.discountButton.textContent = state.discountApplied
    ? "Verwijder 10% Korting"
    : "Pas 10% Korting Toe";
}

let toastTimer;
function showToast(message) {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2200);
}

async function copyQuote() {
  try {
    await navigator.clipboard.writeText(elements.quoteText.value);
    showToast("Offerte gekopieerd.");
  } catch (error) {
    elements.quoteText.focus();
    elements.quoteText.select();
    const copied = document.execCommand("copy");
    showToast(copied ? "Offerte gekopieerd." : "Kopiëren is niet gelukt.");
  }
}

function resetConfigurator() {
  elements.shellSelect.value = "small";
  elements.gardenSelect.value = "none";
  elements.stashToggle.checked = false;
  elements.desiredKg.value = "1000";
  state.location = "K5";
  state.finish = 0;
  state.discountApplied = false;
  render();
  showToast("Configuratie gereset.");
}

elements.shellSelect.addEventListener("change", render);
elements.gardenSelect.addEventListener("change", render);
elements.stashToggle.addEventListener("change", render);
elements.desiredKg.addEventListener("input", render);
elements.desiredKg.addEventListener("blur", render);

elements.locationButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.location = button.dataset.location;
    render();
  });
});

elements.starButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const clickedLevel = Number(button.dataset.finish);
    state.finish = state.finish === clickedLevel ? 0 : clickedLevel;
    render();
  });

  button.addEventListener("mouseenter", () => {
    const previewLevel = Number(button.dataset.finish);
    elements.starButtons.forEach((star) => {
      star.classList.toggle("is-preview", Number(star.dataset.finish) <= previewLevel);
    });
  });

  button.addEventListener("mouseleave", () => {
    elements.starButtons.forEach((star) => star.classList.remove("is-preview"));
  });
});

elements.discountButton.addEventListener("click", () => {
  state.discountApplied = !state.discountApplied;
  render();
});

elements.copyQuoteButton.addEventListener("click", copyQuote);
elements.resetButton.addEventListener("click", resetConfigurator);

render();
