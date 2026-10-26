import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import "./style.css";
document.querySelector("#app").innerHTML =
  `<main class="ui"><nav><b>VOLT//R</b><div><a href="#machine">Machine</a><a href="#performance">Performance</a><a href="#configure">Configure</a></div><a href="#reserve">RESERVE / 001</a></nav><section class="hero" id="machine"><span class="eyebrow">VOLT R-01 / ELECTRIC STREETFIGHTER</span><h1>SILENT<br><i>/ SAVAGE</i></h1><div class="herofoot"><p>Built around instant torque and nothing unnecessary. The R-01 turns electricity into a sharper kind of motion.</p><span>DRAG TO ROTATE ↔</span></div></section><section class="stats" id="performance"><div><b>2.8<span>S</span></b><small>0—100 KM/H</small></div><div><b>220<span>KM</span></b><small>URBAN RANGE*</small></div><div><b>165<span>HP</span></b><small>PEAK POWER</small></div><div><b>18<span>MIN</span></b><small>20—80% CHARGE*</small></div></section><section class="engineering"><span class="eyebrow">01 / CORE ENGINEERING</span><div><h2>Mass centralized.<br>Response amplified.</h2><p>The structural battery sits low inside a cast-aluminum frame, concentrating weight between the wheels. The result is immediate direction change without sacrificing high-speed composure.</p></div><div class="tech"><article><b>01</b><h3>Structural pack</h3><p>Liquid-cooled cells form a rigid stressed member at the motorcycle's center.</p></article><article><b>02</b><h3>Direct drive</h3><p>No clutch, no gearbox, no delay between your wrist and the rear wheel.</p></article><article><b>03</b><h3>Active recovery</h3><p>Lean-aware regeneration adapts to grip, gradient, and riding mode.</p></article></div></section><section class="config" id="configure"><div><span class="eyebrow">02 / BUILD YOUR R-01</span><h2>Choose your<br>signal.</h2><p>Tap a finish to update the motorcycle in real time.</p></div><div class="panel"><label>BODY FINISH</label><div class="swatches"><button data-color="c7ff00" class="lime" aria-label="Acid lime"></button><button data-color="aeb3b8" class="silver" aria-label="Liquid silver"></button><button data-color="ec3327" class="red" aria-label="Signal red"></button><button data-color="171717" class="black" aria-label="Carbon black"></button></div><hr><label>RIDE POSITION</label><div class="choices"><button class="selected">STREET</button><button>TRACK</button><button>TOUR</button></div><hr><p class="price">CONCEPT SPECIFICATION <b>$28,900</b></p></div></section><section class="reserve" id="reserve"><span>FOUNDERS SERIES / 001—100</span><h2>Make some<br>quiet noise.</h2><a href="mailto:ride@example.com">REQUEST A PRIVATE PREVIEW →</a><small>*Illustrative portfolio concept. Specifications are not production claims.</small></section></main>`;
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0.45, 10);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
const bike = new THREE.Group();
scene.add(bike);
const rubber = new THREE.MeshPhysicalMaterial({
  color: 0x090909,
  roughness: 0.68,
});
const metal = new THREE.MeshPhysicalMaterial({
  color: 0x343638,
  metalness: 0.9,
  roughness: 0.2,
});
const bodyMat = new THREE.MeshPhysicalMaterial({
  color: 0xc7ff00,
  metalness: 0.55,
  roughness: 0.18,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
});
const brake = new THREE.MeshStandardMaterial({
  color: 0x9e281f,
  metalness: 0.55,
  roughness: 0.3,
});
[-2.15, 2.15].forEach((x) => {
  const wheel = new THREE.Group();
  const tire = new THREE.Mesh(
    new THREE.TorusGeometry(1.12, 0.19, 24, 72),
    rubber,
  );
  tire.rotation.y = Math.PI / 2;
  wheel.add(tire);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.055, 12, 64),
    metal,
  );
  rim.rotation.y = Math.PI / 2;
  wheel.add(rim);
  for (let i = 0; i < 10; i++) {
    const spoke = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.72, 0.035),
      metal,
    );
    spoke.rotation.z = (i * Math.PI) / 5;
    wheel.add(spoke);
  }
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.43, 0.43, 0.035, 40),
    metal,
  );
  disc.rotation.z = Math.PI / 2;
  wheel.add(disc);
  const caliper = new THREE.Mesh(
    new RoundedBoxGeometry(0.13, 0.38, 0.12, 3, 0.04),
    brake,
  );
  caliper.position.set(0, 0.35, 0.12);
  wheel.add(caliper);
  wheel.position.set(x, -0.85, 0);
  bike.add(wheel);
});
const battery = new THREE.Mesh(
  new RoundedBoxGeometry(2.15, 1.18, 0.95, 8, 0.16),
  metal,
);
battery.position.set(-0.1, -0.02, 0);
bike.add(battery);
const tank = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), bodyMat);
tank.scale.set(1.55, 0.6, 0.72);
tank.position.set(-0.25, 0.86, 0);
bike.add(tank);
const seat = new THREE.Mesh(
  new RoundedBoxGeometry(1.55, 0.22, 0.68, 5, 0.08),
  rubber,
);
seat.position.set(1, 1.15, 0);
seat.rotation.z = -0.09;
bike.add(seat);
[-0.14, 0.14].forEach((z) => {
  const fork = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.07, 2.45, 16),
    metal,
  );
  fork.position.set(-1.75, 0.05, z);
  fork.rotation.z = -0.34;
  bike.add(fork);
});
const motor = new THREE.Mesh(
  new THREE.CylinderGeometry(0.55, 0.55, 0.82, 48),
  metal,
);
motor.rotation.x = Math.PI / 2;
motor.position.set(0.25, -0.28, 0);
bike.add(motor);
const frame = new THREE.Mesh(
  new THREE.TorusGeometry(1.22, 0.065, 14, 48, Math.PI),
  bodyMat,
);
frame.rotation.x = Math.PI / 2;
frame.position.set(0.05, 0.05, 0);
bike.add(frame);
const bar = new THREE.Mesh(
  new THREE.CylinderGeometry(0.035, 0.035, 1.5, 12),
  metal,
);
bar.rotation.x = Math.PI / 2;
bar.position.set(-1.35, 1.3, 0);
bike.add(bar);
scene.add(new THREE.HemisphereLight(0xffffff, 0x111111, 1.8));
const key = new THREE.SpotLight(0xffffff, 95, 30, 0.55, 0.35);
key.position.set(-5, 8, 7);
key.castShadow = true;
scene.add(key);
const rimlight = new THREE.PointLight(0xc7ff00, 40);
rimlight.position.set(5, 1, 3);
scene.add(rimlight);
document
  .querySelectorAll(".swatches button")
  .forEach((b) => (b.onclick = () => bodyMat.color.set(`#${b.dataset.color}`)));
