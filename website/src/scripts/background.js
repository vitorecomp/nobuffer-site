document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('background-fills');
  if (!container) return;

  const cellSize = 150;
  const width = window.innerWidth;
  const height = window.innerHeight * 3;

  const cellsX = Math.ceil(width / (cellSize * 3));
  const cellsY = Math.ceil(height / cellSize);

  container.innerHTML = '';
  const numChanges = 300;
  const probability = 0.5;

  function changeState() {
    () => {
      pass = pass * -1;
      // Fade out some boxes

      if (pass < 0) {
        for (let i = 0; i < Math.min(activeBoxes.length, numChanges); i++) {
          const index = Math.floor(Math.random() * activeBoxes.length);
          const box = activeBoxes[index];
          if (box) {
            box.style.opacity = '0';
            setTimeout(() => box.remove(), 15000); // Wait for 2s transition
            activeBoxes.splice(index, 1);
          }
        }
      } else {
        for (let i = 0; i < numChanges; i++) {
          const x = Math.floor(Math.random() * (endX - startX)) + startX;
          const y = Math.floor(Math.random() * (endY - startY)) + startY;
          activeBoxes.push(createBox(x, y));
        }
      }
    };
  }

  function createBox(x, y) {
    const posX = x * cellSize * 3;
    const posY = y * cellSize;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M${posX} ${posY}h${cellSize * 3}v${cellSize}h-${cellSize * 3}Z`);
    path.setAttribute('stroke-width', '0');
    path.style.opacity = '1';
    path.style.transition = 'opacity 15s ease-in-out';

    container.appendChild(path);

    // Force reflow to trigger transition
    path.getBoundingClientRect();

    return path;
  }

  const activeBoxes = [];
  let pass = 1;

  // Initial population
  for (let x = -cellsX; x < cellsX + 2; x++) {
    for (let y = -cellsY; y < cellsY + 2; y++) {
      const posX = x * cellSize * 3;
      const posY = y * cellSize;

      console.log('blocks', +(Math.abs(x) + Math.abs(y)));
      if (Math.random() < probability) {
        activeBoxes.push(createBox(x, y));
      }

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
  // changeState();
  // setInterval(changeState, 30000);
});
