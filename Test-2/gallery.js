/* =========================================================
   LS PROPERTIES — Shell bezichtiging
   Pas SHELLS hieronder aan om je eigen shells, foto's,
   verdiepingen en prijzen te tonen. Elke shell mag 1 of
   meer foto's hebben — bij meer dan 1 verschijnen automatisch
   de pijltjes en de fototeller.
   ========================================================= */

const SHELLS = [
  {
    id: "kleine-loods",
    name: "Kleine Loods",
    floors: 1,
    price: 35000,
    photos: ["assets/Kleine_Loods.png", ],
  },
  {
    id: "middel-loods",
    name: "Middel Loods",
    floors: 1,
    price: 75000,
    photos: ["assets/Middel_Loods_1.png", "assets/Middel_Loods_2.png", "assets/Middel_Loods_3.png", ],
  },
  {
    id: "grote-loods-kelder",
    name: "Grote Loods met kelder",
    floors: 2,
    price: 100000,
    photos: [ photoUrl("grote-loods-kelder", 1), photoUrl("grote-loods-kelder", 2), photoUrl("grote-loods-kelder", 3) ],
  },
  {
    id: "envi-shell-03",
    name: "Envi Shell 03",
    floors: 1,
    price: 35000,
    photos: [ photoUrl("envi-shell-03", 1), photoUrl("envi-shell-03", 2) ],
  },
  {
    id: "envi-shell-02",
    name: "Envi Shell 02",
    floors: 1,
    price: 40000,
    photos: [ photoUrl("envi-shell-02", 1), photoUrl("envi-shell-02", 2) ],
  },
  {
    id: "envi-shell-01",
    name: "Envi Shell 01",
    floors: 1,
    price: 50000,
    photos: [ photoUrl("envi-shell-01", 1), photoUrl("envi-shell-01", 2) ],
  },
];

/** Genereert een stabiele placeholder-foto-URL per shell.
 *  Vervang deze functie gerust door je eigen afbeeldingspaden,
 *  bv. `assets/${seed}-${n}.jpg`. */
function photoUrl(seed, n){
  return `https://picsum.photos/seed/lsproperties-${seed}-${n}/900/675`;
}

const fmt = (n) => `€ ${Math.round(n).toLocaleString("nl-NL")}`;
const $ = (id) => document.getElementById(id);

/* per-card carousel state, keyed by shell id */
const cardState = {};
SHELLS.forEach(s => { cardState[s.id] = { index: 0 }; });

/* ---------------------------------------------------------
   Filter dropdown
--------------------------------------------------------- */
function buildFilter(){
  const select = $("floorFilter");
  const floors = [...new Set(SHELLS.map(s => s.floors))].sort((a, b) => a - b);
  floors.forEach(f => {
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = `${f} Verdieping${f > 1 ? "en" : ""}`;
    select.appendChild(opt);
  });
  select.addEventListener("change", applyFilter);
}

function applyFilter(){
  const value = $("floorFilter").value;
  let visibleCount = 0;
  document.querySelectorAll(".shell-card").forEach(card => {
    const match = value === "all" || card.dataset.floors === value;
    card.hidden = !match;
    if (match) visibleCount++;
  });
  $("noResults").hidden = visibleCount !== 0;
}

