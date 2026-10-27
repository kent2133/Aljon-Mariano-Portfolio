import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { setupExperience } from "./experience.js";
import "./style.css";

document.querySelector("#app").innerHTML = `
  <main>
    <nav class="site-nav" aria-label="Primary navigation">
      <a class="brand" href="#top" aria-label="Aether home">AETHER<sup>&reg;</sup></a>
      <div class="nav-links">
        <a href="#sound">Sound</a>
        <a href="#craft">Craft</a>
        <a href="#comfort">Comfort</a>
        <a href="#context">Everyday</a>
      </div>
      <a class="pill outline nav-cta" href="#reserve">Reserve</a>
    </nav>

    <section class="hero" id="top" data-scene="hero">
      <div class="copy">
        <span class="kicker">AETHER ONE / SPATIAL HEADPHONES</span>
        <h1>Feel the space<br><i>between</i> sounds.</h1>
        <p>Reference-grade wireless headphones shaped around how humans actually hear. Precise, spacious, and quiet when the world is not.</p>
        <div class="actions">
          <a class="pill lime" href="#reserve">Reserve Aether One</a>
          <span>$549 &middot; Concept release, spring 2027</span>
        </div>
        <div class="finish-selector" role="group" aria-labelledby="finish-label">
          <div class="finish-selector__heading">
            <span id="finish-label">Choose your finish</span>
            <output id="finish-name">Midnight</output>
          </div>
          <div class="finish-options">
            <button class="finish-option is-selected" type="button" data-finish="midnight" aria-label="Midnight finish" aria-pressed="true"><span style="--swatch:#202327"></span></button>
            <button class="finish-option" type="button" data-finish="silver" aria-label="Lunar Silver finish" aria-pressed="false"><span style="--swatch:#aeb5b7"></span></button>
            <button class="finish-option" type="button" data-finish="clay" aria-label="Warm Clay finish" aria-pressed="false"><span style="--swatch:#8d6d59"></span></button>
            <button class="finish-option" type="button" data-finish="signal" aria-label="Signal Lime finish" aria-pressed="false"><span style="--swatch:#a9d84f"></span></button>
          </div>
        </div>
      </div>
      <div class="drag" aria-hidden="true"><span class="drag-dot"></span> Drag anywhere to inspect <b>&harr;</b></div>
      <a class="scroll" href="#sound">Scroll to discover <span>&darr;</span></a>
    </section>

    <section class="numbers" id="sound" data-scene="sound">
      <header class="section-intro">
        <span class="label">01 / THE SOUND ENGINE</span>
        <h2>A driver that moves<br>like the music does.</h2>
        <p>The ear cushions open to reveal the driver while the membrane responds to a living sound field.</p>
      </header>
      <div class="number-grid">
        <div><strong>40<span>mm</span></strong><p>Bio-cellulose<br>dynamic drivers</p></div>
        <div><strong>&minus;42<span>dB</span></strong><p>Adaptive noise<br>cancellation</p></div>
        <div><strong>52<span>hr</span></strong><p>Listening from<br>a single charge</p></div>
        <div><strong>24<span>bit</span></strong><p>Lossless audio<br>over USB-C</p></div>
      </div>
    </section>

    <section class="story dark" id="craft" data-scene="craft">
      <div class="label">02 / MATERIAL INTELLIGENCE</div>
      <div class="story-head">
        <h2>Built to disappear.<br><em>Made to endure.</em></h2>
        <p>Each layer separates in sequence to show how structure, acoustics, and comfort meet. High-contact parts are replaceable, so the concept is designed around a longer useful life.</p>
      </div>
      <div class="material-grid">
        <article><span>01</span><h3>Recycled aluminum</h3><p>A rigid, lightweight headband and yoke machined to hold alignment.</p></article>
        <article><span>02</span><h3>Acoustic knit</h3><p>A low-resistance inner cover protects the driver without closing the sound.</p></article>
        <article><span>03</span><h3>Adaptive memory foam</h3><p>A slow-rebound cushion creates a stable seal with less clamp pressure.</p></article>
      </div>
      <p class="callout-instruction"><span></span> Follow the leader lines through every material layer.</p>
    </section>

    <section class="story light" id="comfort" data-scene="comfort">
      <div class="label">03 / PERSONAL ACOUSTICS</div>
      <div class="story-head">
        <h2>Tuned to your ears,<br>not an average.</h2>
        <p>A short calibration maps the way your ears perceive space. The cushions then breathe gently in the 3D view to demonstrate the pressure-distributing seal.</p>
      </div>
      <div class="feature">
        <span>PERSONAL PROFILE</span>
        <div class="wave" aria-hidden="true"></div>
        <strong>03:24</strong>
      </div>
    </section>

    <section class="reserve" id="reserve" data-scene="reserve">
      <span class="kicker">FIRST EDITION / 500 CONCEPT UNITS</span>
      <h2>Hear what<br>you've been missing.</h2>
      <p>The complete assembly returns for one last close look in the finish you selected.</p>
      <a class="pill darkpill" href="mailto:hello@example.com?subject=Aether%20One%20reservation">Join the reservation list <span>&rarr;</span></a>
    </section>
  </main>
`;

