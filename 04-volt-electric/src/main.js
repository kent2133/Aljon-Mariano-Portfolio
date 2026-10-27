import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { setupExperience } from "./experience.js";
import "./style.css";

document.querySelector("#app").innerHTML = `
  <main class="ui">
    <nav aria-label="Page sections">
      <a class="brand" href="#machine" aria-label="Volt R-01 home">VOLT//R</a>
      <div class="nav-links">
        <a href="#machine">Machine</a>
        <a href="#performance">Performance</a>
        <a href="#engineering">Engineering</a>
        <a href="#configure">Configure</a>
        <a href="#systems">Systems</a>
      </div>
      <a class="reserve-link" href="#reserve">RESERVE / 001</a>
    </nav>

    <section class="hero story-section" id="machine" data-stage="0">
      <span class="eyebrow">VOLT R-01 / ELECTRIC STREETFIGHTER</span>
      <h1>SILENT<br><i>/ SAVAGE</i></h1>
      <div class="herofoot">
        <p>Built around instant torque and nothing unnecessary. The R-01 turns electricity into a sharper kind of motion.</p>
        <span>DRAG TO ROTATE ↔</span>
      </div>
    </section>

    <section class="stats story-section" id="performance" data-stage="1">
      <div class="stats-heading">
        <span class="eyebrow">00 / FULL CURRENT</span>
        <h2>Velocity,<br>without the noise.</h2>
      </div>
      <div class="stat-grid">
        <div><b>2.8<span>S</span></b><small>0—100 KM/H</small></div>
        <div><b>220<span>KM</span></b><small>URBAN RANGE*</small></div>
        <div><b>165<span>HP</span></b><small>PEAK POWER</small></div>
        <div><b>18<span>MIN</span></b><small>20—80% CHARGE*</small></div>
      </div>
    </section>

    <section class="engineering story-section" id="engineering" data-stage="2">
      <span class="eyebrow">01 / CORE ENGINEERING</span>
      <div class="engineering-copy">
        <h2>Mass centralized.<br>Response amplified.</h2>
        <p>The structural battery sits low inside a cast-aluminum frame, concentrating weight between the wheels. The result is immediate direction change without sacrificing high-speed composure.</p>
      </div>
      <div class="tech">
        <article><b>01</b><h3>Structural pack</h3><p>Liquid-cooled cells form a rigid stressed member at the motorcycle's center.</p></article>
        <article><b>02</b><h3>Direct drive</h3><p>No clutch, no gearbox, no delay between your wrist and the rear wheel.</p></article>
        <article><b>03</b><h3>Active recovery</h3><p>Lean-aware regeneration adapts to grip, gradient, and riding mode.</p></article>
      </div>
    </section>

    <section class="config story-section" id="configure" data-stage="3">
      <div class="config-copy">
        <span class="eyebrow">02 / BUILD YOUR R-01</span>
        <h2>Choose your<br>signal.</h2>
        <p>Paint and ergonomics transition on the live machine. Pick a finish, then reshape the rider triangle for street, circuit, or distance.</p>
      </div>
      <div class="panel">
        <label>BODY FINISH</label>
        <div class="swatches" role="group" aria-label="Body finish">
          <button data-color="c7ff00" data-name="Acid lime" class="lime selected" aria-label="Acid lime" aria-pressed="true"></button>
          <button data-color="aeb3b8" data-name="Liquid silver" class="silver" aria-label="Liquid silver" aria-pressed="false"></button>
          <button data-color="ec3327" data-name="Signal red" class="red" aria-label="Signal red" aria-pressed="false"></button>
          <button data-color="171717" data-name="Carbon black" class="black" aria-label="Carbon black" aria-pressed="false"></button>
        </div>
        <p class="selection-readout" id="paint-readout">ACID LIME / ACTIVE</p>
        <hr>
        <label>RIDE POSITION</label>
        <div class="choices" role="group" aria-label="Ride position">
          <button class="selected" data-mode="street" aria-pressed="true">STREET</button>
          <button data-mode="track" aria-pressed="false">TRACK</button>
          <button data-mode="tour" aria-pressed="false">TOUR</button>
        </div>
        <p class="selection-readout" id="ride-readout">NEUTRAL BAR / BALANCED SEAT / ROAD DAMPING</p>
        <hr>
        <p class="price">CONCEPT SPECIFICATION <b>$28,900</b></p>
      </div>
    </section>

    <section class="reserve story-section" id="reserve" data-stage="5">
      <span>FOUNDERS SERIES / 001—100</span>
      <h2>Make some<br>quiet noise.</h2>
      <a href="mailto:ride@example.com">REQUEST A PRIVATE PREVIEW →</a>
      <small>*Illustrative portfolio concept. Specifications are not production claims.</small>
    </section>
  </main>
`;

