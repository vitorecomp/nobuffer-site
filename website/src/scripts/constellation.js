// 3D cube "atom" (Three.js): a spinning cube inside a hexagon-tiled
// force-field sphere, orbited by electrons with glowing trails. Rests in the
// left corner of the planetary section and follows the mouse over it.
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('constellation-canvas-container');
  const section = document.getElementById('planettary-background');
  if (!container || !section || typeof THREE === 'undefined') return;

  let width = container.clientWidth || window.innerWidth;
  let height = container.clientHeight || window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(width, height);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  container.appendChild(renderer.domElement);

  // 1 world unit ≈ 1 CSS pixel on the z=0 plane
  function fitCamera() {
    camera.aspect = width / height;
    camera.position.z = height / 2 / Math.tan((camera.fov * Math.PI) / 360);
    camera.updateProjectionMatrix();
  }
  fitCamera();

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.7);
  keyLight.position.set(-1, 1, 2);
  scene.add(keyLight);

  // --- Config ----------------------------------------------------------------
  const ELECTRON_COUNT = 9; // how many electrons orbit the cube
  const ATOM_SCALE = 0.5; // overall size multiplier for the cube, field and orbits

  const atom = new THREE.Group();
  atom.scale.setScalar(ATOM_SCALE);
  scene.add(atom);

  // --- Cube core -----------------------------------------------------------
  const cube = new THREE.Mesh(
    new THREE.BoxGeometry(36, 36, 36),
    new THREE.MeshLambertMaterial({ color: 0x0d9488 })
  );
  cube.add(
    new THREE.LineSegments(
      new THREE.EdgesGeometry(cube.geometry),
      new THREE.LineBasicMaterial({ color: 0x9ca3af })
    )
  );
  atom.add(cube);

  // --- Hexagon force-field sphere -------------------------------------------
  // Goldberg polyhedron: the dual of a subdivided icosahedron. Every vertex
  // becomes a tile whose corners are the centroids of the faces around it, so
  // neighboring tiles share edges exactly — a seamless interlocking honeycomb
  // covering the whole sphere (12 of the tiles are pentagons, by geometry).
  const FIELD_R = 40;

  const ico = new THREE.IcosahedronGeometry(FIELD_R, 2);
  const posAttr = ico.attributes.position;

  const vertices = [];
  const vertexIndexByKey = new Map();
  const faceCentroids = [];
  const facesByVertex = [];

  const faceCount = posAttr.count / 3;
  for (let f = 0; f < faceCount; f++) {
    const centroid = new THREE.Vector3();
    for (let j = 0; j < 3; j++) {
      const v = new THREE.Vector3().fromBufferAttribute(posAttr, f * 3 + j);
      centroid.addScaledVector(v, 1 / 3);
      const key = `${v.x.toFixed(2)},${v.y.toFixed(2)},${v.z.toFixed(2)}`;
      let idx = vertexIndexByKey.get(key);
      if (idx === undefined) {
        idx = vertices.length;
        vertexIndexByKey.set(key, idx);
        vertices.push(v);
        facesByVertex.push([]);
      }
      facesByVertex[idx].push(f);
    }
    // Project face centroids onto the sphere: these are the tile corners
    faceCentroids.push(centroid.normalize().multiplyScalar(FIELD_R));
  }

  const linePts = [];
  const fillPts = [];
  const lineShades = [];
  const fillShades = [];
  const up = new THREE.Vector3(0, 1, 0);
  const alt = new THREE.Vector3(1, 0, 0);

  vertices.forEach((vertex, vi) => {
    // Per-tile variation: each tile gets its own translucency
    const shade = 0.45 + Math.random() * 0.55;
    const n = vertex.clone().normalize();
    const t1 = new THREE.Vector3()
      .crossVectors(n, Math.abs(n.y) > 0.9 ? alt : up)
      .normalize();
    const t2 = new THREE.Vector3().crossVectors(n, t1).normalize();

    // Tile corners: the surrounding face centroids, ordered around the vertex
    const corners = facesByVertex[vi]
      .map((f) => {
        const point = faceCentroids[f];
        const rel = point.clone().sub(vertex);
        return { point, angle: Math.atan2(rel.dot(t2), rel.dot(t1)) };
      })
      .sort((a, b) => a.angle - b.angle);

    const tileCenter = n.clone().multiplyScalar(FIELD_R);
    const m = corners.length; // 6, or 5 at the twelve pentagon spots
    for (let k = 0; k < m; k++) {
      const p1 = corners[k].point;
      const p2 = corners[(k + 1) % m].point;
      linePts.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      fillPts.push(tileCenter.x, tileCenter.y, tileCenter.z, p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
      for (let v = 0; v < 2; v++) lineShades.push(shade, shade, shade);
      for (let v = 0; v < 3; v++) fillShades.push(shade, shade, shade);
    }
  });

  const field = new THREE.Group();
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3));
  lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineShades, 3));
  field.add(
    new THREE.LineSegments(
      lineGeo,
      new THREE.LineBasicMaterial({
        color: 0x5eead4,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
  );
  const fillGeo = new THREE.BufferGeometry();
  fillGeo.setAttribute('position', new THREE.Float32BufferAttribute(fillPts, 3));
  fillGeo.setAttribute('color', new THREE.Float32BufferAttribute(fillShades, 3));
  field.add(
    new THREE.Mesh(
      fillGeo,
      new THREE.MeshBasicMaterial({
        color: 0x0d9488,
        vertexColors: true,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    )
  );
  atom.add(field);

  // --- Electrons with trails -------------------------------------------------
  const TRAIL_N = 60;
  const dotGeo = new THREE.SphereGeometry(4, 12, 12);
  const electronColor = new THREE.Color(0x5eead4);

  const electrons = Array.from({ length: ELECTRON_COUNT }, (_, i) => {
    // Orbital planes spread evenly, with a little randomness so no two
    // electrons ever share the exact same path or rhythm
    return {
      rx: 115 + Math.random() * 40,
      rz: 115 + Math.random() * 40,
      euler: new THREE.Euler(
        (i / ELECTRON_COUNT) * Math.PI + (Math.random() - 0.5) * 0.4,
        Math.random() * Math.PI,
        (Math.random() - 0.5) * 0.6
      ),
      speed: 0.024 + Math.random() * 0.018,
      angle: (i * Math.PI * 2) / ELECTRON_COUNT,
    };
  }).map((cfg) => {
    const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: electronColor }));
    atom.add(dot);

    const positions = new Float32Array(TRAIL_N * 3);
    const colors = new Float32Array(TRAIL_N * 3);
    for (let i = 0; i < TRAIL_N; i++) {
      const fade = 1 - i / (TRAIL_N - 1); // head bright, tail black (additive = invisible)
      colors[i * 3] = electronColor.r * fade;
      colors[i * 3 + 1] = electronColor.g * fade;
      colors[i * 3 + 2] = electronColor.b * fade;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    trailGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const trail = new THREE.Line(
      trailGeo,
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    atom.add(trail);

    return { ...cfg, dot, trail, pts: [] };
  });

  // --- Mouse follow ------------------------------------------------------------
  // The canvas and the page elements are positioned independently, so never
  // assume their rects coincide: the resting spot hugs the left edge of the
  // open-source intro text (#open-source-title), vertically centered on it,
  // then converts into canvas space. Falls back to the planetary section's
  // top-left corner if the anchor is missing.
  const home = new THREE.Vector2();
  function updateHome() {
    const cRect = container.getBoundingClientRect();
    const anchor = document.getElementById('open-source-title');
    let px;
    let py;
    if (anchor) {
      const aRect = anchor.getBoundingClientRect();
      px = aRect.left - cRect.left - 140; // orbit clearance left of the text
      // sit beside the "Some of my contributions..." heading, just above
      // the intro paragraph the anchor marks
      py = aRect.top - cRect.top - 40;
    } else {
      const sRect = section.getBoundingClientRect();
      px = sRect.left - cRect.left + Math.max(150, sRect.width * 0.12);
      py = sRect.top - cRect.top + Math.max(240, sRect.height * 0.08);
    }
    home.set(px - width / 2, height / 2 - py);
  }
  updateHome();

  const pos = home.clone();
  const target = home.clone();
  let mouseInside = false;

  // The atom only chases the mouse inside the open-source section; anywhere
  // else it drifts back to its rest point beside the heading
  const followArea = document.getElementById('open-source') || section;

  window.addEventListener('mousemove', (event) => {
    const sRect = followArea.getBoundingClientRect();
    mouseInside =
      event.clientX >= sRect.left &&
      event.clientX <= sRect.right &&
      event.clientY >= sRect.top &&
      event.clientY <= sRect.bottom;

    if (mouseInside) {
      // ...but the target maps through the canvas rect, since that is the
      // coordinate system the atom is actually rendered in
      const cRect = container.getBoundingClientRect();
      const px = event.clientX - cRect.left;
      const py = event.clientY - cRect.top;
      target.set(px - width / 2, height / 2 - py);
    } else {
      target.copy(home);
    }
  });

  new ResizeObserver(() => {
    width = container.clientWidth;
    height = container.clientHeight;
    renderer.setSize(width, height);
    fitCamera();
    updateHome();
    if (!mouseInside) target.copy(home);
  }).observe(container);

  // --- Animation loop ------------------------------------------------------------
  const tmp = new THREE.Vector3();

  function animate() {
    pos.lerp(target, 0.06);
    atom.position.set(pos.x, pos.y, 0);

    // Publish the atom's page-space position (scroll-independent); the robot
    // panel aims its shadow light from here every frame
    const rect = container.getBoundingClientRect();
    window.__atomLight = {
      x: rect.left + window.scrollX + width / 2 + pos.x,
      y: rect.top + window.scrollY + height / 2 - pos.y,
    };

    field.rotation.y += 0.004;
    field.rotation.x += 0.0015;
    cube.rotation.y += 0.01;
    cube.rotation.x += 0.006;

    for (const e of electrons) {
      e.angle += e.speed;
      tmp
        .set(Math.cos(e.angle) * e.rx, 0, Math.sin(e.angle) * e.rz)
        .applyEuler(e.euler);
      e.dot.position.copy(tmp);

      e.pts.unshift(tmp.clone());
      if (e.pts.length > TRAIL_N) e.pts.pop();

      const arr = e.trail.geometry.attributes.position.array;
      for (let i = 0; i < TRAIL_N; i++) {
        const p = e.pts[Math.min(i, e.pts.length - 1)];
        arr[i * 3] = p.x;
        arr[i * 3 + 1] = p.y;
        arr[i * 3 + 2] = p.z;
      }
      e.trail.geometry.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  animate();
});
