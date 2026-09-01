/* ============================================================
   game.js  --  HERMANIFY Master NES Console & Cartridge Hub
   ------------------------------------------------------------
   Orchestrates the 8-bit multi-game arcade system, cartridge
   swapping, universal input routing, CRT shaders, and audio.
   ============================================================ */

(() => {
  const cv = document.getElementById('screen');
  const g = cv.getContext('2d', { alpha: false });
  g.imageSmoothingEnabled = false;

  const W = 256, H = 224;

  /* ══ CARTRIDGE CATALOG ═════════════════════════════════════ */
  const CATALOG = [
    {
      id: 'isabela',
      title: 'ISABELA & THE LOST HEART',
      subtitle: 'OF THE PINK KINGDOM',
      cartLabel: 'ISABELA',
      genre: 'ADVENTURE / RPG',
      year: '1993',
      players: '1 PLAYER',
      difficulty: 'NORMAL',
      color: '#ff5fa2',
      darkColor: '#7a0f42',
      engine: window.IsabelaGame,
      desc: 'The kingdom of Bellavista woke up gray. Gather 7 hearts, 5 stars & 3 flowers, speak to quirky villagers, and discover the true Heart.',
      controls: 'MOVE: Arrows/WASD • TALK/SEARCH: A/Space • RUN: Hold B/Shift',
      manual: {
        story: 'The kingdom of Bellavista was powered by the Heart of the Pink Kingdom. One morning it vanished, optimism dropped to 27%, and the royal frog resigned. It falls upon Isabela to uncover the truth.',
        howToPlay: [
          '<b>MOVE</b>: Arrow keys, WASD, or Touch D-Pad',
          '<b>TALK / SEARCH / OPEN</b>: Press A (Space, Enter, Z)',
          '<b>RUN</b>: Hold B (Shift, X)',
          'Gather <b>7 hearts</b>, <b>5 stars</b>, and <b>3 magical flowers</b> to unseal the shrine.'
        ],
        tips: 'Wander behind trees, inspect chests, and be gentle to the Beige Ones!'
      }
    },
    {
      id: 'fitway',
      title: 'FITWAY: IRON RUN',
      subtitle: 'A FITNESS ARCADE ADVENTURE',
      cartLabel: 'FITWAY',
      genre: 'RPG / FITNESS ADVENTURE',
      year: '1994',
      players: '1 PLAYER (5 HEROES)',
      difficulty: 'BUILD 01 — VERTICAL SLICE',
      color: '#ffd000',
      darkColor: '#000000',
      engine: window.FitwayGame,
      desc: 'Explore Fitway Gym as a 16-bit top-down RPG! Choose from 5 heroes — Sukh, Gagan, Shubham, Rakesh, or Herman. Navigate the gym, talk to trainers, complete real workout challenges, and unlock equipment abilities!',
      controls: 'MOVE: D-Pad/WASD • INTERACT: A/Space • SPRINT: Hold B/Shift',
      manual: {
        story: 'You walk through the doors of Fitway Gym for the first time. Sukh, the owner, sizes you up at reception. Gagan, the power trainer, blocks the cardio floor. Prove yourself through real fitness challenges to earn your place in the gym.',
        howToPlay: [
          '<b>CHOOSE HERO</b>: Street Fighter-style character select — Sukh, Gagan, Shubham, Rakesh, or Herman',
          '<b>EXPLORE</b>: Walk through the gym rooms — Reception, Hallway, Cardio Floor',
          '<b>TALK</b>: Press A near NPCs to interact and trigger dialogue',
          '<b>WORKOUT CHALLENGES</b>: Complete rep-based fitness challenges to progress',
          '<b>UNLOCK</b>: Earn equipment abilities by proving yourself to trainers'
        ],
        tips: 'Talk to everyone! Explore every corner of the gym. The weights floor on Floor 2 is waiting...'
      }
    },
    {
      id: 'tank',
      title: 'CYBER TANK 1989',
      subtitle: 'HERMANIFY BASE DEFENSE',
      cartLabel: 'CYBER TANK',
      genre: 'ACTION / STRATEGY',
      year: '1989',
      players: '1 PLAYER',
      difficulty: 'CHALLENGING',
      color: '#00a800',
      darkColor: '#004400',
      engine: window.TankGame,
      desc: 'NES Battle City-style armored combat. Blast through destructible brick terrain, protect the Golden Eagle Base, defeat rogue panzer waves, and collect powerful tank upgrades.',
      controls: 'DRIVE: 4 Directions (WASD/Arrows) • FIRE CANNON: A/Space',
      manual: {
        story: 'Rogue armored battalions are attempting to obliterate the Hermanify Eagle HQ! Take the helm of your heavy cyber tank and defend the perimeter at all costs.',
        howToPlay: [
          '<b>DRIVE TANK</b>: Arrow keys or WASD (4 cardinal directions)',
          '<b>FIRE CANNON</b>: Press A (Space / Z)',
          'Bullets chip away brick walls. Steel walls require heavy upgrades',
          'Water stops tanks, but bullets can fly across'
        ],
        tips: 'Shoot flashing enemy tanks to reveal Star upgrades, Grenades, and Shovel base fortification!'
      }
    },
    {
      id: 'space',
      title: 'STAR GUARDIAN 8-BIT',
      subtitle: 'COSMIC DEFENDER',
      cartLabel: 'STAR GUARDIAN',
      genre: 'SPACE SHOOTER',
      year: '1987',
      players: '1 PLAYER',
      difficulty: 'HARD',
      color: '#0080ff',
      darkColor: '#002060',
      engine: window.SpaceGame,
      desc: 'High-speed vertical arcade space shooter. Weave through alien dive-bombers, collect spread-shot laser upgrades, and destroy the cosmic Mothership!',
      controls: 'STEER SHIP: 8 Directions • FIRE LASERS: A/Space (or B/Shift)',
      manual: {
        story: 'Deep in Sector 7, extraterrestrial insectoid invaders have breached the galaxy. Pilot the Star Guardian interceptor and defend the cosmos!',
        howToPlay: [
          '<b>PILOT SHIP</b>: Arrows / WASD in all directions',
          '<b>RAPID LASERS</b>: Press or hold A (Space / Z)',
          'Watch out for alien formation dive-bombs and laser volleys',
          'Pickup <b>[P]</b> capsules for Triple Spread Lasers and <b>[S]</b> for Energy Shields'
        ],
        tips: 'Defeat the Command Mothership on Wave 3 for a massive 5,000 point score bonus!'
      }
    },
    {
      id: 'plumber',
      title: "HERMAN'S SUPER PLUMBER",
      subtitle: 'COIN CASTLE RUSH',
      cartLabel: 'SUPER HERMAN',
      genre: 'PLATFORMER',
      year: '1985',
      players: '1 PLAYER',
      difficulty: 'ARCADE',
      color: '#d82800',
      darkColor: '#5a1200',
      engine: window.PlumberGame,
      desc: 'Authentic 8-bit Mario-style side-scrolling platformer. Stomp Goombas, smash [?] question blocks for coins & stars, hop over warp pipes, and grab the castle flagpole!',
      controls: 'RUN: Left/Right • JUMP: A/Space • SPRINT: Hold B/Shift',
      manual: {
        story: 'Herman the Plumber must dash across the 8-bit Mushroom Kingdom to reclaim the Golden Coins and conquer the Castle Flagpole before time runs out!',
        howToPlay: [
          '<b>RUN</b>: Arrow Left/Right or A/D keys',
          '<b>JUMP</b>: Press A (Space / Z / Up) — hold longer for higher leaps',
          '<b>SPRINT / DASH</b>: Hold B (Shift / X) while running',
          'Hit <b>[?] blocks</b> from below for coins and Star power-ups'
        ],
        tips: 'Collect 100 coins for an extra life! Star power grants 10 seconds of invincibility!'
      }
    }
  ];

  let selectedCartIndex = 0;
  let activeCartridge = null;
  let frame = 0;

  /* ══ UNIVERSAL INPUT STATE ════════════════════════════════ */
  window.__held = { up: false, down: false, left: false, right: false, a: false, b: false };
  window.__aEdge = false;

  const keys = {};
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
    if (!keys[e.code]) {
      if (k === 'a' || (k === 'b' && window.Dialogue && window.Dialogue.active)) {
        window.__aEdge = true;
      }
    }
    keys[e.code] = true;
    window.__held[k] = true;
    Audio8.init();
  }, { passive: false });

  addEventListener('keyup', (e) => {
    const k = KEYMAP[e.code];
    if (!k) return;
    e.preventDefault();
    keys[e.code] = false;
    window.__held[k] = Object.keys(KEYMAP).some(code => KEYMAP[code] === k && keys[code]);
  }, { passive: false });

  addEventListener('blur', () => {
    for (const c in keys) keys[c] = false;
    for (const d in window.__held) window.__held[d] = false;
  });

  /* ══ TOUCH CONTROLS ════════════════════════════════════════ */
  function bindTouch() {
    const coarse = matchMedia('(hover: none), (pointer: coarse)').matches || 'ontouchstart' in window;
    if (coarse) document.body.classList.add('touch-on');
    addEventListener('touchstart', () => document.body.classList.add('touch-on'), { once: true, passive: true });

    const buzz = (ms) => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
    window.__buzz = buzz;

    const pad = document.querySelector('.dpad');
    const knob = document.querySelector('.dpad-center');
    const arrow = {};
    document.querySelectorAll('.dbtn').forEach(b => { arrow[b.dataset.dir] = b; });

    let padId = null, lastSig = '';

    function setDirs(u, d, l, r) {
      window.__held.up = u; window.__held.down = d; window.__held.left = l; window.__held.right = r;
      if (arrow.up) arrow.up.classList.toggle('held', u);
      if (arrow.down) arrow.down.classList.toggle('held', d);
      if (arrow.left) arrow.left.classList.toggle('held', l);
      if (arrow.right) arrow.right.classList.toggle('held', r);
      const sig = [u, d, l, r].join('');
      if (sig !== lastSig) {
        if (u || d || l || r) buzz(7);
        lastSig = sig;
      }
    }

    function knobTo(x, y) {
      if (knob) knob.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    }

    function track(e) {
      if (!pad) return;
      const r = pad.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);

      if (dist < r.width * 0.13) { setDirs(false, false, false, false); knobTo(0, 0); return; }

      const k = 0.383 * dist;
      setDirs(dy < -k, dy > k, dx < -k, dx > k);

      const reach = r.width * 0.17;
      const pull = Math.min(1, dist / (r.width * 0.42));
      knobTo((dx / dist) * reach * pull, (dy / dist) * reach * pull);
    }

    if (pad) {
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
    }

    document.querySelectorAll('.rbtn').forEach(btn => {
      const slot = btn.dataset.btn;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        Audio8.init();
        try { btn.setPointerCapture(e.pointerId); } catch (err) {}
        btn.classList.add('held');
        buzz(12);
        window.__held[slot] = true;
        if (slot === 'a' || (window.Dialogue && window.Dialogue.active)) window.__aEdge = true;
      });
      const off = (e) => {
        e.preventDefault();
        btn.classList.remove('held');
        window.__held[slot] = false;
      };
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointercancel', off);
    });

    cv.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      Audio8.init();
      window.__aEdge = true;
      if (activeCartridge && activeCartridge.engine && activeCartridge.engine.onAction) {
        activeCartridge.engine.onAction();
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (e.target.closest('.touch') || e.target === cv) e.preventDefault();
    }, { passive: false });
  }

  /* ══ CARTRIDGE SWITCHING ═══════════════════════════════════ */
  function loadCartridge(id) {
    const cart = CATALOG.find(c => c.id === id);
    if (!cart) return;

    if (activeCartridge && activeCartridge.engine && activeCartridge.engine.stop) {
      activeCartridge.engine.stop();
    }

    activeCartridge = cart;
    selectedCartIndex = CATALOG.indexOf(cart);

    Audio8.init();
    Audio8.sfx('cartridge');

    // Boot the cartridge
    cart.engine.start(g);

    // Update UI Elements
    updateCartridgeLabel(cart);
    updateManual(cart);
    updateGalleryActive(cart.id);
    refreshConsoleHUD();

    const consoleShell = document.querySelector('.console-shell');
    if (consoleShell) {
      consoleShell.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function ejectCartridge() {
    if (activeCartridge && activeCartridge.engine && activeCartridge.engine.stop) {
      activeCartridge.engine.stop();
    }
    activeCartridge = null;
    Audio8.sfx('cartridge');
    updateCartridgeLabel(null);
    refreshConsoleHUD();

    const rack = document.getElementById('cart-rack');
    if (rack) rack.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateCartridgeLabel(cart) {
    const titleEl = document.querySelector('.cart-title');
    const scrawlEl = document.querySelector('.cart-scrawl');

    if (!cart) {
      if (titleEl) {
        titleEl.innerHTML = `<h1>HERMANIFY<span class="cart-amp">8-BIT</span>ARCADE</h1><p class="cart-sub">SELECT A CARTRIDGE TO PLAY</p>`;
      }
      if (scrawlEl) scrawlEl.textContent = 'HERMANIFY ⏏';
      return;
    }

    if (titleEl) {
      titleEl.innerHTML = `<h1>${cart.title}<span class="cart-amp">★</span></h1><p class="cart-sub">${cart.subtitle}</p>`;
    }
    if (scrawlEl) {
      scrawlEl.textContent = cart.cartLabel + ' ♥';
    }
  }

  function updateManual(cart) {
    const manualTitle = document.getElementById('manual-game-title');
    const manualStory = document.getElementById('manual-story');
    const manualList = document.getElementById('manual-controls-list');
    const manualTips = document.getElementById('manual-tips');

    const c = cart || CATALOG[0];
    if (manualTitle) manualTitle.textContent = `${c.title} — INSTRUCTION BOOKLET`;
    if (manualStory) manualStory.innerHTML = `<p>${c.manual.story}</p>`;
    if (manualList) {
      manualList.innerHTML = c.manual.howToPlay.map(item => `<li>${item}</li>`).join('');
    }
    if (manualTips) {
      manualTips.innerHTML = `<p>${c.manual.tips}</p><p class="manual-tiny">&copy; ${c.year} HERMANIFY &middot; ALL RIGHTS RESERVED<br>DESIGNED FOR AUTHENTIC 8-BIT FUN</p>`;
    }
  }

  function updateGalleryActive(id) {
    document.querySelectorAll('.cart-card').forEach(card => {
      card.classList.toggle('active', card.dataset.id === id);
    });
  }

  /* ══ LAUNCHER MENU RENDERER ════════════════════════════════ */
  let launcherAnim = 0;

  function renderLauncher() {
    launcherAnim++;
    g.fillStyle = '#1c0e24';
    g.fillRect(0, 0, W, H);

    for (let y = 0; y < H; y += 8) {
      g.fillStyle = '#2c1539';
      g.fillRect(0, y, W, 1);
    }

    for (let i = 0; i < 20; i++) {
      const sx = (i * 37 + launcherAnim * 0.4) % W;
      const sy = (i * 53 + Math.sin(launcherAnim * 0.03 + i) * 12) % (H - 40);
      g.fillStyle = (i % 2 === 0 ? '#ff5fa2' : '#ffe04f');
      g.fillRect(sx, sy, 2, 2);
    }

    Dialogue.panel(g, 12, 14, W - 24, 48);
    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = '#ff5fa2';
    g.textAlign = 'center';
    g.fillText('HERMANIFY', W / 2, 24);

    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = '#ffe04f';
    g.fillText('8-BIT ENTERTAINMENT SYSTEM', W / 2, 40);
    g.fillStyle = '#ffffff';
    g.fillText('CHOOSE A GAME CARTRIDGE', W / 2, 52);

    const cart = CATALOG[selectedCartIndex];
    Dialogue.panel(g, 16, 70, W - 32, 100);

    g.fillStyle = cart.color;
    g.fillRect(20, 74, W - 40, 16);
    g.fillStyle = '#000000';
    g.font = '8px "Press Start 2P", monospace';
    g.fillText(cart.cartLabel, W / 2, 79);

    g.textAlign = 'left';
    g.fillStyle = '#ffe04f';
    g.font = '7px "Press Start 2P", monospace';
    g.fillText(`GENRE: ${cart.genre}`, 24, 98);
    g.fillText(`YEAR : ${cart.year}  ★  ${cart.difficulty}`, 24, 110);

    g.fillStyle = '#ffffff';
    const words = cart.desc.split(' ');
    let line = '', lineY = 126;
    for (let w = 0; w < words.length; w++) {
      const testLine = line + words[w] + ' ';
      if (testLine.length > 28) {
        g.fillText(line, 24, lineY);
        line = words[w] + ' ';
        lineY += 10;
        if (lineY > 156) break;
      } else {
        line = testLine;
      }
    }
    if (line && lineY <= 156) g.fillText(line, 24, lineY);

    g.textAlign = 'center';
    const pulse = Math.floor(launcherAnim / 20) % 2 === 0;
    if (pulse) {
      g.fillStyle = '#8fe3c8';
      g.fillText('◄ USE D-PAD / ARROWS ►', W / 2, 185);
      g.fillStyle = '#ff5fa2';
      g.fillText('PRESS A / SPACE TO PLAY', W / 2, 202);
    } else {
      g.fillStyle = '#ffffff';
      g.fillText('◄ USE D-PAD / ARROWS ►', W / 2, 185);
      g.fillStyle = '#ffe04f';
      g.fillText('PRESS A / SPACE TO PLAY', W / 2, 202);
    }

    if (window.__held.left && !window.__held._lastL) {
      selectedCartIndex = (selectedCartIndex - 1 + CATALOG.length) % CATALOG.length;
      Audio8.sfx('menu');
    }
    if (window.__held.right && !window.__held._lastR) {
      selectedCartIndex = (selectedCartIndex + 1) % CATALOG.length;
      Audio8.sfx('menu');
    }
    window.__held._lastL = window.__held.left;
    window.__held._lastR = window.__held.right;

    if (window.__aEdge) {
      window.__aEdge = false;
      loadCartridge(CATALOG[selectedCartIndex].id);
    }
  }

  /* ══ CONSOLE HUD SYNCHRONIZER ══════════════════════════════ */
  function refreshConsoleHUD() {
    const hudContainer = document.getElementById('hud');
    if (!hudContainer) return;

    if (!activeCartridge) {
      hudContainer.innerHTML = `
        <div class="hud-cell hud-cell--wide">
          <span class="hud-label">HERMANIFY CARTRIDGE RACK</span>
          <p class="hud-quest">Select a game below or press A to insert cartridge.</p>
          <span class="hud-place">CARTRIDGE SELECTION MODE</span>
        </div>
      `;
      return;
    }

    if (activeCartridge.id === 'isabela') {
      const st = window.IsabelaGame.state;
      hudContainer.innerHTML = `
        <div class="hud-cell">
          <span class="hud-label">HEARTS</span>
          <div class="hud-row" id="hud-hearts"></div>
          <span class="hud-count" id="hud-hearts-count">${String(st.hearts).padStart(2, '0')}/07</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">STARS</span>
          <div class="hud-row" id="hud-stars"></div>
          <span class="hud-count" id="hud-stars-count">${String(st.stars).padStart(2, '0')}/05</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">FLOWERS</span>
          <div class="hud-row" id="hud-flowers"></div>
          <span class="hud-count" id="hud-flowers-count">${String(st.flowers).padStart(2, '0')}/03</span>
        </div>
        <div class="hud-cell hud-cell--wide">
          <span class="hud-label">QUEST</span>
          <p class="hud-quest" id="hud-quest">${T(st.quest)}</p>
          <span class="hud-place" id="hud-place">${T(AREA_NAMES[st.area] || '')}</span>
        </div>
      `;
      buildIsabelaIcons();
    } else if (activeCartridge.id === 'fitway') {
      const h = window.FitwayGame.getHUD();
      hudContainer.innerHTML = `
        <div class="hud-cell">
          <span class="hud-label">TRAINER</span>
          <span class="hud-count">🏋️ ${h.char}</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">LOCATION</span>
          <span class="hud-count">📍 ${h.room}</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">EQUIPPED</span>
          <span class="hud-count">⚔️ ${h.equipped}</span>
        </div>
        <div class="hud-cell hud-cell--wide">
          <span class="hud-label">FITWAY GYM — BUILD 01</span>
          <p class="hud-quest">EXPLORE THE GYM &bull; MEET THE TRAINERS &bull; PROVE YOURSELF</p>
          <span class="hud-place">FLOOR 1: FITWAY RECEPTION &rarr; CARDIO</span>
        </div>
      `;
    } else if (activeCartridge.id === 'tank') {
      const h = window.TankGame.getHUD();
      hudContainer.innerHTML = `
        <div class="hud-cell">
          <span class="hud-label">SCORE</span>
          <span class="hud-count">${String(h.score).padStart(6, '0')}</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">ENEMIES LEFT</span>
          <span class="hud-count">🎯 ${h.enemies}</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">LIVES</span>
          <span class="hud-count">🛡️ x${h.lives}</span>
        </div>
        <div class="hud-cell hud-cell--wide">
          <span class="hud-label">MISSION</span>
          <p class="hud-quest">STAGE ${h.stage} — DEFEND THE HERMANIFY EAGLE HQ</p>
          <span class="hud-place">SECTOR BATTLE CITY</span>
        </div>
      `;
    } else if (activeCartridge.id === 'space') {
      const h = window.SpaceGame.getHUD();
      hudContainer.innerHTML = `
        <div class="hud-cell">
          <span class="hud-label">SCORE</span>
          <span class="hud-count">${String(h.score).padStart(6, '0')}</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">WAVE</span>
          <span class="hud-count">🌌 SECTOR ${h.wave}</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">SHIPS</span>
          <span class="hud-count">🚀 x${h.lives}</span>
        </div>
        <div class="hud-cell hud-cell--wide">
          <span class="hud-label">MISSION</span>
          <p class="hud-quest">DESTROY ALIEN INVADER FORMATIONS & MOTHERSHIP</p>
          <span class="hud-place">DEEP SPACE DEFENSE</span>
        </div>
      `;
    } else if (activeCartridge.id === 'plumber') {
      const h = window.PlumberGame.getHUD();
      hudContainer.innerHTML = `
        <div class="hud-cell">
          <span class="hud-label">MARIO SCORE</span>
          <span class="hud-count">${String(h.score).padStart(6, '0')}</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">COINS</span>
          <span class="hud-count">🪙 x${String(h.coins).padStart(2, '0')}</span>
        </div>
        <div class="hud-cell">
          <span class="hud-label">LIVES</span>
          <span class="hud-count">❤️ x${h.lives}</span>
        </div>
        <div class="hud-cell hud-cell--wide">
          <span class="hud-label">WORLD / TIME</span>
          <p class="hud-quest">WORLD ${h.world} • TIME ${h.time}s</p>
          <span class="hud-place">COURSE 1-1: CASTLE RUN</span>
        </div>
      `;
    }
  }

  function buildIsabelaIcons() {
    const st = window.IsabelaGame.state;
    [['hud-hearts', 'heart', st.hearts, 7], ['hud-stars', 'star', st.stars, 5], ['hud-flowers', 'flower', st.flowers, 3]].forEach(([rowId, icon, val, max]) => {
      const row = document.getElementById(rowId);
      if (!row) return;
      row.innerHTML = '';
      for (let i = 0; i < max; i++) {
        const c = document.createElement('canvas');
        c.width = 16; c.height = 16;
        const x = c.getContext('2d');
        x.imageSmoothingEnabled = false;
        x.drawImage(i < val ? ICONS[icon] : ICONS_DIM[icon], 0, 0, 8, 8, 0, 0, 16, 16);
        row.appendChild(c);
      }
    });
  }

  /* ══ MASTER GAME LOOP ══════════════════════════════════════ */
  function mainLoop() {
    frame++;

    if (activeCartridge && activeCartridge.engine) {
      activeCartridge.engine.update();
      activeCartridge.engine.render(g);
      if (frame % 30 === 0) refreshConsoleHUD();
    } else {
      renderLauncher();
    }

    window.__aEdge = false;
    requestAnimationFrame(mainLoop);
  }

  /* ══ BUTTONS & CONTROLS ════════════════════════════════════ */
  const soundBtn = document.getElementById('btn-sound');
  let shownStatus = 'blocked';

  function syncSound() {
    if (!soundBtn) return;
    const st = Audio8.status();
    soundBtn.innerHTML = st === 'running' ? '\u266A SOUND: ON'
                       : st === 'off'     ? '\u266A SOUND: OFF'
                                          : '\u266A TAP FOR SOUND';
    soundBtn.classList.toggle('pxbtn--warn', st === 'blocked');
    shownStatus = st;
  }

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      if (shownStatus === 'blocked') {
        Audio8.init();
        syncSound();
        return;
      }
      const on = !Audio8.on;
      Audio8.setEnabled(on);
      if (on) Audio8.init();
      syncSound();
    });
  }

  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (activeCartridge && activeCartridge.engine && activeCartridge.engine.reset) {
        activeCartridge.engine.reset();
        Audio8.sfx('start');
      }
    });
  }

  const ejectBtn = document.getElementById('btn-eject');
  if (ejectBtn) {
    ejectBtn.addEventListener('click', () => {
      ejectCartridge();
    });
  }

  const fsBtn = document.getElementById('btn-full');
  const shell = document.querySelector('.console-shell');

  function fsElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || null;
  }

  if (fsBtn && shell) {
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
          document.body.classList.toggle('fs-on');
          scrollTo(0, 0);
        }
      }
    });

    function syncFs() {
      const on = !fsElement();
      document.body.classList.toggle('fs-on', on);
      fsBtn.innerHTML = on ? '\u2716 EXIT FULL' : '\u26F6 FULLSCREEN';
    }
    document.addEventListener('fullscreenchange', syncFs);
    document.addEventListener('webkitfullscreenchange', syncFs);
  }

  function initCrtSwitcher() {
    const crtButtons = document.querySelectorAll('[data-crt-mode]');
    crtButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.crtMode;
        document.body.dataset.crt = mode;
        crtButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Audio8.sfx('select');
      });
    });
  }

  function initSoundboard() {
    document.querySelectorAll('[data-sfx]').forEach(btn => {
      btn.addEventListener('click', () => {
        Audio8.init();
        const sfxName = btn.dataset.sfx;
        Audio8.sfx(sfxName);
        btn.classList.add('pop');
        setTimeout(() => btn.classList.remove('pop'), 200);
      });
    });
  }

  function initCartridgeRack() {
    document.querySelectorAll('.btn-play-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cartId = btn.closest('.cart-card').dataset.id;
        loadCartridge(cartId);
      });
    });

    document.querySelectorAll('.cart-card').forEach(card => {
      card.addEventListener('click', () => {
        const cartId = card.dataset.id;
        loadCartridge(cartId);
      });
    });
  }

  function boot() {
    bindTouch();
    syncSound();
    initCrtSwitcher();
    initSoundboard();
    initCartridgeRack();

    // Default start with Isabela or Fitway
    loadCartridge('isabela');

    requestAnimationFrame(mainLoop);
  }

  window.Hermanify = {
    loadCartridge,
    ejectCartridge,
    get activeCartridge() { return activeCartridge; },
    get CATALOG() { return CATALOG; }
  };

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