const voltAudio = setupExperience({
  tone: 64,
  accent: "#c7ff00",
  target: "#reserve",
  id: "systems",
  eyebrow: "03 / RIDER SYSTEMS",
  title: "Fast is only useful when it feels natural.",
  intro:
    "The R-01 translates complex traction, regeneration, and thermal decisions into a direct connection between rider and road.",
  items: [
    [
      "Predictive traction",
      "Wheel-speed and lean data shape torque before grip becomes drama.",
    ],
    [
      "Adaptive regeneration",
      "Brake feel remains consistent while energy recovery changes beneath it.",
    ],
    [
      "Thermal reserve",
      "Dedicated cooling preserves repeatable performance across road and track sessions.",
    ],
  ],
});

const systemsSection = document.querySelector("#systems");
systemsSection?.classList.add("story-section");
systemsSection?.setAttribute("data-stage", "4");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  31,
  innerWidth / innerHeight,
  0.1,
  100,
);
camera.position.set(0, 0.15, 9.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setClearColor(0x000000, 0);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
pmrem.dispose();

const rubber = new THREE.MeshPhysicalMaterial({
  color: 0x070808,
  roughness: 0.76,
  clearcoat: 0.18,
});
const darkMetal = new THREE.MeshPhysicalMaterial({
  color: 0x24282a,
  metalness: 0.92,
  roughness: 0.23,
});
const aluminum = new THREE.MeshPhysicalMaterial({
  color: 0x8c9294,
  metalness: 0.94,
  roughness: 0.18,
});
const bodyMat = new THREE.MeshPhysicalMaterial({
  color: 0xc7ff00,
  emissive: 0x101500,
  emissiveIntensity: 0.18,
  metalness: 0.54,
  roughness: 0.17,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
});
const brakeMat = new THREE.MeshStandardMaterial({
  color: 0xcf2f22,
  metalness: 0.62,
  roughness: 0.28,
});
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xaedfff,
  transmission: 0.25,
  transparent: true,
  opacity: 0.78,
  roughness: 0.08,
  metalness: 0.15,
});
const lightMat = new THREE.MeshStandardMaterial({
  color: 0xeaffff,
  emissive: 0xbffaff,
  emissiveIntensity: 3,
  toneMapped: false,
});

const bike = new THREE.Group();
bike.name = "VOLT R-01";
scene.add(bike);

const markMesh = (mesh, cast = true, receive = true) => {
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
};

const makeBeam = (start, end, radius, material, segments = 14) => {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = b.clone().sub(a);
  const mesh = markMesh(
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        radius * 0.92,
        radius,
        direction.length(),
        segments,
      ),
      material,
    ),
  );
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  return mesh;
};

