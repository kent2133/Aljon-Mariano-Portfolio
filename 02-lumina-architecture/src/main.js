import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { setupExperience } from "./experience.js";
import "./style.css";

document.querySelector("#app").innerHTML = `
  <main id="top">
    <nav class="site-nav" aria-label="Primary navigation">
      <a class="brand" href="#home" aria-label="Lumina Architects, return home">
        <b>LUMINA<br>ARCHITECTS</b>
      </a>
      <div class="nav-links" aria-label="Page shortcuts">
        <a href="#project">Project</a>
        <a href="#moments">Moments</a>
        <a href="#work">Work</a>
        <a href="#performance">Performance</a>
        <a href="#contact">Contact</a>
      </div>
      <a class="nav-cta" href="#contact">Start a project ↗</a>
    </nav>

    <section class="hero" id="home" data-scene="hero">
      <div class="hero-copy">
        <span class="tag">RESIDENTIAL / MANILA / 2026</span>
        <h1>COURTYARD<br><i>HOUSE</i></h1>
      </div>
      <div class="meta copy-surface copy-surface--light">
        <p>A porous family home where monsoon air, filtered light, and daily rituals move freely through a planted center.</p>
        <span>14.5995° N<br>120.9842° E</span>
      </div>
      <div class="hint">DRAG TO ORBIT / USE THE SHORTCUTS ↑</div>
    </section>

    <section class="project" id="project" data-scene="brief">
      <div class="copy-panel copy-panel--dark">
        <header>
          <span>01 / THE BRIEF</span>
          <h2>Less house.<br>More <em>habitat.</em></h2>
        </header>
        <div class="columns">
          <p>The clients asked for privacy without enclosure: a calm refuge for three generations on a dense urban lot.</p>
          <p>Rooms gather around a shaded garden. Deep eaves, operable screens, and cross-ventilation reduce cooling demand while keeping the house open to weather.</p>
        </div>
        <div class="facts">
          <div><b>420 m²</b><span>GROSS FLOOR AREA</span></div>
          <div><b>38%</b><span>PLANTED SITE AREA</span></div>
          <div><b>2026</b><span>EXPECTED COMPLETION</span></div>
        </div>
      </div>
    </section>

    <section class="gallery" id="moments" data-scene="gallery">
      <div class="gallery-intro copy-surface copy-surface--light">
        <span>02 / LIVING WITH WEATHER</span>
        <h2>Light is another room.</h2>
        <p>Operable timber fins tune privacy and shade from sunrise to dusk. The courtyard stays present without asking the interiors to surrender calm.</p>
      </div>
      <div class="photo p1"><span>MORNING COURT / 07:14</span></div>
      <div class="photo p2"><span>SCREEN STUDY / DETAIL 04</span></div>
    </section>

    <section class="work" id="work" data-scene="work">
      <div class="work-panel">
        <span>03 / SELECTED WORK / 2022—26</span>
        <p class="work-intro">Three studies in climate, material, and collective life. The model separates into its architectural layers as you enter this index.</p>
        <article><small>01</small><h3>Courtyard House</h3><p>Manila / Residential</p></article>
        <article><small>02</small><h3>Common Ground</h3><p>Quezon City / Workplace</p></article>
        <article><small>03</small><h3>Tidal Library</h3><p>La Union / Civic</p></article>
      </div>
    </section>

    <footer id="contact" data-scene="contact">
      <div class="footer-copy">
        <span>05 / BEGIN A CONVERSATION</span>
        <p>Have a place<br>in mind?</p>
        <a href="mailto:studio@example.com">studio@lumina.archi ↗</a>
      </div>
    </footer>
  </main>
`;

const siteAudio = setupExperience({
  tone: 46,
  accent: "#beff28",
  target: "#contact",
  eyebrow: "04 / PASSIVE PERFORMANCE",
  title: "Comfort begins before the switch.",
  intro:
    "The house treats shade, air, water, and planting as architectural materials—not equipment added afterward. Follow the moving air paths through the courtyard model.",
  items: [
    [
      "Cross ventilation",
      "Opposing openings and the central court establish a reliable pressure path.",
    ],
    [
      "Deep shade",
      "Layered eaves and operable screens reduce direct solar gain across the hottest hours.",
    ],
    [
      "Rain strategy",
      "Roof water feeds planted ground and a concealed reuse tank for dry weeks.",
    ],
  ],
});

