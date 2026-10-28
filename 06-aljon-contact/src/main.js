import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import "./style.css";

const app = document.querySelector("#app");

app.innerHTML = `
  <canvas class="world" aria-hidden="true"></canvas>

  <header class="site-header">
    <a class="brand" href="#top" aria-label="Aljon Mariano, home">
      <span class="brand-mark">AM</span>
      <span class="brand-copy">Aljon Mariano<small>Developer / IT Specialist</small></span>
    </a>
    <nav class="nav-links" id="primary-nav" aria-label="Primary navigation">
      <a href="#about">About</a>
      <a href="#experience">Experience</a>
      <a href="#capabilities">Stack</a>
      <a href="#portfolio">Sites</a>
      <a href="#systems">Systems</a>
      <a href="#work">Work</a>
      <a class="mobile-contact-link" href="#contact">Contact</a>
    </nav>
    <a class="nav-cta" href="#contact">Let's talk <span>↗</span></a>
    <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="primary-nav">
      <span></span><span></span>
    </button>
  </header>

  <main>
    <section class="hero scene-section" id="top" data-scene="hero" data-index="01">
      <div class="hero-copy reveal">
        <p class="eyebrow"><span>Available for opportunities</span> Philippines-based</p>
        <h1>I build the<br><em>systems</em> behind<br>good work.</h1>
        <p class="hero-intro">Programmer, web developer, and IT specialist turning real operational needs into clear, dependable digital tools.</p>
        <div class="hero-actions">
          <a class="button button-primary" href="#portfolio">Explore the portfolio <span>↓</span></a>
          <a class="button button-ghost" href="mailto:aljonmariano44@gmail.com">Start a conversation <span>↗</span></a>
        </div>
      </div>
      <div class="hero-index" aria-hidden="true">
        <span>01</span>
        <div></div>
        <small>08</small>
      </div>
      <a class="scroll-cue" href="#about"><span>Scroll to connect</span><i></i></a>
    </section>

    <section class="about scene-section" id="about" data-scene="about" data-index="02">
      <div class="section-grid">
        <header class="section-heading reveal">
          <p class="section-number">02 / About the developer</p>
          <h2>Technical thinking.<br><em>Human outcomes.</em></h2>
        </header>
        <div class="about-copy reveal">
          <p class="lead">I am Aljon Kent Mariano, a BS Information Technology graduate focused on web development and useful systems.</p>
          <div class="body-copy">
            <p>My work sits where software meets day-to-day operations: organizing information, reducing repetitive steps, and giving teams a clearer view of what needs attention.</p>
            <p>From public-service programs to reservation platforms and business websites, I care about code that stays understandable, interfaces that feel direct, and solutions grounded in the people using them.</p>
          </div>
          <dl class="credential-grid">
            <div><dt>Degree</dt><dd>BSIT - Web Development<br><small>University of the Cordilleras, 2024</small></dd></div>
            <div><dt>Eligibility</dt><dd>Career Service Professional<br><small>Civil Service eligibility, 2023</small></dd></div>
            <div><dt>Base</dt><dd>Philippines-based<br><small>Open to opportunities</small></dd></div>
          </dl>
        </div>
      </div>
    </section>

    <section class="experience scene-section" id="experience" data-scene="experience" data-index="03">
      <div class="section-grid">
        <header class="section-heading reveal">
          <p class="section-number">03 / Field experience</p>
          <h2>Built inside<br><em>real workflows.</em></h2>
          <p class="section-note">A path through government information systems, employment coordination, and client-led development.</p>
        </header>
        <ol class="timeline reveal">
          <li class="is-current">
            <time>Feb 2026 - Present</time>
            <div><h3>Database Manager</h3><p>DENR - Cordillera Administrative Region</p></div>
            <span>Current</span>
          </li>
          <li>
            <time>Feb - Dec 2025</time>
            <div><h3>Programmer / TUPAD Coordinator</h3><p>DOLE - Cordillera Administrative Region</p></div>
            <span>Public service</span>
          </li>
          <li>
            <time>Nov 2024 - Present</time>
            <div><h3>Project-based Developer</h3><p>Goldsphere I.T. Solutions</p></div>
            <span>Systems</span>
          </li>
          <li>
            <time>Feb - Mar 2024</time>
            <div><h3>Freelance Web Developer</h3><p>GMC Trading</p></div>
            <span>Web</span>
          </li>
          <li>
            <time>Industry training</time>
            <div><h3>OJT System Developer</h3><p>Provincial government office</p></div>
            <span>Foundation</span>
          </li>
        </ol>
      </div>
    </section>

    <section class="capabilities scene-section" id="capabilities" data-scene="capabilities" data-index="04">
      <header class="capability-heading reveal">
        <p class="section-number">04 / Capability matrix</p>
        <h2>From interface<br>to <em>infrastructure.</em></h2>
        <p>Practical, full-stack tools selected around the problem - not the trend.</p>
      </header>
      <div class="stack-groups reveal">
        <article>
          <span>01</span><h3>Interface</h3>
          <p>HTML · CSS · JavaScript · React · AdminLTE</p>
        </article>
        <article>
          <span>02</span><h3>Application</h3>
          <p>PHP · Laravel · Python · Django · C# · C++</p>
        </article>
        <article>
          <span>03</span><h3>Data & delivery</h3>
          <p>MySQL · MongoDB · Firebase · GitHub · VS Code</p>
        </article>
      </div>
      <div class="skill-labels" aria-hidden="true">
        ${["HTML / CSS", "JavaScript", "Laravel", "React", "Python / Django", "Data systems"].map((label, index) => `<span data-node="${index}"><i></i>${label}</span>`).join("")}
      </div>
    </section>

    <section class="portfolio scene-section" id="portfolio" data-scene="portfolio" data-index="05">
      <nav class="portfolio-categories reveal" aria-label="Portfolio categories">
        <span>Explore by collection</span>
        <a class="is-active" href="#portfolio"><i>01</i> Interactive landing pages</a>
        <a href="#systems"><i>02</i> Full-stack business systems</a>
      </nav>
      <header class="portfolio-heading reveal">
        <p class="section-number">05 / Interactive landing pages</p>
        <h2>Five ideas.<br><em>Built to move.</em></h2>
        <p>Five original Three.js concepts spanning product, architecture, travel, mobility, and AI - each shaped around its own visual language and interaction model.</p>
      </header>

      <div class="portfolio-grid">
        <article class="showcase-card showcase-card-featured">
          <a class="showcase-visual" href="https://eather-headphones.vercel.app/" target="_blank" rel="noreferrer" aria-label="Open the live Aether One headphones website">
            <img src="/portfolio/aether.png" alt="Aether One spatial headphones website hero" width="1200" height="750" loading="lazy">
            <span class="showcase-index">01 / AUDIO</span>
            <span class="showcase-open">Open live site ↗</span>
          </a>
          <div class="showcase-copy">
            <div><p>Product experience</p><h3>Aether One</h3></div>
            <p>Spatial headphones revealed through scroll choreography, material callouts, color finishes, and an exploded component view.</p>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/01-aether-headphones" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>

        <article class="showcase-card">
          <a class="showcase-visual" href="https://lumina-architecture-aljon1.vercel.app/" target="_blank" rel="noreferrer" aria-label="Open the live Lumina Architecture website">
            <img src="/portfolio/lumina.png" alt="Lumina Architecture website hero" width="1200" height="750" loading="lazy">
            <span class="showcase-index">02 / SPACE</span>
            <span class="showcase-open">Open live site ↗</span>
          </a>
          <div class="showcase-copy">
            <div><p>Architecture studio</p><h3>Lumina</h3></div>
            <p>A quiet architectural case study where a house assembles by section and light becomes part of the narrative.</p>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/02-lumina-architecture" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>

        <article class="showcase-card">
          <a class="showcase-visual" href="https://orbit-travel-aljon1.vercel.app/" target="_blank" rel="noreferrer" aria-label="Open the live Orbit space travel website">
            <img src="/portfolio/orbit.png" alt="Orbit space travel website hero" width="1200" height="750" loading="lazy">
            <span class="showcase-index">03 / ORBIT</span>
            <span class="showcase-open">Open live site ↗</span>
          </a>
          <div class="showcase-copy">
            <div><p>Space tourism</p><h3>Orbit</h3></div>
            <p>An editorial journey through Earth, moon, and sunlight with a cinematic celestial system that changes on scroll.</p>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/03-orbit-travel" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>

        <article class="showcase-card">
          <a class="showcase-visual" href="https://volt-electric-aljon1.vercel.app/" target="_blank" rel="noreferrer" aria-label="Open the live Volt R electric motorcycle website">
            <img src="/portfolio/volt.png" alt="Volt R electric motorcycle website hero" width="1200" height="750" loading="lazy">
            <span class="showcase-index">04 / MOTION</span>
            <span class="showcase-open">Open live site ↗</span>
          </a>
          <div class="showcase-copy">
            <div><p>Vehicle configurator</p><h3>Volt R</h3></div>
            <p>An electric motorcycle concept with animated finishes, selectable ride positions, and section-driven mechanical states.</p>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/04-volt-electric" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>

        <article class="showcase-card">
          <a class="showcase-visual" href="https://nova-ai-studio-aljon1.vercel.app/" target="_blank" rel="noreferrer" aria-label="Open the live Nova AI Studio website">
            <img src="/portfolio/nova.png" alt="Nova AI Studio website hero" width="1200" height="750" loading="lazy">
            <span class="showcase-index">05 / SYSTEMS</span>
            <span class="showcase-open">Open live site ↗</span>
          </a>
          <div class="showcase-copy">
            <div><p>AI studio</p><h3>Nova Studio</h3></div>
            <p>A bold automation studio built around a modular workflow core, service states, and expressive scroll transitions.</p>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/05-nova-ai-studio" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>
      </div>

      <p class="portfolio-footnote reveal">Collection 01 - Original front-end concepts designed around motion, storytelling, and responsive 3D interaction.</p>
    </section>

    <section class="systems scene-section" id="systems" data-scene="systems" data-index="06">
      <header class="systems-heading reveal">
        <div>
          <p class="section-number">06 / Full-stack business systems</p>
          <h2>Real workflows.<br><em>Working software.</em></h2>
        </div>
        <p>Five role-aware applications built as one connected operations suite. Each demo combines a focused interface with server routes, permissions, validation, and an auditable workflow.</p>
      </header>

      <div class="systems-signal reveal" aria-label="Operations Suite architecture">
        <span>Next.js application layer</span><i></i><span>Signed role sessions</span><i></i><span>Validated API routes</span><i></i><span>Optional Supabase persistence</span>
      </div>

      <div class="systems-grid">
        <article class="system-card system-card-featured system-pulsedesk">
          <a class="system-visual" href="https://aljon-operations-suite.vercel.app/pulsedesk" target="_blank" rel="noreferrer" aria-label="Open the PulseDesk service operations system">
            <div class="system-window">
              <div class="window-bar"><span></span><span></span><span></span><strong>PulseDesk / Service Operations</strong></div>
              <div class="pulse-dashboard">
                <div class="mini-sidebar"><b>PD</b><i></i><i></i><i></i><i></i></div>
                <div class="pulse-main">
                  <div class="metric-strip"><span><small>Open tickets</small><strong>24</strong></span><span><small>At risk</small><strong>06</strong></span><span><small>SLA health</small><strong>91%</strong></span></div>
                  <div class="ticket-board"><span><i></i><b>Network access</b><small>High priority</small></span><span><i></i><b>Payroll login</b><small>Assigned</small></span><span><i></i><b>Device setup</b><small>In progress</small></span></div>
                </div>
              </div>
            </div>
            <span class="system-open">Launch live system ↗</span>
          </a>
          <div class="system-copy">
            <div><p>Service operations</p><h3>PulseDesk</h3></div>
            <p>A ticket command center for requesters, technicians, and administrators, with SLA health, ownership, status transitions, and an audit trail.</p>
            <ul><li>Role-based workflows</li><li>SLA monitoring</li><li>Server actions</li></ul>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/07-operations-suite/app/pulsedesk" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>

        <article class="system-card system-stockflow">
          <a class="system-visual" href="https://aljon-operations-suite.vercel.app/stockflow" target="_blank" rel="noreferrer" aria-label="Open the StockFlow inventory system">
            <div class="system-window">
              <div class="window-bar"><span></span><span></span><span></span><strong>StockFlow / Inventory</strong></div>
              <div class="stock-dashboard">
                <div class="stock-ring"><strong>84</strong><small>health</small></div>
                <div class="stock-lines"><span><b>Sensor kit</b><i style="--fill: 82%"></i></span><span><b>Field radio</b><i style="--fill: 46%"></i></span><span><b>Safety pack</b><i style="--fill: 68%"></i></span></div>
              </div>
            </div>
            <span class="system-open">Launch live system ↗</span>
          </a>
          <div class="system-copy">
            <div><p>Inventory & procurement</p><h3>StockFlow</h3></div>
            <p>Inventory control, purchase orders, receiving, and replenishment signals brought into one warehouse workspace.</p>
            <ul><li>Stock health</li><li>Purchase orders</li><li>Receiving flow</li></ul>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/07-operations-suite/app/stockflow" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>

        <article class="system-card system-approve">
          <a class="system-visual" href="https://aljon-operations-suite.vercel.app/approve" target="_blank" rel="noreferrer" aria-label="Open the Approve request governance system">
            <div class="system-window">
              <div class="window-bar"><span></span><span></span><span></span><strong>Approve / Governance</strong></div>
              <div class="approval-dashboard">
                <div class="approval-path"><span class="done">1</span><i></i><span class="done">2</span><i></i><span>3</span></div>
                <div class="approval-card"><small>Purchase request</small><strong>Field equipment refresh</strong><span>Awaiting final approval</span></div>
              </div>
            </div>
            <span class="system-open">Launch live system ↗</span>
          </a>
          <div class="system-copy">
            <div><p>Request governance</p><h3>Approve</h3></div>
            <p>A structured approval lane for submitters, reviewers, and final approvers, with visible context at every decision.</p>
            <ul><li>Approval stages</li><li>Decision history</li><li>Permission gates</li></ul>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/07-operations-suite/app/approve" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>

        <article class="system-card system-carequeue">
          <a class="system-visual" href="https://aljon-operations-suite.vercel.app/carequeue" target="_blank" rel="noreferrer" aria-label="Open the CareQueue service queue system">
            <div class="system-window">
              <div class="window-bar"><span></span><span></span><span></span><strong>CareQueue / Service Flow</strong></div>
              <div class="queue-dashboard">
                <div class="now-serving"><small>Now serving</small><strong>A-104</strong><span>Desk 03</span></div>
                <div class="queue-list"><span><b>A-105</b><small>08 min</small></span><span><b>A-106</b><small>12 min</small></span><span><b>B-031</b><small>15 min</small></span></div>
              </div>
            </div>
            <span class="system-open">Launch live system ↗</span>
          </a>
          <div class="system-copy">
            <div><p>Service queue</p><h3>CareQueue</h3></div>
            <p>A clear client journey from check-in to service completion, with reception and provider views for coordinated care.</p>
            <ul><li>Live queue</li><li>Client intake</li><li>Provider handoff</li></ul>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/07-operations-suite/app/carequeue" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>

        <article class="system-card system-routeops">
          <a class="system-visual" href="https://aljon-operations-suite.vercel.app/routeops" target="_blank" rel="noreferrer" aria-label="Open the RouteOps field dispatch system">
            <div class="system-window">
              <div class="window-bar"><span></span><span></span><span></span><strong>RouteOps / Dispatch</strong></div>
              <div class="route-dashboard">
                <div class="route-map"><span class="route-line"></span><i class="pin-one"></i><i class="pin-two"></i><i class="pin-three"></i></div>
                <div class="route-jobs"><span><i></i><b>Install / 09:30</b></span><span><i></i><b>Repair / 11:15</b></span><span><i></i><b>Inspect / 14:00</b></span></div>
              </div>
            </div>
            <span class="system-open">Launch live system ↗</span>
          </a>
          <div class="system-copy">
            <div><p>Field dispatch</p><h3>RouteOps</h3></div>
            <p>Map-led dispatch for assigning work, balancing technician capacity, and tracking field jobs from queue to completion.</p>
            <ul><li>Dispatch board</li><li>Technician load</li><li>Job lifecycle</li></ul>
            <a href="https://github.com/kent2133/Aljon-Mariano-Portfolio/tree/main/07-operations-suite/app/routeops" target="_blank" rel="noreferrer">View source ↗</a>
          </div>
        </article>
      </div>

      <p class="systems-footnote reveal"><span>One suite / five focused products</span> Demo roles make every workflow explorable; optional Supabase configuration adds durable cloud data.</p>
    </section>

    <section class="work scene-section" id="work" data-scene="work" data-index="07">
      <div class="work-heading reveal">
        <p class="section-number">07 / Professional projects</p>
        <h2>Professional<br><em>projects.</em></h2>
      </div>
      <div class="project-list reveal">
        <article class="project-card">
          <div class="project-number">01</div>
          <div><p class="project-type">Information management</p><h3>Document Tracking System</h3><p>A focused system for following documents through operational handoffs and keeping status visible.</p></div>
          <span class="project-glyph">DTS</span>
        </article>
        <article class="project-card">
          <div class="project-number">02</div>
          <div><p class="project-type">Operations / reservations</p><h3>Lakbay Reservation App</h3><p>A vehicle and facility reservation system built for public-sector operations.</p></div>
          <span class="project-glyph">LKB</span>
        </article>
        <article class="project-card">
          <div class="project-number">03</div>
          <div><p class="project-type">Community systems</p><h3>Barangay Management & Research App</h3><p>Administrative and Android research concepts shaped for local information and community services.</p></div>
          <span class="project-glyph">BRG</span>
        </article>
        <article class="project-card">
          <div class="project-number">04</div>
          <div><p class="project-type">Freelance delivery</p><h3>Company Website</h3><p>A business-facing website for GMC Trading, translating company information into a clear digital presence.</p></div>
          <span class="project-glyph">WEB</span>
        </article>
      </div>
    </section>

    <section class="contact scene-section" id="contact" data-scene="contact" data-index="08">
      <div class="contact-inner reveal">
        <p class="section-number">08 / Open channel</p>
        <h2>Have a system<br>that should work<br><em>better?</em></h2>
        <p class="contact-lead">I am open to developer and IT opportunities, project collaborations, and conversations about useful digital work.</p>
        <div class="contact-links">
          <a href="mailto:aljonmariano44@gmail.com"><span>Email</span><strong>aljonmariano44@gmail.com</strong><i>↗</i></a>
          <a href="https://www.linkedin.com/in/aljon-mariano-b45272301/" target="_blank" rel="noreferrer"><span>LinkedIn</span><strong>Connect professionally</strong><i>↗</i></a>
          <a href="https://github.com/kent2133" target="_blank" rel="noreferrer"><span>GitHub</span><strong>Explore the code</strong><i>↗</i></a>
        </div>
      </div>
      <footer>
        <p>Aljon Kent Mariano <span>© ${new Date().getFullYear()}</span></p>
        <a href="#top">Back to signal ↑</a>
      </footer>
    </section>
  </main>

  <aside class="scene-status" aria-hidden="true">
    <div class="status-orbit"><i></i><span></span></div>
    <div><small>Live scene</small><strong>Developer core</strong><p>Drag to inspect · Scroll to transform</p></div>
  </aside>

  <button class="sound-toggle" type="button" aria-pressed="true" aria-label="Start sound">
    <span class="sound-bars"><i></i><i></i><i></i><i></i></span>
    <span class="sound-label">Sound ready · tap to start</span>
  </button>
`;

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const canvas = document.querySelector(".world");
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x0a0c10, 0.045);