const createWheel = (name, x) => {
  const assembly = new THREE.Group();
  assembly.name = name;
  assembly.position.set(x, -0.78, 0);

  const spinner = new THREE.Group();
  spinner.name = `${name} rotating mass`;
  assembly.add(spinner);

  const tire = markMesh(
    new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.16, 28, 88), rubber),
  );
  spinner.add(tire);

  const rim = markMesh(
    new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.055, 14, 72), darkMetal),
  );
  spinner.add(rim);

  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    const spoke = markMesh(
      new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.027, 0.58, 8),
        darkMetal,
      ),
    );
    spoke.position.set(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0);
    spoke.rotation.z = angle - Math.PI / 2;
    spinner.add(spoke);
  }

  const hub = markMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.46, 28), aluminum),
  );
  hub.rotation.x = Math.PI / 2;
  spinner.add(hub);

  [-0.18, 0.18].forEach((z) => {
    const disc = markMesh(
      new THREE.Mesh(
        new THREE.RingGeometry(0.3, 0.43, 48),
        new THREE.MeshStandardMaterial({
          color: 0x7e8587,
          metalness: 0.95,
          roughness: 0.22,
          side: THREE.DoubleSide,
        }),
      ),
    );
    disc.position.z = z;
    spinner.add(disc);
  });

  const caliper = markMesh(
    new THREE.Mesh(
      new RoundedBoxGeometry(0.12, 0.34, 0.16, 3, 0.035),
      brakeMat,
    ),
  );
  caliper.position.set(-0.34, 0.08, 0.22);
  assembly.add(caliper);
  assembly.userData.spinner = spinner;
  return assembly;
};

const frontWheel = createWheel("Front wheel", -2.03);
const rearWheel = createWheel("Rear wheel", 1.95);
bike.add(frontWheel, rearWheel);

const frontFender = markMesh(
  new THREE.Mesh(
    new THREE.TorusGeometry(0.98, 0.055, 12, 44, Math.PI * 0.82),
    bodyMat,
  ),
);
frontFender.position.set(0, 0, 0);
frontFender.rotation.z = Math.PI * 0.09;
frontWheel.add(frontFender);

const frameGroup = new THREE.Group();
frameGroup.name = "Cast aluminum frame";
[-0.29, 0.29].forEach((z) => {
  frameGroup.add(
    makeBeam([-1.22, 0.76, z], [-0.22, -0.45, z], 0.055, bodyMat),
    makeBeam([-1.22, 0.76, z], [0.75, 0.72, z], 0.055, bodyMat),
    makeBeam([0.75, 0.72, z], [0.43, -0.43, z], 0.055, bodyMat),
    makeBeam([0.43, -0.43, z], [-0.22, -0.45, z], 0.055, bodyMat),
  );
});
bike.add(frameGroup);

const forkGroup = new THREE.Group();
forkGroup.name = "Inverted front suspension";
[-0.24, 0.24].forEach((z) => {
  forkGroup.add(makeBeam([-2.03, -0.76, z], [-1.27, 0.94, z], 0.052, aluminum));
  const lower = makeBeam([-2.03, -0.76, z], [-1.66, 0.07, z], 0.067, darkMetal);
  forkGroup.add(lower);
});
const tripleClamp = makeBeam(
  [-1.29, 0.88, -0.34],
  [-1.29, 0.88, 0.34],
  0.065,
  darkMetal,
);
forkGroup.add(tripleClamp);
bike.add(forkGroup);

const swingarmGroup = new THREE.Group();
swingarmGroup.name = "Single-pivot swingarm";
[-0.26, 0.26].forEach((z) => {
  swingarmGroup.add(
    makeBeam([0.38, -0.4, z], [1.95, -0.78, z], 0.075, darkMetal),
  );
});
swingarmGroup.add(
  makeBeam([0.62, 0.34, 0.25], [1.38, -0.5, 0.25], 0.055, aluminum),
);
bike.add(swingarmGroup);

const batteryGroup = new THREE.Group();
batteryGroup.name = "Structural battery pack";
batteryGroup.position.set(-0.12, -0.03, 0);
const battery = markMesh(
  new THREE.Mesh(new RoundedBoxGeometry(1.48, 1.18, 0.72, 7, 0.12), darkMetal),
);
batteryGroup.add(battery);
for (let i = -3; i <= 3; i += 1) {
  const fin = markMesh(
    new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.88, 0.76), aluminum),
  );
  fin.position.x = i * 0.18;
  batteryGroup.add(fin);
}
bike.add(batteryGroup);

