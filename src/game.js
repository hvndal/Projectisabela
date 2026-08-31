/* ============================================================
   game.js  --  the engine
   ------------------------------------------------------------
   State / input / collision / rendering / transitions / boss /
   ending. Content lives in config.js and maps.js; this file
   only knows how to run it.
   ============================================================ */

(() => {

const cv = document.getElementById('screen');
const g  = cv.getContext('2d', { alpha: false });
g.imageSmoothingEnabled = false;

const W = 256, H = 224;

/* ══ STATE ═══════════════════════════════════════════════ */

function freshState() {
  return {
    area: CONFIG.startArea,
    px: CONFIG.startTile.x * TILE,
    py: CONFIG.startTile.y * TILE,
    dir: 'down',
    moving: false,
    anim: 0,
    hearts: 0, stars: 0, flowers: 0,
    collected: {},          // item id -> true
    secrets: {},            // secret id -> true
    flags: {},              // story flags
    talked: {},             // npc id -> true
    counters: {},           // arbitrary counters (shy flower, ...)
    opened: {},             // one-shot objects
    gone: {},               // NPCs that have vanished
    openGates: {},
    items: {},              // inventory: sock -> count
    quest: QUESTS.start,
    started: false,
  };
}

let state = freshState();
let mode = 'title';                 // title | play | boss | ending
let frame = 0;

/* effects */
let shake = 0, flash = 0, toasts = [], particles = [], titleCard = 0, titleCardText = '';
let trans = null;                    // pixel dissolve
let boss = null;
let ending = null;
let bumpCooldown = 0;

/* ══ INPUT ═══════════════════════════════════════════════ */

const keys = {};
const held = { up: false, down: false, left: false, right: false, a: false, b: false };
let aEdge = false;                   // A was pressed this frame

const KEYMAP = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
  Space: 'a', Enter: 'a', KeyZ: 'a', KeyJ: 'a', NumpadEnter: 'a',
  ShiftLeft: 'b', ShiftRight: 'b', KeyX: 'b', KeyK: 'b',
};

addEventListener('keydown', (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  if (!keys[e.code]) { if (k === 'a' || (k === 'b' && Dialogue.active)) aEdge = true; }
  keys[e.code] = true;
  held[k] = true;
  Audio8.init();
}, { passive: false });

addEventListener('keyup', (e) => {
  const k = KEYMAP[e.code];
  if (!k) return;
  e.preventDefault();
  keys[e.code] = false;
  /* only release the virtual key if no other bound key still holds it */
  held[k] = Object.keys(KEYMAP).some(code => KEYMAP[code] === k && keys[code]);
}, { passive: false });

addEventListener('blur', () => {
  for (const c in keys) keys[c] = false;
  for (const d in held) held[d] = false;
});

/* ══ TOUCH CONTROLS ══════════════════════════════════════════
   The D-pad is one continuous touch surface rather than four
   separate buttons: direction comes from where your thumb is
   relative to the centre, so you get all eight directions and
   sliding never drops the input. Pointer capture keeps tracking
   even when the thumb wanders off the pad.
   ═══════════════════════════════════════════════════════════ */
function bindTouch() {
  const coarse = matchMedia('(hover: none), (pointer: coarse)').matches || 'ontouchstart' in window;
  if (coarse) document.body.classList.add('touch-on');
  /* if we guessed wrong, the first real touch settles it */
  addEventListener('touchstart', () => document.body.classList.add('touch-on'),
                   { once: true, passive: true });

  const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  window.__buzz = buzz;

  /* ---- D-pad ---- */
  const pad  = document.querySelector('.dpad');
  const knob = document.querySelector('.dpad-center');
  const arrow = {};
  document.querySelectorAll('.dbtn').forEach(b => { arrow[b.dataset.dir] = b; });

  let padId = null, lastSig = '';

  function setDirs(u, d, l, r) {
    held.up = u; held.down = d; held.left = l; held.right = r;
    arrow.up.classList.toggle('held', u);
    arrow.down.classList.toggle('held', d);
    arrow.left.classList.toggle('held', l);
    arrow.right.classList.toggle('held', r);
    const sig = [u, d, l, r].join('');
    if (sig !== lastSig) {
      if (u || d || l || r) buzz(7);
      lastSig = sig;
    }
  }

  function knobTo(x, y) {
    knob.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
  }

  function track(e) {
    const r = pad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.hypot(dx, dy);

    if (dist < r.width * 0.13) { setDirs(false, false, false, false); knobTo(0, 0); return; }

    /* cos(67.5 deg): splits the circle into eight even wedges */
    const k = 0.383 * dist;
    setDirs(dy < -k, dy > k, dx < -k, dx > k);

    const reach = r.width * 0.17;
    const pull  = Math.min(1, dist / (r.width * 0.42));
    knobTo((dx / dist) * reach * pull, (dy / dist) * reach * pull);
  }

  pad.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    Audio8.init();
    padId = e.pointerId;
    try { pad.setPointerCapture(e.pointerId); } catch (err) {}
    track(e);
  });
  pad.addEventListener('pointermove', (e) => {
    if (e.pointerId !== padId) return;
    e.preventDefault();
    track(e);
  });
  const padRelease = (e) => {
    if (e.pointerId !== padId) return;
    padId = null;
    setDirs(false, false, false, false);
    knobTo(0, 0);
  };
  pad.addEventListener('pointerup', padRelease);
  pad.addEventListener('pointercancel', padRelease);

  /* ---- A (talk / confirm) and B (hold to run) ---- */
  document.querySelectorAll('.rbtn').forEach(btn => {
    const slot = btn.dataset.btn;               // 'a' or 'b'
    btn.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      Audio8.init();
      try { btn.setPointerCapture(e.pointerId); } catch (err) {}
      btn.classList.add('held');
      buzz(12);
      held[slot] = true;
      /* B doubles as confirm while a dialogue window is open */
      if (slot === 'a' || Dialogue.active) aEdge = true;
    });
    const off = (e) => {
      e.preventDefault();
      btn.classList.remove('held');
      held[slot] = false;
    };
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointercancel', off);
  });

  /* tapping the screen counts as A -- handy on the title and in dialogue */
  cv.addEventListener('pointerdown', (e) => {
    e.preventDefault(); Audio8.init(); aEdge = true;
  });

  /* stop the page from scrolling while a control is under the thumb */
  document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.touch') || e.target === cv) e.preventDefault();
  }, { passive: false });
}

/* ══ MAP HELPERS ═════════════════════════════════════════ */

const area = () => AREAS[state.area];

function tileAt(a, x, y) {
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return '#';
  return a.tiles[y][x];
}

function objAt(a, x, y) {
  return a.objects.find(o => o.x === x && o.y === y);
}
function npcAt(a, x, y) {
  return a.npcs.find(n => n.x === x && n.y === y && !state.gone[n.id]);
}
function gateAt(a, x, y) {
  return a.gates.find(o => o.x === x && o.y === y);
}

function blocked(x, y) {
  const a = area();
  if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
  if (SOLID.has(tileAt(a, x, y))) return true;
  const o = objAt(a, x, y);
  if (o && !o.ghost && !(o.once && state.opened[objKey(o)])) return true;
  if (npcAt(a, x, y)) return true;
  return false;
}

const objKey = (o) => state.area + ':' + o.x + ',' + o.y;

/* ══ AREA BAKING ═════════════════════════════════════════ */

let baked = null, waterTiles = [], overheadTiles = [], exitMarkers = [];

