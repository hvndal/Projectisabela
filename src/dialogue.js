/* ============================================================
   dialogue.js  --  the retro text window
   ------------------------------------------------------------
   Runs a script (an array from DIALOGUE), one box at a time,
   with a typewriter, a blinking continue arrow, choices, and
   script commands handed back to the game via Dialogue.handlers.
   ============================================================ */

const Dialogue = (() => {

  const BOX = { x: 8, y: 148, w: 240, h: 68 };
  const Y_BOTTOM = 148, Y_TOP = 10;
  let anchor = 'bottom';

  /* Flip the window to the top of the screen when the speaker (or the
     player) is standing behind where the box would otherwise sit. */
  function setAnchor(where) {
    anchor = where === 'top' ? 'top' : 'bottom';
    BOX.y = anchor === 'top' ? Y_TOP : Y_BOTTOM;
  }
  const CHAR_W = 8, LINE_H = 11, MAX_COLS = 27, MAX_LINES = 3;

  let script = [], index = -1, active = false;
  let lines = [], shown = 0, total = 0, done = false;
  let speaker = '', blink = 0, blipTick = 0;
  let choice = null, choiceIdx = 0;
  let pendingEnd = null;
  let paused = false;                     // held while a command animates

  const handlers = {};                    // filled in by game.js

  /* ── word wrap ────────────────────────────────────────── */
  function wrap(text) {
    const words = String(text).split(' ');
    const out = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (test.length > MAX_COLS && line) { out.push(line); line = w; }
      else line = test;
    }
    if (line) out.push(line);
    return out.slice(0, MAX_LINES);
  }

  /* ── control ──────────────────────────────────────────── */
  function start(key, onEnd) {
    const src = Array.isArray(key) ? key : DIALOGUE[key];
    if (!src) { if (onEnd) onEnd(); return; }
    script = src.slice();
    index = -1;
    active = true;
    paused = false;
    pendingEnd = onEnd || null;
    speaker = '';
    next();
  }

  function next() {
    index++;
    if (index >= script.length) return finish();

    const step = script[index];

    /* a command, not a box */
    if (step.cmd) {
      if (step.cmd === 'goto') {
        const src = DIALOGUE[step.key];
        if (src) { script = src.slice(); index = -1; return next(); }
        return next();
      }
      if (step.cmd === 'choice') {
        speaker = '';
        lines = wrap(T(step.prompt));
        shown = 0; total = lines.join('').length; done = false;
        choice = step.options; choiceIdx = 0;
        return;
      }
      const fn = handlers[step.cmd];
      let res = fn ? fn(step) : null;
      if (res === 'wait') { paused = true; return; }       // game resumes us
      return next();
    }

    /* a spoken box */
    choice = null;
    speaker = step.who ? T(step.who) : '';
    lines = wrap(T(step.text));
    shown = 0;
    total = lines.join('').length;
    done = false;
  }

  /* Called by the game when a 'wait' command has finished. */
  function resume() { paused = false; next(); }

  function finish() {
    active = false;
    script = []; index = -1; choice = null;
    const cb = pendingEnd; pendingEnd = null;
    if (cb) cb();
  }

  /* ── input ────────────────────────────────────────────── */
  function confirm() {
    if (!active || paused) return;
    if (!done) { shown = total; done = true; return; }   // skip the typewriter
    if (choice) {
      const opt = choice[choiceIdx];
      Audio8.sfx('menu');
      choice = null;
      const src = DIALOGUE[opt.key];
      if (src) { script = src.slice(); index = -1; return next(); }
      return next();
    }
    Audio8.sfx('blip2');
    next();
  }

  function move(dir) {
    if (!choice || !active) return;
    if (dir === 'up' || dir === 'left') choiceIdx = (choiceIdx + choice.length - 1) % choice.length;
    if (dir === 'down' || dir === 'right') choiceIdx = (choiceIdx + 1) % choice.length;
    Audio8.sfx('blip');
  }

  /* ── update ───────────────────────────────────────────── */
  function update() {
    blink++;
    if (!active || paused) return;
    if (!done) {
      shown += CONFIG.textSpeed;
      if (shown >= total) { shown = total; done = true; }
      else if (++blipTick % 3 === 0) Audio8.sfx('blip');
    }
  }

  /* ── drawing ──────────────────────────────────────────── */
  function panel(g, x, y, w, h) {
    g.fillStyle = '#4a0f2b'; g.fillRect(x, y, w, h);                  // outer
    g.fillStyle = '#ff8fbe'; g.fillRect(x + 2, y + 2, w - 4, h - 4);  // pink liner
    g.fillStyle = '#fff6ec'; g.fillRect(x + 4, y + 4, w - 8, h - 8);  // paper
    /* clipped corners, the way NES boxes fake a bevel */
    g.fillStyle = '#4a0f2b';
    g.fillRect(x, y, 2, 2); g.fillRect(x + w - 2, y, 2, 2);
    g.fillRect(x, y + h - 2, 2, 2); g.fillRect(x + w - 2, y + h - 2, 2, 2);
  }

  function text(g, str, x, y, col) {
    g.fillStyle = col || '#4a0f2b';
    g.fillText(str, x, y);
  }

  function draw(g) {
    if (!active) return;

    panel(g, BOX.x, BOX.y, BOX.w, BOX.h);

    g.font = '8px "Press Start 2P", monospace';
    g.textBaseline = 'top';

    /* name plate */
    let ty = BOX.y + 11;
    if (speaker) {
      const pw = speaker.length * CHAR_W + 10;
      g.fillStyle = '#4a0f2b'; g.fillRect(BOX.x + 6, BOX.y - 6, pw, 14);
      g.fillStyle = '#ff5fa2'; g.fillRect(BOX.x + 8, BOX.y - 4, pw - 4, 10);
      text(g, speaker, BOX.x + 10, BOX.y - 3, '#fff6ec');
      ty = BOX.y + 13;
    }

    /* typed body */
    let budget = Math.floor(shown);
    for (let i = 0; i < lines.length; i++) {
      const full = lines[i];
      const take = Math.max(0, Math.min(full.length, budget));
      if (take > 0) text(g, full.slice(0, take), BOX.x + 10, ty + i * LINE_H);
      budget -= full.length;
      if (budget <= 0) break;
    }

    /* choices -- above the box, or below it when the box is at the top */
    if (choice && done) {
      const boxW = 108, boxH = 14 * choice.length + 10;
      const cx = BOX.x + BOX.w - boxW - 6;
      const cy = anchor === 'top' ? BOX.y + BOX.h + 6 : BOX.y - boxH - 4;
      panel(g, cx, cy, boxW, boxH);
      for (let i = 0; i < choice.length; i++) {
        text(g, choice[i].label, cx + 18, cy + 8 + i * 14);
      }
      if (Math.floor(blink / 20) % 2 === 0 || true) {
        g.drawImage(ICONS.heart, cx + 7, cy + 7 + choiceIdx * 14);
      }
    }

    /* continue arrow */
    if (done && !choice && Math.floor(blink / 22) % 2 === 0) {
      const ax = BOX.x + BOX.w - 16, ay = BOX.y + BOX.h - 14;
      g.fillStyle = '#d3216b';
      g.fillRect(ax, ay, 8, 2);
      g.fillRect(ax + 1, ay + 2, 6, 2);
      g.fillRect(ax + 2, ay + 4, 4, 2);
      g.fillRect(ax + 3, ay + 6, 2, 2);
    }
  }

  /* Hard stop, no callbacks -- used by RESET. */
  function cancel() {
    active = false; paused = false; choice = null;
    script = []; index = -1; pendingEnd = null;
  }

  return {
    start, confirm, move, update, draw, resume, cancel, panel, text, setAnchor,
    handlers,
    get active() { return active; },
    get busy()   { return active || paused; },
    get paused() { return paused; },
    BOX,
  };
})();
