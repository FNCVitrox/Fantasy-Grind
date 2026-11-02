// Sound und Musik (Punkt 20): alles wird mit der WebAudio-API erzeugt, es gibt keine Audiodateien.
// Der AudioContext startet erst nach der ersten Eingabe (Browser-Vorgabe). Geladen nach core.js.

const audioEngine = { context: null, master: null, sfx: null, music: null, musicTheme: "", musicTimer: 0, nextBar: 0, bar: 0, unlocked: false };

// Musik je Gebietstyp: Tonleiter (Halbtöne über dem Grundton), Grundton, Tempo und Klangfarbe.
const audioThemes = {
  zone: { root: 57, scale: [0, 2, 4, 7, 9], chords: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]], barSeconds: 4.2, wave: "triangle", melodyWave: "sine" },
  dungeon: { root: 50, scale: [0, 3, 5, 7, 10], chords: [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [0, 3, 7]], barSeconds: 5.2, wave: "sawtooth", melodyWave: "triangle" },
};

function audioSettings() {
  const settings = typeof normalizeSettings === "function" ? normalizeSettings(state?.settings) : {};
  return {
    muted: Boolean(settings.muted),
    sound: Math.max(0, Math.min(100, Number(settings.soundVolume ?? 35))) / 100,
    music: Math.max(0, Math.min(100, Number(settings.musicVolume ?? 20))) / 100,
  };
}

function audioSupported() {
  return typeof window !== "undefined" && Boolean(window.AudioContext || window.webkitAudioContext);
}

// Erste Nutzereingabe: Kontext anlegen und Musik starten.
function audioUnlock() {
  if (!audioSupported()) return;
  if (!audioEngine.context) {
    const Context = window.AudioContext || window.webkitAudioContext;
    try {
      audioEngine.context = new Context();
    } catch (error) {
      return;
    }
    const ctx = audioEngine.context;
    audioEngine.master = ctx.createGain();
    audioEngine.sfx = ctx.createGain();
    audioEngine.music = ctx.createGain();
    const compressor = ctx.createDynamicsCompressor();
    audioEngine.sfx.connect(audioEngine.master);
    audioEngine.music.connect(audioEngine.master);
    audioEngine.master.connect(compressor);
    compressor.connect(ctx.destination);
  }
  if (audioEngine.context.state === "suspended") audioEngine.context.resume().catch(() => {});
  audioEngine.unlocked = true;
  audioApplyVolumes();
  audioSyncMusic();
}

function audioApplyVolumes() {
  if (!audioEngine.context) return;
  const { muted, sound, music } = audioSettings();
  const now = audioEngine.context.currentTime;
  audioEngine.master.gain.setTargetAtTime(muted ? 0 : 1, now, 0.05);
  // Quadratische Kurve: kleine Reglerwerte bleiben wirklich leise.
  audioEngine.sfx.gain.setTargetAtTime(sound * sound * 0.9, now, 0.05);
  audioEngine.music.gain.setTargetAtTime(music * music * 0.55, now, 0.2);
  audioSyncMusic();
}

function midiToHz(note) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

// Ein Ton mit Hüllkurve. type: Wellenform, glide: Zielfrequenz am Ende.
function audioTone(output, { freq, start, duration, type = "sine", gain = 0.3, attack = 0.005, glide = 0, detune = 0 }) {
  const ctx = audioEngine.context;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, glide), start + duration);
  if (detune) osc.detune.setValueAtTime(detune, start);
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(env);
  env.connect(output);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

// Kurzes Rauschen (Treffer), gefiltert.
function audioNoise(output, { start, duration, gain = 0.3, filter = 1800, q = 0.8 }) {
  const ctx = audioEngine.context;
  const length = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / length);
  const source = ctx.createBufferSource();
  const band = ctx.createBiquadFilter();
  const env = ctx.createGain();
  source.buffer = buffer;
  band.type = "bandpass";
  band.frequency.value = filter;
  band.Q.value = q;
  env.gain.setValueAtTime(gain, start);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(band);
  band.connect(env);
  env.connect(output);
  source.start(start);
}