/* deterministic per-tile noise */
function hash(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

function bakeArea() {
  const a = area();
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const b = c.getContext('2d');
  b.imageSmoothingEnabled = false;
  waterTiles = []; overheadTiles = [];

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = tileAt(a, x, y);
      const px = x * TILE, py = y * TILE;

      /* -- ground base -- */
      if (t === 'x') {
        b.fillStyle = '#241826'; b.fillRect(px, py, TILE, TILE);
        b.fillStyle = '#31213a';
        for (let i = 0; i < 4; i++) {
          const h = hash(x * 7 + i, y * 13);
          b.fillRect(px + (h * 14 | 0), py + ((h * 97) % 14 | 0), 2, 2);
        }
        continue;
      }
      if (t === '_' ) {
        b.fillStyle = a.ground.path; b.fillRect(px, py, TILE, TILE);
        b.fillStyle = a.ground.path2;
        b.fillRect(px, py + 7, TILE, 1);
        b.fillRect(px + (y % 2 ? 3 : 11), py, 1, 7);
        b.fillRect(px + (y % 2 ? 11 : 3), py + 8, 1, 8);
        continue;
      }
      if (t === 'p' || t === '^') {
        b.fillStyle = a.ground.path; b.fillRect(px, py, TILE, TILE);
        b.fillStyle = a.ground.path2;
        for (let i = 0; i < 5; i++) {
          const h = hash(x * 31 + i * 3, y * 17 + i);
          b.fillRect(px + (h * 15 | 0), py + ((h * 211) % 15 | 0), 1, 1);
        }
        /* edge the path where it meets grass, so roads have shape */
        const road = (dx, dy) => { const c = tileAt(a, x + dx, y + dy); return c === 'p' || c === '^'; };
        if (!road(0, -1)) b.fillRect(px, py, TILE, 1);
        if (!road(0, 1))  b.fillRect(px, py + TILE - 1, TILE, 1);
        if (!road(-1, 0)) b.fillRect(px, py, 1, TILE);
        if (!road(1, 0))  b.fillRect(px + TILE - 1, py, 1, TILE);
      } else {
        /* grass */
        b.fillStyle = a.ground.grass; b.fillRect(px, py, TILE, TILE);
        b.fillStyle = a.ground.grass2;
        const n = t === ',' ? 5 : 2;
        for (let i = 0; i < n; i++) {
          const h = hash(x * 41 + i * 5, y * 23 + i * 7);
          const gx = px + (h * 13 | 0), gy = py + ((h * 331) % 13 | 0);
          b.fillRect(gx + 1, gy + 1, 1, 2);
          b.fillRect(gx, gy + 2, 3, 1);
        }
        if (t === ',') { b.fillRect(px + 6, py + 9, 1, 3); b.fillRect(px + 5, py + 11, 3, 1); }
        /* a scatter of tiny meadow flowers -- this is the Pink Kingdom */
        const hf = hash(x * 97, y * 53);
        if (hf > 0.86 && t !== 'f') {
          const fx = px + 3 + ((hf * 900) % 9 | 0), fy = py + 3 + ((hf * 570) % 9 | 0);
          b.fillStyle = hf > 0.955 ? '#fff6ec' : (hf > 0.92 ? '#ffb8d8' : '#ffe04f');
          b.fillRect(fx, fy - 1, 1, 1); b.fillRect(fx - 1, fy, 3, 1); b.fillRect(fx, fy + 1, 1, 1);
        }
      }

      /* -- tile art on top -- */
      switch (t) {
        /* two tree shapes, chosen deterministically, so forests
           read as woodland rather than wallpaper */
        case '#': b.drawImage(hash(x * 13, y * 29) > 0.62 ? TILES.bigtree : TILES.tree, px, py); break;
        case 'T': b.drawImage(TILES.bigtree, px, py); break;
        case '1': b.drawImage(TILES.bigTL, px, py); break;
        case '2': b.drawImage(TILES.bigTR, px, py); break;
        case '3': b.drawImage(TILES.bigBL, px, py); break;
        case '4': b.drawImage(TILES.bigBR, px, py); break;
        case 'A': overheadTiles.push([x, y]); break;
        case 'b': b.drawImage(TILES.bush, px, py); break;
        case 'o': b.drawImage(TILES.rock, px, py); break;
        case '=': b.drawImage(TILES.fence, px, py); break;
        case 'H': b.drawImage(TILES.wall, px, py); break;
        case 'h': b.drawImage(TILES.window, px, py); break;
        case 'R': b.drawImage(TILES.roof, px, py); break;
        case 'D': b.drawImage(TILES.door, px, py); break;
        case 'S': b.drawImage(TILES.sign, px, py); break;
        case 'U': b.drawImage(TILES.fountain, px, py); break;
        case '$': b.drawImage(TILES.shrine, px, py); break;
        case '^': b.drawImage(TILES.stairs, px, py); break;
        case 'f': b.drawImage(TILES.flowerbed, px, py); break;
        case 'g': b.drawImage(TILES.gate, px, py); break;
        case '~': waterTiles.push([x, y]); break;
      }
    }
  }
  baked = c;

  /* where the screen can be walked out of, for the edge arrows */
  exitMarkers = [];
  const edge = {
    north: { fixed: 'y', at: 0,         scan: 'x' },
    south: { fixed: 'y', at: MAP_H - 1, scan: 'x' },
    west:  { fixed: 'x', at: 0,         scan: 'y' },
    east:  { fixed: 'x', at: MAP_W - 1, scan: 'y' },
  };
  for (const dir in a.exits) {
    const e = edge[dir]; if (!e) continue;
    const open = [];
    const len = e.scan === 'x' ? MAP_W : MAP_H;
    for (let i = 0; i < len; i++) {
      const tx = e.fixed === 'x' ? e.at : i;
      const ty = e.fixed === 'y' ? e.at : i;
      if (!SOLID.has(tileAt(a, tx, ty))) open.push(i);
    }
    if (!open.length) continue;
    const mid = open[Math.floor(open.length / 2)];
    exitMarkers.push({
      dir,
      x: (e.fixed === 'x' ? e.at : mid) * TILE + 8,
      y: (e.fixed === 'y' ? e.at : mid) * TILE + 8,
    });
  }
  for (const g of a.gates) {
    exitMarkers.push({ dir: 'gate', x: g.x * TILE + 8, y: g.y * TILE + 8, gate: g });
  }

  spawnAmbient(true);
}

/* ══ AMBIENT PARTICLES ═══════════════════════════════════ */

function spawnAmbient(reset) {
  if (reset) particles = [];
  const a = area();
  const theme = a.theme;
  const add = (p) => particles.push(p);

  if (reset) {
    if (theme === 'overworld') {
      for (let i = 0; i < 3; i++) add(butterfly());
      for (let i = 0; i < 4; i++) add(cloud());
      for (let i = 0; i < 6; i++) add(sparkle());
    } else if (theme === 'woods') {
      for (let i = 0; i < 10; i++) add(leaf());
      for (let i = 0; i < 3; i++) add(sparkle());
    } else if (theme === 'cellar') {
      for (let i = 0; i < 14; i++) add(dust());
    } else if (theme === 'isabela') {
      for (let i = 0; i < 10; i++) add(firefly());
      for (let i = 0; i < 10; i++) add(sparkle());
      for (let i = 0; i < 5; i++) add(floatHeart());
    }
  }
}

const rnd = (a, b) => a + Math.random() * (b - a);

const butterfly = () => ({ kind: 'butterfly', x: rnd(16, 240), y: rnd(24, 200),
  vx: rnd(-.35, .35), vy: rnd(-.25, .25), t: rnd(0, 100), col: Math.random() < .5 ? '#fff6ec' : '#ffe04f' });
const cloud = () => ({ kind: 'cloud', x: rnd(-40, 256), y: rnd(4, 60), vx: rnd(.06, .16), w: rnd(18, 40) });
const sparkle = () => ({ kind: 'sparkle', x: rnd(8, 248), y: rnd(8, 210), t: rnd(0, 180), life: rnd(90, 200) });
const leaf = () => ({ kind: 'leaf', x: rnd(0, 256), y: rnd(-20, 224), vy: rnd(.15, .4), t: rnd(0, 100) });
const dust = () => ({ kind: 'dust', x: rnd(48, 208), y: rnd(32, 176), vy: rnd(-.09, -.03), t: rnd(0, 100) });
const firefly = () => ({ kind: 'firefly', x: rnd(16, 240), y: rnd(24, 200), t: rnd(0, 200),
  ox: rnd(0, 6.28), oy: rnd(0, 6.28) });
const floatHeart = () => ({ kind: 'heart', x: rnd(16, 240), y: rnd(60, 220), vy: rnd(-.28, -.12), t: 0 });

