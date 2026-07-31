// AR3 robot arm rendered from the real open-source design.
// Meshes + kinematics: ar3_core ROS package (MIT, (c) 2021 Dexter Ong),
// robot design by Annin Robotics (open-source AR2/AR3). See
// ATTRIBUTION.md at the repository root.
//
// The chain below is the ar3.urdf joint table verbatim (meters/radians,
// ROS z-up). Because the exported URDF frames are irregular, the IK is
// self-calibrating: after building the chain we measure the world positions
// of the shoulder/elbow/wrist pivots, the fingertip, and each joint's world
// axis at the home pose, then drive a planar 2-link solution from those
// measurements. The arm chases the mouse inside the panel and idles outside.
document.addEventListener('DOMContentLoaded', () => {
  // The outer panel is the visible card; the robot renders into an inner
  // stage div that CSS shifts sideways, so the camera stays centered on the
  // model (no perspective skew) while the whole canvas moves.
  const panel = document.getElementById('robot-arm-container');
  const container = document.getElementById('robot-arm-stage');
  if (!panel || !container || typeof THREE === 'undefined') return;
  if (typeof THREE.GLTFLoader === 'undefined') {
    console.warn('GLTFLoader missing — robot arm disabled');
    return;
  }

  let width = container.clientWidth || 768;
  let height = container.clientHeight || 448;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

  // The teal "atom" floating over this section is the shadow light source:
  // constellation.js publishes its page position each frame and this spot
  // follows it. The matcap materials ignore lights, so its visible effect is
  // the soft shadow the arm casts on the invisible floor plane below.
  const atomLight = new THREE.SpotLight(0xffffff, 0.3);
  atomLight.angle = Math.PI / 4;
  atomLight.castShadow = true;
  atomLight.shadow.mapSize.set(2048, 2048);
  atomLight.shadow.camera.near = 50;
  atomLight.shadow.camera.far = 8000;
  atomLight.shadow.bias = -0.0002;
  atomLight.position.set(-600, 900, 400); // fallback until the atom reports in
  scene.add(atomLight);
  scene.add(atomLight.target);

  const shadowCatcher = new THREE.Mesh(
    new THREE.PlaneGeometry(4000, 4000),
    new THREE.ShadowMaterial({ opacity: 0.25 })
  );
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

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

  // Whole painted robot in one editable GLB (see tmp/paint_robot.py -- export)
  const MODEL_URL = require('../assets/models/robot.glb');

  // Procedural "brushed metal" matcaps (the robot meshes carry no UVs, so a
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

  // Palette matched to the reference photo: warm PLA gold with orange-tinted
  // shadows, matte near-black hardware, bright galvanized steel details
  const bodyMat = new THREE.MeshMatcapMaterial({
    matcap: makeMatcap('#ffe98f', '#f0bd00', '#7a5600'), // printed PLA yellow
  });
  const baseMat = new THREE.MeshMatcapMaterial({
    matcap: makeMatcap('#787c82', '#1e2023', '#08090b'), // matte black hardware
  });
  const metalMat = new THREE.MeshMatcapMaterial({
    matcap: makeMatcap('#fafbfc', '#bfc5cb', '#5a5f66'), // galvanized steel
  });
  const blackMat = new THREE.MeshPhongMaterial({ color: 0x17181c, shininess: 25 });
  const detailMat = new THREE.MeshPhongMaterial({ color: 0xd4d8dc, shininess: 100 });

  // --- Build the chain ---------------------------------------------------------
  const stage = new THREE.Group(); // panel placement + yaw alignment + scale
  stage.scale.setScalar(PX_PER_M);
  scene.add(stage);

  const robot = new THREE.Group();
  robot.rotation.x = -Math.PI / 2; // ROS z-up -> three.js y-up
  stage.add(robot);

  // robot.glb is exported from the painted Blender scene (tmp/paint_robot.py
  // -- export): every solid body inside the original STLs — motors, gearboxes,
  // couplers, brackets, pulleys, covers — was identified by connected-component
  // analysis and baked into one flat-shaded mesh per link and finish, named
  // "<link>__<material>". The file's node transforms only pose the arm for
  // editing in Blender; here each mesh is re-parented under its joint group
  // (which already carries the URDF transform) and gets the site's matcap.
  const MAT_BY_NAME = {
    pla_yellow: bodyMat, // printed castings
    hw_black: baseMat, // covers, tubes, printed pulleys, mounts
    motor_stack: baseMat, // stepper laminated center stacks
    aluminum: metalMat, // planetary gearboxes, shaft couplers
    steel: metalMat, // motor brackets, stepper end caps
  };

  const joints = [];
  const holders = {}; // link name -> joint group the link's meshes attach to
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
    holders[seg.mesh] = parent;
  });

  // Blender appends ".001"-style suffixes to names when they collide during
  // an import/edit session; strip them so edited re-exports keep working
  const baseName = (name) => (name || '').replace(/\.\d+$/, '');

  new THREE.GLTFLoader().load(MODEL_URL, (gltf) => {
    const meshes = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh) meshes.push(child);
    });
    meshes.forEach((mesh) => {
      const holder = holders[baseName(mesh.name).split('__')[0]];
      if (!holder) return;
      mesh.material = MAT_BY_NAME[baseName(mesh.material.name)] || bodyMat;
      mesh.castShadow = true;
      mesh.position.set(0, 0, 0);
      // The glTF exporter converted the vertex data to Y-up (x,z,-y);
      // rotate +90° about X to recover the ROS Z-up link-local frame the
      // URDF joint chain expects.
      mesh.rotation.set(Math.PI / 2, 0, 0);
      mesh.scale.set(1, 1, 1);
      holder.add(mesh);
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
  // Like the photo: bright steel bracket fingers with dark rubber pads
  const fingerGeo = new THREE.BoxGeometry(0.01, 0.05, 0.016);
  const fingerL = new THREE.Mesh(fingerGeo, detailMat);
  const fingerR = new THREE.Mesh(fingerGeo, detailMat);
  fingerL.position.set(-0.018, 0.053, 0);
  fingerR.position.set(0.018, 0.053, 0);
  gripper.add(fingerL);
  gripper.add(fingerR);
  const padGeo = new THREE.BoxGeometry(0.004, 0.038, 0.012);
  const padL = new THREE.Mesh(padGeo, blackMat);
  padL.position.set(0.007, 0.004, 0);
  fingerL.add(padL);
  const padR = new THREE.Mesh(padGeo, blackMat);
  padR.position.set(-0.007, 0.004, 0);
  fingerR.add(padR);

  const tip = new THREE.Object3D();
  tip.position.set(0, 0.078, 0);
  gripper.add(tip);

  [palm, fingerL, fingerR, padL, padR].forEach((m) => {
    m.castShadow = true;
  });

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
    shadowCatcher.position.set(baseX, baseY, 0);
    atomLight.target.position.set(baseX, baseY + 150, 0);
  }
  place();

  let mouseInside = false;
  const mouseTarget = new THREE.Vector2();
  const target = new THREE.Vector2(100, 150);

  // Track the mouse over the whole visible panel, but map coordinates into
  // the (possibly CSS-shifted) stage the canvas actually lives in.
  panel.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    mouseInside = true;
    mouseTarget.set(
      event.clientX - rect.left - width / 2,
      height / 2 - (event.clientY - rect.top)
    );
  });
  panel.addEventListener('mouseleave', () => {
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

    // Aim the shadow light from wherever the atom currently floats,
    // converting its published page coords into this canvas's scene space
    const atomPos = window.__atomLight;
    if (atomPos) {
      const rect = container.getBoundingClientRect();
      atomLight.position.set(
        atomPos.x - (rect.left + window.scrollX) - width / 2,
        height / 2 - (atomPos.y - (rect.top + window.scrollY)),
        250
      );
    }

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
