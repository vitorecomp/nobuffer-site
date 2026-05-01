document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('constellation-canvas-container');
  if (!container) return;

  const width = window.innerWidth * 2;
  const height = window.innerHeight * 3;

  const numStars = 2000;
  const maxDistance = 150;

  try {
    // Try WebGL (Three.js)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(numStars * 3);
    const velocities = [];

    for (let i = 0; i < numStars * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * width;
      positions[i + 1] = (Math.random() - 0.5) * height;
      positions[i + 2] = (Math.random() - 0.5) * 500;

      velocities.push({
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xff0000, // Red
      size: 2,
      transparent: true,
      opacity: 0.8,
    });

    const starSystem = new THREE.Points(geometry, material);
    scene.add(starSystem);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000, // Red
      transparent: true,
      opacity: 0.2,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSystem);

    const maxLines = 5000; // Limit lines to avoid JS bottleneck

    function animateWebGL() {
      const posArr = starSystem.geometry.attributes.position.array;

      for (let i = 0; i < numStars; i++) {
        const idx = i * 3;
        posArr[idx] += velocities[i].x;
        posArr[idx + 1] += velocities[i].y;
        posArr[idx + 2] += velocities[i].z;

        if (Math.abs(posArr[idx]) > width / 2) velocities[i].x *= -1;
        if (Math.abs(posArr[idx + 1]) > height / 2) velocities[i].y *= -1;
        if (Math.abs(posArr[idx + 2]) > 250) velocities[i].z *= -1;
      }

      starSystem.geometry.attributes.position.needsUpdate = true;

      const linePositions = [];
      let lineCount = 0;

      for (let i = 0; i < numStars; i++) {
        for (let j = i + 1; j < numStars; j++) {
          const idx1 = i * 3;
          const idx2 = j * 3;
          const dx = posArr[idx1] - posArr[idx2];
          const dy = posArr[idx1 + 1] - posArr[idx2 + 1];
          const dz = posArr[idx1 + 2] - posArr[idx2 + 2];
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < maxDistance && lineCount < maxLines) {
            linePositions.push(posArr[idx1], posArr[idx1 + 1], posArr[idx1 + 2]);
            linePositions.push(posArr[idx2], posArr[idx2 + 1], posArr[idx2 + 2]);
            lineCount++;
          }
        }
      }

      lineGeometry.setAttribute(
        'position',
        new THREE.BufferAttribute(new Float32Array(linePositions), 3)
      );

      renderer.render(scene, camera);
      requestAnimationFrame(animateWebGL);
    }

    animateWebGL();
  } catch (e) {
    console.warn('WebGL failed, falling back to 2D Canvas:', e);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasStarsCount = 200;
    const stars = [];

    for (let i = 0; i < canvasStarsCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'red'; // Red
      for (let i = 0; i < canvasStarsCount; i++) {
        const star = stars[i];
        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0 || star.x > width) star.vx *= -1;
        if (star.y < 0 || star.y > height) star.vy *= -1;

        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < canvasStarsCount; i++) {
        for (let j = i + 1; j < canvasStarsCount; j++) {
          const s1 = stars[i];
          const s2 = stars[j];
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.strokeStyle = `rgba(255, 0, 0, ${1 - dist / maxDistance})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(animateCanvas);
    }

    animateCanvas();
  }
});