function updateParticles() {
  for (const p of particles) {
    p.t++;
    switch (p.kind) {
      case 'butterfly':
        p.x += p.vx; p.y += p.vy + Math.sin(p.t * 0.18) * 0.35;
        if (p.t % 90 === 0) { p.vx = rnd(-.35, .35); p.vy = rnd(-.25, .25); }
        if (p.x < 8 || p.x > 248) p.vx *= -1;
        if (p.y < 16 || p.y > 205) p.vy *= -1;
        break;
      case 'cloud':
        p.x += p.vx; if (p.x > 264) { p.x = -46; p.y = rnd(4, 60); }
        break;
      case 'sparkle':
        if (p.t > p.life) { p.t = 0; p.x = rnd(8, 248); p.y = rnd(8, 210); p.life = rnd(90, 200); }
        break;
      case 'leaf':
        p.y += p.vy; p.x += Math.sin(p.t * 0.05) * 0.3;
        if (p.y > 230) { p.y = -8; p.x = rnd(0, 256); }
        break;
      case 'dust':
        p.y += p.vy; p.x += Math.sin(p.t * 0.03) * 0.12;
        if (p.y < 26) { p.y = 190; p.x = rnd(48, 208); }
        break;
      case 'firefly':
        p.x += Math.sin(p.t * 0.013 + p.ox) * 0.42;
        p.y += Math.cos(p.t * 0.011 + p.oy) * 0.32;
        break;
      case 'heart':
        p.y += p.vy; p.x += Math.sin(p.t * 0.04) * 0.25;
        if (p.y < -10) { p.y = rnd(215, 235); p.x = rnd(16, 240); }
        break;
    }
  }
}

function drawParticles(behind) {
  for (const p of particles) {
    const back = (p.kind === 'cloud' || p.kind === 'dust');
    if (back !== behind) continue;
    switch (p.kind) {
      case 'butterfly': {
        const f = Math.sin(p.t * 0.4) > 0 ? 1 : 0;
        g.fillStyle = p.col;
        g.fillRect(p.x | 0, p.y | 0, 1, 2);
        g.fillRect((p.x | 0) - 2, (p.y | 0) - (f ? 1 : 0), 2, f ? 2 : 1);
        g.fillRect((p.x | 0) + 1, (p.y | 0) - (f ? 1 : 0), 2, f ? 2 : 1);
        break;
      }
      case 'cloud':
        g.fillStyle = 'rgba(255,255,255,0.30)';
        g.fillRect(p.x | 0, p.y | 0, p.w | 0, 4);
        g.fillRect((p.x | 0) + 5, (p.y | 0) - 3, (p.w | 0) - 12, 3);
        break;
      case 'sparkle': {
        const k = p.t / p.life;
        if (k > 0.75) break;
        const s = k < 0.2 ? 1 : (k < 0.5 ? 2 : 1);
        g.fillStyle = k < 0.5 ? '#ffffff' : '#ffd9ea';
        g.fillRect(p.x | 0, (p.y | 0) - s, 1, s * 2 + 1);
        g.fillRect((p.x | 0) - s, p.y | 0, s * 2 + 1, 1);
        break;
      }
      case 'leaf':
        g.fillStyle = p.t % 60 < 30 ? '#8fe06f' : '#5fbf6a';
        g.fillRect(p.x | 0, p.y | 0, 2, 2);
        break;
      case 'dust':
        g.fillStyle = 'rgba(255,230,245,0.30)';
        g.fillRect(p.x | 0, p.y | 0, 1, 1);
        break;
      case 'firefly': {
        const a2 = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(p.t * 0.06));
        g.fillStyle = `rgba(255,240,150,${a2.toFixed(2)})`;
        g.fillRect(p.x | 0, p.y | 0, 2, 2);
        g.fillStyle = `rgba(255,240,150,${(a2 * 0.3).toFixed(2)})`;
        g.fillRect((p.x | 0) - 1, (p.y | 0) - 1, 4, 4);
        break;
      }
      case 'heart':
        g.globalAlpha = 0.75;
        g.drawImage(ICONS.heart, p.x | 0, p.y | 0);
        g.globalAlpha = 1;
        break;
    }
  }
}

/* ══ TEXT ════════════════════════════════════════════════ */

function text(str, x, y, col, size, center) {
  const s = size || 8;
  g.font = s + 'px "Press Start 2P", monospace';
  g.textBaseline = 'top';
  g.fillStyle = col || '#4a0f2b';
  const w = str.length * s;
  g.fillText(str, center ? Math.round((W - w) / 2) : x, y);
  return w;
}

function textShadow(str, x, y, col, shadowCol, size, center) {
  const s = size || 8;
  const w = str.length * s;
  const sx = center ? Math.round((W - w) / 2) : x;
  text(str, sx, y + 2, shadowCol, s, false);
  text(str, sx, y, col, s, false);
  return w;
}

/* ══ TOASTS ══════════════════════════════════════════════ */

function toast(icon, label) {
  toasts.push({ icon, label, t: 0, life: 110 });
}

function drawToasts() {
  let row = 0;
  for (const t of toasts) {
    const k = t.t / t.life;
    let yOff = 0, alpha = 1;
    if (k < 0.12) yOff = -8 * (1 - k / 0.12);
    if (k > 0.85) alpha = (1 - k) / 0.15;
    const w = t.label.length * 8 + 26;
    const x = Math.round((W - w) / 2), y = 12 + row * 22 + yOff;
    g.globalAlpha = alpha;
    Dialogue.panel(g, x, y, w, 18);
    g.drawImage(ICONS[t.icon], x + 7, y + 5);
    text(t.label, x + 19, y + 6, '#4a0f2b');
    g.globalAlpha = 1;
    row++;
  }
}

/* ══ HUD (DOM) ═══════════════════════════════════════════ */

const hudEls = {
  hearts: document.getElementById('hud-hearts'),
  stars: document.getElementById('hud-stars'),
  flowers: document.getElementById('hud-flowers'),
  heartsN: document.getElementById('hud-hearts-count'),
  starsN: document.getElementById('hud-stars-count'),
  flowersN: document.getElementById('hud-flowers-count'),
  quest: document.getElementById('hud-quest'),
  place: document.getElementById('hud-place'),
};

function buildHud() {
  [['hearts', 'heart'], ['stars', 'star'], ['flowers', 'flower']].forEach(([key, icon]) => {
    const row = hudEls[key];
    row.innerHTML = '';
    for (let i = 0; i < CONFIG.targets[key]; i++) {
      const c = document.createElement('canvas');
      c.width = 16; c.height = 16;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(ICONS_DIM[icon], 0, 0, 8, 8, 0, 0, 16, 16);
      c.dataset.icon = icon;
      row.appendChild(c);
    }
  });
  refreshHud();
}

function refreshHud(popKey) {
  [['hearts', 'heart'], ['stars', 'star'], ['flowers', 'flower']].forEach(([key, icon]) => {
    const row = hudEls[key];
    const n = state[key];
    [...row.children].forEach((c, i) => {
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, 16, 16);
      x.drawImage(i < n ? ICONS[icon] : ICONS_DIM[icon], 0, 0, 8, 8, 0, 0, 16, 16);
      if (popKey === key && i === n - 1) {
        c.classList.remove('pop');
        void c.offsetWidth;
        c.classList.add('pop');
      }
    });
    const pad = (v) => String(v).padStart(2, '0');
    hudEls[key + 'N'].textContent = pad(n) + '/' + pad(CONFIG.targets[key]);
  });
  hudEls.quest.textContent = T(state.quest);
  hudEls.place.textContent = T(AREA_NAMES[state.area] || '');
}

/* ══ TRANSITIONS ═════════════════════════════════════════ */

const BLK = 8;
const BLOCKS_X = W / BLK, BLOCKS_Y = H / BLK;
let blockOrder = [];
(function shuffleBlocks() {
  for (let y = 0; y < BLOCKS_Y; y++) for (let x = 0; x < BLOCKS_X; x++) blockOrder.push([x, y]);
  for (let i = blockOrder.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [blockOrder[i], blockOrder[j]] = [blockOrder[j], blockOrder[i]];
  }
})();

