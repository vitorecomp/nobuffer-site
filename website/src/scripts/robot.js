const svgNS = 'http://www.w3.org/2000/svg';
const universe = document.getElementById('universe');
const sunNode = document.getElementById('sun');
const asteroidsGroup = document.getElementById('asteroids');
const linesGroup = document.getElementById('lines');

let width, height, centerX, centerY;
const asteroids = [];
const maxAsteroids = 20;
const tailLength = 50; // Number of frames to remember for the trail

// Physics Constants
const G = 1000;
const mouseG = 10000;
const friction = 0.995;
const connectionDistance = 150;
const maxSpeed = 10;
const baseSpeed = 2;
const minDis = 100;

let mouse = { x: -1000, y: -1000, active: false };

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  centerX = width / 2;
  centerY = height / 2;
  sunNode.setAttribute('cx', centerX);
  sunNode.setAttribute('cy', centerY);
}
window.addEventListener('resize', resize);
resize();

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
window.addEventListener('mouseout', () => (mouse.active = false));

window.addEventListener('click', () => {
  asteroids.forEach((a) => {
    let mdx = mouse.x - a.x;
    let mdy = mouse.y - a.y;
    let mDistSq = mdx * mdx + mdy * mdy;
    let mDist = Math.sqrt(mDistSq);

    let mForce = (mouseG / mDistSq) * 10;
    a.vx += (mdx / mDist) * mForce;
    a.vy += (mdy / mDist) * mForce;
  });
});

function spawnAsteroid() {
  if (asteroids.length >= maxAsteroids) {
    return;
    const oldA = asteroids.shift();
    asteroidsGroup.removeChild(oldA.element);
  }

  const angle = Math.random() * Math.PI * 2;
  const distance = Math.min(width, height) / 2 - 200 + (Math.random() - 0.5) * 200;

  const x = centerX + Math.cos(angle) * distance;
  const y = centerY + Math.sin(angle) * distance;

  const vx = -Math.sin(angle) * baseSpeed + (Math.random() - 0.5);
  const vy = Math.cos(angle) * baseSpeed + (Math.random() - 0.5);

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('r', '2');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', 'rgba(255,255,255,0.8)');
  circle.setAttribute('stroke-width', '1');
  asteroidsGroup.appendChild(circle);

  // Added 'history' array here to track previous positions
  asteroids.push({ x, y, vx, vy, element: circle, history: [] });
}

setInterval(spawnAsteroid, 100);

function animate() {
  linesGroup.innerHTML = '';
  let linesHTML = '';

  asteroids.forEach((a, index) => {
    let dx = centerX - a.x;
    let dy = centerY - a.y;
    let distSq = dx * dx + dy * dy;
    let dist = Math.sqrt(distSq);

    if (dist < minDis) dist = minDis;

    let force = G / (dist * dist);
    a.vx += (dx / dist) * force;
    a.vy += (dy / dist) * force;

    // if (mouse.active) {
    //     let mdx = mouse.x - a.x;
    //     let mdy = mouse.y - a.y;
    //     let mDistSq = mdx * mdx + mdy * mdy;
    //     let mDist = Math.sqrt(mDistSq);

    //     if (mDist < 300) {
    //         if (mDist < minDis) mDist = minDis;
    //         let mForce = mouseG / mDistSq;
    //         a.vx += (mdx / mDist) * mForce;
    //         a.vy += (mdy / mDist) * mForce;
    //     }
    // }

    if (dist > minDis * 2) {
      a.vx *= friction;
      a.vy *= friction;
    }
    if (Math.abs(a.vx) > maxSpeed) a.vx = Math.sign(a.vx) * maxSpeed;
    if (Math.abs(a.vy) > maxSpeed) a.vy = Math.sign(a.vy) * maxSpeed;

    a.x += a.vx;
    a.y += a.vy;

    // --- TRAIL LOGIC ADDED HERE ---
    a.history.push({ x: a.x, y: a.y });
    if (a.history.length > tailLength) {
      a.history.shift(); // Remove oldest position to keep trail short
    }

    // Draw the fading trail
    for (let i = 0; i < a.history.length - 1; i++) {
      let pt1 = a.history[i];
      let pt2 = a.history[i + 1];
      // Calculate opacity: oldest point (i=0) is nearly transparent, newest is solid
      let tailOpacity = (i / a.history.length) * 0.7;
      linesHTML += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="rgba(255,255,255,${tailOpacity})" stroke-width="1.5"/>`;
    }
    // ------------------------------

    a.element.setAttribute('cx', a.x);
    a.element.setAttribute('cy', a.y);

    if (dist < connectionDistance + 50) {
      const opacity = 1 - dist / (connectionDistance + 50);
      linesHTML += `<line x1="${a.x}" y1="${a.y}" x2="${centerX}" y2="${centerY}" stroke="rgba(255,255,255,${opacity * 0.3})" stroke-width="0.5"/>`;
    }

    for (let j = index + 1; j < asteroids.length; j++) {
      let a2 = asteroids[j];
      let adx = a2.x - a.x;
      let ady = a2.y - a.y;
      let aDist = Math.sqrt(adx * adx + ady * ady);

      if (aDist < connectionDistance) {
        const opacity = 1 - aDist / connectionDistance;
        linesHTML += `<line x1="${a.x}" y1="${a.y}" x2="${a2.x}" y2="${a2.y}" stroke="rgba(255,255,255,${opacity * 0.4})" stroke-width="0.5"/>`;
      }
    }
  });

  linesGroup.innerHTML = linesHTML;
  requestAnimationFrame(animate);
}

animate();
