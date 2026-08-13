/* =========================================================
   LS PROPERTIES — Aankoop configurator
   Alle prijzen en percentages staan hieronder in CONFIG.
   Pas deze waarden aan om het aanbod van je makelaardij
   te weerspiegelen — de rest van de app rekent automatisch.
   ========================================================= */

const CONFIG = {
  shells: [
    { id: "container",   label: "Container",            price: 10000,  stashBaseKg: 200 },
    { id: "starter",     label: "Starterswoning",        price: 25000,  stashBaseKg: 400 },
    { id: "midden",      label: "Middenklasse woning",   price: 50000,  stashBaseKg: 600 },
    { id: "villa",       label: "Villa",                 price: 120000, stashBaseKg: 1000 },
    { id: "landhuis",    label: "Landhuis",               price: 250000, stashBaseKg: 1500 },
  ],
  gardens: [
    { id: "none",   label: "Geen tuin",             price: 0 },
    { id: "small",  label: "Kleine tuin",            price: 5000 },
    { id: "large",  label: "Grote tuin",             price: 12000 },
    { id: "pool",   label: "Tuin met zwembad",       price: 30000 },
  ],
  locationClasses: [
    { id: "K5", label: "K5", desc: "Klasse 5: Achterbuurt",      pct: 0 },
    { id: "K4", label: "K4", desc: "Klasse 4: Woonwijk",          pct: 10 },
    { id: "K3", label: "K3", desc: "Klasse 3: Centrum",           pct: 25 },
    { id: "K2", label: "K2", desc: "Klasse 2: Buitenwijk luxe",   pct: 45 },
    { id: "K1", label: "K1", desc: "Klasse 1: Prime locatie",     pct: 75 },
  ],
  // percentage toeslag per aantal sterren afwerking (index = aantal sterren)
  finishLevels: [0, 15, 30, 50],
  finishNames: ["Standaard afwerking", "Verbeterde afwerking", "Premium afwerking", "Exclusieve afwerking"],
  stash: {
    maxKg: 3000,
    pricePerKg: 15,
  },
  discountPct: 10,
  currency: "€",
};

/* ---------------------------------------------------------
   State
--------------------------------------------------------- */
const state = {
  shellId: CONFIG.shells[0].id,
  gardenId: CONFIG.gardens[0].id,
  locationId: CONFIG.locationClasses[0].id,
  finishStars: 0,
  stashEnabled: false,
  stashKg: 1000,
  discountApplied: false,
};

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */
const fmt = (n) => `${CONFIG.currency} ${Math.round(n).toLocaleString("nl-NL")}`;

const $ = (id) => document.getElementById(id);

function getShell(){ return CONFIG.shells.find(s => s.id === state.shellId); }
function getGarden(){ return CONFIG.gardens.find(g => g.id === state.gardenId); }
function getLocation(){ return CONFIG.locationClasses.find(l => l.id === state.locationId); }

/* ---------------------------------------------------------
   Build static option lists (dropdowns, pills, stars)
--------------------------------------------------------- */
function buildOptions(){
  const shellSelect = $("shell");
  CONFIG.shells.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = `${s.label} (${fmt(s.price)} · ${s.stashBaseKg} kg stash)`;
    shellSelect.appendChild(opt);
  });

  const gardenSelect = $("garden");
  CONFIG.gardens.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.id;
    opt.textContent = `${g.label} (${fmt(g.price)})`;
    gardenSelect.appendChild(opt);
  });

  const locGroup = $("locationGroup");
  CONFIG.locationClasses.forEach(l => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pill";
    btn.dataset.id = l.id;
    btn.textContent = l.label;
    btn.setAttribute("aria-pressed", "false");
    locGroup.appendChild(btn);
  });

  const starsWrap = $("finishStars");
  for (let i = 1; i <= 3; i++){
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "star-btn";
    btn.dataset.value = i;
    btn.setAttribute("aria-label", `${i} ster${i > 1 ? "ren" : ""}`);
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 7-6.3-3.9L5.7 21l1.7-7L2 9.2l7.1-.6z"/></svg>`;
    starsWrap.appendChild(btn);
  }

  $("stashMax").textContent = CONFIG.stash.maxKg.toLocaleString("nl-NL");
  $("stashKg").max = CONFIG.stash.maxKg;
  $("stashKg").value = state.stashKg;

  $("year").textContent = new Date().getFullYear();
}

