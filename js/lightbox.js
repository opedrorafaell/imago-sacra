/* ── LIGHTBOX ─────────────────────────────────────────
   Usage: add data-lightbox="group-name" and data-caption="..."
   (optional) to any <img> inside a .gallery-item.
   ─────────────────────────────────────────────────── */

(function initLightbox() {
  'use strict';

  // Build overlay DOM
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Lightbox');

  overlay.innerHTML = `
    <button class="lb-close" id="lbClose" aria-label="Fechar">&times;</button>
    <button class="lb-btn lb-prev" id="lbPrev" aria-label="Anterior">&#8249;</button>
    <div class="lb-img-wrap">
      <img class="lb-img" id="lbImg" src="" alt="" />
    </div>
    <button class="lb-btn lb-next" id="lbNext" aria-label="Próximo">&#8250;</button>
    <div class="lb-caption" id="lbCaption"></div>
    <div class="lb-counter" id="lbCounter"></div>
  `;
  document.body.appendChild(overlay);

  const lbImg     = document.getElementById('lbImg');
  const lbCaption = document.getElementById('lbCaption');
  const lbCounter = document.getElementById('lbCounter');
  const lbClose   = document.getElementById('lbClose');
  const lbPrev    = document.getElementById('lbPrev');
  const lbNext    = document.getElementById('lbNext');

  let items = [];   // all images in the current group
  let cur   = 0;

  /* Collect all gallery images */
  function buildGroup(group) {
    const selector = group
      ? `img[data-lightbox="${group}"]`
      : 'img[data-lightbox]';
    return Array.from(document.querySelectorAll(selector));
  }

  /* Open lightbox at index n within the given group */
  function open(group, index) {
    items = buildGroup(group);
    if (!items.length) return;
    cur = index;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    show(cur);
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function show(n) {
    cur = ((n % items.length) + items.length) % items.length;
    const img = items[cur];
    lbImg.classList.add('loading');
    const newSrc = img.src;
    const tmp = new Image();
    tmp.onload = () => {
      lbImg.src = newSrc;
      lbImg.alt = img.alt || '';
      lbImg.classList.remove('loading');
    };
    tmp.onerror = () => {
      lbImg.src = newSrc;
      lbImg.classList.remove('loading');
    };
    tmp.src = newSrc;
    lbCaption.textContent = img.getAttribute('data-caption') || img.alt || '';
    lbCounter.textContent = (cur + 1) + ' / ' + items.length;
    // Hide arrows when only one image
    lbPrev.style.display = items.length > 1 ? '' : 'none';
    lbNext.style.display = items.length > 1 ? '' : 'none';
  }

  /* Attach click listeners to all gallery items */
  function attachListeners() {
    document.querySelectorAll('.gallery-item').forEach(figure => {
      const img = figure.querySelector('img[data-lightbox]');
      if (!img) return;
      figure.addEventListener('click', () => {
        const group = img.getAttribute('data-lightbox');
        const all   = buildGroup(group);
        const index = all.indexOf(img);
        open(group, index >= 0 ? index : 0);
      });
    });
  }

  /* Controls */
  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); show(cur - 1); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); show(cur + 1); });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowRight')  show(cur + 1);
    if (e.key === 'ArrowLeft')   show(cur - 1);
  });

  /* Touch/swipe support */
  let touchX = 0;
  overlay.addEventListener('touchstart', (e) => {
    touchX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', (e) => {
    const d = touchX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 44) show(d > 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  /* Init */
  attachListeners();
})();
