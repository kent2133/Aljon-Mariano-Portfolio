import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import "./style.css";

document.querySelector("#app").innerHTML =
  `<main><nav><b>AETHER<sup>®</sup></b><div><a href="#sound">Sound</a><a href="#craft">Craft</a><a href="#comfort">Comfort</a></div><a class="pill outline" href="#reserve">Reserve</a></nav><section class="hero"><div class="copy"><span class="kicker">AETHER ONE / SPATIAL HEADPHONES</span><h1>Feel the space<br><i>between</i> sounds.</h1><p>Reference-grade wireless headphones shaped around how humans actually hear. Precise, spacious, and quiet when the world is not.</p><div class="actions"><a class="pill lime" href="#reserve">Reserve Aether One</a><span>$549 · Ships spring 2027</span></div></div><div class="drag">DRAG TO INSPECT <span>↔</span></div><div class="scroll">SCROLL TO DISCOVER ↓</div></section><section class="numbers" id="sound"><div><strong>40<span>mm</span></strong><p>Bio-cellulose<br>dynamic drivers</p></div><div><strong>−42<span>dB</span></strong><p>Adaptive noise<br>cancellation</p></div><div><strong>52<span>hr</span></strong><p>Listening from<br>a single charge</p></div><div><strong>24<span>bit</span></strong><p>Lossless audio<br>over USB-C</p></div></section><section class="story dark" id="craft"><div class="label">01 / MATERIAL INTELLIGENCE</div><div><h2>Built to disappear.<br><em>Made to endure.</em></h2><p>Bead-blasted aluminum carries the structure. Memory foam forms a gentle seal. Every high-contact component is replaceable, so Aether One can stay with you for years.</p></div><div class="material-grid"><article><span>01</span><h3>Recycled aluminum</h3><p>A rigid, featherweight frame machined to precise tolerances.</p></article><article><span>02</span><h3>Acoustic knit</h3><p>Breathable inner mesh protects the driver without coloring sound.</p></article><article><span>03</span><h3>Protein leather</h3><p>Soft, durable cushions engineered for extended sessions.</p></article></div></section><section class="story light" id="comfort"><div class="label">02 / PERSONAL ACOUSTICS</div><div><h2>Tuned to your ears,<br>not an average.</h2><p>A rapid calibration maps the way your ears perceive space, then adapts the sound field while head tracking keeps every instrument anchored.</p></div><div class="feature"><span>PERSONAL PROFILE</span><div class="wave"></div><strong>03:24</strong></div></section><section class="reserve" id="reserve"><span class="kicker">FIRST EDITION / 500 UNITS</span><h2>Hear what<br>you've been missing.</h2><a class="pill darkpill" href="mailto:hello@example.com?subject=Aether%20One%20reservation">Join the reservation list →</a></section></main>`;