const performanceSection = document.querySelector(".experience-context");
if (performanceSection) {
  performanceSection.id = "performance";
  performanceSection.dataset.scene = "performance";
}

const sceneStatus = document.createElement("aside");
sceneStatus.className = "scene-status";
sceneStatus.setAttribute("aria-live", "polite");
sceneStatus.innerHTML = `
  <span class="scene-status__index">MODEL / 01</span>
  <strong>Courtyard in context</strong>
  <p>The complete house turns slowly in morning light.</p>
`;
document.body.append(sceneStatus);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xd8d6ce, 0.024);

const camera = new THREE.PerspectiveCamera(
  30,
  innerWidth / innerHeight,
  0.1,
  100,
);
camera.position.set(7.4, 5.1, 10.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.03;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.setAttribute("aria-hidden", "true");
document.body.prepend(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = environment;
pmrem.dispose();

const materials = {
  concrete: new THREE.MeshStandardMaterial({
    color: 0xc8c5bc,
    roughness: 0.82,
    metalness: 0.02,
  }),
  concreteDark: new THREE.MeshStandardMaterial({
    color: 0x77766f,
    roughness: 0.9,
  }),
  wood: new THREE.MeshStandardMaterial({
    color: 0x97643e,
    roughness: 0.58,
  }),
  woodDark: new THREE.MeshStandardMaterial({
    color: 0x4c3324,
    roughness: 0.7,
  }),
  glass: new THREE.MeshPhysicalMaterial({
    color: 0x9bbfc0,
    transmission: 0.76,
    transparent: true,
    opacity: 0.62,
    roughness: 0.08,
    metalness: 0.04,
    thickness: 0.08,
  }),
  frame: new THREE.MeshStandardMaterial({
    color: 0x292b29,
    roughness: 0.4,
    metalness: 0.42,
  }),
  water: new THREE.MeshPhysicalMaterial({
    color: 0x4d8587,
    transmission: 0.5,
    transparent: true,
    opacity: 0.78,
    roughness: 0.12,
    metalness: 0.12,
  }),
  leaf: new THREE.MeshStandardMaterial({
    color: 0x526b48,
    roughness: 0.95,
  }),
  interior: new THREE.MeshStandardMaterial({
    color: 0xffd6a0,
    emissive: 0xff9d45,
    emissiveIntensity: 0.28,
    roughness: 0.75,
  }),
};

const house = new THREE.Group();
scene.add(house);
const parts = [];
const facadeParts = [];
const leafParts = [];

const trackPart = (object, category, sequence, spawn = [0, 5, 0]) => {
  object.userData.category = category;
  object.userData.sequence = sequence;
  object.userData.spawn = new THREE.Vector3(...spawn);
  object.userData.basePosition = object.position.clone();
  object.userData.baseRotation = object.rotation.clone();
  object.userData.baseScale = object.scale.clone();
  parts.push(object);
  return object;
};

const box = ({
  size,
  position,
  material = materials.concrete,
  category = "ground",
  sequence = 0,
  spawn,
  rotation,
}) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  house.add(mesh);
  return trackPart(mesh, category, sequence, spawn);
};

// Foundation and ground plane
box({
  size: [7.4, 0.24, 5.1],
  position: [0, 0, 0],
  material: materials.concreteDark,
  category: "foundation",
  sequence: 0,
  spawn: [0, -2.5, 0],
});
box({
  size: [6.85, 0.12, 4.55],
  position: [0, 0.18, 0],
  category: "foundation",
  sequence: 1,
  spawn: [0, -1.8, 0],
});

// Solid shells around the planted center
box({
  size: [1.55, 2.45, 3.75],
  position: [-2.45, 1.42, -0.18],
  category: "ground",
  sequence: 3,
  spawn: [-4.5, 0.2, 0],
});
box({
  size: [4.35, 2.15, 0.22],
  position: [0.38, 1.28, -2.02],
  category: "ground",
  sequence: 4,
  spawn: [0, 0, -4.5],
});
box({
  size: [0.2, 1.72, 2.35],
  position: [2.62, 1.06, -0.83],
  category: "ground",
  sequence: 5,
  spawn: [4.2, 0, 0],
});
box({
  size: [1.3, 1.5, 0.2],
  position: [-1.08, 1.0, 1.9],
  category: "ground",
  sequence: 6,
  spawn: [0, 0, 4],
});

// Glazed living pavilion and its dark mullions
[-1.42, -0.75, -0.08, 0.59].forEach((z, index) => {
  box({
    size: [0.055, 1.48, 0.57],
    position: [2.5, 1.08, z],
    material: materials.glass,
    category: "glazing",
    sequence: 7 + index,
    spawn: [3.8, 1.4 + index * 0.25, 0],
  });
});
[-1.72, -0.85, 0.02, 0.89].forEach((z, index) => {
  box({
    size: [0.065, 1.65, 0.06],
    position: [2.53, 1.08, z],
    material: materials.frame,
    category: "glazing",
    sequence: 7 + index,
    spawn: [3.8, 1.8, 0],
  });
});
box({
  size: [3.15, 1.55, 0.08],
  position: [0.95, 1.08, -1.86],
  material: materials.glass,
  category: "glazing",
  sequence: 8,
  spawn: [0, 2.6, -3.8],
});

// Upper level and layered roofs
box({
  size: [2.38, 1.55, 2.7],
  position: [-1.45, 2.92, -0.42],
  category: "upper",
  sequence: 11,
  spawn: [-2.8, 5, 0],
});
box({
  size: [0.12, 1.08, 1.35],
  position: [-0.21, 2.88, -0.42],
  material: materials.glass,
  category: "upper",
  sequence: 12,
  spawn: [0, 5.5, 0],
});
box({
  size: [2.75, 0.18, 3.05],
  position: [-1.35, 3.78, -0.42],
  category: "roof",
  sequence: 14,
  spawn: [0, 6.4, 0],
});
box({
  size: [3.72, 0.16, 3.65],
  position: [1.2, 2.13, -0.18],
  category: "roof",
  sequence: 15,
  spawn: [2.2, 6.1, 0],
});

// Columns, stair, and warm interior elements
[-0.25, 1.15, 2.5].forEach((x, index) => {
  box({
    size: [0.12, 1.82, 0.12],
    position: [x, 1.18, 1.52],
    material: materials.frame,
    category: "details",
    sequence: 12 + index,
    spawn: [0, 4.5, 1.4],
  });
});
for (let i = 0; i < 6; i += 1) {
  box({
    size: [1.32, 0.12, 0.34],
    position: [-0.95 + i * 0.24, 0.38 + i * 0.2, -0.05],
    material: materials.frame,
    category: "details",
    sequence: 12 + i * 0.25,
    spawn: [0, 2.8 + i * 0.35, 0],
  });
}
box({
  size: [2.35, 0.04, 1.35],
  position: [0.85, 0.27, 0.63],
  material: materials.water,
  category: "landscape",
  sequence: 18,
  spawn: [0, -1.2, 0],
});
const interiorPanels = [
  box({
    size: [2.6, 0.08, 0.9],
    position: [1.05, 1.42, -1.73],
    material: materials.interior,
    category: "details",
    sequence: 13,
    spawn: [0, 4, -2],
  }),
  box({
    size: [0.07, 1.1, 1.35],
    position: [2.34, 1.08, -0.4],
    material: materials.interior,
    category: "details",
    sequence: 13.2,
    spawn: [3.5, 2, 0],
  }),
];
interiorPanels.forEach((panel) => {
  panel.castShadow = false;
});

// Operable timber facade
for (let i = 0; i < 11; i += 1) {
  const screen = box({
    size: [0.11, 2.15, 0.16],
    position: [-0.12 + i * 0.245, 1.35, 1.93],
    material: materials.wood,
    category: "facade",
    sequence: 15.5 + i * 0.17,
    spawn: [0, 5.5 + i * 0.12, 2.2],
  });
  screen.userData.screenIndex = i;
  facadeParts.push(screen);
}

// Deterministic courtyard tree
const trunk = new THREE.Mesh(
  new THREE.CylinderGeometry(0.1, 0.17, 2.05, 12),
  materials.woodDark,
);
trunk.position.set(0.55, 1.3, 0.82);
trunk.castShadow = true;
house.add(trunk);
trackPart(trunk, "landscape", 17, [0, -1.5, 0]);

const leafLayout = [
  [-0.2, 2.22, -0.04, 0.66],
  [0.22, 2.38, 0.03, 0.74],
  [-0.06, 2.72, 0.16, 0.67],
  [0.31, 2.77, -0.18, 0.58],
  [-0.35, 2.61, 0.12, 0.55],
];
leafLayout.forEach(([x, y, z, radius], index) => {
  const leaf = new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius, 2),
    materials.leaf,
  );
  leaf.position.set(0.55 + x, y, 0.82 + z);
  leaf.castShadow = true;
  house.add(leaf);
  trackPart(leaf, "landscape", 17.4 + index * 0.16, [0, 3.8, 0]);
  leafParts.push(leaf);
});