const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 0.1, 100);
camera.position.set(6.4, 1.1, 11.8);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = !reduceMotion.matches;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const pmrem = new THREE.PMREMGenerator(renderer);
const roomEnvironment = new RoomEnvironment();
scene.environment = pmrem.fromScene(roomEnvironment, 0.03).texture;
roomEnvironment.dispose();
pmrem.dispose();

scene.add(new THREE.HemisphereLight(0xdde5ff, 0x111218, 1.2));
const keyLight = new THREE.DirectionalLight(0xe9efff, 4.2);
keyLight.position.set(5, 7, 7);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
scene.add(keyLight);
const cobaltLight = new THREE.PointLight(0x215dff, 35, 15, 2);
cobaltLight.position.set(-4, 1, 3);
scene.add(cobaltLight);
const limeLight = new THREE.PointLight(0xbaff38, 16, 12, 2);
limeLight.position.set(4, -2, 2);
scene.add(limeLight);

const graphite = new THREE.MeshStandardMaterial({ color: 0x171b22, metalness: 0.76, roughness: 0.23 });
const darkMetal = new THREE.MeshStandardMaterial({ color: 0x07090d, metalness: 0.92, roughness: 0.2 });
const ivory = new THREE.MeshStandardMaterial({ color: 0xece9df, metalness: 0.12, roughness: 0.38 });
const cobalt = new THREE.MeshStandardMaterial({ color: 0x1d5cff, emissive: 0x0b2f8f, emissiveIntensity: 0.65, metalness: 0.55, roughness: 0.24 });
const lime = new THREE.MeshStandardMaterial({ color: 0xbaff38, emissive: 0x547d00, emissiveIntensity: 0.46, metalness: 0.22, roughness: 0.3 });
const glass = new THREE.MeshPhysicalMaterial({
  color: 0x17233f,
  transmission: 0.72,
  transparent: true,
  opacity: 0.78,
  roughness: 0.12,
  metalness: 0.05,
  thickness: 0.65,
  ior: 1.5,
  clearcoat: 1,
});

