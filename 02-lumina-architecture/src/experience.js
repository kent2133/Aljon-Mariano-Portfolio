export function setupExperience({
  tone = 72,
  accent = "#caff63",
  target,
  eyebrow,
  title,
  intro,
  items,
}) {
  const style = document.createElement("style");
  style.textContent = `
    html{scroll-behavior:smooth;scroll-padding-top:92px}body main{padding-top:86px}
    body.is-dragging,body.is-dragging *{user-select:none!important;cursor:grabbing!important}
    nav{position:fixed!important;inset:0 0 auto 0!important;z-index:20!important;background:#0b0b0bcc!important;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
    section[id],footer[id]{scroll-margin-top:92px}
    .sound-toggle{position:fixed;left:22px;bottom:22px;z-index:22;border:1px solid currentColor;border-radius:99px;background:#111d;color:#fff;padding:10px 14px;font:10px monospace;letter-spacing:.08em;backdrop-filter:blur(10px);cursor:pointer}
    .sound-toggle::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#777;margin-right:8px}.sound-toggle.on::before{background:var(--sound-accent);box-shadow:0 0 10px var(--sound-accent)}
    .experience-context{position:relative;z-index:auto;padding:10vw 4vw;background:#101010;color:#f4f1eb}.experience-context>*{position:relative;z-index:3}.experience-context__head{width:56%;max-width:760px}.experience-context__eyebrow{font:10px monospace;letter-spacing:.14em;color:var(--sound-accent)}.experience-context h2{font-size:clamp(48px,7vw,104px);line-height:.86;letter-spacing:-.06em;font-weight:400;margin:25px 0}.experience-context__head>p{color:#aaa;line-height:1.75}.experience-context__grid{width:56%;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#555;margin-top:6vw}.experience-context article{background:#181818;padding:28px}.experience-context article b{color:var(--sound-accent);font:10px monospace}.experience-context article h3{font-size:22px;font-weight:500}.experience-context article p{color:#999;line-height:1.55;font-size:14px}
    @media(max-width:760px){.experience-context__head,.experience-context__grid{width:100%}.experience-context__grid{grid-template-columns:1fr}.sound-toggle{left:14px;bottom:14px}nav{background:#0b0b0bed!important}}
  `;
  document.head.append(style);
  document.documentElement.style.setProperty("--sound-accent", accent);
  const section = document.createElement("section");
  section.className = "experience-context";
  section.innerHTML = `<div class="experience-context__head"><span class="experience-context__eyebrow">${eyebrow}</span><h2>${title}</h2><p>${intro}</p></div><div class="experience-context__grid">${items.map((x, i) => `<article><b>0${i + 1}</b><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</div>`;
  document.querySelector(target)?.before(section);

  const button = document.createElement("button");
  button.className = "sound-toggle on";
  button.type = "button";
  button.textContent = "SOUND ON";
  button.setAttribute("aria-pressed", "true");
  document.body.append(button);

  let ctx,
    master,
    filter,
    active = true,
    armed = false;
  const start = async () => {
    if (!ctx) {
      ctx = new AudioContext();
      master = ctx.createGain();
      filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      master.gain.value = 0.0001;
      filter.connect(master).connect(ctx.destination);
      [tone, tone * 1.498, tone / 2].forEach((frequency, i) => {
        const o = ctx.createOscillator(),
          g = ctx.createGain();
        o.type = i === 1 ? "sine" : "triangle";
        o.frequency.value = frequency;
        g.gain.value = i === 2 ? 0.13 : 0.055;
        o.connect(g).connect(filter);
        o.start();
      });
    }
    await ctx.resume();
    armed = true;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(
      active ? 0.045 : 0.0001,
      ctx.currentTime + 0.35,
    );
  };
  const blip = (frequency = tone * 4, duration = 0.08) => {
    if (!ctx || !active) return;
    const oscillator = ctx.createOscillator(),
      gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 0.68,
      ctx.currentTime + duration,
    );
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  };
  const unlock = () => start();
  addEventListener("pointerdown", unlock, { once: true, capture: true });
  addEventListener("keydown", unlock, { once: true, capture: true });
  addEventListener("wheel", unlock, { once: true, capture: true });

  button.addEventListener("click", async () => {
    if (!armed) await start();
    active = !active;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(
      active ? 0.045 : 0.0001,
      ctx.currentTime + 0.28,
    );
    button.classList.toggle("on", active);
    button.textContent = active ? "SOUND ON" : "SOUND OFF";
    button.setAttribute("aria-pressed", String(active));
    if (active) blip(tone * 5, 0.12);
  });
  document.querySelectorAll("a,button").forEach((control, i) => {
    if (control !== button)
      control.addEventListener("click", () =>
        blip(tone * (3.2 + (i % 4) * 0.55), 0.07),
      );
  });
  addEventListener(
    "scroll",
    () => {
      if (ctx && active) {
        const p =
          scrollY /
          Math.max(1, document.documentElement.scrollHeight - innerHeight);
        filter.frequency.setTargetAtTime(260 + p * 900, ctx.currentTime, 0.12);
      }
    },
    { passive: true },
  );
  addEventListener("pointerdown", (e) => {
    if (!e.target.closest("a,button,input"))
      document.body.classList.add("is-dragging");
  });
  addEventListener("pointerup", () =>
    document.body.classList.remove("is-dragging"),
  );
  addEventListener("pointercancel", () =>
    document.body.classList.remove("is-dragging"),
  );
  addEventListener(
    "pointermove",
    (e) => {
      if (document.body.classList.contains("is-dragging")) e.preventDefault();
    },
    { passive: false },
  );
}