const siteAudio = setupExperience({
  tone: 55,
  accent: "#caff63",
  target: "#reserve",
  eyebrow: "04 / EVERYDAY USE",
  title: "Made for the hours between.",
  intro:
    "The earcups fold flat as Aether One moves from focused work to travel and late-night listening without asking you to manage the technology.",
  items: [
    [
      "Conversation mode",
      "A touch reveals nearby voices naturally while keeping music present.",
    ],
    [
      "Multipoint memory",
      "Move between laptop, phone, and studio desk without pairing again.",
    ],
    [
      "Designed to repair",
      "Cushions, cable, battery, and headband pad are independently replaceable.",
    ],
  ],
});

const contextSection = document.querySelector(".experience-context");
if (contextSection) {
  contextSection.id = "context";
  contextSection.dataset.scene = "context";
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  31,
  innerWidth / innerHeight,
  0.1,
  100,
);
camera.position.set(0, 0.12, 10.6);

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
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.domElement.className = "product-canvas";
renderer.domElement.setAttribute("aria-hidden", "true");
document.body.prepend(renderer.domElement);

const pmrem = new THREE.PMREMGenerator(renderer);
const roomTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environment = roomTexture;
pmrem.dispose();

const rig = new THREE.Group();
scene.add(rig);

const finishMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x202327,
  metalness: 0.84,
  roughness: 0.2,
  clearcoat: 0.62,
  clearcoatRoughness: 0.18,
  envMapIntensity: 1.35,
});
const frameMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xb7bdc0,
  metalness: 1,
  roughness: 0.15,
  clearcoat: 0.38,
  envMapIntensity: 1.55,
});
const leatherMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x141516,
  roughness: 0.6,
  clearcoat: 0.16,
  sheen: 0.45,
  sheenColor: 0x4a4d48,
});
const foamMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x252727,
  roughness: 0.82,
  sheen: 0.8,
  sheenColor: 0x6c726b,
});
const knitMaterial = new THREE.MeshStandardMaterial({
  color: 0x373b37,
  roughness: 0.96,
  metalness: 0,
});
const driverMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xcaff63,
  roughness: 0.34,
  metalness: 0.24,
  emissive: 0x36510f,
  emissiveIntensity: 0.22,
});
const membraneMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xd7c596,
  roughness: 0.42,
  metalness: 0.18,
  clearcoat: 0.32,
});

const animatedParts = [];
const sideRoots = [];
const cups = [];
const pads = [];
const membranes = [];
const calloutAnchors = {};

function vector(value = [0, 0, 0]) {
  return new THREE.Vector3(value[0], value[1], value[2]);
}

function registerPart(object, offsets = {}) {
  object.userData.homePosition = object.position.clone();
  object.userData.homeRotation = object.rotation.clone();
  object.userData.offsets = Object.fromEntries(
    Object.entries(offsets).map(([key, value]) => [key, vector(value)]),
  );
  animatedParts.push(object);
  return object;
}

function createAnchor(parent, position) {
  const anchor = new THREE.Object3D();
  anchor.position.copy(vector(position));
  parent.add(anchor);
  return anchor;
}

