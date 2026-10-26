import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { setupExperience } from "./experience.js";
import "./style.css";
document.querySelector("#app").innerHTML =
  `<main class="site"><nav><b>nova—studio</b><div><a href="#services">Services</a><a href="#work">Work</a><a href="#process">Process</a></div><a class="navcta" href="#contact">START A PROJECT ↗</a></nav><section class="hero"><span class="overline">HUMAN-CENTERED AI SYSTEMS</span><h1>Less busywork.<br>More <em>forward.</em></h1><div class="herobottom"><p>We design practical AI workflows for ambitious teams—connecting scattered tools, repetitive tasks, and human judgment into systems that move.</p><div><b>23</b><span>WORKFLOWS<br>SHIPPED</span></div><div><b>4.8×</b><span>AVG. FASTER<br>TURNAROUND*</span></div></div></section><section class="marquee"><span>STRATEGY</span><i>✦</i><span>PROTOTYPING</span><i>✦</i><span>INTEGRATION</span><i>✦</i><span>ENABLEMENT</span></section><section class="services" id="services"><div><span class="overline">WHAT WE BUILD / 01—04</span><h2>Intelligence that fits the way your team works.</h2></div><div class="service-list"><article><b>01</b><h3>Knowledge systems</h3><p>Make scattered company knowledge searchable, trustworthy, and useful in the flow of work.</p><span>↗</span></article><article><b>02</b><h3>Document operations</h3><p>Extract, validate, route, and summarize high-volume documents with human review built in.</p><span>↗</span></article><article><b>03</b><h3>Customer workflows</h3><p>Give teams faster context and consistent first drafts without losing their judgment or voice.</p><span>↗</span></article><article><b>04</b><h3>Internal copilots</h3><p>Purpose-built assistants grounded in your processes, permissions, and quality standards.</p><span>↗</span></article></div></section><section class="case" id="work"><span class="overline">SELECTED SYSTEM / FIELDNOTE</span><div><h2>From six hours<br>to forty minutes.</h2><p>A research team was spending most of Monday assembling weekly market briefs. We mapped the sources, automated collection and comparison, and kept analysts in control of every conclusion.</p></div><div class="metrics"><div><b>89%</b><span>LESS PREPARATION TIME</span></div><div><b>100%</b><span>HUMAN-REVIEWED OUTPUT</span></div><div><b>3 WK</b><span>FROM MAP TO PILOT</span></div></div><small>*Illustrative portfolio case study, not a real client claim.</small></section><section class="process" id="process"><span class="overline">HOW WE WORK / NO BLACK BOXES</span><h2>Start narrow.<br>Learn quickly.<br><em>Scale what works.</em></h2><div class="steps"><article><b>01 / MAP</b><h3>Find the friction.</h3><p>We trace the real workflow with the people doing it every day.</p></article><article><b>02 / MAKE</b><h3>Prove the value.</h3><p>A focused pilot tests usefulness, risk, and adoption in weeks.</p></article><article><b>03 / MOVE</b><h3>Ship with confidence.</h3><p>Training, documentation, monitoring, and ownership come standard.</p></article></div></section><footer id="contact"><span class="overline">HAVE A STUBBORN WORKFLOW?</span><h2>Let's make it<br><em>move.</em></h2><a href="mailto:hello@example.com">HELLO@NOVA.STUDIO ↗</a></footer></main>`;
setupExperience({
  tone: 82,
  accent: "#bdafff",
  target: "#contact",
  eyebrow: "OPERATING PRINCIPLES / 01—03",
  title: "Useful AI earns trust in the details.",
  intro:
    "We make the invisible parts of an automated workflow legible: what it knows, when it acts, and where a person remains accountable.",
  items: [
    [
      "Visible sources",
      "Every important output can point back to the information that shaped it.",
    ],
    [
      "Human thresholds",
      "Teams define when the system proceeds and when it asks for judgment.",
    ],
    [
      "Measured quality",
      "Evaluation continues after launch using examples drawn from real work.",
    ],
  ],
});
const scene = new THREE.Scene(),
  camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 9;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
