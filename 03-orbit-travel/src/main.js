import * as THREE from "three";
import { setupExperience } from "./experience.js";
import "./style.css";
document.querySelector("#app").innerHTML =
  `<main><nav><b>ORBIT<span>°</span></b><div><a href="#journeys">Journeys</a><a href="#experience">Experience</a><a href="#manifest">Manifest</a></div><a class="book" href="#manifest">REQUEST A SEAT</a></nav><section class="hero"><span class="badge">CIVILIAN FLIGHT 07 / NOW BOARDING</span><h1>SEE HOME<br>FOR THE <i>FIRST</i><br>TIME.</h1><div class="intro"><p>Six days above everything familiar. One view that changes how you understand all of it.</p><span>DRAG TO ORBIT ↔</span></div></section><section class="ticker"><span>LOW EARTH ORBIT</span><i>✦</i><span>408 KM ALTITUDE</span><i>✦</i><span>16 SUNRISES / DAY</span><i>✦</i><span>ZERO ORDINARY DAYS</span></section><section class="journeys" id="journeys"><span class="eyebrow">CHOOSE YOUR HORIZON / 01—03</span><h2>Journeys beyond<br>the expected.</h2><div class="cards"><article><div class="orb earth"></div><small>01 / 06 DAYS</small><h3>Earthlight</h3><p>Orbit the planet in quiet comfort and see every ocean, weather system, and sunrise become one living whole.</p><b>FROM $28M*</b></article><article><div class="orb moon"></div><small>02 / 12 DAYS</small><h3>Lunar Arc</h3><p>Follow the path of Apollo, round the far side, and watch Earth rise over a landscape untouched by time.</p><b>FUTURE MISSION</b></article><article><div class="orb mars"></div><small>03 / 180+ DAYS</small><h3>Mars Transfer</h3><p>A long-horizon expedition concept for the first generation ready to make another world feel close.</p><b>IN DEVELOPMENT</b></article></div><p class="disclaimer">*Fictional portfolio concept. No real travel product or price is being offered.</p></section><section class="experience" id="experience"><div><span class="eyebrow">LIFE ABOARD</span><h2>Designed for awe.<br>Engineered for calm.</h2></div><div class="amenities"><article><b>01</b><h3>Panoramic cupola</h3><p>A 3.8-meter observation window makes the planet the center of every room.</p></article><article><b>02</b><h3>Private quarters</h3><p>Acoustic privacy, circadian lighting, and personal storage for six unhurried days.</p></article><article><b>03</b><h3>Human guidance</h3><p>Months of training and a veteran crew prepare every traveler for the extraordinary.</p></article></div></section><section class="manifest" id="manifest"><span>NEXT DEPARTURE / Q3 2027</span><h2>There are only<br>twelve windows.</h2><a href="https://aljon-mariano-contact.vercel.app/" aria-label="Meet the developer, Aljon Mariano">MEET THE DEVELOPER →</a></section></main>`;
const orbitAudio = setupExperience({
  tone: 38,
  accent: "#9effdd",
  target: "#manifest",
  eyebrow: "MISSION READINESS / 12 WEEKS",
  title: "Extraordinary, made understandable.",
  intro:
    "Every traveler follows a progressive preparation program designed around confidence, health, and a calm crew culture.",
  items: [
    [
      "Weeks 01—04",
      "Medical baselining, spacecraft orientation, and personal mission planning.",
    ],
    [
      "Weeks 05—08",
      "Centrifuge adaptation, emergency rehearsal, and zero-gravity familiarization.",
    ],
    [
      "Weeks 09—12",
      "Crew integration, final simulation, and family mission briefing.",
    ],
  ],
});
globalThis.orbitAudio = orbitAudio;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  250,
);
camera.position.z = 9;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const stars = new Float32Array(3600);
for (let i = 0; i < stars.length; i += 3) {
  stars[i] = (Math.random() - 0.5) * 80;
  stars[i + 1] = (Math.random() - 0.5) * 50;
  stars[i + 2] = -Math.random() * 80;
}
const sg = new THREE.BufferGeometry();
sg.setAttribute("position", new THREE.BufferAttribute(stars, 3));
scene.add(
  new THREE.Points(
    sg,
    new THREE.PointsMaterial({
      color: 0xc8dcff,
      size: 0.045,
      sizeAttenuation: true,
    }),
  ),
);
const world = new THREE.Group();
scene.add(world);
const earth = new THREE.Mesh(
  new THREE.SphereGeometry(2.55, 96, 96),
  new THREE.MeshPhysicalMaterial({
    color: 0x1b4565,
    roughness: 0.78,
    metalness: 0.05,
    clearcoat: 0.12,
  }),
);
earth.position.set(2.5, -0.25, -0.6);
world.add(earth);
const clouds = new THREE.Mesh(
  new THREE.SphereGeometry(2.59, 96, 96),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.13,
    roughness: 1,
  }),
);
clouds.position.copy(earth.position);
world.add(clouds);
const glow = new THREE.Mesh(
  new THREE.SphereGeometry(2.7, 64, 64),
  new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    vertexShader:
      "varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader:
      "varying vec3 n;void main(){float i=pow(.62-dot(n,vec3(0.,0.,1.)),3.);gl_FragColor=vec4(.15,.55,1.,1.)*i;}",
  }),
);
glow.position.copy(earth.position);
world.add(glow);
const craft = new THREE.Group(),
  panels = [];
