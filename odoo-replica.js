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

// Click any screenshot (or the accounting demo video) to preview it enlarged
(function () {
  const box = document.createElement('div');
  box.className = 'lb-modal';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<button class="lb-close" aria-label="Close preview">&times;</button><div class="lb-inner"></div>';
  document.body.appendChild(box);
  const inner = box.querySelector('.lb-inner');

  const close = () => {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    inner.innerHTML = '';
    document.body.style.overflow = '';
  };
  const openImg = (src, alt) => {
    inner.innerHTML = '';
    const im = document.createElement('img');
    im.src = src; im.alt = alt || '';
    inner.appendChild(im);
    box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const openVid = (src) => {
    inner.innerHTML = '';
    const v = document.createElement('video');
    v.src = src; v.controls = true; v.autoplay = true; v.playsInline = true;
    inner.appendChild(v);
    box.classList.add('open'); box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    v.play().catch(() => {});
  };

  box.querySelector('.lb-close').addEventListener('click', close);
  box.addEventListener('click', (e) => { if (e.target === box) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.classList.contains('open')) close(); });

  const imgSel = [
    '.xc-img', '.od-media img', '.pos-showcase img', '.tb-showcase img',
    '.rfq-collage img', '.stack-shots img', '.duo-arrow img', '.annot-img',
    '.paperless img', '.pick-card img', '.od-card img', '.hero-side .side',
    '.intro-frame img', '.xc-overlap img'
  ].join(', ');
  document.querySelectorAll(imgSel).forEach((im) => {
    if (im.classList.contains('no-fx')) return;
    im.classList.add('zoomable');
    im.addEventListener('click', () => openImg(im.currentSrc || im.src, im.alt));
  });
  // videos flagged for the lightbox (accounting demo)
  document.querySelectorAll('.lb-video').forEach((v) => {
    v.style.cursor = 'zoom-in';
    v.addEventListener('click', () => openVid(v.getAttribute('src')));
  });
})();