// Animated air paths become visible in the performance section.
const airflowGroup = new THREE.Group();
house.add(airflowGroup);
const airflowCurves = [
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.6, 1.0, 0.75),
    new THREE.Vector3(-1.2, 1.25, 0.5),
    new THREE.Vector3(0.65, 1.35, 0.7),
    new THREE.Vector3(3.55, 1.25, 0.3),
  ]),
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.4, 1.65, -0.65),
    new THREE.Vector3(-1.0, 1.8, -0.5),
    new THREE.Vector3(0.72, 1.72, -0.18),
    new THREE.Vector3(3.45, 1.55, -0.62),
  ]),
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.9, 0.7, 1.5),
    new THREE.Vector3(-0.8, 0.94, 1.1),
    new THREE.Vector3(0.55, 1.18, 0.82),
    new THREE.Vector3(3.1, 1.02, 1.25),
  ]),
];
const airflowMaterial = new THREE.MeshBasicMaterial({
  color: 0xbfff31,
  transparent: true,
  opacity: 0.52,
  depthWrite: false,
});
const airflowParticles = [];
airflowCurves.forEach((curve, index) => {
  const tube = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 72, 0.018, 7, false),
    airflowMaterial,
  );
  airflowGroup.add(tube);
  for (let i = 0; i < 4; i += 1) {
    const particle = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 12),
      new THREE.MeshBasicMaterial({ color: index === 1 ? 0x8fe5ff : 0xbeff28 }),
    );
    particle.userData.curve = curve;
    particle.userData.offset = i / 4 + index * 0.13;
    airflowGroup.add(particle);
    airflowParticles.push(particle);
  }
});
airflowGroup.visible = false;

