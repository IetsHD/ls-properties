const currentKgInput = document.querySelector('#currentKg');
const desiredKgInput = document.querySelector('#desiredKg');
const priceInput = document.querySelector('#pricePer100');
const extraKgOutput = document.querySelector('#extraKg');
const priceOutput = document.querySelector('#priceDisplay');
const totalOutput = document.querySelector('#totalPrice');
const summary = document.querySelector('#summary');
const copyButton = document.querySelector('#copyButton');
const resetButton = document.querySelector('#resetButton');
const toast = document.querySelector('#toast');

const defaults = {
  currentKg: 400,
  desiredKg: 1000,
  pricePer100: 5000,
};

const integerFormatter = new Intl.NumberFormat('nl-NL', {
  maximumFractionDigits: 0,
});

const euroFormatter = new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function readNonNegativeNumber(input) {
  const value = Number(input.value);
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function formatEuro(value) {
  return euroFormatter.format(value).replace(/\u00a0/g, ' ');
}

function updateCalculation() {
  const currentKg = readNonNegativeNumber(currentKgInput);
  const desiredKg = readNonNegativeNumber(desiredKgInput);
  const pricePer100 = readNonNegativeNumber(priceInput);

  const extraKg = Math.max(0, desiredKg - currentKg);
  const total = (extraKg / 100) * pricePer100;

  extraKgOutput.textContent = `${integerFormatter.format(extraKg)} kg`;
  priceOutput.textContent = formatEuro(pricePer100);
  totalOutput.textContent = formatEuro(total);

  summary.value = [
    'LS Properties — Stash berekening',
    `Huidige KG: ${integerFormatter.format(currentKg)}`,
    `Gewenste KG: ${integerFormatter.format(desiredKg)}`,
    `Bij te kopen: ${integerFormatter.format(extraKg)} kg`,
    `Prijs per 100kg: ${formatEuro(pricePer100)}`,
    `Totaal prijs: ${formatEuro(total)}`,
  ].join('\n');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove('visible');
  }, 1800);
}

async function copySummary() {
  try {
    await navigator.clipboard.writeText(summary.value);
    showToast('Samenvatting gekopieerd');
  } catch {
    summary.focus();
    summary.select();
    document.execCommand('copy');
    showToast('Samenvatting gekopieerd');
  }
}

function resetCalculator() {
  currentKgInput.value = defaults.currentKg;
  desiredKgInput.value = defaults.desiredKg;
  priceInput.value = defaults.pricePer100;
  updateCalculation();
  showToast('Calculator gereset');
}

[currentKgInput, desiredKgInput, priceInput].forEach((input) => {
  input.addEventListener('input', updateCalculation);
});

copyButton.addEventListener('click', copySummary);
resetButton.addEventListener('click', resetCalculator);

updateCalculation();
