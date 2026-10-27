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
    musicBus,
    effectsBus,
    reverbInput,
    droneFilter,
    chordFilter,
    noiseBuffer,
    arpeggioTimer,
    arpeggioStep = 0,
    active = true,
    armed = false,
    currentScene = 0,
    lastAudibleScene = -1;
  const droneVoices = [];
  const chordVoices = [];
  const sceneSound = [
    { root: 38, cutoff: 330, scale: [0, 7, 12, 19, 24] },
    { root: 42.5, cutoff: 510, scale: [0, 5, 9, 14, 17, 24] },
    { root: 47.5, cutoff: 820, scale: [0, 4, 7, 11, 16, 23] },
    { root: 35.6, cutoff: 440, scale: [0, 3, 7, 10, 14, 19] },
    { root: 32.7, cutoff: 245, scale: [0, 1, 7, 12, 18, 24] },
  ];
  const sceneCueNames = [
    "earth-arrival",
    "moon-orbit",
    "sunrise",
    "craft-launch",
    "eclipse-arrival",
  ];
  const now = (delay = 0) => ctx.currentTime + delay;
  const isAudible = () =>
    Boolean(ctx && active && ctx.state === "running" && effectsBus);
  const connectWithSpace = (node, destination, wet = 0.22) => {
    node.connect(destination);
    if (reverbInput && wet > 0) {
      const send = ctx.createGain();
      send.gain.value = wet;
      node.connect(send).connect(reverbInput);
    }
  };
  const makeNoiseBuffer = (duration = 3) => {
    const buffer = ctx.createBuffer(
      1,
      Math.ceil(ctx.sampleRate * duration),
      ctx.sampleRate,
    );
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      brown = (brown + 0.018 * white) / 1.018;
      data[i] = brown * 3.2;
    }
    return buffer;
  };
  const makeImpulse = (duration = 3.2, decay = 3.6) => {
    const length = Math.ceil(ctx.sampleRate * duration);
    const impulse = ctx.createBuffer(2, length, ctx.sampleRate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  };
  const voice = ({
    from,
    to = from,
    delay = 0,
    duration = 0.6,
    gain = 0.06,
    type = "sine",
    attack = 0.018,
    wet = 0.25,
    pan = 0,
  }) => {
    if (!isAudible()) return;
    const startAt = now(delay);
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const panner = ctx.createStereoPanner();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(1, from), startAt);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, to),
      startAt + duration,
    );
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(
      gain,
      startAt + Math.min(attack, duration * 0.35),
    );
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    panner.pan.value = pan;
    oscillator.connect(envelope).connect(panner);
    connectWithSpace(panner, effectsBus, wet);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.06);
  };
  const noiseSweep = ({
    delay = 0,
    duration = 0.9,
    from = 180,
    to = 2600,
    gain = 0.08,
    type = "bandpass",
    wet = 0.16,
    pan = 0,
  } = {}) => {
    if (!isAudible()) return;
    const startAt = now(delay);
    const source = ctx.createBufferSource();
    const sweepFilter = ctx.createBiquadFilter();
    const envelope = ctx.createGain();
    const panner = ctx.createStereoPanner();
    source.buffer = noiseBuffer;
    sweepFilter.type = type;
    sweepFilter.Q.value = type === "bandpass" ? 1.25 : 0.65;
    sweepFilter.frequency.setValueAtTime(Math.max(20, from), startAt);
    sweepFilter.frequency.exponentialRampToValueAtTime(
      Math.max(20, to),
      startAt + duration,
    );
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(gain, startAt + duration * 0.38);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    panner.pan.value = pan;
    source.connect(sweepFilter).connect(envelope).connect(panner);
    connectWithSpace(panner, effectsBus, wet);
    source.start(startAt, Math.random() * 0.8, duration);
  };
  const twinkle = (frequency, delay = 0, gain = 0.026, pan = 0) => {
    voice({
      from: frequency,
      to: frequency * 0.997,
      delay,
      duration: 1.35,
      gain,
      type: "sine",
      attack: 0.012,
      wet: 0.62,
      pan,
    });
    voice({
      from: frequency * 2.003,
      to: frequency * 2,
      delay: delay + 0.018,
      duration: 0.72,
      gain: gain * 0.22,
      type: "triangle",
      attack: 0.008,
      wet: 0.7,
      pan,
    });
  };
  const setButtonState = () => {
    button.classList.toggle("on", active);
    button.textContent = active
      ? armed
        ? "SOUND ON"
        : "SOUND ON · SCROLL OR TAP"
      : "SOUND OFF";
    button.setAttribute("aria-pressed", String(active));
  };
  const fadeMaster = (value, duration = 0.5) => {
    if (!master || !ctx) return;
    const time = ctx.currentTime;
    master.gain.cancelScheduledValues(time);
    master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), time);
    master.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, value),
      time + duration,
    );
  };
  const retuneScene = (sceneIndex, immediate = false) => {
    if (!ctx || !droneFilter) return;
    const setting = sceneSound[sceneIndex] || sceneSound[0];
    const at = ctx.currentTime;
    const glide = immediate ? 0.02 : 2.8;
    const droneRatios = [0.5, 1, 1.5];
    const chordRatios = [2, 3, 4.5];
    droneVoices.forEach((oscillator, index) => {
      oscillator.frequency.cancelScheduledValues(at);
      oscillator.frequency.exponentialRampToValueAtTime(
        setting.root * droneRatios[index],
        at + glide,
      );
    });
    chordVoices.forEach((oscillator, index) => {
      oscillator.frequency.cancelScheduledValues(at);
      oscillator.frequency.exponentialRampToValueAtTime(
        setting.root * chordRatios[index],
        at + glide,
      );
    });
    droneFilter.frequency.setTargetAtTime(
      setting.cutoff,
      at,
      immediate ? 0.01 : 1,
    );
    chordFilter.frequency.setTargetAtTime(
      setting.cutoff * 2.4,
      at,
      immediate ? 0.01 : 1.2,
    );
  };
  const playSceneCue = (name) => {
    if (!isAudible()) return false;
    const root = (sceneSound[currentScene] || sceneSound[0]).root;
    if (name === "earth-arrival") {
      noiseSweep({
        duration: 1.15,
        from: 140,
        to: 1700,
        gain: 0.075,
        pan: -0.2,
      });
      voice({
        from: root,
        to: root * 0.74,
        duration: 1.4,
        gain: 0.085,
        type: "sine",
        wet: 0.38,
      });
      [4, 6, 8].forEach((ratio, index) =>
        twinkle(root * ratio, 0.28 + index * 0.16, 0.021, -0.45 + index * 0.45),
      );
    } else if (name === "moon-orbit") {
      noiseSweep({
        duration: 0.72,
        from: 2200,
        to: 320,
        gain: 0.065,
        pan: 0.45,
      });
      [3, 4.5, 6, 8].forEach((ratio, index) =>
        twinkle(
          root * ratio,
          0.08 + index * 0.17,
          0.025,
          index % 2 ? 0.58 : -0.58,
        ),
      );
      voice({
        from: root * 1.5,
        to: root * 2.25,
        delay: 0.05,
        duration: 1.05,
        gain: 0.046,
        type: "triangle",
        wet: 0.48,
      });
    } else if (name === "sunrise") {
      noiseSweep({
        duration: 1.45,
        from: 260,
        to: 5200,
        gain: 0.085,
        wet: 0.34,
      });
      [2, 2.5, 3, 4].forEach((ratio, index) =>
        voice({
          from: root * ratio,
          to: root * ratio * 1.012,
          delay: 0.12 + index * 0.055,
          duration: 2.1,
          gain: 0.024,
          type: index % 2 ? "triangle" : "sine",
          attack: 0.5,
          wet: 0.62,
          pan: -0.45 + index * 0.3,
        }),
      );
      twinkle(root * 10, 0.74, 0.033, 0.28);
    } else if (name === "craft-launch") {
      noiseSweep({
        duration: 1.55,
        from: 90,
        to: 780,
        gain: 0.115,
        type: "lowpass",
        wet: 0.08,
      });
      voice({
        from: 34,
        to: 146,
        duration: 1.42,
        gain: 0.105,
        type: "sawtooth",
        attack: 0.08,
        wet: 0.1,
      });
      voice({
        from: root * 2,
        to: root * 7,
        delay: 0.18,
        duration: 1.16,
        gain: 0.038,
        type: "triangle",
        wet: 0.35,
        pan: 0.22,
      });
      twinkle(root * 8, 0.92, 0.026, 0.55);
    } else if (name === "eclipse-arrival") {
      noiseSweep({
        duration: 1.18,
        from: 3100,
        to: 115,
        gain: 0.075,
        pan: -0.18,
      });
      voice({
        from: root * 2,
        to: root * 0.72,
        duration: 1.7,
        gain: 0.09,
        type: "sine",
        wet: 0.5,
      });
      voice({
        from: root * 6,
        to: root * 5.95,
        delay: 0.62,
        duration: 2.25,
        gain: 0.035,
        type: "sine",
        wet: 0.78,
        pan: 0.32,
      });
      twinkle(root * 9, 0.88, 0.021, -0.4);
    } else if (name === "ui-confirm") {
      twinkle(root * 7, 0, 0.022, 0);
    } else {
      return false;
    }
    return true;
  };
  const buildSoundscape = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;
    ctx = new AudioContextClass();
    master = ctx.createGain();
    musicBus = ctx.createGain();
    effectsBus = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    const convolver = ctx.createConvolver();
    const reverbGain = ctx.createGain();
    reverbInput = ctx.createGain();
    droneFilter = ctx.createBiquadFilter();
    chordFilter = ctx.createBiquadFilter();
    noiseBuffer = makeNoiseBuffer();
    master.gain.value = 0.0001;
    musicBus.gain.value = 0.5;
    effectsBus.gain.value = 0.72;
    compressor.threshold.value = -19;
    compressor.knee.value = 18;
    compressor.ratio.value = 3.2;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.42;
    convolver.buffer = makeImpulse();
    reverbGain.gain.value = 0.24;
    musicBus.connect(master);
    effectsBus.connect(master);
    reverbInput.connect(convolver).connect(reverbGain).connect(master);
    master.connect(compressor).connect(ctx.destination);
    droneFilter.type = "lowpass";
    droneFilter.Q.value = 0.75;
    chordFilter.type = "lowpass";
    chordFilter.Q.value = 0.5;
    droneFilter.connect(musicBus);
    chordFilter.connect(musicBus);
    [
      ["sine", 0.105],
      ["triangle", 0.042],
      ["sine", 0.026],
    ].forEach(([type, level]) => {
      const oscillator = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = 38;
      voiceGain.gain.value = level;
      oscillator.connect(voiceGain).connect(droneFilter);
      oscillator.start();
      droneVoices.push(oscillator);
    });
    [
      ["sine", 0.018],
      ["triangle", 0.014],
      ["sine", 0.009],
    ].forEach(([type, level]) => {
      const oscillator = ctx.createOscillator();
      const voiceGain = ctx.createGain();
      oscillator.type = type;
      oscillator.frequency.value = 76;
      voiceGain.gain.value = level;
      oscillator.connect(voiceGain).connect(chordFilter);
      oscillator.start();
      chordVoices.push(oscillator);
    });
    const filterLfo = ctx.createOscillator();
    const filterDepth = ctx.createGain();
    filterLfo.frequency.value = 0.027;
    filterDepth.gain.value = 105;
    filterLfo.connect(filterDepth).connect(droneFilter.frequency);
    filterLfo.start();
    retuneScene(currentScene, true);
    arpeggioTimer = window.setInterval(() => {
      if (!isAudible() || document.hidden) return;
      const setting = sceneSound[currentScene] || sceneSound[0];
      const semitone = setting.scale[arpeggioStep % setting.scale.length];
      const frequency = setting.root * 4 * Math.pow(2, semitone / 12);
      const pan = Math.sin(arpeggioStep * 1.9) * 0.62;
      twinkle(frequency, 0, 0.016 + (arpeggioStep % 3 === 0 ? 0.006 : 0), pan);
      if (arpeggioStep % 4 === 0) {
        voice({
          from: setting.root * 2,
          duration: 0.72,
          gain: 0.018,
          type: "sine",
          wet: 0.35,
          pan: -pan * 0.35,
        });
      }
      arpeggioStep += 1;
    }, 1450);
    return true;
  };
  const start = async ({ announceScene = true } = {}) => {
    if (!ctx && !buildSoundscape()) return false;
    await ctx.resume();
    armed = true;
    setButtonState();
    fadeMaster(active ? 0.62 : 0.0001, 0.8);
    if (active && announceScene && lastAudibleScene !== currentScene) {
      playSceneCue(sceneCueNames[currentScene]);
      lastAudibleScene = currentScene;
    }
    return true;
  };
  const blip = (frequency = tone * 4, duration = 0.085) => {
    if (!isAudible()) return;
    voice({
      from: frequency,
      to: frequency * 0.68,
      duration,
      gain: 0.052,
      type: "sine",
      attack: 0.006,
      wet: 0.12,
    });
  };
  const setScene = (sceneIndex, { force = false } = {}) => {
    const nextScene = Math.max(
      0,
      Math.min(sceneSound.length - 1, Math.round(sceneIndex)),
    );
    if (!force && nextScene === currentScene) return false;
    currentScene = nextScene;
    retuneScene(currentScene);
    if (isAudible() && (force || lastAudibleScene !== currentScene)) {
      playSceneCue(sceneCueNames[currentScene]);
      lastAudibleScene = currentScene;
    }
    return true;
  };
  const cue = (name) => playSceneCue(name);
  const unlock = (event) => {
    if (
      event.target instanceof Element &&
      event.target.closest(".sound-toggle")
    )
      return;
    start();
  };
  addEventListener("pointerdown", unlock, { once: true, capture: true });
  addEventListener("keydown", unlock, { once: true, capture: true });
  addEventListener("wheel", unlock, {
    once: true,
    passive: true,
    capture: true,
  });
  addEventListener("scroll", unlock, {
    once: true,
    passive: true,
    capture: true,
  });

  button.addEventListener("click", async () => {
    if (!armed) {
      const started = await start();
      if (started) return;
    }
    active = !active;
    fadeMaster(active ? 0.62 : 0.0001, active ? 0.45 : 0.24);
    setButtonState();
    if (active) {
      playSceneCue("ui-confirm");
      if (lastAudibleScene !== currentScene) {
        window.setTimeout(() => {
          if (!isAudible()) return;
          playSceneCue(sceneCueNames[currentScene]);
          lastAudibleScene = currentScene;
        }, 180);
      }
    }
  });
  document.querySelectorAll("a,button").forEach((control, i) => {
    if (control !== button)
      control.addEventListener("click", () =>
        blip(tone * (3.2 + (i % 4) * 0.55), 0.075),
      );
  });
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
  setButtonState();
  return Object.freeze({
    start,
    setScene,
    cue,
    click: blip,
    get enabled() {
      return active;
    },
    get scene() {
      return currentScene;
    },
  });
}