const world = new THREE.Group();
scene.add(world);
const core = new THREE.Group();
const terminal = new THREE.Group();
const monogram = new THREE.Group();
const rails = new THREE.Group();
const nodes = new THREE.Group();
const dataCards = new THREE.Group();
core.add(terminal, monogram, rails, nodes, dataCards);
world.add(core);

function mesh(geometry, material, parent = core) {
  const object = new THREE.Mesh(geometry, material);
  object.castShadow = true;
  object.receiveShadow = true;
  parent.add(object);
  return object;
}

function roundedBox(width, height, depth, radius, material, parent = core) {
  return mesh(new RoundedBoxGeometry(width, height, depth, 5, radius), material, parent);
}

function beamBetween(a, b, thickness, material, parent) {
  const midpoint = a.clone().add(b).multiplyScalar(0.5);
  const length = a.distanceTo(b);
  const beam = roundedBox(thickness, length, thickness, thickness * 0.42, material, parent);
  beam.position.copy(midpoint);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return beam;
}

const screen = roundedBox(5.15, 3.32, 0.24, 0.18, glass, terminal);
screen.position.z = 0.04;
const screenBack = roundedBox(5.46, 3.62, 0.15, 0.22, darkMetal, terminal);
screenBack.position.z = -0.18;

const cornerPositions = [
  [-2.68, 1.78], [2.68, 1.78], [-2.68, -1.78], [2.68, -1.78],
];
cornerPositions.forEach(([x, y], index) => {
  const bracket = roundedBox(0.32, 0.32, 0.42, 0.08, index === 1 ? lime : cobalt, terminal);
  bracket.position.set(x, y, 0.05);
});

