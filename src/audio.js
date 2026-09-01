/* ============================================================
   audio.js  --  FITWAY 16/32-Bit Slice-of-Life Audio Synthesizer
   Sector 67, Mohali • Custom Chiptune & Gym Sound Design
   ============================================================
   Authentic synthesized slice-of-life audio:
   - Upbeat, chill, warm gym groove music (Persona / Stardew / Gym vibes)
   - Sector 67 Morning Breeze & Workout Pump tracks
   - Custom Gym Sound FX: Iron Clank, Rep Ding, Override Beep,
     Coach Whistle, Sneaker Squeak, Locker Shut, Workout Win
   ============================================================ */

const Audio8 = (() => {
  'use strict';
  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let enabled = true, started = false;

  /* ── Note Names to Frequency ───────────────────────────── */
  const STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(name) {
    if (!name || name === 'r') return 0;
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) return 0;
    let n = STEPS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const oct = parseInt(m[3], 10);
    return 440 * Math.pow(2, (n + (oct - 4) * 12 - 9) / 12);
  }

  function parse(str) {
    return str.split(/\s+/).filter(Boolean).filter(t => t !== '|').map(tok => {
      const [n, b] = tok.split(':');
      return { note: n, f: freq(n), beats: parseFloat(b || 1) };
    });
  }

  /* ── CUSTOM SLICE-OF-LIFE & GYM SOUNDTRACKS ─────────────── */
  const SONGS = {
    /* FITWAY MAIN GYM GROOVE — Upbeat, warm, chill slice-of-life chiptune */
    fitway_groove: {
      bpm: 124, unit: 0.5,
      lead: parse(`E5:2 G5:1 A5:1 B5:2 G5:2
                   A5:1 G5:1 E5:2 D5:2 E5:2
                   C5:2 E5:1 G5:1 A5:2 E5:2
                   G5:1 E5:1 D5:2 C5:4
                   E5:2 G5:1 A5:1 B5:2 D6:2
                   C6:1 B5:1 A5:2 G5:2 E5:2
                   F5:2 A5:1 C6:1 B5:2 G5:2
                   A5:1 G5:1 E5:2 D5:2 C5:4`),
      bass: parse(`C3:2 G3:2 C3:2 G3:2
                   A2:2 E3:2 A2:2 E3:2
                   F2:2 C3:2 F2:2 C3:2
                   G2:2 D3:2 G2:2 G3:2
                   C3:2 G3:2 C3:2 G3:2
                   A2:2 E3:2 A2:2 E3:2
                   F2:2 C3:2 G2:2 D3:2
                   C3:4 G2:4 C3:4 r:4`),
      duty: 0.5, leadVol: 0.20,
    },

    /* SECTOR 67 MORNING BREEZE — Warm acoustic-style chiptune */
    sector67_morning: {
      bpm: 104, unit: 0.5,
      lead: parse(`C5:2 E5:2 G5:4
                   A5:2 G5:2 E5:4
                   F5:2 A5:2 C6:4
                   B5:2 G5:2 E5:4
                   D5:2 F5:2 A5:4
                   G5:2 E5:2 C5:4
                   D5:2 E5:2 D5:2 C5:2
                   C5:8`),
      bass: parse(`C3:4 G3:4  A2:4 E3:4
                   F2:4 C3:4  G2:4 D3:4
                   D3:4 A2:4  C3:4 G3:4
                   F2:4 G2:4  C3:8`),
      duty: 0.25, leadVol: 0.18, soft: true
    },

    /* WORKOUT PUMP & CARDIO CHALLENGE — Energetic 16-bit synth beat */
    workout_pump: {
      bpm: 146, unit: 0.5,
      lead: parse(`E5:1 E5:1 G5:1 E5:1 A5:2 G5:2
                   D5:1 D5:1 F5:1 D5:1 G5:2 F5:2
                   C5:1 C5:1 E5:1 C5:1 F5:2 E5:2
                   D5:1 E5:1 F5:1 G5:1 A5:4
                   E5:1 G5:1 B5:1 D6:2 C6:1 B5:1 A5:1
                   G5:1 E5:1 G5:1 A5:2 G5:2 E5:2`),
      bass: parse(`E3:1 E3:1 E3:1 E3:1 E3:1 E3:1 E3:1 E3:1
                   D3:1 D3:1 D3:1 D3:1 D3:1 D3:1 D3:1 D3:1
                   C3:1 C3:1 C3:1 C3:1 C3:1 C3:1 C3:1 C3:1
                   B2:1 B2:1 B2:1 B2:1 E3:2 E3:2
                   E3:1 E3:1 E3:1 E3:1 A2:1 A2:1 A2:1 A2:1
                   G2:1 G2:1 G2:1 G2:1 E2:2 E2:2`),
      duty: 0.5, leadVol: 0.22,
    },

    /* FLOOR 2: WEIGHTS FLOOR & SUKH'S AUTHORITY */
    weights_floor: {
      bpm: 138, unit: 0.5,
      lead: parse(`A4:2 C5:1 E5:1 A5:2 G5:2
                   F5:2 A5:1 C6:1 B5:4
                   G5:2 B5:1 D6:1 C6:2 B5:2
                   A5:2 E5:1 C5:1 B4:2 A4:2`),
      bass: parse(`A2:2 E3:2 A2:2 E3:2
                   F2:2 C3:2 F2:2 C3:2
                   G2:2 D3:2 G2:2 D3:2
                   A2:2 E3:2 E2:2 E3:2`),
      duty: 0.25, leadVol: 0.20,
    },

    /* SITCOM CREDITS — Nostalgic slice-of-life ending ("Kal Phir Aa Jaana") */
    fitway_credits: {
      bpm: 86, unit: 0.5,
      lead: parse(`C5:2 E5:2 G5:4  F5:2 E5:2 C5:4
                   D5:2 F5:2 A5:4  G5:4 E5:4
                   C5:2 E5:2 G5:4  A5:2 G5:2 E5:4
                   F5:2 D5:2 C5:8`),
      bass: parse(`C3:4 G3:4  F2:4 C3:4
                   D3:4 A3:4  G2:4 G3:4
                   C3:4 G3:4  A2:4 E3:4
                   F2:4 G2:4  C3:8`),
      duty: 0.5, leadVol: 0.18, soft: true
    },

    /* Retro Arcade Overworld for Cartridge Hub */
    overworld: {
      bpm: 124, unit: 0.5,
      lead: parse(`G4:1 C5:1 E5:1 G5:1 E5:1 C5:1 D5:2
                   E5:1 F5:1 E5:1 D5:1 C5:2 G4:2
                   A4:1 C5:1 F5:1 A5:1 F5:1 C5:1 E5:2
                   D5:1 E5:1 D5:1 C5:1 G4:2 r:2`),
      bass: parse(`C3:2 G3:2 C3:2 G3:2
                   C3:2 G3:2 C3:2 G3:2
                   F2:2 C3:2 F2:2 C3:2
                   G2:2 D3:2 G2:2 G3:2`),
      duty: 0.5, leadVol: 0.20,
    },

    /* Cyber Tank 1989 (Battle City style) */
    tank: {
      bpm: 140, unit: 0.5,
      lead: parse(`C4:1 E4:1 G4:1 C5:1 B4:1 G4:1 E4:1 D4:1
                   C4:1 E4:1 G4:1 C5:2 D5:1 C5:2
                   A4:1 C5:1 E5:1 A5:1 G5:1 E5:1 C5:1 B4:1
                   A4:1 C5:1 E5:1 A5:2 B5:1 A5:2
                   F4:1 A4:1 C5:1 F5:2 E5:1 D5:2
                   G4:1 B4:1 D5:1 G5:2 F5:1 E5:2
                   C5:1 G4:1 E4:1 C4:2 r:2`),
      bass: parse(`C3:1 C3:1 G2:1 G2:1 C3:1 C3:1 G2:1 G2:1
                   C3:1 C3:1 G2:1 G2:1 C3:2 G2:2
                   A2:1 A2:1 E2:1 E2:1 A2:1 A2:1 E2:1 E2:1
                   A2:1 A2:1 E2:1 E2:1 A2:2 E2:2
                   F2:1 F2:1 C2:1 C2:1 F2:2 C2:2
                   G2:1 G2:1 D2:1 D2:1 G2:2 D2:2
                   C3:1 G2:1 E2:1 C2:2 r:2`),
      duty: 0.25, leadVol: 0.20,
    },

    /* Star Guardian 8-Bit */
    space: {
      bpm: 145, unit: 0.5,
      lead: parse(`E5:1 E5:1 G5:1 E5:1 A5:2 G5:2
                   D5:1 D5:1 F5:1 D5:1 G5:2 F5:2
                   C5:1 C5:1 E5:1 C5:1 F5:2 E5:2
                   B4:1 B4:1 D5:1 B4:1 E5:4
                   E5:1 G5:1 B5:1 D6:2 C6:1 B5:1 A5:1
                   G5:1 E5:1 G5:1 A5:2 G5:2 E5:2`),
      bass: parse(`E3:1 E3:1 E3:1 E3:1 E3:1 E3:1 E3:1 E3:1
                   D3:1 D3:1 D3:1 D3:1 D3:1 D3:1 D3:1 D3:1
                   C3:1 C3:1 C3:1 C3:1 C3:1 C3:1 C3:1 C3:1
                   B2:1 B2:1 B2:1 B2:1 E3:2 E3:2
                   E3:1 E3:1 E3:1 E3:1 A2:1 A2:1 A2:1 A2:1
                   G2:1 G2:1 G2:1 G2:1 E2:2 E2:2`),
      duty: 0.25, leadVol: 0.21,
    }
  };

  /* ══ UNLOCKING AUDIO (iOS & Desktop safe) ═════════════════ */
  let silentUrl = null;
  function silentWavUrl() {
    if (silentUrl) return silentUrl;
    const rate = 8000, n = rate / 2;
    const buf = new ArrayBuffer(44 + n);
    const v = new DataView(buf);
    const tag = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    tag(0, 'RIFF');  v.setUint32(4, 36 + n, true);
    tag(8, 'WAVE');  tag(12, 'fmt ');
    v.setUint32(16, 16, true);   v.setUint16(20, 1, true);
    v.setUint16(22, 1, true);    v.setUint32(24, rate, true);
    v.setUint32(28, rate, true); v.setUint16(32, 1, true);
    v.setUint16(34, 8, true);
    tag(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
    let bin = '';
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    silentUrl = 'data:audio/wav;base64,' + btoa(bin);
    return silentUrl;
  }

  let silentEl = null;
  function playSilent() {
    if (!silentEl) {
      try {
        silentEl = new Audio();
        silentEl.loop = true;
        silentEl.preload = 'auto';
        silentEl.volume = 0.001;
        silentEl.setAttribute('playsinline', '');
        silentEl.setAttribute('webkit-playsinline', '');
        silentEl.src = silentWavUrl();
        silentEl.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
        (document.body || document.documentElement).appendChild(silentEl);
      } catch (e) { return; }
    }
    try {
      const pr = silentEl.play();
      if (pr && pr.catch) pr.catch(() => {});
    } catch (e) {}
  }

  function init() {
    if (ctx) { if (ctx.state !== 'running') kick(); return; }
    if (!enabled) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { enabled = false; return; }
    try { ctx = new AC(); } catch (e) { enabled = false; return; }
    master = ctx.createGain();    master.gain.value = 0.9; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 1; musicGain.connect(master);
    sfxGain = ctx.createGain();   sfxGain.gain.value = 1;   sfxGain.connect(master);
    started = true;
    kick();
  }

  function kick() {
    if (!ctx) return;
    try {
      const b = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = b;
      src.connect(ctx.destination);
      src.start(0);
    } catch (e) {}
    playSilent();
    resume();
  }

  const GESTURES = ['touchstart', 'touchend', 'pointerdown', 'pointerup', 'mousedown', 'click', 'keydown'];
  let armed = false;

  function attempt() {
    if (!enabled) return;
    init();
    if (ctx && ctx.state === 'running') disarm();
  }

  function disarm() {
    if (!armed) return;
    armed = false;
    for (const ev of GESTURES) {
      document.removeEventListener(ev, attempt, true);
      window.removeEventListener(ev, attempt, true);
    }
  }

  function arm() {
    if (armed) return;
    armed = true;
    for (const ev of GESTURES) {
      document.addEventListener(ev, attempt, { capture: true, passive: true });
      window.addEventListener(ev, attempt, { capture: true, passive: true });
    }
  }
  arm();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    resume();
    playSilent();
    if (!ctx || ctx.state !== 'running') arm();
  });
  window.addEventListener('pageshow', () => { resume(); playSilent(); });

  function status() {
    if (!enabled) return 'off';
    if (!ctx) return 'blocked';
    return ctx.state === 'running' ? 'running' : 'blocked';
  }

  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  /* ── Tone & Noise Synthesis Engines ────────────────────── */
  function tone(f, t, dur, vol, dest, type, glideTo) {
    if (!ctx || !f) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(10, glideTo), t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(dest || sfxGain);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function noise(t, dur, vol, dest, highpass = 1200) {
    if (!ctx) return;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = vol;
    const flt = ctx.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.value = highpass;
    src.connect(flt); flt.connect(g); g.connect(dest || sfxGain);
    src.start(t);
  }

  /* ── CUSTOM SLICE-OF-LIFE & GYM SOUND EFFECTS ───────────── */
  const SFX = {
    /* Realistic Gym Sound Effects */
    iron_clank: (t) => {
      tone(freq('A5'), t, 0.06, 0.18, null, 'square', freq('E4'));
      noise(t, 0.08, 0.22, null, 1800);
      tone(freq('C4'), t + 0.03, 0.12, 0.15, null, 'triangle', freq('A2'));
    },
    rep_ding: (t) => {
      tone(freq('E6'), t, 0.05, 0.16, null, 'sine');
      tone(freq('B6'), t + 0.04, 0.22, 0.18, null, 'triangle');
    },
    override_beep: (t) => {
      tone(freq('C6'), t, 0.04, 0.14, null, 'sawtooth', freq('G4'));
      tone(freq('F6'), t + 0.05, 0.08, 0.14, null, 'square');
      tone(freq('C7'), t + 0.10, 0.16, 0.16, null, 'sine');
    },
    whistle: (t) => {
      tone(freq('E6'), t, 0.08, 0.15, null, 'triangle');
      tone(freq('G6'), t + 0.07, 0.12, 0.16, null, 'triangle');
    },
    sneaker_squeak: (t) => {
      tone(freq('G6'), t, 0.06, 0.10, null, 'sawtooth', freq('E6'));
      noise(t + 0.02, 0.04, 0.08, null, 2500);
    },
    towel_snap: (t) => {
      noise(t, 0.05, 0.20, null, 900);
    },
    locker_shut: (t) => {
      noise(t, 0.12, 0.25, null, 400);
      tone(freq('D2'), t, 0.18, 0.20, null, 'triangle', freq('A1'));
    },
    challenge_win: (t) => {
      ['C5', 'E5', 'G5', 'B5', 'C6'].forEach((n, i) => {
        tone(freq(n), t + i * 0.08, 0.16, 0.15, null, 'triangle');
      });
      tone(freq('G6'), t + 0.42, 0.45, 0.18, null, 'sine');
    },

    /* UI & Interaction FX */
    dialogue_blip: (t) => tone(freq('G5'), t, 0.025, 0.045, null, 'triangle'),
    blip:          (t) => tone(freq('G5'), t, 0.03, 0.05, null, 'triangle'),
    menu:          (t) => { tone(freq('C5'), t, 0.05, 0.10); tone(freq('G5'), t + 0.04, 0.08, 0.10); },
    select:        (t) => tone(freq('C6'), t, 0.04, 0.08, null, 'square'),
    start:         (t) => {
      ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => tone(freq(n), t + i * 0.06, 0.08, 0.12));
    },
    cartridge:     (t) => {
      noise(t, 0.06, 0.22, null, 400);
      tone(freq('C5'), t + 0.08, 0.07, 0.12, null, 'triangle');
      tone(freq('E5'), t + 0.14, 0.07, 0.12, null, 'triangle');
      tone(freq('G5'), t + 0.20, 0.18, 0.15, null, 'square');
    },
    stairs:        (t) => { tone(freq('G4'), t, 0.10, 0.10); tone(freq('C4'), t + 0.09, 0.16, 0.10); },
    stage_clear:   (t) => {
      ['C5', 'E5', 'G5', 'C6', 'G5', 'C6'].forEach((n, i) => tone(freq(n), t + i * 0.09, 0.14, 0.15));
    },
    fanfare:       (t) => {
      ['C5', 'E5', 'G5', 'C6'].forEach((n, i) => tone(freq(n), t + i * 0.10, 0.18, 0.14));
      tone(freq('G5'), t + 0.4, 0.14, 0.13); tone(freq('C6'), t + 0.52, 0.6, 0.15);
    },
    powerup:       (t) => {
      ['G4', 'B4', 'D5', 'G5', 'B5', 'D6'].forEach((n, i) => tone(freq(n), t + i * 0.045, 0.07, 0.14, null, 'triangle'));
    },
    coin:          (t) => {
      tone(freq('E6'), t, 0.05, 0.16, null, 'sine');
      tone(freq('B6'), t + 0.04, 0.22, 0.18, null, 'triangle');
    },
    boom:          (t) => {
      noise(t, 0.28, 0.25, null, 300);
      tone(freq('G2'), t, 0.22, 0.16, null, 'square', freq('C1'));
    }
  };

  function sfx(name) {
    if (!enabled || !ctx) return;
    resume();
    const fn = SFX[name] || SFX.rep_ding;
    if (fn) fn(ctx.currentTime + 0.001);
  }

  /* ── Music Scheduler ───────────────────────────────────── */
  let current = null, timer = null;
  let leadIdx = 0, bassIdx = 0, leadTime = 0, bassTime = 0;

  function startMusic(name) {
    const track = SONGS[name] ? name : 'fitway_groove';
    if (name === 'none') { stopMusic(); current = 'none'; return; }
    if (current === track && timer) return;
    stopMusic();
    current = track;
    if (!enabled || !ctx) return;
    resume();
    const song = SONGS[track];
    const t0 = ctx.currentTime + 0.08;
    leadIdx = bassIdx = 0; leadTime = bassTime = t0;
    timer = setInterval(() => schedule(song), 30);
    schedule(song);
  }

  function schedule(song) {
    if (!ctx) return;
    const beat = 60 / song.bpm * song.unit;
    const horizon = ctx.currentTime + 0.35;
    let guard = 0;
    while (leadTime < horizon && guard++ < 64) {
      const n = song.lead[leadIdx % song.lead.length];
      const dur = n.beats * beat;
      if (n.f) {
        tone(n.f, leadTime, Math.max(0.05, dur * 0.86), song.leadVol, musicGain,
             song.duty === 0.25 ? 'sawtooth' : 'square');
        if (!song.soft) tone(n.f * 2, leadTime, Math.max(0.04, dur * 0.4), song.leadVol * 0.22, musicGain, 'triangle');
      }
      leadTime += dur; leadIdx++;
    }
    guard = 0;
    while (bassTime < horizon && guard++ < 64) {
      const n = song.bass[bassIdx % song.bass.length];
      const dur = n.beats * beat;
      if (n.f) tone(n.f, bassTime, Math.max(0.05, dur * 0.9), 0.19, musicGain, 'triangle');
      if (!song.soft && bassIdx % 2 === 0) noise(bassTime, 0.03, 0.018, musicGain);
      bassTime += dur; bassIdx++;
    }
  }

  function stopMusic() {
    if (timer) { clearInterval(timer); timer = null; }
    current = null;
  }

  function setEnabled(on) {
    enabled = on;
    if (!on) { stopMusic(); if (master) master.gain.value = 0; }
    else { if (master) master.gain.value = 0.9; }
  }

  return {
    init, sfx, setEnabled, status,
    music: startMusic,
    stop: stopMusic,
    get on() { return enabled; },
    get ready() { return started; },
    get playing() { return current; },
  };
})();
