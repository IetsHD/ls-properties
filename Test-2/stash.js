/* =========================================================
   LS PROPERTIES — Stash Upgrade calculator
   Rekenregel: extra kg = max(0, gewenste kg - huidige kg)
               totaal   = (extra kg / 100) * prijs per 100kg
   ========================================================= */

const DEFAULTS = {
  currentKg: 400,
  desiredKg: 1000,
  pricePer100: 5000,
};

const fmt = (n) => `€ ${Math.round(n).toLocaleString("nl-NL")}`;
const $ = (id) => document.getElementById(id);

function getInputs(){
  return {
    currentKg: Math.max(0, Number($("currentKg").value) || 0),
    desiredKg: Math.max(0, Number($("desiredKg").value) || 0),
    pricePer100: Math.max(0, Number($("pricePer100").value) || 0),
  };
}

function calculate(){
  const { currentKg, desiredKg, pricePer100 } = getInputs();
  const extraKg = Math.max(0, desiredKg - currentKg);
  const total = (extraKg / 100) * pricePer100;
  return { currentKg, desiredKg, pricePer100, extraKg, total };
}

function render(){
  const c = calculate();

  $("valExtraKg").textContent = `${c.extraKg.toLocaleString("nl-NL")} kg`;
  $("valPricePer100").textContent = fmt(c.pricePer100);
  $("valTotal").textContent = fmt(c.total);

  const lines = [
    "LS Properties — Stash berekening",
    `Huidige kg: ${c.currentKg}`,
    `Gewenste kg: ${c.desiredKg}`,
    `Bij te kopen: ${c.extraKg} kg`,
    `Prijs per 100kg: ${fmt(c.pricePer100)}`,
    `Totaal prijs: ${fmt(c.total)}`,
  ];
  $("summary").value = lines.join("\n");
}

function attachEvents(){
  ["currentKg", "desiredKg", "pricePer100"].forEach(id => {
    $(id).addEventListener("input", render);
  });

  $("copyBtn").addEventListener("click", async () => {
    const text = $("summary").value;
    try{
      await navigator.clipboard.writeText(text);
    }catch(err){
      $("summary").select();
      document.execCommand("copy");
    }
    const confirmEl = $("copyConfirm");
    confirmEl.textContent = "Samenvatting gekopieerd naar klembord.";
    confirmEl.classList.add("show");
    clearTimeout(window.__copyTimeout);
    window.__copyTimeout = setTimeout(() => confirmEl.classList.remove("show"), 2200);
  });

  $("resetBtn").addEventListener("click", () => {
    $("currentKg").value = DEFAULTS.currentKg;
    $("desiredKg").value = DEFAULTS.desiredKg;
    $("pricePer100").value = DEFAULTS.pricePer100;
    render();
  });
}

$("year").textContent = new Date().getFullYear();
attachEvents();
render();
