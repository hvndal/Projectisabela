/* ============================================================
   audio.js  --  a very small chiptune box
   ------------------------------------------------------------
   No audio files. Everything is synthesised: pulse lead,
   triangle bass, noise percussion. The game runs perfectly
   with sound disabled -- every call here is a safe no-op
   until the player's first interaction unlocks WebAudio.
   ============================================================ */

const Audio8 = (() => {

  let ctx = null, master = null, musicGain = null, sfxGain = null;
  let enabled = true, started = false;

  /* ── note names → frequency ───────────────────────────── */
  const STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function freq(name) {
    if (!name || name === 'r') return 0;
    const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
    if (!m) return 0;
    let n = STEPS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const oct = parseInt(m[3], 10);
    return 440 * Math.pow(2, (n + (oct - 4) * 12 - 9) / 12);
  }

  /* "C4:2 E4:1 r:1" → [{f, beats}] */
  function parse(str) {
    return str.split(/\s+/).filter(Boolean).filter(t => t !== '|').map(tok => {
      const [n, b] = tok.split(':');
      return { note: n, f: freq(n), beats: parseFloat(b || 1) };
    });
  }

  /* ── the songs ────────────────────────────────────────── */
  const SONGS = {
    overworld: {
      bpm: 132, unit: 0.5,
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
    woods: {
      bpm: 112, unit: 0.5,
      lead: parse(`A4:2 C5:1 E5:1 D5:2 C5:2
                   B4:2 D5:1 F5:1 E5:4
                   A4:2 E5:1 C5:1 B4:2 A4:2
                   G4:2 B4:1 D5:1 E5:4`),
      bass: parse(`A2:2 E3:2 A2:2 E3:2
                   G2:2 D3:2 G2:2 D3:2
                   F2:2 C3:2 F2:2 C3:2
                   E2:2 B2:2 E2:2 E3:2`),
      duty: 0.25, leadVol: 0.17,
    },
    isabela: {
      bpm: 78, unit: 0.5,
      lead: parse(`F4:2 A4:2 C5:4
                   Bb4:2 A4:2 F4:4
                   G4:2 Bb4:2 D5:4
                   C5:4 A4:2 F4:2
                   F4:2 A4:2 C5:4
                   D5:2 C5:2 A4:4
                   Bb4:2 G4:2 A4:4
                   F4:6 r:2`),
      bass: parse(`F2:4 C3:4  Bb2:4 F3:4
                   G2:4 D3:4  C3:4 C3:4
                   F2:4 C3:4  D3:4 A2:4
                   Bb2:4 F3:4 F2:8`),
      duty: 0.5, leadVol: 0.16, soft: true,
    },
    boss: {
      bpm: 150, unit: 0.5,
      lead: parse(`C4:1 C4:1 Eb4:1 C4:1 F4:2 E4:2
                   C4:1 C4:1 Eb4:1 C4:1 G4:2 F4:2
                   Ab4:1 G4:1 F4:1 Eb4:1 D4:2 C4:2
                   C4:1 D4:1 Eb4:1 F4:1 G4:4`),
      bass: parse(`C2:1 C2:1 C2:1 C2:1 C2:1 C2:1 C2:1 C2:1
                   C2:1 C2:1 C2:1 C2:1 G2:1 G2:1 G2:1 G2:1
                   Ab2:1 Ab2:1 Ab2:1 Ab2:1 F2:1 F2:1 F2:1 F2:1
                   G2:1 G2:1 G2:1 G2:1 G2:1 G2:1 B2:1 B2:1`),
      duty: 0.25, leadVol: 0.18,
    },
    ending: {
      bpm: 84, unit: 0.5,
      lead: parse(`C5:2 E5:2 G5:4  F5:2 E5:2 C5:4
                   D5:2 F5:2 A5:4  G5:4 E5:4
                   C5:2 E5:2 G5:4  A5:2 G5:2 E5:4
                   F5:2 D5:2 C5:8`),
      bass: parse(`C3:4 G3:4 F2:4 C3:4
                   D3:4 A3:4 G2:4 G3:4
                   C3:4 G3:4 A2:4 E3:4
                   F2:4 G2:4 C3:8`),
      duty: 0.5, leadVol: 0.17, soft: true,
    },
  };

  /* ══ UNLOCKING AUDIO ══════════════════════════════════════
     Phones make this harder than it looks:

     1. Every browser refuses to start audio outside a user gesture.
     2. iOS creates the context "suspended" and only really starts it
        once something is scheduled inside that gesture.
     3. iOS routes bare WebAudio through the RINGER channel, so a phone
        with the mute switch flipped plays a completely silent game.
        Having an <audio> element actually playing moves the page into
        the media playback category, which follows the volume buttons.
     4. The gesture that unlocks can be swallowed (a scroll, a rejected
        play() promise), so one attempt is not enough.

     So: retry on every gesture until the context reports "running",
     and hold a real half-second of looping silence, not a 0.4ms blip.
     ════════════════════════════════════════════════════════ */

  /* A genuine silent WAV, built at runtime. iOS ignores clips that are
     too short to establish a session, so this is half a second. */
  let silentUrl = null;
  function silentWavUrl() {
    if (silentUrl) return silentUrl;
    const rate = 8000, n = rate / 2;                 // 0.5s, 8-bit mono
    const buf = new ArrayBuffer(44 + n);
    const v = new DataView(buf);
    const tag = (o, str) => { for (let i = 0; i < str.length; i++) v.setUint8(o + i, str.charCodeAt(i)); };
    tag(0, 'RIFF');  v.setUint32(4, 36 + n, true);
    tag(8, 'WAVE');  tag(12, 'fmt ');
    v.setUint32(16, 16, true);   v.setUint16(20, 1, true);   // PCM
    v.setUint16(22, 1, true);    v.setUint32(24, rate, true);
    v.setUint32(28, rate, true); v.setUint16(32, 1, true);
    v.setUint16(34, 8, true);
    tag(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);      // 128 = silence
    /* a data: URI rather than a blob: URL -- iOS is fussy about
       blob-backed media elements, and this is only a few KB */
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
        /* several iOS versions will not play a detached media element */
        silentEl.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
        (document.body || document.documentElement).appendChild(silentEl);
      } catch (e) { return; }
    }
    try {
      const pr = silentEl.play();
      if (pr && pr.catch) pr.catch(() => {});
    } catch (e) {}
  }

  /* ── boot (must follow a user gesture) ────────────────── */
  function init() {
    if (ctx) { if (ctx.state !== 'running') kick(); return; }
    if (!enabled) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) { enabled = false; return; }
    try { ctx = new AC(); } catch (e) { enabled = false; return; }
    master = ctx.createGain();  master.gain.value = 0.9;  master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 1; musicGain.connect(master);
    sfxGain = ctx.createGain();   sfxGain.gain.value = 1;   sfxGain.connect(master);
    started = true;
    kick();
  }

  /* Schedule something immediately -- iOS needs a node started inside
     the gesture before it will really leave the suspended state. */
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

  /* Keep trying on every gesture until the context is genuinely running. */
  const GESTURES = ['touchstart', 'touchend', 'pointerdown', 'pointerup',
                    'mousedown', 'click', 'keydown'];
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

  /* Coming back from a locked screen, an incoming call, or another tab
     leaves the context suspended and the silent element paused. */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) return;
    resume();
    playSilent();
    if (!ctx || ctx.state !== 'running') arm();
  });
  window.addEventListener('pageshow', () => { resume(); playSilent(); });

  /* What the UI should tell the player. */
  function status() {
    if (!enabled) return 'off';
    if (!ctx) return 'blocked';
    return ctx.state === 'running' ? 'running' : 'blocked';
  }

  function resume() { if (ctx && ctx.state === 'suspended') ctx.resume(); }

  /* ── one pulse-wave note ──────────────────────────────── */
  function tone(f, t, dur, vol, dest, type, glideTo) {
    if (!ctx || !f) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(f, t);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(dest || sfxGain);
    osc.start(t); osc.stop(t + dur + 0.02);
  }

  function noise(t, dur, vol, dest) {
    if (!ctx) return;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const g = ctx.createGain(); g.gain.value = vol;
    const flt = ctx.createBiquadFilter(); flt.type = 'highpass'; flt.frequency.value = 1200;
    src.connect(flt); flt.connect(g); g.connect(dest || sfxGain);
    src.start(t);
  }

  /* ── sound effects ────────────────────────────────────── */
  const SFX = {
    blip:    (t) => tone(freq('E6'), t, 0.035, 0.05),
    blip2:   (t) => tone(freq('C6'), t, 0.035, 0.045),
    menu:    (t) => { tone(freq('C5'), t, 0.06, 0.11); tone(freq('G5'), t + 0.05, 0.09, 0.10); },
    step:    (t) => noise(t, 0.035, 0.035),
    heart:   (t) => { ['E5','G5','C6'].forEach((n,i) => tone(freq(n), t + i*0.06, 0.14, 0.13)); },
    star:    (t) => { ['G5','B5','D6','G6'].forEach((n,i) => tone(freq(n), t + i*0.05, 0.13, 0.11)); },
    flower:  (t) => { ['C5','E5','G5','B5','E6'].forEach((n,i) => tone(freq(n), t + i*0.05, 0.16, 0.11, null, 'triangle')); },
    secret:  (t) => { ['C5','D5','E5','G5','A5','C6'].forEach((n,i) => tone(freq(n), t + i*0.07, 0.24, 0.11)); },
    chest:   (t) => { noise(t, 0.12, 0.09); ['C5','F5','A5'].forEach((n,i)=>tone(freq(n), t+0.1+i*0.07, 0.2, 0.12)); },
    unlock:  (t) => { ['F4','A4','C5','F5','A5','C6'].forEach((n,i)=>tone(freq(n), t+i*0.06, 0.25, 0.12)); },
    sparkle: (t) => { for (let i=0;i<5;i++) tone(1200 + i*400, t + i*0.035, 0.07, 0.06, null, 'triangle'); },
    stairs:  (t) => { tone(freq('G4'), t, 0.10, 0.10); tone(freq('C4'), t+0.09, 0.16, 0.10); },
    transition: (t) => tone(freq('A5'), t, 0.22, 0.07, null, 'square', freq('A3')),
    bump:    (t) => tone(110, t, 0.05, 0.05, null, 'square'),
    boss:    (t) => { noise(t, 0.4, 0.14); tone(freq('C2'), t, 0.6, 0.16, null, 'square', freq('C1')); },
    hit:     (t) => { noise(t, 0.10, 0.11); tone(freq('E5'), t, 0.14, 0.10, null, 'triangle', freq('B5')); },
    reveal:  (t) => { ['C5','E5','G5','C6','E6','G6','C7'].forEach((n,i)=>tone(freq(n), t+i*0.09, 0.7, 0.10, null, 'triangle')); },
    fanfare: (t) => { ['C5','E5','G5','C6'].forEach((n,i)=>tone(freq(n), t+i*0.10, 0.18, 0.14));
                      tone(freq('G5'), t+0.4, 0.14, 0.13); tone(freq('C6'), t+0.52, 0.6, 0.15); },
  };

  function sfx(name) {
    if (!enabled || !ctx) return;
    resume();
    const fn = SFX[name];
    if (fn) fn(ctx.currentTime + 0.001);
  }

  /* ── music scheduler ──────────────────────────────────── */
  let current = null, timer = null;
  let leadIdx = 0, bassIdx = 0, leadTime = 0, bassTime = 0;

  function startMusic(name) {
    if (name === 'none' || !SONGS[name]) { stopMusic(); current = name; return; }
    if (current === name && timer) return;
    stopMusic();
    current = name;
    if (!enabled || !ctx) return;
    resume();
    const song = SONGS[name];
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
