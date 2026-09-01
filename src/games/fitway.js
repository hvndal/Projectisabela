/* ============================================================
   FITWAY: IRON RUN — 512×448 Full Dynamic Animation Edition
   Sector 67, Mohali • Living World, Action Poses & Kinetic Physics
   ============================================================
   Dynamic Animation Engine Features:
   - Unique Character Workout & Action Animations on [A] Tap:
     * Herman: Dual Dumbbell Curls with Cyan Energy Sparks
     * Sukh: Olympic Barbell Squat with Bar Flex Physics
     * Gagan: Heavy Kettlebell Swings with Dynamic Chalk Puffs
     * Shubham: High-Speed Resistance Band Blast with Vibration
     * Rakesh: Strict EZ-Bar Curls with Golden Form Sparkles
   - Kinetic Idle Behaviors:
     * Brow-wiping sweat towel animation & floating sweat drops
     * Smartwatch pulse check & whistle adjustments
   - Living Environmental Prop Animations:
     * Treadmill with Animated EKG Heart Rate Graph & Pace Scroll
     * Wall Speakers with Pulsing Audio Basswave Rings
     * Real-Time 7-Segment Digital Timer Counting Seconds
     * Suspended Punching Bag Sway Physics with Steel Link Chains
     * Water Cooler Rising Air Bubbles & Cold Condensation Vapor
     * Rustling Monstera & Ficus Leaves swaying with Ceiling Fan
     * Full-Length Chrome Mirror Shimmer Glints
   - Explosive Workout Celebration Particles, Rep Confetti & Screen Shake
   ============================================================ */

