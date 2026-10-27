export function setupExperience({
  tone = 72,
  accent = "#caff63",
  target,
  id,
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
    .experience-context{position:relative;z-index:auto;min-height:110vh;display:flex;flex-direction:column;justify-content:center;padding:10vw 4vw;background:#101010;color:#f4f1eb}.experience-context>*{position:relative;z-index:3}.experience-context__head{width:50%;max-width:760px}.experience-context__eyebrow{font:10px monospace;letter-spacing:.14em;color:var(--sound-accent)}.experience-context h2{font-size:clamp(48px,7vw,104px);line-height:.86;letter-spacing:-.06em;font-weight:400;margin:25px 0}.experience-context__head>p{color:#aaa;line-height:1.75}.experience-context__grid{width:50%;display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:#555;margin-top:6vw}.experience-context article{background:#181818e8;padding:28px;backdrop-filter:blur(8px)}.experience-context article b{color:var(--sound-accent);font:10px monospace}.experience-context article h3{font-size:22px;font-weight:500}.experience-context article p{color:#999;line-height:1.55;font-size:14px}
    @media(max-width:760px){.experience-context__head,.experience-context__grid{width:100%}.experience-context__grid{grid-template-columns:1fr}.sound-toggle{left:14px;bottom:14px}nav{background:#0b0b0bed!important}}
  `;
  document.head.append(style);
  document.documentElement.style.setProperty("--sound-accent", accent);
  const section = document.createElement("section");
  section.className = "experience-context";
  if (id) section.id = id;
  section.innerHTML = `<div class="experience-context__head"><span class="experience-context__eyebrow">${eyebrow}</span><h2>${title}</h2><p>${intro}</p></div><div class="experience-context__grid">${items.map((x, i) => `<article><b>0${i + 1}</b><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</div>`;
  document.querySelector(target)?.before(section);

  const button = document.createElement("button");
  button.className = "sound-toggle on";
  button.type = "button";
  button.textContent = "SOUND ON / SCROLL OR TAP";
  button.setAttribute("aria-pressed", "true");
  document.body.append(button);

  let ctx;
  let master;
  let musicBus;
  let sfxBus;
  let musicFilter;
  let noiseBuffer;
  let nextStepAt = 0;
  let sequenceStep = 0;
  let active = true;
  let armed = false;
  let currentScene = 0;
  let pendingCue = { name: "ignition", options: {} };
  let startOnlyClick = false;
  let audioStartPromise = null;
  let lastWakeAttemptAt = 0;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const roots = [
    tone / 2,
    tone / 2,
    tone * 0.561,
    tone / 2,
    tone * 0.63,
    tone * 0.561,
  ];
  const sceneEnergy = [0.38, 1, 0.62, 0.48, 0.74, 0.34];

  const scheduleTone = ({
    from,
    to = from,
    duration = 0.12,
    gain = 0.05,
    type = "sine",
    when = 0,
    destination = sfxBus,
    filterFrequency = 0,
  }) => {
    if (!ctx || !destination) return;
    const startAt = ctx.currentTime + Math.max(0, when);
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    const output = filterFrequency ? ctx.createBiquadFilter() : envelope;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(1, from), startAt);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(1, to),
      startAt + duration,
    );
    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(gain, startAt + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(envelope);
    if (filterFrequency) {
      output.type = "lowpass";
      output.frequency.value = filterFrequency;
      envelope.connect(output).connect(destination);
    } else {
      envelope.connect(destination);
    }
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  };

  const scheduleNoise = ({
    duration = 0.08,
    gain = 0.025,
    frequency = 2800,
    type = "highpass",
    when = 0,
    destination = sfxBus,
  } = {}) => {
    if (!ctx || !noiseBuffer || !destination) return;
    const startAt = ctx.currentTime + Math.max(0, when);
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const envelope = ctx.createGain();
    source.buffer = noiseBuffer;
    filter.type = type;
    filter.frequency.value = frequency;
    envelope.gain.setValueAtTime(gain, startAt);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    source.connect(filter).connect(envelope).connect(destination);
    source.start(startAt);
    source.stop(startAt + duration + 0.02);
  };

  const metallicTick = (when = 0, pitch = 1, gain = 0.055) => {
    scheduleTone({
      from: 980 * pitch,
      to: 610 * pitch,
      duration: 0.075,
      gain,
      type: "square",
      when,
      filterFrequency: 2600,
    });
    scheduleTone({
      from: 1640 * pitch,
      to: 1050 * pitch,
      duration: 0.055,
      gain: gain * 0.42,
      type: "sine",
      when: when + 0.008,
    });
  };

  const playCue = (name, options = {}) => {
    if (!active) return;
    if (!ctx || !armed || ctx.state !== "running") {
      pendingCue = { name, options };
      return;
    }
    const variant = Number(options.variant || 0);
    if (name === "ignition") {
      metallicTick(0, 0.72, 0.07);
      scheduleTone({
        from: 34,
        to: 86,
        duration: 0.7,
        gain: 0.11,
        type: "sawtooth",
        filterFrequency: 520,
      });
      scheduleTone({
        from: 92,
        to: 128,
        duration: 0.54,
        gain: 0.045,
        when: 0.14,
      });
    } else if (name === "acceleration") {
      scheduleTone({
        from: 58,
        to: 520,
        duration: 0.78,
        gain: 0.09,
        type: "sawtooth",
        filterFrequency: 1450,
      });
      scheduleNoise({
        duration: 0.58,
        gain: 0.032,
        frequency: 780,
        type: "bandpass",
      });
    } else if (name === "explode") {
      [0, 0.08, 0.17, 0.28, 0.42].forEach((offset, index) =>
        metallicTick(offset, 1 + index * 0.12, 0.064 - index * 0.006),
      );
      scheduleTone({
        from: 210,
        to: 62,
        duration: 0.55,
        gain: 0.055,
        type: "triangle",
      });
    } else if (name === "assemble") {
      [0, 0.1, 0.2, 0.3].forEach((offset, index) =>
        metallicTick(offset, 1.34 - index * 0.13, 0.05 + index * 0.006),
      );
      scheduleTone({
        from: 72,
        to: 250,
        duration: 0.46,
        gain: 0.045,
        type: "triangle",
      });
    } else if (name === "scan") {
      scheduleTone({
        from: 240,
        to: 1320,
        duration: 0.68,
        gain: 0.052,
        type: "sine",
      });
      [0, 0.15, 0.3].forEach((offset, index) =>
        scheduleTone({
          from: 620 + index * 155,
          to: 760 + index * 155,
          duration: 0.14,
          gain: 0.035,
          when: offset,
        }),
      );
    } else if (name === "closing") {
      metallicTick(0, 0.86, 0.055);
      [256, 192, 128].forEach((frequency, index) =>
        scheduleTone({
          from: frequency,
          to: frequency * 0.93,
          duration: 0.34,
          gain: 0.038,
          type: "triangle",
          when: index * 0.12,
        }),
      );
    } else if (name === "paint") {
      const paintNotes = [392, 311, 466, 220];
      const frequency = paintNotes[variant % paintNotes.length];
      scheduleNoise({ duration: 0.16, gain: 0.018, frequency: 1500 });
      scheduleTone({
        from: frequency * 0.62,
        to: frequency,
        duration: 0.3,
        gain: 0.052,
        type: "triangle",
        filterFrequency: 1800,
      });
      scheduleTone({
        from: frequency * 1.5,
        to: frequency,
        duration: 0.25,
        gain: 0.023,
        when: 0.05,
      });
    } else if (name.startsWith("ride-")) {
      const mode = name.slice(5);
      const patterns = {
        street: [196, 247, 294],
        track: [220, 330, 440],
        tour: [174, 220, 261],
      };
      (patterns[mode] || patterns.street).forEach((frequency, index) => {
        scheduleTone({
          from: frequency * 0.82,
          to: frequency,
          duration: 0.16,
          gain: 0.042,
          type: mode === "track" ? "square" : "triangle",
          when: index * 0.075,
          filterFrequency: 1600,
        });
      });
      metallicTick(
        0.03,
        mode === "track" ? 1.24 : mode === "tour" ? 0.82 : 1,
        0.035,
      );
    } else {
      scheduleTone({
        from: tone * 4,
        to: tone * 2.7,
        duration: 0.08,
        gain: 0.04,
      });
    }
  };

  const scheduleMusic = () => {
    if (!ctx || ctx.state !== "running" || !active) {
      if (ctx) nextStepAt = ctx.currentTime + 0.08;
      return;
    }
    const sixteenth = 60 / 110 / 4;
    while (nextStepAt < ctx.currentTime + 0.16) {
      const step = sequenceStep % 16;
      const root = roots[currentScene] || roots[0];
      const energy = sceneEnergy[currentScene] || sceneEnergy[0];
      const delay = Math.max(0, nextStepAt - ctx.currentTime);

      if (step % 4 === 0) {
        scheduleTone({
          from: 92,
          to: 38,
          duration: 0.18,
          gain: 0.075 * energy,
          type: "sine",
          when: delay,
          destination: musicBus,
        });
        scheduleTone({
          from: root * (step === 12 ? 1.122 : 1),
          to: root * 0.985,
          duration: 0.25,
          gain: 0.052 * energy,
          type: "sawtooth",
          when: delay,
          destination: musicBus,
          filterFrequency: 520 + energy * 340,
        });
      }
      if (step % 2 === 0) {
        const arp = [2, 3, 4, 6, 4, 3, 5, 3][(step / 2) % 8];
        scheduleTone({
          from: root * arp,
          to: root * arp * 0.995,
          duration: 0.085,
          gain: 0.014 + energy * 0.009,
          type: "triangle",
          when: delay,
          destination: musicBus,
          filterFrequency: 1900,
        });
      }
      if (step % 4 === 2 || (currentScene === 1 && step % 2 === 1)) {
        scheduleNoise({
          duration: 0.034,
          gain: 0.008 + energy * 0.008,
          frequency: 4300,
          when: delay,
          destination: musicBus,
        });
      }
      nextStepAt += sixteenth;
      sequenceStep += 1;
    }
  };

  const initialiseAudio = () => {
    ctx = new AudioContextClass();
    master = ctx.createGain();
    musicBus = ctx.createGain();
    sfxBus = ctx.createGain();
    musicFilter = ctx.createBiquadFilter();
    const compressor = ctx.createDynamicsCompressor();
    master.gain.value = 0.0001;
    musicBus.gain.value = 0.52;
    sfxBus.gain.value = 0.72;
    musicFilter.type = "lowpass";
    musicFilter.frequency.value = 1080;
    musicFilter.Q.value = 0.7;
    compressor.threshold.value = -18;
    compressor.knee.value = 14;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.008;
    compressor.release.value = 0.2;
    musicBus.connect(musicFilter).connect(compressor);
    sfxBus.connect(compressor);
    compressor.connect(master).connect(ctx.destination);

    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const noise = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noise.length; i += 1) noise[i] = Math.random() * 2 - 1;

    const motorBus = ctx.createGain();
    const motorFilter = ctx.createBiquadFilter();
    motorBus.gain.value = 0.032;
    motorFilter.type = "lowpass";
    motorFilter.frequency.value = 310;
    motorBus.connect(motorFilter).connect(musicBus);
    [
      (rootFrequency) => rootFrequency,
      (rootFrequency) => rootFrequency * 2.01,
    ].forEach((ratio, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = index ? "triangle" : "sawtooth";
      oscillator.frequency.value = ratio(tone / 2);
      gain.gain.value = index ? 0.24 : 0.4;
      oscillator.connect(gain).connect(motorBus);
      oscillator.start();
    });

    nextStepAt = ctx.currentTime + 0.06;
    window.setInterval(scheduleMusic, 60);
  };

  const start = async () => {
    if (!AudioContextClass) {
      button.textContent = "SOUND UNAVAILABLE";
      button.classList.remove("on");
      button.disabled = true;
      return false;
    }
    if (!ctx) initialiseAudio();
    if (ctx.state !== "running") await ctx.resume();
    armed = ctx.state === "running";
    if (!armed) return false;
    button.textContent = active ? "SOUND ON" : "SOUND OFF";
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(
      Math.max(master.gain.value, 0.0001),
      ctx.currentTime,
    );
    master.gain.exponentialRampToValueAtTime(
      active ? 0.82 : 0.0001,
      ctx.currentTime + 0.32,
    );
    if (active && pendingCue) {
      const cue = pendingCue;
      pendingCue = null;
      playCue(cue.name, cue.options);
    }
    return true;
  };

  const blip = (frequency = tone * 4, duration = 0.08) => {
    if (!ctx || !armed || !active) return;
    scheduleTone({
      from: frequency,
      to: frequency * 0.68,
      duration,
      gain: 0.035,
    });
  };

  const requestAudioStart = () => {
    if (!active) return Promise.resolve(false);
    if (armed && ctx?.state === "running") return Promise.resolve(true);
    if (audioStartPromise) return audioStartPromise;

    lastWakeAttemptAt = performance.now();
    audioStartPromise = start()
      .catch(() => false)
      .finally(() => {
        audioStartPromise = null;
      });
    return audioStartPromise;
  };

  const unlock = (event) => {
    if (!armed && event.target?.closest?.(".sound-toggle")) {
      startOnlyClick = true;
    }
    requestAudioStart();
  };
  addEventListener("pointerdown", unlock, { once: true, capture: true });
  addEventListener("keydown", unlock, { once: true, capture: true });
  addEventListener("touchstart", unlock, { once: true, capture: true });
  addEventListener("wheel", requestAudioStart, { once: true, passive: true });

  button.addEventListener("click", async () => {
    if (
      (!armed || ctx.state !== "running") &&
      !(await requestAudioStart())
    )
      return;
    if (startOnlyClick) {
      startOnlyClick = false;
      return;
    }
    active = !active;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(
      Math.max(master.gain.value, 0.0001),
      ctx.currentTime,
    );
    master.gain.exponentialRampToValueAtTime(
      active ? 0.82 : 0.0001,
      ctx.currentTime + 0.24,
    );
    button.classList.toggle("on", active);
    button.textContent = active ? "SOUND ON" : "SOUND OFF";
    button.setAttribute("aria-pressed", String(active));
    if (active) {
      nextStepAt = Math.max(nextStepAt, ctx.currentTime + 0.04);
      blip(tone * 5, 0.12);
    }
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
      if (
        active &&
        (!armed || ctx?.state !== "running") &&
        performance.now() - lastWakeAttemptAt > 750
      ) {
        requestAudioStart();
      }
      if (ctx && active) {
        const p =
          scrollY /
          Math.max(1, document.documentElement.scrollHeight - innerHeight);
        musicFilter.frequency.setTargetAtTime(
          720 + p * 980 + sceneEnergy[currentScene] * 260,
          ctx.currentTime,
          0.12,
        );
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

  const cueScene = (stage) => {
    currentScene = Math.max(0, Math.min(5, Number(stage) || 0));
    if (ctx && musicFilter) {
      musicFilter.frequency.setTargetAtTime(
        760 + sceneEnergy[currentScene] * 720,
        ctx.currentTime,
        0.16,
      );
    }
    const sceneCues = [
      "ignition",
      "acceleration",
      "explode",
      "assemble",
      "scan",
      "closing",
    ];
    playCue(sceneCues[currentScene]);
  };

  const cueAction = (name, options = {}) => playCue(name, options);

  return Object.freeze({ cueScene, cueAction, start });
}
