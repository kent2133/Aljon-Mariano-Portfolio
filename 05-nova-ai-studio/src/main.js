import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { setupExperience } from "./experience.js";
import "./style.css";
document.querySelector("#app").innerHTML =
  `<main class="site"><nav><b>nova-studio</b><div><a href="#services">Services</a><a href="#work">Work</a><a href="#process">Process</a></div><a class="navcta" href="#contact">START A PROJECT ↗</a></nav><section class="hero"><span class="overline">HUMAN-CENTERED AI SYSTEMS</span><h1>Less busywork.<br>More <em>forward.</em></h1><div class="herobottom"><p>We design practical AI workflows for ambitious teams - connecting scattered tools, repetitive tasks, and human judgment into systems that move.</p><div><b>23</b><span>WORKFLOWS<br>SHIPPED</span></div><div><b>4.8×</b><span>AVG. FASTER<br>TURNAROUND*</span></div></div></section><section class="marquee"><span>STRATEGY</span><i>✦</i><span>PROTOTYPING</span><i>✦</i><span>INTEGRATION</span><i>✦</i><span>ENABLEMENT</span></section><section class="services" id="services"><div><span class="overline">WHAT WE BUILD / 01-04</span><h2>Intelligence that fits the way your team works.</h2></div><div class="service-list"><article><b>01</b><h3>Knowledge systems</h3><p>Make scattered company knowledge searchable, trustworthy, and useful in the flow of work.</p><span>↗</span></article><article><b>02</b><h3>Document operations</h3><p>Extract, validate, route, and summarize high-volume documents with human review built in.</p><span>↗</span></article><article><b>03</b><h3>Customer workflows</h3><p>Give teams faster context and consistent first drafts without losing their judgment or voice.</p><span>↗</span></article><article><b>04</b><h3>Internal copilots</h3><p>Purpose-built assistants grounded in your processes, permissions, and quality standards.</p><span>↗</span></article></div></section><section class="case" id="work"><span class="overline">SELECTED SYSTEM / FIELDNOTE</span><div><h2>From six hours<br>to forty minutes.</h2><p>A research team was spending most of Monday assembling weekly market briefs. We mapped the sources, automated collection and comparison, and kept analysts in control of every conclusion.</p></div><div class="metrics"><div><b>89%</b><span>LESS PREPARATION TIME</span></div><div><b>100%</b><span>HUMAN-REVIEWED OUTPUT</span></div><div><b>3 WK</b><span>FROM MAP TO PILOT</span></div></div><small>*Illustrative portfolio case study, not a real client claim.</small></section><section class="process" id="process"><span class="overline">HOW WE WORK / NO BLACK BOXES</span><h2>Start narrow.<br>Learn quickly.<br><em>Scale what works.</em></h2><div class="steps"><article><b>01 / MAP</b><h3>Find the friction.</h3><p>We trace the real workflow with the people doing it every day.</p></article><article><b>02 / MAKE</b><h3>Prove the value.</h3><p>A focused pilot tests usefulness, risk, and adoption in weeks.</p></article><article><b>03 / MOVE</b><h3>Ship with confidence.</h3><p>Training, documentation, monitoring, and ownership come standard.</p></article></div></section><footer id="contact"><span class="overline">HAVE A STUBBORN WORKFLOW?</span><h2>Let's make it<br><em>move.</em></h2><a href="https://aljon-mariano-contact.vercel.app/" aria-label="Contact Aljon Mariano">CONTACT ALJON ↗</a></footer></main>`;