const white = new THREE.MeshStandardMaterial({
  color: 0xe8e9e6,
  metalness: 0.65,
  roughness: 0.23,
});
const body = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.42, 1.6, 32),
  white,
);
body.rotation.z = Math.PI / 2;
craft.add(body);
const nose = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 32), white);
nose.rotation.z = -Math.PI / 2;
nose.position.x = 0.98;
craft.add(nose);
[-1, 1].forEach((s) => {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.025, 0.48),
    new THREE.MeshStandardMaterial({
      color: 0x163b70,
      metalness: 0.5,
      roughness: 0.3,
    }),
  );
  panel.position.set(-0.05, s * 0.53, 0);
  panel.userData.side = s;
  panels.push(panel);
  craft.add(panel);
});
craft.position.set(-2.5, 1.25, 0.3);
craft.rotation.z = 0.22;
world.add(craft);
scene.add(new THREE.AmbientLight(0x1c3150, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 7);
sun.position.set(-5, 4, 6);
scene.add(sun);
const sunVisual = new THREE.Mesh(
  new THREE.SphereGeometry(1.15, 48, 48),
  new THREE.MeshBasicMaterial({ color: 0xffe8a8 }),
);
sunVisual.position.set(-7, 4.5, -5);
scene.add(sunVisual);
const sunHalo = new THREE.Mesh(
  new THREE.SphereGeometry(1.75, 48, 48),
  new THREE.MeshBasicMaterial({
    color: 0xffa33b,
    transparent: true,
    opacity: 0.11,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  }),
);
sunVisual.add(sunHalo);
const moonVisual = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 48, 48),
  new THREE.MeshStandardMaterial({ color: 0xbdbab2, roughness: 0.96 }),
);
moonVisual.position.set(7, -2.8, -1);
scene.add(moonVisual);
const orbitPath = new THREE.LineLoop(
  new THREE.BufferGeometry().setFromPoints(
    Array.from({ length: 96 }, (_, i) => {
      const a = (i / 96) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * 4.1, Math.sin(a) * 2.1, -1.4);
    }),
  ),
  new THREE.LineBasicMaterial({
    color: 0x9effdd,
    transparent: true,
    opacity: 0.18,
  }),
);
scene.add(orbitPath);
const note = document.createElement("div");
note.style.cssText =
  "position:fixed;z-index:3;right:4vw;bottom:4vh;font:10px DM Mono;color:#9effdd;opacity:0;transition:.3s;pointer-events:none";
document.body.append(note);
document.querySelector(".journeys").style.background =
  "linear-gradient(90deg,#0a101b 0 58%,#0a101bee 73%,#04070d22)";
let mx = 0,
  my = 0;
