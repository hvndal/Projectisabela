/* ============================================================
   fitway.js  --  FITWAY: IRON RUN (A Fitness Arcade Adventure)
   ------------------------------------------------------------
   Highly polished, fully playable mobile-first retro arcade game
   set inside Fitway Gym.
   Features 5 playable team members (Sukh, Gagan, Shubham,
   Rakesh, Herman), living gym world, character-driven humor,
   interactive workout checkpoints, moving gym mechanics,
   boss fight against The Sedentary King, and streak progression!
   ============================================================ */

window.FitwayGame = (() => {
  const W = 256, H = 224;

  let g = null;
  let running = false;
  let frame = 0;

  /* ══ STATE & PROGRESSION ═══════════════════════════════════ */
  let gameState = 'intro'; // 'intro' | 'char_select' | 'play' | 'checkpoint' | 'boss_break' | 'win' | 'gameover'
  let score = 0, xp = 0, playerLevel = 1, fitwayTokens = 0;
  let totalRepsCompleted = 0, dailyStreak = 12;
  let cameraX = 0, cameraY = 0;

  // Characters definition
  const CHARACTERS = [
    {
      id: 'sukh',
      name: 'SUKH',
      title: 'THE OWNER',
      role: 'Owner & Founder of Fitway Gym',
      bio: 'Confident, experienced, and energetic. Knows every excuse for skipping leg day and accepts none of them.',
      weapon: 'OLYMPIC BARBELL',
      stats: { power: 5, speed: 2, range: 3, defense: 5, tech: 4 },
      specialName: "OWNER'S SMASH",
      specialDesc: 'Overhead barbell ground slam creating a massive shockwave across the floor.',
      challengeName: 'BARBELL SQUATS',
      challengeTarget: 10,
      color: '#ffd000',
      darkColor: '#1a1a1a',
      accentColor: '#d3216b'
    },
    {
      id: 'gagan',
      name: 'GAGAN',
      title: 'THE POWER TRAINER',
      role: 'Personal Trainer & Strength Coach',
      bio: 'Competitive, high-energy powerhouse always pushing everyone for one more rep.',
      weapon: 'GIANT KETTLEBELL',
      stats: { power: 5, speed: 2, range: 3, defense: 4, tech: 3 },
      specialName: 'KETTLE CRUSH',
      specialDesc: 'Cyclone kettlebell spin followed by a rebounding wall-bounce throw.',
      challengeName: 'KETTLEBELL SWINGS',
      challengeTarget: 15,
      color: '#ff5fa2',
      darkColor: '#7a0f42',
      accentColor: '#ffe04f'
    },
    {
      id: 'shubham',
      name: 'SHUBHAM',
      title: 'THE CONDITIONING TRAINER',
      role: 'Conditioning & Functional Specialist',
      bio: 'Fast, focused, agile. Makes grueling conditioning workouts look completely effortless.',
      weapon: 'RESISTANCE BAND',
      stats: { power: 3, speed: 5, range: 5, defense: 2, tech: 5 },
      specialName: 'BAND BLAST',
      specialDesc: 'Full-screen elastic snap sweeping all obstacles and launching energy orbs.',
      challengeName: 'RESISTANCE BAND REPS',
      challengeTarget: 20,
      color: '#8fe3c8',
      darkColor: '#105040',
      accentColor: '#ffffff'
    },
    {
      id: 'rakesh',
      name: 'RAKESH',
      title: 'THE OLD-SCHOOL TRAINER',
      role: 'Veteran Trainer & Form Purist',
      bio: 'Calm, legendary, old-school master who believes in showing up and putting in real work.',
      weapon: 'SOLID EZ-CURL BAR',
      stats: { power: 4, speed: 3, range: 3, defense: 4, tech: 4 },
      specialName: 'OLD SCHOOL MODE',
      specialDesc: 'Golden iron aura granting immense defense, hyper-armor, and doubled strike power.',
      challengeName: 'EZ-BAR CURLS',
      challengeTarget: 10,
      color: '#ffd2b8',
      darkColor: '#4a2511',
      accentColor: '#ffe04f'
    },
    {
      id: 'herman',
      name: 'HERMAN',
      title: 'SOFTWARE & HARDWARE ENGINEER',
      role: 'Tech & Connected Systems Architect',
      bio: 'Built Fitway’s connected machines, sensors, and automation. Now fighting gym monsters with dual dumbbells.',
      weapon: 'DUAL DUMBBELLS',
      stats: { power: 3, speed: 5, range: 4, defense: 2, tech: 5 },
      specialName: 'DEBUG MODE',
      specialDesc: 'System overclock: high-speed multi-split dumbbells bouncing off all surfaces.',
      challengeName: 'DUMBBELL CURLS',
      challengeTarget: 10,
      color: '#00e8d8',
      darkColor: '#003344',
      accentColor: '#ffe04f'
    }
  ];

  let selectedCharIndex = 0;
  let selectedChar = CHARACTERS[0];

  // Player in-game entity
  let player = {
    x: 40, y: 150,
    vx: 0, vy: 0,
    w: 16, h: 22,
    hp: 100, maxHp: 100,
    grounded: false,
    facing: 'right',
    state: 'idle', // 'idle' | 'run' | 'jump' | 'attack' | 'special' | 'hit'
    attackTimer: 0,
    specialCharge: 100, // 0 - 100
    isSpecialActive: false,
    specialDuration: 0,
    invulTimer: 0,
    combo: 0,
    animTick: 0,
    animFrame: 0
  };

  // World objects
  let platforms = [];
  let treadmills = [];
  let enemies = [];
  let projectiles = [];
  let particles = [];
  let floatingTexts = [];
  let gymNPCs = [];
  let tokens = [];
  let checkpoints = [];
  let boss = null;

  // Active workout checkpoint modal state
  let workout = {
    active: false,
    title: '',
    exercise: '',
    target: 10,
    current: 0,
    rewardXp: 100,
    onComplete: null
  };

  // Screen effects
  let screenShake = 0;
  let screenFlash = 0;
  let introTimer = 0;

  /* ══ INITIALIZATION ════════════════════════════════════════ */
  function initGameWorld() {
    platforms = [];
    treadmills = [];
    enemies = [];
    projectiles = [];
    particles = [];
    floatingTexts = [];
    gymNPCs = [];
    tokens = [];
    checkpoints = [];
    boss = null;

    cameraX = 0;
    cameraY = 0;
    player.x = 40;
    player.y = 150;
    player.vx = 0;
    player.vy = 0;
    player.hp = 100;
    player.specialCharge = 0;
    player.isSpecialActive = false;

    // ── ZONE 1: EXTERIOR & RECEPTION (x: 0 - 600) ───────────
    // Solid floor
    platforms.push({ x: 0, y: 180, w: 600, h: 44, type: 'floor_reception' });

    // Tutorial foam block stack at x: 260
    platforms.push({ x: 260, y: 156, w: 24, h: 24, type: 'foam_blocks', breakable: true, hp: 1 });

    // Fitway Reception Desk at x: 180
    platforms.push({ x: 170, y: 148, w: 48, h: 32, type: 'reception_desk' });

    // Water Cooler at x: 340
    platforms.push({ x: 340, y: 152, w: 16, h: 28, type: 'water_cooler' });

    // Gym NPCs in Reception
    gymNPCs.push({ x: 185, y: 132, name: 'RECEPTIONIST', msg: 'Morning! Welcome to Fitway!' });
    gymNPCs.push({ x: 420, y: 158, name: 'MEMBER', msg: "Let's get it today!" });

    // Fitway Tokens in Reception
    tokens.push({ x: 110, y: 140, collected: false });
    tokens.push({ x: 480, y: 140, collected: false });

    // ── ZONE 2: CARDIO FLOOR (x: 600 - 1300) ────────────────
    platforms.push({ x: 600, y: 180, w: 700, h: 44, type: 'floor_cardio' });

    // Treadmills (moving belt platforms)
    treadmills.push({ x: 680, y: 156, w: 56, h: 12, speed: -1.2 }); // Reverse treadmill
    treadmills.push({ x: 780, y: 140, w: 56, h: 12, speed: 1.6 });  // Forward boost treadmill
    treadmills.push({ x: 920, y: 156, w: 56, h: 12, speed: -1.4 });
    treadmills.push({ x: 1040, y: 132, w: 56, h: 12, speed: 2.0 });

    // Stationary Bikes / Ellipticals as upper platforms
    platforms.push({ x: 860, y: 110, w: 36, h: 10, type: 'gym_platform' });
    platforms.push({ x: 990, y: 95, w: 40, h: 10, type: 'gym_platform' });

    // Cardio Enemies
    enemies.push({ x: 740, y: 160, vx: -0.8, vy: 0, w: 16, h: 16, type: 'treadmill_bot', hp: 2, maxHp: 2, name: 'Treadmill Bot' });
    enemies.push({ x: 880, y: 160, vx: -1.2, vy: 0, w: 18, h: 16, type: 'rogue_bike', hp: 3, maxHp: 3, name: 'Rogue Bike' });
    enemies.push({ x: 1000, y: 160, vx: 0.6, vy: 0, w: 14, h: 14, type: 'foam_roller', hp: 2, maxHp: 2, name: 'Foam Roller' });
    enemies.push({ x: 1120, y: 155, vx: -0.9, vy: 0, w: 16, h: 16, type: 'cardio_slime', hp: 2, maxHp: 2, name: 'Cardio Slime' });

    // Fitness Checkpoint 1 (End of Cardio Zone)
    checkpoints.push({
      x: 1220, y: 140, w: 28, h: 40,
      id: 'cardio_checkpoint',
      title: 'CARDIO ZONE CHECKPOINT',
      done: false
    });

    // ── ZONE 3: STAIRWELL & VERTICAL CLIMB (x: 1300 - 1600) ─
    platforms.push({ x: 1300, y: 180, w: 300, h: 44, type: 'floor_stairs' });
    // Stair steps leading to Floor 2
    platforms.push({ x: 1360, y: 160, w: 32, h: 12, type: 'stair_step' });
    platforms.push({ x: 1410, y: 136, w: 32, h: 12, type: 'stair_step' });
    platforms.push({ x: 1460, y: 112, w: 32, h: 12, type: 'stair_step' });
    platforms.push({ x: 1510, y: 88,  w: 32, h: 12, type: 'stair_step' });
    platforms.push({ x: 1560, y: 64,  w: 40, h: 12, type: 'stair_landing' });

    // ── ZONE 4: FLOOR 2 — STRENGTH & WEIGHTS ZONE (x: 1600 - 2400)
    platforms.push({ x: 1600, y: 180, w: 800, h: 44, type: 'floor_weights' });

    // Squat Racks, Dumbbell Benches, Pull-up Bars
    platforms.push({ x: 1680, y: 148, w: 44, h: 32, type: 'squat_rack' });
    platforms.push({ x: 1770, y: 156, w: 36, h: 12, type: 'bench_press' });
    platforms.push({ x: 1860, y: 128, w: 40, h: 10, type: 'pullup_bar' });
    platforms.push({ x: 1960, y: 148, w: 48, h: 32, type: 'dumbbell_rack' });
    platforms.push({ x: 2060, y: 110, w: 44, h: 10, type: 'cable_crossover' });

    // Strength Zone Enemies
    enemies.push({ x: 1720, y: 160, vx: -0.7, vy: 0, w: 18, h: 18, type: 'dumbbell_golem', hp: 4, maxHp: 4, name: 'Dumbbell Golem' });
    enemies.push({ x: 1880, y: 160, vx: -0.9, vy: 0, w: 18, h: 18, type: 'barbell_bouncer', hp: 4, maxHp: 4, name: 'Barbell Bouncer' });
    enemies.push({ x: 2040, y: 160, vx: -1.1, vy: 0, w: 16, h: 16, type: 'kettlebell_mite', hp: 3, maxHp: 3, name: 'Kettle Mite' });
    enemies.push({ x: 2180, y: 160, vx: -0.8, vy: 0, w: 20, h: 20, type: 'weight_plate_roller', hp: 5, maxHp: 5, name: 'Heavy 45lb Plate' });

    // Tokens & NPCs in Weights Room
    tokens.push({ x: 1860, y: 100, collected: false });
    tokens.push({ x: 2080, y: 85, collected: false });
    gymNPCs.push({ x: 1780, y: 140, name: 'TRAINER', msg: 'Full depth on those squats! Good form!' });

    // Strength Checkpoint
    checkpoints.push({
      x: 2260, y: 140, w: 28, h: 40,
      id: 'strength_checkpoint',
      title: 'STRENGTH CHECKPOINT',
      done: false
    });

    // ── ZONE 5: FUNCTIONAL TRAINING & BOXING (x: 2400 - 3000)
    platforms.push({ x: 2400, y: 180, w: 600, h: 44, type: 'floor_boxing' });
    platforms.push({ x: 2480, y: 150, w: 28, h: 30, type: 'plyo_box' });
    platforms.push({ x: 2540, y: 125, w: 28, h: 40, type: 'plyo_box_tall' });
    platforms.push({ x: 2680, y: 130, w: 60, h: 10, type: 'boxing_ring_rope' });

    // Combat Enemies
    enemies.push({ x: 2500, y: 160, vx: -1.3, vy: 0, w: 16, h: 20, type: 'speed_bag', hp: 3, maxHp: 3, name: 'Speed Bag Boxer' });
    enemies.push({ x: 2660, y: 160, vx: -1.0, vy: 0, w: 18, h: 22, type: 'heavy_bag_slugger', hp: 5, maxHp: 5, name: 'Heavy Bag Slugger' });
    enemies.push({ x: 2820, y: 160, vx: -1.4, vy: 0, w: 16, h: 16, type: 'battle_rope_snake', hp: 4, maxHp: 4, name: 'Battle Rope' });

    // ── ZONE 6: LOCKER & RECOVERY SAFE ROOM (x: 3000 - 3400)
    platforms.push({ x: 3000, y: 180, w: 400, h: 44, type: 'floor_recovery' });
    platforms.push({ x: 3100, y: 156, w: 44, h: 12, type: 'recovery_bench' });
    gymNPCs.push({ x: 3120, y: 140, name: 'RECOVERY BOT', msg: 'Hydrate! HP restored to 100%!' });

    // ── ZONE 7: PERFORMANCE LAB & HERMAN'S SYSTEMS (x: 3400 - 3900)
    platforms.push({ x: 3400, y: 180, w: 500, h: 44, type: 'floor_lab' });
    platforms.push({ x: 3500, y: 140, w: 48, h: 40, type: 'server_rack' });
    platforms.push({ x: 3620, y: 110, w: 40, h: 10, type: 'smart_sensor_grid' });
    gymNPCs.push({ x: 3520, y: 120, name: 'HERMAN TERMINAL', msg: 'SYSTEM: Fitway IoT Grid Online. 0 Errors.' });
    tokens.push({ x: 3640, y: 85, collected: false });

    // ── ZONE 8: BOSS ARENA — THE SEDENTARY KING (x: 3900 - 4600)
    platforms.push({ x: 3900, y: 180, w: 700, h: 44, type: 'floor_boss' });
    platforms.push({ x: 4020, y: 130, w: 44, h: 10, type: 'boss_platform_left' });
    platforms.push({ x: 4280, y: 130, w: 44, h: 10, type: 'boss_platform_right' });

    // Spawn Boss
    boss = {
      x: 4300, y: 100,
      w: 52, h: 52,
      hp: 60, maxHp: 60,
      phase: 1, // 1: Cushions, 2: Minions, 3: Lazy Zone Mech
      name: 'THE SEDENTARY KING',
      shielded: false,
      attackTimer: 60,
      anim: 0,
      vx: -0.8
    };
  }

  /* ══ WORKOUT CHECKPOINT TRIGGER ═════════════════════════════ */
  function triggerWorkout(title, target, onFinish) {
    workout.active = true;
    workout.title = title || `${selectedChar.name}'S FITNESS CHECKPOINT`;
    workout.exercise = selectedChar.challengeName;
    workout.target = target || selectedChar.challengeTarget;
    workout.current = 0;
    workout.rewardXp = 100;
    workout.onComplete = onFinish;
    Audio8.sfx('powerup');
    if (window.__buzz) window.__buzz(25);
  }

  function registerWorkoutRep() {
    if (!workout.active) return;
    workout.current++;
    Audio8.sfx('coin');
    if (window.__buzz) window.__buzz(15);

    // Rep floating text
    floatingTexts.push({
      text: `REP ${workout.current}!`,
      x: W / 2, y: 110,
      life: 30, vy: -0.8,
      col: '#ffe04f'
    });

    if (workout.current >= workout.target) {
      // Workout Finished!
      workout.active = false;
      totalRepsCompleted += workout.target;
      xp += workout.rewardXp;
      score += 1000;
      player.specialCharge = 100; // Instantly charge special ability!
      Audio8.sfx('stage_clear');
      if (window.__buzz) window.__buzz([30, 50, 40]);

      floatingTexts.push({
        text: 'SET COMPLETE! SPECIAL CHARGED! +100 XP',
        x: W / 2, y: 80,
        life: 60, vy: -0.6,
        col: '#8fe3c8'
      });

      // Check level up
      checkLevelUp();

      if (workout.onComplete) workout.onComplete();
    }
  }

  function checkLevelUp() {
    const requiredXp = playerLevel * 200;
    if (xp >= requiredXp) {
      playerLevel++;
      player.maxHp += 20;
      player.hp = player.maxHp;
      Audio8.sfx('oneup');
      floatingTexts.push({
        text: `LEVEL UP! LEVEL ${playerLevel}`,
        x: player.x, y: player.y - 24,
        life: 70, vy: -0.7,
        col: '#ffd000'
      });
    }
  }

  /* ══ CHARACTER ATTACKS & SPECIALS ═══════════════════════════ */
  function performAttack() {
    if (player.attackTimer > 0) return;
    player.attackTimer = selectedChar.id === 'herman' || selectedChar.id === 'shubham' ? 12 : 18;
    player.state = 'attack';
    Audio8.sfx('shoot');

    const dir = player.facing === 'right' ? 1 : -1;
    const spawnX = player.x + (dir > 0 ? player.w + 4 : -12);
    const spawnY = player.y + 6;

    if (selectedChar.id === 'sukh') {
      // Barbell Swing Arc
      projectiles.push({
        x: spawnX, y: spawnY - 6, vx: dir * 3.5, vy: 0,
        w: 20, h: 14, type: 'barbell_swing',
        life: 14, power: 15, isPlayer: true
      });
    } else if (selectedChar.id === 'gagan') {
      // Heavy Kettlebell Throw & Rebound
      projectiles.push({
        x: spawnX, y: spawnY, vx: dir * 4.0, vy: -1.2,
        w: 16, h: 16, type: 'kettlebell_shot',
        life: 28, power: 18, isPlayer: true
      });
    } else if (selectedChar.id === 'shubham') {
      // High-Velocity Band Whip
      projectiles.push({
        x: spawnX, y: spawnY, vx: dir * 5.8, vy: 0,
        w: 24, h: 6, type: 'band_whip',
        life: 16, power: 12, isPlayer: true
      });
    } else if (selectedChar.id === 'rakesh') {
      // Solid EZ Bar Swing
      projectiles.push({
        x: spawnX, y: spawnY - 4, vx: dir * 3.8, vy: 0,
        w: 18, h: 12, type: 'ezbar_strike',
        life: 16, power: 14, isPlayer: true
      });
    } else if (selectedChar.id === 'herman') {
      // Rapid Dual Dumbbells
      projectiles.push({
        x: spawnX, y: spawnY, vx: dir * 5.0, vy: -0.5,
        w: 12, h: 12, type: 'dumbbell_throw',
        life: 24, power: 11, isPlayer: true
      });
    }
  }

  function triggerSpecialAbility() {
    if (player.specialCharge < 100 || player.isSpecialActive) return;
    player.specialCharge = 0;
    player.isSpecialActive = true;
    player.specialDuration = 180; // 3 seconds of special power
    screenShake = 16;
    screenFlash = 12;
    Audio8.sfx('flagpole');
    if (window.__buzz) window.__buzz([30, 40, 50]);

    floatingTexts.push({
      text: `${selectedChar.specialName}!`,
      x: player.x, y: player.y - 30,
      life: 50, vy: -0.9,
      col: selectedChar.color
    });

    const dir = player.facing === 'right' ? 1 : -1;

    if (selectedChar.id === 'sukh') {
      // Owner's Smash Earthquake Shockwave
      for (let i = 0; i < 8; i++) {
        projectiles.push({
          x: player.x + (i * 24 * dir), y: 170,
          vx: dir * 4.5, vy: -2.0,
          w: 22, h: 22, type: 'shockwave',
          life: 30, power: 35, isPlayer: true
        });
      }
    } else if (selectedChar.id === 'gagan') {
      // Kettle Crush Cyclone
      for (let a = 0; a < 6; a++) {
        projectiles.push({
          x: player.x, y: player.y,
          vx: Math.cos(a) * 5.0, vy: Math.sin(a) * 5.0,
          w: 18, h: 18, type: 'kettlebell_shot',
          life: 40, power: 30, isPlayer: true
        });
      }
    } else if (selectedChar.id === 'shubham') {
      // Screen-wide Band Blast
      projectiles.push({
        x: player.x - 40, y: player.y - 20,
        vx: dir * 7.5, vy: 0,
        w: 60, h: 40, type: 'band_blast',
        life: 35, power: 32, isPlayer: true
      });
    } else if (selectedChar.id === 'rakesh') {
      // Old School Aura Armor
      player.invulTimer = 240;
    } else if (selectedChar.id === 'herman') {
      // Debug Mode Overclock Multi-Dumbbells
      for (let i = 0; i < 6; i++) {
        projectiles.push({
          x: player.x, y: player.y,
          vx: dir * (3.5 + i * 0.8), vy: -2.0 + (i % 3) * 1.5,
          w: 12, h: 12, type: 'dumbbell_throw',
          life: 45, power: 25, isPlayer: true
        });
      }
    }
  }

  /* ══ UPDATE LOOP ═══════════════════════════════════════════ */
  function update() {
    frame++;

    if (screenShake > 0) screenShake--;
    if (screenFlash > 0) screenFlash--;

    const held = window.__held || {};
    const aEdge = window.__aEdge || false;

    // Intro Screen Logic
    if (gameState === 'intro') {
      introTimer++;
      if (aEdge || introTimer > 180) {
        gameState = 'char_select';
        Audio8.sfx('start');
      }
      return;
    }

    // Character Select Logic
    if (gameState === 'char_select') {
      if (held.left && !held._lastL) {
        selectedCharIndex = (selectedCharIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
        selectedChar = CHARACTERS[selectedCharIndex];
        Audio8.sfx('menu');
      }
      if (held.right && !held._lastR) {
        selectedCharIndex = (selectedCharIndex + 1) % CHARACTERS.length;
        selectedChar = CHARACTERS[selectedCharIndex];
        Audio8.sfx('menu');
      }
      held._lastL = held.left;
      held._lastR = held.right;

      if (aEdge) {
        selectedChar = CHARACTERS[selectedCharIndex];
        initGameWorld();
        gameState = 'play';
        Audio8.sfx('cartridge');
        Audio8.music('mario');
      }
      return;
    }

    // Active Workout Checkpoint Modal
    if (workout.active) {
      if (aEdge) {
        registerWorkoutRep();
      }
      return;
    }

    if (gameState === 'win' || gameState === 'gameover') {
      if (aEdge) {
        gameState = 'char_select';
        Audio8.sfx('start');
      }
      return;
    }

    // Floating text update
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.life--;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }

    // Particles update
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Special power timer
    if (player.isSpecialActive) {
      player.specialDuration--;
      if (player.specialDuration <= 0) player.isSpecialActive = false;
    }
    if (player.invulTimer > 0) player.invulTimer--;
    if (player.attackTimer > 0) player.attackTimer--;

    // ── Player Controls ─────────────────────────────────────
    const speed = (selectedChar.stats.speed >= 4 ? 2.4 : 1.9) * (held.b ? 1.5 : 1.0);

    if (held.left) {
      player.vx = -speed;
      player.facing = 'left';
      player.state = 'run';
    } else if (held.right) {
      player.vx = speed;
      player.facing = 'right';
      player.state = 'run';
    } else {
      player.vx *= 0.8;
      if (Math.abs(player.vx) < 0.1) {
        player.vx = 0;
        if (player.grounded && player.attackTimer <= 0) player.state = 'idle';
      }
    }

    // Jump
    if (aEdge && player.grounded) {
      player.vy = -6.2;
      player.grounded = false;
      Audio8.sfx('jump');
    }

    // Attack action (Triggered by Attack button)
    if (held.b && player.attackTimer <= 0) {
      performAttack();
    }

    // Special button (Triggered when holding both or tapping special)
    if (held.up && player.specialCharge >= 100) {
      triggerSpecialAbility();
    }

    // Apply gravity
    player.vy = Math.min(6.5, player.vy + 0.36);

    // Horizontal Movement & Collisions
    player.x += player.vx;
    platforms.forEach(plat => {
      if (boxOverlap(player.x, player.y, player.w, player.h, plat.x, plat.y, plat.w, plat.h)) {
        if (plat.breakable && player.state === 'attack') {
          // Smash foam block!
          plat.hp--;
          Audio8.sfx('brick');
          score += 100;
          for (let i = 0; i < 4; i++) {
            particles.push({
              x: plat.x + 8, y: plat.y + 8,
              vx: (Math.random() - 0.5) * 4, vy: -3 + Math.random() * 2,
              life: 25, col: '#ffe04f'
            });
          }
        } else if (player.vx > 0) {
          player.x = plat.x - player.w;
          player.vx = 0;
        } else if (player.vx < 0) {
          player.x = plat.x + plat.w;
          player.vx = 0;
        }
      }
    });
    platforms = platforms.filter(p => !p.breakable || p.hp > 0);

    // Vertical Movement & Treadmill Conveyor Effect
    player.grounded = false;
    player.y += player.vy;

    // Treadmills
    treadmills.forEach(tm => {
      if (player.x + player.w > tm.x && player.x < tm.x + tm.w &&
          player.y + player.h >= tm.y && player.y + player.h <= tm.y + tm.h + 6 && player.vy >= 0) {
        player.y = tm.y - player.h;
        player.vy = 0;
        player.grounded = true;
        player.x += tm.speed; // Conveyor drag!
      }
    });

    // Solid Platforms
    platforms.forEach(plat => {
      if (boxOverlap(player.x, player.y, player.w, player.h, plat.x, plat.y, plat.w, plat.h)) {
        if (player.vy > 0) {
          player.y = plat.y - player.h;
          player.vy = 0;
          player.grounded = true;
        } else if (player.vy < 0) {
          player.y = plat.y + plat.h;
          player.vy = 0;
        }
      }
    });

    // Pit fall clamp
    if (player.y > 240) {
      player.y = 150;
      player.hp -= 20;
      Audio8.sfx('hit');
    }

    // Token Pickups
    tokens.forEach(tok => {
      if (!tok.collected && boxOverlap(player.x, player.y, player.w, player.h, tok.x, tok.y, 12, 12)) {
        tok.collected = true;
        fitwayTokens++;
        score += 250;
        xp += 50;
        Audio8.sfx('coin');
        floatingTexts.push({ text: '+1 FITWAY TOKEN', x: tok.x, y: tok.y - 10, life: 40, vy: -0.6, col: '#ffd000' });
      }
    });

    // Checkpoint Trigger Detection
    checkpoints.forEach(cp => {
      if (!cp.done && boxOverlap(player.x, player.y, player.w, player.h, cp.x, cp.y, cp.w, cp.h)) {
        cp.done = true;
        triggerWorkout(cp.title, selectedChar.challengeTarget);
      }
    });

    // Safe Room Recovery Area (Zone 6)
    if (player.x > 3050 && player.x < 3300 && player.hp < player.maxHp) {
      player.hp = Math.min(player.maxHp, player.hp + 0.2);
    }

    // ── Projectiles Update ──────────────────────────────────
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) { projectiles.splice(i, 1); continue; }

      // Player projectiles hitting enemies
      if (p.isPlayer) {
        // Hit Boss
        if (boss && boxOverlap(p.x, p.y, p.w, p.h, boss.x, boss.y, boss.w, boss.h)) {
          if (!boss.shielded) {
            boss.hp -= p.power;
            Audio8.sfx('hit');
            screenShake = 6;
            floatingTexts.push({ text: `-${p.power}`, x: boss.x + 20, y: boss.y - 10, life: 30, vy: -0.7, col: '#ff5fa2' });

            // Boss Fitness Break Trigger at 50% HP
            if (boss.hp <= 30 && boss.phase === 1) {
              boss.phase = 2;
              boss.shielded = true;
              triggerWorkout('BOSS FITNESS BREAK: BREAK HIS SHIELD!', 10, () => {
                boss.shielded = false;
                screenFlash = 16;
                screenShake = 14;
                boss.hp -= 15;
              });
            }

            if (boss.hp <= 0) {
              // Boss Defeated!
              gameState = 'win';
              Audio8.sfx('fanfare');
              screenShake = 24;
              score += 10000;
              xp += 500;
            }
          }
          projectiles.splice(i, 1);
          continue;
        }

        // Hit regular enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (boxOverlap(p.x, p.y, p.w, p.h, e.x, e.y, e.w, e.h)) {
            e.hp -= p.power;
            Audio8.sfx('stomp');
            score += 150;
            xp += 20;
            player.specialCharge = Math.min(100, player.specialCharge + 12);

            // Floating damage
            floatingTexts.push({ text: `-${p.power}`, x: e.x, y: e.y - 8, life: 25, vy: -0.6, col: '#ffe04f' });

            if (e.hp <= 0) {
              // Enemy Defeated
              Audio8.sfx('boom');
              for (let k = 0; k < 6; k++) {
                particles.push({
                  x: e.x + 8, y: e.y + 8,
                  vx: (Math.random() - 0.5) * 3, vy: -2 + Math.random() * 2,
                  life: 20, col: selectedChar.color
                });
              }
              enemies.splice(j, 1);
            }
            projectiles.splice(i, 1);
            break;
          }
        }
      }
    }

    // ── Enemies AI & Update ─────────────────────────────────
    enemies.forEach(e => {
      e.x += e.vx;
      // Reverse at patrol bounds
      if (Math.abs(e.x - player.x) > 300) return;

      // Enemy hit player
      if (boxOverlap(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
        if (player.invulTimer <= 0) {
          player.hp -= 10;
          player.invulTimer = 60;
          player.vx = (player.x < e.x ? -3.0 : 3.0);
          player.vy = -3.0;
          screenShake = 8;
          Audio8.sfx('hit');
          if (player.hp <= 0) {
            gameState = 'gameover';
            Audio8.sfx('die');
          }
        }
      }
    });

    // ── Boss AI (The Sedentary King) ────────────────────────
    if (boss && Math.abs(player.x - boss.x) < 280) {
      boss.anim++;
      boss.attackTimer--;

      if (boss.attackTimer <= 0) {
        boss.attackTimer = boss.phase === 2 ? 45 : 75;
        // Boss throws sofa cushions or summons lazy snacks
        projectiles.push({
          x: boss.x - 10, y: boss.y + 20,
          vx: -3.2, vy: -1.2,
          w: 16, h: 14, type: 'cushion_projectile',
          life: 60, power: 12, isPlayer: false
        });
        Audio8.sfx('bump');
      }
    }

    // Camera follow player smoothly
    const targetCamX = Math.max(0, player.x - 80);
    cameraX += (targetCamX - cameraX) * 0.12;
  }

  /* ══ RENDERING ════════════════════════════════════════════ */
  function render(ctx) {
    if (ctx) g = ctx;
    if (!g) return;

    g.save();

    // Screen shake
    if (screenShake > 0) {
      g.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    if (gameState === 'intro') {
      renderIntro();
      g.restore();
      return;
    }

    if (gameState === 'char_select') {
      renderCharSelect();
      g.restore();
      return;
    }

    // Draw Gym Level
    renderGymWorld();

    g.restore();

    // HUD & Overlays
    renderGameHUD();

    if (workout.active) {
      renderWorkoutModal();
    } else if (gameState === 'win') {
      renderWinScreen();
    } else if (gameState === 'gameover') {
      renderGameOverScreen();
    }

    // Screen Flash
    if (screenFlash > 0) {
      g.fillStyle = `rgba(255,255,255,${(screenFlash / 16).toFixed(2)})`;
      g.fillRect(0, 0, W, H);
    }
  }

  /* ── Intro Cinematic ─────────────────────────────────────── */
  function renderIntro() {
    g.fillStyle = '#0a0a14';
    g.fillRect(0, 0, W, H);

    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = '#ffd000';
    g.textAlign = 'center';
    g.fillText('FITWAY PRESENTS', W / 2, 60);

    g.font = '16px "Press Start 2P", monospace';
    g.fillStyle = '#ffffff';
    g.fillText('IRON RUN', W / 2, 95);

    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = '#ff5fa2';
    g.fillText('A FITNESS ARCADE ADVENTURE', W / 2, 120);

    if (Math.floor(frame / 20) % 2 === 0) {
      g.fillStyle = '#8fe3c8';
      g.font = '8px "Press Start 2P", monospace';
      g.fillText('PRESS A OR TAP TO ENTER GYM', W / 2, 175);
    }
    g.textAlign = 'left';
  }

  /* ── Character Select Screen ─────────────────────────────── */
  function renderCharSelect() {
    g.fillStyle = '#12081f';
    g.fillRect(0, 0, W, H);

    // Header
    g.fillStyle = '#ffd000';
    g.font = '10px "Press Start 2P", monospace';
    g.textAlign = 'center';
    g.fillText('SELECT YOUR TRAINER', W / 2, 22);

    // Selected Character Showcase Box
    const char = CHARACTERS[selectedCharIndex];
    Dialogue.panel(g, 16, 32, W - 32, 140);

    // Character Name & Title
    g.fillStyle = char.color;
    g.font = '10px "Press Start 2P", monospace';
    g.fillText(char.name, W / 2, 46);

    g.fillStyle = '#ffffff';
    g.font = '6px "Press Start 2P", monospace';
    g.fillText(char.title, W / 2, 58);

    // Animated Character Large Sprite Box
    drawLargeCharSprite(char, W / 2 - 16, 70);

    // Weapon & Special
    g.font = '6px "Press Start 2P", monospace';
    g.textAlign = 'left';
    g.fillStyle = '#ffd000';
    g.fillText(`WEAPON : ${char.weapon}`, 26, 116);
    g.fillStyle = '#8fe3c8';
    g.fillText(`SPECIAL: ${char.specialName}`, 26, 128);
    g.fillStyle = '#ff5fa2';
    g.fillText(`EXERCISE: ${char.challengeName}`, 26, 140);

    // Stats bar display
    drawStatPips('PWR', char.stats.power, 26, 154);
    drawStatPips('SPD', char.stats.speed, 140, 154);

    // Navigation Prompt
    g.textAlign = 'center';
    g.fillStyle = Math.floor(frame / 20) % 2 === 0 ? '#ffd000' : '#ffffff';
    g.font = '7px "Press Start 2P", monospace';
    g.fillText('◄ USE D-PAD / ARROWS ►', W / 2, 190);
    g.fillText('PRESS A / SPACE TO CONFIRM', W / 2, 204);
    g.textAlign = 'left';
  }

  function drawStatPips(label, val, x, y) {
    g.fillStyle = '#ffffff';
    g.font = '6px "Press Start 2P", monospace';
    g.fillText(label, x, y);
    for (let i = 0; i < 5; i++) {
      g.fillStyle = (i < val ? '#ffd000' : '#333333');
      g.fillRect(x + 30 + i * 8, y - 5, 6, 6);
    }
  }

  function drawLargeCharSprite(char, x, y) {
    // Large pixel sprite
    g.fillStyle = char.color;
    g.fillRect(x + 4, y, 24, 28);
    g.fillStyle = '#fce0a8'; // Skin
    g.fillRect(x + 8, y + 4, 16, 10);
    g.fillStyle = '#000000'; // Eyes
    g.fillRect(x + 12, y + 6, 2, 2);
    g.fillRect(x + 18, y + 6, 2, 2);
    g.fillStyle = char.darkColor; // Gym tank
    g.fillRect(x + 6, y + 14, 20, 14);
  }

  /* ── Living Gym World Render ─────────────────────────────── */
  function renderGymWorld() {
    // Dynamic gym backdrop color based on area
    g.fillStyle = '#1b1b2f';
    g.fillRect(0, 0, W, H);

    g.save();
    g.translate(-Math.floor(cameraX), 0);

    // Fitway Branding Sign on Exterior (x: 40)
    g.fillStyle = '#000000';
    g.fillRect(20, 30, 120, 36);
    g.fillStyle = '#ffd000';
    g.fillRect(22, 32, 116, 32);
    g.fillStyle = '#000000';
    g.font = '12px "Press Start 2P", monospace';
    g.fillText('FITWAY', 34, 52);

    // Section Area Markers
    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = 'rgba(255,208,0,0.6)';
    g.fillText('RECEPTION', 160, 80);
    g.fillText('CARDIO ZONE', 720, 80);
    g.fillText('STRENGTH & WEIGHTS', 1700, 80);
    g.fillText('FUNCTIONAL & BOXING', 2500, 80);
    g.fillText('RECOVERY LOUNGE', 3080, 80);
    g.fillText('PERFORMANCE LAB', 3500, 80);
    g.fillText('BOSS: SEDENTARY KING', 4100, 80);

    // Platforms & Gym Equipment
    platforms.forEach(plat => {
      if (plat.type === 'floor_reception') {
        g.fillStyle = '#e8d8c8'; // Elegant wood reception floor
        g.fillRect(plat.x, plat.y, plat.w, plat.h);
        g.fillStyle = '#ffd000'; // Fitway yellow accent stripe
        g.fillRect(plat.x, plat.y, plat.w, 4);
      } else if (plat.type === 'floor_cardio') {
        g.fillStyle = '#222831'; // Modern gym rubber mat
        g.fillRect(plat.x, plat.y, plat.w, plat.h);
        g.fillStyle = '#00adb5';
        g.fillRect(plat.x, plat.y, plat.w, 3);
      } else if (plat.type === 'floor_weights') {
        g.fillStyle = '#1a1a1a'; // Heavy duty black gym rubber
        g.fillRect(plat.x, plat.y, plat.w, plat.h);
        g.fillStyle = '#ffd000';
        g.fillRect(plat.x, plat.y, plat.w, 4);
      } else if (plat.type === 'foam_blocks') {
        g.fillStyle = '#ffe04f';
        g.fillRect(plat.x, plat.y, plat.w, plat.h);
        g.fillStyle = '#d3216b';
        g.strokeRect(plat.x + 0.5, plat.y + 0.5, plat.w - 1, plat.h - 1);
        g.font = '6px "Press Start 2P", monospace';
        g.fillText('HIT', plat.x + 2, plat.y + 8);
      } else if (plat.type === 'reception_desk') {
        g.fillStyle = '#5c3d2e';
        g.fillRect(plat.x, plat.y, plat.w, plat.h);
        g.fillStyle = '#ffd000';
        g.fillRect(plat.x + 2, plat.y + 2, plat.w - 4, 4);
      } else {
        g.fillStyle = '#393e46';
        g.fillRect(plat.x, plat.y, plat.w, plat.h);
        g.fillStyle = '#ffd000';
        g.fillRect(plat.x, plat.y, plat.w, 2);
      }
    });

    // Treadmills with animated belts
    treadmills.forEach(tm => {
      g.fillStyle = '#000000';
      g.fillRect(tm.x, tm.y, tm.w, tm.h);
      g.fillStyle = '#ffd000';
      const offset = (frame * tm.speed * 2) % 12;
      for (let tx = tm.x + offset; tx < tm.x + tm.w; tx += 12) {
        if (tx >= tm.x) g.fillRect(tx, tm.y + 2, 4, tm.h - 4);
      }
    });

    // Fitway Tokens
    tokens.forEach(tok => {
      if (!tok.collected) {
        g.fillStyle = '#ffd000';
        g.beginPath();
        g.arc(tok.x + 6, tok.y + 6, 6, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#000000';
        g.font = '6px "Press Start 2P", monospace';
        g.fillText('F', tok.x + 3, tok.y + 2);
      }
    });

    // NPCs & Dialogues
    gymNPCs.forEach(npc => {
      g.fillStyle = '#8fe3c8';
      g.fillRect(npc.x, npc.y, 14, 20);
      g.fillStyle = '#ffffff';
      g.fillRect(npc.x + 2, npc.y + 2, 10, 6);
      if (Math.abs(player.x - npc.x) < 40) {
        Dialogue.panel(g, npc.x - 20, npc.y - 26, npc.msg.length * 6 + 14, 16);
        g.font = '5px "Press Start 2P", monospace';
        g.fillStyle = '#1a1a1a';
        g.fillText(npc.msg, npc.x - 14, npc.y - 20);
      }
    });

    // Checkpoints Stations
    checkpoints.forEach(cp => {
      g.fillStyle = cp.done ? '#8fe3c8' : '#ffd000';
      g.fillRect(cp.x, cp.y, cp.w, cp.h);
      g.fillStyle = '#000000';
      g.fillRect(cp.x + 4, cp.y + 4, cp.w - 8, cp.h - 8);
      g.fillStyle = '#ffd000';
      g.font = '6px "Press Start 2P", monospace';
      g.fillText('REP', cp.x + 4, cp.y + 12);
    });

    // Enemies
    enemies.forEach(e => {
      drawEnemy(e);
    });

    // Boss (The Sedentary King)
    if (boss) {
      drawBoss(boss);
    }

    // Projectiles
    projectiles.forEach(p => {
      drawProjectile(p);
    });

    // Player
    drawPlayer();

    // Floating texts
    floatingTexts.forEach(ft => {
      g.font = '6px "Press Start 2P", monospace';
      g.fillStyle = ft.col || '#ffffff';
      g.fillText(ft.text, ft.x, ft.y);
    });

    g.restore();
  }

  function drawPlayer() {
    const px = player.x, py = player.y;

    g.save();
    if (player.facing === 'left') {
      g.translate(px + player.w, py);
      g.scale(-1, 1);
    } else {
      g.translate(px, py);
    }

    // Player body
    g.fillStyle = selectedChar.color;
    g.fillRect(2, 2, 12, 16);
    g.fillStyle = '#fce0a8'; // Skin
    g.fillRect(4, 2, 8, 6);
    g.fillStyle = '#000'; // Eyes
    g.fillRect(8, 4, 2, 2);

    // Gym outfit
    g.fillStyle = selectedChar.darkColor;
    g.fillRect(2, 8, 12, 10);

    // Special aura effect
    if (player.isSpecialActive) {
      g.strokeStyle = (frame % 4 < 2 ? '#ffd000' : '#ff5fa2');
      g.strokeRect(-2, -2, player.w + 4, player.h + 4);
    }

    g.restore();
  }

  function drawEnemy(e) {
    if (e.type === 'treadmill_bot') {
      g.fillStyle = '#00adb5';
      g.fillRect(e.x, e.y, e.w, e.h);
      g.fillStyle = '#ff5fa2';
      g.fillRect(e.x + 2, e.y + 4, 4, 4);
    } else if (e.type === 'dumbbell_golem') {
      g.fillStyle = '#393e46';
      g.fillRect(e.x, e.y, e.w, e.h);
      g.fillStyle = '#ffd000';
      g.fillRect(e.x + 4, e.y + 4, e.w - 8, e.h - 8);
    } else {
      g.fillStyle = '#e23e57';
      g.fillRect(e.x, e.y, e.w, e.h);
    }
  }

  function drawBoss(b) {
    g.fillStyle = '#7a0f42';
    g.fillRect(b.x, b.y, b.w, b.h);
    g.fillStyle = '#ffd000';
    g.fillRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16);
    g.fillStyle = '#ffffff';
    g.font = '6px "Press Start 2P", monospace';
    g.fillText('KING LAZY', b.x + 4, b.y - 10);

    // Boss HP bar
    const ratio = Math.max(0, b.hp / b.maxHp);
    g.fillStyle = '#333333';
    g.fillRect(b.x, b.y - 6, b.w, 4);
    g.fillStyle = b.shielded ? '#00adb5' : '#e23e57';
    g.fillRect(b.x, b.y - 6, b.w * ratio, 4);
  }

  function drawProjectile(p) {
    g.fillStyle = p.isPlayer ? selectedChar.color : '#e23e57';
    g.fillRect(p.x, p.y, p.w, p.h);
  }

  /* ── Game HUD ────────────────────────────────────────────── */
  function renderGameHUD() {
    g.fillStyle = '#ffffff';
    g.font = '7px "Press Start 2P", monospace';

    // Character Name & HP
    g.fillText(`${selectedChar.name}`, 16, 14);
    g.fillStyle = '#333333';
    g.fillRect(16, 18, 60, 6);
    g.fillStyle = '#e23e57';
    g.fillRect(16, 18, (player.hp / player.maxHp) * 60, 6);

    // Special Meter
    g.fillStyle = '#ffffff';
    g.fillText('SPECIAL', 90, 14);
    g.fillStyle = '#333333';
    g.fillRect(90, 18, 50, 6);
    g.fillStyle = player.specialCharge >= 100 ? '#ffd000' : '#8fe3c8';
    g.fillRect(90, 18, (player.specialCharge / 100) * 50, 6);

    // Fitway Tokens & Streak
    g.fillStyle = '#ffd000';
    g.fillText(`🪙 x${fitwayTokens}`, 155, 18);
    g.fillText(`🔥 ${dailyStreak}d`, 205, 18);
  }

  /* ── Interactive Workout Checkpoint Modal ─────────────────── */
  function renderWorkoutModal() {
    g.fillStyle = 'rgba(0,0,0,0.85)';
    g.fillRect(0, 0, W, H);

    Dialogue.panel(g, 20, 30, W - 40, 160);

    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = '#ffd000';
    g.textAlign = 'center';
    g.fillText(workout.title, W / 2, 48);

    g.fillStyle = '#ffffff';
    g.font = '7px "Press Start 2P", monospace';
    g.fillText(workout.exercise, W / 2, 70);

    // Giant Counter
    g.font = '24px "Press Start 2P", monospace';
    g.fillStyle = '#8fe3c8';
    const pad = (v) => String(v).padStart(2, '0');
    g.fillText(`${pad(workout.current)} / ${pad(workout.target)}`, W / 2, 110);

    // Pump button instruction
    if (Math.floor(frame / 16) % 2 === 0) {
      g.font = '8px "Press Start 2P", monospace';
      g.fillStyle = '#ffd000';
      g.fillText('TAP A / SCREEN TO REP!', W / 2, 150);
    }
    g.textAlign = 'left';
  }

  function renderWinScreen() {
    g.fillStyle = 'rgba(0,0,0,0.85)';
    g.fillRect(0, 0, W, H);

    Dialogue.panel(g, 24, 30, W - 48, 160);
    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = '#ffd000';
    g.textAlign = 'center';
    g.fillText('FITWAY MISSION COMPLETE!', W / 2, 50);

    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = '#ffffff';
    g.fillText(`FINAL SCORE : ${score}`, W / 2, 75);
    g.fillText(`REPS COMPLETED: ${totalRepsCompleted}`, W / 2, 90);
    g.fillText(`XP EARNED   : ${xp}`, W / 2, 105);
    g.fillText(`DAILY STREAK: 🔥 ${dailyStreak} DAYS!`, W / 2, 120);

    g.fillStyle = '#8fe3c8';
    g.fillText('COME BACK TOMORROW TO TRAIN!', W / 2, 145);
    g.fillStyle = '#ffd000';
    g.fillText('PRESS A TO RETURN', W / 2, 165);
    g.textAlign = 'left';
  }

  function renderGameOverScreen() {
    g.fillStyle = 'rgba(0,0,0,0.9)';
    g.fillRect(0, 0, W, H);

    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = '#e23e57';
    g.textAlign = 'center';
    g.fillText('WORKOUT PAUSED', W / 2, 90);

    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = '#ffd000';
    g.fillText('DRINK WATER & RETRY!', W / 2, 120);
    g.fillText('PRESS A TO TRY AGAIN', W / 2, 145);
    g.textAlign = 'left';
  }

  function boxOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  /* ══ PUBLIC INTERFACE ═════════════════════════════════════ */
  function start(ctx) {
    g = ctx;
    running = true;
    gameState = 'intro';
    introTimer = 0;
  }

  function stop() {
    running = false;
    Audio8.stop();
  }

  function reset() {
    gameState = 'char_select';
  }

  function onAction() {
    if (gameState === 'intro') {
      gameState = 'char_select';
      Audio8.sfx('start');
    } else if (gameState === 'char_select') {
      selectedChar = CHARACTERS[selectedCharIndex];
      initGameWorld();
      gameState = 'play';
      Audio8.sfx('cartridge');
      Audio8.music('mario');
    } else if (workout.active) {
      registerWorkoutRep();
    } else if (gameState === 'win' || gameState === 'gameover') {
      gameState = 'char_select';
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
      title: "FITWAY: IRON RUN",
      score,
      xp,
      reps: totalRepsCompleted,
      streak: dailyStreak,
      char: selectedChar ? selectedChar.name : "SUKH"
    })
  };
})();