function travel(to, entry, silent) {
  if (trans) return;
  Audio8.sfx('transition');
  trans = {
    phase: 'out', t: 0, len: 16,
    apply: () => {
      state.area = to;
      state.px = entry.x * TILE;
      state.py = entry.y * TILE;
      bakeArea();
      titleCardText = T(AREA_NAMES[to] || '');
      titleCard = 120;
      refreshHud();
      const a = AREAS[to];
      const song = a.theme === 'woods' ? 'woods'
                 : a.theme === 'isabela' ? 'isabela'
                 : a.theme === 'cellar' ? 'woods' : 'overworld';
      if (!silent) Audio8.music(song);
    },
  };
}

function drawTransition() {
  if (!trans) return;
  const k = trans.t / trans.len;
  const shownBlocks = Math.floor(blockOrder.length * (trans.phase === 'out' ? k : 1 - k));
  g.fillStyle = '#ff8fbe';
  for (let i = 0; i < shownBlocks; i++) {
    const [x, y] = blockOrder[i];
    g.fillRect(x * BLK, y * BLK, BLK, BLK);
  }
}

function updateTransition() {
  if (!trans) return;
  trans.t++;
  if (trans.t >= trans.len) {
    if (trans.phase === 'out') { trans.apply(); trans.phase = 'in'; trans.t = 0; }
    else trans = null;
  }
}

/* ══ SCRIPT COMMANDS ═════════════════════════════════════ */

Object.assign(Dialogue.handlers, {
  shake:  () => { shake = 26; Audio8.sfx('boss'); if (window.__buzz) window.__buzz(60); },
  flash:  () => { flash = 16; },
  sfx:    (s) => { Audio8.sfx(s.name); },
  music:  (s) => { Audio8.music(s.name); },
  quest:  (s) => { state.quest = s.text; refreshHud(); },
  flag:   (s) => { state.flags[s.id] = true; },
  secret: (s) => {
    if (state.secrets[s.id]) return;
    state.secrets[s.id] = true;
    Audio8.sfx('secret');
    if (window.__buzz) window.__buzz([14, 40, 22]);
    toast('spark', 'SECRET FOUND!');
  },
  give:   (s) => {
    state.items[s.item] = (state.items[s.item] || 0) + 1;
    Audio8.sfx('chest');
    toast('sock', (ITEMS[s.item] ? ITEMS[s.item].name : s.item) + '!');
  },
  boss:   () => { startBoss(); return 'wait'; },
  ending: () => { startEnding(); return 'wait'; },
});

/* ══ INTERACTION ═════════════════════════════════════════ */

function facingTile() {
  const cx = Math.round(state.px / TILE), cy = Math.round(state.py / TILE);
  const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[state.dir];
  return [cx + d[0], cy + d[1]];
}

function resolveScript(s) {
  return typeof s === 'function' ? s(state) : s;
}

/* Start a script with the window placed where it will not sit on top of
   whoever is talking. Anything below row 8 pushes the box to the top. */
function say(key, onEnd, forceAnchor) {
  Dialogue.setAnchor(forceAnchor || (state.py > 8.2 * TILE ? 'top' : 'bottom'));
  Dialogue.start(key, onEnd);
}

/* What, if anything, is actionable on a given tile. Used both by
   interact() and by the on-screen prompt, so the bubble never lies. */
function interactTarget(tx, ty) {
  const a = area();
  if (gateAt(a, tx, ty)) return 'gate';
  if (npcAt(a, tx, ty)) return 'talk';
  const o = objAt(a, tx, ty);
  if (o && !(o.once && state.opened[objKey(o)])) return o.sprite === 'chest' ? 'open' : 'look';
  if (tileAt(a, tx, ty) === 'f') return 'smell';
  return null;
}

function interact() {
  const a = area();
  const [tx, ty] = facingTile();

  /* gates first -- they sit on the edge */
  const gate = gateAt(a, tx, ty);
  if (gate) return tryGate(gate);

  const npc = npcAt(a, tx, ty);
  if (npc) {
    npc.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[state.dir];
    const key = resolveScript(npc.script);
    say(key, () => {
      state.talked[npc.id] = true;
      if (npc.vanish) {
        state.gone[npc.id] = true;
        for (let i = 0; i < 8; i++) particles.push({
          kind: 'sparkle', x: npc.x * TILE + 8 + rnd(-8, 8), y: npc.y * TILE + 8 + rnd(-8, 8),
          t: 0, life: 40,
        });
      }
    });
    return true;
  }

  const obj = objAt(a, tx, ty);
  if (obj) {
    if (obj.once && state.opened[objKey(obj)]) return false;
    if (obj.onTalk) obj.onTalk(state);
    const key = resolveScript(obj.script);
    say(key, () => { if (obj.once) state.opened[objKey(obj)] = true; });
    return true;
  }

  /* a flower bed you are facing: it reacts */
  if (tileAt(a, tx, ty) === 'f') {
    Audio8.sfx('sparkle');
    for (let i = 0; i < 4; i++) particles.push({
      kind: 'sparkle', x: tx * TILE + rnd(2, 14), y: ty * TILE + rnd(2, 14), t: 0, life: 34,
    });
    return true;
  }
  return false;
}

function tryGate(gate) {
  const need = CONFIG.gates[gate.need] || {};
  const ok = state.hearts >= (need.hearts || 0)
          && state.stars >= (need.stars || 0)
          && state.flowers >= (need.flowers || 0);

  if (!ok) { say(gate.locked); return true; }
  if (gate.boss && !state.flags.bossDone) { say('boss_intro', null, 'bottom'); return true; }

  const gk = state.area + ':' + gate.x + ',' + gate.y;
  if (!state.openGates[gk]) {
    state.openGates[gk] = true;
    say(gate.open, () => travel(gate.to, gate.entry));
    return true;
  }
  travel(gate.to, gate.entry);
  return true;
}

/* ══ MOVEMENT ════════════════════════════════════════════ */

const HITBOX = { ox: 3, oy: 8, w: 10, h: 7 };   // feet-only box, NES style

function canStand(px, py) {
  const x1 = px + HITBOX.ox, y1 = py + HITBOX.oy;
  const x2 = x1 + HITBOX.w - 1, y2 = y1 + HITBOX.h - 1;
  for (const [cx, cy] of [[x1, y1], [x2, y1], [x1, y2], [x2, y2]]) {
    if (blocked(Math.floor(cx / TILE), Math.floor(cy / TILE))) return false;
  }
  return true;
}

let stepTick = 0;

function updatePlayer() {
  if (Dialogue.busy || trans || mode !== 'play') { state.moving = false; return; }

  let dx = 0, dy = 0;
  if (held.left)  dx -= 1;
  if (held.right) dx += 1;
  if (held.up)    dy -= 1;
  if (held.down)  dy += 1;

  if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }

  const sp = CONFIG.playerSpeed * (held.b ? CONFIG.runMultiplier : 1);
  const moved = (dx || dy);

  if (moved) {
    /* face the dominant axis; prefer the newly pressed one */
    if (Math.abs(dx) > Math.abs(dy)) state.dir = dx > 0 ? 'right' : 'left';
    else state.dir = dy > 0 ? 'down' : 'up';

    /* axis-separated movement so you slide along walls instead of sticking */
    const nx = state.px + dx * sp;
    if (canStand(nx, state.py)) state.px = nx;
    else if (bumpCooldown <= 0 && dx) { bumpCooldown = 16; }

    const ny = state.py + dy * sp;
    if (canStand(state.px, ny)) state.py = ny;
    else if (bumpCooldown <= 0 && dy) { bumpCooldown = 16; }

    state.anim += Math.hypot(dx, dy) * sp;
    if (++stepTick % (held.b ? 11 : 16) === 0) Audio8.sfx('step');
  }
  state.moving = !!moved;
  if (bumpCooldown > 0) bumpCooldown--;

  /* corner clamp */
  state.px = Math.max(-2, Math.min(W - 14, state.px));
  state.py = Math.max(-2, Math.min(H - 14, state.py));

  checkPickups();
  checkTiles();
  checkAutoTalk();
}

