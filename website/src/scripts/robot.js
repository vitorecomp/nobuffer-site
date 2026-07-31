// AR3 robot arm rendered from the real open-source design.
// Meshes + kinematics: ar3_core ROS package (MIT, (c) 2021 Dexter Ong),
// robot design by Annin Robotics (open-source AR2/AR3). See
// src/assets/models/ATTRIBUTION.md.
//
// The chain below is the ar3.urdf joint table verbatim (meters/radians,
// ROS z-up). Because the exported URDF frames are irregular, the IK is
// self-calibrating: after building the chain we measure the world positions
// of the shoulder/elbow/wrist pivots, the fingertip, and each joint's world
// axis at the home pose, then drive a planar 2-link solution from those
// measurements. The arm chases the mouse inside the panel and idles outside.
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('robot-arm-container');
  if (!container || typeof THREE === 'undefined') return;
  if (typeof THREE.STLLoader === 'undefined') {
    console.warn('STLLoader missing — robot arm disabled');
    return;
  }

  let width = container.clientWidth || 768;
  let height = container.clientHeight || 448;

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

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(-0.6, 1, 1.5);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(0x2dd4bf, 0.5, 1200);
  rimLight.position.set(200, 100, 200);
  scene.add(rimLight);

  // --- AR3 URDF joint table (ar3_core/ar3_description/urdf/ar3.urdf) ---------
  const PX_PER_M = 500; // same visual scale as before (1px ≈ 2mm)
  const CHAIN = [
    { mesh: 'base_link' },
    { xyz: [0, 0, 0.003445], rpy: [3.1416, 0, -0.0000167], axis: [0, 0, 1], mesh: 'link_1' },
    { xyz: [0, 0.064146, -0.16608], rpy: [1.5708, 0.5236, -1.5708], axis: [0, 0, -1], mesh: 'link_2' },
    { xyz: [0.1525, -0.26414, 0], rpy: [0, 0, -1.4953816339], axis: [0, 0, -1], mesh: 'link_3' },
    { xyz: [0, 0, 0.00675], rpy: [1.5708, -1.2554, -1.5708], axis: [0, 0, -1], mesh: 'link_4' },
    { xyz: [0, 0, -0.22225], rpy: [3.1416, 0, -2.8262], axis: [-1, 0, 0], mesh: 'link_5' },
    { xyz: [-0.000294, 0, 0.02117], rpy: [0, 0, 3.1416], axis: [0, 0, 1], mesh: 'link_6' },
  ];

  const MODEL_URLS = {
    base_link: require('../assets/models/base_link.stl'),
    link_1: require('../assets/models/link_1.stl'),
    link_2: require('../assets/models/link_2.stl'),
    link_3: require('../assets/models/link_3.stl'),
    link_4: require('../assets/models/link_4.stl'),
    link_5: require('../assets/models/link_5.stl'),
    link_6: require('../assets/models/link_6.stl'),
  };

  // Procedural "brushed metal" matcaps (the STL meshes carry no UVs, so a
  // matcap is how they get surface texture), tinted with the site's primary
  // teal: radial metal shading + turning rings + machining speckle.
  function makeMatcap(hi, mid, lo) {
    const cnv = document.createElement('canvas');
    cnv.width = cnv.height = 256;
    const g = cnv.getContext('2d');
    const grad = g.createRadialGradient(92, 92, 12, 128, 128, 150);
    grad.addColorStop(0, hi);
    grad.addColorStop(0.55, mid);
    grad.addColorStop(1, lo);
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 70; i++) {
      g.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.06})`;
      g.beginPath();
      g.arc(128, 128, 8 + Math.random() * 130, 0, Math.PI * 2);
      g.stroke();
    }
    for (let i = 0; i < 900; i++) {
      g.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '0,0,0'}, ${Math.random() * 0.05})`;
      g.fillRect(Math.random() * 256, Math.random() * 256, 1.5, 1.5);
    }
    return new THREE.CanvasTexture(cnv);
  }

  const bodyMat = new THREE.MeshMatcapMaterial({
    matcap: makeMatcap('#fff2a8', '#f5c400', '#6b4e00'), // industrial machine yellow
  });
  const baseMat = new THREE.MeshMatcapMaterial({
    matcap: makeMatcap('#8f979d', '#23282e', '#0b0e11'), // black joint sections
  });
  const metalMat = new THREE.MeshMatcapMaterial({
    matcap: makeMatcap('#ffffff', '#c3c9cf', '#565b61'), // machined aluminum
  });
  const blackMat = new THREE.MeshPhongMaterial({ color: 0x14161c, shininess: 30 });
  const detailMat = new THREE.MeshPhongMaterial({ color: 0xd1d5db, shininess: 100 });

  // --- Build the chain ---------------------------------------------------------
  const stage = new THREE.Group(); // panel placement + yaw alignment + scale
  stage.scale.setScalar(PX_PER_M);
  scene.add(stage);

  const robot = new THREE.Group();
  robot.rotation.x = -Math.PI / 2; // ROS z-up -> three.js y-up
  stage.add(robot);

  // The STL of each link contains several solid bodies stored as contiguous
  // triangle ranges (found by connected-component analysis of the meshes).
  // These ranges are the stepper motors, shaft couplers, the forearm's
  // structural tube and side cover — everything that is black hardware on
  // the real robot, while the castings around them are painted yellow.
  // Hardware bodies inside each link STL (found by connected-component
  // analysis), typed by finish: 'nema' motors get silver end caps around a
  // black laminated center stack, 'metal' couplers are bare aluminum, and
  // 'black' is plain black hardware.
  const HARDWARE_RANGES = {
    base_link: [
      { r: [640, 695], type: 'nema' }, // NEMA17 rear housing (visible back face)
      { r: [696, 1119], type: 'metal' }, // shaft coupler
      { r: [1120, 1461], type: 'nema' }, // NEMA17 body
      { r: [3894, 4505], type: 'metal' }, // coupler housing
    ],
    link_1: [
      { r: [4694, 5719], type: 'nema' }, // NEMA23 body
      { r: [8148, 8491], type: 'metal' }, // aluminum motor spacer plates
      { r: [8492, 9663], type: 'nema' }, // NEMA23 body
      { r: [9664, 10281], type: 'gearmotor', gearFrac: 0.45, gearEnd: 1 }, // J2 NEMA23 + planetary gearbox
    ],
    link_2: [
      { r: [3690, 3745], type: 'nema' }, // J3 motor rear housing (visible back face)
      { r: [3746, 4169], type: 'metal' }, // shaft coupler
      { r: [4170, 4511], type: 'nema' }, // J3 NEMA17 body
    ],
    link_3: [
      { r: [2804, 3399], type: 'metal' }, // shaft coupler
      { r: [5510, 5537], type: 'nema' }, // wrist motor rear housing (visible back face)
      { r: [5538, 5925], type: 'nema' }, // wrist stepper body
    ],
    link_4: [
      { r: [1344, 1687], type: 'black' }, // forearm structural square tube
      { r: [1688, 2107], type: 'black' }, // J5 drive tube
      { r: [2108, 3387], type: 'black' }, // motor mount plate
      { r: [9266, 10349], type: 'black' }, // side cover (painted yellow by the link_4 branch)
    ],
    link_5: [
      { r: [0, 27], type: 'nema' }, // motor box
      { r: [400, 697], type: 'metal' }, // coupler
      { r: [698, 1035], type: 'metal' }, // coupler
      { r: [3504, 4115], type: 'nema' }, // J6 stepper body
    ],
  };

  // Extract the "painted outer wall" of a part: triangles beyond `cut` along
  // the given local axis ('x' | 'z') AND whose faces point that way. The
  // normal test keeps top/bottom surfaces out of the paint, avoiding speckle
  // artifacts where curved geometry straddles the cut plane.
  // Returns [painted, rest].
  function splitOuterWall(geometry, axis, cut, sign) {
    const pos = geometry.attributes.position;
    const nor = geometry.attributes.normal;
    const readP = axis === 'x' ? (i) => pos.getX(i) : (i) => pos.getZ(i);
    const readN = axis === 'x' ? (i) => nor.getX(i) : (i) => nor.getZ(i);
    const painted = { p: [], n: [] };
    const rest = { p: [], n: [] };
    for (let i = 0; i < pos.count; i += 3) {
      const pc = (readP(i) + readP(i + 1) + readP(i + 2)) / 3;
      const nc = (readN(i) + readN(i + 1) + readN(i + 2)) / 3;
      const isOuter = (pc - cut) * sign > 0 && nc * sign > 0.35;
      const dst = isOuter ? painted : rest;
      for (let j = i; j < i + 3; j++) {
        dst.p.push(pos.getX(j), pos.getY(j), pos.getZ(j));
        dst.n.push(nor.getX(j), nor.getY(j), nor.getZ(j));
      }
    }
    return [painted, rest].map((side) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(side.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(side.n, 3));
      return g;
    });
  }

  // Split a (non-indexed STL) geometry into [insideRanges, rest] by triangle
  // index, so hardware bodies and castings get separate materials
  function splitByTriangleRanges(geometry, ranges) {
    const pos = geometry.attributes.position;
    const nor = geometry.attributes.normal;
    const inside = { p: [], n: [] };
    const rest = { p: [], n: [] };
    const triCount = pos.count / 3;
    for (let t = 0; t < triCount; t++) {
      const dst = ranges.some(([a, b]) => t >= a && t <= b) ? inside : rest;
      for (let j = t * 3; j < t * 3 + 3; j++) {
        dst.p.push(pos.getX(j), pos.getY(j), pos.getZ(j));
        dst.n.push(nor.getX(j), nor.getY(j), nor.getZ(j));
      }
    }
    return [inside, rest].map((side) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(side.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(side.n, 3));
      return g;
    });
  }

  // Shaft axis of a motor body: the bbox dimension most unlike the other
  // two (the motor cross-section is square)
  function motorAxis(geometry) {
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const axes = ['x', 'y', 'z'];
    const size = axes.map((a) => bb.max[a] - bb.min[a]);
    let axis = 0;
    let best = -1;
    for (let i = 0; i < 3; i++) {
      const d =
        Math.abs(size[i] - size[(i + 1) % 3]) + Math.abs(size[i] - size[(i + 2) % 3]);
      if (d > best) {
        best = d;
        axis = i;
      }
    }
    return {
      bb,
      min: bb.min[axes[axis]],
      max: bb.max[axes[axis]],
      length: size[axis],
      getter: ['getX', 'getY', 'getZ'][axis],
    };
  }

  // Partition a motor body's triangles into silver/black by a predicate on
  // the centroid coordinate along the shaft axis
  function splitMotorBy(geometry, isSilver) {
    const { getter } = motorAxis(geometry);
    const pos = geometry.attributes.position;
    const nor = geometry.attributes.normal;
    const silver = { p: [], n: [] };
    const black = { p: [], n: [] };
    for (let i = 0; i < pos.count; i += 3) {
      const c = (pos[getter](i) + pos[getter](i + 1) + pos[getter](i + 2)) / 3;
      const dst = isSilver(c) ? silver : black;
      for (let j = i; j < i + 3; j++) {
        dst.p.push(pos.getX(j), pos.getY(j), pos.getZ(j));
        dst.n.push(nor.getX(j), nor.getY(j), nor.getZ(j));
      }
    }
    return [silver, black].map((side) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(side.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(side.n, 3));
      return g;
    });
  }

  // Plain NEMA: silver end caps around the black laminated center stack
  function splitMotorCaps(geometry) {
    const { min, max, length } = motorAxis(geometry);
    const lo = min + length * 0.16;
    const hi = max - length * 0.16;
    return splitMotorBy(geometry, (c) => c < lo || c > hi);
  }

  // Geared NEMA (motor + planetary gearbox in one body): the whole gearbox
  // section at the output end is aluminum, plus a rear cap; the rest is the
  // black motor stack. gearEnd: +1 = gearbox at the axis max end, -1 = min.
  function splitGearMotor(geometry, gearFrac, gearEnd) {
    const { min, max, length } = motorAxis(geometry);
    if (gearEnd > 0) {
      const gearCut = max - length * gearFrac;
      const capCut = min + length * 0.12;
      return splitMotorBy(geometry, (c) => c > gearCut || c < capCut);
    }
    const gearCut = min + length * gearFrac;
    const capCut = max - length * 0.12;
    return splitMotorBy(geometry, (c) => c < gearCut || c > capCut);
  }

  // Add a link's hardware bodies, each with its finish
  function addHardware(holder, geometry, entries) {
    for (const e of entries) {
      const [piece] = splitByTriangleRanges(geometry, [e.r]);
      if (e.type === 'metal') {
        holder.add(new THREE.Mesh(piece, metalMat));
      } else if (e.type === 'nema') {
        const [caps, stack] = splitMotorCaps(piece);
        holder.add(new THREE.Mesh(caps, metalMat));
        holder.add(new THREE.Mesh(stack, baseMat));
      } else if (e.type === 'gearmotor') {
        const [silver, stack] = splitGearMotor(piece, e.gearFrac, e.gearEnd);
        holder.add(new THREE.Mesh(silver, metalMat));
        holder.add(new THREE.Mesh(stack, baseMat));
      } else {
        holder.add(new THREE.Mesh(piece, baseMat));
      }
    }
  }

  const joints = [];
  const loader = new THREE.STLLoader();
  let parent = robot;

  CHAIN.forEach((seg) => {
    if (seg.xyz) {
      const origin = new THREE.Group();
      origin.position.fromArray(seg.xyz);
      // URDF rpy is extrinsic X-Y-Z, i.e. R = Rz(y)·Ry(p)·Rx(r) -> Euler 'ZYX'
      origin.rotation.set(seg.rpy[0], seg.rpy[1], seg.rpy[2], 'ZYX');
      parent.add(origin);

      const jointGroup = new THREE.Group();
      origin.add(jointGroup);
      joints.push({
        group: jointGroup,
        axis: new THREE.Vector3().fromArray(seg.axis).normalize(),
        theta: 0,
      });
      parent = jointGroup;
    }
    const holder = parent;
    loader.load(MODEL_URLS[seg.mesh], (geometry) => {
      // Yellow castings; hardware rendered per finish: NEMA motors get
      // silver end caps around a black center stack, couplers are aluminum,
      // covers/mounts stay black
      const entries = HARDWARE_RANGES[seg.mesh];
      if (!entries) {
        holder.add(new THREE.Mesh(geometry, bodyMat));
        return;
      }
      const plainRanges = entries.map((e) => e.r);
      if (seg.mesh === 'link_2') {
        // Lower arm: paint BOTH flat side walls black (lateral axis is Z).
        // The outer skins sit within ~8mm of the z extremes; the interior
        // pocket surfaces are much deeper in and stay yellow.
        const [, casting] = splitByTriangleRanges(geometry, plainRanges);
        casting.computeBoundingBox();
        const bb = casting.boundingBox;
        const [outerPlus, rest] = splitOuterWall(casting, 'z', bb.max.z - 0.008, 1);
        const [outerMinus, inner] = splitOuterWall(rest, 'z', bb.min.z + 0.008, -1);
        holder.add(new THREE.Mesh(inner, bodyMat));
        holder.add(new THREE.Mesh(outerPlus, baseMat));
        holder.add(new THREE.Mesh(outerMinus, baseMat));
        addHardware(holder, geometry, entries);
        return;
      }
      if (seg.mesh === 'link_4') {
        // Nothing moves — only the paint swaps sides: the side cover is
        // painted yellow like the casting, and the casting's OTHER side
        // (opposite the cover, relative to the structural tube) goes black.
        const [cover] = splitByTriangleRanges(geometry, [[9266, 10349]]);
        const [, casting] = splitByTriangleRanges(geometry, plainRanges);

        const [tube] = splitByTriangleRanges(geometry, [[1344, 1687]]);
        tube.computeBoundingBox();
        cover.computeBoundingBox();
        const tubeCx = (tube.boundingBox.min.x + tube.boundingBox.max.x) / 2;
        const coverCx = (cover.boundingBox.min.x + cover.boundingBox.max.x) / 2;
        // Paint boundary at the tube's OUTER face (opposite the cover): only
        // outward-FACING wall triangles beyond it go black, so top/bottom
        // surfaces never catch stray paint
        const plusIsOuter = coverCx <= tubeCx;
        const sign = plusIsOuter ? 1 : -1;
        const cut = plusIsOuter
          ? tube.boundingBox.max.x - 0.002
          : tube.boundingBox.min.x + 0.002;
        const [outer, inner] = splitOuterWall(casting, 'x', cut, sign);

        holder.add(new THREE.Mesh(cover, bodyMat));
        holder.add(new THREE.Mesh(inner, bodyMat));
        holder.add(new THREE.Mesh(outer, baseMat));
        addHardware(
          holder,
          geometry,
          entries.filter((e) => e.r[0] !== 9266)
        );
        return;
      }
      const [, casting] = splitByTriangleRanges(geometry, plainRanges);
      holder.add(new THREE.Mesh(casting, bodyMat));
      addHardware(holder, geometry, entries);
    });
  });

  const [J1, J2, J3, J4, J5, J6] = joints;

  // Servo gripper on the tool flange (the URDF has no gripper link).
  // Modeled along +Y, rotated so it points out along the flange +Z axis.
  const gripper = new THREE.Group();
  gripper.rotation.x = Math.PI / 2;
  gripper.position.set(0, 0, 0.003); // seated on the tool flange face
  J6.group.add(gripper);

  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.016, 0.024), blackMat);
  palm.position.y = 0.02;
  gripper.add(palm);
  const fingerGeo = new THREE.BoxGeometry(0.01, 0.05, 0.016);
  const fingerL = new THREE.Mesh(fingerGeo, blackMat);
  const fingerR = new THREE.Mesh(fingerGeo, blackMat);
  fingerL.position.set(-0.018, 0.053, 0);
  fingerR.position.set(0.018, 0.053, 0);
  gripper.add(fingerL);
  gripper.add(fingerR);
  const padGeo = new THREE.BoxGeometry(0.004, 0.038, 0.012);
  const padL = new THREE.Mesh(padGeo, detailMat);
  padL.position.set(0.007, 0.004, 0);
  fingerL.add(padL);
  const padR = new THREE.Mesh(padGeo, detailMat);
  padR.position.set(-0.007, 0.004, 0);
  fingerR.add(padR);

  const tip = new THREE.Object3D();
  tip.position.set(0, 0.078, 0);
  gripper.add(tip);

  // --- Self-calibration at the home pose ------------------------------------------
  scene.updateMatrixWorld(true);

  // Align the pitch plane with the screen: J2's axis must point along ±z
  const j2AxisWorld = J2.axis.clone().transformDirection(J2.group.matrixWorld);
  stage.rotation.y = -Math.atan2(j2AxisWorld.x, j2AxisWorld.z);
  scene.updateMatrixWorld(true);

  const wp = (obj) => obj.getWorldPosition(new THREE.Vector3());
  const P2 = wp(J2.group); // shoulder pivot
  const P3 = wp(J3.group); // elbow pivot
  const P5 = wp(J5.group); // wrist pivot
  const PT = wp(tip); // fingertip

  // Center the arm's working plane (at home yaw) on z=0
  const planeZ = P2.z;

  const angleOf = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);
  const dist2 = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
  const L1 = dist2(P2, P3); // shoulder -> elbow
  const L2 = dist2(P3, P5); // elbow -> wrist center
  const LT = dist2(P5, PT); // wrist center -> fingertip
  const homeUpper = angleOf(P2, P3);
  const homeFore = angleOf(P3, P5);
  const homeTool = angleOf(P5, PT);

  // Tightest allowed elbow fold (~55° interior angle) — keeps the forearm
  // from swinging back through the upper arm and the base column
  const D_MIN = Math.sqrt(L1 * L1 + L2 * L2 - 2 * L1 * L2 * Math.cos(0.96));

  const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const homeElbowRel = wrapAngle(homeFore - homeUpper);
  const homeWristRel = wrapAngle(homeTool - homeFore);

  // Screen-plane sign of each pitch axis (which way positive theta turns)
  const axisSign = (j) =>
    Math.sign(j.axis.clone().transformDirection(j.group.matrixWorld).z) || 1;
  const s2 = axisSign(J2);
  const s3 = axisSign(J3);
  const s5 = axisSign(J5);

  // Static viewing angle. The IK measures the live working plane every frame,
  // so any extra yaw (this one or the continuous J1 spin) is handled exactly.
  const VIEW_YAW = -0.9; // viewing angle in radians
  stage.rotation.y += VIEW_YAW;

  // --- Placement, mouse, resize ------------------------------------------------------
  let baseX = 0;
  let baseY = 0;

  function place() {
    baseX = 0;
    baseY = -height / 3 + 16;
    stage.position.set(baseX, baseY, -planeZ);
  }
  place();

  let mouseInside = false;
  const mouseTarget = new THREE.Vector2();
  const target = new THREE.Vector2(100, 150);

  container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    mouseInside = true;
    mouseTarget.set(
      event.clientX - rect.left - width / 2,
      height / 2 - (event.clientY - rect.top)
    );
  });
  container.addEventListener('mouseleave', () => {
    mouseInside = false;
  });

  new ResizeObserver(() => {
    width = container.clientWidth;
    height = container.clientHeight;
    renderer.setSize(width, height);
    fitCamera();
    place();
  }).observe(container);

  // --- IK + animation loop ----------------------------------------------------------
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const setJoint = (j, theta) => j.group.quaternion.setFromAxisAngle(j.axis, theta);

  // Joint-space inertia: each pitch joint behaves as a torsional
  // spring-damper, so the arm accelerates, carries momentum and settles with
  // a slight overshoot. Heavier joints are softer; the wrist is snappier.
  const dyn2 = { p: 0, v: 0, k: 8, c: 5.2 };
  const dyn3 = { p: 0, v: 0, k: 12, c: 6.5 };
  const dyn5 = { p: 0, v: 0, k: 30, c: 10 };
  function springTo(s, goal, dt) {
    s.v += (s.k * (goal - s.p) - s.c * s.v) * dt;
    s.p += s.v * dt;
    return s.p;
  }

  let th6 = 0;
  let j1 = 0;
  let lastTime = 0;
  const yWorld = new THREE.Vector3(0, 1, 0);
  const nLive = new THREE.Vector3(); // live pitch-plane normal (J2 world axis)
  const hLive = new THREE.Vector3(); // live in-plane horizontal basis
  const p2Live = new THREE.Vector3(); // live shoulder pivot

  function animate(time) {
    const dt = clamp((time - lastTime) / 1000, 0.001, 0.05);
    lastTime = time;

    // Collision bounds: the panel walls and the table the base plate sits on
    const floorY = baseY + 10;
    const idle = new THREE.Vector2(
      baseX + Math.sin(time * 0.0006) * 90,
      baseY + 170 + Math.cos(time * 0.0009) * 45
    );
    const want = mouseInside ? mouseTarget : idle;
    target.x += (clamp(want.x, -width / 2 + 24, width / 2 - 24) - target.x) * 0.05;
    target.y += (clamp(want.y, floorY, height / 2 - 30) - target.y) * 0.05;

    // The base never stops spinning: advance J1 first, then measure the live
    // working plane (its normal is J2's world axis) and project the screen
    // target into it — the arm pose is re-solved for the rotated base every
    // frame, reaching for the in-plane point closest to the cursor.
    j1 += 0.15 * dt;
    setJoint(J1, j1);
    J2.group.updateWorldMatrix(true, false);
    nLive.copy(J2.axis).transformDirection(J2.group.matrixWorld);
    J2.group.getWorldPosition(p2Live);
    hLive.crossVectors(yWorld, nLive).multiplyScalar(s2).normalize();

    // Target world point is (target.x, target.y, 0); express it in plane coords
    const tx = (target.x - p2Live.x) * hLive.x - p2Live.z * hLive.z;
    const ty = target.y - p2Live.y;
    const dist = Math.hypot(tx, ty) || 1;
    const ux = tx / dist;
    const uy = ty / dist;

    // Wrist-center point: pull back along the target ray by most of the tool
    // length. The pulled-back DISTANCE is clamped (never the raw point), so
    // the wrist center can't cross the shoulder pivot and flip the aim 180°
    // when the cursor hovers over the robot's own shoulder.
    const dPull = clamp(dist - LT * 0.92, D_MIN, L1 + L2 - 0.5);
    const px = ux * dPull;
    let py = uy * dPull;
    // The wrist body itself also stays above the table
    py = Math.max(py, floorY + 6 - p2Live.y);
    const d = clamp(Math.hypot(px, py), D_MIN, L1 + L2 - 0.5);

    // Planar 2-link IK, elbow-up branch. phi1 is folded into the (-90°, 270°)
    // branch so poses left of the shoulder stay continuous across the atan2
    // seam (which used to windmill the arm), then confined to a sane arc so
    // the upper arm can never sweep down through its own base.
    const baseAngle = Math.atan2(py, px);
    const cosA = clamp((d * d + L1 * L1 - L2 * L2) / (2 * L1 * d), -1, 1);
    let phi1 = baseAngle + Math.acos(cosA);
    if (phi1 < -Math.PI / 2) phi1 += 2 * Math.PI;
    phi1 = clamp(phi1, -0.3, Math.PI + 0.3);
    const fx = px - L1 * Math.cos(phi1);
    const fy = py - L1 * Math.sin(phi1);
    const phi12 = Math.atan2(fy, fx); // forearm absolute angle

    // Tool absolute angle: from the (achieved) wrist center to the target
    const wx = L1 * Math.cos(phi1) + L2 * Math.cos(phi12);
    const wy = L1 * Math.sin(phi1) + L2 * Math.sin(phi12);
    const phiTool = Math.atan2(ty - wy, tx - wx);

    // Convert absolute segment angles into joint angles via the calibrated
    // home angles. Every RELATIVE angle is wrapped to (-180°, 180°] so an
    // atan2 seam can never command a full-turn transient on a joint.
    const t2 = s2 * (phi1 - homeUpper);
    const t3 = s3 * (wrapAngle(phi12 - phi1) - homeElbowRel);
    const t5 = s5 * clamp(wrapAngle(phiTool - phi12) - homeWristRel, -1.75, 1.75);

    setJoint(J2, springTo(dyn2, t2, dt));
    setJoint(J3, springTo(dyn3, t3, dt));
    setJoint(J5, springTo(dyn5, t5, dt));
    th6 += 0.6 * dt;
    setJoint(J6, th6); // tool roll: spins without changing where the tool points
    setJoint(J4, 0); // forearm roll stays 0: the true planar AR2/AR3 solution

    // Gripper: pinches when chasing the cursor, breathes when idle
    const grip = mouseInside ? 0.01 : 0.016 + Math.sin(time * 0.003) * 0.005;
    fingerL.position.x += (-grip - fingerL.position.x) * 0.1;
    fingerR.position.x += (grip - fingerR.position.x) * 0.1;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
});
