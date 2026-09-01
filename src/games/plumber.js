/* ============================================================
   plumber.js  --  Herman's Super Plumber: Coin Castle Rush
   ------------------------------------------------------------
   8-Bit NES Super Mario-style platformer for HERMANIFY.
   Features smooth physics, coin blocks, brick busting, stomping,
   power-up stars, pipes, Goombas, Koopas, flagpole & fanfare!
   ============================================================ */

window.PlumberGame = (() => {
  const W = 256, H = 224;
  const GRAVITY = 0.38, MAX_FALL = 6.5;
  const ACCEL = 0.16, FRICTION = 0.84, MAX_SPEED = 2.4, RUN_SPEED = 3.6;
  const JUMP_FORCE = -6.2, HIGH_JUMP_FORCE = -7.4;

  let g = null;
  let running = false;
  let score = 0, coins = 0, lives = 3, timeLeft = 300, timeTick = 0;
  let level = 1, state = 'play'; // 'play' | 'dead' | 'flag' | 'win' | 'gameover'
  let cameraX = 0;
  let frame = 0;

  let player = {
    x: 32, y: 160, vx: 0, vy: 0,
    w: 12, h: 16,
    grounded: false, facing: 'right',
    state: 'small', // 'small' | 'super' | 'star'
    starTimer: 0,
    invulnerable: 0,
    animFrame: 0,
    animTick: 0,
    deadTimer: 0,
    flagTimer: 0
  };

  let blocks = [];
  let enemies = [];
  let pickups = [];
  let particles = [];
  let floatTexts = [];
  let fireworks = [];
  let flagpole = { x: 2100, y: 32, h: 144, flagY: 40 };
  let castle = { x: 2160, y: 96 };

  function initLevel() {
    blocks = [];
    enemies = [];
    pickups = [];
    particles = [];
    floatTexts = [];
    fireworks = [];
    cameraX = 0;
    timeLeft = 300;
    timeTick = 0;
    state = 'play';

    player.x = 40;
    player.y = 140;
    player.vx = 0;
    player.vy = 0;
    player.grounded = false;
    player.facing = 'right';
    player.deadTimer = 0;
    player.flagTimer = 0;

    // Ground platforms
    const groundSegments = [
      { x1: 0, x2: 1050 },
      { x1: 1100, x2: 1600 },
      { x1: 1660, x2: 2400 }
    ];

    groundSegments.forEach(seg => {
      for (let x = seg.x1; x < seg.x2; x += 16) {
        blocks.push({ x, y: 192, w: 16, h: 16, type: 'ground', solid: true });
        blocks.push({ x, y: 208, w: 16, h: 16, type: 'ground_deep', solid: true });
      }
    });

    // Mystery Question `[?]` and Brick blocks
    const layout = [
      // Section 1
      { x: 128, y: 128, type: 'question', content: 'coin' },
      { x: 160, y: 128, type: 'brick' },
      { x: 176, y: 128, type: 'question', content: 'star' },
      { x: 192, y: 128, type: 'brick' },
      { x: 208, y: 128, type: 'question', content: 'coin' },
      { x: 176, y: 64,  type: 'question', content: 'coin' },

      // Pipes
      { x: 272, y: 160, type: 'pipe_top', h: 32 },
      { x: 380, y: 144, type: 'pipe_top', h: 48 },
      { x: 490, y: 128, type: 'pipe_top', h: 64 },

      // Section 2 - Elevated bricks & coins
      { x: 580, y: 128, type: 'brick' },
      { x: 596, y: 128, type: 'question', content: 'coin' },
      { x: 612, y: 128, type: 'brick' },
      { x: 628, y: 64,  type: 'brick' },
      { x: 644, y: 64,  type: 'brick' },
      { x: 660, y: 64,  type: 'question', content: 'star' },
      { x: 676, y: 64,  type: 'brick' },
      { x: 720, y: 128, type: 'brick' },
      { x: 736, y: 128, type: 'question', content: 'coin' },
      { x: 752, y: 128, type: 'brick' },

      // Pipe
      { x: 820, y: 144, type: 'pipe_top', h: 48 },

      // Floating islands over pit
      { x: 1040, y: 144, type: 'brick' },
      { x: 1056, y: 144, type: 'question', content: 'coin' },
      { x: 1072, y: 144, type: 'brick' },

      // Section 3 - Steps pyramid
      { x: 1200, y: 176, type: 'stone' },
      { x: 1216, y: 176, type: 'stone' },
      { x: 1216, y: 160, type: 'stone' },
      { x: 1232, y: 176, type: 'stone' },
      { x: 1232, y: 160, type: 'stone' },
      { x: 1232, y: 144, type: 'stone' },
      { x: 1248, y: 176, type: 'stone' },
      { x: 1248, y: 160, type: 'stone' },
      { x: 1248, y: 144, type: 'stone' },
      { x: 1248, y: 128, type: 'stone' },

      // Down steps
      { x: 1320, y: 128, type: 'stone' },
      { x: 1320, y: 144, type: 'stone' },
      { x: 1320, y: 160, type: 'stone' },
      { x: 1320, y: 176, type: 'stone' },
      { x: 1336, y: 144, type: 'stone' },
      { x: 1336, y: 160, type: 'stone' },
      { x: 1336, y: 176, type: 'stone' },
      { x: 1352, y: 160, type: 'stone' },
      { x: 1352, y: 176, type: 'stone' },
      { x: 1368, y: 176, type: 'stone' },

      // Final staircase to flagpole
      { x: 1980, y: 176, type: 'stone' },
      { x: 1996, y: 176, type: 'stone' }, { x: 1996, y: 160, type: 'stone' },
      { x: 2012, y: 176, type: 'stone' }, { x: 2012, y: 160, type: 'stone' }, { x: 2012, y: 144, type: 'stone' },
      { x: 2028, y: 176, type: 'stone' }, { x: 2028, y: 160, type: 'stone' }, { x: 2028, y: 144, type: 'stone' }, { x: 2028, y: 128, type: 'stone' },
      { x: 2044, y: 176, type: 'stone' }, { x: 2044, y: 160, type: 'stone' }, { x: 2044, y: 144, type: 'stone' }, { x: 2044, y: 128, type: 'stone' }, { x: 2044, y: 112, type: 'stone' },
      { x: 2060, y: 176, type: 'stone' }, { x: 2060, y: 160, type: 'stone' }, { x: 2060, y: 144, type: 'stone' }, { x: 2060, y: 128, type: 'stone' }, { x: 2060, y: 112, type: 'stone' }, { x: 2060, y: 96, type: 'stone' },
    ];

    layout.forEach(item => {
      if (item.type === 'pipe_top') {
        const pipeH = item.h || 32;
        blocks.push({ x: item.x, y: 192 - pipeH, w: 32, h: pipeH, type: 'pipe', solid: true });
      } else {
        blocks.push({
          x: item.x, y: item.y, w: 16, h: 16,
          type: item.type, solid: true,
          content: item.content || null,
          bumpY: 0
        });
      }
    });

    // Loose coins in the air
    const airCoins = [
      { x: 128, y: 96 }, { x: 144, y: 96 }, { x: 160, y: 96 },
      { x: 628, y: 32 }, { x: 644, y: 32 }, { x: 660, y: 32 },
      { x: 1040, y: 112 }, { x: 1056, y: 112 }, { x: 1072, y: 112 }
    ];
    airCoins.forEach(c => {
      pickups.push({ x: c.x, y: c.y, w: 10, h: 14, type: 'coin', collected: false, floatOffset: Math.random() * 6 });
    });

    // Enemies (Beige Goombas & Red Beetles)
    const enemySpawns = [
      { x: 220, type: 'goomba' },
      { x: 340, type: 'goomba' },
      { x: 440, type: 'koopa' },
      { x: 640, type: 'goomba' },
      { x: 780, type: 'goomba' },
      { x: 920, type: 'koopa' },
      { x: 1420, type: 'goomba' },
      { x: 1480, type: 'goomba' },
      { x: 1720, type: 'koopa' },
      { x: 1820, type: 'goomba' }
    ];

    enemySpawns.forEach(e => {
      enemies.push({
        x: e.x, y: 176, vx: -0.75, vy: 0,
        w: 14, h: 16,
        type: e.type,
        state: 'walk', // 'walk' | 'squashed' | 'shell' | 'shell_moving'
        anim: 0,
        grounded: false
      });
    });

    flagpole.flagY = 40;
    Audio8.music('mario');
  }

  function addScore(pts, x, y) {
    score += pts;
    if (x !== undefined && y !== undefined) {
      floatTexts.push({ text: `+${pts}`, x, y, life: 40, vy: -0.6 });
    }
  }

  function spawnCoinFromBlock(bx, by) {
    coins++;
    addScore(200, bx, by - 16);
    Audio8.sfx('coin');
    particles.push({
      kind: 'block_coin',
      x: bx + 4, y: by - 10, vy: -4.5,
      life: 24
    });
    if (coins % 100 === 0) {
      lives++;
      Audio8.sfx('oneup');
      floatTexts.push({ text: '1-UP!', x: bx, y: by - 32, life: 50, vy: -0.8 });
    }
  }

  function spawnStarFromBlock(bx, by) {
    Audio8.sfx('powerup');
    pickups.push({
      x: bx + 2, y: by - 16, vx: 1.2, vy: -3,
      w: 14, h: 14, type: 'star',
      bounce: true
    });
  }

  function hitBlock(b) {
    if (b.type === 'question') {
      b.type = 'empty_block';
      b.bumpY = -6;
      if (b.content === 'coin') {
        spawnCoinFromBlock(b.x, b.y);
      } else if (b.content === 'star') {
        spawnStarFromBlock(b.x, b.y);
      }
    } else if (b.type === 'brick') {
      if (player.state === 'super' || player.state === 'star') {
        // Bust the brick!
        Audio8.sfx('brick');
        addScore(50, b.x, b.y);
        for (let i = 0; i < 4; i++) {
          particles.push({
            kind: 'brick_shard',
            x: b.x + (i % 2) * 8, y: b.y + Math.floor(i / 2) * 8,
            vx: (i % 2 === 0 ? -1.8 : 1.8),
            vy: (i < 2 ? -4.5 : -2.5),
            life: 35
          });
        }
        b.deleted = true;
      } else {
        b.bumpY = -5;
        Audio8.sfx('bump');
      }
    }
  }

  function killPlayer() {
    if (state === 'dead' || state === 'win') return;
    state = 'dead';
    player.deadTimer = 90;
    player.vy = -6.5;
    player.vx = 0;
    Audio8.stop();
    Audio8.sfx('die');
  }

  function checkFlagPole() {
    if (state !== 'play') return;
    if (player.x + player.w >= flagpole.x && player.x <= flagpole.x + 8 && player.y <= 192) {
      state = 'flag';
      player.x = flagpole.x - 6;
      player.vx = 0;
      player.vy = 2;
      player.facing = 'right';
      Audio8.stop();
      Audio8.sfx('flagpole');
      const heightBonus = Math.max(100, Math.floor((192 - player.y) * 20));
      addScore(heightBonus, flagpole.x, player.y);
    }
  }

  function update() {
    frame++;

    // Floating texts
    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const ft = floatTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) floatTexts.splice(i, 1);
    }

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      if (p.kind === 'block_coin') {
        p.y += p.vy;
        p.vy += 0.35;
      } else if (p.kind === 'brick_shard') {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
      } else if (p.kind === 'firework') {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.speed *= 0.95;
      }
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Block bump reset
    blocks.forEach(b => {
      if (b.bumpY < 0) b.bumpY += 1;
    });
    blocks = blocks.filter(b => !b.deleted);

    if (state === 'dead') {
      player.y += player.vy;
      player.vy += 0.3;
      player.deadTimer--;
      if (player.deadTimer <= 0) {
        lives--;
        if (lives > 0) {
          initLevel();
        } else {
          state = 'gameover';
          Audio8.sfx('game_over');
        }
      }
      return;
    }

    if (state === 'flag') {
      if (flagpole.flagY < 168) flagpole.flagY += 2.5;
      if (player.y < 176) {
        player.y += 2.5;
      } else {
        player.y = 176;
        player.flagTimer++;
        if (player.flagTimer === 30) {
          player.x = flagpole.x + 10;
        } else if (player.flagTimer > 40) {
          player.vx = 1.6;
          player.x += player.vx;
          player.animTick++;
          if (player.animTick % 6 === 0) player.animFrame = (player.animFrame + 1) % 3;

          if (player.x >= castle.x + 32) {
            state = 'win';
            player.vx = 0;
            Audio8.sfx('stage_clear');
            // Spawn victory fireworks
            for (let f = 0; f < 3; f++) {
              setTimeout(() => {
                if (state !== 'win') return;
                Audio8.sfx('boom');
                const fx = castle.x + 16 + Math.random() * 40;
                const fy = castle.y - 20 - Math.random() * 40;
                for (let i = 0; i < 24; i++) {
                  particles.push({
                    kind: 'firework',
                    x: fx, y: fy,
                    angle: (Math.PI * 2 * i) / 24,
                    speed: 2 + Math.random() * 2,
                    col: ['#ff5fa2', '#ffe04f', '#8fe3c8', '#ffffff'][i % 4],
                    life: 40
                  });
                }
              }, f * 600);
            }
          }
        }
      }
      return;
    }

    if (state === 'win') {
      // Tally remaining time into points
      if (timeLeft > 0) {
        timeLeft = Math.max(0, timeLeft - 2);
        addScore(50);
        if (frame % 4 === 0) Audio8.sfx('blip');
      }
      return;
    }

    // Normal play countdown
    timeTick++;
    if (timeTick >= 60) {
      timeTick = 0;
      timeLeft--;
      if (timeLeft <= 0) {
        killPlayer();
        return;
      }
    }

    // Star power timer
    if (player.starTimer > 0) {
      player.starTimer--;
      if (player.starTimer === 0) player.state = 'small';
    }
    if (player.invulnerable > 0) player.invulnerable--;

    // Read Controls
    const held = window.__held || {};
    const aEdge = window.__aEdge || false;

    // Movement X
    const maxSpd = (held.b ? RUN_SPEED : MAX_SPEED);
    if (held.left) {
      player.vx = Math.max(-maxSpd, player.vx - ACCEL);
      player.facing = 'left';
    } else if (held.right) {
      player.vx = Math.min(maxSpd, player.vx + ACCEL);
      player.facing = 'right';
    } else {
      player.vx *= FRICTION;
      if (Math.abs(player.vx) < 0.05) player.vx = 0;
    }

    // Jump
    if (aEdge && player.grounded) {
      player.vy = held.b ? HIGH_JUMP_FORCE : JUMP_FORCE;
      player.grounded = false;
      Audio8.sfx('jump');
    }
    if (!held.a && player.vy < -2.5) {
      player.vy *= 0.65; // Variable jump height
    }

    // Gravity
    player.vy = Math.min(MAX_FALL, player.vy + GRAVITY);

    // Horizontal collision
    player.x += player.vx;
    blocks.forEach(b => {
      if (!b.solid) return;
      if (boxOverlap(player.x, player.y, player.w, player.h, b.x, b.y + b.bumpY, b.w, b.h)) {
        if (player.vx > 0) {
          player.x = b.x - player.w;
          player.vx = 0;
        } else if (player.vx < 0) {
          player.x = b.x + b.w;
          player.vx = 0;
        }
      }
    });

    // Vertical collision
    player.grounded = false;
    player.y += player.vy;
    blocks.forEach(b => {
      if (!b.solid) return;
      if (boxOverlap(player.x, player.y, player.w, player.h, b.x, b.y + b.bumpY, b.w, b.h)) {
        if (player.vy > 0) {
          // Landing on block
          player.y = b.y + b.bumpY - player.h;
          player.vy = 0;
          player.grounded = true;
        } else if (player.vy < 0) {
          // Hitting block from below
          player.y = b.y + b.bumpY + b.h;
          player.vy = 0;
          hitBlock(b);
        }
      }
    });

    // Fall in pit
    if (player.y > H + 32) {
      killPlayer();
      return;
    }

    // Animation
    if (!player.grounded) {
      player.animFrame = 3; // Jump frame
    } else if (Math.abs(player.vx) > 0.2) {
      player.animTick += (held.b ? 2 : 1);
      if (player.animTick % 6 === 0) player.animFrame = (player.animFrame + 1) % 3;
    } else {
      player.animFrame = 0; // Idle
    }

    // Camera follow
    const targetCamX = Math.max(0, player.x - 90);
    if (targetCamX > cameraX) cameraX += (targetCamX - cameraX) * 0.15;

    // Flagpole check
    checkFlagPole();

    // Pickups (coins & bouncing stars)
    pickups.forEach(p => {
      if (p.collected) return;
      if (p.type === 'coin') {
        if (boxOverlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
          p.collected = true;
          coins++;
          addScore(100, p.x, p.y);
          Audio8.sfx('coin');
        }
      } else if (p.type === 'star') {
        p.vy = Math.min(MAX_FALL, p.vy + GRAVITY);
        p.x += p.vx;
        p.y += p.vy;
        blocks.forEach(b => {
          if (!b.solid) return;
          if (boxOverlap(p.x, p.y, p.w, p.h, b.x, b.y, b.w, b.h)) {
            if (p.vy > 0) { p.y = b.y - p.h; p.vy = -4.5; }
            else if (p.vx > 0) { p.x = b.x - p.w; p.vx *= -1; }
            else if (p.vx < 0) { p.x = b.x + b.w; p.vx *= -1; }
          }
        });
        if (boxOverlap(player.x, player.y, player.w, player.h, p.x, p.y, p.w, p.h)) {
          p.collected = true;
          player.state = 'star';
          player.starTimer = 600; // 10 seconds of invincibility
          Audio8.sfx('powerup');
          addScore(1000, p.x, p.y);
        }
      }
    });
    pickups = pickups.filter(p => !p.collected);

    // Enemies
    enemies.forEach(e => {
      if (e.state === 'dead') return;

      // Enemy AI / gravity
      if (e.state === 'walk' || e.state === 'shell_moving') {
        e.vy = Math.min(MAX_FALL, e.vy + GRAVITY);
        e.x += e.vx;

        // Horiz wall bounce
        blocks.forEach(b => {
          if (!b.solid) return;
          if (boxOverlap(e.x, e.y, e.w, e.h, b.x, b.y, b.w, b.h)) {
            if (e.vx > 0) { e.x = b.x - e.w; e.vx *= -1; }
            else if (e.vx < 0) { e.x = b.x + b.w; e.vx *= -1; }
          }
        });

        // Vert ground
        e.y += e.vy;
        blocks.forEach(b => {
          if (!b.solid) return;
          if (boxOverlap(e.x, e.y, e.w, e.h, b.x, b.y, b.w, b.h)) {
            if (e.vy > 0) { e.y = b.y - e.h; e.vy = 0; }
          }
        });

        // Walk animation
        if (frame % 8 === 0) e.anim = 1 - e.anim;
      }

      // Shell hitting other enemies
      if (e.state === 'shell_moving') {
        enemies.forEach(other => {
          if (other === e || other.state === 'dead') return;
          if (boxOverlap(e.x, e.y, e.w, e.h, other.x, other.y, other.w, other.h)) {
            other.state = 'dead';
            Audio8.sfx('stomp');
            addScore(500, other.x, other.y);
          }
        });
      }

      // Collision with Player
      if (boxOverlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
        if (player.state === 'star') {
          // Defeat instantly
          e.state = 'dead';
          Audio8.sfx('stomp');
          addScore(300, e.x, e.y);
        } else if (player.vy > 0 && player.y + player.h <= e.y + 8) {
          // Player stomps on enemy from above!
          player.vy = -4.5;
          Audio8.sfx('stomp');
          if (e.type === 'goomba') {
            e.state = 'squashed';
            addScore(200, e.x, e.y);
            setTimeout(() => { e.state = 'dead'; }, 400);
          } else if (e.type === 'koopa') {
            if (e.state === 'walk') {
              e.state = 'shell';
              e.vx = 0;
              addScore(200, e.x, e.y);
            } else if (e.state === 'shell') {
              e.state = 'shell_moving';
              e.vx = (player.x < e.x ? 4.2 : -4.2);
              Audio8.sfx('kick');
              addScore(400, e.x, e.y);
            }
          }
        } else if (e.state === 'shell') {
          // Kick the stationary shell
          e.state = 'shell_moving';
          e.vx = (player.x < e.x ? 4.2 : -4.2);
          Audio8.sfx('kick');
          addScore(400, e.x, e.y);
        } else if (e.state === 'walk' || e.state === 'shell_moving') {
          if (player.invulnerable <= 0) {
            killPlayer();
          }
        }
      }
    });
    enemies = enemies.filter(e => e.state !== 'dead');
  }

  function boxOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /* ══ RENDERING ════════════════════════════════════════════ */
  function render() {
    if (!g) return;

    // NES Sky Blue background
    g.fillStyle = '#6b8cff';
    g.fillRect(0, 0, W, H);

    // Background fluffy clouds & green hills (parallax)
    g.save();
    g.translate(-Math.floor(cameraX * 0.3), 0);
    drawBackgroundScenery();
    g.restore();

    g.save();
    g.translate(-Math.floor(cameraX), 0);

    // Blocks
    blocks.forEach(b => {
      drawBlock(b);
    });

    // Castle & Flagpole
    drawFlagpoleAndCastle();

    // Pickups
    pickups.forEach(p => {
      drawPickup(p);
    });

    // Enemies
    enemies.forEach(e => {
      drawEnemy(e);
    });

    // Player Herman
    drawPlayer();

    // Particles
    particles.forEach(p => {
      drawParticle(p);
    });

    // Floating text
    floatTexts.forEach(ft => {
      g.font = '8px "Press Start 2P", monospace';
      g.fillStyle = '#fff';
      g.fillText(ft.text, ft.x, ft.y);
    });

    g.restore();

    // NES Top HUD Bar
    drawTopHUD();

    // End Game Screens
    if (state === 'win') {
      g.fillStyle = 'rgba(0,0,0,0.6)';
      g.fillRect(24, 60, W - 48, 100);
      g.lineWidth = 2;
      g.strokeStyle = '#ffe04f';
      g.strokeRect(24, 60, W - 48, 100);

      g.font = '10px "Press Start 2P", monospace';
      g.fillStyle = '#ffe04f';
      g.textAlign = 'center';
      g.fillText('COURSE CLEAR!', W / 2, 85);
      g.fillStyle = '#fff';
      g.font = '8px "Press Start 2P", monospace';
      g.fillText(`FINAL SCORE: ${score}`, W / 2, 110);
      g.fillStyle = '#8fe3c8';
      g.fillText('PRESS A TO PLAY AGAIN', W / 2, 135);
      g.textAlign = 'left';
    } else if (state === 'gameover') {
      g.fillStyle = 'rgba(0,0,0,0.85)';
      g.fillRect(0, 0, W, H);
      g.font = '12px "Press Start 2P", monospace';
      g.fillStyle = '#ff5fa2';
      g.textAlign = 'center';
      g.fillText('GAME OVER', W / 2, 100);
      g.fillStyle = '#ffe04f';
      g.font = '8px "Press Start 2P", monospace';
      g.fillText('PRESS A TO RETRY', W / 2, 130);
      g.textAlign = 'left';
    }
  }

  function drawBackgroundScenery() {
    // Distant clouds
    for (let cx = -100; cx < 3000; cx += 220) {
      drawPixelCloud(cx, 40);
      drawPixelCloud(cx + 120, 70);
      drawPixelHill(cx + 60, 192);
    }
  }

  function drawPixelCloud(x, y) {
    g.fillStyle = '#ffffff';
    g.fillRect(x + 10, y, 24, 12);
    g.fillRect(x, y + 4, 44, 8);
  }

  function drawPixelHill(x, y) {
    g.fillStyle = '#00a800';
    g.beginPath();
    g.arc(x + 30, y, 30, Math.PI, 0);
    g.fill();
    g.fillStyle = '#008000';
    g.fillRect(x + 28, y - 26, 4, 6);
  }

  function drawBlock(b) {
    const bx = b.x, by = b.y + b.bumpY;
    if (b.type === 'ground') {
      g.fillStyle = '#d86b00';
      g.fillRect(bx, by, 16, 16);
      g.fillStyle = '#ff9b3b';
      g.fillRect(bx + 1, by + 1, 14, 2);
      g.fillStyle = '#8a3c00';
      g.fillRect(bx + 1, by + 14, 14, 2);
    } else if (b.type === 'ground_deep') {
      g.fillStyle = '#8a3c00';
      g.fillRect(bx, by, 16, 16);
      g.fillStyle = '#5a2200';
      g.fillRect(bx + 2, by + 2, 4, 4);
    } else if (b.type === 'question') {
      // Pulsing yellow `[?]` block
      const pulse = Math.floor(frame / 12) % 4;
      g.fillStyle = (pulse === 3 ? '#e07800' : '#fcb000');
      g.fillRect(bx, by, 16, 16);
      g.fillStyle = '#000000';
      g.strokeRect(bx + 0.5, by + 0.5, 15, 15);
      // '?' glyph
      g.fillStyle = '#ffffff';
      g.fillRect(bx + 6, by + 3, 4, 2);
      g.fillRect(bx + 8, by + 5, 2, 3);
      g.fillRect(bx + 6, by + 8, 4, 2);
      g.fillRect(bx + 6, by + 11, 2, 2);
    } else if (b.type === 'empty_block') {
      g.fillStyle = '#8a5c3b';
      g.fillRect(bx, by, 16, 16);
      g.strokeStyle = '#4a2c1b';
      g.strokeRect(bx + 0.5, by + 0.5, 15, 15);
    } else if (b.type === 'brick') {
      g.fillStyle = '#b84418';
      g.fillRect(bx, by, 16, 16);
      g.fillStyle = '#000000';
      g.fillRect(bx, by + 7, 16, 1);
      g.fillRect(bx + 7, by, 1, 7);
      g.fillRect(bx + 11, by + 8, 1, 8);
    } else if (b.type === 'stone') {
      g.fillStyle = '#d8a068';
      g.fillRect(bx, by, 16, 16);
      g.fillStyle = '#000000';
      g.strokeRect(bx + 0.5, by + 0.5, 15, 15);
    } else if (b.type === 'pipe') {
      // Warp Pipe
      g.fillStyle = '#00a800';
      g.fillRect(bx, by, b.w, b.h);
      g.fillStyle = '#80d010';
      g.fillRect(bx + 3, by, 4, b.h);
      g.fillStyle = '#005000';
      g.fillRect(bx + b.w - 5, by, 4, b.h);
      // Pipe rim
      g.fillStyle = '#00a800';
      g.fillRect(bx - 2, by, b.w + 4, 8);
      g.fillStyle = '#80d010';
      g.fillRect(bx + 1, by, 4, 8);
      g.fillStyle = '#000000';
      g.strokeRect(bx - 2.5, by + 0.5, b.w + 4, b.h);
    }
  }

  function drawFlagpoleAndCastle() {
    // Flagpole
    g.fillStyle = '#ffffff';
    g.fillRect(flagpole.x + 3, flagpole.y, 2, flagpole.h);
    g.fillStyle = '#ffe04f';
    g.fillRect(flagpole.x + 1, flagpole.y - 4, 6, 6);

    // The Flag
    g.fillStyle = '#00a800';
    g.beginPath();
    g.moveTo(flagpole.x + 3, flagpole.flagY);
    g.lineTo(flagpole.x - 14, flagpole.flagY + 8);
    g.lineTo(flagpole.x + 3, flagpole.flagY + 16);
    g.fill();

    // The Castle
    const cx = castle.x, cy = castle.y;
    g.fillStyle = '#8a5c3b';
    g.fillRect(cx, cy + 32, 64, 64);
    // Battlements
    g.fillRect(cx + 8, cy + 12, 16, 20);
    g.fillRect(cx + 40, cy + 12, 16, 20);
    g.fillRect(cx + 20, cy, 24, 32);
    // Castle Door
    g.fillStyle = '#000000';
    g.fillRect(cx + 24, cy + 64, 16, 32);
    // Castle Flag
    g.fillStyle = '#ff5fa2';
    g.fillRect(cx + 30, cy - 8, 12, 8);
  }

  function drawPickup(p) {
    if (p.type === 'coin') {
      const anim = Math.floor((frame + p.floatOffset) / 6) % 4;
      const w = [8, 6, 3, 6][anim];
      g.fillStyle = '#fcb000';
      g.fillRect(p.x + (8 - w) / 2, p.y, w, 12);
      g.fillStyle = '#ffffff';
      g.fillRect(p.x + (8 - w) / 2 + 1, p.y + 2, Math.max(1, w - 2), 2);
    } else if (p.type === 'star') {
      const starCol = ['#ffe04f', '#ff5fa2', '#8fe3c8', '#ffffff'][Math.floor(frame / 4) % 4];
      g.fillStyle = starCol;
      g.fillRect(p.x + 4, p.y, 6, 14);
      g.fillRect(p.x, p.y + 4, 14, 6);
      g.fillStyle = '#000000';
      g.fillRect(p.x + 4, p.y + 4, 2, 3);
      g.fillRect(p.x + 8, p.y + 4, 2, 3);
    }
  }

  function drawEnemy(e) {
    if (e.type === 'goomba') {
      if (e.state === 'squashed') {
        g.fillStyle = '#9c4a00';
        g.fillRect(e.x, e.y + 10, 16, 6);
      } else {
        g.fillStyle = '#9c4a00'; // Mushroom cap
        g.fillRect(e.x + 2, e.y, 12, 10);
        g.fillRect(e.x, e.y + 4, 16, 6);
        g.fillStyle = '#fce0a8'; // Face
        g.fillRect(e.x + 4, e.y + 8, 8, 4);
        g.fillStyle = '#000000'; // Eyes
        g.fillRect(e.x + 4, e.y + 9, 2, 2);
        g.fillRect(e.x + 10, e.y + 9, 2, 2);
        g.fillStyle = '#000000'; // Feet
        if (e.anim === 0) {
          g.fillRect(e.x + 1, e.y + 12, 5, 4);
          g.fillRect(e.x + 10, e.y + 12, 5, 4);
        } else {
          g.fillRect(e.x + 3, e.y + 12, 5, 4);
          g.fillRect(e.x + 8, e.y + 12, 5, 4);
        }
      }
    } else if (e.type === 'koopa') {
      if (e.state === 'shell' || e.state === 'shell_moving') {
        g.fillStyle = '#00a800';
        g.fillRect(e.x + 2, e.y + 4, 12, 12);
        g.fillStyle = '#ffffff';
        g.fillRect(e.x + 5, e.y + 7, 6, 6);
      } else {
        g.fillStyle = '#00a800'; // Koopa shell
        g.fillRect(e.x + 3, e.y + 4, 10, 10);
        g.fillStyle = '#ffe04f'; // Head
        g.fillRect(e.x + (e.vx < 0 ? 0 : 8), e.y, 8, 8);
        g.fillStyle = '#000000'; // Eyes
        g.fillRect(e.x + (e.vx < 0 ? 2 : 10), e.y + 2, 2, 2);
      }
    }
  }

  function drawPlayer() {
    if (player.invulnerable > 0 && Math.floor(frame / 3) % 2 === 0) return;

    const px = player.x, py = player.y;
    let capCol = '#d82800', shirtCol = '#0080ff', skinCol = '#fce0a8';

    if (player.state === 'star') {
      const palette = [
        ['#ffffff', '#00e8d8'],
        ['#fc7460', '#00a800'],
        ['#fcb000', '#d82800']
      ];
      const pal = palette[Math.floor(frame / 3) % palette.length];
      capCol = pal[0];
      shirtCol = pal[1];
    }

    g.save();
    if (player.facing === 'left') {
      g.translate(px + player.w, py);
      g.scale(-1, 1);
    } else {
      g.translate(px, py);
    }

    // 8-bit Herman Plumber Sprite
    // Cap
    g.fillStyle = capCol;
    g.fillRect(3, 0, 8, 3);
    g.fillRect(3, 2, 11, 2);

    // Face / Hair
    g.fillStyle = skinCol;
    g.fillRect(3, 4, 8, 4);
    g.fillStyle = '#6a3400';
    g.fillRect(1, 4, 3, 3); // Hair
    g.fillRect(6, 6, 5, 2); // Mustache
    g.fillStyle = '#000';
    g.fillRect(7, 4, 2, 2); // Eye

    // Overalls & Shirt
    g.fillStyle = capCol; // Red Overalls
    g.fillRect(2, 8, 8, 5);
    g.fillStyle = shirtCol; // Blue Shirt
    g.fillRect(1, 9, 3, 4);
    g.fillRect(8, 9, 3, 4);

    // Legs / Feet
    g.fillStyle = shirtCol;
    if (player.animFrame === 3) {
      // Jump pose
      g.fillRect(0, 12, 5, 3);
      g.fillRect(7, 13, 5, 3);
    } else if (player.animFrame === 1) {
      g.fillRect(1, 12, 4, 4);
      g.fillRect(7, 12, 4, 4);
    } else {
      g.fillRect(2, 12, 4, 4);
      g.fillRect(6, 12, 4, 4);
    }

    g.restore();
  }

  function drawParticle(p) {
    if (p.kind === 'block_coin') {
      g.fillStyle = '#fcb000';
      g.fillRect(p.x, p.y, 8, 12);
    } else if (p.kind === 'brick_shard') {
      g.fillStyle = '#b84418';
      g.fillRect(p.x, p.y, 6, 6);
    } else if (p.kind === 'firework') {
      g.fillStyle = p.col || '#ffe04f';
      g.fillRect(p.x, p.y, 3, 3);
    }
  }

  function drawTopHUD() {
    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = '#ffffff';

    // HERMAN (Score)
    g.fillText('HERMAN', 16, 10);
    g.fillText(String(score).padStart(6, '0'), 16, 20);

    // COINS
    g.fillStyle = '#fcb000';
    g.fillText('x' + String(coins).padStart(2, '0'), 92, 20);
    g.fillRect(82, 13, 6, 8); // Tiny coin icon

    // WORLD
    g.fillStyle = '#ffffff';
    g.fillText('WORLD', 142, 10);
    g.fillText('1-1', 150, 20);

    // TIME
    g.fillText('TIME', 204, 10);
    g.fillText(String(timeLeft).padStart(3, '0'), 208, 20);
  }

  /* ══ PUBLIC INTERFACE ═════════════════════════════════════ */
  function start(ctx) {
    g = ctx;
    running = true;
    score = 0;
    coins = 0;
    lives = 3;
    initLevel();
  }

  function stop() {
    running = false;
    Audio8.stop();
  }

  function reset() {
    lives = 3;
    score = 0;
    coins = 0;
    initLevel();
  }

  function onAction() {
    if (state === 'win' || state === 'gameover') {
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
      title: "HERMAN'S SUPER PLUMBER",
      score,
      coins,
      lives,
      time: timeLeft,
      world: "1-1"
    })
  };
})();
