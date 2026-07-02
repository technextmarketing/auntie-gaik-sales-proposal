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

// Scroll-reveal entrance animations (titles, cards, media)
(function () {
  const selector = [
    '.hero h1', '.hero .lede', '.hero-portrait',
    '.eyebrow', '.section-h', '.section-sub',
    '.pos-orders h2', '.tb-feature h2', '.plan-head', '.inv-head', '.quotation-head',
    '.app-tile', '.pos-card', '.check-item', '.intro-frame', '.why-card', '.closing-text', '.closing-sign',
    '.pos-showcase', '.tb-showcase', '.inv-showcase', '.plan-showcase', '.quotation-showcase',
    '.final-cta h2', '.final-cta p', '.final-cta .hero-ctas'
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
