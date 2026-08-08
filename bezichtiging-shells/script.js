const shells = [
  {
    title: 'Kleine Loods',
    floors: 1,
    price: 35000,
    images: ['assets/shells/kleine-loods.jpg']
  },
  {
    title: 'Middel Loods',
    floors: 1,
    price: 75000,
    images: [
      'assets/shells/middel-loods.jpg',
      'assets/shells/middel-loods.jpg',
      'assets/shells/middel-loods.jpg'
    ]
  },
  {
    title: 'Grote Loods',
    floors: 2,
    price: 100000,
    images: [
      'assets/shells/grote-loods.jpg',
      'assets/shells/grote-loods.jpg'
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

function render() {
  const selected = filter.value;
  const visible = shells.filter(shell => selected === 'all' || String(shell.floors) === selected);

  grid.innerHTML = visible.map((shell, index) => {
    const photos = shell.images.length;
    return `
      <article class="shell-card" data-card="${index}">
        <div class="image-wrap">
          <img class="shell-image" src="${shell.images[0]}" alt="Preview van ${shell.title}" data-image>
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
    card.querySelectorAll('[data-dir]').forEach(btn => {
      btn.addEventListener('click', () => {
        imageIndex = (imageIndex + Number(btn.dataset.dir) + shell.images.length) % shell.images.length;
        img.src = shell.images[imageIndex];
      });
    });
  });
}

filter.addEventListener('change', render);
render();