const motorGroup = new THREE.Group();
motorGroup.name = "Axial-flux motor";
motorGroup.position.set(0.46, -0.47, 0);
const motor = markMesh(
  new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.7, 48), darkMetal),
);
motor.rotation.x = Math.PI / 2;
motorGroup.add(motor);
const motorRing = markMesh(
  new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.045, 12, 48), bodyMat),
);
motorRing.position.z = 0.37;
motorGroup.add(motorRing);
bike.add(motorGroup);

const bodyGroup = new THREE.Group();
bodyGroup.name = "Composite body shell";
const tank = markMesh(
  new THREE.Mesh(new THREE.SphereGeometry(1, 56, 36), bodyMat),
);
tank.scale.set(1.3, 0.52, 0.62);
tank.position.set(-0.37, 0.72, 0);
bodyGroup.add(tank);
const nose = markMesh(
  new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.5, 0.72, 6, 0.12), bodyMat),
);
nose.position.set(-1.2, 0.58, 0);
nose.rotation.z = -0.2;
bodyGroup.add(nose);
const sideCover = markMesh(
  new THREE.Mesh(new RoundedBoxGeometry(0.86, 0.63, 0.82, 6, 0.1), darkMetal),
);
sideCover.position.set(0.55, 0.37, 0);
sideCover.rotation.z = -0.11;
bodyGroup.add(sideCover);
bike.add(bodyGroup);

const seatGroup = new THREE.Group();
seatGroup.name = "Adaptive rider seat";
seatGroup.position.set(0.88, 0.97, 0);
const seat = markMesh(
  new THREE.Mesh(new RoundedBoxGeometry(1.42, 0.22, 0.66, 6, 0.08), rubber),
);
seat.rotation.z = -0.055;
seatGroup.add(seat);
const tail = markMesh(
  new THREE.Mesh(new RoundedBoxGeometry(0.58, 0.18, 0.56, 5, 0.07), bodyMat),
);
tail.position.set(0.82, 0.07, 0);
tail.rotation.z = -0.12;
seatGroup.add(tail);
bike.add(seatGroup);

const handlebarGroup = new THREE.Group();
handlebarGroup.name = "Adjustable cockpit";
handlebarGroup.position.set(-1.31, 1.13, 0);
handlebarGroup.add(makeBeam([0, -0.3, 0], [0, 0, 0], 0.045, darkMetal));
const handlebar = makeBeam([0, 0, -0.62], [0, 0, 0.62], 0.038, aluminum);
handlebarGroup.add(handlebar);
[-0.65, 0.65].forEach((z) => {
  const grip = makeBeam([0, 0, z - 0.12], [0, 0, z + 0.12], 0.055, rubber);
  handlebarGroup.add(grip);
});
const dash = markMesh(
  new THREE.Mesh(new RoundedBoxGeometry(0.38, 0.2, 0.08, 4, 0.04), glassMat),
);
dash.position.set(0.03, -0.06, 0);
dash.rotation.x = -0.3;
handlebarGroup.add(dash);
bike.add(handlebarGroup);

const headlightGroup = new THREE.Group();
headlightGroup.name = "Adaptive LED headlight";
headlightGroup.position.set(-1.53, 0.55, 0);
const headlightHousing = markMesh(
  new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.52, 0.58, 5, 0.08), darkMetal),
);
headlightGroup.add(headlightHousing);
const headlight = markMesh(
  new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.34, 0.4, 4, 0.04), lightMat),
  false,
  false,
);
headlight.position.x = -0.12;
headlightGroup.add(headlight);
const headlightBeam = new THREE.PointLight(0xc8faff, 0, 8, 2);
headlightBeam.position.set(-0.6, 0, 0.18);
headlightGroup.add(headlightBeam);
bike.add(headlightGroup);

const footControlGroup = new THREE.Group();
footControlGroup.name = "Rider controls";
footControlGroup.position.set(0.35, -0.28, 0);
footControlGroup.add(makeBeam([0, 0, -0.52], [0, 0, 0.52], 0.032, aluminum));
bike.add(footControlGroup);