function checkPickups() {
  const a = area();
  const cx = Math.round(state.px / TILE), cy = Math.round(state.py / TILE);
  for (const it of a.items) {
    if (state.collected[it.id]) continue;
    if (it.x !== cx || it.y !== cy) continue;
    state.collected[it.id] = true;
    const plural = { heart: 'hearts', star: 'stars', flower: 'flowers' }[it.type];
    state[plural]++;
    Audio8.sfx(it.type);
    if (window.__buzz) window.__buzz(18);
    toast(it.type, it.type.toUpperCase() + ' FOUND!');
    refreshHud(plural);
    for (let i = 0; i < 10; i++) particles.push({
      kind: 'sparkle', x: it.x * TILE + 8 + rnd(-9, 9), y: it.y * TILE + 8 + rnd(-9, 9),
      t: 0, life: 38,
    });
    if (it.secret && !state.secrets[it.secret]) {
      state.secrets[it.secret] = true;
      Audio8.sfx('secret');
      toast('spark', 'SECRET FOUND!');
    }
    if (state.hearts + state.stars + state.flowers === 15) {
      state.quest = QUESTS.shrine;
    } else if (state.quest === QUESTS.start) {
      state.quest = QUESTS.gathering;
    }
    refreshHud();
  }
}

function checkTiles() {
  const a = area();
  const cx = Math.round(state.px / TILE), cy = Math.round(state.py / TILE);

  for (const p of a.portals) {
    if (p.x === cx && p.y === cy) {
      if (p.sfx) Audio8.sfx(p.sfx);
      travel(p.to, p.entry);
      return;
    }
  }

  /* walking off an edge */
  let ex = null;
  if (state.px < -1 && a.exits.west)  ex = a.exits.west;
  if (state.px > W - 15 && a.exits.east)  ex = a.exits.east;
  if (state.py < -1 && a.exits.north) ex = a.exits.north;
  if (state.py > H - 15 && a.exits.south) ex = a.exits.south;
  if (ex) travel(ex.to, ex.entry);
}

function checkAutoTalk() {
  const a = area();
  for (const n of a.npcs) {
    if (!n.autoTalk || state.talked[n.id] || state.gone[n.id]) continue;
    const dx = Math.abs(state.px / TILE - n.x), dy = Math.abs(state.py / TILE - n.y);
    if (dx < 2.2 && dy < 2.6) {
      state.talked[n.id] = true;
      state.dir = 'up';
      say(resolveScript(n.script));
    }
  }
}

/* ══ RENDER: WORLD ═══════════════════════════════════════ */

function drawWater() {
  const a = area();
  const t = frame * 0.06;
  for (const [x, y] of waterTiles) {
    const px = x * TILE, py = y * TILE;
    g.fillStyle = '#6fb0e8'; g.fillRect(px, py, TILE, TILE);
    g.fillStyle = '#a8d8ff';
    for (let i = 0; i < 4; i++) {
      const yy = py + 2 + i * 4;
      const off = Math.round(Math.sin(t + x * 0.7 + i * 1.3) * 3);
      g.fillRect(px + 2 + off, yy, 5, 1);
      g.fillRect(px + 9 - off, yy + 2, 4, 1);
    }
    g.fillStyle = 'rgba(255,255,255,0.65)';
    if ((x + y + Math.floor(frame / 30)) % 5 === 0) {
      g.fillRect(px + 6, py + 6, 2, 1); g.fillRect(px + 7, py + 5, 1, 3);
    }

    /* shoreline: a pale bank wherever water meets land */
    const wet = (dx, dy) => tileAt(a, x + dx, y + dy) === '~';
    const foam = Math.sin(frame * 0.05 + x + y) > 0 ? '#e8f4ff' : '#d6ebff';
    g.fillStyle = '#f2e2c8';
    if (!wet(0, -1)) { g.fillRect(px, py, TILE, 2); g.fillStyle = foam; g.fillRect(px, py + 2, TILE, 1); g.fillStyle = '#f2e2c8'; }
    if (!wet(0, 1))  { g.fillRect(px, py + TILE - 2, TILE, 2); }
    if (!wet(-1, 0)) { g.fillRect(px, py, 2, TILE); }
    if (!wet(1, 0))  { g.fillRect(px + TILE - 2, py, 2, TILE); }
  }
}

function heroSprite() {
  const set = HERO[state.dir] || HERO.down;
  if (!state.moving) {
    /* idle: a slow two-frame breath */
    return set[Math.floor(frame / 34) % 2 === 0 ? 0 : 2];
  }
  return set[Math.floor(state.anim / 6) % 4];
}

function drawNPCs() {
  const a = area();
  const list = [];

  for (const n of a.npcs) {
    if (state.gone[n.id]) continue;
    let img;
    if (n.sprite === 'frog')  img = SPRITES.frog[Math.floor(frame / 40) % 2];
    else if (n.sprite === 'beige') img = SPRITES.beige[Math.floor(frame / 26) % 2];
    else {
      if (!n._sprites) n._sprites = npcSprite(n.look || { hair: '#6b3a22', body: '#ff8fbe' });
      img = n._sprites[Math.floor(frame / 46) % 2];
    }
    list.push({ img, x: n.x * TILE, y: n.y * TILE, flip: n.dir === 'left' });
  }

  for (const o of a.objects) {
    if (!o.sprite) continue;
    if (o.once && state.opened[objKey(o)]) {
      list.push({ img: SPRITES.chestOpen, x: o.x * TILE, y: o.y * TILE });
      continue;
    }
    let img;
    if (o.sprite === 'talkflower') img = SPRITES.talkflower[Math.floor(frame / 30) % 2];
    else if (o.sprite === 'chest') img = SPRITES.chest;
    else if (o.sprite === 'present') img = TILES.present;
    if (img) list.push({ img, x: o.x * TILE, y: o.y * TILE });
  }

  list.push({ img: heroSprite(), x: Math.round(state.px), y: Math.round(state.py), hero: true });
  list.sort((p, q) => (p.y + (p.hero ? 1 : 0)) - (q.y + (q.hero ? 1 : 0)));

  for (const s of list) {
    /* soft contact shadow keeps sprites sitting on the ground */
    g.fillStyle = 'rgba(60,16,41,0.16)';
    g.fillRect(s.x + 4, s.y + 14, 8, 2);
    if (s.flip) {
      g.save(); g.translate(s.x + 16, s.y); g.scale(-1, 1);
      g.drawImage(s.img, 0, 0); g.restore();
    } else {
      g.drawImage(s.img, s.x, s.y);
    }
  }
}

function drawCollectibles() {
  const a = area();
  for (const it of a.items) {
    if (state.collected[it.id]) continue;
    const bob = Math.round(Math.sin(frame * 0.08 + it.x + it.y) * 2);
    const px = it.x * TILE + 4, py = it.y * TILE + 4 + bob;
    /* a soft halo so collectibles read against busy grass */
    g.fillStyle = 'rgba(255,255,255,0.22)';
    g.fillRect(px - 2, py + 2, 12, 5);
    g.drawImage(ICONS[it.type], px, py);
    if ((frame + it.x * 9) % 90 < 5) {
      g.fillStyle = '#fff';
      g.fillRect(px + 8, py - 2, 1, 3); g.fillRect(px + 7, py - 1, 3, 1);
    }
  }
}

function drawOverhead() {
  for (const [x, y] of overheadTiles) {
    g.drawImage(TILES.bigtree, x * TILE, y * TILE);
  }
}

/* the world regains colour as optimism is recovered */
function drawGrayVeil() {
  const a = area();
  if (a.theme === 'isabela') return;
  const total = CONFIG.targets.hearts + CONFIG.targets.stars + CONFIG.targets.flowers;
  const p = Math.min(1, (state.hearts + state.stars + state.flowers) / total);
  /* Never fully gray: the kingdom is sad, not colourless. */
  const amount = (1 - p) * 0.28;
  if (amount <= 0.01) return;
  g.save();
  try {
    g.globalCompositeOperation = 'saturation';
    g.globalAlpha = amount;
    g.fillStyle = '#808080';
    g.fillRect(0, 0, W, H);
  } catch (e) { /* older browsers: skip, the game is fine without it */ }
  g.restore();
  g.save();
  g.globalCompositeOperation = 'multiply';
  g.globalAlpha = amount * 0.30;
  g.fillStyle = '#cfc7cf';
  g.fillRect(0, 0, W, H);
  g.restore();
}

