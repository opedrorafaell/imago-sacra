/* ── LIGHTBOX ───────────────────────────────────────────
   Inicialização tardia via initLightbox() para funcionar
   com imagens inseridas dinamicamente no DOM.
──────────────────────────────────────────────────────── */

(function () {
  // Cria overlay uma única vez
  const overlay = document.createElement('div');
  overlay.id = 'lightbox-overlay';
  overlay.innerHTML = `
    <button id="lb-close" aria-label="Fechar">✕</button>
    <button id="lb-prev" aria-label="Anterior">‹</button>
    <img id="lb-img" src="" alt="" />
    <button id="lb-next" aria-label="Próxima">›</button>
  `;
  document.body.appendChild(overlay);

  let list = [];
  let current = 0;

  function openLightbox(index) {
    current = index;
    const img = document.getElementById('lb-img');
    img.src = list[current].src;
    img.alt = list[current].alt;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.getElementById('lb-close').addEventListener('click', closeLightbox);
  document.getElementById('lb-prev').addEventListener('click', () =>
    openLightbox((current - 1 + list.length) % list.length)
  );
  document.getElementById('lb-next').addEventListener('click', () =>
    openLightbox((current + 1) % list.length)
  );
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') openLightbox((current + 1) % list.length);
    if (e.key === 'ArrowLeft')  openLightbox((current - 1 + list.length) % list.length);
  });

  /* Chamada após inserir imagens no DOM (estáticas ou dinâmicas) */
  window.initLightbox = function () {
    list = [...document.querySelectorAll('.gallery-item img[data-lightbox]')];
    list.forEach((img, i) =>
      img.addEventListener('click', () => openLightbox(i))
    );
  };

  /* Auto-inicializa se as imagens já estiverem no DOM (páginas estáticas) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.querySelectorAll('.gallery-item img[data-lightbox]').length > 0) {
        window.initLightbox();
      }
    });
  } else {
    if (document.querySelectorAll('.gallery-item img[data-lightbox]').length > 0) {
      window.initLightbox();
    }
  }
})();
