// Portfolio cards carousel: drives the 60% left-column project slider in
// views/portfolio/portfolio.pug with prev/next buttons, pagination dots,
// keyboard arrow navigation, and touch swipe gestures.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('portfolio-carousel');
  if (!root) return;

  const slides = Array.from(root.querySelectorAll('[data-portfolio-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-portfolio-dot]'));
  const prevButtons = Array.from(root.querySelectorAll('[data-portfolio-prev]'));
  const nextButtons = Array.from(root.querySelectorAll('[data-portfolio-next]'));
  const counterEl = document.getElementById('portfolio-slide-counter');
  const domainEl = document.getElementById('portfolio-slide-domain');

  if (slides.length === 0) return;

  let currentIndex = 0;
  const total = slides.length;

  const render = (index) => {
    slides.forEach((slide, i) => {
      const isActive = i === index;
      slide.classList.toggle('hidden', !isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });

    dots.forEach((dot, i) => {
      const isActive = i === index;
      const indicator = dot.querySelector('[data-dot-pill]');
      if (isActive) {
        dot.setAttribute('aria-current', 'true');
        if (indicator) {
          indicator.classList.remove('w-2.5', 'bg-gray-600', 'group-hover:bg-gray-400');
          indicator.classList.add('w-7', 'bg-teal-400');
        }
      } else {
        dot.removeAttribute('aria-current');
        if (indicator) {
          indicator.classList.remove('w-7', 'bg-teal-400');
          indicator.classList.add('w-2.5', 'bg-gray-600', 'group-hover:bg-gray-400');
        }
      }
    });

    if (counterEl) {
      const currentStr = String(index + 1).padStart(2, '0');
      const totalStr = String(total).padStart(2, '0');
      counterEl.textContent = `[${currentStr} / ${totalStr}]`;
    }

    if (domainEl) {
      const activeDomain = slides[index].getAttribute('data-slide-domain');
      if (activeDomain) {
        domainEl.textContent = activeDomain;
      }
    }
  };

  const goTo = (index) => {
    currentIndex = ((index % total) + total) % total;
    render(currentIndex);
  };

  const step = (delta) => {
    goTo(currentIndex + delta);
  };

  prevButtons.forEach((btn) => {
    btn.addEventListener('click', () => step(-1));
  });

  nextButtons.forEach((btn) => {
    btn.addEventListener('click', () => step(1));
  });

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => goTo(index));
  });

  // Keyboard navigation while the portfolio carousel is visible on screen
  let isVisible = false;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        isVisible = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.25 }
    ).observe(root);
  }

  document.addEventListener('keydown', (event) => {
    if (!isVisible) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowRight') {
      step(1);
    } else if (event.key === 'ArrowLeft') {
      step(-1);
    }
  });

  // Horizontal touch swipe support
  let touchStartX = 0;
  let touchStartY = 0;
  root.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
      touchStartY = event.changedTouches[0].clientY;
    },
    { passive: true }
  );
  root.addEventListener(
    'touchend',
    (event) => {
      const dx = event.changedTouches[0].clientX - touchStartX;
      const dy = event.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      step(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );

  render(0);
});
