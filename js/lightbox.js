const images = document.querySelectorAll('[data-lightbox]');
const overlay = document.createElement('div');
overlay.id = 'lightbox-overlay';
overlay.innerHTML = `
  <button id="lb-close" aria-label="Fechar">✕</button>
  <button id="lb-prev" aria-label="Anterior">‹</button>
  <img id="lb-img" src="" alt="" />
  <button id="lb-next" aria-label="Próxima">›</button>
`;
document.body.appendChild(overlay);

let current = 0;
const list = [...images];

function openLightbox(index) {
  current = index;
  document.getElementById('lb-img').src = list[current].src;
  document.getElementById('lb-img').alt = list[current].alt;
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

list.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));
document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev').addEventListener('click', () => openLightbox((current - 1 + list.length) % list.length));
document.getElementById('lb-next').addEventListener('click', () => openLightbox((current + 1) % list.length));
overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!overlay.classList.contains('active')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowRight') openLightbox((current + 1) % list.length);
  if (e.key === 'ArrowLeft')  openLightbox((current - 1 + list.length) % list.length);
});