const codeLineWidths = [1.22, 2.66, 2.05, 3.35, 1.62, 2.83, 2.24];
codeLineWidths.forEach((width, index) => {
  const line = roundedBox(width, 0.065, 0.035, 0.025, index === 0 || index === 5 ? lime : cobalt, terminal);
  line.position.set(-1.65 + width / 2, 1.14 - index * 0.34, 0.2);
  line.material = line.material.clone();
  line.material.transparent = true;
  line.material.opacity = index === 0 ? 0.95 : 0.62;
  line.userData.kind = "code";
});

const cursor = roundedBox(0.08, 0.28, 0.04, 0.025, lime, terminal);
cursor.position.set(1.2, -1.1, 0.21);

const A = [
  [new THREE.Vector3(-1.35, -0.95, 0.44), new THREE.Vector3(-0.72, 0.95, 0.44)],
  [new THREE.Vector3(-0.72, 0.95, 0.44), new THREE.Vector3(-0.08, -0.95, 0.44)],
  [new THREE.Vector3(-1.08, -0.04, 0.44), new THREE.Vector3(-0.38, -0.04, 0.44)],
];
const M = [
  [new THREE.Vector3(0.25, -0.95, 0.44), new THREE.Vector3(0.25, 0.95, 0.44)],
  [new THREE.Vector3(0.25, 0.95, 0.44), new THREE.Vector3(0.86, 0.1, 0.44)],
  [new THREE.Vector3(0.86, 0.1, 0.44), new THREE.Vector3(1.47, 0.95, 0.44)],
  [new THREE.Vector3(1.47, 0.95, 0.44), new THREE.Vector3(1.47, -0.95, 0.44)],
];
[...A, ...M].forEach(([a, b], index) => beamBetween(a, b, 0.13, index < 3 ? ivory : cobalt, monogram));