const speedLineMaterial = new THREE.MeshBasicMaterial({
  color: 0xc7ff00,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const speedLines = new THREE.Group();
speedLines.name = "Velocity field";
for (let i = 0; i < 16; i += 1) {
  const line = new THREE.Mesh(
    new THREE.BoxGeometry(0.7 + (i % 4) * 0.25, 0.012, 0.012),
    speedLineMaterial,
  );
  line.position.set(-3.8 + (i % 8) * 1.05, -0.9 + (i % 6) * 0.38, -0.7);
  line.userData.offset = i * 0.71;
  speedLines.add(line);
}
bike.add(speedLines);

const sensorMaterial = new THREE.MeshBasicMaterial({
  color: 0xc7ff00,
  transparent: true,
  opacity: 0,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const sensorGroup = new THREE.Group();
sensorGroup.name = "Rider systems telemetry";
[
  [-0.15, 0.02, 0.48, 0.72],
  [0.46, -0.47, 0.48, 0.46],
  [1.95, -0.78, 0.34, 0.7],
].forEach(([x, y, z, radius], index) => {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.018, 8, 56),
    sensorMaterial.clone(),
  );
  ring.position.set(x, y, z);
  ring.userData.phase = index * 0.9;
  sensorGroup.add(ring);
});
bike.add(sensorGroup);

const energyCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-0.45, 0.2, 0.52),
  new THREE.Vector3(0.2, -0.25, 0.54),
  new THREE.Vector3(0.65, -0.48, 0.52),
  new THREE.Vector3(1.95, -0.78, 0.48),
]);
const energyMaterial = new THREE.MeshBasicMaterial({
  color: 0xc7ff00,
  transparent: true,
  opacity: 0,
  toneMapped: false,
});
const energyDots = new THREE.Group();
for (let i = 0; i < 10; i += 1) {
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 8),
    energyMaterial,
  );
  dot.userData.progress = i / 10;
  energyDots.add(dot);
}
bike.add(energyDots);

const shadow = new THREE.Mesh(
  new THREE.PlaneGeometry(7.2, 3.1),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.22 }),
);
shadow.rotation.x = -Math.PI / 2;
shadow.position.set(0.15, -1.07, 0);
shadow.receiveShadow = true;
scene.add(shadow);

scene.add(new THREE.HemisphereLight(0xeef5ff, 0x101113, 1.75));
const keyLight = new THREE.SpotLight(0xffffff, 105, 30, 0.52, 0.35);
keyLight.position.set(-5, 7, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xc7ff00, 34, 18, 2);
rimLight.position.set(5, 1.5, 3.5);
scene.add(rimLight);
const fillLight = new THREE.PointLight(0x729dff, 14, 14, 2);
fillLight.position.set(0, -1, 4);
scene.add(fillLight);

const stageNote = document.createElement("div");
stageNote.className = "stage-note";
stageNote.setAttribute("aria-live", "polite");
document.body.append(stageNote);

const stages = [
  {
    name: "01 / ARRIVAL",
    detail: "ASSEMBLED R-01 / ACTIVE STANCE",
    x: 1.45,
    y: -0.02,
    scale: 0.94,
    rx: 0.015,
    ry: -0.28,
    rz: 0,
    camera: 9.5,
  },
  {
    name: "02 / FULL CURRENT",
    detail: "TORQUE RUN / ACTIVE AERO / 165 HP",
    x: 1.08,
    y: -0.08,
    scale: 1.02,
    rx: 0.02,
    ry: -0.5,
    rz: 0.055,
    camera: 9.35,
  },
  {
    name: "03 / CORE ENGINEERING",
    detail: "STRUCTURE / PACK / MOTOR / CHASSIS",
    x: 1.48,
    y: -0.03,
    scale: 0.9,
    rx: 0.02,
    ry: -0.3,
    rz: 0,
    camera: 9.8,
  },
  {
    name: "04 / LIVE CONFIGURATION",
    detail: "PAINT + RIDER TRIANGLE / REAL-TIME",
    x: 1.55,
    y: -0.04,
    scale: 0.96,
    rx: 0.01,
    ry: -0.56,
    rz: 0,
    camera: 9.5,
  },
  {
    name: "05 / RIDER SYSTEMS",
    detail: "TRACTION / REGEN / THERMAL LOOP",
    x: 1.45,
    y: -0.02,
    scale: 0.93,
    rx: 0.03,
    ry: -0.78,
    rz: -0.025,
    camera: 9.6,
  },
  {
    name: "06 / FOUNDERS SERIES",
    detail: "LIGHTS ARMED / PRIVATE PREVIEW",
    x: 1.52,
    y: -0.08,
    scale: 0.9,
    rx: 0.02,
    ry: -1.08,
    rz: 0,
    camera: 9.8,
  },
];

