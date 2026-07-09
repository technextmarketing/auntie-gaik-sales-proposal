// Nav shadow on scroll
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 8);
});

// Generic carousel controller (supports multiple carousels via data-carousel key)
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const key = carousel.dataset.carousel;
  const slides = Array.from(carousel.querySelectorAll('.slide'));
  const dotsWrap = document.querySelector(`[data-dots="${key}"]`);
  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];
  let index = 0;

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle('active', n === index));
    dots.forEach((d, n) => d.classList.toggle('on', n === index));
  }

  document.querySelector(`[data-prev="${key}"]`)?.addEventListener('click', () => show(index - 1));
  document.querySelector(`[data-next="${key}"]`)?.addEventListener('click', () => show(index + 1));
  dots.forEach((d, n) => d.addEventListener('click', () => show(n)));

  if (slides.length > 1) {
    setInterval(() => show(index + 1), 5000);
  }
});

// Mobile nav hamburger
const navToggle = document.getElementById('nav-toggle');
const navLinksEl = document.querySelector('.nav-links');
if (navToggle && navLinksEl) {
  navToggle.addEventListener('click', () => {
    const open = navLinksEl.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Autoplay POS demo videos only while they're on screen (keeps them muted + looping)
const posVids = document.querySelectorAll('.pos-vid');
if (posVids.length && 'IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) {
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  posVids.forEach((v) => videoObserver.observe(v));
}

// Click a POS demo card -> floating video preview (with sound)
const videoModal = document.getElementById('video-modal');
if (videoModal) {
  const modalPlayer = document.getElementById('video-modal-player');
  const closeBtn = document.getElementById('video-modal-close');

  const openModal = (src, label) => {
    modalPlayer.src = src;
    modalPlayer.muted = false;
    if (label) modalPlayer.setAttribute('aria-label', label);
    videoModal.classList.add('open');
    videoModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalPlayer.play().catch(() => {});
  };
  const closeModal = () => {
    videoModal.classList.remove('open');
    videoModal.setAttribute('aria-hidden', 'true');
    modalPlayer.pause();
    modalPlayer.removeAttribute('src');
    modalPlayer.load();
    document.body.style.overflow = '';
  };

  document.querySelectorAll('.pos-card').forEach((card) => {
    const v = card.querySelector('.pos-vid');
    if (!v) return;
    card.addEventListener('click', () => openModal(v.getAttribute('src'), v.getAttribute('aria-label')));
  });
  closeBtn.addEventListener('click', closeModal);
  videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeModal(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('open')) closeModal();
  });
}

// Scroll-reveal entrance animations (titles, cards, media)
(function () {
  const selector = [
    '.hero h1', '.hero .lede', '.hero-portrait',
    '.eyebrow', '.section-h', '.section-sub',
    '.pos-orders h2', '.tb-feature h2', '.plan-head', '.inv-head', '.quotation-head',
    '.app-tile', '.pos-card', '.check-item', '.intro-frame', '.why-card', '.closing-text', '.closing-sign',
    '.pos-showcase', '.tb-showcase', '.inv-showcase', '.plan-showcase', '.quotation-showcase',
    '.final-cta h2', '.final-cta p', '.final-cta .hero-ctas',
    '.od-copy', '.od-media', '.xc-shot', '.img-duo', '.img-collage', '.rfq-collage',
    '.stack-shots', '.duo-arrow', '.xc-overlap', '.paperless', '.annot-wrap', '.pick-item',
    '.label-callouts', '.chip-row', '.star-grid', '.apps-row', '.od-cards', '.bank-media', '.bank-list',
    '.plus-sep', '.script-line'
  ].join(', ');
  // Exclude the Table Booking section from reveal animations
  const els = Array.from(document.querySelectorAll(selector)).filter((el) => !el.closest('.tb-feature'));
  if (!els.length) return;
  els.forEach((el) => el.classList.add('reveal'));

  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in-view'));
    return;
  }
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => revealObserver.observe(el));

  // Safety net: if anything is still hidden after load, reveal it
  window.addEventListener('load', () => {
    setTimeout(() => els.forEach((el) => el.classList.add('in-view')), 2500);
  });
})();