const outerBand = registerPart(
  new THREE.Mesh(
    new THREE.TorusGeometry(2.34, 0.135, 28, 144, Math.PI),
    finishMaterial,
  ),
  { craft: [0, 0.62, 0.04], sound: [0, 0.08, 0] },
);
outerBand.position.y = 0.6;
outerBand.castShadow = true;
rig.add(outerBand);
outerBand.userData.homePosition.copy(outerBand.position);
calloutAnchors.band = createAnchor(outerBand, [0, 2.27, 0]);

const innerBand = registerPart(
  new THREE.Mesh(
    new THREE.TorusGeometry(2.08, 0.145, 24, 128, Math.PI),
    leatherMaterial,
  ),
  { craft: [0, 0.12, 0.52], comfort: [0, -0.08, 0.08] },
);
innerBand.position.set(0, 0.55, 0.025);
innerBand.castShadow = true;
rig.add(innerBand);
innerBand.userData.homePosition.copy(innerBand.position);

const headPad = registerPart(
  new THREE.Mesh(
    new THREE.TorusGeometry(1.88, 0.1, 20, 112, Math.PI),
    foamMaterial,
  ),
  { craft: [0, -0.2, 0.82], comfort: [0, -0.16, 0.14] },
);
headPad.position.set(0, 0.49, 0.04);
rig.add(headPad);
headPad.userData.homePosition.copy(headPad.position);

