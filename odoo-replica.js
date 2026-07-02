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