/* ── ON-SCREEN GUIDANCE ──────────────────────────────────────
   Three small things that turn "what am I doing" into "oh, I see":
   a prompt over whatever you're facing, arrows at the edges you
   can leave by, and a permanent count of what you still need.
   ─────────────────────────────────────────────────────────── */

const PROMPT_LABEL = { talk: 'TALK', look: 'LOOK', open: 'OPEN', gate: 'ENTER', smell: 'SMELL' };

function drawActionPrompt() {
  if (Dialogue.busy || trans || mode !== 'play') return;
  const [tx, ty] = facingTile();
  const kind = interactTarget(tx, ty);
  if (!kind) return;

  const label = PROMPT_LABEL[kind] || 'LOOK';
  const bob = Math.round(Math.sin(frame * 0.14) * 1.5);
  const w = label.length * 6 + 16;
  let x = Math.max(2, Math.min(W - w - 2, tx * TILE + 8 - w / 2));
  let y = ty * TILE - 13 + bob;
  if (y < 2) y = ty * TILE + TILE + 2 + bob;      // flip below if it would clip

  g.fillStyle = '#4a0f2b'; g.fillRect(x, y, w, 12);
  g.fillStyle = '#ffe04f'; g.fillRect(x + 1, y + 1, w - 2, 10);
  g.fillStyle = '#4a0f2b'; g.fillRect(x + 2, y + 2, 7, 8);
  g.font = '6px "Press Start 2P", monospace';
  g.textBaseline = 'top';
  g.fillStyle = '#ffe04f'; g.fillText('A', x + 3, y + 3);
  g.fillStyle = '#4a0f2b'; g.fillText(label, x + 11, y + 3);
}

function drawExitArrows() {
  if (Dialogue.busy || trans || mode !== 'play') return;
  const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame * 0.07));

  for (const m of exitMarkers) {
    let locked = false;
    if (m.gate) {
      const need = CONFIG.gates[m.gate.need] || {};
      locked = !(state.hearts >= (need.hearts || 0)
              && state.stars >= (need.stars || 0)
              && state.flowers >= (need.flowers || 0));
    }
    g.globalAlpha = locked ? 0.75 : pulse;
    g.fillStyle = locked ? '#9d8b74' : '#fff6ec';
    const sx = m.x, sy = m.y;

    if (m.gate) {
      /* a padlock over the gate: shut and grey, or open and green.
         Nudged inward so an edge gate still shows it. */
      g.globalAlpha = 1;
      const lx = Math.max(6, Math.min(W - 12, sx)) - 5;
      const ly = sy - 11 + Math.round(Math.sin(frame * 0.08) * 1);
      g.fillStyle = '#4a0f2b'; g.fillRect(lx - 1, ly - 1, 12, 14);
      g.fillStyle = locked ? '#c9b79a' : '#8fe06f';
      if (locked) { g.fillRect(lx + 2, ly, 6, 2); g.fillRect(lx + 2, ly, 2, 5); g.fillRect(lx + 6, ly, 2, 5); }
      else        { g.fillRect(lx, ly, 6, 2);     g.fillRect(lx, ly, 2, 5); }
      g.fillStyle = locked ? '#9d8b74' : '#5fbf6a';
      g.fillRect(lx, ly + 5, 10, 7);
      g.fillStyle = '#4a0f2b'; g.fillRect(lx + 4, ly + 7, 2, 3);
    } else {
      const d = { north: [0, -1], south: [0, 1], west: [-1, 0], east: [1, 0] }[m.dir];
      const wob = Math.round(Math.sin(frame * 0.09) * 2);
      const cx = sx + d[0] * wob, cy = sy + d[1] * wob;
      /* a chevron pointing out of the screen */
      for (let i = 0; i < 4; i++) {
        const len = 7 - i * 2;
        if (d[0]) g.fillRect(cx + d[0] * (i - 2) * 2, cy - len / 2, 2, len);
        else      g.fillRect(cx - len / 2, cy + d[1] * (i - 2) * 2, len, 2);
      }
    }
    g.globalAlpha = 1;
  }
}

/* Compact always-on counter, top-left, so the objective never leaves
   the screen. Fades back when the player walks underneath it. */
function drawMiniHud() {
  if (mode !== 'play' && mode !== 'boss') return;
  const near = state.px < 96 && state.py < 34;
  g.globalAlpha = near ? 0.28 : 0.94;

  const rows = [
    ['heart',  state.hearts,  CONFIG.targets.hearts],
    ['star',   state.stars,   CONFIG.targets.stars],
    ['flower', state.flowers, CONFIG.targets.flowers],
  ];
  /* 6px glyphs: icon(8) + gap(1) + "n/n"(18) = 27, stepped by 29 */
  const step = 29, w = 5 + rows.length * step, h = 13;
  g.fillStyle = '#4a0f2b'; g.fillRect(2, 2, w, h);
  g.fillStyle = '#fff6ec'; g.fillRect(3, 3, w - 2, h - 2);

  g.font = '6px "Press Start 2P", monospace';
  g.textBaseline = 'top';
  let x = 5;
  for (const [icon, have, need] of rows) {
    g.drawImage(ICONS[icon], x, 4);
    g.fillStyle = have >= need ? '#3d8f4d' : '#7a0f42';
    g.fillText(have + '/' + need, x + 9, 6);
    x += step;
  }
  g.globalAlpha = 1;
}

function drawTitleCard() {
  if (titleCard <= 0) return;
  const k = titleCard > 100 ? (120 - titleCard) / 20 : (titleCard < 20 ? titleCard / 20 : 1);
  const w = titleCardText.length * 8 + 20;
  const x = Math.round((W - w) / 2);
  g.globalAlpha = Math.max(0, Math.min(1, k));
  Dialogue.panel(g, x, 8, w, 20);
  text(titleCardText, x + 10, 14, '#d3216b');
  g.globalAlpha = 1;
}

/* ══ BOSS ════════════════════════════════════════════════ */

function startBoss() {
  mode = 'boss';
  Audio8.music('boss');
  boss = { hp: 3, y: -70, targetY: 44, phase: 'enter', t: 0, hit: 0, alpha: 1, scale: 1 };
}

function updateBoss() {
  if (!boss) return;
  boss.t++;
  if (boss.hit > 0) boss.hit--;

  if (boss.phase === 'enter') {
    boss.y += (boss.targetY - boss.y) * 0.09;
    if (boss.t > 8 && boss.t % 12 === 0) shake = Math.max(shake, 8);
    if (Math.abs(boss.y - boss.targetY) < 0.6) {
      boss.y = boss.targetY;
      boss.phase = 'talk';
      shake = 18;
      Audio8.sfx('boss');
      Dialogue.resume();                      // ends boss_intro
      Dialogue.setAnchor('bottom');
      Dialogue.start('boss_reveal', () => { boss.phase = 'fight'; });
    }
    return;
  }

  if (boss.phase === 'fight' && !Dialogue.busy && aEdge) {
    aEdge = false;
    boss.hp--;
    boss.hit = 18;
    shake = 12;
    Audio8.sfx('hit');
    for (let i = 0; i < 14; i++) particles.push({
      kind: 'sparkle', x: 128 + rnd(-30, 30), y: boss.y + 20 + rnd(-20, 20), t: 0, life: 40,
    });
    const key = boss.hp === 2 ? 'boss_hit_1' : boss.hp === 1 ? 'boss_hit_2' : 'boss_hit_3';
    boss.phase = 'talk';
    Dialogue.setAnchor('bottom');
    Dialogue.start(key, () => {
      if (boss.hp > 0) boss.phase = 'fight';
      else { boss.phase = 'defeat'; boss.t = 0; Audio8.sfx('sparkle'); }
    });
  }

  if (boss.phase === 'defeat') {
    boss.alpha = Math.max(0, 1 - boss.t / 60);
    boss.y -= 0.35;
    if (boss.t % 6 === 0) particles.push({
      kind: 'sparkle', x: 128 + rnd(-26, 26), y: boss.y + 20 + rnd(-16, 16), t: 0, life: 46,
    });
    if (boss.t > 62) {
      boss = null;
      mode = 'play';
      state.flags.bossDone = true;
      refreshHud();
    }
  }
}