function curveRail(points, material) {
  const curve = new THREE.CatmullRomCurve3(points);
  const rail = mesh(new THREE.TubeGeometry(curve, 96, 0.055, 10, false), material, rails);
  rail.userData.basePoints = points;
  return rail;
}

curveRail([
  new THREE.Vector3(-2.75, 1.5, -0.1), new THREE.Vector3(-4.35, 1.1, 0.3),
  new THREE.Vector3(-4.3, -1.5, 0.7), new THREE.Vector3(-2.7, -1.78, 0.1),
], cobalt);
curveRail([
  new THREE.Vector3(2.75, -1.5, -0.1), new THREE.Vector3(4.35, -1.1, 0.3),
  new THREE.Vector3(4.3, 1.5, 0.7), new THREE.Vector3(2.7, 1.78, 0.1),
], lime);

const nodeColors = [cobalt, lime, ivory, cobalt, lime, ivory];
const nodePivots = [];
for (let index = 0; index < 6; index += 1) {
  const pivot = new THREE.Group();
  const angle = (index / 6) * Math.PI * 2;
  pivot.rotation.z = angle;
  const stem = roundedBox(1.08, 0.045, 0.045, 0.018, darkMetal, pivot);
  stem.position.x = 3.82;
  const node = mesh(new THREE.IcosahedronGeometry(index % 2 ? 0.19 : 0.24, 2), nodeColors[index], pivot);
  node.position.set(4.37, 0, 0.25 + (index % 3) * 0.18);
  node.userData.nodeIndex = index;
  nodes.add(pivot);
  nodePivots.push({ pivot, node });
}

const cardPalette = [cobalt, graphite, ivory, graphite, lime];
for (let index = 0; index < 5; index += 1) {
  const card = roundedBox(2.15, 1.24, 0.1, 0.12, cardPalette[index], dataCards);
  card.position.set(0.24 * index, 0.19 * index, -0.42 - 0.16 * index);
  card.rotation.z = -0.03 * index;
  card.userData.cardIndex = index;
  const marker = roundedBox(0.52, 0.07, 0.025, 0.02, index === 2 ? cobalt : lime, card);
  marker.position.set(-0.62, 0.36, 0.08);
}

const base = roundedBox(4.2, 0.24, 1.2, 0.11, graphite, core);
base.position.set(0, -2.12, -0.18);
const baseGlow = roundedBox(2.7, 0.03, 0.72, 0.01, cobalt, core);
baseGlow.position.set(0, -1.98, -0.18);

const dustGeometry = new THREE.BufferGeometry();
const dustCount = 190;
const dustPositions = new Float32Array(dustCount * 3);
for (let index = 0; index < dustCount; index += 1) {
  dustPositions[index * 3] = (Math.random() - 0.5) * 22;
  dustPositions[index * 3 + 1] = (Math.random() - 0.5) * 14;
  dustPositions[index * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
}
dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({ color: 0x6d86ba, size: 0.025, transparent: true, opacity: 0.46 }));
scene.add(dust);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.28 }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.28;
floor.receiveShadow = true;
scene.add(floor);

