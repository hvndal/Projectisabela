/* ============================================================
   space.js  --  Star Guardian 8-Bit (Galaga / Space Invaders)
   ------------------------------------------------------------
   Classic NES vertical space arcade shooter.
   Features 3-layer parallax starfield, alien dive-bomb attacks,
   mothership boss, power-ups, lasers, and high-energy chiptune!
   ============================================================ */

window.SpaceGame = (() => {
  const W = 256, H = 224;

  let g = null;
  let running = false;
  let score = 0, wave = 1, lives = 3;
  let state = 'play'; // 'play' | 'boss' | 'win' | 'gameover'
  let frame = 0;

  let player = {
    x: W / 2 - 8, y: H - 32,
    vx: 0, speed: 2.6,
    w: 16, h: 16,
    weaponLevel: 1,
    shield: 0,
    shootCooldown: 0,
    invul: 90
  };

  let stars = [];
  let bullets = [];
  let enemyBullets = [];
  let enemies = [];
  let powerups = [];
  let explosions = [];
  let boss = null;

  function initWave(w = 1) {
    wave = w;
    state = (wave % 3 === 0 ? 'boss' : 'play');
    bullets = [];
    enemyBullets = [];
    enemies = [];
    powerups = [];
    explosions = [];

    player.x = W / 2 - 8;
    player.y = H - 32;
    player.invul = 90;

    if (state === 'boss') {
      spawnBoss();
    } else {
      spawnAlienFormation();
    }

    Audio8.music('space');
  }

  function initStarfield() {
    stars = [];
    for (let i = 0; i < 48; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        spd: 0.3 + Math.random() * 1.4,
        size: Math.random() < 0.3 ? 2 : 1,
        col: Math.random() < 0.5 ? '#ffffff' : (Math.random() < 0.5 ? '#ffe3f0' : '#8fe3c8')
      });
    }
  }

  function spawnAlienFormation() {
    const rows = 4;
    const cols = 8;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const type = (r === 0 ? 'commander' : (r < 2 ? 'beetle' : 'drone'));
        enemies.push({
          homeX: 32 + c * 24,
          homeY: 28 + r * 18,
          x: 32 + c * 24,
          y: -20 - (r * 20 + c * 10),
          w: 14, h: 12,
          type,
          hp: type === 'commander' ? 2 : 1,
          mode: 'enter', // 'enter' | 'grid' | 'dive'
          angle: 0,
          diveTimer: 60 + Math.floor(Math.random() * 200),
          anim: 0
        });
      }
    }
  }

  function spawnBoss() {
    boss = {
      x: W / 2 - 32, y: -50,
      targetY: 30,
      w: 64, h: 36,
      hp: 30 + wave * 10,
      maxHp: 30 + wave * 10,
      vx: 1.5,
      shootTimer: 40,
      anim: 0
    };
  }

  function update() {
    frame++;

    // Scroll Starfield
    stars.forEach(s => {
      s.y += s.spd;
      if (s.y > H) {
        s.y = 0;
        s.x = Math.random() * W;
      }
    });

    // Read Input
    const held = window.__held || {};
    const aEdge = window.__aEdge || false;

    if (state === 'gameover' || state === 'win') return;

    // Player Movement
    if (held.left) player.x = Math.max(8, player.x - player.speed);
    if (held.right) player.x = Math.min(W - 24, player.x + player.speed);
    if (held.up) player.y = Math.max(H / 2, player.y - player.speed);
    if (held.down) player.y = Math.min(H - 24, player.y + player.speed);

    if (player.invul > 0) player.invul--;
    if (player.shootCooldown > 0) player.shootCooldown--;

    // Shoot
    if ((held.a || aEdge || held.b) && player.shootCooldown <= 0) {
      player.shootCooldown = 10;
      Audio8.sfx('laser');

      if (player.weaponLevel === 1) {
        bullets.push({ x: player.x + 7, y: player.y - 4, vx: 0, vy: -5.5 });
      } else if (player.weaponLevel === 2) {
        bullets.push({ x: player.x + 3, y: player.y - 4, vx: 0, vy: -5.5 });
        bullets.push({ x: player.x + 11, y: player.y - 4, vx: 0, vy: -5.5 });
      } else {
        bullets.push({ x: player.x + 7, y: player.y - 4, vx: 0, vy: -5.5 });
        bullets.push({ x: player.x + 2, y: player.y - 4, vx: -1.2, vy: -5.0 });
        bullets.push({ x: player.x + 12, y: player.y - 4, vx: 1.2, vy: -5.0 });
      }
    }

    // Player Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      if (b.y < -8) { bullets.splice(i, 1); continue; }

      // Check Boss Hit
      if (boss && state === 'boss') {
        if (boxOverlap(b.x, b.y, 3, 6, boss.x, boss.y, boss.w, boss.h)) {
          bullets.splice(i, 1);
          boss.hp--;
          createExplosion(b.x, b.y, 8);
          Audio8.sfx('hit');
          score += 50;

          if (boss.hp <= 0) {
            createExplosion(boss.x + 32, boss.y + 18, 48);
            Audio8.sfx('explosion');
            score += 5000;
            boss = null;
            state = 'win';
            Audio8.sfx('stage_clear');
          }
          continue;
        }
      }

      // Check Normal Enemy Hits
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (boxOverlap(b.x, b.y, 3, 6, e.x, e.y, e.w, e.h)) {
          bullets.splice(i, 1);
          e.hp--;
          if (e.hp <= 0) {
            createExplosion(e.x + 7, e.y + 6, 16);
            Audio8.sfx('boom');
            score += (e.type === 'commander' ? 300 : (e.type === 'beetle' ? 150 : 80));

            // Chance of powerup
            if (Math.random() < 0.15) {
              powerups.push({ x: e.x, y: e.y, type: Math.random() < 0.5 ? 'weapon' : 'shield', vy: 1.2 });
            }

            enemies.splice(j, 1);

            if (enemies.length === 0) {
              state = 'win';
              Audio8.sfx('stage_clear');
            }
          } else {
            Audio8.sfx('hit');
          }
          break;
        }
      }
    }

    // Enemy Bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const eb = enemyBullets[i];
      eb.x += eb.vx;
      eb.y += eb.vy;
      if (eb.y > H + 8) { enemyBullets.splice(i, 1); continue; }

      // Hit Player
      if (boxOverlap(eb.x, eb.y, 3, 6, player.x + 2, player.y + 2, player.w - 4, player.h - 4)) {
        enemyBullets.splice(i, 1);
        if (player.invul <= 0) {
          if (player.shield > 0) {
            player.shield--;
            Audio8.sfx('hit');
          } else {
            createExplosion(player.x + 8, player.y + 8, 24);
            Audio8.sfx('die');
            lives--;
            if (lives > 0) {
              player.x = W / 2 - 8;
              player.y = H - 32;
              player.invul = 100;
              player.weaponLevel = Math.max(1, player.weaponLevel - 1);
            } else {
              state = 'gameover';
              Audio8.sfx('game_over');
            }
          }
        }
      }
    }

    // Update Boss
    if (boss && state === 'boss') {
      if (boss.y < boss.targetY) boss.y += 1;
      boss.x += boss.vx;
      if (boss.x < 16 || boss.x > W - boss.w - 16) boss.vx *= -1;

      boss.shootTimer--;
      if (boss.shootTimer <= 0) {
        boss.shootTimer = 30;
        enemyBullets.push({ x: boss.x + 12, y: boss.y + boss.h, vx: -0.8, vy: 2.8 });
        enemyBullets.push({ x: boss.x + boss.w - 12, y: boss.y + boss.h, vx: 0.8, vy: 2.8 });
        Audio8.sfx('blip');
      }
    }

    // Update Enemies
    const sway = Math.sin(frame * 0.04) * 20;
    enemies.forEach(e => {
      if (e.mode === 'enter') {
        e.y += 2.5;
        if (e.y >= e.homeY) {
          e.y = e.homeY;
          e.mode = 'grid';
        }
      } else if (e.mode === 'grid') {
        e.x = e.homeX + sway;
        e.diveTimer--;
        if (e.diveTimer <= 0) {
          e.mode = 'dive';
          e.diveAngle = Math.atan2(player.y - e.y, player.x - e.x);
        }
      } else if (e.mode === 'dive') {
        e.x += Math.cos(e.diveAngle) * 2.4;
        e.y += 2.6;

        // Enemy shoot during dive
        if (Math.random() < 0.02 && enemyBullets.length < 6) {
          enemyBullets.push({ x: e.x + 7, y: e.y + 12, vx: 0, vy: 3.2 });
        }

        if (e.y > H + 16) {
          e.y = -16;
          e.mode = 'enter';
          e.diveTimer = 80 + Math.floor(Math.random() * 150);
        }
      }
    });

    // Update Powerups
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      p.y += p.vy;
      if (p.y > H) { powerups.splice(i, 1); continue; }

      if (boxOverlap(player.x, player.y, player.w, player.h, p.x, p.y, 12, 12)) {
        Audio8.sfx('powerup');
        score += 300;
        if (p.type === 'weapon') player.weaponLevel = Math.min(3, player.weaponLevel + 1);
        if (p.type === 'shield') player.shield = Math.min(3, player.shield + 1);
        powerups.splice(i, 1);
      }
    }

    // Update Explosions
    for (let i = explosions.length - 1; i >= 0; i--) {
      explosions[i].frame++;
      if (explosions[i].frame >= explosions[i].max) explosions.splice(i, 1);
    }
  }

  function createExplosion(x, y, size) {
    explosions.push({ x, y, size, frame: 0, max: 14 });
  }

  function boxOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /* ══ RENDERING ════════════════════════════════════════════ */
  function render() {
    if (!g) return;

    // Deep Space Background
    g.fillStyle = '#05030a';
    g.fillRect(0, 0, W, H);

    // Stars
    stars.forEach(s => {
      g.fillStyle = s.col;
      g.fillRect(s.x, s.y, s.size, s.size);
    });

    // Powerups
    powerups.forEach(p => {
      g.fillStyle = p.type === 'weapon' ? '#ffe04f' : '#8fe3c8';
      g.fillRect(p.x, p.y, 12, 12);
      g.fillStyle = '#000000';
      g.font = '8px "Press Start 2P", monospace';
      g.fillText(p.type === 'weapon' ? 'P' : 'S', p.x + 2, p.y + 2);
    });

    // Bullets
    g.fillStyle = '#ff5fa2';
    bullets.forEach(b => {
      g.fillRect(b.x, b.y, 2, 6);
      g.fillStyle = '#ffffff';
      g.fillRect(b.x, b.y + 1, 2, 2);
    });

    // Enemy Bullets
    g.fillStyle = '#ffe04f';
    enemyBullets.forEach(eb => {
      g.fillRect(eb.x, eb.y, 2, 4);
    });

    // Enemies
    enemies.forEach(e => {
      drawEnemy(e);
    });

    // Boss
    if (boss && state === 'boss') {
      drawBoss();
    }

    // Player Ship
    drawPlayer();

    // Explosions
    explosions.forEach(exp => {
      const k = exp.frame / exp.max;
      const r = exp.size * (0.5 + 0.5 * Math.sin(k * Math.PI));
      g.fillStyle = exp.frame % 4 < 2 ? '#ff5fa2' : '#ffe04f';
      g.beginPath();
      g.arc(exp.x, exp.y, r / 2, 0, Math.PI * 2);
      g.fill();
    });

    // HUD Top Banner
    drawTopHUD();

    // Win / Game Over
    if (state === 'win') {
      g.fillStyle = 'rgba(0,0,0,0.75)';
      g.fillRect(32, 65, W - 64, 85);
      g.strokeStyle = '#8fe3c8';
      g.strokeRect(32, 65, W - 64, 85);
      g.font = '10px "Press Start 2P", monospace';
      g.fillStyle = '#8fe3c8';
      g.textAlign = 'center';
      g.fillText('SECTOR SECURED!', W / 2, 90);
      g.fillStyle = '#ffe04f';
      g.font = '8px "Press Start 2P", monospace';
      g.fillText(`SCORE: ${score}`, W / 2, 115);
      g.fillText('PRESS A FOR NEXT WAVE', W / 2, 135);
      g.textAlign = 'left';
    } else if (state === 'gameover') {
      g.fillStyle = 'rgba(0,0,0,0.85)';
      g.fillRect(32, 65, W - 64, 85);
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

  function drawPlayer() {
    if (player.invul > 0 && Math.floor(frame / 3) % 2 === 0) return;

    const px = player.x, py = player.y;

    // Ship Hull
    g.fillStyle = '#ffffff';
    g.fillRect(px + 6, py, 4, 14);
    g.fillStyle = '#ff5fa2';
    g.fillRect(px + 2, py + 8, 12, 6);
    g.fillStyle = '#8fe3c8';
    g.fillRect(px, py + 12, 16, 4);

    // Thrust Flame
    if (frame % 4 < 2) {
      g.fillStyle = '#ffe04f';
      g.fillRect(px + 6, py + 16, 4, 5);
    }

    // Shield Bubble
    if (player.shield > 0) {
      g.strokeStyle = '#8fe3c8';
      g.beginPath();
      g.arc(px + 8, py + 8, 13, 0, Math.PI * 2);
      g.stroke();
    }
  }

  function drawEnemy(e) {
    const ex = e.x, ey = e.y;
    let mainCol = e.type === 'commander' ? '#ffe04f' : (e.type === 'beetle' ? '#ff5fa2' : '#8fe3c8');

    g.fillStyle = mainCol;
    g.fillRect(ex + 3, ey + 2, 8, 6);
    g.fillRect(ex, ey + 4, 14, 4);
    // Wings / Eyes
    g.fillStyle = '#ffffff';
    g.fillRect(ex + 4, ey + 4, 2, 2);
    g.fillRect(ex + 8, ey + 4, 2, 2);
    g.fillStyle = '#d3216b';
    g.fillRect(ex + 2, ey + 8, 3, 3);
    g.fillRect(ex + 9, ey + 8, 3, 3);
  }

  function drawBoss() {
    const bx = boss.x, by = boss.y;
    g.fillStyle = '#d3216b';
    g.fillRect(bx + 12, by, 40, 24);
    g.fillStyle = '#7a0f42';
    g.fillRect(bx, by + 12, 64, 16);
    g.fillStyle = '#ffe04f';
    g.fillRect(bx + 24, by + 8, 16, 12);

    // Boss HP Bar
    const hpRatio = Math.max(0, boss.hp / boss.maxHp);
    g.fillStyle = '#333';
    g.fillRect(bx, by - 8, boss.w, 4);
    g.fillStyle = '#ff5fa2';
    g.fillRect(bx, by - 8, boss.w * hpRatio, 4);
  }

  function drawTopHUD() {
    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = '#ffffff';
    g.fillText('1UP', 16, 12);
    g.fillText(String(score).padStart(6, '0'), 16, 22);

    g.fillText('HIGH', W / 2 - 16, 12);
    g.fillText('050000', W / 2 - 24, 22);

    g.fillText(`WAVE ${wave}`, W - 72, 12);
    g.fillStyle = '#ff5fa2';
    g.fillText(`x${lives}`, W - 32, 22);
    g.fillRect(W - 44, 15, 8, 6);
  }

  /* ══ PUBLIC INTERFACE ═════════════════════════════════════ */
  function start(ctx) {
    g = ctx;
    running = true;
    score = 0;
    lives = 3;
    initStarfield();
    initWave(1);
  }

  function stop() {
    running = false;
    Audio8.stop();
  }

  function reset() {
    lives = 3;
    score = 0;
    initWave(1);
  }

  function onAction() {
    if (state === 'win') {
      initWave(wave + 1);
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
      title: "STAR GUARDIAN 8-BIT",
      score,
      wave,
      lives
    })
  };
})();