const net = new THREE.Group();
scene.add(net);
const pts = [
  [-2.4, 1.1, 0],
  [-1.1, 2, -0.5],
  [0.55, 1.75, 0.3],
  [2.2, 0.8, -0.4],
  [2.35, -0.8, 0.2],
  [0.65, -1.55, -0.3],
  [-1.2, -1.4, 0.35],
  [-2.5, -0.45, -0.2],
  [0, 0.15, 0.75],
];
const violet = new THREE.MeshPhysicalMaterial({
  color: 0x7654ff,
  metalness: 0.25,
  roughness: 0.18,
  transmission: 0.12,
  clearcoat: 1,
});
const pearl = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.5,
  roughness: 0.16,
});
pts.forEach((p, i) => {
  const node = new THREE.Mesh(
    new THREE.IcosahedronGeometry(i === 8 ? 0.38 : 0.16, i === 8 ? 4 : 2),
    i === 8 ? violet : pearl,
  );
  node.position.set(...p);
  net.add(node);
  if (i !== 8) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...p),
      new THREE.Vector3(p[0] / 2, p[1] / 2, p[2] + 0.5),
      new THREE.Vector3(...pts[8]),
    ]);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 24, 0.018, 6, false),
      new THREE.MeshBasicMaterial({
        color: 0x7654ff,
        transparent: true,
        opacity: 0.5,
      }),
    );
    net.add(tube);
  }
});
const dustGeo = new THREE.BufferGeometry(),
  dust = new Float32Array(450);
for (let i = 0; i < dust.length; i++) dust[i] = (Math.random() - 0.5) * 7;
dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
net.add(
  new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0x7654ff, size: 0.025 }),
  ),
);
scene.add(new THREE.HemisphereLight(0xffffff, 0x8888ff, 2.2));
const key = new THREE.PointLight(0x7654ff, 55);
key.position.set(3, 3, 4);
scene.add(key);
const note = document.createElement("div");
note.style.cssText =
  "position:fixed;z-index:3;right:4vw;bottom:4vh;font:10px Geist;color:#bdafff;opacity:0;transition:.3s;pointer-events:none";
document.body.append(note);
document.querySelector(".services").style.background =
  "linear-gradient(90deg,#211e24 0 57%,#211e24ed 72%,#211e2422)";
let mx = 0,
  my = 0;
addEventListener("pointermove", (e) => {
  mx = (e.clientX / innerWidth - 0.5) * 0.7;
  my = (e.clientY / innerHeight - 0.5) * 0.4;
});
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
function loop(t) {
  const page =
    scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight);
  renderer.domElement.style.opacity = String(
    1 - THREE.MathUtils.smoothstep(page, 0.82, 0.94),
  );
  const s = scrollY / innerHeight;
  const open =
    THREE.MathUtils.smoothstep(s, 0.7, 1.55) *
    (1 - THREE.MathUtils.smoothstep(s, 3.35, 4.25));
  net.rotation.y += (mx + open * 0.65 - net.rotation.y) * 0.035;
  net.rotation.x += (my - open * 0.12 - net.rotation.x) * 0.035;
  net.rotation.z = t * 0.000055;
  net.position.set(
    innerWidth < 700 ? 1.2 : 2,
    -Math.min(s, 1) * 0.38 + Math.sin(t * 0.0007) * 0.08,
    0,
  );
  net.children
    .filter((x) => x.isMesh && !x.geometry.type.includes("Tube"))
    .forEach((n, i) =>
      n.scale.setScalar(1 + open * 0.5 + Math.sin(t * 0.0018 + i) * 0.08),
    );
  net.children
    .filter((x) => x.geometry?.type?.includes("Tube"))
    .forEach((tube, i) => {
      tube.material.opacity =
        0.28 + open * 0.55 + Math.sin(t * 0.002 + i) * 0.08;
    });
  key.position.x = 3 + Math.sin(t * 0.0005) * 2;
  key.intensity = 45 + open * 25 + Math.sin(t * 0.001) * 8;
  note.textContent =
    open > 0.15
      ? "LIVE WORKFLOW / INPUT · REASONING · HUMAN REVIEW · OUTPUT"
      : "";
  note.style.opacity = open > 0.15 ? "1" : "0";
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