const SCENES = {
  hero: {
    title: "Developer core",
    detail: "Drag to inspect · Scroll to transform",
    world: [2.55, 0.15, 0], rotation: [0.02, -0.25, -0.025], scale: 0.92,
    camera: [6.4, 1.1, 11.8], monogram: 1, terminal: 1, rail: 1, nodes: 1, cards: 0,
  },
  about: {
    title: "Personal signal",
    detail: "Identity core · Education layer",
    world: [3.1, -0.1, -0.2], rotation: [0.03, -0.58, 0.03], scale: 0.86,
    camera: [5.8, 0.55, 11], monogram: 1.35, terminal: 0.48, rail: 0.8, nodes: 0.72, cards: 0,
  },
  experience: {
    title: "Experience rail",
    detail: "Five roles · One connected path",
    world: [-2.65, -0.1, -0.2], rotation: [0.08, 0.46, -0.04], scale: 0.78,
    camera: [-5.8, 0.6, 11.7], monogram: 0.55, terminal: 0.68, rail: 1.55, nodes: 0.42, cards: 1,
  },
  capabilities: {
    title: "Capability matrix",
    detail: "Interface · Application · Data",
    world: [2.82, 0.05, 0], rotation: [-0.02, -0.18, 0], scale: 0.78,
    camera: [5.1, 0.5, 11.6], monogram: 0.38, terminal: 0.34, rail: 1.2, nodes: 1.48, cards: 0.25,
  },
  portfolio: {
    title: "Portfolio constellation",
    detail: "Five concept sites · Five visual systems",
    world: [2.95, -0.08, -0.15], rotation: [0.04, -0.46, 0.025], scale: 0.76,
    camera: [5.65, 0.55, 11.7], monogram: 0.3, terminal: 0.48, rail: 0.72, nodes: 0.62, cards: 2.1,
  },
  systems: {
    title: "Operations network",
    detail: "Five products · One full-stack foundation",
    world: [0.15, -0.05, -0.4], rotation: [-0.04, -0.08, 0.015], scale: 0.68,
    camera: [0.45, 0.35, 12.8], monogram: 0.2, terminal: 0.38, rail: 1.42, nodes: 1.18, cards: 1.5,
  },
  work: {
    title: "Professional projects",
    detail: "Four real-world project layers",
    world: [-3.12, -0.2, 0], rotation: [0.02, 0.5, 0.025], scale: 0.74,
    camera: [-5.7, 0.55, 11.5], monogram: 0.25, terminal: 0.62, rail: 0.55, nodes: 0.45, cards: 1.7,
  },
  contact: {
    title: "Open channel",
    detail: "Three direct contact routes",
    world: [3.12, 0.08, 0.3], rotation: [0, -0.68, 0], scale: 0.84,
    camera: [5.9, 0.65, 11.6], monogram: 1.25, terminal: 1.08, rail: 1.34, nodes: 0.9, cards: 0,
  },
};

let activeScene = "hero";
let previousScene = "hero";
let targetScene = SCENES.hero;
let sceneBlend = 1;
let pointerYaw = 0;
let pointerPitch = 0;
let dragYaw = 0;
let dragPitch = 0;
let dragging = false;
let pointerStart = { x: 0, y: 0 };
let currentYaw = 0;
let currentPitch = 0;
let scrollVelocity = 0;
let previousScroll = scrollY;

const statusTitle = document.querySelector(".scene-status strong");
const statusDetail = document.querySelector(".scene-status p");
const navAnchors = [...document.querySelectorAll(".nav-links a, .nav-cta")];
const sceneSections = [...document.querySelectorAll(".scene-section")];
const nodeLabels = [...document.querySelectorAll(".skill-labels span")];

class SoundEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.musicGain = null;
    this.enabled = true;
    this.started = false;
    this.timer = null;
    this.step = 0;
  }

  async start() {
    if (!this.enabled) return;
    if (!this.context) this.create();
    if (this.context.state === "suspended") await this.context.resume();
    if (!this.started && this.context.state === "running") {
      this.started = true;
      this.beginMusic();
      document.body.classList.add("audio-live");
      updateSoundLabel();
    }
  }

  create() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.musicGain = this.context.createGain();
    this.master.gain.value = 0.38;
    this.musicGain.gain.value = 0.11;
    this.musicGain.connect(this.master);
    this.master.connect(this.context.destination);
  }

  beginMusic() {
    this.sequence();
    this.timer = window.setInterval(() => this.sequence(), 2400);
  }

  tone(frequency, delay = 0, duration = 0.55, volume = 0.05, type = "sine", destination = this.musicGain) {
    if (!this.context || this.context.state !== "running" || !this.enabled) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.035);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  sequence() {
    const motifs = [
      [329.63, 493.88, 659.25],
      [293.66, 440, 587.33],
      [261.63, 392, 523.25],
      [349.23, 523.25, 698.46],
    ];
    const motif = motifs[this.step % motifs.length];
    motif.forEach((frequency, index) => {
      this.tone(frequency, index * 0.22, 0.9 + index * 0.14, index === 0 ? 0.018 : 0.012, index === 1 ? "triangle" : "sine");
    });
    this.tone(motif[2] * 1.5, 1.08, 0.62, 0.007, "sine");
    this.step += 1;
  }

  sceneCue(index) {
    if (!this.started) return;
    const roots = [329.63, 392, 293.66, 440, 493.88, 523.25, 349.23, 466.16];
    const root = roots[index] || 329.63;
    this.tone(root, 0, 0.24, 0.035, "sine", this.master);
    this.tone(root * 1.5, 0.07, 0.34, 0.024, "triangle", this.master);
    this.tone(root * 2, 0.16, 0.42, 0.014, "sine", this.master);
  }

  click(kind = "soft") {
    if (!this.started) return;
    const frequency = kind === "contact" ? 659.25 : 523.25;
    this.tone(frequency, 0, 0.12, 0.035, "sine", this.master);
    this.tone(frequency * 1.5, 0.04, 0.18, 0.018, "triangle", this.master);
  }

  setEnabled(value) {
    this.enabled = value;
    if (this.master && this.context) {
      this.master.gain.cancelScheduledValues(this.context.currentTime);
      this.master.gain.linearRampToValueAtTime(value ? 0.38 : 0.0001, this.context.currentTime + 0.28);
    }
    updateSoundLabel();
  }
}