const rainGroup = new THREE.Group();
house.add(rainGroup);
const rainDrops = [];
for (let i = 0; i < 22; i += 1) {
  const drop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.009, 0.009, 0.25, 5),
    new THREE.MeshBasicMaterial({
      color: 0x91d8e8,
      transparent: true,
      opacity: 0.72,
    }),
  );
  drop.userData.seed = (i * 0.61803398875) % 1;
  drop.position.set(-0.9 + (i % 8) * 0.28, 2.2, 1.25 + (i % 4) * 0.2);
  rainGroup.add(drop);
  rainDrops.push(drop);
}
rainGroup.visible = false;

const shadowPlane = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 24),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.18 }),
);
shadowPlane.rotation.x = -Math.PI / 2;
shadowPlane.position.y = -0.14;
shadowPlane.receiveShadow = true;
scene.add(shadowPlane);

const hemisphere = new THREE.HemisphereLight(0xfaf8ef, 0x53544f, 1.9);
scene.add(hemisphere);

const sun = new THREE.DirectionalLight(0xffe8c4, 4.2);
sun.position.set(-5, 9, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -8;
sun.shadow.camera.right = 8;
sun.shadow.camera.top = 8;
sun.shadow.camera.bottom = -8;
sun.shadow.bias = -0.00035;
scene.add(sun);

const fill = new THREE.DirectionalLight(0xa9c8d8, 1.2);
fill.position.set(6, 3, -5);
scene.add(fill);

const courtyardGlow = new THREE.PointLight(0xffaa5e, 0.5, 8, 2);
courtyardGlow.position.set(0.8, 1.4, -0.3);
house.add(courtyardGlow);

const STAGES = {
  hero: {
    index: "MODEL / 01",
    title: "Courtyard in context",
    text: "The complete house turns slowly in morning light.",
    camera: [7.4, 5.05, 10.5],
    look: [0, 1.35, 0],
    position: [2.05, -0.15, 0],
    scale: 0.94,
    rotation: -0.5,
    exposure: 1.05,
    sun: 4.3,
    hemi: 1.9,
  },
  brief: {
    index: "MODEL / 02",
    title: "Built in sequence",
    text: "Foundation, shells, glazing, roof, screens, and landscape settle into place.",
    camera: [8.4, 5.35, 11.4],
    look: [0, 1.35, 0],
    position: [2.1, -0.24, 0],
    scale: 0.86,
    rotation: -0.72,
    exposure: 0.88,
    sun: 3.2,
    hemi: 1.45,
  },
  gallery: {
    index: "MODEL / 03",
    title: "A facade that breathes",
    text: "Timber fins open in a wave as daylight travels around the courtyard.",
    camera: [7.8, 4.35, 10.1],
    look: [0.15, 1.25, 0.35],
    position: [1.75, -0.15, 0],
    scale: 0.95,
    rotation: -0.2,
    exposure: 1.12,
    sun: 4.8,
    hemi: 1.8,
  },
  work: {
    index: "MODEL / 04",
    title: "An exploded floor stack",
    text: "Structure, rooms, roof, screens, and garden separate to reveal their relationships.",
    camera: [9.1, 6.1, 12.8],
    look: [0, 2.0, 0],
    position: [2.2, -0.52, 0],
    scale: 0.76,
    rotation: -0.84,
    exposure: 1.0,
    sun: 3.9,
    hemi: 1.65,
  },
  performance: {
    index: "MODEL / 05",
    title: "Passive systems in motion",
    text: "Air crosses the plan while rain is guided from roof edge to planted court.",
    camera: [7.75, 4.65, 10.35],
    look: [0, 1.35, 0.2],
    position: [2.05, -0.15, 0],
    scale: 0.9,
    rotation: -0.38,
    exposure: 0.94,
    sun: 2.8,
    hemi: 1.45,
  },
  contact: {
    index: "MODEL / 06",
    title: "Evening occupation",
    text: "The house closes gently around a warm, inhabited courtyard.",
    camera: [7.65, 4.7, 10.65],
    look: [0, 1.3, 0],
    position: [2.1, -0.2, 0],
    scale: 0.92,
    rotation: -0.58,
    exposure: 0.72,
    sun: 0.55,
    hemi: 0.75,
  },
};

const sectionElements = [...document.querySelectorAll("[data-scene]")];
const cameraTarget = new THREE.Vector3(0, 1.35, 0);
const desiredCamera = new THREE.Vector3();
const desiredLook = new THREE.Vector3();
const desiredHousePosition = new THREE.Vector3();
const desiredScale = new THREE.Vector3();
const desiredPartPosition = new THREE.Vector3();
const desiredPartScale = new THREE.Vector3();
const desiredPartRotation = new THREE.Euler();

let activeScene = "hero";
let stageStartedAt = performance.now();
let dragRotationY = 0;
let dragRotationX = 0;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => {
  const x = clamp01(value);
  return x * x * (3 - 2 * x);
};

function setActiveScene(nextScene, time) {
  if (!STAGES[nextScene] || nextScene === activeScene) return;
  activeScene = nextScene;
  stageStartedAt = time;
  siteAudio.setScene(nextScene);
  document.body.dataset.scene = nextScene;
  const stage = STAGES[nextScene];
  sceneStatus.querySelector("span").textContent = stage.index;
  sceneStatus.querySelector("strong").textContent = stage.title;
  sceneStatus.querySelector("p").textContent = stage.text;
  document.querySelectorAll(".nav-links a").forEach((link) => {
    const target = link.getAttribute("href")?.slice(1);
    const sceneForTarget = {
      project: "brief",
      moments: "gallery",
      work: "work",
      performance: "performance",
      contact: "contact",
    };
    const current = sceneForTarget[target] === nextScene;
    if (current) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function detectActiveScene(time) {
  const focusLine = innerHeight * 0.46;
  let nearest = sectionElements[0];
  let nearestDistance = Number.POSITIVE_INFINITY;
  sectionElements.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionFocus = Math.max(rect.top, Math.min(focusLine, rect.bottom));
    const distance = Math.abs(sectionFocus - focusLine);
    if (distance < nearestDistance) {
      nearest = section;
      nearestDistance = distance;
    }
  });
  setActiveScene(nearest?.dataset.scene || "hero", time);
}

function partOffset(part, elapsed, time) {
  const category = part.userData.category;
  const base = part.userData.basePosition;
  desiredPartPosition.copy(base);
  desiredPartScale.copy(part.userData.baseScale);
  desiredPartRotation.copy(part.userData.baseRotation);

  if (activeScene === "brief") {
    const start = 0.18 + part.userData.sequence * 0.105;
    const progress = ease((elapsed - start) / 0.78);
    desiredPartPosition.addScaledVector(part.userData.spawn, 1 - progress);
    desiredPartScale.multiplyScalar(0.12 + progress * 0.88);
  }

  if (activeScene === "gallery") {
    if (category === "facade") {
      const wave = Math.sin(time * 0.0015 - part.userData.screenIndex * 0.34);
      desiredPartRotation.y += -0.72 + wave * 0.16;
      desiredPartPosition.z += 0.08 + Math.abs(wave) * 0.06;
    }
    if (category === "landscape" && leafParts.includes(part)) {
      const sway = Math.sin(time * 0.0011 + part.userData.sequence);
      desiredPartRotation.z += sway * 0.045;
      desiredPartPosition.x += sway * 0.025;
    }
  }

  if (activeScene === "work") {
    const offsets = {
      foundation: [0, -0.75, 0],
      ground: [-0.4, 0.15, 0],
      glazing: [0.5, 0.52, 0],
      upper: [-0.15, 1.25, 0],
      roof: [0.15, 2.15, 0],
      facade: [1.65, 0.5, 1.1],
      details: [0.25, 0.76, -0.18],
      landscape: [-1.3, 0.22, 0.95],
    };
    const offset = offsets[category] || [0, 0, 0];
    const settle = ease(elapsed / 1.4);
    desiredPartPosition.x += offset[0] * settle;
    desiredPartPosition.y += offset[1] * settle;
    desiredPartPosition.z += offset[2] * settle;
  }

  if (activeScene === "performance" && category === "facade") {
    const open =
      0.42 + Math.sin(time * 0.0012 + part.userData.screenIndex * 0.28) * 0.22;
    desiredPartRotation.y -= open;
  }

  if (activeScene === "contact" && category === "facade") {
    desiredPartRotation.y -= 0.12;
  }
}

function updateEnvironmentalEffects(time, elapsed) {
  const stage = STAGES[activeScene];
  renderer.toneMappingExposure +=
    (stage.exposure - renderer.toneMappingExposure) * 0.035;
  sun.intensity += (stage.sun - sun.intensity) * 0.035;
  hemisphere.intensity += (stage.hemi - hemisphere.intensity) * 0.035;

  if (activeScene === "gallery") {
    const day = time * 0.00022;
    sun.position.set(
      Math.sin(day) * 8,
      5.5 + Math.cos(day) * 4.2,
      Math.cos(day) * 7,
    );
    sun.color.setHSL(0.09 + Math.sin(day) * 0.015, 0.72, 0.76);
  } else if (activeScene === "contact") {
    sun.position.lerp(new THREE.Vector3(-8, 1.4, 3.5), 0.025);
    sun.color.lerp(new THREE.Color(0xff8655), 0.025);
  } else {
    sun.position.lerp(new THREE.Vector3(-5, 9, 6), 0.025);
    sun.color.lerp(new THREE.Color(0xffe8c4), 0.025);
  }

  const targetInterior =
    activeScene === "contact" ? 2.5 : activeScene === "gallery" ? 0.55 : 0.28;
  materials.interior.emissiveIntensity +=
    (targetInterior - materials.interior.emissiveIntensity) * 0.04;
  courtyardGlow.intensity +=
    ((activeScene === "contact" ? 4.2 : 0.5) - courtyardGlow.intensity) * 0.04;

  airflowGroup.visible = activeScene === "performance";
  rainGroup.visible = activeScene === "performance";
  if (airflowGroup.visible) {
    airflowMaterial.opacity = 0.36 + Math.sin(time * 0.002) * 0.12;
    airflowParticles.forEach((particle) => {
      const progress = (time * 0.00014 + particle.userData.offset) % 1;
      particle.position.copy(particle.userData.curve.getPointAt(progress));
      const pulse = 0.7 + Math.sin(time * 0.006 + progress * 14) * 0.25;
      particle.scale.setScalar(pulse);
    });
    rainDrops.forEach((drop) => {
      const progress = (time * 0.0003 + drop.userData.seed) % 1;
      drop.position.y = 3.15 - progress * 2.85;
    });
  }

  materials.glass.opacity = 0.58 + Math.sin(time * 0.0008) * 0.05;
  const statusVisible = activeScene !== "contact" || elapsed < 6;
  sceneStatus.classList.toggle("is-muted", !statusVisible);
}

addEventListener("pointermove", (event) => {
  if (!document.body.classList.contains("is-dragging")) return;
  dragRotationY += event.movementX * 0.0055;
  dragRotationX = THREE.MathUtils.clamp(
    dragRotationX + event.movementY * 0.0025,
    -0.24,
    0.22,
  );
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

function render(time = 0) {
  detectActiveScene(time);
  const stage = STAGES[activeScene];
  const elapsed = Math.max(0, (time - stageStartedAt) / 1000);
  const mobile = innerWidth < 760;

  desiredCamera.fromArray(stage.camera);
  if (mobile) {
    desiredCamera.x += 2.2;
    desiredCamera.z += 2.1;
  }
  camera.position.lerp(desiredCamera, 0.045);
  desiredLook.fromArray(stage.look);
  cameraTarget.lerp(desiredLook, 0.05);
  camera.lookAt(cameraTarget);

  desiredHousePosition.fromArray(stage.position);
  if (mobile) desiredHousePosition.x = 0.85;
  house.position.lerp(desiredHousePosition, 0.05);
  const scale = stage.scale * (mobile ? 0.72 : 1);
  desiredScale.setScalar(scale);
  house.scale.lerp(desiredScale, 0.05);

  const idleRotation = Math.sin(time * 0.00016) * 0.06;
  const stageOrbit =
    activeScene === "work" ? Math.sin(time * 0.00028) * 0.13 : idleRotation;
  house.rotation.y +=
    (stage.rotation + dragRotationY + stageOrbit - house.rotation.y) * 0.045;
  house.rotation.x += (dragRotationX - house.rotation.x) * 0.045;

  parts.forEach((part) => {
    partOffset(part, elapsed, time);
    part.position.lerp(
      desiredPartPosition,
      activeScene === "brief" ? 0.12 : 0.065,
    );
    part.scale.lerp(desiredPartScale, 0.1);
    part.rotation.x += (desiredPartRotation.x - part.rotation.x) * 0.07;
    part.rotation.y += (desiredPartRotation.y - part.rotation.y) * 0.07;
    part.rotation.z += (desiredPartRotation.z - part.rotation.z) * 0.07;
  });

  updateEnvironmentalEffects(time, elapsed);

  const page =
    scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  renderer.domElement.style.opacity = String(
    1 - THREE.MathUtils.smoothstep(page, 0.975, 1),
  );
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

document.body.dataset.scene = activeScene;
requestAnimationFrame(render);