function drawBoss() {
  if (!boss) return;
  const img = SPRITES.boss[Math.floor(frame / 14) % 2];
  const x = 112, y = Math.round(boss.y);
  g.save();
  g.globalAlpha = boss.alpha;
  if (boss.hit > 0 && Math.floor(boss.hit / 3) % 2 === 0) {
    /* hit flash: draw a white silhouette */
    g.drawImage(img, x, y);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = 'rgba(255,255,255,0.85)';
    g.fillRect(x, y, 32, 32);
  } else {
    g.drawImage(img, x, y);
  }
  g.restore();

  if (boss.phase === 'fight' && !Dialogue.busy && Math.floor(frame / 24) % 2 === 0) {
    textShadow('PRESS A TO SPARKLE', 0, 128, '#fff6ec', '#4a0f2b', 8, true);
  }
  if (boss.phase !== 'enter' && boss.alpha > 0.2) {
    /* HP pips */
    for (let i = 0; i < 3; i++) {
      g.drawImage(i < boss.hp ? ICONS.heart : ICONS_DIM.heart, 108 + i * 14, 84);
    }
  }
}

/* ══ ENDING ══════════════════════════════════════════════ */

function startEnding() {
  mode = 'ending';
  Audio8.music('none');
  Audio8.sfx('reveal');
  ending = { t: 0, phase: 'bloom', hearts: [], scroll: 0 };
  for (let i = 0; i < 26; i++) {
    ending.hearts.push({
      x: rnd(4, 244), y: rnd(224, 340),
      v: rnd(0.35, 1.0), s: Math.random() < 0.45 ? 'star' : 'heart', w: rnd(0, 6.28),
    });
  }
}

function updateEnding() {
  ending.t++;
  for (const h of ending.hearts) {
    h.y -= h.v;
    h.x += Math.sin((ending.t + h.w * 20) * 0.03) * 0.35;
    if (h.y < -12) { h.y = rnd(226, 300); h.x = rnd(4, 244); }
  }
  if (ending.phase === 'bloom' && ending.t > 150) {
    ending.phase = 'card';
    ending.t = 0;
    Audio8.sfx('fanfare');
    setTimeout(() => Audio8.music('ending'), 1400);
  }
  if (ending.phase === 'card') {
    const speed = held.a ? 0.9 : 0.32;
    ending.scroll += speed;
  }
}

function drawEnding() {
  /* the world washes to pink */
  const bloom = Math.min(1, ending.phase === 'bloom' ? ending.t / 110 : 1);
  g.globalAlpha = bloom;
  g.fillStyle = '#ffd9ea';
  g.fillRect(0, 0, W, H);
  g.globalAlpha = 1;

  /* soft pink bands, like a faded CRT gradient */
  for (let i = 0; i < 8; i++) {
    g.fillStyle = `rgba(255,${168 + i * 6},${206 + i * 4},${(0.10 * bloom).toFixed(2)})`;
    g.fillRect(0, i * 28, W, 28);
  }

  for (const h of ending.hearts) {
    /* they fade back once the credits arrive, so the text stays readable */
    g.globalAlpha = (ending.phase === 'card' ? 0.42 : 0.85) * bloom;
    g.drawImage(ICONS[h.s], h.x | 0, h.y | 0);
  }
  g.globalAlpha = 1;

  if (ending.phase !== 'card') return;

  const pad2 = (v) => String(v).padStart(2, '0');
  const stats = [
    ['HEARTS FOUND',    pad2(state.hearts)],
    ['STARS FOUND',     pad2(state.stars)],
    ['FLOWERS FOUND',   pad2(state.flowers)],
    ['SECRETS FOUND',   pad2(Object.keys(state.secrets).length)],
    ['SOCKS RECOVERED', pad2(state.items.sock || 0)],
  ].map(([label, n]) => (label + ':').padEnd(18, ' ') + n);

  /* keep the credits out of the bottom strip, where the hint lives */
  g.save();
  g.beginPath(); g.rect(0, 0, W, 198); g.clip();

  let y = 60 - ending.scroll;

  const tw = textShadow(T(ENDING_TEXT.title), 0, y, '#7a0f42', '#ffffff', 8, true);
  g.drawImage(ICONS.star, Math.round((W - tw) / 2) - 16, y);
  g.drawImage(ICONS.star, Math.round((W + tw) / 2) + 8, y);
  y += 26;
  textShadow(T(ENDING_TEXT.line1), 0, y, '#7a0f42', '#ffb8d8', 8, true);
  y += 34;

  /* the heart itself, big */
  const s = 4;
  const hx = Math.round((W - 8 * s) / 2);
  g.imageSmoothingEnabled = false;
  g.drawImage(ICONS.heart, 0, 0, 8, 8, hx, y, 8 * s, 8 * s);
  y += 8 * s + 10;
  textShadow(T(ENDING_TEXT.subject), 0, y, '#d3216b', '#fff', 8, true);
  y += 30;

  textShadow(T(ENDING_TEXT.ending), 0, y, '#7a0f42', '#ffb8d8', 8, true);
  y += 30;

  for (const line of stats) {
    text(line, 24, y, '#7a0f42', 8, false);
    y += 14;
  }
  y += 22;
  textShadow(T(ENDING_TEXT.thanks), 0, y, '#7a0f42', '#fff', 8, true);
  y += 34;
  const sw = textShadow(T(ENDING_TEXT.signoff), 0, y, '#7a0f42', '#ffffff', 8, true);
  g.drawImage(ICONS.heart, Math.round((W + sw) / 2) + 8, y);
  g.drawImage(ICONS.heart, Math.round((W - sw) / 2) - 16, y);
  y += 22;
  text(T(ENDING_TEXT.author), 0, y, 'rgba(122,15,66,0.75)', 8, true);
  y += 40;

  const end = y;
  g.restore();
  /* Park with the last three lines -- thank you / made for her / by whom --
     all comfortably on screen. That is the note to end on. */
  if (end < 192) ending.scroll -= 0.32;

  if (end > 215 && Math.floor(frame / 30) % 2 === 0) {
    text('HOLD A TO SCROLL', 0, 208, 'rgba(122,15,66,0.55)', 8, true);
  }
}

/* ══ TITLE ═══════════════════════════════════════════════ */

let titleT = 0;

function drawTitle() {
  titleT++;

  /* sky */
  for (let i = 0; i < 14; i++) {
    const c = 236 - i * 2;
    g.fillStyle = `rgb(255,${190 + i * 4},${c})`;
    g.fillRect(0, i * 16, W, 16);
  }
  /* hills */
  g.fillStyle = '#ffb8d8';
  for (let x = 0; x < W; x += 2) {
    const h = 26 + Math.sin(x * 0.03) * 8 + Math.sin(x * 0.011) * 6;
    g.fillRect(x, H - h, 2, h);
  }
  g.fillStyle = '#8fd08a';
  for (let x = 0; x < W; x += 2) {
    const h = 40 + Math.sin(x * 0.02 + 2) * 6;
    g.fillRect(x, H - h + 18, 2, h);
  }

  drawParticles(true);

  /* logo plate */
  Dialogue.panel(g, 14, 26, 228, 74);
  textShadow('ISABELA', 0, 36, '#d3216b', '#ffb8d8', 16, true);
  text('AND THE LOST HEART', 0, 62, '#7a0f42', 8, true);
  text('OF THE PINK KINGDOM', 0, 78, '#7a0f42', 8, true);

  /* hearts orbiting the plate */
  for (let i = 0; i < 6; i++) {
    const a2 = titleT * 0.012 + i * 1.047;
    const x = 128 + Math.cos(a2) * 118;
    const y = 63 + Math.sin(a2) * 44;
    g.drawImage(i % 2 ? ICONS.star : ICONS.heart, x | 0, y | 0);
  }

  /* the hero, waiting */
  const hero = HERO.down[Math.floor(titleT / 34) % 2 === 0 ? 0 : 2];
  const hy = 152 + Math.round(Math.sin(titleT * 0.06) * 1);
  g.fillStyle = 'rgba(60,16,41,0.16)';
  g.fillRect(120, hy + 15, 12, 2);
  g.drawImage(hero, 120, hy);

  drawParticles(false);

  /* a plate under the prompt so it never fights the hills */
  Dialogue.panel(g, 52, 178, 152, 20);
  if (Math.floor(titleT / 26) % 2 === 0) {
    text('PRESS  A  TO  START', 0, 184, '#d3216b', 8, true);
  }

  /* say so plainly if the browser has not let audio start yet */
  if (Audio8.status() === 'blocked') {
    text('\u266A TAP THE SCREEN FOR SOUND', 0, 204, '#7a0f42', 6, true);
  }
  text('© 199- PINKTENDO', 0, 208, 'rgba(122,15,66,0.55)', 8, true);
}