const audio = new SoundEngine();
const soundToggle = document.querySelector(".sound-toggle");
const soundLabel = document.querySelector(".sound-label");

function updateSoundLabel() {
  soundToggle.setAttribute("aria-pressed", String(audio.enabled));
  soundToggle.setAttribute("aria-label", !audio.started ? "Start sound" : audio.enabled ? "Turn sound off" : "Turn sound on");
  soundLabel.textContent = audio.enabled ? (audio.started ? "Sound on" : "Sound ready · tap to start") : "Sound off";
}

soundToggle.addEventListener("click", async () => {
  if (!audio.started) {
    audio.setEnabled(true);
    await audio.start();
    audio.click();
    return;
  }
  if (audio.enabled) audio.setEnabled(false);
  else {
    audio.setEnabled(true);
    await audio.start();
    audio.click();
  }
});

const unlockAudio = (event) => {
  if (event.target instanceof Element && event.target.closest(".sound-toggle")) return;
  audio.start().catch(() => {});
};
window.addEventListener("touchstart", unlockAudio, { passive: true, once: true });
window.addEventListener("pointerdown", unlockAudio, { passive: true, once: true });
window.addEventListener("keydown", unlockAudio, { once: true });

function setActiveScene(name) {
  if (name === activeScene) return;
  previousScene = activeScene;
  activeScene = name;
  targetScene = SCENES[name];
  sceneBlend = 0;
  statusTitle.textContent = targetScene.title;
  statusDetail.textContent = targetScene.detail;
  document.body.dataset.scene = name;
  navAnchors.forEach((anchor) => {
    const isActive = anchor.hash === `#${name}`;
    anchor.classList.toggle("is-active", isActive);
    if (isActive) anchor.setAttribute("aria-current", "location");
    else anchor.removeAttribute("aria-current");
  });
  const index = sceneSections.findIndex((section) => section.dataset.scene === name);
  audio.sceneCue(index);
}

function updateScrollScene() {
  const focus = innerHeight * 0.5;
  let closest = sceneSections[0];
  let distance = Infinity;
  sceneSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionDistance = Math.abs(rect.top + Math.min(rect.height, innerHeight) * 0.45 - focus);
    if (sectionDistance < distance) {
      distance = sectionDistance;
      closest = section;
    }
  });
  setActiveScene(closest.dataset.scene);
  scrollVelocity = scrollY - previousScroll;
  previousScroll = scrollY;
}

window.addEventListener("scroll", updateScrollScene, { passive: true });
updateScrollScene();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  });
}, { threshold: 0.16 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

document.querySelectorAll("a, button:not(.sound-toggle)").forEach((element) => {
  element.addEventListener("click", () => audio.click(element.closest(".contact-links") ? "contact" : "soft"));
});

const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const open = document.body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
document.querySelectorAll(".nav-links a").forEach((link) => link.addEventListener("click", () => {
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
}));
window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !document.body.classList.contains("menu-open")) return;
  document.body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  menuToggle.focus();
});

function canDrag(target) {
  return !target.closest("a, button, input, textarea, select, .project-card, .showcase-card, .system-card, .timeline, .stack-groups");
}

window.addEventListener("pointerdown", (event) => {
  if (!canDrag(event.target)) return;
  dragging = true;
  pointerStart = { x: event.clientX, y: event.clientY };
  currentYaw = dragYaw;
  currentPitch = dragPitch;
  document.body.classList.add("is-dragging");
});

window.addEventListener("pointermove", (event) => {
  pointerYaw = (event.clientX / innerWidth - 0.5) * 0.15;
  pointerPitch = (event.clientY / innerHeight - 0.5) * 0.08;
  if (!dragging) return;
  dragYaw = currentYaw + (event.clientX - pointerStart.x) * 0.006;
  dragPitch = THREE.MathUtils.clamp(currentPitch + (event.clientY - pointerStart.y) * 0.004, -0.55, 0.55);
});

function endDrag() {
  dragging = false;
  document.body.classList.remove("is-dragging");
}
window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);

const current = {
  world: new THREE.Vector3(...SCENES.hero.world),
  rotation: new THREE.Vector3(...SCENES.hero.rotation),
  scale: SCENES.hero.scale,
  camera: new THREE.Vector3(...SCENES.hero.camera),
  monogram: SCENES.hero.monogram,
  terminal: SCENES.hero.terminal,
  rail: SCENES.hero.rail,
  nodes: SCENES.hero.nodes,
  cards: SCENES.hero.cards,
};

const clock = new THREE.Clock();
const tempVector = new THREE.Vector3();
const targetVector = new THREE.Vector3();

function damp(value, target, smoothing, delta) {
  return THREE.MathUtils.damp(value, target, smoothing, delta);
}