// Click any screenshot (or the accounting demo video) to preview it enlarged,
// with zoom in / zoom out (buttons, mouse-wheel, pinch) and drag-to-pan.
(function () {
  const box = document.createElement('div');
  box.className = 'lb-modal';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML =
    '<button class="lb-close" aria-label="Close preview">&times;</button>' +
    '<div class="lb-inner"></div>' +
    '<div class="lb-zoom"><button class="lb-out" aria-label="Zoom out">&minus;</button>' +
    '<button class="lb-reset" aria-label="Reset zoom">&#8635;</button>' +
    '<button class="lb-in" aria-label="Zoom in">+</button></div>';
  document.body.appendChild(box);
  const inner = box.querySelector('.lb-inner');

  let media = null;      // the <img> currently shown (null for video)
  let scale = 1, tx = 0, ty = 0;
  const MIN = 1, MAX = 6;

  const apply = () => {
    if (!media) return;
    media.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + scale + ')';
    inner.classList.toggle('zoomed', scale > 1.01);
  };
  const setScale = (s) => {
    scale = Math.min(MAX, Math.max(MIN, s));
    if (scale === 1) { tx = 0; ty = 0; }
    apply();
  };
  const resetZoom = () => { scale = 1; tx = 0; ty = 0; apply(); };

  const close = () => {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    inner.innerHTML = '';
    media = null; resetZoom();
    document.body.style.overflow = '';
  };
  const openImg = (src, alt) => {
    inner.innerHTML = '';
    scale = 1; tx = 0; ty = 0;
    const im = document.createElement('img');
    im.src = src; im.alt = alt || ''; im.draggable = false;
    inner.appendChild(im);
    media = im;
    box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const openVid = (src) => {
    inner.innerHTML = '';
    media = null; scale = 1; tx = 0; ty = 0;
    const v = document.createElement('video');
    v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
    inner.appendChild(v);
    box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    v.play().catch(() => {});
  };

  box.querySelector('.lb-close').addEventListener('click', close);
  box.querySelector('.lb-in').addEventListener('click', (e) => { e.stopPropagation(); setScale(scale * 1.4); });
  box.querySelector('.lb-out').addEventListener('click', (e) => { e.stopPropagation(); setScale(scale / 1.4); });
  box.querySelector('.lb-reset').addEventListener('click', (e) => { e.stopPropagation(); resetZoom(); });
  box.addEventListener('click', (e) => { if (e.target === box || e.target === inner) close(); });
  document.addEventListener('keydown', (e) => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === '+' || e.key === '=') setScale(scale * 1.4);
    else if (e.key === '-') setScale(scale / 1.4);
    else if (e.key === '0') resetZoom();
  });

  // mouse-wheel zoom
  box.addEventListener('wheel', (e) => {
    if (!media || !box.classList.contains('open')) return;
    e.preventDefault();
    setScale(scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
  }, { passive: false });

  // double-click / double-tap toggle
  inner.addEventListener('dblclick', (e) => { if (media) { e.preventDefault(); setScale(scale > 1.01 ? 1 : 2.5); } });

  // pointer drag-to-pan + two-finger pinch zoom
  const pointers = new Map();
  let panStart = null, pinchDist = 0, pinchScale = 1;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  inner.addEventListener('pointerdown', (e) => {
    if (!media) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1 && scale > 1.01) panStart = { x: e.clientX - tx, y: e.clientY - ty };
    else if (pointers.size === 2) {
      const p = [...pointers.values()]; pinchDist = dist(p[0], p[1]); pinchScale = scale; panStart = null;
    }
    try { inner.setPointerCapture(e.pointerId); } catch (_) {}
  });
  inner.addEventListener('pointermove', (e) => {
    if (!media || !pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = [...pointers.values()];
    if (p.length === 2 && pinchDist) { setScale(pinchScale * (dist(p[0], p[1]) / pinchDist)); }
    else if (p.length === 1 && scale > 1.01 && panStart) {
      tx = e.clientX - panStart.x; ty = e.clientY - panStart.y; apply();
    }
  });
  const endPointer = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchDist = 0; if (pointers.size === 0) panStart = null; };
  inner.addEventListener('pointerup', endPointer);
  inner.addEventListener('pointercancel', endPointer);

  // wire every screenshot to the preview (all images, cutouts included)
  const imgSel = [
    '.xc-img', '.od-media img', '.pos-showcase img', '.tb-showcase img',
    '.rfq-collage img', '.stack-shots img', '.duo-arrow img', '.annot-img',
    '.paperless img', '.pick-card img', '.od-card img', '.hero-side .side',
    '.intro-frame img', '.xc-overlap img'
  ].join(', ');
  document.querySelectorAll(imgSel).forEach((im) => {
    im.classList.add('zoomable');
    im.addEventListener('click', () => openImg(im.currentSrc || im.src, im.alt));
  });
  document.querySelectorAll('.lb-video').forEach((v) => {
    v.style.cursor = 'zoom-in';
    v.addEventListener('click', () => openVid(v.getAttribute('src')));
  });
})();