window.FitwayGame = (() => {
  'use strict';
  const W = 512, H = 448, TS = 32, COLS = 16, ROWS = 14;
  let g = null, frame = 0;

  /* ═══ MASTERPIECE COLOR PALETTE ═══════════════════════════ */
  const C = {
    wood1: '#b88652', wood2: '#9e6d3c', wood3: '#835429', wood4: '#cf9e6b',
    woodLine: '#66411d', woodKnot: '#543213', woodHi: 'rgba(255, 255, 255, 0.09)',
    rubber1: '#262932', rubber2: '#1c1e26', rubber3: '#323644', rubberBorder: '#ffd000',
    turfBlue: '#154878', turfBlueLt: '#2062a0', turfLine: '#ffffff',
    carpetRed: '#8f242e', carpetRedLt: '#b83240', platformWood: '#d7a15c',
    wall: '#ede5d8', wallDk: '#cfc0ad', wallTop: '#786856', baseboard: '#442d1b', baseboardHi: '#6b492f',
    fy: '#ffd000', fyDk: '#cc9900', fyLt: '#ffe766', fyGlow: 'rgba(255, 208, 0, 0.5)',
    fblk: '#0d0f14', fblk2: '#161922', fblk3: '#222634',
    metal: '#949ea8', metalDk: '#505862', metalLt: '#c8d4e0', metalHi: '#f2f7fc',
    plateRed: '#e53935', plateBlue: '#1e88e5', plateYellow: '#fdd835', plateGreen: '#43a047',
    mirror: '#a0c8dc', mirrorLt: '#cce4f2', mirrorHi: '#ffffff',
    glass: '#88bad8', waterJug: '#4fc3f7',
    sunbeam: 'rgba(255, 245, 210, 0.15)', sunbeamCore: 'rgba(255, 250, 230, 0.28)',
    cyan: '#00e5ff', red: '#f03a3a', emerald: '#00e676', orange: '#ff9100', purple: '#ab47bc',
    uiGlass: 'rgba(13, 15, 20, 0.92)', uiGlassBorder: '#ffd000', uiText: '#f0f3f8', uiMuted: '#8a94a6',
    black: '#000000', white: '#ffffff', shadow: 'rgba(0, 0, 0, 0.38)'
  };

  /* ═══ 5 PLAYABLE FITWAY HEROES ═══════════════════════════ */
  const CHARS = [
    {
      id: 'herman',
      name: 'HERMAN',
      title: 'SOFTWARE & HARDWARE ENGINEER',
      subtitle: 'APPARENTLY IT SUPPORT',
      quote: '"The machine isn\'t broken.\n Your firmware is."',
      weapon: 'DUAL DUMBBELLS',
      special: 'MACHINE OVERRIDE / DEBUG',
      challenge: 'DUMBBELL CURLS',
      reps: 10,
      stats: [3, 5, 2, 5, 4],
      col: { hair: '#22150c', skin: '#f8d0b0', shirt: '#455a64', shirtDk: '#263238', pants: '#1e242b', shoes: '#111317', acc: 'glasses' },
      build: 'lean'
    },
    {
      id: 'sukh',
      name: 'SUKH',
      title: 'THE OWNER & FOUNDER',
      subtitle: 'FINAL TESTER OF FITWAY',
      quote: '"I built this gym. You think\n I can\'t handle a barbell?"',
      weapon: 'OLYMPIC BARBELL',
      special: "OWNER'S AUTHORITY",
      challenge: 'BARBELL SQUATS',
      reps: 10,
      stats: [5, 2, 5, 4, 3],
      col: { hair: '#0e0e12', skin: '#e2b384', shirt: '#ffd000', shirtDk: '#cc9900', pants: '#121418', shoes: '#1e2026', acc: 'whistle' },
      build: 'broad'
    },
    {
      id: 'gagan',
      name: 'GAGAN',
      title: 'POWER TRAINER',
      subtitle: 'TECHNIQUE POLICE',
      quote: '"Back straight. No rushing.\n One more rep. Always."',
      weapon: 'GIANT KETTLEBELL',
      special: 'KETTLE CRUSH',
      challenge: 'KETTLEBELL SWINGS',
      reps: 15,
      stats: [5, 2, 4, 3, 3],
      col: { hair: '#121216', skin: '#c89060', shirt: '#181a20', shirtDk: '#0c0d10', pants: '#2c333e', shoes: '#111317', acc: 'headband' },
      build: 'athletic'
    },
    {
      id: 'shubham',
      name: 'SHUBHAM',
      title: 'CONDITIONING TRAINER',
      subtitle: 'SPEED & AGILITY DEMON',
      quote: '"Speed is everything.\n Never. Stop. Moving."',
      weapon: 'RESISTANCE BAND',
      special: 'BAND BLAST',
      challenge: 'BAND PULLS',
      reps: 20,
      stats: [3, 5, 2, 5, 5],
      col: { hair: '#0e0e12', skin: '#e2b384', shirt: '#00b0ff', shirtDk: '#0081cb', pants: '#1f2630', shoes: '#005b94', acc: 'band' },
      build: 'lean'
    },
    {
      id: 'rakesh',
      name: 'RAKESH',
      title: 'OLD-SCHOOL TRAINER',
      subtitle: 'VETERAN FORM PURIST',
      quote: '"Good form. Always good form.\n No shortcuts in 20 years."',
      weapon: 'EZ-CURL BAR',
      special: 'OLD SCHOOL POWER',
      challenge: 'EZ-BAR CURLS',
      reps: 10,
      stats: [4, 3, 4, 4, 3],
      col: { hair: '#606770', skin: '#c89060', shirt: '#00e676', shirtDk: '#00a352', pants: '#00a352', shoes: '#3a2215', acc: 'stripe' },
      build: 'stocky'
    }
  ];
  const STAT_NAMES = ['POW', 'SPD', 'DEF', 'TEC', 'RNG'];

  /* ═══ 4 COMPLETE CHAPTERS & OBJECTIVES ═════════════════════ */
  const CHAPTERS = [
    {
      num: 1,
      title: 'JUST COME TO THE GYM',
      desc: 'Arrival at Sector 67, Gagan kettlebell test & cardio firmware crash',
      objectives: [
        'Check in with Sukh at reception desk',
        'Find Gagan in the Cardio & Kettlebell zone',
        'Complete 15 Kettlebell Swings with Gagan',
        'REBOOT OVERHEATING TREADMILL FIRMWARE!'
      ]
    },
    {
      num: 2,
      title: 'THE BENCH IS NOT RESERVED',
      desc: 'Flat bench press dispute & Shubham high-speed conditioning challenge',
      objectives: [
        'Talk to Gagan at the Flat Bench Press station',
        'Meet Shubham on the Blue Agility Turf',
        'Pump 20 Speed Resistance Band Pulls with Shubham'
      ]
    },
    {
      num: 3,
      title: 'EVERYONE KNOWS EVERYONE',
      desc: 'Sector 67 gym gossip & Uncle Rakesh veteran form purist trial',
      objectives: [
        'Talk to Uncle Rakesh near the EZ-Bar Curl rack',
        'Perform 10 Strict Form EZ-Bar Curls',
        'Qualify for the Fitway Powerlifting Competition'
      ]
    },
    {
      num: 4,
      title: 'THE WEIGHTS FLOOR (FINALE)',
      desc: 'Floor 2 unlock, blackout surge, Sukh philosophy & Owner squat boss test',
      objectives: [
        'Talk to the trainers gathered at the staircase',
        'Climb stairs to Floor 2: The Weights Floor',
        'Override the surging gym electrical master circuit',
        'Conquer Sukh\'s Owner Squat Test (15 Reps)!'
      ]
    }
  ];

  /* ═══ STATE & VARIABLES ══════════════════════════════════ */
  let state = 'title'; // title | chapter_select | char_select | chapter_card | explore | dialogue | challenge | chaos_minigame | unlock | credits
  let selectedMenuIndex = 0;
  let menuOptions = [
    'PLAY STORY (CHAPTER 1)',
    'SELECT CHAPTER (1-4)',
    'CHARACTER SELECT (SF2)',
    'FREE ROAM SECTOR 67 GYM'
  ];
  let chapterSelectIndex = 0;
  let chapter = 1;
  let storyStep = 0;
  let charIdx = 0, selChar = CHARS[0];
  let titleTimer = 0;
  let chapterCardTimer = 0;
  let screenShake = 0;

  // Player with floating-point position for ultra-smooth movement
  let pl = {
    x: 224, y: 320,
    dir: 'down', moving: false,
    walkT: 0, walkFrame: 0, spd: 3.5,
    interactCooldown: 0,
    actionTimer: 0, // Workout / Action pose timer
    idleTimer: 0,
    hp: 100, maxHp: 100,
    energy: 85, maxEnergy: 100,
    stamina: 100, maxStamina: 100
  };

  // Dynamic Particles: Dust, Sparks, Sweat, Confetti
  let dustPuffs = [];
  let sparks = [];
  let confetti = [];

  function spawnDust(x, y) {
    dustPuffs.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 4,
      sz: 3 + Math.random() * 3,
      alpha: 0.6,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.2 - Math.random() * 0.3
    });
  }

  function spawnSparks(x, y, color) {
    for (let i = 0; i < 6; i++) {
      sparks.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: -1.5 - Math.random() * 2,
        col: color || C.cyan,
        sz: 2 + Math.random() * 2,
        alpha: 1
      });
    }
  }

  function spawnRepConfetti(x, y) {
    const colors = [C.fy, C.cyan, C.emerald, '#ff4081', '#ffffff'];
    for (let i = 0; i < 18; i++) {
      confetti.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -3 - Math.random() * 3,
        col: colors[Math.floor(Math.random() * colors.length)],
        sz: 3 + Math.random() * 3,
        alpha: 1,
        rot: Math.random() * Math.PI
      });
    }
  }

  // Atmospheric Dust Motes & Chalk Particles
  let motes = [];
  function initMotes() {
    motes = [];
    for (let i = 0; i < 42; i++) {
      motes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.15 - Math.random() * 0.35,
        sz: Math.random() > 0.6 ? 2.5 : 1.5,
        alpha: 0.2 + Math.random() * 0.65
      });
    }
  }

  // Room Engine
  let curRoom = null, curRoomId = null;
  let roomBgCanvas = null;

  // Dialogue Engine
  let dlg = {
    active: false,
    lines: [],
    idx: 0,
    charPos: 0,
    timer: 0,
    speaker: '',
    onDone: null
  };

  // Rep Challenge Engine
  let chl = {
    active: false,
    title: 'FITNESS CHECKPOINT',
    name: '',
    trainer: '',
    target: 10,
    current: 0,
    onDone: null
  };

  // Chaos Mini-game
  let minigame = {
    active: false,
    timer: 0,
    score: 0,
    total: 5,
    onDone: null
  };

  // Unlock Display
  let unlockAnim = {
    active: false,
    timer: 0,
    title: '',
    name: '',
    desc: '',
    onDone: null
  };

  // Screen Fade
  let fade = { alpha: 0, dir: 0, cb: null };

  // Room NPCs
  let npcs = [];

  /* ═══ 512×448 DETAILED GYM ROOM MAPS ═════════════════════ */
  const WALKABLE = '._, rbmgsJ><^vE';
  function isWalkable(ch) { return WALKABLE.includes(ch); }

  const ROOMS = {
    main_gym: {
      name: 'FITWAY MAIN GYM — SECTOR 67',
      map: [
        'W.H..H..H..H..HW',
        'Wd.k.J...Jqq..rW',
        'Wd.k.J...Jqq..rW',
        'W..A...C...E...W',
        'W.TT.TT.BB.RR.nW',
        'W.TT.TT.BB.RR.nW',
        'W..............W',
        'W.bK.bb.mm.U.Y.pW',
        'W.bb.bb.mm.U.Y.wW',
        'W.OG.OG........W',
        'W..DD.....LL..>W',
        'W..DD.....LL..>W',
        'W..............W',
        'WWWWWW..WWWWWWWW'
      ],
      spawn: { x: 7 * TS, y: 12 * TS },
      exits: [
        { chars: '>', room: 'weights', sx: 1, sy: 6 },
        { row: 13, col1: 6, col2: 7, room: 'street', sx: 7, sy: 5 }
      ],
      npcs: [
        { id: 'sukh_main', charId: 'sukh', tx: 3, ty: 10, dir: 'down', isStory: true, name: 'SUKH' },
        { id: 'gagan_main', charId: 'gagan', tx: 8, ty: 4, dir: 'down', isStory: true, name: 'GAGAN' },
        { id: 'shubham_main', charId: 'shubham', tx: 3, ty: 7, dir: 'down', isStory: true, name: 'SHUBHAM' },
        { id: 'rakesh_main', charId: 'rakesh', tx: 13, ty: 5, dir: 'left', isStory: true, name: 'RAKESH' },
        { id: 'bench_lifter', tx: 14, ty: 4, dir: 'up', sprite: 'lifter_bench', exercising: true, name: 'BENCH LIFTER' },
        { id: 'treadmill_runner', tx: 2, ty: 4, dir: 'down', sprite: 'member_m', exercising: true, name: 'RUNNER' },
        { id: 'rower_npc', tx: 11, ty: 4, dir: 'right', sprite: 'rower', exercising: true, name: 'ROWER' },
        { id: 'boxer_bag', tx: 11, ty: 7, dir: 'right', sprite: 'boxer', exercising: true, name: 'BOXER' }
      ]
    },
    street: {
      name: 'SECTOR 67, MOHALI — FITWAY EXTERIOR',
      map: [
        'ssssssssssssssss',
        'ssssssssssssssss',
        'gggggggggggggggg',
        'WWWWFFFFFFFFWWWW',
        'W.H..H..H..H..HW',
        'W..............W',
        'W..............W',
        'W..............W',
        'cccccccc..cccccc',
        'ssssssss..ssssss',
        'ssssssss..ssssss',
        'ssssssssssssssss',
        'ssssssssssssssss',
        'ssssssssssssssss'
      ],
      spawn: { x: 7 * TS, y: 11 * TS },
      exits: [
        { row: 4, col1: 6, col2: 9, room: 'main_gym', sx: 7, sy: 12 }
      ],
      npcs: [
        { id: 'street_passer', tx: 3, ty: 12, dir: 'right', sprite: 'member_m', name: 'MOHALI RESIDENT', text: 'Sector 67, Mohali. Fitway Gym is right ahead!' }
      ]
    },
    weights: {
      name: 'FLOOR 2: THE WEIGHTS FLOOR',
      map: [
        'WMMWWWWFFFFFFWMM',
        'W..............W',
        'W.qq..qq..qq...W',
        'W.qq..qq..qq...W',
        'W..............W',
        'W.bb..bb..bb.d.W',
        'W.bb..bb..bb.d.W',
        'W..............W',
        'W..dd..dd..dd..W',
        'W..dd..dd..dd..W',
        'W..............W',
        '<..............W',
        '<..............W',
        'WWWWWWWWWWWWWWWW'
      ],
      spawn: { x: 1 * TS, y: 6 * TS },
      exits: [
        { chars: '<', room: 'main_gym', sx: 14, sy: 10 }
      ],
      npcs: [
        { id: 'sukh_weights', charId: 'sukh', tx: 7, ty: 4, dir: 'down', isStory: true, name: 'SUKH' },
        { id: 'gagan_weights', charId: 'gagan', tx: 3, ty: 7, dir: 'right', isStory: true, name: 'GAGAN' }
      ]
    }
  };

  /* ═══ RICH SITCOM DIALOGUE SCRIPTS ════════════════════════ */
  const DIALOGUES = {
    ch1_sukh_late: [
      { s: 'SUKH', t: 'Late.' },
      { s: 'HERMAN', t: "I'm here." },
      { s: 'SUKH', t: 'Late.' },
      { s: 'HERMAN', t: 'Late for what?' },
      { s: 'SUKH', t: 'Gym.' },
      { s: 'HERMAN', t: "It's not even that late." },
      { s: 'SUKH', t: "That's not the point." },
      { s: 'HERMAN', t: 'What do you want?' },
      { s: 'SUKH', t: 'Gagan is looking for you in Cardio.' },
      { s: 'HERMAN', t: 'Why?' },
      { s: 'SUKH', t: 'Go ask him.' }
    ],
    ch1_gagan_meet: [
      { s: 'GAGAN', t: 'Back straight... Not like that.' },
      { s: 'GAGAN', t: 'There you are. You haven\'t trained yet.' },
      { s: 'HERMAN', t: 'I just walked in the door.' },
      { s: 'GAGAN', t: 'Excuses burn zero calories.\n15 Kettlebell Swings. Show me proper form!' }
    ],
    ch1_treadmill_chaos: [
      { s: null, t: '⚡ BEEP! BEEP! BEEP! ⚡\nCARDIO TREADMILL OVERHEATING: 18.5 KM/H!' },
      { s: 'SUKH', t: 'Fix it, Herman! Computer inside!' },
      { s: 'HERMAN', t: 'I told you the treadmill inverter was glitching!' },
      { s: 'SUKH', t: 'Don\'t give me IT speech! Override it!' }
    ],
    ch1_override_done: [
      { s: 'HERMAN', t: 'Cardio network debugged and reset.' },
      { s: 'SUKH', t: "Next time don't fix it like that." },
      { s: 'HERMAN', t: '...Okay.' },
      { s: 'SUKH', t: 'Now get ready for tomorrow. Gagan has bench issues.' }
    ],
    ch2_bench_drama: [
      { s: 'GAGAN', t: 'Someone has been using my bench!' },
      { s: 'HERMAN', t: 'Does it have your name engraved on it?' },
      { s: 'GAGAN', t: '...No.' },
      { s: 'HERMAN', t: 'Then alternate sets. Solved.' },
      { s: 'GAGAN', t: 'Herman, you don\'t understand the sacred gym code.' },
      { s: 'SHUBHAM', t: 'Forget the heavy bench! Real athletes train speed!' },
      { s: 'SHUBHAM', t: 'Herman! Blue Agility Turf now!\n20 Speed Resistance Band Pulls!' }
    ],
    ch2_shubham_done: [
      { s: 'SHUBHAM', t: 'Not bad! Your acceleration is legit!' },
      { s: 'HERMAN', t: 'Can I just workout normally?' },
      { s: 'SHUBHAM', t: 'Never! Rakesh Uncle is already watching you for Chapter 3.' }
    ],
    ch3_rakesh_meet: [
      { s: 'RAKESH', t: 'Good form. Always good form.' },
      { s: 'RAKESH', t: 'In my 20 years of lifting in Sector 67, I have seen youngsters chase fancy tech and forget strict form.' },
      { s: 'HERMAN', t: 'I just write software.' },
      { s: 'RAKESH', t: 'The Fitway Competition is this weekend.\nLet us test your strict EZ-Bar Curls! 10 Reps!' }
    ],
    ch3_announcement: [
      { s: 'RAKESH', t: 'Solid control. Pure discipline.' },
      { s: 'SUKH', t: 'Announcement! Herman is ready.' },
      { s: 'HERMAN', t: 'Ready for what?' },
      { s: 'SUKH', t: 'Tomorrow, Floor 2 is unlocked.' }
    ],
    ch4_staircase_intro: [
      { s: 'HERMAN', t: 'What?' },
      { s: 'GAGAN', t: 'Nothing.' },
      { s: 'HERMAN', t: 'Why is everyone waiting near the staircase?' },
      { s: 'SUKH', t: 'Go upstairs.' },
      { s: 'HERMAN', t: 'That\'s it?' },
      { s: 'SUKH', t: 'That\'s it.' }
    ],
    ch4_power_surge: [
      { s: null, t: '⚡ WARNING: MAIN GYM ELECTRICAL CONTROLLER OVERLOAD! ⚡' },
      { s: 'HERMAN', t: 'The Floor 2 master circuit is tripping!' },
      { s: 'HERMAN', t: 'Executing Emergency Machine Override!' }
    ],
    ch4_sukh_philosophy: [
      { s: 'SUKH', t: 'Fitway became too complicated over the years.' },
      { s: 'SUKH', t: 'Smart locks, biometric apps, cardio firmware...' },
      { s: 'SUKH', t: 'Gym sirf machines nahi hai. People.' },
      { s: 'SUKH', t: 'Owner\'s Final Test! 15 Heavy Barbell Squats with me!' }
    ],
    ch4_sitcom_end: [
      { s: 'SUKH', t: 'Good. Tomorrow you come again.' },
      { s: 'HERMAN', t: 'I hate this place.' },
      { s: 'GAGAN', t: 'You\'ll be here tomorrow.' },
      { s: 'HERMAN', t: '...Yeah.' }
    ]
  };

  /* ═══ 32×32 HIGH-DEFINITION TILE RENDERER ════════════════ */
  function drawTile(ctx, ch, x, y) {
    switch (ch) {
      case '.': // Walnut Hardwood Plank
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.wood2;
        ctx.fillRect(x, y + 8, TS, 2);
        ctx.fillRect(x, y + 20, TS, 2);
        ctx.fillStyle = C.wood3;
        ctx.fillRect(x + 15, y, 2, TS);
        ctx.fillStyle = C.wood4;
        ctx.fillRect(x + 17, y, 2, TS);
        ctx.fillStyle = C.woodKnot;
        ctx.fillRect(x + 6, y + 4, 3, 2);
        ctx.fillRect(x + 24, y + 14, 3, 2);
        ctx.fillStyle = C.woodHi;
        ctx.fillRect(x + 2, y + 2, TS - 4, 3);
        break;

      case ',': // Vulcanized Rubber
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.rubber3;
        for (let i = 0; i < 8; i++) {
          ctx.fillRect(x + (i % 4) * 8 + 2, y + Math.floor(i / 4) * 16 + 2, 4, 4);
          ctx.fillRect(x + (i % 4) * 8 + 4, y + Math.floor(i / 4) * 16 + 4, 2, 2);
        }
        ctx.fillStyle = '#101218';
        ctx.fillRect(x, y, TS, 2);
        ctx.fillRect(x, y, 2, TS);
        break;

      case 'J': // Deadlift Platform
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.platformWood;
        ctx.fillRect(x + 6, y + 2, 20, 28);
        ctx.fillStyle = C.woodLine;
        ctx.fillRect(x + 6, y + 10, 20, 2);
        ctx.fillRect(x + 6, y + 20, 20, 2);
        ctx.fillStyle = C.metalHi;
        ctx.fillRect(x + 2, y + 14, 28, 3);
        ctx.fillStyle = C.plateRed;
        ctx.fillRect(x + 2, y + 9, 3, 13);
        ctx.fillStyle = C.plateBlue;
        ctx.fillRect(x + 5, y + 11, 2, 9);
        ctx.fillStyle = C.plateRed;
        ctx.fillRect(x + 27, y + 9, 3, 13);
        ctx.fillStyle = C.plateBlue;
        ctx.fillRect(x + 25, y + 11, 2, 9);
        break;

      case 'r': // Red Performance Carpet
        ctx.fillStyle = C.carpetRed;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.carpetRedLt;
        ctx.fillRect(x + 2, y + 2, TS - 4, TS - 4);
        ctx.fillStyle = '#e53935';
        ctx.fillRect(x + 4, y + 4, TS - 8, 2);
        break;

      case 'b': // Agility Turf
        ctx.fillStyle = C.turfBlue;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.turfBlueLt;
        ctx.fillRect(x + 2, y + 2, TS - 4, TS - 4);
        ctx.fillStyle = C.turfLine;
        ctx.fillRect(x + 6, y + 14, TS - 12, 3);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 10, y + 6, 4, 20);
        break;

      case 's': // Street Asphalt
        ctx.fillStyle = '#3a3e48';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#262930';
        ctx.fillRect(x, y + 15, TS, 2);
        ctx.fillRect(x + 15, y, 2, TS);
        break;

      case 'c': // Sidewalk Curb
        ctx.fillStyle = '#7c8696';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#b0bac8';
        ctx.fillRect(x, y, TS, 6);
        ctx.fillStyle = '#525a66';
        ctx.fillRect(x, y + 26, TS, 6);
        break;

      case 'g': // Grass
        ctx.fillStyle = '#3d6c2e';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#528e3f';
        ctx.fillRect(x + 4, y + 6, 4, 8);
        ctx.fillRect(x + 18, y + 14, 4, 8);
        break;

      case 'W': // Wall & Baseboard
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.wallDk;
        ctx.fillRect(x, y + 22, TS, 3);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 25, TS, 7);
        ctx.fillStyle = C.baseboardHi;
        ctx.fillRect(x, y + 25, TS, 2);
        ctx.fillStyle = C.wallTop;
        ctx.fillRect(x, y, TS, 4);
        break;

      case 'H': // Upper Window
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.glass;
        ctx.fillRect(x + 2, y + 2, TS - 4, 20);
        ctx.fillStyle = C.mirrorHi;
        ctx.fillRect(x + 6, y + 4, 8, 16);
        ctx.fillRect(x + 18, y + 4, 8, 16);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 15, y + 2, 3, 20);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 25, TS, 7);
        break;

      case 'F': // Fitway Gold Sign
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 2, y + 6, TS - 4, 20);
        ctx.fillStyle = C.fyLt;
        ctx.fillRect(x + 4, y + 8, TS - 8, 4);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 6, y + 10, 4, 12);
        ctx.fillRect(x + 6, y + 10, 16, 4);
        ctx.fillRect(x + 6, y + 16, 12, 4);
        break;

      case 'M': // Mirror Wall
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.mirror;
        ctx.fillRect(x + 2, y + 2, TS - 4, 24);
        ctx.fillStyle = C.mirrorLt;
        const sh = (frame * 0.4) % 40;
        if (sh < 28) ctx.fillRect(x + 2 + sh, y + 4, 4, 20);
        ctx.fillStyle = C.mirrorHi;
        ctx.fillRect(x + 8, y + 6, 10, 2);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 25, TS, 7);
        break;

      case 'D': // Reception Desk
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fblk2;
        ctx.fillRect(x, y, TS, 28);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x, y + 24, TS, 4);
        ctx.fillStyle = '#21252d';
        ctx.fillRect(x + 6, y + 4, 14, 12);
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x + 8, y + 6, 10, 8);
        break;

      case 'L': // Lockers
        ctx.fillStyle = C.metal;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 15, y, 3, TS);
        ctx.fillRect(x, y + 15, TS, 2);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 2, y + 2, 10, 10);
        ctx.fillRect(x + 18, y + 2, 10, 10);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 10, y + 6, 2, 2);
        ctx.fillRect(x + 26, y + 6, 2, 2);
        break;

      case 'p': // Planter
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#b85c38';
        ctx.fillRect(x + 8, y + 18, 16, 12);
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(x + 6, y + 4, 20, 16);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x + 10, y + 6, 12, 8);
        break;

      case 'w': // Water Cooler
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.waterJug;
        ctx.fillRect(x + 8, y + 2, 16, 14);
        ctx.fillStyle = '#b3e5fc';
        ctx.fillRect(x + 12, y + 4, 8, 4);
        const bubY = y + 12 - (frame * 0.4 % 8);
        ctx.fillStyle = C.white;
        ctx.fillRect(x + 14, bubY, 3, 3);
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(x + 6, y + 16, 20, 14);
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x + 10, y + 18, 4, 4);
        break;

      case 'E': // Mini-Fridge
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#141822';
        ctx.fillRect(x + 4, y + 2, 24, 26);
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x + 6, y + 4, 20, 22);
        ctx.fillStyle = C.red;
        ctx.fillRect(x + 8, y + 8, 3, 6);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 13, y + 8, 3, 6);
        ctx.fillStyle = C.emerald;
        ctx.fillRect(x + 18, y + 8, 3, 6);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 25, TS, 7);
        break;

      case 'G': // Foam Roller Rack
        ctx.fillStyle = C.turfBlue;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 4, y + 4, 24, 24);
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(x + 6, y + 6, 6, 20);
        ctx.fillStyle = '#9c27b0';
        ctx.fillRect(x + 14, y + 6, 6, 20);
        ctx.fillStyle = '#00bcd4';
        ctx.fillRect(x + 22, y + 6, 4, 20);
        break;

      case 'O': // Tractor Tire & Hammer
        ctx.fillStyle = C.turfBlue;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#141416';
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = C.turfBlue;
        ctx.beginPath();
        ctx.arc(x + 16, y + 16, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 10, y + 4, 3, 24);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 7, y + 4, 9, 6);
        break;

      case 'T': // Treadmill with Animated Cyan LED Heart-Rate Monitor
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 2, y + 2, TS - 4, TS - 4);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 4, y + 10, TS - 8, 16);
        const bOff = (frame * 1.2) % 12;
        ctx.fillStyle = '#2c303c';
        for (let i = -1; i < 4; i++) {
          const sy = y + 12 + i * 6 + bOff;
          if (sy > y + 8 && sy < y + 26) ctx.fillRect(x + 6, sy, TS - 12, 2);
        }
        // Animated EKG Heart Rate Spike & Pace Graph
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x + 8, y + 4, 16, 4);
        const ekgOff = Math.floor(frame * 0.4) % 12;
        ctx.fillStyle = C.white;
        ctx.fillRect(x + 8 + ekgOff, y + 4 + (ekgOff % 3 === 0 ? 1 : 2), 2, 2);
        ctx.fillStyle = C.red;
        ctx.fillRect(x + 14, y + 6, 4, 2);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 2, y + 6, 4, 22);
        ctx.fillRect(x + 26, y + 6, 4, 22);
        break;

      case 'B': // Spin Bike with Rotating Flywheel
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 10, y + 4, 12, 24);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 8, y + 10, 16, 6);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 12, y + 18, 8, 8);
        const pOff = Math.sin(frame * 0.25) * 4;
        ctx.fillStyle = C.metalHi;
        ctx.fillRect(x + 6, y + 20 + pOff, 6, 3);
        ctx.fillRect(x + 20, y + 20 - pOff, 6, 3);
        break;

      case 'R': // Concept2 Rower
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 4, y + 14, 24, 6);
        ctx.fillStyle = '#212121';
        ctx.fillRect(x + 20, y + 6, 8, 14);
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x + 22, y + 4, 4, 3);
        break;

      case 'd': // Dumbbell Rack
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 2, y + 6, TS - 4, 6);
        ctx.fillRect(x + 2, y + 18, TS - 4, 6);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 2, y + 6, TS - 4, 2);
        ctx.fillRect(x + 2, y + 18, TS - 4, 2);
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = C.fblk;
          ctx.fillRect(x + 4 + i * 6, y + 8, 4, 3);
          ctx.fillRect(x + 4 + i * 6, y + 20, 4, 3);
          ctx.fillStyle = C.metalHi;
          ctx.fillRect(x + 4 + i * 6, y + 7, 4, 1);
          ctx.fillRect(x + 4 + i * 6, y + 19, 4, 1);
        }
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 25, TS, 7);
        break;

      case 'U': // Heavy Punching Bag with Dynamic Chain & Rebound Sway
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        const bagSway = Math.sin(frame * 0.15) * 2;
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 14, y, 4, 6);
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(x + 8 + bagSway, y + 6, 16, 22);
        ctx.fillStyle = '#e53935';
        ctx.fillRect(x + 10 + bagSway, y + 8, 12, 18);
        ctx.fillStyle = '#1976d2';
        ctx.fillRect(x + 8 + bagSway, y + 16, 16, 4);
        break;

      case 'Y': // Speed Bag
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 12, y + 2, 8, 28);
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(x + 10, y + 12, 12, 12);
        ctx.fillStyle = '#ff8a80';
        ctx.fillRect(x + 12, y + 14, 4, 4);
        break;

      case 'k': // Kettlebells & Yoga Ball
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#1565c0';
        ctx.beginPath();
        ctx.arc(x + 12, y + 14, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#64b5f6';
        ctx.beginPath();
        ctx.arc(x + 10, y + 11, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e91e63';
        ctx.fillRect(x + 18, y + 8, 5, 5);
        ctx.fillStyle = '#fdd835';
        ctx.fillRect(x + 24, y + 12, 6, 6);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 18, y + 18, 9, 9);
        break;

      case 'q': // Cable Crossover
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 2, y, 6, TS);
        ctx.fillRect(x + 24, y, 6, TS);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 4, y + 8, 24, 4);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 8, y + 10, 16, 2);
        ctx.fillStyle = C.plateRed;
        ctx.fillRect(x, y + 6, 4, 12);
        ctx.fillStyle = C.plateBlue;
        ctx.fillRect(x + 28, y + 6, 4, 12);
        break;

      case 'n': // Bench Press
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#21252d';
        ctx.fillRect(x + 4, y + 8, 24, 12);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 6, y + 20, 6, 8);
        ctx.fillRect(x + 20, y + 20, 6, 8);
        break;

      case 'K': // Chalk Stand
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 12, y + 14, 8, 14);
        ctx.fillStyle = C.fblk2;
        ctx.fillRect(x + 8, y + 8, 16, 8);
        ctx.fillStyle = C.white;
        ctx.fillRect(x + 10, y + 6, 12, 4);
        break;

      case 'C': // Real-Time Animated Digital Clock
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 4, y + 6, 24, 14);
        ctx.strokeStyle = C.metalDk;
        ctx.strokeRect(x + 4, y + 6, 24, 14);
        ctx.fillStyle = C.red;
        ctx.font = '7px "Press Start 2P", monospace';
        const sec = String(Math.floor((frame / 60) % 60)).padStart(2, '0');
        const colon = (Math.floor(frame / 30) % 2 === 0) ? ':' : ' ';
        ctx.fillText(`08${colon}${sec}`, x + 5, y + 16);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 25, TS, 7);
        break;

      case 'A': // Trophy Case
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#2a2622';
        ctx.fillRect(x + 4, y + 4, 24, 18);
        ctx.strokeStyle = C.fy;
        ctx.strokeRect(x + 4, y + 4, 24, 18);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 12, y + 8, 8, 6);
        ctx.fillRect(x + 14, y + 14, 4, 4);
        ctx.fillRect(x + 10, y + 18, 12, 2);
        if (frame % 30 < 10) {
          ctx.fillStyle = C.white;
          ctx.fillRect(x + 13, y + 9, 2, 2);
        }
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 25, TS, 7);
        break;

      default:
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        break;
    }
  }

  /* ═══ KINETIC SPRITE & WORKOUT ACTION ANIMATIONS ══════════ */
  function drawSprite(id, x, y, dir, walkFrame, exercising) {
    if (id === 'lifter_bench') {
      g.fillStyle = C.shadow;
      g.fillRect(x - 4, y + 36, 40, 8);
      g.fillStyle = '#e0b080';
      g.fillRect(x + 6, y + 16, 20, 10);
      g.fillStyle = C.red;
      g.fillRect(x + 10, y + 16, 12, 10);
      const barY = y + 8 + Math.sin(frame * 0.12) * 7;
      g.fillStyle = C.metalHi;
      g.fillRect(x - 6, barY, 44, 4);
      g.fillStyle = C.plateRed;
      g.fillRect(x - 10, barY - 4, 6, 12);
      g.fillRect(x + 36, barY - 4, 6, 12);
      return;
    }

    if (id === 'boxer') {
      const punchOff = Math.sin(frame * 0.2) * 6;
      g.fillStyle = C.shadow;
      g.fillRect(x + 4, y + 38, 20, 6);
      g.fillStyle = '#1e88e5';
      g.fillRect(x + 6, y + 16, 16, 14);
      g.fillStyle = '#e0b080';
      g.fillRect(x + 8, y + 4, 12, 12);
      g.fillStyle = C.red;
      g.fillRect(x + 18 + punchOff, y + 18, 8, 8);
      return;
    }

    if (id === 'rower') {
      const rowCycle = (frame * 0.1) % (Math.PI * 2);
      const rowX = Math.sin(rowCycle) * 6;
      g.fillStyle = C.shadow;
      g.fillRect(x + 4, y + 38, 24, 6);
      g.fillStyle = '#43a047';
      g.fillRect(x + 8 + rowX, y + 16, 14, 12);
      g.fillStyle = '#e0b080';
      g.fillRect(x + 10 + rowX, y + 6, 10, 10);
      g.fillStyle = C.metalLt;
      g.fillRect(x + 18 + rowX, y + 18, 8, 3);
      return;
    }

    const ch = CHARS.find(c => c.id === id);
    if (!ch) { drawGenericNPC(id, x, y, dir, walkFrame, exercising); return; }
    const cl = ch.col;
    const bw = ch.build === 'broad' ? 28 : (ch.build === 'stocky' ? 26 : 22);
    const bx = x + (32 - bw) / 2;

    // 8-Frame Sub-pixel Stride & Bob
    const wf = walkFrame % 8;
    const stride = (wf === 1 || wf === 2) ? 3.5 : (wf === 5 || wf === 6) ? -3.5 : 0;
    const armSwing = (wf === 1 || wf === 2) ? -3.5 : (wf === 5 || wf === 6) ? 3.5 : 0;
    const headBob = (wf % 2 === 1) ? 1.5 : 0;
    const breath = Math.sin(frame * 0.08) * 1.0;

    // Multi-Layer Radial Drop Shadow
    g.fillStyle = 'rgba(0, 0, 0, 0.45)';
    g.beginPath();
    g.ellipse(x + 16, y + 42, bw * 0.65, 5, 0, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = 'rgba(0, 0, 0, 0.25)';
    g.beginPath();
    g.ellipse(x + 16, y + 42, bw * 0.85, 7, 0, 0, Math.PI * 2);
    g.fill();

    // Shoes with Soles & Ankle Padding
    g.fillStyle = cl.shoes;
    g.fillRect(bx + 1, y + 37 + stride, 8, 5);
    g.fillRect(bx + bw - 9, y + 37 - stride, 8, 5);
    g.fillStyle = '#ffffff';
    g.fillRect(bx + 1, y + 41 + stride, 8, 1.5);
    g.fillRect(bx + bw - 9, y + 41 - stride, 8, 1.5);
    if (id === 'shubham') {
      g.fillStyle = C.cyan;
      g.fillRect(bx + 3, y + 38 + stride, 4, 2);
      g.fillRect(bx + bw - 7, y + 38 - stride, 4, 2);
    }

    // Joggers, Shorts & Leg Muscle Definition
    g.fillStyle = cl.pants;
    g.fillRect(bx + 2, y + 29 + stride, 7, 9);
    g.fillRect(bx + bw - 9, y + 29 - stride, 7, 9);
    g.fillStyle = 'rgba(0,0,0,0.2)';
    g.fillRect(bx + 2, y + 33 + stride, 3, 5);
    g.fillRect(bx + bw - 9, y + 33 - stride, 3, 5);

    if (id === 'gagan') {
      g.fillStyle = '#4e342e';
      g.fillRect(bx, y + 27 + breath + headBob, bw, 4);
      g.fillStyle = C.metalHi;
      g.fillRect(bx + bw / 2 - 3, y + 27 + breath + headBob, 6, 4);
    }

    // Athletic Torso & Muscle Definition
    g.fillStyle = cl.shirt;
    g.fillRect(bx, y + 15 + breath + headBob, bw, 15);
    g.fillStyle = cl.shirtDk;
    g.fillRect(bx, y + 25 + breath + headBob, bw, 5);

    if (id === 'herman') {
      g.fillStyle = C.cyan;
      g.fillRect(bx + 3, y + 17 + breath + headBob, 2, 10);
      g.fillRect(bx + bw - 5, y + 17 + breath + headBob, 2, 10);
    } else if (id === 'sukh') {
      g.fillStyle = cl.skin;
      g.fillRect(bx, y + 15 + breath + headBob, 4, 8);
      g.fillRect(bx + bw - 4, y + 15 + breath + headBob, 4, 8);
      g.fillStyle = C.fblk;
      g.fillRect(bx + bw / 2 - 4, y + 18 + breath + headBob, 8, 6);
    } else if (id === 'rakesh') {
      g.fillStyle = C.white;
      g.fillRect(bx + 4, y + 15 + breath + headBob, bw - 8, 3);
    }

    // Muscular Arms with Dynamic Stride Swing
    g.fillStyle = cl.skin;
    if (dir === 'left') {
      g.fillRect(bx - 4 + armSwing, y + 17 + breath + headBob, 6, 11);
      g.fillStyle = 'rgba(0,0,0,0.15)';
      g.fillRect(bx - 4 + armSwing, y + 22 + breath + headBob, 2, 6);
    } else if (dir === 'right') {
      g.fillRect(bx + bw - 2 - armSwing, y + 17 + breath + headBob, 6, 11);
      g.fillStyle = 'rgba(0,0,0,0.15)';
      g.fillRect(bx + bw + 2 - armSwing, y + 22 + breath + headBob, 2, 6);
    } else {
      g.fillRect(bx - 3 + armSwing, y + 17 + breath + headBob, 5, 11);
      g.fillRect(bx + bw - 2 - armSwing, y + 17 + breath + headBob, 5, 11);
    }

    if (id === 'herman') {
      g.fillStyle = C.fblk;
      g.fillRect(bx - 3 + armSwing, y + 24 + breath + headBob, 4, 3);
      g.fillStyle = C.emerald;
      g.fillRect(bx - 2 + armSwing, y + 25 + breath + headBob, 2, 1);
    }
    if (id === 'gagan') {
      g.fillStyle = C.white;
      g.fillRect(bx - 3 + armSwing, y + 25 + breath + headBob, 5, 2);
      g.fillRect(bx + bw - 2 - armSwing, y + 25 + breath + headBob, 5, 2);
    }

    // Neck & Traps
    g.fillStyle = cl.skin;
    g.fillRect(bx + 6, y + 11 + breath + headBob, bw - 12, 5);

    // Sculpted Head & Face
    const hw = bw - 4, hx = bx + 2;
    g.fillRect(hx, y + 3 + breath + headBob, hw, 11);

    g.fillStyle = cl.hair;
    g.fillRect(hx - 2, y - 1 + breath + headBob, hw + 4, dir === 'up' ? 9 : 7);
    g.fillRect(hx, y - 3 + breath + headBob, hw, 4);

    if (dir === 'down') {
      g.fillStyle = '#0f1115';
      g.fillRect(hx + 4, y + 7 + breath + headBob, 4, 2.5);
      g.fillRect(hx + hw - 8, y + 7 + breath + headBob, 4, 2.5);
      g.fillStyle = '#9e6140';
      g.fillRect(hx + 6, y + 11 + breath + headBob, hw - 12, 2);

      if (id === 'sukh') {
        g.fillStyle = '#5d4037';
        g.fillRect(hx + 3, y + 11 + breath + headBob, hw - 6, 3);
      }
      if (id === 'rakesh') {
        g.fillStyle = '#424242';
        g.fillRect(hx + 4, y + 10 + breath + headBob, hw - 8, 2);
      }
    } else if (dir === 'left') {
      g.fillStyle = '#0f1115';
      g.fillRect(hx + 2, y + 7 + breath + headBob, 4, 2.5);
    } else if (dir === 'right') {
      g.fillStyle = '#0f1115';
      g.fillRect(hx + hw - 6, y + 7 + breath + headBob, 4, 2.5);
    }

    if (cl.acc === 'glasses' && dir !== 'up') {
      g.fillStyle = C.cyan;
      g.fillRect(hx + 2, y + 5 + breath + headBob, hw - 4, 4);
      g.fillStyle = '#263238';
      g.fillRect(hx, y + 5 + breath + headBob, 2, 4);
      g.fillRect(hx + hw - 2, y + 5 + breath + headBob, 2, 4);
      g.fillStyle = C.white;
      g.fillRect(hx + 3, y + 6 + breath + headBob, 2, 2);
    }
    if (cl.acc === 'headband') {
      g.fillStyle = C.red;
      g.fillRect(hx - 2, y + 1 + breath + headBob, hw + 4, 4);
      g.fillStyle = '#ff8a80';
      g.fillRect(hx, y + 1 + breath + headBob, hw, 1);
    }
    if (id === 'sukh') {
      g.fillStyle = C.metalHi;
      g.fillRect(bx + bw / 2 - 2, y + 15 + breath + headBob, 4, 4);
    }

    // DYNAMIC WORKOUT ACTION ANIMATION OVERLAY (When pressing [A])
    if (pl.actionTimer > 0 && id === selChar.id) {
      const actProgress = pl.actionTimer / 20;
      if (id === 'herman') {
        // Dual Dumbbells Curl Animation
        g.fillStyle = C.metalHi;
        g.fillRect(bx - 6, y + 18 - Math.sin(actProgress * Math.PI) * 8, 5, 8);
        g.fillRect(bx + bw + 1, y + 18 - Math.sin(actProgress * Math.PI) * 8, 5, 8);
      } else if (id === 'sukh') {
        // Olympic Barbell Squat Overlay
        g.fillStyle = C.metalHi;
        g.fillRect(bx - 10, y + 4, bw + 20, 4);
        g.fillStyle = C.plateRed;
        g.fillRect(bx - 12, y, 4, 12);
        g.fillRect(bx + bw + 8, y, 4, 12);
      } else if (id === 'gagan') {
        // Kettlebell Swing Pendulum
        g.fillStyle = C.fblk;
        g.fillRect(bx + bw / 2 - 4, y + 24 - Math.sin(actProgress * Math.PI) * 12, 8, 8);
      } else if (id === 'shubham') {
        // Resistance Band Snap
        g.strokeStyle = C.cyan;
        g.lineWidth = 2;
        g.strokeRect(bx - 4, y + 18, bw + 8, 6);
        g.lineWidth = 1;
      } else if (id === 'rakesh') {
        // EZ-Curl Bar Lift
        g.fillStyle = C.metalHi;
        g.fillRect(bx - 4, y + 16 - Math.sin(actProgress * Math.PI) * 6, bw + 8, 3);
      }
    }
  }

  function drawGenericNPC(type, x, y, dir, wf, exercising) {
    const legOff = (wf % 4 === 1) ? 2.5 : (wf % 4 === 3) ? -2.5 : 0;
    g.fillStyle = C.shadow;
    g.beginPath();
    g.ellipse(x + 16, y + 42, 12, 4, 0, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#263238';
    g.fillRect(x + 8, y + 30 + legOff, 6, 8);
    g.fillRect(x + 18, y + 30 - legOff, 6, 8);
    g.fillStyle = type === 'member_f' ? '#ab47bc' : '#e53935';
    g.fillRect(x + 6, y + 16, 20, 14);
    g.fillStyle = '#f8d0b0';
    g.fillRect(x + 8, y + 4, 16, 10);
    g.fillStyle = '#0f1115';
    g.fillRect(x + 6, y, 20, 6);
  }

  /* ═══ 120×120 STREET FIGHTER II CHARACTER BUSTS ═════════ */
  function drawPortrait(charId, px, py, size, isTalking) {
    const ch = CHARS.find(c => c.id === charId);
    if (!ch) return;
    const cl = ch.col;
    const s = size || 96;
    const u = s / 96;

    // Glassmorphic Card Frame with Beveled Border
    g.fillStyle = C.uiGlass;
    g.fillRect(px, py, s, s);
    g.strokeStyle = C.uiGlassBorder;
    g.lineWidth = 3;
    g.strokeRect(px, py, s, s);
    g.lineWidth = 1;

    // Subtle Radial Aura Glow behind head
    const aura = g.createRadialGradient(px + s / 2, py + s / 2, 10 * u, px + s / 2, py + s / 2, 45 * u);
    aura.addColorStop(0, 'rgba(255, 208, 0, 0.18)');
    aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = aura;
    g.fillRect(px + 4, py + 4, s - 8, s - 8);

    // Shoulders with Fabric Folds & Shading
    const bw = ch.build === 'broad' ? 82 : (ch.build === 'stocky' ? 76 : 68);
    const bx = px + (s - bw * u) / 2;
    g.fillStyle = cl.shirt;
    g.fillRect(bx, py + 62 * u, bw * u, 34 * u);
    g.fillStyle = cl.shirtDk;
    g.fillRect(bx, py + 78 * u, bw * u, 18 * u);

    if (charId === 'herman') {
      g.fillStyle = C.cyan;
      g.fillRect(bx + 8 * u, py + 64 * u, 3 * u, 24 * u);
      g.fillRect(bx + bw * u - 11 * u, py + 64 * u, 3 * u, 24 * u);
    } else if (charId === 'sukh') {
      g.fillStyle = cl.skin;
      g.fillRect(bx, py + 62 * u, 12 * u, 20 * u);
      g.fillRect(bx + bw * u - 12 * u, py + 62 * u, 12 * u, 20 * u);
      g.fillStyle = C.fblk;
      g.fillRect(px + 36 * u, py + 70 * u, 24 * u, 12 * u);
      g.fillStyle = C.fy;
      g.fillRect(px + 40 * u, py + 72 * u, 16 * u, 4 * u);
    } else if (charId === 'rakesh') {
      g.fillStyle = C.white;
      g.fillRect(px + 30 * u, py + 62 * u, 36 * u, 8 * u);
    }

    // Muscular Neck & Traps with Shadowing
    g.fillStyle = cl.skin;
    g.fillRect(px + 34 * u, py + 52 * u, 28 * u, 16 * u);
    g.fillStyle = 'rgba(0,0,0,0.18)';
    g.fillRect(px + 34 * u, py + 52 * u, 28 * u, 6 * u);

    // Sculpted Jawline & Head Base
    g.fillStyle = cl.skin;
    g.fillRect(px + 22 * u, py + 16 * u, 52 * u, 42 * u);

    // Hair Styling with Volume & Highlights
    g.fillStyle = cl.hair;
    g.fillRect(px + 14 * u, py + 4 * u, 68 * u, 24 * u);
    g.fillRect(px + 18 * u, py + 0 * u, 60 * u, 14 * u);
    g.fillStyle = 'rgba(255,255,255,0.15)';
    g.fillRect(px + 26 * u, py + 2 * u, 24 * u, 4 * u);

    // Brow Ridge & Nose Bridge
    g.fillStyle = '#9e6140';
    g.fillRect(px + 45 * u, py + 34 * u, 6 * u, 12 * u);
    g.fillRect(px + 43 * u, py + 44 * u, 10 * u, 3 * u);

    // Expressive Eyes with Pupil Catchlights & Blinking
    const isBlinking = frame % 120 < 6;
    if (isBlinking) {
      g.fillStyle = '#0f1115';
      g.fillRect(px + 28 * u, py + 38 * u, 16 * u, 3 * u);
      g.fillRect(px + 52 * u, py + 38 * u, 16 * u, 3 * u);
    } else {
      g.fillStyle = C.white;
      g.fillRect(px + 28 * u, py + 32 * u, 16 * u, 9 * u);
      g.fillRect(px + 52 * u, py + 32 * u, 16 * u, 9 * u);
      g.fillStyle = '#0f1115';
      g.fillRect(px + 34 * u, py + 33 * u, 8 * u, 7 * u);
      g.fillRect(px + 58 * u, py + 33 * u, 8 * u, 7 * u);
      g.fillStyle = (charId === 'herman' || charId === 'shubham') ? C.cyan : '#ffd000';
      g.fillRect(px + 37 * u, py + 35 * u, 4 * u, 4 * u);
      g.fillRect(px + 61 * u, py + 35 * u, 4 * u, 4 * u);
      g.fillStyle = C.white;
      g.fillRect(px + 39 * u, py + 34 * u, 2 * u, 2 * u);
      g.fillRect(px + 63 * u, py + 34 * u, 2 * u, 2 * u);
    }

    if (charId === 'sukh') {
      g.fillStyle = '#4a2c20';
      g.fillRect(px + 28 * u, py + 48 * u, 40 * u, 10 * u);
      g.fillRect(px + 32 * u, py + 44 * u, 32 * u, 4 * u);
    }
    if (charId === 'rakesh') {
      g.fillStyle = '#424242';
      g.fillRect(px + 34 * u, py + 46 * u, 28 * u, 5 * u);
    }

    // Animated Talking Mouth Flap
    const mouthOpen = isTalking && (Math.floor(frame / 6) % 2 === 0);
    g.fillStyle = '#7a3e26';
    if (mouthOpen) {
      g.fillRect(px + 38 * u, py + 48 * u, 20 * u, 6 * u);
      g.fillStyle = '#3e160c';
      g.fillRect(px + 40 * u, py + 50 * u, 16 * u, 3 * u);
    } else {
      g.fillRect(px + 40 * u, py + 50 * u, 16 * u, 2 * u);
    }

    if (cl.acc === 'glasses') {
      g.fillStyle = C.cyan;
      g.fillRect(px + 24 * u, py + 28 * u, 22 * u, 16 * u);
      g.fillRect(px + 50 * u, py + 28 * u, 22 * u, 16 * u);
      g.fillStyle = '#263238';
      g.fillRect(px + 46 * u, py + 32 * u, 4 * u, 4 * u);
      g.fillStyle = 'rgba(255,255,255,0.4)';
      g.fillRect(px + 27 * u, py + 30 * u, 6 * u, 4 * u);
      g.fillRect(px + 53 * u, py + 30 * u, 6 * u, 4 * u);
    }
    if (cl.acc === 'headband') {
      g.fillStyle = C.red;
      g.fillRect(px + 14 * u, py + 10 * u, 68 * u, 9 * u);
      g.fillStyle = '#ff8a80';
      g.fillRect(px + 18 * u, py + 10 * u, 60 * u, 2 * u);
    }
    if (charId === 'sukh') {
      g.fillStyle = C.metalHi;
      g.fillRect(px + 44 * u, py + 62 * u, 8 * u, 8 * u);
    }
  }

  /* ═══ ROOM LOADING & MANAGEMENT ══════════════════════════ */
  function loadRoom(roomId, sx, sy) {
    curRoomId = roomId;
    curRoom = ROOMS[roomId];
    if (!curRoom) return;

    if (sx !== undefined) { pl.x = sx * TS; pl.y = sy * TS; }
    else { pl.x = curRoom.spawn.x; pl.y = curRoom.spawn.y; }

    roomBgCanvas = document.createElement('canvas');
    roomBgCanvas.width = W;
    roomBgCanvas.height = H;
    const rc = roomBgCanvas.getContext('2d');
    rc.imageSmoothingEnabled = false;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = curRoom.map[r]?.[c] || 'W';
        drawTile(rc, ch, c * TS, r * TS);
      }
    }

    npcs = (curRoom.npcs || []).map(n => ({
      ...n,
      px: n.tx * TS,
      py: n.ty * TS,
      walkFrame: 0,
      walkTimer: 0
    }));

    initMotes();
    Audio8.sfx('stairs');

    if (roomId === 'street') {
      Audio8.music('sector67_morning');
    } else if (roomId === 'weights') {
      Audio8.music('weights_floor');
    } else {
      Audio8.music('fitway_groove');
    }
  }

  function canWalkTo(px, py) {
    const footL = px + 4, footR = px + 28;
    const footT = py + 28, footB = py + 42;

    const tl = curRoom.map[Math.floor(footT / TS)]?.[Math.floor(footL / TS)] || 'W';
    const tr = curRoom.map[Math.floor(footT / TS)]?.[Math.floor(footR / TS)] || 'W';
    const bl = curRoom.map[Math.floor(footB / TS)]?.[Math.floor(footL / TS)] || 'W';
    const br = curRoom.map[Math.floor(footB / TS)]?.[Math.floor(footR / TS)] || 'W';

    if (!isWalkable(tl) || !isWalkable(tr) || !isWalkable(bl) || !isWalkable(br)) return false;

    for (const npc of npcs) {
      if (npc.sprite === 'lifter_bench' || npc.sprite === 'rower') continue;
      const nx = npc.px, ny = npc.py;
      if (px + 28 > nx + 4 && px + 4 < nx + 28 && py + 42 > ny + 28 && py + 28 < ny + 42) return false;
    }
    return true;
  }

  function checkExits() {
    const col = Math.floor((pl.x + 16) / TS);
    const row = Math.floor((pl.y + 32) / TS);
    const tile = curRoom.map[row]?.[col];

    if (!curRoom.exits) return;
    for (const ex of curRoom.exits) {
      if (ex.chars && ex.chars.includes(tile)) {
        fadeToRoom(ex.room, ex.sx, ex.sy);
        return;
      }
      if (ex.row === row && col >= ex.col1 && col <= ex.col2) {
        fadeToRoom(ex.room, ex.sx, ex.sy);
        return;
      }
    }
  }

  function fadeToRoom(roomId, sx, sy) {
    fade.dir = 1;
    fade.cb = () => {
      loadRoom(roomId, sx, sy);
      fade.dir = -1;
      fade.cb = null;
    };
  }

  function updateFade() {
    if (fade.dir > 0) {
      fade.alpha = Math.min(1, fade.alpha + 0.08);
      if (fade.alpha >= 1 && fade.cb) fade.cb();
    } else if (fade.dir < 0) {
      fade.alpha = Math.max(0, fade.alpha - 0.08);
      if (fade.alpha <= 0) fade.dir = 0;
    }
  }

  /* ═══ DIALOGUE & FULL CHAPTER PROGRESSION ENGINE ═════════ */
  function startChapter(chNum) {
    chapter = chNum;
    storyStep = 0;
    state = 'chapter_card';
    chapterCardTimer = 0;
    Audio8.sfx('challenge_win');
  }

  function startDialogue(scriptKey, onDone) {
    const lines = DIALOGUES[scriptKey];
    if (!lines) return;
    dlg.active = true;
    dlg.lines = lines;
    dlg.idx = 0;
    dlg.charPos = 0;
    dlg.timer = 0;
    dlg.onDone = onDone || null;
    state = 'dialogue';
    Audio8.sfx('dialogue_blip');
  }

  function advanceDialogue() {
    const line = dlg.lines[dlg.idx];
    if (dlg.charPos < line.t.length) {
      dlg.charPos = line.t.length;
      return;
    }
    dlg.idx++;
    dlg.charPos = 0;
    dlg.timer = 0;
    Audio8.sfx('dialogue_blip');
    if (dlg.idx >= dlg.lines.length) {
      dlg.active = false;
      state = 'explore';
      if (dlg.onDone) dlg.onDone();
    }
  }

  function checkInteraction() {
    let tx = Math.floor((pl.x + 16) / TS);
    let ty = Math.floor((pl.y + 32) / TS);
    if (pl.dir === 'up') ty--;
    else if (pl.dir === 'down') ty++;
    else if (pl.dir === 'left') tx--;
    else if (pl.dir === 'right') tx++;

    for (const npc of npcs) {
      if (Math.abs(npc.tx - tx) <= 1 && Math.abs(npc.ty - ty) <= 1) {
        npc.dir = pl.dir === 'up' ? 'down' : pl.dir === 'down' ? 'up' : pl.dir === 'left' ? 'right' : 'left';

        // CHAPTER 1 INTERACTION PROGRESSION
        if (chapter === 1) {
          if (npc.id === 'sukh_main') {
            if (storyStep === 0) {
              startDialogue('ch1_sukh_late', () => {
                storyStep = 1;
              });
            } else {
              startDialogue('ch1_sukh_late');
            }
            return;
          }

          if (npc.id === 'gagan_main') {
            if (storyStep <= 1) {
              startDialogue('ch1_gagan_meet', () => {
                startRepChallenge('15 KETTLEBELL SWINGS', 'GAGAN', 15, () => {
                  storyStep = 2;
                  startDialogue('ch1_treadmill_chaos', () => {
                    startChaosMinigame();
                  });
                });
              });
            } else {
              startDialogue('ch1_gagan_meet');
            }
            return;
          }
        }

        // CHAPTER 2 INTERACTION PROGRESSION
        if (chapter === 2) {
          if (npc.id === 'gagan_main') {
            startDialogue('ch2_bench_drama', () => {
              storyStep = 1;
            });
            return;
          }
          if (npc.id === 'shubham_main') {
            startRepChallenge('20 SPEED BAND PULLS', 'SHUBHAM', 20, () => {
              showUnlock('RESISTANCE BAND', 'BAND BLAST', 'High-velocity conditioning weapon unlocked!', () => {
                startDialogue('ch2_shubham_done', () => {
                  startChapter(3);
                });
              });
            });
            return;
          }
        }

        // CHAPTER 3 INTERACTION PROGRESSION
        if (chapter === 3) {
          if (npc.id === 'rakesh_main') {
            startDialogue('ch3_rakesh_meet', () => {
              startRepChallenge('10 STRICT EZ-BAR CURLS', 'RAKESH', 10, () => {
                showUnlock('EZ-CURL BAR', 'OLD SCHOOL POWER', 'Veteran form purist strength unlocked!', () => {
                  startDialogue('ch3_announcement', () => {
                    startChapter(4);
                  });
                });
              });
            });
            return;
          }
        }

        // CHAPTER 4 INTERACTION PROGRESSION (FINALE)
        if (chapter === 4) {
          if (curRoomId === 'main_gym' && (npc.id === 'sukh_main' || npc.id === 'gagan_main')) {
            startDialogue('ch4_staircase_intro', () => {
              storyStep = 1;
            });
            return;
          }
          if (curRoomId === 'weights' && npc.id === 'sukh_weights') {
            if (storyStep <= 1) {
              startDialogue('ch4_power_surge', () => {
                startChaosMinigame();
              });
            } else {
              startDialogue('ch4_sukh_philosophy', () => {
                startRepChallenge('OWNER SQUAT TEST', 'SUKH', 15, () => {
                  startDialogue('ch4_sitcom_end', () => {
                    state = 'credits';
                    Audio8.music('fitway_credits');
                  });
                });
              });
            }
            return;
          }
        }

        if (npc.text) {
          startDialogue('ch1_sukh_late');
        }
      }
    }

    // If no NPC is in range, trigger the character's Workout / Flex Action Pose!
    pl.actionTimer = 20;
    Audio8.sfx('iron_clank');
    spawnSparks(pl.x + 16, pl.y + 20, C.fy);
  }

  /* ═══ MINIGAMES & UNLOCKS ═════════════════════════════════ */
  function startRepChallenge(name, trainer, target, onDone) {
    chl.active = true;
    chl.name = name;
    chl.trainer = trainer;
    chl.target = target;
    chl.current = 0;
    chl.onDone = onDone;
    state = 'challenge';
    Audio8.sfx('whistle');
    Audio8.music('workout_pump');
  }

  function doRep() {
    chl.current++;
    Audio8.sfx('iron_clank');
    Audio8.sfx('rep_ding');
    screenShake = 6;
    spawnRepConfetti(W / 2, 220);

    if (chl.current >= chl.target) {
      chl.active = false;
      state = 'explore';
      Audio8.sfx('challenge_win');
      Audio8.music('fitway_groove');
      if (chl.onDone) chl.onDone();
    }
  }

  function startChaosMinigame() {
    minigame.active = true;
    minigame.score = 0;
    minigame.total = 5;
    minigame.onDone = () => {
      if (chapter === 1) {
        showUnlock('MACHINE OVERRIDE', 'DEBUG & REBOOT', 'Understand gym electronics instead of just lifting.', () => {
          startDialogue('ch1_override_done', () => {
            startChapter(2);
          });
        });
      } else if (chapter === 4) {
        storyStep = 2;
        showUnlock('MASTER OVERRIDE', 'GRID STABILIZED', 'Floor 2 electrical power stabilized!', () => {
          checkInteraction();
        });
      }
    };
    state = 'chaos_minigame';
    Audio8.sfx('override_beep');
  }

  function showUnlock(title, name, desc, onDone) {
    unlockAnim.active = true;
    unlockAnim.timer = 0;
    unlockAnim.title = title;
    unlockAnim.name = name;
    unlockAnim.desc = desc;
    unlockAnim.onDone = onDone;
    state = 'unlock';
    Audio8.sfx('challenge_win');
    spawnRepConfetti(W / 2, 180);
  }

  /* ═══ ATMOSPHERIC LIGHTING & PARTICLES ════════════════════ */
  function renderAtmosphere() {
    // Dynamic Footstep Dust Particles
    for (let i = dustPuffs.length - 1; i >= 0; i--) {
      const p = dustPuffs[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      p.sz = Math.max(0.5, p.sz - 0.1);
      if (p.alpha <= 0) { dustPuffs.splice(i, 1); continue; }
      g.fillStyle = `rgba(220, 200, 170, ${p.alpha.toFixed(2)})`;
      g.beginPath();
      g.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      g.fill();
    }

    // Energy Sparks Particles
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.alpha -= 0.05;
      if (s.alpha <= 0) { sparks.splice(i, 1); continue; }
      g.fillStyle = s.col;
      g.fillRect(s.x, s.y, s.sz, s.sz);
    }

    // Celebration Confetti Particles
    for (let i = confetti.length - 1; i >= 0; i--) {
      const c = confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.15; // Gravity
      c.alpha -= 0.015;
      if (c.alpha <= 0 || c.y > H) { confetti.splice(i, 1); continue; }
      g.fillStyle = c.col;
      g.fillRect(c.x, c.y, c.sz, c.sz);
    }

    // Volumetric Multi-Ray Sunbeams
    const grad = g.createLinearGradient(0, 0, 360, H);
    grad.addColorStop(0, C.sunbeamCore);
    grad.addColorStop(0.5, C.sunbeam);
    grad.addColorStop(1, 'rgba(255, 245, 210, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(40, 0);
    g.lineTo(240, 0);
    g.lineTo(480, H);
    g.lineTo(120, H);
    g.closePath();
    g.fill();

    // Rotating Ceiling Fan Shadow
    const fanAngle = frame * 0.05;
    g.fillStyle = 'rgba(0,0,0,0.08)';
    g.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = fanAngle + (i * Math.PI / 2);
      g.moveTo(W / 2, H / 2 - 20);
      g.lineTo(W / 2 + Math.cos(a) * 90, H / 2 - 20 + Math.sin(a) * 40);
      g.lineTo(W / 2 + Math.cos(a + 0.2) * 90, H / 2 - 20 + Math.sin(a + 0.2) * 40);
    }
    g.fill();

    // Pulsing Audio Basswave Rings from Upper Corner Speakers
    if (frame % 40 < 20) {
      const ringR = (frame % 40) * 1.5;
      g.strokeStyle = 'rgba(0, 229, 255, 0.12)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(16, 16, ringR, 0, Math.PI / 2);
      g.stroke();
      g.beginPath();
      g.arc(W - 16, 16, ringR, Math.PI / 2, Math.PI);
      g.stroke();
      g.lineWidth = 1;
    }

    // Floating Dust & Chalk Motes
    motes.forEach(m => {
      m.x += m.vx;
      m.y += m.vy;
      if (m.y < 0) m.y = H;
      if (m.x < 0) m.x = W;
      if (m.x > W) m.x = 0;

      g.fillStyle = `rgba(255, 240, 200, ${m.alpha * 0.65})`;
      g.fillRect(m.x, m.y, m.sz, m.sz);
    });
  }

  /* ═══ SCREEN RENDERERS ═══════════════════════════════════ */
  function renderTitle() {
    titleTimer++;
    g.fillStyle = C.fblk;
    g.fillRect(0, 0, W, H);

    g.fillStyle = '#141720';
    for (let y = 0; y < H; y += 16) g.fillRect(0, y, W, 2);

    g.textAlign = 'center';
    g.font = '14px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY PRESENTS', W / 2, 70);

    g.font = '28px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText('IRON RUN', W / 2, 120);

    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.cyan;
    g.fillText('SECTOR 67, MOHALI — HD 32-BIT GYM RPG', W / 2, 155);

    g.fillStyle = '#1a1d26';
    g.fillRect(72, 180, 368, 130);
    g.strokeStyle = C.fy;
    g.lineWidth = 3;
    g.strokeRect(72, 180, 368, 130);
    g.lineWidth = 1;

    g.fillStyle = C.fy;
    g.fillRect(150, 194, 212, 26);
    g.fillStyle = C.fblk;
    g.font = '12px "Press Start 2P", monospace';
    g.fillText('FITWAY GYM', W / 2, 212);

    const opts = ['START GAME', 'CHAPTER SELECT', 'CHARACTER SELECT', 'FREE ROAM'];
    opts.forEach((opt, i) => {
      const isSel = i === selectedMenuIndex;
      g.fillStyle = isSel ? C.fy : C.uiMuted;
      g.font = '11px "Press Start 2P", monospace';
      g.fillText((isSel ? '► ' : '  ') + opt, W / 2, 260 + i * 26);
    });

    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = '#606878';
    g.fillText('USE D-PAD ▲ ▼ • PRESS [A] TO SELECT', W / 2, 420);
    g.textAlign = 'left';
  }

  function renderChapterCard() {
    chapterCardTimer++;
    g.fillStyle = C.fblk;
    g.fillRect(0, 0, W, H);

    const ch = CHAPTERS[chapter - 1];
    g.textAlign = 'center';
    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(`CHAPTER ${ch.num}`, W / 2, 140);

    g.font = '18px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText(`“${ch.title}”`, W / 2, 190);

    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.uiMuted;
    g.fillText(ch.desc, W / 2, 250);

    if (chapterCardTimer > 60 && Math.floor(frame / 14) % 2 === 0) {
      g.font = '11px "Press Start 2P", monospace';
      g.fillStyle = C.fy;
      g.fillText('PRESS [A] TO BEGIN', W / 2, 360);
    }
    g.textAlign = 'left';
  }

  function renderChapterSelectScreen() {
    g.fillStyle = C.fblk;
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '14px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY — CHAPTER SELECT', W / 2, 40);

    CHAPTERS.forEach((ch, i) => {
      const isSel = i === chapterSelectIndex;
      const y = 80 + i * 78;

      g.fillStyle = isSel ? C.uiGlass : '#12141c';
      g.fillRect(32, y, W - 64, 66);
      g.strokeStyle = isSel ? C.fy : '#282c38';
      g.lineWidth = 2;
      g.strokeRect(32, y, W - 64, 66);
      g.lineWidth = 1;

      g.textAlign = 'left';
      g.font = '12px "Press Start 2P", monospace';
      g.fillStyle = isSel ? C.fy : C.white;
      g.fillText((isSel ? '► ' : '  ') + `CH ${ch.num}: ${ch.title}`, 48, y + 26);

      g.font = '9px "Press Start 2P", monospace';
      g.fillStyle = C.uiMuted;
      g.fillText(ch.desc, 60, y + 50);
    });

    g.textAlign = 'center';
    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('▲ ▼ CHOOSE CHAPTER • [A] PLAY', W / 2, 420);
    g.textAlign = 'left';
  }

  function renderCharSelect() {
    g.fillStyle = '#0a0c10';
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '14px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY — CHOOSE YOUR MEMBER', W / 2, 28);

    drawPortrait(selChar.id, 24, 48, 110, false);

    const ix = 150;
    g.textAlign = 'left';
    g.font = '16px "Press Start 2P", monospace';
    g.fillStyle = C.uiText;
    g.fillText(selChar.name, ix, 64);

    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(selChar.title, ix, 84);

    g.fillStyle = C.uiMuted;
    g.font = '9px "Press Start 2P", monospace';
    selChar.quote.split('\n').forEach((ql, i) => g.fillText(ql, ix, 108 + i * 16));

    STAT_NAMES.forEach((sn, i) => {
      const sx = (i < 3) ? ix : ix + 160;
      const syi = 155 + (i % 3) * 20;
      g.fillStyle = '#808890';
      g.font = '10px "Press Start 2P", monospace';
      g.fillText(sn, sx, syi);
      for (let p = 0; p < 5; p++) {
        g.fillStyle = p < selChar.stats[i] ? C.fy : '#2a2a3a';
        g.fillRect(sx + 55 + p * 14, syi - 10, 10, 10);
      }
    });

    g.fillStyle = C.white;
    g.font = '10px "Press Start 2P", monospace';
    g.fillText('WEAPON: ' + selChar.weapon, ix, 226);
    g.fillStyle = '#00e676';
    g.fillText('SPECIAL: ' + selChar.special, ix, 246);

    const rosterY = 275, boxSize = 56, gap = 16;
    const totalW = CHARS.length * boxSize + (CHARS.length - 1) * gap;
    const startX = (W - totalW) / 2;

    CHARS.forEach((ch, i) => {
      const bx = startX + i * (boxSize + gap);
      const selected = i === charIdx;
      if (selected) {
        g.fillStyle = C.fy;
        g.fillRect(bx - 3, rosterY - 3, boxSize + 6, boxSize + 6);
      }
      drawPortrait(ch.id, bx, rosterY, boxSize, false);
      g.fillStyle = selected ? C.fy : '#606070';
      g.font = '9px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillText(ch.name, bx + boxSize / 2, rosterY + boxSize + 16);
      g.textAlign = 'left';
    });

    g.textAlign = 'center';
    g.font = '11px "Press Start 2P", monospace';
    g.fillStyle = C.uiText;
    g.fillText('◄ D-PAD ►     [A] SELECT', W / 2, 410);
    g.textAlign = 'left';
  }

  function renderHUD() {
    if (state !== 'explore' || dlg.active) return;

    // Glassmorphic Gauges
    g.fillStyle = 'rgba(15,17,23,0.88)';
    g.fillRect(6, 6, 168, 52);
    g.strokeStyle = '#3a3f50';
    g.strokeRect(6, 6, 168, 52);

    g.fillStyle = '#f03a3a';
    g.fillRect(12, 12, 92, 10);
    g.fillStyle = C.white;
    g.font = '8px "Press Start 2P", monospace';
    g.fillText('HP 100', 110, 21);

    g.fillStyle = '#00b0ff';
    g.fillRect(12, 26, 76, 10);
    g.fillText('EN 85', 110, 35);

    g.fillStyle = '#00e676';
    g.fillRect(12, 40, 92, 10);
    g.fillText('ST 100', 110, 49);

    // Top-Right Sector 67 Info & Current Chapter Objective
    g.fillStyle = 'rgba(15,17,23,0.88)';
    g.fillRect(W - 200, 6, 194, 52);
    g.strokeStyle = '#3a3f50';
    g.strokeRect(W - 200, 6, 194, 52);

    g.fillStyle = C.fy;
    g.font = '9px "Press Start 2P", monospace';
    g.fillText(`CH ${chapter}: ${CHAPTERS[chapter - 1]?.title.slice(0, 12)}`, W - 194, 20);
    g.fillStyle = C.uiText;
    g.font = '7px "Press Start 2P", monospace';
    const curObj = CHAPTERS[chapter - 1]?.objectives[Math.min(storyStep, (CHAPTERS[chapter - 1]?.objectives.length || 1) - 1)] || 'Explore Sector 67';
    g.fillText(`🎯 ${curObj.slice(0, 26)}`, W - 194, 34);
    g.fillStyle = C.uiMuted;
    g.fillText('Sector 67, Mohali', W - 194, 48);

    // Bottom Action Prompt
    g.fillStyle = 'rgba(15,17,23,0.88)';
    g.fillRect(40, H - 36, W - 80, 32);
    g.strokeStyle = C.fy;
    g.strokeRect(40, H - 36, W - 80, 32);
    g.fillStyle = C.fy;
    g.font = '9px "Press Start 2P", monospace';
    g.textAlign = 'center';
    g.fillText(`[A] ACTION / WORKOUT  •  [B] SPRINT  •  ⚡ OVERRIDE READY`, W / 2, H - 15);
    g.textAlign = 'left';
  }

  function renderDialogue() {
    if (!dlg.active || dlg.idx >= dlg.lines.length) return;
    const line = dlg.lines[dlg.idx];
    const isTalking = dlg.charPos < line.t.length;

    g.fillStyle = C.uiGlass;
    g.fillRect(0, H - 110, W, 110);
    g.fillStyle = C.uiGlassBorder;
    g.fillRect(0, H - 110, W, 4);
    g.fillRect(0, H - 4, W, 4);

    const speakerChar = CHARS.find(ch => ch.name === line.s);
    if (speakerChar) {
      drawPortrait(speakerChar.id, 8, H - 102, 68, isTalking);
    } else {
      g.fillStyle = C.fblk2;
      g.fillRect(8, H - 102, 68, 68);
      g.strokeStyle = C.metalDk;
      g.strokeRect(8, H - 102, 68, 68);
    }

    if (line.s) {
      g.fillStyle = C.fy;
      g.font = '12px "Press Start 2P", monospace';
      g.fillText(line.s, 86, H - 85);
    }

    g.fillStyle = C.uiText;
    g.font = '10px "Press Start 2P", monospace';
    const visibleText = line.t.substring(0, dlg.charPos);
    visibleText.split('\n').forEach((tl, i) => g.fillText(tl, 86, H - 62 + i * 20));

    if (dlg.charPos >= line.t.length && Math.floor(frame / 16) % 2 === 0) {
      g.fillStyle = C.fy;
      g.fillText('▼', W - 28, H - 16);
    }
  }

  function renderChallenge() {
    g.fillStyle = 'rgba(0,0,0,0.85)';
    g.fillRect(0, 0, W, H);

    g.fillStyle = C.uiGlass;
    g.fillRect(40, 50, W - 80, 340);
    g.strokeStyle = C.uiGlassBorder;
    g.lineWidth = 3;
    g.strokeRect(40, 50, W - 80, 340);
    g.lineWidth = 1;

    g.textAlign = 'center';
    g.font = '14px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(chl.title, W / 2, 90);

    g.font = '12px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText(chl.name, W / 2, 130);
    g.fillStyle = C.uiMuted;
    g.font = '10px "Press Start 2P", monospace';
    g.fillText(`COACH: ${chl.trainer}`, W / 2, 155);

    const pad = n => String(n).padStart(2, '0');
    g.font = '40px "Press Start 2P", monospace';
    g.fillStyle = '#00e676';
    g.fillText(`${pad(chl.current)} / ${pad(chl.target)}`, W / 2, 230);

    g.fillStyle = C.metalDk;
    g.fillRect(80, 270, W - 160, 16);
    g.fillStyle = C.fy;
    g.fillRect(80, 270, (W - 160) * (chl.current / chl.target), 16);

    if (Math.floor(frame / 14) % 2 === 0) {
      g.font = '14px "Press Start 2P", monospace';
      g.fillStyle = C.fy;
      g.fillText('TAP [A] TO REP!', W / 2, 340);
    }
    g.textAlign = 'left';
  }

  function renderChaosMinigame() {
    g.fillStyle = 'rgba(0,0,0,0.88)';
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '16px "Press Start 2P", monospace';
    g.fillStyle = '#f03a3a';
    g.fillText('CARDIO EMERGENCY OVERLOAD!', W / 2, 80);

    g.font = '11px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText('SHUT DOWN MALFUNCTIONING HARDWARE', W / 2, 115);

    g.font = '32px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(`REBOOTED: ${minigame.score} / ${minigame.total}`, W / 2, 210);

    if (Math.floor(frame / 12) % 2 === 0) {
      g.font = '14px "Press Start 2P", monospace';
      g.fillStyle = '#00e676';
      g.fillText('TAP [A] TO OVERRIDE', W / 2, 310);
    }
    g.textAlign = 'left';
  }

  function renderUnlock() {
    unlockAnim.timer++;
    g.fillStyle = 'rgba(0,0,0,0.92)';
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '16px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('EQUIPMENT UNLOCKED!', W / 2, 90);

    g.fillStyle = C.uiGlass;
    g.fillRect(60, 120, W - 120, 190);
    g.strokeStyle = C.fy;
    g.lineWidth = 3;
    g.strokeRect(60, 120, W - 120, 190);
    g.lineWidth = 1;

    g.font = '18px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText(unlockAnim.title, W / 2, 170);

    g.font = '13px "Press Start 2P", monospace';
    g.fillStyle = '#00e676';
    g.fillText(unlockAnim.name, W / 2, 210);

    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.uiMuted;
    g.fillText(unlockAnim.desc, W / 2, 255);

    if (unlockAnim.timer > 30 && Math.floor(frame / 16) % 2 === 0) {
      g.font = '12px "Press Start 2P", monospace';
      g.fillStyle = C.white;
      g.fillText('PRESS [A] TO CONTINUE', W / 2, 360);
    }
    g.textAlign = 'left';
  }

  function renderCredits() {
    g.fillStyle = C.fblk;
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '18px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY: THE END', W / 2, 70);

    const yOff = 130;
    g.font = '11px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('SUKH — OWNER / FOUNDER', W / 2, yOff);
    g.fillStyle = C.white;
    g.fillText('GAGAN — TECHNIQUE POLICE', W / 2, yOff + 30);
    g.fillStyle = C.fy;
    g.fillText('SHUBHAM — SPEED & CARDIO DEMON', W / 2, yOff + 60);
    g.fillStyle = C.white;
    g.fillText('RAKESH — VETERAN FORM PURIST', W / 2, yOff + 90);
    g.fillStyle = '#00e676';
    g.fillText('HERMAN — SOFTWARE / HARDWARE / IT', W / 2, yOff + 120);

    g.fillStyle = C.fy;
    g.font = '14px "Press Start 2P", monospace';
    g.fillText('“KAL PHIR AA JAANA.”', W / 2, 340);

    g.fillStyle = C.white;
    g.font = '11px "Press Start 2P", monospace';
    g.fillText('PRESS [A] FOR FREE ROAM GYM', W / 2, 400);
    g.textAlign = 'left';
  }

  /* ═══ MAIN UPDATE LOOP ═══════════════════════════════════ */
  function update() {
    frame++;
    updateFade();

    if (screenShake > 0) screenShake *= 0.85;

    const held = window.__held || {};
    const aEdge = window.__aEdge;

    switch (state) {
      case 'title':
        if (held.up && !held._tU) {
          selectedMenuIndex = (selectedMenuIndex - 1 + menuOptions.length) % menuOptions.length;
          Audio8.sfx('menu');
        }
        if (held.down && !held._tD) {
          selectedMenuIndex = (selectedMenuIndex + 1) % menuOptions.length;
          Audio8.sfx('menu');
        }
        held._tU = held.up;
        held._tD = held.down;

        if (aEdge) {
          Audio8.sfx('start');
          if (selectedMenuIndex === 0) {
            startChapter(1);
          } else if (selectedMenuIndex === 1) {
            state = 'chapter_select';
          } else if (selectedMenuIndex === 2) {
            state = 'char_select';
          } else if (selectedMenuIndex === 3) {
            chapter = 4;
            storyStep = 3;
            state = 'explore';
            loadRoom('main_gym');
          }
        }
        break;

      case 'chapter_card':
        if (aEdge && chapterCardTimer > 30) {
          state = 'explore';
          loadRoom('main_gym');
        }
        break;

      case 'chapter_select':
        if (held.up && !held._cU) {
          chapterSelectIndex = (chapterSelectIndex - 1 + CHAPTERS.length) % CHAPTERS.length;
          Audio8.sfx('menu');
        }
        if (held.down && !held._cD) {
          chapterSelectIndex = (chapterSelectIndex + 1) % CHAPTERS.length;
          Audio8.sfx('menu');
        }
        held._cU = held.up;
        held._cD = held.down;

        if (aEdge) {
          startChapter(CHAPTERS[chapterSelectIndex].num);
        }
        break;

      case 'char_select':
        if (held.left && !held._csL) {
          charIdx = (charIdx - 1 + CHARS.length) % CHARS.length;
          selChar = CHARS[charIdx];
          Audio8.sfx('menu');
        }
        if (held.right && !held._csR) {
          charIdx = (charIdx + 1) % CHARS.length;
          selChar = CHARS[charIdx];
          Audio8.sfx('menu');
        }
        held._csL = held.left;
        held._csR = held.right;

        if (aEdge) {
          selChar = CHARS[charIdx];
          startChapter(1);
        }
        break;

      case 'explore':
        if (pl.actionTimer > 0) pl.actionTimer--;

        pl.moving = false;
        let nx = pl.x, ny = pl.y;
        const spd = held.b ? pl.spd * 1.6 : pl.spd;

        if (held.up) { ny -= spd; pl.dir = 'up'; pl.moving = true; }
        if (held.down) { ny -= spd; pl.dir = 'down'; pl.moving = true; }
        if (held.left) { nx -= spd; pl.dir = 'left'; pl.moving = true; }
        if (held.right) { nx += spd; pl.dir = 'right'; pl.moving = true; }

        if (canWalkTo(nx, pl.y)) pl.x = nx;
        if (canWalkTo(pl.x, ny)) pl.y = ny;

        pl.x = Math.max(0, Math.min(W - TS, pl.x));
        pl.y = Math.max(0, Math.min(H - 44, pl.y));

        if (pl.moving) {
          pl.walkT++;
          pl.idleTimer = 0;
          if (pl.walkT % 5 === 0) pl.walkFrame = (pl.walkFrame || 0) + 1;
          if (pl.walkFrame > 7) pl.walkFrame = 0;

          if (held.b || pl.walkT % 6 === 0) {
            spawnDust(pl.x + 16, pl.y + 40);
          }
        } else {
          pl.walkFrame = 0;
          pl.idleTimer++;
        }

        checkExits();

        if (pl.interactCooldown > 0) pl.interactCooldown--;
        if (aEdge && pl.interactCooldown <= 0) {
          pl.interactCooldown = 12;
          checkInteraction();
        }
        break;

      case 'dialogue':
        if (dlg.active && dlg.lines[dlg.idx]) {
          const line = dlg.lines[dlg.idx];
          if (dlg.charPos < line.t.length) {
            dlg.timer++;
            if (dlg.timer % 2 === 0) dlg.charPos++;
          }
        }
        if (aEdge) advanceDialogue();
        break;

      case 'challenge':
        if (aEdge) doRep();
        break;

      case 'chaos_minigame':
        if (aEdge) {
          minigame.score++;
          Audio8.sfx('override_beep');
          if (minigame.score >= minigame.total) {
            minigame.active = false;
            if (minigame.onDone) minigame.onDone();
          }
        }
        break;

      case 'unlock':
        if (aEdge && unlockAnim.timer > 20) {
          unlockAnim.active = false;
          state = 'explore';
          if (unlockAnim.onDone) unlockAnim.onDone();
        }
        break;

      case 'credits':
        if (aEdge) {
          chapter = 4;
          storyStep = 3;
          state = 'explore';
          loadRoom('main_gym');
        }
        break;
    }
  }

  /* ═══ MAIN RENDER LOOP ═══════════════════════════════════ */
  function render(ctx) {
    if (ctx) g = ctx;
    if (!g) return;

    g.imageSmoothingEnabled = false;

    // Apply Screen Shake if Active
    const sx = screenShake > 0.5 ? (Math.random() - 0.5) * screenShake : 0;
    const sy = screenShake > 0.5 ? (Math.random() - 0.5) * screenShake : 0;
    if (sx !== 0 || sy !== 0) {
      g.save();
      g.translate(sx, sy);
    }

    switch (state) {
      case 'title':
        renderTitle();
        break;
      case 'chapter_card':
        renderChapterCard();
        break;
      case 'chapter_select':
        renderChapterSelectScreen();
        break;
      case 'char_select':
        renderCharSelect();
        break;
      case 'credits':
        renderCredits();
        break;
      case 'explore':
      case 'dialogue':
        if (roomBgCanvas) g.drawImage(roomBgCanvas, 0, 0);

        const entities = [];
        npcs.forEach(npc => {
          entities.push({
            y: npc.py,
            draw: () => {
              drawSprite(npc.sprite || npc.charId || 'member_m', npc.px, npc.py, npc.dir, npc.walkFrame || 0, npc.exercising);
              if (npc.isStory) {
                const markerY = npc.py - 10 + Math.sin(frame * 0.15) * 3;
                g.fillStyle = C.fy;
                g.font = '10px "Press Start 2P", monospace';
                g.textAlign = 'center';
                g.fillText('!', npc.px + 16, markerY);
                g.textAlign = 'left';
              }
            }
          });
        });

        entities.push({
          y: pl.y,
          draw: () => drawSprite(selChar.id, pl.x, pl.y, pl.dir, pl.walkFrame || 0, false)
        });

        entities.sort((a, b) => a.y - b.y);
        entities.forEach(e => e.draw());

        renderAtmosphere();
        renderHUD();

        if (state === 'dialogue') renderDialogue();
        break;

      case 'challenge':
        if (roomBgCanvas) g.drawImage(roomBgCanvas, 0, 0);
        renderAtmosphere();
        renderChallenge();
        break;

      case 'chaos_minigame':
        if (roomBgCanvas) g.drawImage(roomBgCanvas, 0, 0);
        renderAtmosphere();
        renderChaosMinigame();
        break;

      case 'unlock':
        renderUnlock();
        break;
    }

    if (sx !== 0 || sy !== 0) g.restore();

    if (fade.alpha > 0) {
      g.fillStyle = `rgba(0,0,0,${fade.alpha.toFixed(2)})`;
      g.fillRect(0, 0, W, H);
    }
  }

  function start(ctx) {
    g = ctx;
    state = 'title';
    titleTimer = 0;
    charIdx = 0;
    selChar = CHARS[0];
    chapter = 1;
    storyStep = 0;
    initMotes();
  }

  function stop() { Audio8.stop(); }
  function reset() { state = 'title'; titleTimer = 0; }
  function onAction() {
    if (state === 'challenge') { doRep(); return; }
    window.__aEdge = true;
  }

  function getHUD() {
    return {
      title: 'FITWAY: IRON RUN',
      char: selChar?.name || 'HERMAN',
      room: curRoom?.name || 'SECTOR 67',
      chapter: `CHAPTER ${chapter}`,
      equipped: 'MACHINE OVERRIDE'
    };
  }

  return { start, stop, reset, update, render, onAction, getHUD };
})();
