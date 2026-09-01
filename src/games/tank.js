/* ============================================================
   tank.js  --  Cyber Tank 1989: Hermanify Defense
   ------------------------------------------------------------
   8-Bit NES Battle City-style top-down tank combat.
   Features 4-way driving, destructible brick grids, enemy waves,
   Eagle Base protection, tank power-ups, and explosive chiptunes!
   ============================================================ */

window.TankGame = (() => {
  const W = 256, H = 224;
  const TILE = 16;
  const MAP_W = 14, MAP_H = 13;
  const OFFSET_X = 16, OFFSET_Y = 8;

  let g = null;
  let running = false;
  let score = 0, stage = 1, lives = 3;
  let enemyTotal = 16, enemiesRemaining = 16, enemiesAlive = [];
  let baseAlive = true, state = 'play'; // 'play' | 'win' | 'gameover'
  let frame = 0;

  let player = {
    x: 4 * TILE, y: 11 * TILE,
    dir: 'up', speed: 1.25,
    w: 14, h: 14,
    level: 1, shield: 120,
    bulletCooldown: 0,
    anim: 0
  };

  let bullets = [];
  let explosions = [];
  let powerups = [];
  let map = []; // 2D grid of 8x8 mini-tiles for fine brick destruction
  let steelFortressTimer = 0;

  function initStage(stg = 1) {
    stage = stg;
    state = 'play';
    baseAlive = true;
    bullets = [];
    explosions = [];
    powerups = [];
    enemiesAlive = [];
    enemyTotal = 12 + stage * 4;
    enemiesRemaining = enemyTotal;
    steelFortressTimer = 0;

    player.x = 4 * TILE + OFFSET_X;
    player.y = 11 * TILE + OFFSET_Y;
    player.dir = 'up';
    player.shield = 150;
    player.bulletCooldown = 0;

    buildMap();
    Audio8.music('tank');
  }

  function buildMap() {
    // 28 x 26 mini-tile grid (each mini-tile is 8x8 px)
    map = [];
    for (let y = 0; y < 26; y++) {
      map[y] = [];
      for (let x = 0; x < 28; x++) {
        map[y][x] = 0; // 0: Empty, 1: Brick, 2: Steel, 3: Water, 4: Bush, 9: Base
      }
    }

    // Default classic NES layout with brick mazes and steel blocks
    const brickPatterns = [
      // Top row mazes
      { x1: 2, y1: 2, x2: 4, y2: 8 },
      { x1: 6, y1: 2, x2: 8, y2: 8 },
      { x1: 12, y1: 2, x2: 15, y2: 6 },
      { x1: 19, y1: 2, x2: 21, y2: 8 },
      { x1: 23, y1: 2, x2: 25, y2: 8 },

      // Mid lane
      { x1: 2, y1: 11, x2: 6, y2: 13 },
      { x1: 9, y1: 9, x2: 11, y2: 17 },
      { x1: 16, y1: 9, x2: 18, y2: 17 },
      { x1: 21, y1: 11, x2: 25, y2: 13 },

      // Bottom defense
      { x1: 4, y1: 16, x2: 6, y2: 22 },
      { x1: 21, y1: 16, x2: 23, y2: 22 },
      { x1: 9, y1: 20, x2: 11, y2: 23 },
      { x1: 16, y1: 20, x2: 18, y2: 23 },
    ];

    brickPatterns.forEach(p => {
      for (let y = p.y1; y <= p.y2; y++) {
        for (let x = p.x1; x <= p.x2; x++) {
          map[y][x] = 1;
        }
      }
    });

    // Steel Blocks
    map[13][13] = 2; map[13][14] = 2;
    map[5][13] = 2;  map[5][14] = 2;

    // Water & Bush
    for (let y = 14; y <= 15; y++) {
      for (let x = 0; x <= 2; x++) map[y][x] = 3;
      for (let x = 25; x <= 27; x++) map[y][x] = 3;
    }

    // Bushes
    for (let y = 7; y <= 8; y++) {
      for (let x = 12; x <= 15; x++) map[y][x] = 4;
    }

    // Eagle Base at (13, 24) surrounded by bricks
    setBaseProtection(1);
    map[24][13] = 9; map[24][14] = 9;
    map[25][13] = 9; map[25][14] = 9;
  }

  function setBaseProtection(type) {
    // 1: Brick, 2: Steel
    const coords = [
      [23, 12], [23, 13], [23, 14], [23, 15],
      [24, 12], [24, 15],
      [25, 12], [25, 15]
    ];
    coords.forEach(([y, x]) => {
      if (map[y] && map[y][x] !== 9) map[y][x] = type;
    });
  }

  function spawnEnemy() {
    if (enemiesRemaining <= 0 || enemiesAlive.length >= 4) return;
    const spawnPoints = [
      { x: OFFSET_X + 8, y: OFFSET_Y + 8 },
      { x: OFFSET_X + 13 * 8, y: OFFSET_Y + 8 },
      { x: OFFSET_X + 25 * 8, y: OFFSET_Y + 8 }
    ];
    const pt = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

    // Tank types: 0: basic, 1: fast, 2: heavy armor
    const r = Math.random();
    const type = r < 0.5 ? 'basic' : (r < 0.8 ? 'fast' : 'heavy');
    const isFlashing = Math.random() < 0.25;

    enemiesAlive.push({
      x: pt.x, y: pt.y,
      dir: 'down',
      speed: type === 'fast' ? 1.6 : (type === 'heavy' ? 0.8 : 1.0),
      w: 14, h: 14,
      hp: type === 'heavy' ? 3 : 1,
      type,
      isFlashing,
      dirTimer: 30 + Math.floor(Math.random() * 60),
      shootTimer: 20 + Math.floor(Math.random() * 50),
      anim: 0
    });

    enemiesRemaining--;
  }

  function update() {
    frame++;

    if (steelFortressTimer > 0) {
      steelFortressTimer--;
      if (steelFortressTimer === 0) setBaseProtection(1);
    }

    if (state !== 'play') return;

    // Enemy spawn ticker
    if (frame % 120 === 0) spawnEnemy();

    // Read Input
    const held = window.__held || {};
    const aEdge = window.__aEdge || false;

    // Player Tank Driving
    let moving = false;
    let dx = 0, dy = 0;
    if (held.up) { player.dir = 'up'; dy = -player.speed; moving = true; }
    else if (held.down) { player.dir = 'down'; dy = player.speed; moving = true; }
    else if (held.left) { player.dir = 'left'; dx = -player.speed; moving = true; }
    else if (held.right) { player.dir = 'right'; dx = player.speed; moving = true; }

    if (moving) {
      player.anim++;
      const nextX = player.x + dx;
      const nextY = player.y + dy;
      if (!isTankColliding(nextX, nextY, player)) {
        player.x = nextX;
        player.y = nextY;
      }
    }

    if (player.shield > 0) player.shield--;
    if (player.bulletCooldown > 0) player.bulletCooldown--;

    // Shoot Bullet
    if ((held.a || aEdge) && player.bulletCooldown <= 0) {
      player.bulletCooldown = player.level >= 2 ? 14 : 22;
      fireBullet(player, true);
    }

    // Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      // Check map collision (8x8 mini tiles)
      const hitMap = checkBulletMap(b);
      if (hitMap || b.x < OFFSET_X || b.x > OFFSET_X + 224 || b.y < OFFSET_Y || b.y > OFFSET_Y + 208) {
        bullets.splice(i, 1);
        continue;
      }

      // Check bullet against tanks
      if (b.isPlayer) {
        // Hit enemy tank
        for (let j = enemiesAlive.length - 1; j >= 0; j--) {
          const e = enemiesAlive[j];
          if (boxOverlap(b.x - 2, b.y - 2, 4, 4, e.x, e.y, e.w, e.h)) {
            bullets.splice(i, 1);
            e.hp--;
            if (e.hp <= 0) {
              // Enemy destroyed!
              if (e.isFlashing) spawnPowerup(e.x, e.y);
              createExplosion(e.x, e.y, 16);
              Audio8.sfx('boom');
              score += (e.type === 'heavy' ? 400 : (e.type === 'fast' ? 200 : 100));
              enemiesAlive.splice(j, 1);

              if (enemiesRemaining === 0 && enemiesAlive.length === 0) {
                state = 'win';
                Audio8.sfx('stage_clear');
              }
            } else {
              Audio8.sfx('hit');
            }
            break;
          }
        }
      } else {
        // Hit player tank
        if (boxOverlap(b.x - 2, b.y - 2, 4, 4, player.x, player.y, player.w, player.h)) {
          bullets.splice(i, 1);
          if (player.shield <= 0) {
            createExplosion(player.x, player.y, 20);
            Audio8.sfx('explosion');
            lives--;
            if (lives > 0) {
              player.x = 4 * TILE + OFFSET_X;
              player.y = 11 * TILE + OFFSET_Y;
              player.dir = 'up';
              player.shield = 150;
            } else {
              state = 'gameover';
              Audio8.sfx('game_over');
            }
          }
        }
      }
    }

    // Update Enemies
    enemiesAlive.forEach(e => {
      e.dirTimer--;
      if (e.dirTimer <= 0) {
        // Pick new direction towards player / base
        const dirs = ['up', 'down', 'left', 'right', 'down'];
        e.dir = dirs[Math.floor(Math.random() * dirs.length)];
        e.dirTimer = 40 + Math.floor(Math.random() * 70);
      }

      let edx = 0, edy = 0;
      if (e.dir === 'up') edy = -e.speed;
      else if (e.dir === 'down') edy = e.speed;
      else if (e.dir === 'left') edx = -e.speed;
      else if (e.dir === 'right') edx = e.speed;

      const nextX = e.x + edx;
      const nextY = e.y + edy;
      if (!isTankColliding(nextX, nextY, e)) {
        e.x = nextX;
        e.y = nextY;
      } else {
        e.dirTimer = 0; // Switch dir if blocked
      }

      e.shootTimer--;
      if (e.shootTimer <= 0) {
        e.shootTimer = 45 + Math.floor(Math.random() * 50);
        fireBullet(e, false);
      }
    });

    // Check Powerup Pickups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      if (boxOverlap(player.x, player.y, player.w, player.h, p.x, p.y, 14, 14)) {
        applyPowerup(p.type);
        powerups.splice(i, 1);
      }
    }

    // Update Explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].frame++;
      if (explosions[i].frame >= explosions[i].maxFrames) {
        explosions.splice(i, 1);
      }
    }
  }

  function fireBullet(t, isPlayer) {
    const spd = isPlayer ? (player.level >= 2 ? 4.5 : 3.5) : 2.6;
    let bx = t.x + 6, by = t.y + 6;
    let vx = 0, vy = 0;

    if (t.dir === 'up') { by = t.y - 2; vy = -spd; }
    else if (t.dir === 'down') { by = t.y + t.h + 2; vy = spd; }
    else if (t.dir === 'left') { bx = t.x - 2; vx = -spd; }
    else if (t.dir === 'right') { bx = t.x + t.w + 2; vx = spd; }

    bullets.push({ x: bx, y: by, vx, vy, isPlayer });
    Audio8.sfx(isPlayer ? 'shoot' : 'blip');
  }

  function checkBulletMap(b) {
    const gx = Math.floor((b.x - OFFSET_X) / 8);
    const gy = Math.floor((b.y - OFFSET_Y) / 8);

    if (gy >= 0 && gy < 26 && gx >= 0 && gx < 28) {
      const tile = map[gy][gx];
      if (tile === 1) { // Brick
        map[gy][gx] = 0; // Destroy brick
        createExplosion(b.x - 4, b.y - 4, 8);
        return true;
      } else if (tile === 2) { // Steel
        createExplosion(b.x - 4, b.y - 4, 6);
        Audio8.sfx('bump');
        return true;
      } else if (tile === 9) { // Eagle Base
        baseAlive = false;
        map[gy][gx] = 0;
        createExplosion(b.x - 10, b.y - 10, 32);
        Audio8.sfx('explosion');
        state = 'gameover';
        Audio8.sfx('game_over');
        return true;
      }
    }
    return false;
  }

  function isTankColliding(x, y, tank) {
    // Screen bounds
    if (x < OFFSET_X || x + tank.w > OFFSET_X + 224 || y < OFFSET_Y || y + tank.h > OFFSET_Y + 208) {
      return true;
    }

    // Grid collision
    const gx1 = Math.floor((x - OFFSET_X) / 8);
    const gx2 = Math.floor((x + tank.w - 1 - OFFSET_X) / 8);
    const gy1 = Math.floor((y - OFFSET_Y) / 8);
    const gy2 = Math.floor((y + tank.h - 1 - OFFSET_Y) / 8);

    for (let gy = gy1; gy <= gy2; gy++) {
      for (let gx = gx1; gx <= gx2; gx++) {
        if (gy >= 0 && gy < 26 && gx >= 0 && gx < 28) {
          const t = map[gy][gx];
          if (t === 1 || t === 2 || t === 3 || t === 9) return true; // Brick, Steel, Water, Base are solid
        }
      }
    }
    return false;
  }

  function spawnPowerup(x, y) {
    const types = ['star', 'helmet', 'shovel', 'grenade'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerups.push({ x, y, type, frame: 0 });
    Audio8.sfx('powerup');
  }

  function applyPowerup(type) {
    Audio8.sfx('powerup');
    score += 500;
    if (type === 'star') {
      player.level = Math.min(3, player.level + 1);
    } else if (type === 'helmet') {
      player.shield = 400;
    } else if (type === 'shovel') {
      setBaseProtection(2);
      steelFortressTimer = 600; // 10 seconds of steel wall
    } else if (type === 'grenade') {
      enemiesAlive.forEach(e => {
        createExplosion(e.x, e.y, 20);
        score += 200;
      });
      enemiesAlive = [];
      Audio8.sfx('explosion');
      if (enemiesRemaining === 0) {
        state = 'win';
        Audio8.sfx('stage_clear');
      }
    }
  }

  function createExplosion(x, y, size) {
    explosions.push({ x, y, size, frame: 0, maxFrames: 14 });
  }

  function boxOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /* ══ RENDERING ════════════════════════════════════════════ */
  function render() {
    if (!g) return;

    // Dark Arcade NES background
    g.fillStyle = '#000000';
    g.fillRect(0, 0, W, H);

    // Playfield border
    g.fillStyle = '#636363';
    g.fillRect(0, 0, OFFSET_X, H);
    g.fillRect(OFFSET_X + 224, 0, W - (OFFSET_X + 224), H);

    // Right Side Info Panel
    drawSidePanel();

    // Map Grid
    for (let y = 0; y < 26; y++) {
      for (let x = 0; x < 28; x++) {
        const tile = map[y][x];
        const px = OFFSET_X + x * 8;
        const py = OFFSET_Y + y * 8;

        if (tile === 1) { // Brick
          g.fillStyle = '#b84418';
          g.fillRect(px, py, 8, 8);
          g.fillStyle = '#000000';
          g.fillRect(px, py + 3, 8, 1);
          g.fillRect(px + 3, py, 1, 3);
          g.fillRect(px + 7, py + 4, 1, 4);
        } else if (tile === 2) { // Steel
          g.fillStyle = '#cccccc';
          g.fillRect(px, py, 8, 8);
          g.fillStyle = '#ffffff';
          g.fillRect(px, py, 7, 1);
          g.fillRect(px, py, 1, 7);
          g.fillStyle = '#666666';
          g.fillRect(px + 7, py, 1, 8);
          g.fillRect(px, py + 7, 8, 1);
        } else if (tile === 3) { // Water
          g.fillStyle = '#0080ff';
          g.fillRect(px, py, 8, 8);
          g.fillStyle = '#ffffff';
          if ((frame + x + y) % 12 < 6) g.fillRect(px + 2, py + 3, 4, 1);
        } else if (tile === 9) { // Base Eagle
          drawEagleBase(px, py);
        }
      }
    }

    // Powerups
    powerups.forEach(p => {
      drawPowerupIcon(p);
    });

    // Enemies
    enemiesAlive.forEach(e => {
      drawTank(e, false);
    });

    // Player Tank
    drawTank(player, true);

    // Bushes (drawn above tanks for camouflage effect!)
    for (let y = 0; y < 26; y++) {
      for (let x = 0; x < 28; x++) {
        if (map[y][x] === 4) {
          const px = OFFSET_X + x * 8;
          const py = OFFSET_Y + y * 8;
          g.fillStyle = '#00a800';
          g.fillRect(px, py, 8, 8);
          g.fillStyle = '#80d010';
          g.fillRect(px + 1, py + 1, 2, 2);
          g.fillRect(px + 5, py + 4, 2, 2);
        }
      }
    }

    // Bullets
    g.fillStyle = '#ffe04f';
    bullets.forEach(b => {
      g.fillRect(b.x - 1, b.y - 1, 3, 3);
    });

    // Explosions
    explosions.forEach(exp => {
      const k = exp.frame / exp.maxFrames;
      const r = exp.size * (0.5 + 0.5 * Math.sin(k * Math.PI));
      g.fillStyle = (exp.frame % 4 < 2 ? '#ff5fa2' : '#ffe04f');
      g.beginPath();
      g.arc(exp.x + 7, exp.y + 7, r / 2, 0, Math.PI * 2);
      g.fill();
    });

    // Overlays (Win / Game Over)
    if (state === 'win') {
      g.fillStyle = 'rgba(0,0,0,0.7)';
      g.fillRect(32, 60, W - 64, 90);
      g.strokeStyle = '#ffe04f';
      g.strokeRect(32, 60, W - 64, 90);
      g.font = '10px "Press Start 2P", monospace';
      g.fillStyle = '#ffe04f';
      g.textAlign = 'center';
      g.fillText('STAGE CLEAR!', W / 2, 90);
      g.fillStyle = '#8fe3c8';
      g.font = '8px "Press Start 2P", monospace';
      g.fillText(`SCORE: ${score}`, W / 2, 115);
      g.fillText('PRESS A FOR NEXT WAVE', W / 2, 135);
      g.textAlign = 'left';
    } else if (state === 'gameover') {
      g.fillStyle = 'rgba(0,0,0,0.8)';
      g.fillRect(32, 60, W - 64, 90);
      g.font = '12px "Press Start 2P", monospace';
      g.fillStyle = '#ff5fa2';
      g.textAlign = 'center';
      g.fillText('GAME OVER', W / 2, 95);
      g.fillStyle = '#ffffff';
      g.font = '8px "Press Start 2P", monospace';
      g.fillText('PRESS A TO RETRY', W / 2, 125);
      g.textAlign = 'left';
    }
  }

  function drawTank(t, isPlayer) {
    const tx = t.x, ty = t.y;
    let bodyCol = isPlayer ? '#ffd2b8' : (t.type === 'heavy' ? '#8fe3c8' : (t.type === 'fast' ? '#cdb4ff' : '#ffffff'));
    if (!isPlayer && t.isFlashing && frame % 6 < 3) bodyCol = '#ff5fa2';

    // Tank Body
    g.fillStyle = bodyCol;
    g.fillRect(tx + 2, ty + 2, 10, 10);

    // Treads
    g.fillStyle = isPlayer ? '#d3216b' : '#333333';
    if (t.dir === 'up' || t.dir === 'down') {
      g.fillRect(tx, ty, 3, 14);
      g.fillRect(tx + 11, ty, 3, 14);
    } else {
      g.fillRect(tx, ty, 14, 3);
      g.fillRect(tx, ty + 11, 14, 3);
    }

    // Cannon Turret
    g.fillStyle = '#000000';
    g.fillRect(tx + 5, ty + 5, 4, 4);

    // Cannon Barrel
    g.fillStyle = isPlayer ? '#7a0f42' : '#ffffff';
    if (t.dir === 'up') g.fillRect(tx + 6, ty - 3, 2, 8);
    else if (t.dir === 'down') g.fillRect(tx + 6, ty + 9, 2, 8);
    else if (t.dir === 'left') g.fillRect(tx - 3, ty + 6, 8, 2);
    else if (t.dir === 'right') g.fillRect(tx + 9, ty + 6, 8, 2);

    // Shield Halo
    if (isPlayer && t.shield > 0) {
      g.strokeStyle = (frame % 4 < 2 ? '#ffe04f' : '#8fe3c8');
      g.lineWidth = 1;
      g.strokeRect(tx - 2, ty - 2, 18, 18);
    }
  }

  function drawEagleBase(px, py) {
    if (baseAlive) {
      // Golden Eagle Crest
      g.fillStyle = '#ffe04f';
      g.fillRect(px + 2, py + 2, 12, 12);
      g.fillStyle = '#d3216b';
      g.fillRect(px + 4, py + 4, 8, 8);
      g.fillStyle = '#ffffff';
      g.fillRect(px + 6, py + 6, 4, 4);
    } else {
      // Destroyed Base
      g.fillStyle = '#333333';
      g.fillRect(px, py, 16, 16);
      g.fillStyle = '#ff5fa2';
      g.fillRect(px + 4, py + 4, 8, 8);
    }
  }

  function drawPowerupIcon(p) {
    g.fillStyle = '#ffe04f';
    g.fillRect(p.x, p.y, 14, 14);
    g.fillStyle = '#d3216b';
    g.font = '8px "Press Start 2P", monospace';
    g.fillText(p.type[0].toUpperCase(), p.x + 3, p.y + 3);
  }

  function drawSidePanel() {
    const rx = OFFSET_X + 224 + 2;
    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = '#ffffff';

    // Enemy Icons left
    g.fillText('ENEMIES', rx, 20);
    const count = enemiesRemaining + enemiesAlive.length;
    for (let i = 0; i < count; i++) {
      const ex = rx + (i % 2) * 6;
      const ey = 30 + Math.floor(i / 2) * 8;
      g.fillStyle = '#000000';
      g.fillRect(ex, ey, 5, 5);
      g.fillStyle = '#ff5fa2';
      g.fillRect(ex + 1, ey + 1, 3, 3);
    }

    // IP (Player Lives)
    g.fillStyle = '#ffffff';
    g.fillText('1P', rx, 140);
    g.fillText(`x${lives}`, rx, 152);

    // FLAG (Stage)
    g.fillText('FLAG', rx, 175);
    g.fillText(`${stage}`, rx, 187);
  }

  /* ══ PUBLIC INTERFACE ═════════════════════════════════════ */
  function start(ctx) {
    g = ctx;
    running = true;
    score = 0;
    lives = 3;
    initStage(1);
  }

  function stop() {
    running = false;
    Audio8.stop();
  }

  function reset() {
    lives = 3;
    score = 0;
    initStage(1);
  }

  function onAction() {
    if (state === 'win') {
      initStage(stage + 1);
    } else if (state === 'gameover') {
      reset();
    }
  }

  return {
    start,
    stop,
    reset,
    update,
    render,
    onAction,
    getHUD: () => ({
      title: "CYBER TANK 1989",
      score,
      stage,
      lives,
      enemies: enemiesRemaining + enemiesAlive.length
    })
  };
})();