setupExperience({
  tone: 82,
  accent: "#bdafff",
  target: "#contact",
  eyebrow: "OPERATING PRINCIPLES / 01-03",
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
const nodes = [],
  tubes = [],
  packets = [];
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
  node.userData.home = new THREE.Vector3(...p);
  nodes.push(node);
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
    tubes.push(tube);
    net.add(tube);
  }
});
for (let i = 0; i < 8; i++) {
  const packet = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xc9bcff }),
  );
  packets.push(packet);
  net.add(packet);
}
const reviewRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.05, 0.035, 12, 80),
  new THREE.MeshBasicMaterial({
    color: 0xcaff55,
    transparent: true,
    opacity: 0,
  }),
);
reviewRing.position.set(0, 0.15, 0.75);
net.add(reviewRing);
const liveLinks = Array.from({ length: 8 }, () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(6), 3),
  );
  const line = new THREE.Line(
    geometry,
    new THREE.LineBasicMaterial({
      color: 0xbdafff,
      transparent: true,
      opacity: 0.55,
    }),
  );
  net.add(line);
  return line;
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
const stageSections = [
  document.querySelector(".hero"),
  document.querySelector("#services"),
  document.querySelector("#work"),
  document.querySelector("#process"),
  document.querySelector(".experience-context"),
  document.querySelector("#contact"),
].filter(Boolean);
let stage = 0;
let announcedStage = -1;
const layouts = [
  pts,
  [
    [-2.4, 1.4, 0],
    [-0.8, 1.4, 0.2],
    [0.8, 1.4, -0.2],
    [2.4, 1.4, 0],
    [-2.4, -1, 0.1],
    [-0.8, -1, -0.2],
    [0.8, -1, 0.2],
    [2.4, -1, -0.1],
    [0, 0.2, 0.9],
  ],
  pts.map((_, i) => [-3 + i * 0.75, Math.sin(i * 0.9) * 0.42, (i % 2) * 0.25]),
  pts.map((_, i) => [
    -2 + (i % 3) * 2,
    1.35 - Math.floor(i / 3) * 1.25,
    (i % 2) * 0.35,
  ]),
  pts.map((_, i) => {
    const a = (i / pts.length) * Math.PI * 2;
    return [Math.cos(a) * 2.25, Math.sin(a) * 2.25, i === 8 ? 0.9 : 0];
  }),
  pts.map((_, i) => [pts[i][0] * 0.18, pts[i][1] * 0.18, pts[i][2] * 0.18]),
];
const sampleLayout = (index, value) => {
  const lo = Math.floor(value),
    hi = Math.min(layouts.length - 1, Math.ceil(value)),
    mix = value - lo;
  const a = layouts[lo][index],
    b = layouts[hi][index];
  return new THREE.Vector3(
    THREE.MathUtils.lerp(a[0], b[0], mix),
    THREE.MathUtils.lerp(a[1], b[1], mix),
    THREE.MathUtils.lerp(a[2], b[2], mix),
  );
};
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
  const targetStage = stageSections.reduce(
    (best, section, index) => {
      const distance = Math.abs(
        section.getBoundingClientRect().top - innerHeight * 0.28,
      );
      return distance < best.distance ? { index, distance } : best;
    },
    { index: 0, distance: Infinity },
  ).index;
  if (targetStage !== announcedStage) {
    announcedStage = targetStage;
    window.siteAudio?.setScene(targetStage);
  }
  stage += (targetStage - stage) * 0.045;
  renderer.domElement.style.opacity = "1";
  net.rotation.y += (mx + stage * 0.16 - net.rotation.y) * 0.035;
  net.rotation.x += (my - stage * 0.025 - net.rotation.x) * 0.035;
  net.rotation.z = t * 0.000055;
  net.position.set(innerWidth < 700 ? 1.2 : 2, Math.sin(t * 0.0007) * 0.08, 0);
  nodes.forEach((node, i) => {
    node.position.lerp(sampleLayout(i, stage), 0.075);
    const processPulse =
      Math.round(stage) === 3
        ? Math.max(0, Math.sin(t * 0.003 - (i % 3) * 1.4)) * 0.32
        : 0;
    node.scale.setScalar(1 + processPulse + Math.sin(t * 0.0018 + i) * 0.07);
  });
  tubes.forEach((tube, i) => {
    tube.material.opacity =
      (0.14 + Math.max(0, Math.sin(t * 0.0025 - i * 0.45)) * 0.55) *
      (1 - THREE.MathUtils.smoothstep(stage, 0.15, 0.75));
    tube.scale.setScalar(Math.max(0.18, 1 - stage * 0.08));
  });
  liveLinks.forEach((line, i) => {
    const positions = line.geometry.attributes.position.array;
    positions.set([
      nodes[i].position.x,
      nodes[i].position.y,
      nodes[i].position.z,
      nodes[8].position.x,
      nodes[8].position.y,
      nodes[8].position.z,
    ]);
    line.geometry.attributes.position.needsUpdate = true;
    line.material.opacity = 0.22 + Math.max(0, Math.sin(t * 0.002 - i)) * 0.42;
  });
  packets.forEach((packet, i) => {
    const source = nodes[i],
      destination = nodes[8],
      progress = (t * 0.00018 + i / packets.length) % 1;
    packet.position.lerpVectors(
      source.position,
      destination.position,
      progress,
    );
    packet.position.z += Math.sin(progress * Math.PI) * 0.65;
    packet.scale.setScalar(0.65 + Math.sin(progress * Math.PI) * 0.75);
  });
  reviewRing.position.copy(nodes[8].position);
  reviewRing.material.opacity =
    THREE.MathUtils.smoothstep(stage, 3.55, 4.05) *
    (1 - THREE.MathUtils.smoothstep(stage, 4.65, 5));
  reviewRing.rotation.z = t * 0.00035;
  reviewRing.rotation.x = Math.sin(t * 0.0004) * 0.35;
  key.position.x = 3 + Math.sin(t * 0.0005) * 2;
  key.intensity = 45 + stage * 5 + Math.sin(t * 0.001) * 8;
  const labels = [
    "CONNECTED SYSTEM / PEOPLE · TOOLS · KNOWLEDGE",
    "SERVICE CLUSTERS / SEARCH · DOCUMENTS · CUSTOMERS · COPILOTS",
    "FIELDNOTE PIPELINE / SIX HOURS → FORTY MINUTES",
    "DELIVERY LOOP / MAP · MAKE · MOVE",
    "HUMAN REVIEW / VISIBLE SOURCES · DECISION THRESHOLDS",
    "CONVERGENCE / LET'S MAKE IT MOVE",
  ];
  note.textContent = labels[Math.round(stage)];
  note.style.opacity = "1";
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