const stageSections = [
  document.querySelector(".hero"),
  document.querySelector("#journeys"),
  document.querySelector("#experience"),
  document.querySelector(".experience-context"),
  document.querySelector("#manifest"),
].filter(Boolean);
let stage = 0;
let audibleStage = -1;
const stageValue = (values, value) => {
  const lower = Math.floor(value),
    upper = Math.min(values.length - 1, Math.ceil(value));
  return THREE.MathUtils.lerp(values[lower], values[upper], value - lower);
};
addEventListener("pointermove", (e) => {
  if (e.buttons) {
    mx += e.movementX * 0.004;
    my += e.movementY * 0.003;
  }
});
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
function loop(t) {
  const targetStage = stageSections.reduce(
    (best, section, index) => {
      const distance = Math.abs(
        section.getBoundingClientRect().top - innerHeight * 0.28,
      );
      return distance < best.distance ? { index, distance } : best;
    },
    { index: 0, distance: Infinity },
  ).index;
  if (targetStage !== audibleStage) {
    audibleStage = targetStage;
    orbitAudio.setScene(targetStage);
  }
  stage += (targetStage - stage) * 0.035;
  renderer.domElement.style.opacity = "1";
  const s = scrollY / innerHeight,
    open =
      THREE.MathUtils.smoothstep(s, 0.8, 1.65) *
      (1 - THREE.MathUtils.smoothstep(s, 3.3, 4.2));
  world.rotation.y +=
    (mx +
      open * 0.38 +
      stageValue([0, 0.35, 0.82, 1.35, 1.8], stage) -
      world.rotation.y) *
    0.04;
  world.rotation.x +=
    (my + stageValue([0, -0.1, 0.18, -0.2, 0.05], stage) - world.rotation.x) *
    0.04;
  world.position.y = stageValue([0, -0.35, 0.2, -0.15, 0], stage);
  earth.rotation.y = t * 0.000035;
  clouds.rotation.y = t * 0.00005;
  earth.scale.setScalar(
    stageValue([1, 1.12, 0.88, 0.72, 1.18], stage) + open * 0.08,
  );
  clouds.scale.copy(earth.scale);
  glow.scale.copy(earth.scale);
  body.position.x = -open * 0.45;
  nose.position.x = 0.98 + open * 0.72;
  panels.forEach(
    (p) => (p.position.y = p.userData.side * (0.53 + open * 0.52)),
  );
  craft.position.x = stageValue([-2.5, -1.8, -0.7, 1.1, -0.2], stage);
  craft.position.y =
    stageValue([1.25, 0.8, 1.65, -1.15, 1.8], stage) +
    Math.sin(t * 0.0008) * 0.12 -
    open * 0.25;
  craft.rotation.y = open * 0.5 + Math.sin(t * 0.0004) * 0.1;
  craft.rotation.z = 0.22 + Math.sin(t * 0.00055) * 0.08;
  camera.position.z = stageValue([9, 8.6, 9.8, 10.4, 8.2], stage) - open * 0.35;
  const orbitAngle = t * 0.00018 + stage * 0.8;
  moonVisual.position.set(
    stageValue([7, 4.5, -3.5, 1.1, 2.55], stage) + Math.cos(orbitAngle) * 0.35,
    stageValue([-2.8, 1.8, 2.3, -1.5, -0.25], stage) +
      Math.sin(orbitAngle) * 0.25,
    stageValue([-1, -0.5, 0.2, -0.4, 0.5], stage),
  );
  moonVisual.rotation.y = t * 0.00012;
  moonVisual.scale.setScalar(stageValue([0.5, 1, 1.35, 0.8, 1.15], stage));
  sunVisual.position.set(
    stageValue([-7, -4.5, 5.5, -2.5, 0.8], stage),
    stageValue([4.5, 2.8, 1.8, -3.5, 0.5], stage),
    stageValue([-5, -4, -3, -5, -2.5], stage),
  );
  sunVisual.scale.setScalar(stageValue([0.65, 0.9, 1.45, 0.7, 1.15], stage));
  sun.intensity = stageValue([5, 7, 10, 4, 2.5], stage);
  sun.position.copy(sunVisual.position);
  glow.material.opacity = stageValue([1, 1, 0.65, 0.9, 1.45], stage);
  orbitPath.rotation.z = t * 0.000035;
  orbitPath.material.opacity = stageValue([0.05, 0.32, 0.12, 0.4, 0.08], stage);
  const starField = scene.children.find((x) => x.isPoints);
  if (starField) starField.rotation.z = t * 0.000006;
  const stageLabels = [
    "EARTH ORBIT / HOME FROM 408 KM",
    "DESTINATION TRAJECTORIES / EARTH · MOON · MARS",
    "SUNRISE SEQUENCE / 16 TIMES EACH DAY",
    "MISSION READINESS / CREW · CAPSULE · GUIDANCE",
    "ECLIPSE ALIGNMENT / DEPARTURE WINDOW",
  ];
  note.textContent = stageLabels[Math.round(stage)];
  note.style.opacity = "1";
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