// Soundeffekte: hit, crit, heroHurt, loot (mit Seltenheit), levelUp, victory, defeat, click.
function audioPlay(name, detail = "") {
  if (!audioEngine.unlocked || !audioEngine.context) return;
  const { muted, sound } = audioSettings();
  if (muted || sound <= 0) return;
  const ctx = audioEngine.context;
  const out = audioEngine.sfx;
  const now = ctx.currentTime + 0.01;
  switch (name) {
    case "hit":
      audioNoise(out, { start: now, duration: 0.12, gain: 0.35, filter: 1400 });
      audioTone(out, { freq: 180, glide: 70, start: now, duration: 0.14, type: "triangle", gain: 0.35 });
      break;
    case "crit":
      audioNoise(out, { start: now, duration: 0.2, gain: 0.45, filter: 2600, q: 1.2 });
      audioTone(out, { freq: 900, glide: 300, start: now, duration: 0.18, type: "square", gain: 0.12 });
      audioTone(out, { freq: 120, glide: 45, start: now, duration: 0.3, type: "sine", gain: 0.5 });
      break;
    case "heroHurt":
      audioNoise(out, { start: now, duration: 0.14, gain: 0.3, filter: 700 });
      audioTone(out, { freq: 140, glide: 60, start: now, duration: 0.18, type: "sawtooth", gain: 0.14 });
      break;
    case "loot": {
      const rank = { common: 0, rare: 1, epic: 2, legendary: 3 }[detail] || 0;
      const notes = [0, 4, 7, 12, 16].slice(0, 2 + rank);
      notes.forEach((step, index) => audioTone(out, { freq: midiToHz(76 + step), start: now + index * 0.07, duration: 0.35 + rank * 0.1, type: "sine", gain: 0.16 + rank * 0.03 }));
      if (rank >= 2) audioTone(out, { freq: midiToHz(88), start: now + notes.length * 0.07, duration: 0.9, type: "triangle", gain: 0.1, attack: 0.04 });
      break;
    }
    case "levelUp":
      [0, 4, 7, 12, 16, 19].forEach((step, index) => audioTone(out, { freq: midiToHz(67 + step), start: now + index * 0.08, duration: 0.5, type: "triangle", gain: 0.2 }));
      audioTone(out, { freq: midiToHz(55), start: now, duration: 1.2, type: "sine", gain: 0.25, attack: 0.05 });
      break;
    case "victory":
      [0, 7, 12].forEach((step, index) => audioTone(out, { freq: midiToHz(72 + step), start: now + index * 0.09, duration: 0.3, type: "triangle", gain: 0.14 }));
      break;
    case "defeat":
      [0, -3, -7].forEach((step, index) => audioTone(out, { freq: midiToHz(60 + step), start: now + index * 0.16, duration: 0.5, type: "sine", gain: 0.18 }));
      break;
    case "click":
      audioTone(out, { freq: 1400, glide: 900, start: now, duration: 0.04, type: "sine", gain: 0.06 });
      break;
    default:
      break;
  }
}

function audioCurrentTheme() {
  if (typeof zones === "undefined" || typeof ui === "undefined") return "zone";
  return zones[ui.selectedZone]?.type === "dungeon" ? "dungeon" : "zone";
}

// Musik an, aus oder auf ein anderes Thema umschalten (wird bei jedem render() aufgerufen, ist billig).
function audioSyncMusic() {
  if (!audioEngine.unlocked || !audioEngine.context) return;
  const { muted, music } = audioSettings();
  const hidden = typeof document !== "undefined" && document.visibilityState === "hidden";
  const wanted = !muted && music > 0 && !hidden ? audioCurrentTheme() : "";
  if (wanted === audioEngine.musicTheme) return;
  audioEngine.musicTheme = wanted;
  if (audioEngine.musicTimer) {
    window.clearInterval(audioEngine.musicTimer);
    audioEngine.musicTimer = 0;
  }
  if (!wanted) return;
  audioEngine.nextBar = audioEngine.context.currentTime + 0.2;
  audioEngine.bar = 0;
  audioScheduleMusic();
  audioEngine.musicTimer = window.setInterval(audioScheduleMusic, 500);
}

// Plant die nächsten Takte voraus: weiche Akkordfläche, tiefer Grundton und ein paar Melodietöne.
function audioScheduleMusic() {
  const ctx = audioEngine.context;
  const theme = audioThemes[audioEngine.musicTheme];
  if (!ctx || !theme) return;
  const out = audioEngine.music;
  while (audioEngine.nextBar < ctx.currentTime + 2) {
    const start = audioEngine.nextBar;
    const chord = theme.chords[audioEngine.bar % theme.chords.length];
    const length = theme.barSeconds;
    chord.forEach((step, index) => {
      audioTone(out, { freq: midiToHz(theme.root + step), start, duration: length * 1.1, type: theme.wave, gain: 0.05, attack: length * 0.35, detune: index * 4 - 4 });
    });
    audioTone(out, { freq: midiToHz(theme.root - 12 + chord[0]), start, duration: length, type: "sine", gain: 0.08, attack: 0.6 });
    const notes = 2 + (audioEngine.bar % 3);
    for (let index = 0; index < notes; index += 1) {
      const degree = theme.scale[Math.floor(Math.random() * theme.scale.length)];
      const when = start + (length / notes) * index + Math.random() * 0.25;
      audioTone(out, { freq: midiToHz(theme.root + 12 + degree), start: when, duration: 1.4, type: theme.melodyWave, gain: 0.045, attack: 0.03 });
    }
    audioEngine.nextBar += length;
    audioEngine.bar += 1;
  }
}

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("pointerdown", audioUnlock, { passive: true });
  window.addEventListener("keydown", audioUnlock);
}
if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
  document.addEventListener("visibilitychange", () => audioSyncMusic());
}