const rideModes = {
  street: {
    seatX: 0,
    seatY: 0,
    seatR: 0,
    barX: 0,
    barY: 0,
    footX: 0,
    footY: 0,
    pitch: 0,
    label: "NEUTRAL BAR / BALANCED SEAT / ROAD DAMPING",
  },
  track: {
    seatX: 0.12,
    seatY: 0.14,
    seatR: -0.035,
    barX: -0.13,
    barY: -0.2,
    footX: 0.13,
    footY: 0.1,
    pitch: 0.035,
    label: "LOW BAR / RAISED SEAT / REAR-SET CONTROLS",
  },
  tour: {
    seatX: -0.08,
    seatY: -0.08,
    seatR: 0.025,
    barX: 0.14,
    barY: 0.18,
    footX: -0.08,
    footY: -0.06,
    pitch: -0.018,
    label: "HIGH BAR / RELAXED SEAT / FORWARD CONTROLS",
  },
};

let rideMode = "street";
const rideState = { ...rideModes.street };
const targetColor = new THREE.Color(0xc7ff00);
const displayedAccent = new THREE.Color(0xc7ff00);
let interactionMessage = "";
let interactionMessageUntil = 0;

document.querySelectorAll(".swatches button").forEach((button, index) => {
  button.addEventListener("click", () => {
    targetColor.set(`#${button.dataset.color}`);
    document.querySelectorAll(".swatches button").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    document.querySelector("#paint-readout").textContent =
      `${button.dataset.name.toUpperCase()} / TRANSITIONING`;
    interactionMessage = `${button.dataset.name.toUpperCase()} / PAINT MORPH`;
    interactionMessageUntil = performance.now() + 1600;
    voltAudio.cueAction("paint", {
      variant: index,
      color: button.dataset.color,
    });
    window.setTimeout(() => {
      document.querySelector("#paint-readout").textContent =
        `${button.dataset.name.toUpperCase()} / ACTIVE`;
    }, 900);
  });
});

document.querySelectorAll(".choices button").forEach((button) => {
  button.addEventListener("click", () => {
    rideMode = button.dataset.mode;
    document.querySelectorAll(".choices button").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    document.querySelector("#ride-readout").textContent =
      rideModes[rideMode].label;
    interactionMessage = `${rideMode.toUpperCase()} / ERGONOMICS SHIFT`;
    interactionMessageUntil = performance.now() + 1800;
    voltAudio.cueAction(`ride-${rideMode}`);
  });
});

const stageElements = [...document.querySelectorAll(".story-section")].sort(
  (a, b) => Number(a.dataset.stage) - Number(b.dataset.stage),
);
let activeStage = 0;
let stageCursor = 0;
let dragY = 0;
let dragX = 0;
let previousTime = performance.now();
let wheelSpin = 0;
let soundedStage = -1;

const findActiveStage = () => {
  const marker = innerHeight * 0.46;
  let closest = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  stageElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    const distance =
      marker < rect.top
        ? rect.top - marker
        : marker > rect.bottom
          ? marker - rect.bottom
          : 0;
    if (distance < closestDistance) {
      closestDistance = distance;
      closest = Number(element.dataset.stage);
    }
  });
  return closest;
};

