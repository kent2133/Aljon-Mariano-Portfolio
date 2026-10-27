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
  button.textContent = "SOUND ON · TAP TO START";
  button.title = "Music begins after your first interaction";
  button.setAttribute("aria-pressed", "true");
  document.body.append(button);

  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  const sceneRoots = [82.41, 92.5, 73.42, 98, 87.31, 65.41];
  const arpeggio = [1, 1.5, 2, 2.5, 3, 2.5, 2, 1.5];
  let context;
  let master;
  let musicBus;
  let effectsBus;
  let musicFilter;
  let delay;
  let noiseBuffer;
  let padVoices = [];
  let scheduler;
  let nextBeat = 0;
  let beat = 0;
  let currentScene = 0;
  let active = true;
  let armed = false;
  let starting;

  const connectWithSpace = (source, destination, wet = 0.18) => {
    source.connect(destination);
    if (!delay) return;
    const send = context.createGain();
    send.gain.value = wet;
    source.connect(send).connect(delay);
  };

  const note = ({
    frequency,
    when = context.currentTime,
    duration = 0.22,
    volume = 0.04,
    type = "sine",
    destination = effectsBus,
    pan = 0,
  }) => {
    if (!context || !destination) return;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const panner = context.createStereoPanner?.();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), when);
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.exponentialRampToValueAtTime(volume, when + 0.012);
    envelope.gain.exponentialRampToValueAtTime(
      0.0001,
      when + Math.max(0.06, duration),
    );
    oscillator.connect(envelope);
    if (panner) {
      panner.pan.value = pan;
      connectWithSpace(
        panner,
        destination,
        destination === musicBus ? 0.26 : 0.12,
      );
      envelope.connect(panner);
    } else {
      connectWithSpace(
        envelope,
        destination,
        destination === musicBus ? 0.26 : 0.12,
      );
    }
    oscillator.start(when);
    oscillator.stop(when + duration + 0.08);
  };

  const noiseSweep = ({
    from = 500,
    to = 2400,
    duration = 0.5,
    volume = 0.055,
    when = context.currentTime,
  } = {}) => {
    if (!context || !noiseBuffer) return;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    source.buffer = noiseBuffer;
    filter.type = "bandpass";
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(Math.max(40, from), when);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(40, to),
      when + duration,
    );
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.linearRampToValueAtTime(volume, when + duration * 0.3);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    source.connect(filter).connect(envelope).connect(effectsBus);
    source.start(when, 0, duration);
  };

  const playSceneCue = (index, introCue = false) => {
    if (!context || !active) return;
    const now = context.currentTime + 0.025;
    const root = sceneRoots[index] || sceneRoots[0];
    if (index === 0) {
      [1, 1.5, 2].forEach((ratio, i) =>
        note({
          frequency: root * ratio,
          when: now + i * 0.08,
          duration: 0.55,
          volume: introCue ? 0.055 : 0.045,
          type: "sine",
          pan: i - 1,
        }),
      );
    } else if (index === 1) {
      noiseSweep({ from: 260, to: 2100, duration: 0.58, volume: 0.045 });
      [2, 2.5, 3, 4].forEach((ratio, i) =>
        note({
          frequency: root * ratio,
          when: now + i * 0.075,
          duration: 0.22,
          volume: 0.032,
          pan: i % 2 ? 0.65 : -0.65,
        }),
      );
    } else if (index === 2) {
      noiseSweep({ from: 1900, to: 280, duration: 0.7, volume: 0.05 });
      note({
        frequency: root,
        when: now,
        duration: 0.75,
        volume: 0.07,
        type: "triangle",
      });
      note({
        frequency: root * 2,
        when: now + 0.18,
        duration: 0.42,
        volume: 0.04,
      });
    } else if (index === 3) {
      [0, 0.17, 0.34].forEach((offset, i) =>
        note({
          frequency: root * [1, 1.5, 2][i],
          when: now + offset,
          duration: 0.18,
          volume: 0.055,
          type: "square",
          pan: -0.5 + i * 0.5,
        }),
      );
    } else if (index === 4) {
      noiseSweep({ from: 340, to: 3600, duration: 0.8, volume: 0.04 });
      [2, 3, 4].forEach((ratio, i) =>
        note({
          frequency: root * ratio,
          when: now + i * 0.11,
          duration: 0.85,
          volume: 0.042,
          pan: i - 1,
        }),
      );
    } else {
      [2, 1.5, 1].forEach((ratio, i) =>
        note({
          frequency: root * ratio,
          when: now + i * 0.12,
          duration: 0.8,
          volume: 0.05,
          type: i === 2 ? "triangle" : "sine",
          pan: 0.6 - i * 0.6,
        }),
      );
      noiseSweep({ from: 1400, to: 180, duration: 0.9, volume: 0.035 });
    }
  };

  const setScene = (index) => {
    const next = Math.max(0, Math.min(sceneRoots.length - 1, Number(index) || 0));
    if (next === currentScene) return;
    currentScene = next;
    if (!context) return;
    const now = context.currentTime;
    const root = sceneRoots[currentScene];
    padVoices.forEach(({ oscillator }, voiceIndex) => {
      oscillator.frequency.cancelScheduledValues(now);
      oscillator.frequency.exponentialRampToValueAtTime(
        root * [0.5, 1, 1.5][voiceIndex],
        now + 1.1,
      );
    });
    musicFilter.frequency.setTargetAtTime(760 + currentScene * 150, now, 0.6);
    playSceneCue(currentScene);
  };

  const scheduleMusic = () => {
    if (!context) return;
    if (!active || context.state !== "running") {
      nextBeat = context.currentTime + 0.08;
      return;
    }
    const beatLength = 60 / 88 / 2;
    while (nextBeat < context.currentTime + 0.14) {
      const root = sceneRoots[currentScene];
      const step = beat % arpeggio.length;
      note({
        frequency: root * arpeggio[step],
        when: nextBeat,
        duration: step % 2 ? 0.3 : 0.52,
        volume: step % 4 === 0 ? 0.035 : 0.022,
        type: step % 3 === 0 ? "triangle" : "sine",
        destination: musicBus,
        pan: Math.sin(beat * 1.7) * 0.72,
      });
      if (step % 4 === 0) {
        note({
          frequency: root * 0.5,
          when: nextBeat,
          duration: beatLength * 2.8,
          volume: 0.04,
          type: "triangle",
          destination: musicBus,
        });
      }
      if (step === 6) {
        note({
          frequency: root * 6,
          when: nextBeat + 0.04,
          duration: 0.75,
          volume: 0.012,
          destination: musicBus,
          pan: 0.8,
        });
      }
      nextBeat += beatLength;
      beat += 1;
    }
  };

  const createAudio = () => {
    context = new AudioEngine();
    master = context.createGain();
    musicBus = context.createGain();
    effectsBus = context.createGain();
    musicFilter = context.createBiquadFilter();
    delay = context.createDelay(1);
    const delayFeedback = context.createGain();
    const delayWet = context.createGain();
    const limiter = context.createDynamicsCompressor();

    master.gain.value = 0.0001;
    musicBus.gain.value = 0.72;
    effectsBus.gain.value = 0.74;
    musicFilter.type = "lowpass";
    musicFilter.frequency.value = 900;
    musicFilter.Q.value = 0.7;
    delay.delayTime.value = 0.26;
    delayFeedback.gain.value = 0.24;
    delayWet.gain.value = 0.24;
    limiter.threshold.value = -10;
    limiter.knee.value = 12;
    limiter.ratio.value = 5;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.22;

    musicBus.connect(musicFilter).connect(master);
    effectsBus.connect(master);
    delay.connect(delayFeedback).connect(delay);
    delay.connect(delayWet).connect(master);
    master.connect(limiter).connect(context.destination);

    noiseBuffer = context.createBuffer(
      1,
      context.sampleRate * 1.2,
      context.sampleRate,
    );
    const noise = noiseBuffer.getChannelData(0);
    let smoothNoise = 0;
    for (let index = 0; index < noise.length; index += 1) {
      smoothNoise = smoothNoise * 0.82 + (Math.random() * 2 - 1) * 0.18;
      noise[index] = smoothNoise;
    }

    const root = sceneRoots[currentScene];
    padVoices = [0.5, 1, 1.5].map((ratio, index) => {
      const oscillator = context.createOscillator();
      const voiceGain = context.createGain();
      oscillator.type = index === 1 ? "sine" : "triangle";
      oscillator.frequency.value = root * ratio;
      oscillator.detune.value = index === 0 ? -5 : index === 2 ? 6 : 0;
      voiceGain.gain.value = [0.018, 0.014, 0.008][index];
      oscillator.connect(voiceGain).connect(musicBus);
      oscillator.start();
      return { oscillator, voiceGain };
    });

    nextBeat = context.currentTime + 0.08;
    scheduler = window.setInterval(scheduleMusic, 60);
  };

  const start = async () => {
    if (!AudioEngine) return;
    if (starting) return starting;
    starting = (async () => {
      if (!context) createAudio();
      if (context.state !== "running") await context.resume();
      armed = true;
      nextBeat = context.currentTime + 0.06;
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(
        Math.max(0.0001, master.gain.value),
        context.currentTime,
      );
      master.gain.linearRampToValueAtTime(
        active ? 0.72 : 0.0001,
        context.currentTime + 0.45,
      );
      button.textContent = active ? "SOUND ON" : "SOUND OFF";
      button.title = "Toggle Nova's generative soundtrack";
      if (active) playSceneCue(currentScene, true);
    })();
    try {
      await starting;
    } finally {
      starting = undefined;
    }
  };

  const cue = (type = "interface", options = {}) => {
    if (!context || !active) return;
    const now = context.currentTime + 0.01;
    const root = sceneRoots[currentScene];
    if (type === "flow") {
      noiseSweep({
        from: 380,
        to: 2600,
        duration: 0.45,
        volume: 0.038,
        when: now,
      });
      return;
    }
    if (type === "confirm") {
      [2, 2.5, 3].forEach((ratio, index) =>
        note({
          frequency: root * ratio,
          when: now + index * 0.06,
          duration: 0.3,
          volume: 0.035,
          pan: index - 1,
        }),
      );
      return;
    }
    note({
      frequency: options.frequency || root * 3.2,
      when: now,
      duration: options.duration || 0.09,
      volume: options.volume || 0.035,
      type: "sine",
    });
  };

  window.siteAudio = {
    start,
    setScene,
    cue,
    get active() {
      return active;
    },
  };

  const unlock = (event) => {
    if (event.target?.closest?.(".sound-toggle")) return;
    start().catch(() => {});
  };
  addEventListener("pointerdown", unlock, { once: true, capture: true });
  addEventListener("touchstart", unlock, {
    once: true,
    capture: true,
    passive: true,
  });
  addEventListener("keydown", unlock, { once: true, capture: true });
  addEventListener("wheel", unlock, {
    once: true,
    capture: true,
    passive: true,
  });

  button.addEventListener("click", async () => {
    if (!armed) {
      await start();
      return;
    }
    if (context.state !== "running") await start();
    active = !active;
    nextBeat = context.currentTime + 0.08;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(
      Math.max(0.0001, master.gain.value),
      context.currentTime,
    );
    master.gain.linearRampToValueAtTime(
      active ? 0.72 : 0.0001,
      context.currentTime + 0.28,
    );
    button.classList.toggle("on", active);
    button.textContent = active ? "SOUND ON" : "SOUND OFF";
    button.setAttribute("aria-pressed", String(active));
    if (active) playSceneCue(currentScene, true);
  });

  document.querySelectorAll("a,button").forEach((control, index) => {
    if (control === button) return;
    control.addEventListener("click", () =>
      cue("interface", {
        frequency: tone * (3.2 + (index % 4) * 0.55),
      }),
    );
  });

  addEventListener(
    "scroll",
    () => {
      if (!context || !active) return;
      const progress =
        scrollY /
        Math.max(1, document.documentElement.scrollHeight - innerHeight);
      musicFilter.frequency.setTargetAtTime(
        680 + progress * 1250,
        context.currentTime,
        0.18,
      );
    },
    { passive: true },
  );

  addEventListener("pointerdown", (event) => {
    if (!event.target.closest("a,button,input"))
      document.body.classList.add("is-dragging");
  });
  ["pointerup", "pointercancel"].forEach((eventName) =>
    addEventListener(eventName, () =>
      document.body.classList.remove("is-dragging"),
    ),
  );
  addEventListener(
    "pointermove",
    (event) => {
      if (document.body.classList.contains("is-dragging"))
        event.preventDefault();
    },
    { passive: false },
  );

  addEventListener("pagehide", () => {
    if (scheduler) {
      window.clearInterval(scheduler);
      scheduler = undefined;
    }
  });
  addEventListener("pageshow", () => {
    if (context && !scheduler) {
      nextBeat = context.currentTime + 0.08;
      scheduler = window.setInterval(scheduleMusic, 60);
    }
  });
}
