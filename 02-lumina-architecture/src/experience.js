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
  button.textContent = "SOUND ON · SCROLL OR TAP";
  button.setAttribute("aria-pressed", "true");
  document.body.append(button);

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const sceneProfiles = {
    hero: { root: tone, warmth: 760, cadence: 1.28 },
    brief: { root: tone * 1.059, warmth: 920, cadence: 1.08 },
    gallery: { root: tone * 1.122, warmth: 1280, cadence: 0.9 },
    work: { root: tone * 0.89, warmth: 680, cadence: 1.18 },
    performance: { root: tone * 0.944, warmth: 1060, cadence: 0.82 },
    contact: { root: tone * 0.793, warmth: 560, cadence: 1.46 },
  };
  const chordRatios = [1, 1.498, 2.245];
  const cadenceNotes = [0, 7, 12, 4, 9, 14, 7, 2];
  let ctx;
  let master;
  let musicBus;
  let sfxBus;
  let roomVerb;
  let roomVerbGain;
  let padFilter;
  let active = true;
  let armed = false;
  let currentScene = "hero";
  let cadenceTimer;
  let cadenceStep = 0;
  let pendingCue = { type: "hero", options: {} };
  let starting;
  let announced = false;
  const padVoices = [];

  function createAudioGraph() {
    ctx = new AudioContextClass();
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -21;
    compressor.knee.value = 20;
    compressor.ratio.value = 3.5;
    compressor.attack.value = 0.015;
    compressor.release.value = 0.34;
    master.gain.value = 0.0001;
    musicBus.gain.value = 0.78;
    sfxBus.gain.value = 0.92;
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(compressor).connect(ctx.destination);

    roomVerb = ctx.createDelay(0.8);
    roomVerb.delayTime.value = 0.16;
    const roomFeedback = ctx.createGain();
    const roomFilter = ctx.createBiquadFilter();
    roomFeedback.gain.value = 0.2;
    roomFilter.type = "lowpass";
    roomFilter.frequency.value = 1850;
    roomVerb.connect(roomFilter).connect(roomFeedback).connect(roomVerb);
    roomVerbGain = ctx.createGain();
    roomVerbGain.gain.value = 0.13;
    roomVerb.connect(roomVerbGain).connect(master);

    padFilter = ctx.createBiquadFilter();
    const padLevel = ctx.createGain();
    padFilter.type = "lowpass";
    padFilter.frequency.value = sceneProfiles.hero.warmth;
    padFilter.Q.value = 0.55;
    padLevel.gain.value = 0.46;
    padFilter.connect(padLevel).connect(musicBus);
    chordRatios.forEach((ratio, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = index === 1 ? "triangle" : "sine";
      oscillator.frequency.value = sceneProfiles.hero.root * ratio;
      oscillator.detune.value = [-5, 3, 7][index];
      gain.gain.value = [0.052, 0.026, 0.015][index];
      oscillator.connect(gain).connect(padFilter);
      oscillator.start();
      padVoices.push({ oscillator, ratio });
    });

  }

  function setMasterLevel(isOn, duration = 0.45) {
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(
      isOn ? 0.35 : 0.0001,
      ctx.currentTime,
      Math.max(0.02, duration / 4),
    );
  }

  function updateMusicScene(sceneName) {
    if (!ctx || !padFilter) return;
    const profile = sceneProfiles[sceneName] || sceneProfiles.hero;
    const now = ctx.currentTime;
    padVoices.forEach(({ oscillator, ratio }) => {
      oscillator.frequency.setTargetAtTime(profile.root * ratio, now, 0.9);
    });
    padFilter.frequency.setTargetAtTime(profile.warmth, now, 0.75);
    roomVerbGain.gain.setTargetAtTime(
      sceneName === "contact" ? 0.24 : 0.16,
      now,
      0.7,
    );
  }

  function pluck({
    frequency,
    delay = 0,
    duration = 0.72,
    volume = 0.11,
    pan = 0,
    brightness = 2200,
    destination = musicBus,
  }) {
    const now = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const oscillatorGain = ctx.createGain();
    const harmonicGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const stereo = ctx.createStereoPanner();
    oscillator.type = "triangle";
    harmonic.type = "sine";
    oscillator.frequency.value = frequency;
    harmonic.frequency.value = frequency * 2.01;
    oscillatorGain.gain.value = 0.8;
    harmonicGain.gain.value = 0.18;
    filter.type = "lowpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(brightness, now);
    filter.frequency.exponentialRampToValueAtTime(380, now + duration);
    stereo.pan.value = pan;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.007);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(oscillatorGain).connect(filter);
    harmonic.connect(harmonicGain).connect(filter);
    filter.connect(gain).connect(stereo);
    stereo.connect(destination);
    stereo.connect(roomVerb);
    oscillator.start(now);
    harmonic.start(now);
    oscillator.stop(now + duration + 0.04);
    harmonic.stop(now + duration + 0.04);
  }

  function backgroundPluck() {
    if (!ctx || !active || ctx.state !== "running") return;
    const profile = sceneProfiles[currentScene] || sceneProfiles.hero;
    const semitone = cadenceNotes[cadenceStep % cadenceNotes.length];
    pluck({
      frequency: profile.root * 4 * 2 ** (semitone / 12),
      duration: currentScene === "contact" ? 1.05 : 0.72,
      volume: currentScene === "performance" ? 0.085 : 0.073,
      pan: Math.sin(cadenceStep * 1.41) * 0.56,
      brightness: currentScene === "gallery" ? 3300 : 2200,
    });
    cadenceStep += 1;
  }

  function scheduleCadence() {
    clearTimeout(cadenceTimer);
    const profile = sceneProfiles[currentScene] || sceneProfiles.hero;
    cadenceTimer = setTimeout(() => {
      backgroundPluck();
      scheduleCadence();
    }, profile.cadence * 1000);
  }

  function tonalSweep({
    duration = 0.45,
    volume = 0.08,
    frequency = 420,
    end = 2600,
    delay = 0,
    pan = 0,
  } = {}) {
    const now = ctx.currentTime + delay;
    const source = ctx.createOscillator();
    const gain = ctx.createGain();
    const stereo = ctx.createStereoPanner();
    source.type = "sine";
    source.frequency.setValueAtTime(Math.max(55, frequency), now);
    source.frequency.exponentialRampToValueAtTime(Math.max(55, end), now + duration);
    stereo.pan.value = pan;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume * 0.72, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(gain).connect(stereo);
    stereo.connect(sfxBus);
    stereo.connect(roomVerb);
    source.start(now);
    source.stop(now + duration + 0.04);
  }

  function impact({ delay = 0, strength = 0.11, pan = 0 } = {}) {
    const now = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const stereo = ctx.createStereoPanner();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(118, now);
    oscillator.frequency.exponentialRampToValueAtTime(46, now + 0.18);
    stereo.pan.value = pan;
    gain.gain.setValueAtTime(strength, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    oscillator.connect(gain).connect(stereo).connect(sfxBus);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
    tonalSweep({
      duration: 0.12,
      volume: strength * 0.34,
      frequency: 280,
      end: 1100,
      delay,
      pan,
    });
  }

  function playCue(type, options = {}) {
    if (!ctx || !active || ctx.state !== "running") return;
    const variant = Number(options.variant || 0);
    if (type === "click") {
      pluck({
        frequency: tone * (5.2 + (variant % 4) * 0.38),
        duration: 0.16,
        volume: 0.075,
        pan: ((variant % 3) - 1) * 0.2,
        brightness: 2700,
        destination: sfxBus,
      });
      return;
    }

    const sceneName = type === "scene" ? options.scene : type;
    if (sceneName === "brief") {
      [0, 0.2, 0.42, 0.68, 0.96].forEach((delay, index) => {
        impact({
          delay,
          strength: 0.105 - index * 0.008,
          pan: -0.55 + index * 0.27,
        });
        pluck({
          frequency: tone * (3 + index * 0.24),
          delay: delay + 0.025,
          duration: 0.42,
          volume: 0.055,
          pan: -0.55 + index * 0.27,
          brightness: 1600,
          destination: sfxBus,
        });
      });
      return;
    }
    if (sceneName === "gallery") {
      tonalSweep({
        duration: 0.82,
        volume: 0.1,
        frequency: 520,
        end: 4100,
        pan: -0.5,
      });
      tonalSweep({
        duration: 0.82,
        volume: 0.075,
        frequency: 620,
        end: 3500,
        delay: 0.16,
        pan: 0.55,
      });
      [0, 7, 12].forEach((semitone, index) =>
        pluck({
          frequency: tone * 5 * 2 ** (semitone / 12),
          delay: 0.14 + index * 0.12,
          duration: 0.68,
          volume: 0.072,
          pan: -0.35 + index * 0.35,
          brightness: 3900,
          destination: sfxBus,
        }),
      );
      return;
    }
    if (sceneName === "work") {
      tonalSweep({ duration: 0.72, volume: 0.085, frequency: 2400, end: 390 });
      [0, 0.13, 0.28, 0.45].forEach((delay, index) =>
        impact({
          delay,
          strength: 0.12 - index * 0.014,
          pan: index % 2 ? 0.58 : -0.58,
        }),
      );
      return;
    }
    if (sceneName === "performance") {
      tonalSweep({
        duration: 1.15,
        volume: 0.11,
        frequency: 350,
        end: 2800,
        pan: -0.62,
      });
      tonalSweep({
        duration: 1.15,
        volume: 0.08,
        frequency: 480,
        end: 1900,
        delay: 0.12,
        pan: 0.62,
      });
      [0.2, 0.38, 0.61, 0.78].forEach((delay, index) =>
        pluck({
          frequency: 920 + index * 155,
          delay,
          duration: 0.24,
          volume: 0.045,
          pan: -0.45 + index * 0.3,
          brightness: 3200,
          destination: sfxBus,
        }),
      );
      return;
    }
    if (sceneName === "contact") {
      tonalSweep({ duration: 1.2, volume: 0.06, frequency: 1500, end: 360 });
      [0, 4, 7, 11].forEach((semitone, index) =>
        pluck({
          frequency: tone * 3 * 2 ** (semitone / 12),
          delay: index * 0.16,
          duration: 1.15,
          volume: 0.075,
          pan: -0.45 + index * 0.3,
          brightness: 1900,
          destination: sfxBus,
        }),
      );
      return;
    }
    tonalSweep({ duration: 0.62, volume: 0.07, frequency: 430, end: 1800 });
    [0, 7, 12].forEach((semitone, index) =>
      pluck({
        frequency: tone * 3.2 * 2 ** (semitone / 12),
        delay: index * 0.1,
        duration: 0.75,
        volume: 0.065,
        pan: -0.35 + index * 0.35,
        destination: sfxBus,
      }),
    );
  }

  async function start() {
    if (!AudioContextClass) return false;
    if (starting) return starting;
    starting = (async () => {
      if (!ctx) {
        createAudioGraph();
        updateMusicScene(currentScene);
        scheduleCadence();
      }
      try {
        await ctx.resume();
      } catch {
        return false;
      }
      armed = ctx.state === "running";
      if (armed) {
        setMasterLevel(active);
        button.textContent = active ? "SOUND ON" : "SOUND OFF";
        if (active && !announced) {
          const queued = pendingCue || { type: currentScene, options: {} };
          pendingCue = null;
          playCue(queued.type, queued.options);
          announced = true;
        }
      }
      return armed;
    })();
    try {
      return await starting;
    } finally {
      starting = undefined;
    }
  }

  function cue(type, options = {}) {
    if (!active) return;
    if (!ctx || ctx.state !== "running") {
      pendingCue = { type, options };
      return;
    }
    playCue(type, options);
  }

  function setScene(sceneName, options = {}) {
    if (!sceneProfiles[sceneName] || sceneName === currentScene) return;
    currentScene = sceneName;
    updateMusicScene(sceneName);
    scheduleCadence();
    if (!options.silent) cue(sceneName, { scene: sceneName });
  }

  const api = {
    cue,
    setScene,
    resume: start,
    isEnabled: () => active,
  };
  window.siteAudio = api;

  const unlock = (event) => {
    if (event.target?.closest?.(".sound-toggle")) return;
    start();
  };
  addEventListener("pointerdown", unlock, { once: true, capture: true });
  addEventListener("keydown", unlock, { once: true, capture: true });
  addEventListener("wheel", unlock, { once: true, capture: true });

  button.addEventListener("click", async () => {
    if (!armed) {
      await start();
      return;
    }
    active = !active;
    setMasterLevel(active, 0.34);
    button.classList.toggle("on", active);
    button.textContent = active ? "SOUND ON" : "SOUND OFF";
    button.setAttribute("aria-pressed", String(active));
    if (active) playCue(currentScene);
  });
  document.querySelectorAll("a,button").forEach((control, index) => {
    if (control !== button) {
      control.addEventListener("click", () => cue("click", { variant: index }));
    }
  });
  addEventListener(
    "scroll",
    () => {
      if (active && (!ctx || ctx.state !== "running")) start();
      if (ctx && active && padFilter) {
        const page =
          scrollY /
          Math.max(1, document.documentElement.scrollHeight - innerHeight);
        const profile = sceneProfiles[currentScene] || sceneProfiles.hero;
        padFilter.frequency.setTargetAtTime(
          profile.warmth * (0.9 + page * 0.2),
          ctx.currentTime,
          0.26,
        );
      }
    },
    { passive: true },
  );
  addEventListener("pagehide", () => clearTimeout(cadenceTimer));
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
  return api;
}