document.querySelectorAll(".choices button").forEach(
  (b) =>
    (b.onclick = () => {
      document
        .querySelectorAll(".choices button")
        .forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    }),
);
const note = document.createElement("div");
note.style.cssText =
  "position:fixed;z-index:3;right:4vw;bottom:4vh;font:10px monospace;color:#c7ff00;opacity:0;transition:.3s;pointer-events:none";
document.body.append(note);
document.querySelector(".engineering").style.background =
  "linear-gradient(90deg,#141414 0 56%,#141414ed 72%,#09090922)";
let ry = -0.25,
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
function loop(t) {
  const page = scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  renderer.domElement.style.opacity = String(1 - THREE.MathUtils.smoothstep(page, 0.82, 0.94));
  const s = scrollY / innerHeight;
  const open =
    THREE.MathUtils.smoothstep(s, 0.72, 1.55) *
    (1 - THREE.MathUtils.smoothstep(s, 3.25, 4.15));
  bike.rotation.y += (ry + open * 0.38 - bike.rotation.y) * 0.06;
  bike.rotation.x += (rx - open * 0.08 - bike.rotation.x) * 0.06;
  bike.position.set(
    innerWidth < 700 ? 0.8 : 1.75,
    -Math.min(s, 1) * 0.35 + Math.sin(t * 0.0007) * 0.025,
    0,
  );
  battery.position.y = -0.02 - open * 0.55;
  tank.position.y = 0.86 + open * 0.85;
  seat.position.set(1 + open * 0.5, 1.15 + open * 0.45, 0);
  motor.position.y = -0.28 - open * 0.25;
  frame.position.z = open * 0.55;
  bar.position.y = 1.3 + open * 0.7;
  note.textContent =
    open > 0.15 ? "EXPLODED POWERTRAIN / STRUCTURAL PACK · MOTOR · FRAME" : "";
  note.style.opacity = open > 0.15 ? "1" : "0";
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
