document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('background-fills');
  if (!container) return;

  const cellSize = 150;
  const width = window.innerWidth;
  const height = window.innerHeight * 3;

  const cellsX = Math.ceil(width / (cellSize * 2));
  const cellsY = Math.ceil((height / cellSize) * 2);

  container.innerHTML = '';
  const numChanges = 50;
  const probability = 0.3;
  const speed = 5;
  let pass = 1;

  // The grid spans only the top of the page; stop churning cells once the
  // visitor has scrolled past it
  let gridOnScreen = true;
  if ('IntersectionObserver' in window) {
    const host = document.getElementById('box-background');
    if (host) {
      new IntersectionObserver((entries) => {
        gridOnScreen = entries.some((e) => e.isIntersecting);
      }).observe(host);
    }
  }

  function changeState() {
    if (!gridOnScreen) return;
    if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    pass = pass * -1;
    // Fade out some boxes

    if (pass < 0) {
      for (let i = 0; i < Math.min(activeBoxes.length, numChanges); i++) {
        const index = Math.floor(Math.random() * activeBoxes.length);
        const box = activeBoxes[index];
        if (box) {
          box.style.opacity = '0';
          setTimeout(() => box.remove(), 10000 / speed);
          activeBoxes.splice(index, 1);
        }
      }
    } else {
      for (let i = 0; i < numChanges; i++) {
        const x = Math.floor(Math.random() * (cellsX * 2 + 2)) - cellsX;
        const y = Math.floor(Math.random() * (cellsY * 2 + 2)) - cellsY;
        activeBoxes.push(createBox(x, y));
      }
    }
  }

  function createBox(x, y) {
    const posX = x * cellSize * 3;
    const posY = y * cellSize;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${posX} ${posY}h${cellSize * 3}v${cellSize}h-${cellSize * 3}Z`);
    path.setAttribute('stroke', '#e5e7eb');
    path.setAttribute('fill', '#d1d5dc');
    path.setAttribute('stroke-width', '1');
    path.style.opacity = '0';
    path.style.transition = `opacity ${10 / speed}s ease-in-out`;

    setTimeout(() => (path.style.opacity = '1'), 10 / speed);

    container.appendChild(path);

    // Force reflow to trigger transition
    path.getBoundingClientRect();

    return path;
  }

  const activeBoxes = [];

  // Initial population
  for (let x = -cellsX; x < cellsX + 2; x++) {
    for (let y = -cellsY; y < cellsY + 2; y++) {
      if (Math.random() < probability) {
        activeBoxes.push(createBox(x, y));
      }

      const posX = x * cellSize * 3;
      const posY = y * cellSize;
      const gridPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      gridPath.setAttribute(
        'd',
        `M${posX} ${posY + cellSize} V${posY} M${posX} ${posY} H${posX + cellSize * 3}`
      );
      gridPath.setAttribute('fill', 'none');
      gridPath.setAttribute('stroke', '#E5E7EB');
      gridPath.setAttribute('stroke-width', '1');
      container.appendChild(gridPath);
    }
  }

  // // Dynamic update
  changeState();
  setInterval(changeState, 5000 / speed);
});

// Stretch the diagonal grid background (and the planetary background and atom
// canvas overlay, which share its footprint) so they end together with the
// #ai section
document.addEventListener('DOMContentLoaded', () => {
  const aiSection = document.getElementById('ai');
  const layers = [
    document.getElementById('box-background'),
    document.getElementById('planetary-background'),
    document.getElementById('constellation-canvas-container'),
  ].filter(Boolean);
  if (!aiSection || !layers.length) return;

  // Mobile browsers fire `resize` continuously while scrolling (URL bar
  // show/hide), and getBoundingClientRect() wobbles by subpixel fractions
  // with scroll position. Writing those raw values resized the constellation
  // canvas on every event -- and resizing a canvas clears it, which flickered
  // on phones. Round the target and skip writes that change nothing.
  function sizePlanetaryBackground() {
    const aiBottom = aiSection.getBoundingClientRect().bottom + window.scrollY;
    for (const layer of layers) {
      const top = layer.getBoundingClientRect().top + window.scrollY;
      const next = Math.max(Math.round(aiBottom - top), 0);
      const current = parseInt(layer.style.height, 10);
      if (!Number.isNaN(current) && Math.abs(next - current) <= 1) continue;
      layer.style.height = `${next}px`;
    }
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(sizePlanetaryBackground, 150);
  });

  sizePlanetaryBackground();
  // Section positions can shift as images/fonts finish loading, unlike the
  // old viewport-only anchor, so re-measure once everything has loaded
  window.addEventListener('load', sizePlanetaryBackground);
});
