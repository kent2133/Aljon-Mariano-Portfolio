import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import "./style.css";
document.querySelector("#app").innerHTML =
  `<main><nav><b>LUMINA<br>ARCHITECTS</b><span>MANILA / SINGAPORE</span><a href="#contact">START A PROJECT ↗</a></nav><section class="hero"><span class="tag">RESIDENTIAL / 2026</span><h1>COURTYARD<br><i>HOUSE</i></h1><div class="meta"><p>A porous family home where monsoon air, filtered light, and daily rituals move freely through a planted center.</p><span>14.5995° N<br>120.9842° E</span></div><div class="hint">DRAG TO ORBIT / SCROLL ↓</div></section><section class="project"><header><span>01 / THE BRIEF</span><h2>Less house.<br>More <em>habitat.</em></h2></header><div class="columns"><p>The clients asked for privacy without enclosure: a calm refuge for three generations on a dense urban lot.</p><p>Rooms gather around a shaded garden. Deep eaves, operable screens, and cross-ventilation reduce cooling demand while keeping the house open to weather.</p></div><div class="facts"><div><b>420 m²</b><span>GROSS FLOOR AREA</span></div><div><b>38%</b><span>PLANTED SITE AREA</span></div><div><b>2026</b><span>EXPECTED COMPLETION</span></div></div></section><section class="gallery"><div class="photo p1"><span>MORNING COURT / 07:14</span></div><div class="photo p2"><span>SCREEN STUDY / DETAIL 04</span></div></section><section class="work"><span>SELECTED WORK / 2022—26</span><article><small>01</small><h3>Courtyard House</h3><p>Manila / Residential</p></article><article><small>02</small><h3>Common Ground</h3><p>Quezon City / Workplace</p></article><article><small>03</small><h3>Tidal Library</h3><p>La Union / Civic</p></article></section><footer id="contact"><p>Have a place in mind?</p><a href="mailto:studio@example.com">studio@lumina.archi ↗</a></footer></main>`;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xd8d6ce, 10, 24);
const camera = new THREE.PerspectiveCamera(
  29,
  innerWidth / innerHeight,
  0.1,
  80,
);
camera.position.set(7, 5.2, 10);
camera.lookAt(0, 0.8, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
const model = new THREE.Group();
scene.add(model);
const concrete = new THREE.MeshStandardMaterial({
  color: 0xbab8b0,
  roughness: 0.9,
});
const wood = new THREE.MeshStandardMaterial({
  color: 0x6f513a,
  roughness: 0.72,
});
const glass = new THREE.MeshPhysicalMaterial({
  color: 0x9bb6b4,
  transmission: 0.72,
  transparent: true,
  opacity: 0.55,
  roughness: 0.08,
  metalness: 0.05,
});
const dark = new THREE.MeshStandardMaterial({
  color: 0x292a28,
  roughness: 0.5,
});
const addBox = (s, p, m = concrete) => {
  const x = new THREE.Mesh(new THREE.BoxGeometry(...s), m);
  x.position.set(...p);
  x.castShadow = x.receiveShadow = true;
  model.add(x);
  return x;
};
addBox([6, 0.25, 4], [0, 0, 0]);
addBox([1.7, 2.5, 3.6], [-2, 1.35, 0]);
addBox([2.7, 1.55, 1.45], [1.35, 0.87, -1.05], glass);
addBox([2.7, 0.18, 1.65], [1.35, 1.72, -1.05]);
addBox([1.5, 0.25, 1.25], [1.8, 2.4, 0.8]);
for (let i = 0; i < 8; i++)
  addBox([0.055, 2.05, 0.08], [0.05 + i * 0.25, 1.2, 1.85], wood);
addBox(
  [1.95, 0.08, 3.2],
  [1.05, 0.12, 0.15],
  new THREE.MeshStandardMaterial({
    color: 0x58716a,
    roughness: 0.18,
    metalness: 0.1,
  }),
);
for (let i = 0; i < 5; i++) {
  const step = addBox(
    [1.2, 0.12, 0.34],
    [-0.45 + i * 0.25, 0.35 + i * 0.22, -0.15],
    dark,
  );
  step.rotation.y = 0.05;
}
const trunk = new THREE.Mesh(
  new THREE.CylinderGeometry(0.07, 0.12, 1.8, 10),
  wood,
);
trunk.position.set(0.6, 1, 1);
model.add(trunk);
for (let i = 0; i < 5; i++) {
  const leaf = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.5 + Math.random() * 0.25, 1),
    new THREE.MeshStandardMaterial({ color: 0x52664d, roughness: 1 }),
  );
  leaf.position.set(
    0.6 + (Math.random() - 0.5) * 0.7,
    2 + Math.random() * 0.8,
    1 + (Math.random() - 0.5) * 0.6,
  );
  leaf.castShadow = true;
  model.add(leaf);
}
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: 0xbebdb5, roughness: 1 }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);
scene.add(new THREE.HemisphereLight(0xffffff, 0x77736a, 1.7));
const sun = new THREE.DirectionalLight(0xffe8c6, 4.5);
sun.position.set(-5, 10, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);
const note = document.createElement("div");
note.style.cssText =
  "position:fixed;z-index:3;right:4vw;bottom:4vh;font:10px DM Mono;color:#beff28;opacity:0;transition:.3s;pointer-events:none";
document.body.append(note);
document.querySelector(".project").style.background =
  "linear-gradient(90deg,#181818 0 57%,#181818ed 72%,#18181822)";
let ry = -0.45,
  rx = 0;
addEventListener("pointermove", (e) => {
  if (e.buttons) {
    ry += e.movementX * 0.006;
    rx += e.movementY * 0.003;
  }
});
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
function loop() {
  const s = scrollY / innerHeight,
    reveal =
      THREE.MathUtils.smoothstep(s, 0.75, 1.7) *
      (1 - THREE.MathUtils.smoothstep(s, 3.2, 4.1));
  model.rotation.y += (ry + reveal * 0.75 - model.rotation.y) * 0.055;
  model.rotation.x += (rx - reveal * 0.14 - model.rotation.x) * 0.055;
  model.position.x = innerWidth < 700 ? 1.2 : 2.1;
  model.position.y = -Math.min(s, 1) * 0.35 + reveal * 0.25;
  model.scale.setScalar(1 - reveal * 0.12);
  note.textContent =
    reveal > 0.15 ? "SECTIONAL ORBIT / CONCRETE · TIMBER · LOW-E GLASS" : "";
  note.style.opacity = reveal > 0.15 ? "1" : "0";
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
