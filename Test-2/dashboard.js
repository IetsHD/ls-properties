/* =========================================================
   LS PROPERTIES — Dashboard
   Voeg hier gerust extra tool-cards toe in index.html; dit
   script zorgt automatisch voor de instap-animatie erop.
   ========================================================= */

document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll(".tool-card").forEach((card, i) => {
  card.style.animationDelay = `${i * 70}ms`;
});
