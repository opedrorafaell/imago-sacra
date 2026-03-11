/* ── TEMA ──────────────────────────────────────────── */
(function () {
  const root  = document.documentElement;
  const pDark = window.matchMedia('(prefers-color-scheme:dark)').matches;
  let dark = localStorage.getItem('theme')
    ? localStorage.getItem('theme') === 'dark'
    : pDark;

  function applyTheme(d) {
    root.setAttribute('data-theme', d ? 'dark' : 'light');
  }

  applyTheme(dark);

  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.onclick = () => {
      dark = !dark;
      applyTheme(dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    };
  }
})();

/* ── NAV SCROLL ────────────────────────────────────── */
(function () {
  const navBar = document.getElementById('navBar');
  if (!navBar) return;
  window.addEventListener('scroll', () => {
    const past = window.scrollY > 20;
    navBar.classList.toggle('scrolled', past);
  }, { passive: true });
  // trigger once on load
  if (window.scrollY > 20) navBar.classList.add('scrolled');
  else navBar.classList.add('scrolled'); // gallery pages always show bg
})();

/* ── DRAWER ─────────────────────────────────────────── */
(function () {
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('overlay');
  const hbEl    = document.getElementById('hb');
  if (!drawer || !overlay || !hbEl) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hbEl.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hbEl.classList.remove('open');
    document.body.style.overflow = '';
  }

  hbEl.addEventListener('click', () =>
    drawer.classList.contains('open') ? closeDrawer() : openDrawer()
  );
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeDrawer();
  });

  // expose for inline onclick attributes in drawer HTML
  window.closeDrawer = closeDrawer;
})();

/* ── SCROLL REVEAL ──────────────────────────────────── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('on'), i * 70);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.reveal,.rev-l,.rev-r').forEach(el => io.observe(el));
})();

/* ── LIGHTBOX ────────────────────────────────────────── */
(function () {
  const overlay  = document.querySelector('.lb-overlay');
  const lbImg    = document.querySelector('.lb-img');
  const lbClose  = document.querySelector('.lb-close');
  const lbPrev   = document.querySelector('.lb-prev');
  const lbNext   = document.querySelector('.lb-next');
  const lbCaption = document.querySelector('.lb-caption');
  const lbCounter = document.querySelector('.lb-counter');

  if (!overlay || !lbImg) return;

  // Gather all gallery items
  const items = Array.from(document.querySelectorAll('.gallery-item[data-lightbox]'));
  let current = 0;

  function open(index) {
    current = index;
    showImage(current);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function showImage(index) {
    const item = items[index];
    const img  = item.querySelector('img');
    const cap  = item.querySelector('figcaption');

    lbImg.classList.add('loading');
    lbImg.onload = () => lbImg.classList.remove('loading');
    lbImg.src  = img.src;
    lbImg.alt  = img.alt;

    if (lbCaption) lbCaption.textContent = cap ? cap.textContent : img.alt;
    if (lbCounter) lbCounter.textContent = `${index + 1} / ${items.length}`;
  }

  function prev() {
    current = (current - 1 + items.length) % items.length;
    showImage(current);
  }

  function next() {
    current = (current + 1) % items.length;
    showImage(current);
  }

  // Bind gallery items
  items.forEach((item, i) => {
    item.addEventListener('click', () => open(i));
  });

  // Controls
  if (lbClose) lbClose.addEventListener('click', close);
  if (lbPrev)  lbPrev.addEventListener('click', prev);
  if (lbNext)  lbNext.addEventListener('click', next);

  // Close on background click
  overlay.addEventListener('click', e => {
    if (e.target === overlay) close();
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape')      close();
    if (e.key === 'ArrowLeft')   prev();
    if (e.key === 'ArrowRight')  next();
  });

  // Touch swipe
  let touchStartX = 0;
  overlay.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  overlay.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) delta > 0 ? next() : prev();
  }, { passive: true });
})();