function updateSkillLabels() {
  const visible = activeScene === "capabilities";
  nodeLabels.forEach((label, index) => {
    const node = nodePivots[index].node;
    node.getWorldPosition(tempVector);
    tempVector.project(camera);
    const x = (tempVector.x * 0.5 + 0.5) * innerWidth;
    const y = (-tempVector.y * 0.5 + 0.5) * innerHeight;
    label.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    label.classList.toggle("is-visible", visible && tempVector.z < 1);
  });
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  const smoothing = reduceMotion.matches ? 14 : 3.8;
  sceneBlend = Math.min(1, sceneBlend + delta * 1.15);

  targetVector.fromArray(targetScene.world);
  current.world.lerp(targetVector, 1 - Math.exp(-smoothing * delta));
  targetVector.fromArray(targetScene.rotation);
  current.rotation.lerp(targetVector, 1 - Math.exp(-smoothing * delta));
  targetVector.fromArray(targetScene.camera);
  current.camera.lerp(targetVector, 1 - Math.exp(-2.8 * delta));
  current.scale = damp(current.scale, targetScene.scale, smoothing, delta);
  current.monogram = damp(current.monogram, targetScene.monogram, smoothing, delta);
  current.terminal = damp(current.terminal, targetScene.terminal, smoothing, delta);
  current.rail = damp(current.rail, targetScene.rail, smoothing, delta);
  current.nodes = damp(current.nodes, targetScene.nodes, smoothing, delta);
  current.cards = damp(current.cards, targetScene.cards, smoothing, delta);

  world.position.copy(current.world);
  const ambientPitch = reduceMotion.matches ? 0 : pointerPitch;
  const ambientYaw = reduceMotion.matches ? 0 : pointerYaw;
  world.rotation.set(
    current.rotation.x + dragPitch + ambientPitch,
    current.rotation.y + dragYaw + ambientYaw,
    current.rotation.z + scrollVelocity * 0.0004,
  );
  world.scale.setScalar(current.scale);
  camera.position.lerp(current.camera, 1 - Math.exp(-3 * delta));
  camera.lookAt(0, 0, 0);

  const breathe = reduceMotion.matches ? 1 : 1 + Math.sin(elapsed * 1.2) * 0.018;
  monogram.scale.setScalar(current.monogram * breathe);
  monogram.position.z = 0.48 + (current.monogram - 1) * 0.85;
  terminal.scale.set(1, 1, Math.max(0.35, current.terminal));
  terminal.position.z = -(1 - current.terminal) * 1.85;

  rails.scale.set(current.rail, current.rail, current.rail);
  rails.rotation.z = reduceMotion.matches ? 0 : Math.sin(elapsed * 0.22) * 0.04;
  nodes.scale.setScalar(current.nodes);
  if (!reduceMotion.matches) nodes.rotation.z += delta * (activeScene === "capabilities" ? 0.16 : 0.08);

  nodePivots.forEach(({ pivot, node }, index) => {
    pivot.rotation.y = reduceMotion.matches ? 0 : Math.sin(elapsed * 0.75 + index) * 0.1;
    const pulse = reduceMotion.matches ? 1 : 1 + Math.sin(elapsed * 2.1 + index * 0.8) * 0.08;
    node.scale.setScalar(pulse);
  });

  dataCards.children.forEach((card, index) => {
    if (!card.userData.cardIndex && card.userData.cardIndex !== 0) return;
    const cardIndex = card.userData.cardIndex;
    const spread = current.cards;
    const systemLayout = [
      [-2.3, 1.35, -0.15], [0, 0.2, 0.5], [2.3, 1.35, -0.15], [-1.55, -1.55, -0.35], [1.55, -1.55, -0.35],
    ];
    const targetCardX = activeScene === "systems" ? systemLayout[cardIndex][0] * spread : (cardIndex - 2) * 0.72 * spread;
    const targetCardY = activeScene === "systems" ? systemLayout[cardIndex][1] * spread : (2 - cardIndex) * 0.42 * spread;
    const targetCardZ = activeScene === "systems" ? systemLayout[cardIndex][2] * spread : -0.5 + cardIndex * 0.38 * spread;
    const targetCardRotationY = activeScene === "systems" ? (cardIndex - 2) * -0.045 : (cardIndex - 2) * -0.09 * spread;
    const targetCardRotationZ = activeScene === "systems" ? 0 : (cardIndex - 2) * 0.035 * spread;
    card.position.x = damp(card.position.x, targetCardX, 4.4, delta);
    card.position.y = damp(card.position.y, targetCardY, 4.4, delta);
    card.position.z = damp(card.position.z, targetCardZ, 4.4, delta);
    card.rotation.y = damp(card.rotation.y, targetCardRotationY, 4.4, delta);
    card.rotation.z = damp(card.rotation.z, targetCardRotationZ, 4.4, delta);
  });
  dataCards.visible = current.cards > 0.03;

  cursor.visible = reduceMotion.matches || Math.sin(elapsed * 3.2) > -0.12;
  dust.rotation.y = reduceMotion.matches ? 0 : elapsed * 0.006;
  dust.position.y = reduceMotion.matches ? 0 : Math.sin(elapsed * 0.12) * 0.12;
  cobaltLight.intensity = reduceMotion.matches ? 31 : 31 + Math.sin(elapsed * 0.9) * 4;
  limeLight.intensity = reduceMotion.matches ? 13 : 13 + Math.sin(elapsed * 0.75 + 1) * 3;
  scrollVelocity *= 0.86;

  updateSkillLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

function resize() {
  if (innerWidth > 1100 && document.body.classList.contains("menu-open")) {
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  }
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
}
window.addEventListener("resize", resize);

reduceMotion.addEventListener("change", () => {
  renderer.shadowMap.enabled = !reduceMotion.matches;
});