[-1, 1].forEach((side) => {
  const sideRoot = new THREE.Group();
  sideRoot.position.set(side * 2.33, 0.6, 0);
  sideRoot.userData.homeRotation = sideRoot.rotation.clone();
  rig.add(sideRoot);
  sideRoots.push({ side, object: sideRoot });

  const yokeGroup = registerPart(new THREE.Group(), {
    craft: [side * 0.22, 0.32, 0.02],
    sound: [side * 0.03, 0.03, 0],
  });
  sideRoot.add(yokeGroup);
  yokeGroup.userData.homePosition.copy(yokeGroup.position);

  [-0.2, 0.2].forEach((z) => {
    const yokeBar = new THREE.Mesh(
      new RoundedBoxGeometry(0.17, 1.22, 0.14, 5, 0.065),
      frameMaterial,
    );
    yokeBar.position.set(0, -0.56, z);
    yokeBar.castShadow = true;
    yokeGroup.add(yokeBar);
  });
  const yokeBridge = new THREE.Mesh(
    new RoundedBoxGeometry(0.18, 0.16, 0.55, 5, 0.065),
    frameMaterial,
  );
  yokeBridge.position.set(0, -1.08, 0);
  yokeGroup.add(yokeBridge);

  const hinge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.62, 36),
    driverMaterial,
  );
  hinge.rotation.x = Math.PI / 2;
  hinge.position.set(0, -1.08, 0);
  yokeGroup.add(hinge);
  if (side === 1)
    calloutAnchors.yoke = createAnchor(yokeGroup, [0, -0.46, 0.2]);

  const cup = new THREE.Group();
  cup.position.set(0, -1.31, 0);
  cup.userData.homePosition = cup.position.clone();
  cup.userData.homeRotation = cup.rotation.clone();
  sideRoot.add(cup);
  cups.push({ side, object: cup });

  const shell = registerPart(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.89, 0.89, 0.44, 72, 1, false),
      finishMaterial,
    ),
    {
      sound: [side * 0.08, 0, -0.04],
      craft: [side * 0.34, 0, -0.08],
    },
  );
  shell.rotation.z = Math.PI / 2;
  shell.castShadow = true;
  cup.add(shell);
  shell.userData.homePosition.copy(shell.position);
  shell.userData.homeRotation.copy(shell.rotation);

  const outerPlate = registerPart(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.73, 0.73, 0.12, 72),
      frameMaterial,
    ),
    {
      sound: [side * 0.1, 0, 0],
      craft: [side * 0.78, 0.1, -0.22],
    },
  );
  outerPlate.rotation.z = Math.PI / 2;
  outerPlate.position.x = side * 0.27;
  outerPlate.castShadow = true;
  cup.add(outerPlate);
  outerPlate.userData.homePosition.copy(outerPlate.position);
  outerPlate.userData.homeRotation.copy(outerPlate.rotation);

  const pad = registerPart(
    new THREE.Mesh(
      new THREE.TorusGeometry(0.67, 0.19, 30, 80),
      leatherMaterial,
    ),
    {
      sound: [-side * 0.25, 0, 0.09],
      craft: [-side * 0.48, -0.05, 0.16],
      comfort: [-side * 0.05, 0, 0.08],
    },
  );
  pad.rotation.y = Math.PI / 2;
  pad.position.x = -side * 0.29;
  pad.castShadow = true;
  cup.add(pad);
  pad.userData.homePosition.copy(pad.position);
  pad.userData.homeRotation.copy(pad.rotation);
  pads.push(pad);

  const foamCore = registerPart(
    new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.12, 22, 72), foamMaterial),
    {
      sound: [-side * 0.36, 0, 0.16],
      craft: [-side * 0.73, -0.11, 0.36],
    },
  );
  foamCore.rotation.y = Math.PI / 2;
  foamCore.position.x = -side * 0.31;
  cup.add(foamCore);
  foamCore.userData.homePosition.copy(foamCore.position);
  foamCore.userData.homeRotation.copy(foamCore.rotation);
  if (side === -1)
    calloutAnchors.cushion = createAnchor(foamCore, [0, 0.55, 0]);

  const knit = registerPart(
    new THREE.Mesh(new THREE.CircleGeometry(0.52, 64), knitMaterial),
    {
      sound: [-side * 0.51, 0.02, 0.2],
      craft: [-side * 1.02, 0.12, 0.54],
    },
  );
  knit.rotation.y = side * (Math.PI / 2);
  knit.position.x = -side * 0.49;
  cup.add(knit);
  knit.userData.homePosition.copy(knit.position);
  knit.userData.homeRotation.copy(knit.rotation);
  if (side === -1) calloutAnchors.knit = createAnchor(knit, [0, -0.22, 0]);

  const driver = registerPart(new THREE.Group(), {
    sound: [-side * 0.26, 0, 0.38],
    craft: [-side * 0.73, -0.14, 0.83],
  });
  driver.position.x = -side * 0.4;
  cup.add(driver);
  driver.userData.homePosition.copy(driver.position);

  const driverRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.48, 0.045, 16, 64),
    driverMaterial,
  );
  driverRing.rotation.y = Math.PI / 2;
  driver.add(driverRing);

  const membrane = new THREE.Mesh(
    new THREE.CircleGeometry(0.45, 64),
    membraneMaterial,
  );
  membrane.rotation.y = side * (Math.PI / 2);
  membrane.position.x = -side * 0.01;
  driver.add(membrane);
  membranes.push(membrane);

  const motor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.12, 36),
    driverMaterial,
  );
  motor.rotation.z = Math.PI / 2;
  motor.position.x = side * 0.07;
  driver.add(motor);
  if (side === 1) calloutAnchors.driver = createAnchor(driver, [0, 0.28, 0]);
});

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(22, 22),
  new THREE.ShadowMaterial({ opacity: 0.18 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.35;
floor.receiveShadow = true;
scene.add(floor);

scene.add(new THREE.HemisphereLight(0xffffff, 0x171817, 1.65));
const keyLight = new THREE.SpotLight(0xffffff, 92, 32, 0.52, 0.38);
keyLight.position.set(-4.5, 7.5, 7.5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0xcaff63, 34, 22);
rimLight.position.set(5.2, 1.6, 3.5);
scene.add(rimLight);
const fillLight = new THREE.PointLight(0x7087ff, 10, 20);
fillLight.position.set(-3, -1, 4);
scene.add(fillLight);

const stages = [
  {
    key: "hero",
    element: document.querySelector("#top"),
    position: [2.25, -0.1, 0],
    rotation: [0.04, -0.3, 0],
    scale: 0.9,
    note: "AETHER ONE / ASSEMBLED",
  },
  {
    key: "sound",
    element: document.querySelector("#sound"),
    position: [2.18, -0.04, -0.25],
    rotation: [0.03, 0.46, 0.02],
    scale: 0.82,
    note: "SOUND ENGINE / DRIVER IN MOTION",
  },
  {
    key: "craft",
    element: document.querySelector("#craft"),
    position: [2.38, -0.12, -0.5],
    rotation: [0.06, -0.16, -0.02],
    scale: 0.67,
    note: "CRAFT / EXPLODED MATERIAL VIEW",
  },
  {
    key: "comfort",
    element: document.querySelector("#comfort"),
    position: [2.27, -0.08, -0.18],
    rotation: [0.02, 0.64, 0],
    scale: 0.84,
    note: "COMFORT / ADAPTIVE SEAL",
  },
  {
    key: "context",
    element: document.querySelector("#context"),
    position: [2.3, 0.02, -0.38],
    rotation: [0.08, -0.82, 0.05],
    scale: 0.76,
    note: "EVERYDAY / FLAT-FOLD MODE",
  },
  {
    key: "reserve",
    element: document.querySelector("#reserve"),
    position: [2.05, -0.1, 0.15],
    rotation: [0.02, 0.08, 0],
    scale: 0.96,
    note: "FIRST EDITION / YOUR FINISH",
  },
];

const stageNote = document.createElement("div");
stageNote.className = "scene-note";
stageNote.setAttribute("aria-hidden", "true");
document.body.append(stageNote);

const calloutDefinitions = [
  {
    key: "band",
    title: "Recycled aluminum band",
    detail: "Lightweight structural arc",
    dx: -188,
    dy: -72,
  },
  {
    key: "yoke",
    title: "CNC aluminum yoke",
    detail: "Twin-arm load path",
    dx: 132,
    dy: -58,
  },
  {
    key: "driver",
    title: "Bio-cellulose driver",
    detail: "40 mm low-mass membrane",
    dx: 150,
    dy: 52,
  },
  {
    key: "cushion",
    title: "Adaptive memory foam",
    detail: "Slow-rebound pressure seal",
    dx: -168,
    dy: 72,
  },
  {
    key: "knit",
    title: "Acoustic knit",
    detail: "Low-resistance driver cover",
    dx: -164,
    dy: 8,
  },
];

const calloutLayer = document.createElement("div");
calloutLayer.className = "product-callouts";
calloutLayer.setAttribute("aria-hidden", "true");
calloutLayer.innerHTML = `<svg aria-hidden="true"></svg>${calloutDefinitions.map(({ key, title, detail }) => `<div class="product-callout" data-callout="${key}"><strong>${title}</strong><span>${detail}</span></div>`).join("")}`;
document.body.append(calloutLayer);
const calloutSvg = calloutLayer.querySelector("svg");
const calloutItems = calloutDefinitions.map((definition) => {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  line.setAttribute("class", "callout-line");
  dot.setAttribute("class", "callout-dot");
  dot.setAttribute("r", "3.5");
  calloutSvg.append(line, dot);
  return {
    ...definition,
    anchor: calloutAnchors[definition.key],
    element: calloutLayer.querySelector(`[data-callout="${definition.key}"]`),
    line,
    dot,
  };
});

const finishPresets = {
  midnight: {
    label: "Midnight",
    color: new THREE.Color(0x202327),
    roughness: 0.2,
    metalness: 0.84,
  },
  silver: {
    label: "Lunar Silver",
    color: new THREE.Color(0xaeb5b7),
    roughness: 0.16,
    metalness: 0.92,
  },
  clay: {
    label: "Warm Clay",
    color: new THREE.Color(0x8d6d59),
    roughness: 0.28,
    metalness: 0.68,
  },
  signal: {
    label: "Signal Lime",
    color: new THREE.Color(0xa9d84f),
    roughness: 0.22,
    metalness: 0.58,
  },
};
let selectedFinish = finishPresets.midnight;
let colorReveal = 0;
document.querySelectorAll(".finish-option").forEach((button, index) => {
  button.addEventListener("click", () => {
    selectedFinish = finishPresets[button.dataset.finish];
    colorReveal = 1;
    siteAudio.cue("finish", { variant: index });
    document.querySelector("#finish-name").textContent = selectedFinish.label;
    document.querySelectorAll(".finish-option").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("is-selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
  });
});

let targetRotationY = -0.3;
let targetRotationX = 0.04;
let dragging = false;
let pointerX = 0;
let pointerY = 0;

addEventListener("pointerdown", (event) => {
  if (event.target.closest("a, button, input, textarea, select")) return;
  dragging = true;
  pointerX = event.clientX;
  pointerY = event.clientY;
});
addEventListener("pointerup", () => (dragging = false));
addEventListener("pointercancel", () => (dragging = false));
addEventListener("pointermove", (event) => {
  if (!dragging) return;
  const movementX = Number.isFinite(event.movementX)
    ? event.movementX
    : event.clientX - pointerX;
  const movementY = Number.isFinite(event.movementY)
    ? event.movementY
    : event.clientY - pointerY;
  targetRotationY += movementX * 0.0055;
  targetRotationX = THREE.MathUtils.clamp(
    targetRotationX + movementY * 0.0035,
    -0.32,
    0.38,
  );
  pointerX = event.clientX;
  pointerY = event.clientY;
});

function updateStageMeasurements() {
  stages.forEach((stage) => {
    stage.center = stage.element.offsetTop + stage.element.offsetHeight * 0.5;
  });
}

function getStageBlend() {
  const focus = scrollY + innerHeight * 0.5;
  if (focus <= stages[0].center)
    return { from: stages[0], to: stages[0], mix: 0 };
  for (let index = 0; index < stages.length - 1; index += 1) {
    const from = stages[index];
    const to = stages[index + 1];
    if (focus <= to.center) {
      const raw = THREE.MathUtils.clamp(
        (focus - from.center) / Math.max(1, to.center - from.center),
        0,
        1,
      );
      return { from, to, mix: THREE.MathUtils.smoothstep(raw, 0.12, 0.88) };
    }
  }
  const last = stages[stages.length - 1];
  return { from: last, to: last, mix: 0 };
}

function stageWeight(key, blend) {
  return (
    (blend.from.key === key ? 1 - blend.mix : 0) +
    (blend.to.key === key ? blend.mix : 0)
  );
}

const scratchZero = new THREE.Vector3();
const stagePosition = new THREE.Vector3();
const projected = new THREE.Vector3();
const desiredPosition = new THREE.Vector3();
const desiredScale = new THREE.Vector3();
const fromPosition = new THREE.Vector3();
const toPosition = new THREE.Vector3();

function updateCallouts(craftWeight) {
  const visible = craftWeight > 0.22 && innerWidth > 820;
  calloutLayer.classList.toggle("is-visible", visible);
  calloutLayer.style.setProperty("--callout-opacity", String(craftWeight));
  if (!visible) return;

  calloutItems.forEach((item) => {
    item.anchor.getWorldPosition(projected);
    projected.project(camera);
    const startX = (projected.x * 0.5 + 0.5) * innerWidth;
    const startY = (-projected.y * 0.5 + 0.5) * innerHeight;
    const endX = THREE.MathUtils.clamp(startX + item.dx, 120, innerWidth - 120);
    const endY = THREE.MathUtils.clamp(startY + item.dy, 84, innerHeight - 84);
    item.line.setAttribute("x1", startX.toFixed(1));
    item.line.setAttribute("y1", startY.toFixed(1));
    item.line.setAttribute("x2", endX.toFixed(1));
    item.line.setAttribute("y2", endY.toFixed(1));
    item.dot.setAttribute("cx", startX.toFixed(1));
    item.dot.setAttribute("cy", startY.toFixed(1));
    item.element.style.left = `${endX}px`;
    item.element.style.top = `${endY}px`;
    item.element.classList.toggle("align-left", item.dx < 0);
  });
}

function resize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  updateStageMeasurements();
}
addEventListener("resize", resize);
addEventListener("load", updateStageMeasurements);
updateStageMeasurements();
let audibleStage = "hero";

function loop(time) {
  const blend = getStageBlend();
  fromPosition.fromArray(blend.from.position);
  toPosition.fromArray(blend.to.position);
  stagePosition.lerpVectors(fromPosition, toPosition, blend.mix);
  if (innerWidth < 820) {
    stagePosition.x = 0.76;
    stagePosition.y -= 0.6;
    stagePosition.z -= 1.3;
  }

  rig.position.lerp(stagePosition, 0.075);
  const baseScale = THREE.MathUtils.lerp(
    blend.from.scale,
    blend.to.scale,
    blend.mix,
  );
  rig.scale.lerp(
    desiredScale.setScalar(innerWidth < 820 ? baseScale * 0.72 : baseScale),
    0.075,
  );

  const stageRotationX = THREE.MathUtils.lerp(
    blend.from.rotation[0],
    blend.to.rotation[0],
    blend.mix,
  );
  const stageRotationY = THREE.MathUtils.lerp(
    blend.from.rotation[1],
    blend.to.rotation[1],
    blend.mix,
  );
  const stageRotationZ = THREE.MathUtils.lerp(
    blend.from.rotation[2],
    blend.to.rotation[2],
    blend.mix,
  );
  if (!dragging) {
    targetRotationY += (stageRotationY - targetRotationY) * 0.022;
    targetRotationX += (stageRotationX - targetRotationX) * 0.022;
  }
  const finishTurn = Math.sin((1 - colorReveal) * Math.PI) * colorReveal * 0.32;
  rig.rotation.y += (targetRotationY + finishTurn - rig.rotation.y) * 0.07;
  rig.rotation.x += (targetRotationX - rig.rotation.x) * 0.07;
  rig.rotation.z +=
    (stageRotationZ + Math.sin(time * 0.00042) * 0.012 - rig.rotation.z) * 0.06;

  animatedParts.forEach((part) => {
    const fromOffset = part.userData.offsets[blend.from.key] || scratchZero;
    const toOffset = part.userData.offsets[blend.to.key] || scratchZero;
    desiredPosition
      .copy(part.userData.homePosition)
      .addScaledVector(fromOffset, 1 - blend.mix)
      .addScaledVector(toOffset, blend.mix);
    part.position.lerp(desiredPosition, 0.085);
  });

  const soundWeight = stageWeight("sound", blend);
  const craftWeight = stageWeight("craft", blend);
  const comfortWeight = stageWeight("comfort", blend);
  const contextWeight = stageWeight("context", blend);
  const reserveWeight = stageWeight("reserve", blend);
  const soundWave = Math.sin(time * 0.009) * 0.5 + 0.5;
  const comfortBreath = Math.sin(time * 0.0025) * 0.5 + 0.5;

  membranes.forEach((membrane, index) => {
    const pulse = 1 + soundWeight * (0.025 + soundWave * 0.075);
    membrane.scale.setScalar(pulse);
    membrane.position.x =
      (index === 0 ? 0.01 : -0.01) * (1 + soundWeight * soundWave * 2.4);
  });
  driverMaterial.emissiveIntensity =
    0.2 + soundWeight * (0.32 + soundWave * 0.5) + reserveWeight * 0.18;

  pads.forEach((pad) => {
    const compression = 1 - comfortWeight * (0.045 + comfortBreath * 0.035);
    pad.scale.set(1 - comfortWeight * 0.08, compression, compression);
  });
  innerBand.scale.y = 1 - comfortWeight * (0.025 + comfortBreath * 0.022);
  headPad.scale.y = 1 - comfortWeight * (0.05 + comfortBreath * 0.025);

  cups.forEach(({ side, object }) => {
    const targetSwivel = side * contextWeight * 1.02;
    object.rotation.y += (targetSwivel - object.rotation.y) * 0.075;
    object.rotation.z +=
      (side * contextWeight * 0.08 - object.rotation.z) * 0.075;
  });
  sideRoots.forEach(({ side, object }) => {
    object.rotation.x +=
      (contextWeight * 0.09 * side - object.rotation.x) * 0.065;
  });

  finishMaterial.color.lerp(selectedFinish.color, 0.075);
  finishMaterial.roughness +=
    (selectedFinish.roughness - finishMaterial.roughness) * 0.075;
  finishMaterial.metalness +=
    (selectedFinish.metalness - finishMaterial.metalness) * 0.075;
  colorReveal *= 0.94;

  keyLight.position.x = -4.5 + Math.sin(time * 0.00038) * 2.4;
  rimLight.intensity =
    30 + Math.sin(time * 0.0011) * 6 + soundWeight * 18 + colorReveal * 36;
  rimLight.position.y = 1.2 + Math.sin(time * 0.0008) * 1.7;

  const noteStage = blend.mix < 0.5 ? blend.from : blend.to;
  if (noteStage.key !== audibleStage) {
    audibleStage = noteStage.key;
    siteAudio.setScene(noteStage.key);
  }
  stageNote.textContent = noteStage.note;
  stageNote.classList.toggle("is-light", noteStage.key === "comfort");
  updateCallouts(craftWeight);

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.classList.toggle(
      "is-active",
      link.getAttribute("href") === `#${noteStage.element.id}`,
    );
  });

  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