/* ---------------------------------------------------------
   Card rendering
--------------------------------------------------------- */
function renderGrid(){
  const grid = $("shellGrid");
  grid.innerHTML = "";

  SHELLS.forEach((shell, i) => {
    const card = document.createElement("article");
    card.className = "shell-card";
    card.dataset.floors = shell.floors;
    card.style.animationDelay = `${i * 60}ms`;

    const multi = shell.photos.length > 1;

    card.innerHTML = `
      <div class="shell-photo" data-id="${shell.id}">
        ${shell.photos.map((src, idx) => `
          <img
            src="${src}"
            alt="Preview van ${shell.name}${multi ? ` — foto ${idx + 1}` : ""}"
            class="${idx === 0 ? "active" : ""}"
            data-index="${idx}"
            loading="lazy">
        `).join("")}
        ${multi ? `
          <button type="button" class="carousel-arrow prev" aria-label="Vorige foto">&#8249;</button>
          <button type="button" class="carousel-arrow next" aria-label="Volgende foto">&#8250;</button>
          <div class="photo-dots">
            ${shell.photos.map((_, idx) => `<span class="${idx === 0 ? "active" : ""}"></span>`).join("")}
          </div>
        ` : ""}
      </div>
      <div class="shell-info">
        <h3 class="shell-name">${shell.name}</h3>
        <p class="shell-meta">${shell.floors} Verdieping(en)${multi ? ` · <span class="accent">${shell.photos.length} Foto's</span>` : ""}</p>
        <p class="shell-price">${fmt(shell.price)}</p>
      </div>
    `;

    grid.appendChild(card);

    // mark images loaded (fade-in) once they actually load
    card.querySelectorAll("img").forEach(img => {
      img.addEventListener("load", () => img.classList.add("loaded"));
      if (img.complete) img.classList.add("loaded");
    });
  });
}

/* ---------------------------------------------------------
   Carousel logic (event delegation on the grid)
--------------------------------------------------------- */
function showPhoto(photoEl, index){
  const shell = SHELLS.find(s => s.id === photoEl.dataset.id);
  const imgs = photoEl.querySelectorAll("img");
  const dots = photoEl.querySelectorAll(".photo-dots span");
  const total = imgs.length;
  const clamped = ((index % total) + total) % total;

  imgs.forEach((img, i) => img.classList.toggle("active", i === clamped));
  dots.forEach((d, i) => d.classList.toggle("active", i === clamped));
  cardState[shell.id].index = clamped;
}

function attachGridEvents(){
  $("shellGrid").addEventListener("click", (e) => {
    const photoEl = e.target.closest(".shell-photo");
    if (!photoEl) return;
    const shellId = photoEl.dataset.id;
    const state = cardState[shellId];

    if (e.target.closest(".carousel-arrow.prev")){
      showPhoto(photoEl, state.index - 1);
      return;
    }
    if (e.target.closest(".carousel-arrow.next")){
      showPhoto(photoEl, state.index + 1);
      return;
    }
    if (e.target.tagName === "IMG"){
      openLightbox(shellId, state.index);
    }
  });
}

/* ---------------------------------------------------------
   Lightbox
--------------------------------------------------------- */
let lbShellId = null;
let lbIndex = 0;

function openLightbox(shellId, index){
  lbShellId = shellId;
  lbIndex = index;
  renderLightbox();
  $("lightbox").hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox(){
  $("lightbox").hidden = true;
  document.body.style.overflow = "";
}

function renderLightbox(){
  const shell = SHELLS.find(s => s.id === lbShellId);
  const total = shell.photos.length;
  lbIndex = ((lbIndex % total) + total) % total;

  $("lbImage").src = shell.photos[lbIndex];
  $("lbImage").alt = `Preview van ${shell.name} — foto ${lbIndex + 1}`;
  $("lbName").textContent = shell.name;
  $("lbCount").textContent = total > 1 ? `${lbIndex + 1} / ${total}` : "";
  $("lbPrev").hidden = total <= 1;
  $("lbNext").hidden = total <= 1;

  // keep the matching card's carousel in sync with the lightbox
  const photoEl = document.querySelector(`.shell-photo[data-id="${lbShellId}"]`);
  if (photoEl) showPhoto(photoEl, lbIndex);
}

function attachLightboxEvents(){
  $("lbClose").addEventListener("click", closeLightbox);
  $("lbPrev").addEventListener("click", () => { lbIndex--; renderLightbox(); });
  $("lbNext").addEventListener("click", () => { lbIndex++; renderLightbox(); });

  $("lightbox").addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if ($("lightbox").hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft"){ lbIndex--; renderLightbox(); }
    if (e.key === "ArrowRight"){ lbIndex++; renderLightbox(); }
  });
}

/* ---------------------------------------------------------
   Init
--------------------------------------------------------- */
$("year").textContent = new Date().getFullYear();
buildFilter();
renderGrid();
attachGridEvents();
attachLightboxEvents();
