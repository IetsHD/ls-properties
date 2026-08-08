const shells = [
  {
    title: 'Kleine Loods',
    floors: 1,
    price: 35000,
    images: ['assets/shells/Kleine_Loods.png']
  },
  {
    title: 'Middel Loods',
    floors: 1,
    price: 75000,
    images: [
      'assets/shells/Middel_Loods_1.png',
      'assets/shells/Middel_Loods_2.png',
      'assets/shells/Middel_Loods_3.png'
    ]
  },
  {
    title: 'Grote Loods met kelder',
    floors: 2,
    price: 100000,
    images: [
      'assets/shells/Grootte_Loods_Kelder.png',
      'assets/shells/Grootte_Loods_Kelder_2.png',
      'assets/shells/Grootte_Loods_Kelder_3.png'
    ]
  },
  {
    title: 'Envi Shell 03',
    floors: 1,
    price: 35000,
    images: [
      'assets/shells/envi-shell-03.jpg',
      'assets/shells/envi-shell-03.jpg'
    ]
  },
  {
    title: 'Envi Shell 02',
    floors: 1,
    price: 40000,
    images: [
      'assets/shells/envi-shell-02.jpg',
      'assets/shells/envi-shell-02.jpg'
    ]
  },
  {
    title: 'Envi Shell 01',
    floors: 1,
    price: 50000,
    images: [
      'assets/shells/envi-shell-01.jpg',
      'assets/shells/envi-shell-01.jpg'
    ]
  }
];

const formatEuro = value => new Intl.NumberFormat('nl-NL', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0
}).format(value);

const grid = document.getElementById('shellGrid');
const filter = document.getElementById('floorFilter');
const emptyState = document.getElementById('emptyState');

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let activeShell = null;
let activeImageIndex = 0;
let lastFocusedElement = null;

function updateLightbox() {
  if (!activeShell) return;
  const images = activeShell.images;
  activeImageIndex = (activeImageIndex + images.length) % images.length;
  lightboxImage.src = images[activeImageIndex];
  lightboxImage.alt = `Vergrote foto van ${activeShell.title}`;
  lightboxCaption.textContent = images.length > 1
    ? `${activeShell.title} · Foto ${activeImageIndex + 1} van ${images.length}`
    : activeShell.title;
  const single = images.length < 2;
  lightboxPrev.hidden = single;
  lightboxNext.hidden = single;
}

function openLightbox(shell, imageIndex, trigger) {
  activeShell = shell;
  activeImageIndex = imageIndex;
  lastFocusedElement = trigger || document.activeElement;
  updateLightbox();
  lightbox.hidden = false;
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lightboxImage.src = '';
  activeShell = null;
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function stepLightbox(direction) {
  if (!activeShell || activeShell.images.length < 2) return;
  activeImageIndex += direction;
  updateLightbox();
}

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', () => stepLightbox(-1));
lightboxNext.addEventListener('click', () => stepLightbox(1));

lightbox.addEventListener('click', event => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', event => {
  if (lightbox.hidden) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') stepLightbox(-1);
  if (event.key === 'ArrowRight') stepLightbox(1);
});

function render() {
  const selected = filter.value;
  const visible = shells.filter(shell => selected === 'all' || String(shell.floors) === selected);

  grid.innerHTML = visible.map((shell, index) => {
    const photos = shell.images.length;
    return `
      <article class="shell-card" data-card="${index}">
        <div class="image-wrap">
          <img class="shell-image" src="${shell.images[0]}" alt="Preview van ${shell.title}" data-image tabindex="0" role="button" aria-label="Open grote afbeelding van ${shell.title}">
          <button class="nav-btn prev" type="button" aria-label="Vorige foto" data-dir="-1" ${photos < 2 ? 'hidden' : ''}>‹</button>
          <button class="nav-btn next" type="button" aria-label="Volgende foto" data-dir="1" ${photos < 2 ? 'hidden' : ''}>›</button>
        </div>
        <div class="card-body">
          <h3 class="card-title">${shell.title}</h3>
          <p class="card-meta">${shell.floors} Verdieping(en)${photos > 1 ? ` · <span class="photo-count">${photos} Foto's</span>` : ''}</p>
          <p class="card-price">${formatEuro(shell.price)}</p>
        </div>
      </article>
    `;
  }).join('');

  emptyState.hidden = visible.length > 0;

  [...grid.querySelectorAll('.shell-card')].forEach((card, cardIndex) => {
    const shell = visible[cardIndex];
    let imageIndex = 0;
    const img = card.querySelector('[data-image]');

    const openCurrent = () => openLightbox(shell, imageIndex, img);
    img.addEventListener('click', openCurrent);
    img.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openCurrent();
      }
    });

    card.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', event => {
        event.stopPropagation();
        imageIndex = (imageIndex + Number(btn.dataset.dir) + shell.images.length) % shell.images.length;
        img.src = shell.images[imageIndex];
      });
    });
  });
}

filter.addEventListener('change', render);
render();