/* ══ MAIN LOOP ═══════════════════════════════════════════ */

function step() {
  frame++;

  if (mode === 'title') {
    if (aEdge) {
      aEdge = false;
      Audio8.init();
      Audio8.sfx('fanfare');
      mode = 'play';
      state.started = true;
      bakeArea();
      titleCardText = T(AREA_NAMES[state.area]);
      titleCard = 120;
      Audio8.music('overworld');
      setTimeout(() => say('intro'), 700);
    }
    render();
    aEdge = false;
    requestAnimationFrame(step);
    return;
  }

  updateTransition();
  updateParticles();
  Dialogue.update();

  if (mode === 'ending') {
    updateEnding();
  } else if (mode === 'boss') {
    updateBoss();
  } else {
    updatePlayer();
  }

  /* A press: dialogue first, then the world */
  if (aEdge) {
    if (Dialogue.active) Dialogue.confirm();
    else if (mode === 'play' && !trans) interact();
    aEdge = false;
  }

  /* arrow keys steer the choice cursor */
  if (Dialogue.active) {
    for (const d of ['up', 'down']) {
      if (held[d] && !held['_last' + d]) Dialogue.move(d);
      held['_last' + d] = held[d];
    }
  }

  if (frame % 30 === 0) syncSound();

  if (shake > 0) shake--;
  if (flash > 0) flash--;
  if (titleCard > 0) titleCard--;
  toasts = toasts.filter(t => ++t.t < t.life);

  render();
  requestAnimationFrame(step);
}

function render() {
  g.fillStyle = '#000';
  g.fillRect(0, 0, W, H);

  g.save();
  if (shake > 0) {
    g.translate((Math.random() * 2 - 1) * Math.min(5, shake / 3) | 0,
                (Math.random() * 2 - 1) * Math.min(5, shake / 3) | 0);
  }

  if (mode === 'title') {
    drawTitle();
  } else if (mode === 'ending') {
    drawEnding();
  } else {
    if (baked) g.drawImage(baked, 0, 0);
    drawWater();
    drawParticles(true);
    drawCollectibles();
    drawNPCs();
    drawOverhead();
    if (mode === 'boss') drawBoss();
    drawParticles(false);
    drawGrayVeil();
    drawExitArrows();
    drawActionPrompt();
    drawMiniHud();
    drawTitleCard();
    drawToasts();
  }

  g.restore();

  if (mode !== 'title' && mode !== 'ending') Dialogue.draw(g);
  drawTransition();

  if (flash > 0) {
    g.fillStyle = `rgba(255,255,255,${(flash / 16 * 0.8).toFixed(2)})`;
    g.fillRect(0, 0, W, H);
  }

  /* a faint vignette; the CRT frame does the rest in CSS */
  g.fillStyle = 'rgba(60,16,41,0.10)';
  g.fillRect(0, 0, W, 1); g.fillRect(0, H - 1, W, 1);
}

/* ══ BUTTONS ═════════════════════════════════════════════ */

const soundBtn = document.getElementById('btn-sound');

/* The label reports what the audio engine is actually doing, so
   "no sound" is a visible state rather than a mystery. */
/* What the button is currently showing. The click handler decides from
   THIS, not from live state: the capture-phase unlock listener fires on
   touchstart, before this click handler runs, so by the time we get here
   audio is often already running -- and reading live state would turn
   "tap for sound" into "mute". Act on what the player actually saw. */
let shownStatus = 'blocked';

function syncSound() {
  const st = Audio8.status();
  soundBtn.innerHTML = st === 'running' ? '\u266A SOUND: ON'
                     : st === 'off'     ? '\u266A SOUND: OFF'
                                        : '\u266A TAP FOR SOUND';
  soundBtn.classList.toggle('pxbtn--warn', st === 'blocked');
  shownStatus = st;
}

soundBtn.addEventListener('click', () => {
  /* The player pressed a button reading "TAP FOR SOUND" -- that is a
     request to start audio, never to mute it. */
  if (shownStatus === 'blocked') {
    Audio8.init();
    syncSound();
    if (mode === 'play') restartMusic();
    return;
  }
  const on = !Audio8.on;
  Audio8.setEnabled(on);
  if (on) { Audio8.init(); if (mode === 'play') restartMusic(); }
  syncSound();
});

function restartMusic() {
  const a = area();
  Audio8.music(a.theme === 'woods' ? 'woods'
             : a.theme === 'isabela' ? 'isabela' : 'overworld');
}

/* ── fullscreen ─────────────────────────────────────────── */
const shell = document.querySelector('.console-shell');
const fsBtn = document.getElementById('btn-full');

function fsElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

fsBtn.addEventListener('click', () => {
  Audio8.init();
  if (fsElement()) {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
  } else {
    const req = shell.requestFullscreen || shell.webkitRequestFullscreen;
    if (req) {
      const p = req.call(shell, { navigationUI: 'hide' });
      if (p && p.catch) p.catch(() => {});
    } else {
      /* iPhone Safari has no element fullscreen -- do the next best thing */
      document.body.classList.toggle('fs-on');
      scrollTo(0, 0);
    }
  }
});

function syncFs() {
  const on = !!fsElement();
  document.body.classList.toggle('fs-on', on);
  fsBtn.innerHTML = on ? '\u2716 EXIT FULL' : '\u26F6 FULLSCREEN';
}
document.addEventListener('fullscreenchange', syncFs);
document.addEventListener('webkitfullscreenchange', syncFs);

document.getElementById('btn-reset').addEventListener('click', () => {
  Dialogue.cancel();
  state = freshState();
  mode = 'title';
  boss = null; ending = null; trans = null;
  toasts = []; particles = []; titleT = 0;
  shake = 0; flash = 0; titleCard = 0;
  Audio8.music('none');
  bakeArea();
  spawnAmbient(true);
  buildHud();
});

/* ══ BOOT ════════════════════════════════════════════════ */

/* splice the editable final message into the reveal script */
DIALOGUE.final_message = FINAL_MESSAGE.map(t => ({ text: t })).concat([{ cmd: 'ending' }]);

/* A tiny hook for testing and for tweaking content live in the console. */
window.__GAME = {
  get state() { return state; },
  get mode() { return mode; },
  travel,
  /* fill the quest log instantly -- handy while editing dialogue */
  cheat() {
    for (const k in AREAS) for (const it of AREAS[k].items) {
      if (state.collected[it.id]) continue;
      state.collected[it.id] = true;
      state[{ heart: 'hearts', star: 'stars', flower: 'flowers' }[it.type]]++;
    }
    refreshHud();
  },
};

function boot() {
  bindTouch();
  syncSound();
  buildHud();
  bakeArea();
  spawnAmbient(true);
  requestAnimationFrame(step);
}

if (document.fonts && document.fonts.load) {
  Promise.race([
    Promise.all([
      document.fonts.load('8px "Press Start 2P"'),
      document.fonts.load('16px "Press Start 2P"'),
    ]),
    new Promise(res => setTimeout(res, 2500)),
  ]).then(boot, boot);
} else {
  boot();
}

})();
