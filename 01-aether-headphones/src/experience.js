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
    hero: { root: tone, cutoff: 1050, pulse: 0.86 },
    sound: { root: tone * 1.122, cutoff: 1780, pulse: 0.58 },
    craft: { root: tone * 0.89, cutoff: 820, pulse: 1.04 },
    comfort: { root: tone * 1.059, cutoff: 1320, pulse: 0.94 },
    context: { root: tone * 0.944, cutoff: 940, pulse: 0.76 },
    reserve: { root: tone * 1.26, cutoff: 1920, pulse: 0.66 },
  };
  const chordRatios = [1, 1.498, 2, 2.378];
  const pulseSteps = [0, 7, 3, 10, 5, 12, 7, 3];
  let ctx;
  let master;
  let musicBus;
  let sfxBus;
  let padFilter;
  let pulseInput;
  let active = true;
  let armed = false;
  let currentScene = "hero";
  let pulseTimer;
  let pulseStep = 0;
  let pendingCue = { type: "hero", options: {} };
  let starting;
  let announced = false;
  const padVoices = [];

  function noiseBuffer(seconds = 2.5) {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = buffer.getChannelData(channel);
      let previous = 0;
      for (let index = 0; index < length; index += 1) {
        const white = Math.random() * 2 - 1;
        previous = previous * 0.985 + white * 0.015;
        data[index] = previous * 2.25;
      }
    }
    return buffer;
  }

  function createAudioGraph() {
    ctx = new AudioContextClass();
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -20;
    compressor.knee.value = 18;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.012;
    compressor.release.value = 0.3;
    master.gain.value = 0.0001;
    musicBus.gain.value = 0.82;
    sfxBus.gain.value = 0.9;
    musicBus.connect(master);
    sfxBus.connect(master);
    master.connect(compressor).connect(ctx.destination);

    padFilter = ctx.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = sceneProfiles.hero.cutoff;
    padFilter.Q.value = 0.72;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.54;
    padFilter.connect(padGain).connect(musicBus);

    chordRatios.forEach((ratio, index) => {
      const oscillator = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      oscillator.type = index % 2 ? "sine" : "triangle";
      oscillator.frequency.value = sceneProfiles.hero.root * ratio;
      oscillator.detune.value = [-7, 4, -3, 8][index];
      voiceGain.gain.value = [0.045, 0.026, 0.018, 0.013][index];
      oscillator.connect(voiceGain).connect(padFilter);
      oscillator.start();
      padVoices.push({ oscillator, ratio });
    });

    pulseInput = ctx.createGain();
    const echo = ctx.createDelay(1.2);
    const feedback = ctx.createGain();
    const echoTone = ctx.createBiquadFilter();
    pulseInput.gain.value = 0.72;
    echo.delayTime.value = 0.31;
    feedback.gain.value = 0.2;
    echoTone.type = "lowpass";
    echoTone.frequency.value = 2400;
    pulseInput.connect(musicBus);
    pulseInput.connect(echo);
    echo.connect(echoTone).connect(musicBus);
    echoTone.connect(feedback).connect(echo);
  }

  function setMasterLevel(isOn, duration = 0.42) {
    if (!ctx || !master) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(
      isOn ? 0.34 : 0.0001,
      ctx.currentTime,
      Math.max(0.02, duration / 4),
    );
  }

  function updateMusicScene(sceneName) {
    if (!ctx || !padFilter) return;
    const profile = sceneProfiles[sceneName] || sceneProfiles.hero;
    const now = ctx.currentTime;
    padVoices.forEach(({ oscillator, ratio }) => {
      oscillator.frequency.setTargetAtTime(profile.root * ratio, now, 0.75);
    });
    padFilter.frequency.setTargetAtTime(profile.cutoff, now, 0.7);
  }

  function musicPulse() {
    if (!ctx || !active || ctx.state !== "running") return;
    const profile = sceneProfiles[currentScene] || sceneProfiles.hero;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const toneFilter = ctx.createBiquadFilter();
    const pan = ctx.createStereoPanner();
    const semitone = pulseSteps[pulseStep % pulseSteps.length];
    oscillator.type = pulseStep % 4 === 3 ? "triangle" : "sine";
    oscillator.frequency.value = profile.root * 2 * 2 ** (semitone / 12);
    toneFilter.type = "lowpass";
    toneFilter.frequency.value = 1480 + (pulseStep % 3) * 380;
    pan.pan.value = Math.sin(pulseStep * 1.7) * 0.58;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.065, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);
    oscillator
      .connect(toneFilter)
      .connect(gain)
      .connect(pan)
      .connect(pulseInput);
    oscillator.start(now);
    oscillator.stop(now + 0.48);
    pulseStep += 1;
  }

  function schedulePulse() {
    clearTimeout(pulseTimer);
    const profile = sceneProfiles[currentScene] || sceneProfiles.hero;
    pulseTimer = setTimeout(() => {
      musicPulse();
      schedulePulse();
    }, profile.pulse * 1000);
  }

  function oscillatorCue({
    frequency,
    end = frequency,
    duration = 0.16,
    volume = 0.12,
    type = "sine",
    delay = 0,
    pan = 0,
  }) {
    const now = ctx.currentTime + delay;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const stereo = ctx.createStereoPanner();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(24, frequency), now);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(24, end),
      now + duration,
    );
    stereo.pan.value = pan;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain).connect(stereo).connect(sfxBus);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  function noiseCue({
    duration = 0.28,
    volume = 0.075,
    frequency = 900,
    end = 2400,
    delay = 0,
    pan = 0,
  } = {}) {
    const now = ctx.currentTime + delay;
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const stereo = ctx.createStereoPanner();
    source.buffer = noiseBuffer(Math.max(0.35, duration));
    filter.type = "bandpass";
    filter.Q.value = 0.75;
    filter.frequency.setValueAtTime(frequency, now);
    filter.frequency.exponentialRampToValueAtTime(end, now + duration);
    stereo.pan.value = pan;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(stereo).connect(sfxBus);
    source.start(now);
    source.stop(now + duration + 0.03);
  }

  function playCue(type, options = {}) {
    if (!ctx || !active || ctx.state !== "running") return;
    const variant = Number(options.variant || 0);
    if (type === "click") {
      oscillatorCue({
        frequency: tone * (4.1 + (variant % 4) * 0.4),
        end: tone * 3.1,
        duration: 0.075,
        volume: 0.085,
        pan: ((variant % 3) - 1) * 0.22,
      });
      return;
    }
    if (type === "finish") {
      const base = tone * (5.1 + variant * 0.42);
      noiseCue({ duration: 0.2, volume: 0.04, frequency: 1700, end: 3900 });
      oscillatorCue({ frequency: base, end: base * 1.5, volume: 0.12 });
      oscillatorCue({
        frequency: base * 1.5,
        end: base * 2,
        delay: 0.09,
        duration: 0.24,
        volume: 0.08,
        pan: variant % 2 ? 0.45 : -0.45,
      });
      return;
    }

    const sceneName = type === "scene" ? options.scene : type;
    if (sceneName === "sound") {
      [0, 0.12, 0.24].forEach((delay, index) =>
        oscillatorCue({
          frequency: tone * (2.2 + index * 0.28),
          end: tone * (1.6 + index * 0.2),
          duration: 0.28,
          volume: 0.13 - index * 0.018,
          type: "triangle",
          delay,
          pan: index === 1 ? 0.45 : -0.34,
        }),
      );
      return;
    }
    if (sceneName === "craft") {
      noiseCue({ duration: 0.72, volume: 0.09, frequency: 420, end: 3200 });
      [0, 0.11, 0.22, 0.33].forEach((delay, index) =>
        oscillatorCue({
          frequency: tone * (7.2 - index * 0.72),
          end: tone * (4.4 - index * 0.32),
          duration: 0.25,
          volume: 0.09,
          delay,
          pan: -0.65 + index * 0.43,
        }),
      );
      return;
    }
    if (sceneName === "comfort") {
      [0, 0.32].forEach((delay, index) =>
        oscillatorCue({
          frequency: tone * (index ? 2.66 : 2),
          end: tone * (index ? 2.5 : 1.9),
          duration: 0.58,
          volume: 0.105,
          type: "sine",
          delay,
          pan: index ? 0.25 : -0.25,
        }),
      );
      return;
    }
    if (sceneName === "context") {
      noiseCue({ duration: 0.34, volume: 0.06, frequency: 2100, end: 620 });
      oscillatorCue({
        frequency: 480,
        end: 170,
        duration: 0.17,
        volume: 0.09,
        pan: -0.6,
      });
      oscillatorCue({
        frequency: 520,
        end: 185,
        duration: 0.17,
        volume: 0.09,
        delay: 0.15,
        pan: 0.6,
      });
      return;
    }
    if (sceneName === "reserve") {
      [0, 4, 7, 12].forEach((semitone, index) =>
        oscillatorCue({
          frequency: tone * 3 * 2 ** (semitone / 12),
          end: tone * 3.04 * 2 ** (semitone / 12),
          duration: 0.62,
          volume: 0.075,
          delay: index * 0.095,
          pan: -0.5 + index / 3,
        }),
      );
      return;
    }
    noiseCue({ duration: 0.42, volume: 0.055, frequency: 520, end: 1850 });
    oscillatorCue({
      frequency: tone * 2,
      end: tone * 3,
      duration: 0.45,
      volume: 0.09,
    });
  }

  async function start() {
    if (!AudioContextClass) return false;
    if (starting) return starting;
    starting = (async () => {
      if (!ctx) {
        createAudioGraph();
        updateMusicScene(currentScene);
        schedulePulse();
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
    schedulePulse();
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
    setMasterLevel(active, 0.32);
    button.classList.toggle("on", active);
    button.textContent = active ? "SOUND ON" : "SOUND OFF";
    button.setAttribute("aria-pressed", String(active));
    if (active) playCue(currentScene);
  });
  document.querySelectorAll("a,button").forEach((control, index) => {
    if (control !== button && !control.matches(".finish-option")) {
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
          profile.cutoff * (0.88 + page * 0.26),
          ctx.currentTime,
          0.24,
        );
      }
    },
    { passive: true },
  );
  addEventListener("pagehide", () => clearTimeout(pulseTimer));
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