/* ---------------------------------------------------------
   Sync UI controls to state (visual "active" states)
--------------------------------------------------------- */
function syncControls(){
  $("shell").value = state.shellId;
  $("garden").value = state.gardenId;

  document.querySelectorAll("#locationGroup .pill").forEach(btn => {
    const active = btn.dataset.id === state.locationId;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  const loc = getLocation();
  $("locationHint").textContent = `${loc.desc} (${loc.pct > 0 ? "+" : ""}${loc.pct}%)`;

  document.querySelectorAll("#finishStars .star-btn").forEach(btn => {
    btn.classList.toggle("filled", Number(btn.dataset.value) <= state.finishStars);
  });
  const finishPct = CONFIG.finishLevels[state.finishStars];
  $("finishHint").textContent = `${CONFIG.finishNames[state.finishStars]} (${finishPct > 0 ? "+" : ""}${finishPct}%)`;

  const shell = getShell();
  $("stashBaseHint").textContent = `${shell.label} heeft standaard ${shell.stashBaseKg} kg stash`;

  $("stashToggle").checked = state.stashEnabled;
  $("stashInputWrap").classList.toggle("open", state.stashEnabled);

  $("discountBtn").classList.toggle("active", state.discountApplied);
  $("discountBtn").textContent = state.discountApplied
    ? `${CONFIG.discountPct}% korting toegepast`
    : `Pas ${CONFIG.discountPct}% korting toe`;
  $("discountRow").hidden = !state.discountApplied;
}

/* ---------------------------------------------------------
   Core calculation
--------------------------------------------------------- */
function calculate(){
  const shell = getShell();
  const garden = getGarden();
  const loc = getLocation();
  const finishPct = CONFIG.finishLevels[state.finishStars];

  const shellPrice = shell.price;
  const gardenPrice = garden.price;
  const subtotal = shellPrice + gardenPrice;

  const locationSurcharge = subtotal * (loc.pct / 100);
  const finishSurcharge = subtotal * (finishPct / 100);

  const stashBaseKg = shell.stashBaseKg;
  const extraKg = state.stashEnabled
    ? Math.max(0, Math.min(state.stashKg, CONFIG.stash.maxKg) - stashBaseKg)
    : 0;
  const stashUpgradeTotal = extraKg * CONFIG.stash.pricePerKg;

  const preDiscountTotal = subtotal + locationSurcharge + finishSurcharge + stashUpgradeTotal;
  const discountAmount = state.discountApplied ? preDiscountTotal * (CONFIG.discountPct / 100) : 0;
  const total = preDiscountTotal - discountAmount;

  return {
    shell, garden, loc, finishPct,
    shellPrice, gardenPrice, locationSurcharge, finishSurcharge,
    stashBaseKg, extraKg, stashUpgradeTotal, preDiscountTotal, discountAmount, total,
  };
}

/* ---------------------------------------------------------
   Render cost panel + offerte
--------------------------------------------------------- */
function render(){
  syncControls();
  const c = calculate();

  $("valShell").textContent = fmt(c.shellPrice);
  $("valGarden").textContent = fmt(c.gardenPrice);
  $("valLocation").textContent = fmt(c.locationSurcharge);
  $("valFinish").textContent = fmt(c.finishSurcharge);
  $("valStashKg").textContent = `${c.stashBaseKg} kg / +${c.extraKg} kg`;
  $("valStashUpgradeUnit").textContent = fmt(c.stashUpgradeTotal);
  $("valStashTotal").textContent = fmt(c.stashUpgradeTotal);
  $("valDiscount").textContent = `− ${fmt(c.discountAmount)}`;
  $("valTotal").textContent = fmt(c.total);

  renderOfferte(c);
}

function renderOfferte(c){
  const lines = [];
  lines.push("🏠 LS PROPERTIES — OFFERTE");
  lines.push("─".repeat(32));
  lines.push("");
  lines.push("PRODUCTEN:");
  lines.push(`• Shell: ${c.shell.label} (${fmt(c.shellPrice)})`);
  lines.push(`• Tuin: ${c.garden.label} (${fmt(c.gardenPrice)})`);
  lines.push("");
  lines.push("CONFIGURATIE:");
  lines.push(`• Locatie: ${c.loc.desc} (${c.loc.pct > 0 ? "+" : ""}${c.loc.pct}%)`);
  lines.push(`• Afwerking: ${CONFIG.finishNames[state.finishStars]} (${c.finishPct > 0 ? "+" : ""}${c.finishPct}%)`);
  lines.push(`• Stash: ${c.stashBaseKg} kg basis${state.stashEnabled ? ` + ${c.extraKg} kg extra` : ""}`);
  lines.push("");
  lines.push("KOSTEN:");
  lines.push(`• Locatie toeslag: ${fmt(c.locationSurcharge)}`);
  lines.push(`• Luxe afwerking: ${fmt(c.finishSurcharge)}`);
  lines.push(`• Stash upgrade: ${fmt(c.stashUpgradeTotal)}`);
  if (state.discountApplied){
    lines.push(`• Korting (${CONFIG.discountPct}%): − ${fmt(c.discountAmount)}`);
  }
  lines.push("");
  lines.push("─".repeat(32));
  lines.push(`TOTAAL: ${fmt(c.total)}`);

  $("offerteText").textContent = lines.join("\n");
}

/* ---------------------------------------------------------
   Events
--------------------------------------------------------- */
function attachEvents(){
  $("shell").addEventListener("change", (e) => {
    state.shellId = e.target.value;
    render();
  });

  $("garden").addEventListener("change", (e) => {
    state.gardenId = e.target.value;
    render();
  });

  $("locationGroup").addEventListener("click", (e) => {
    const btn = e.target.closest(".pill");
    if (!btn) return;
    state.locationId = btn.dataset.id;
    render();
  });

  $("finishStars").addEventListener("click", (e) => {
    const btn = e.target.closest(".star-btn");
    if (!btn) return;
    const value = Number(btn.dataset.value);
    // clicking the currently-highest filled star toggles it off
    state.finishStars = (state.finishStars === value) ? value - 1 : value;
    render();
  });

  $("stashToggle").addEventListener("change", (e) => {
    state.stashEnabled = e.target.checked;
    render();
  });

  $("stashKg").addEventListener("input", (e) => {
    let val = Number(e.target.value) || 0;
    val = Math.max(0, Math.min(val, CONFIG.stash.maxKg));
    state.stashKg = val;
    render();
  });

  $("discountBtn").addEventListener("click", () => {
    state.discountApplied = !state.discountApplied;
    render();
  });

  $("copyBtn").addEventListener("click", async () => {
    const text = $("offerteText").textContent;
    try{
      await navigator.clipboard.writeText(text);
    }catch(err){
      // fallback for older browsers / non-secure contexts
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    const confirmEl = $("copyConfirm");
    confirmEl.textContent = "Offerte gekopieerd naar klembord.";
    confirmEl.classList.add("show");
    clearTimeout(window.__copyTimeout);
    window.__copyTimeout = setTimeout(() => confirmEl.classList.remove("show"), 2200);
  });

  $("resetBtn").addEventListener("click", () => {
    state.shellId = CONFIG.shells[0].id;
    state.gardenId = CONFIG.gardens[0].id;
    state.locationId = CONFIG.locationClasses[0].id;
    state.finishStars = 0;
    state.stashEnabled = false;
    state.stashKg = 1000;
    state.discountApplied = false;
    $("stashKg").value = state.stashKg;
    render();
  });
}

/* ---------------------------------------------------------
   Init
--------------------------------------------------------- */
buildOptions();
attachEvents();
render();