const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0.1, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const rig = new THREE.Group();
scene.add(rig);
const metal = new THREE.MeshPhysicalMaterial({
  color: 0x252627,
  metalness: 0.85,
  roughness: 0.19,
  clearcoat: 0.45,
});
const edge = new THREE.MeshPhysicalMaterial({
  color: 0xa8adb0,
  metalness: 1,
  roughness: 0.14,
});
const leather = new THREE.MeshPhysicalMaterial({
  color: 0x151516,
  roughness: 0.62,
  clearcoat: 0.2,
});
const cloth = new THREE.MeshStandardMaterial({
  color: 0x383a38,
  roughness: 0.95,
});
const accent = new THREE.MeshStandardMaterial({
  color: 0xcaff63,
  roughness: 0.28,
  metalness: 0.15,
});
const explode = [];
const outerBand = new THREE.Mesh(
  new THREE.TorusGeometry(2.35, 0.13, 24, 120, Math.PI),
  metal,
);
outerBand.position.y = 0.55;
rig.add(outerBand);
const innerBand = new THREE.Mesh(
  new THREE.TorusGeometry(2.13, 0.11, 20, 100, Math.PI * 0.92),
  leather,
);
innerBand.position.set(0.18, 0.5, 0);
rig.add(innerBand);
explode.push(
  [outerBand, new THREE.Vector3(0, 0.42, 0)],
  [innerBand, new THREE.Vector3(0, 0.78, 0)],
);
[-1, 1].forEach((s) => {
  const cup = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.94, 0.94, 0.38, 64),
    metal,
  );
  shell.rotation.z = Math.PI / 2;
  shell.castShadow = true;
  cup.add(shell);
  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(0.77, 0.77, 0.405, 64),
    edge,
  );
  plate.rotation.z = Math.PI / 2;
  plate.position.x = s * 0.22;
  cup.add(plate);
  const pad = new THREE.Mesh(
    new THREE.TorusGeometry(0.69, 0.2, 24, 64),
    leather,
  );
  pad.rotation.y = Math.PI / 2;
  pad.position.x = -s * 0.31;
  cup.add(pad);
  const fabric = new THREE.Mesh(new THREE.CircleGeometry(0.55, 48), cloth);
  fabric.rotation.y = (s * Math.PI) / 2;
  fabric.position.x = -s * 0.33;
  cup.add(fabric);
  cup.position.set(s * 2.28, -0.72, 0);
  rig.add(cup);
  const yoke = new THREE.Mesh(
    new RoundedBoxGeometry(0.22, 1.18, 0.24, 5, 0.08),
    edge,
  );
  yoke.position.set(s * 2.28, -0.02, 0);
  rig.add(yoke);
  const joint = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.34, 32),
    accent,
  );
  joint.rotation.z = Math.PI / 2;
  joint.position.set(s * 2.28, -0.43, 0);
  rig.add(joint);
  explode.push(
    [shell, new THREE.Vector3(s * 0.7, 0, 0)],
    [plate, new THREE.Vector3(s * 1.05, 0, 0)],
    [pad, new THREE.Vector3(-s * 0.62, 0, 0)],
    [fabric, new THREE.Vector3(-s * 0.92, 0, 0)],
    [yoke, new THREE.Vector3(s * 0.25, 0.55, 0)],
    [joint, new THREE.Vector3(s * 0.4, 0.15, 0)],
  );
});
explode.forEach(([m]) => (m.userData.home = m.position.clone()));
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.ShadowMaterial({ opacity: 0.22 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.1;
floor.receiveShadow = true;
scene.add(floor);
scene.add(new THREE.HemisphereLight(0xffffff, 0x191715, 1.8));
const key = new THREE.SpotLight(0xffffff, 90, 30, 0.55, 0.35);
key.position.set(-4, 7, 7);
key.castShadow = true;
scene.add(key);
const rim = new THREE.PointLight(0xbfff58, 35);
rim.position.set(5, 1, 2);
scene.add(rim);
const note = document.createElement("div");
note.className = "scene-note";
document.body.append(note);
let tx = -0.3,
  ty = 0.08,
  drag = false;
addEventListener("pointerdown", () => (drag = true));
addEventListener("pointerup", () => (drag = false));
addEventListener("pointermove", (e) => {
  if (drag) {
    tx += e.movementX * 0.006;
    ty += e.movementY * 0.004;
  }
});
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
function loop(t) {
  const s = scrollY / innerHeight,
    open =
      THREE.MathUtils.smoothstep(s, 0.72, 1.65) *
      (1 - THREE.MathUtils.smoothstep(s, 2.85, 3.7));
  explode.forEach(([m, v]) =>
    m.position.lerp(m.userData.home.clone().addScaledVector(v, open), 0.075),
  );
  rig.rotation.y += (tx + open * 0.42 - rig.rotation.y) * 0.06;
  rig.rotation.x += (ty - rig.rotation.x) * 0.06;
  rig.rotation.z = Math.sin(t * 0.00045) * 0.018;
  rig.position.x = innerWidth < 760 ? 0.9 : 2.25;
  rig.position.y = -Math.min(s, 0.8) * 0.55;
  rig.scale.setScalar(1 - open * 0.13);
  note.textContent =
    open > 0.15 ? "EXPLODED VIEW / ALUMINUM · MEMORY FOAM · ACOUSTIC KNIT" : "";
  note.classList.toggle("show", open > 0.15);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
