document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('constellation-canvas-container');
  if (!container) return;

  const width = window.innerWidth * 2;
  const height = window.innerHeight * 3;

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  container.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error('2D context not supported');
    return;
  }

  const numStars = 2000;
  const stars = [];
  const maxDistance = 150;

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Update and draw stars
    ctx.fillStyle = 'red';
    for (let i = 0; i < numStars; i++) {
      const star = stars[i];
      star.x += star.vx;
      star.y += star.vy;

      if (star.x < 0 || star.x > width) star.vx *= -1;
      if (star.y < 0 || star.y > height) star.vy *= -1;

      ctx.beginPath();
      ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw lines
    for (let i = 0; i < numStars; i++) {
      for (let j = i + 1; j < numStars; j++) {
        const s1 = stars[i];
        const s2 = stars[j];
        const dx = s1.x - s2.x;
        const dy = s1.y - s2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          ctx.beginPath();
          ctx.moveTo(s1.x, s1.y);
          ctx.lineTo(s2.x, s2.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / maxDistance})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
});