const sampleStage = (property) => {
  const low = Math.floor(stageCursor);
  const high = Math.min(stages.length - 1, low + 1);
  const amount = THREE.MathUtils.smootherstep(stageCursor - low, 0, 1);
  return THREE.MathUtils.lerp(
    stages[low][property],
    stages[high][property],
    amount,
  );
};
const stageWeight = (index) =>
  THREE.MathUtils.smoothstep(1 - Math.abs(stageCursor - index), 0, 1);
const damp = (value, target, lambda, delta) =>
  THREE.MathUtils.damp(value, target, lambda, delta);
const dampVector = (vector, x, y, z, lambda, delta) => {
  vector.x = damp(vector.x, x, lambda, delta);
  vector.y = damp(vector.y, y, lambda, delta);
  vector.z = damp(vector.z, z, lambda, delta);
};

addEventListener("pointermove", (event) => {
  if (document.body.classList.contains("is-dragging")) {
    dragY += event.movementX * 0.006;
    dragX = THREE.MathUtils.clamp(dragX + event.movementY * 0.003, -0.28, 0.28);
  }
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

function loop(now) {
  const delta = Math.min(0.05, (now - previousTime) / 1000);
  previousTime = now;
  activeStage = findActiveStage();
  if (activeStage !== soundedStage) {
    soundedStage = activeStage;
    voltAudio.cueScene(activeStage);
  }
  stageCursor = damp(
    stageCursor,
    activeStage,
    reducedMotion.matches ? 14 : 4.2,
    delta,
  );

  const performanceWeight = stageWeight(1);
  const engineeringWeight = stageWeight(2);
  const configureWeight = stageWeight(3);
  const systemsWeight = stageWeight(4);
  const reserveWeight = stageWeight(5);
  const motionScale = reducedMotion.matches ? 0.2 : 1;
  const mobile = innerWidth < 760;

  Object.keys(rideState).forEach((property) => {
    if (property !== "label") {
      rideState[property] = damp(
        rideState[property],
        rideModes[rideMode][property],
        5.5,
        delta,
      );
    }
  });

  const responsiveX = mobile ? sampleStage("x") * 0.34 : sampleStage("x");
  const responsiveScale = sampleStage("scale") * (mobile ? 0.68 : 1);
  dampVector(
    bike.position,
    responsiveX,
    sampleStage("y") + Math.sin(now * 0.0012) * 0.018 * motionScale,
    0,
    4.6,
    delta,
  );
  const turntable =
    Math.sin(now * 0.00042) * 0.12 * configureWeight * motionScale;
  bike.rotation.x = damp(
    bike.rotation.x,
    sampleStage("rx") + dragX,
    4.2,
    delta,
  );
  bike.rotation.y = damp(
    bike.rotation.y,
    sampleStage("ry") + dragY + turntable,
    4.2,
    delta,
  );
  bike.rotation.z = damp(
    bike.rotation.z,
    sampleStage("rz") + rideState.pitch,
    4.2,
    delta,
  );
  const nextScale = damp(bike.scale.x, responsiveScale, 4.2, delta);
  bike.scale.setScalar(nextScale);
  camera.position.z = damp(camera.position.z, sampleStage("camera"), 4, delta);

  const explode = engineeringWeight;
  dampVector(frontWheel.position, -2.03 - explode * 0.58, -0.78, 0, 5, delta);
  dampVector(rearWheel.position, 1.95 + explode * 0.58, -0.78, 0, 5, delta);
  dampVector(batteryGroup.position, -0.12, -0.03 - explode * 0.68, 0, 5, delta);
  dampVector(
    motorGroup.position,
    0.46 + explode * 0.24,
    -0.47 - explode * 0.18,
    explode * 0.58,
    5,
    delta,
  );
  dampVector(bodyGroup.position, 0, explode * 0.76, 0, 5, delta);
  dampVector(frameGroup.position, 0, 0, -explode * 0.42, 5, delta);
  dampVector(forkGroup.position, -explode * 0.24, explode * 0.15, 0, 5, delta);
  dampVector(swingarmGroup.position, explode * 0.24, 0, 0, 5, delta);
  dampVector(
    seatGroup.position,
    0.88 + rideState.seatX + explode * 0.45,
    0.97 + rideState.seatY + explode * 0.34,
    0,
    5.5,
    delta,
  );
  seatGroup.rotation.z = damp(
    seatGroup.rotation.z,
    rideState.seatR,
    5.5,
    delta,
  );
  dampVector(
    handlebarGroup.position,
    -1.31 + rideState.barX - explode * 0.34,
    1.13 + rideState.barY + explode * 0.36,
    0,
    5.5,
    delta,
  );
  dampVector(
    footControlGroup.position,
    0.35 + rideState.footX,
    -0.28 + rideState.footY,
    0,
    5.5,
    delta,
  );
  dampVector(
    headlightGroup.position,
    -1.53 - explode * 0.3,
    0.55 + explode * 0.25,
    0,
    5,
    delta,
  );

  const wheelVelocity = (0.24 + performanceWeight * 5.8) * motionScale;
  wheelSpin -= delta * wheelVelocity;
  frontWheel.userData.spinner.rotation.z = wheelSpin;
  rearWheel.userData.spinner.rotation.z = wheelSpin * 1.04;
  speedLineMaterial.opacity = damp(
    speedLineMaterial.opacity,
    performanceWeight * 0.68,
    7,
    delta,
  );
  speedLines.children.forEach((line) => {
    line.position.x = ((now * 0.0028 + line.userData.offset) % 8.4) - 4.2;
  });

  bodyMat.color.lerp(targetColor, 1 - Math.exp(-delta * 3.4));
  displayedAccent.lerp(targetColor, 1 - Math.exp(-delta * 3.4));
  bodyMat.emissive.copy(displayedAccent).multiplyScalar(0.055);
  speedLineMaterial.color.copy(displayedAccent);
  sensorGroup.children.forEach((ring) => {
    ring.material.color.copy(displayedAccent);
    ring.material.opacity = systemsWeight * 0.7;
    const pulse =
      1 +
      Math.sin(now * 0.0035 + ring.userData.phase) *
        0.18 *
        motionScale *
        systemsWeight;
    ring.scale.setScalar(pulse);
    ring.rotation.z += delta * 0.35 * systemsWeight * motionScale;
  });
  energyMaterial.color.copy(displayedAccent);
  energyMaterial.opacity = systemsWeight * 0.95;
  energyDots.children.forEach((dot) => {
    const progress = (dot.userData.progress + now * 0.00016 * motionScale) % 1;
    dot.position.copy(energyCurve.getPoint(progress));
    dot.scale.setScalar(0.72 + Math.sin(progress * Math.PI) * 0.5);
  });

  rimLight.color.copy(displayedAccent);
  rimLight.intensity =
    30 +
    performanceWeight * 22 +
    systemsWeight * 16 +
    Math.sin(now * 0.002) * 4 * motionScale;
  keyLight.position.x = -5 + Math.sin(now * 0.00045) * 2 * motionScale;
  headlightBeam.intensity = damp(
    headlightBeam.intensity,
    reserveWeight * 32 + performanceWeight * 8,
    6,
    delta,
  );
  lightMat.emissiveIntensity = 2.2 + reserveWeight * 5;
  renderer.toneMappingExposure = 1.08 + reserveWeight * 0.12;

  const stage = stages[activeStage];
  stageNote.innerHTML = `<b>${stage.name}</b><span>${now < interactionMessageUntil ? interactionMessage : stage.detail}</span>`;
  stageNote.style.setProperty(
    "--stage-color",
    `#${bodyMat.color.getHexString()}`,
  );
  document.documentElement.style.setProperty(
    "--active-paint",
    `#${bodyMat.color.getHexString()}`,
  );
  shadow.position.x = bike.position.x;
  renderer.domElement.style.opacity = String(
    mobile ? 0.68 : 0.98 - reserveWeight * 0.04,
  );

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
