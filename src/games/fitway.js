/* ============================================================
   FITWAY: IRON RUN — 16/32-Bit Modern Gym RPG Experience
   Sector 67, Mohali • Visual & Environmental Overhaul
   ============================================================
   High-Fidelity 16/32-Bit Aesthetics:
   - Dynamic Atmospheric Lighting (Volumetric Sunbeams & Dust Motes)
   - Real-time Rotating Ceiling Fan Shadows & Ambient Specular Sheen
   - Precision-Crafted Modern Gym Equipment & Living NPC Lifters
   - Real-time Mirror Reflection Silhouettes
   - Glassmorphic Sleek HUD with Fluid Gradient Energy Gauges
   - Street Fighter II-Grade 72x72 Detailed Character Busts
   - Chapter Select (Chapters 1 to 4) + Free Roam Gym Mode
   ============================================================ */

window.FitwayGame = (() => {
  'use strict';
  const W = 256, H = 224, TS = 16, COLS = 16, ROWS = 14;
  let g = null, frame = 0;

  /* ═══ MODERN 16/32-BIT PALETTE ═══════════════════════════ */
  const C = {
    // Hardwood Flooring (Rich multi-tone walnut with lacquer sheen)
    wood1: '#b88652', wood2: '#9a6b3c', wood3: '#7d5229', wood4: '#cf9e6b', woodLine: '#66411d',
    // Rubber Heavy Matting (Interlocking carbon texture)
    rubber1: '#262932', rubber2: '#1d1f27', rubber3: '#323642', rubberBorder: '#ffd000',
    carpetRed: '#8f242e', carpetBlue: '#1e4875',
    // Architectural Walls & Trim
    wall: '#ede5d8', wallDk: '#cebfac', wallTop: '#786856', baseboard: '#442d1b',
    // Fitway Neon Branding
    fy: '#ffd000', fyDk: '#cc9900', fyLt: '#ffe766', fyGlow: 'rgba(255, 208, 0, 0.45)',
    fblk: '#0f1115', fblk2: '#1a1d24',
    // High-Tech Chrome & Steel
    metal: '#929ca8', metalDk: '#545d68', metalLt: '#c8d2dc', metalHi: '#eef4fa',
    // Glass, Mirrors & Atmosphere
    mirror: '#a8ccdc', mirrorLt: '#cce6f4', mirrorHi: '#ffffff',
    sunbeam: 'rgba(255, 245, 210, 0.12)', sunbeamCore: 'rgba(255, 250, 230, 0.22)',
    glass: '#8cbcd8',
    // Dynamic Accents
    red: '#f03a3a', green: '#00e676', blue: '#00b0ff', cyan: '#00e5ff', purple: '#ab47bc', orange: '#ff9100',
    // UI Theme
    uiGlass: 'rgba(15, 17, 23, 0.88)', uiGlassBorder: '#ffd000', uiText: '#f0f3f8', uiMuted: '#8a94a6',
    black: '#000000', white: '#ffffff', shadow: 'rgba(0, 0, 0, 0.32)'
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

  /* ═══ CHAPTER DEFINITIONS ════════════════════════════════ */
  const CHAPTERS = [
    { num: 1, title: 'JUST COME TO THE GYM', desc: 'Arrival at Sector 67, Gagan challenge & cardio reboot' },
    { num: 2, title: 'THE BENCH IS NOT RESERVED', desc: 'Gagan bench dispute, Shubham & functional training' },
    { num: 3, title: 'EVERYONE KNOWS EVERYONE', desc: 'Sector 67 gossip, Rakesh & the Fitway Competition' },
    { num: 4, title: 'THE WEIGHTS FLOOR (FINALE)', desc: 'Floor 2 unlock, blackout surge, Sukh boss & credits' }
  ];

  /* ═══ STATE & VARIABLES ══════════════════════════════════ */
  let state = 'title'; // title | menu | chapter_select | char_select | explore | dialogue | challenge | chaos_minigame | unlock | credits
  let selectedMenuIndex = 0;
  let menuOptions = [
    'PLAY STORY (CHAPTER 1)',
    'SELECT CHAPTER (1-4)',
    'CHARACTER SELECT (SF2)',
    'FREE ROAM SECTOR 67 GYM'
  ];
  let chapterSelectIndex = 0;
  let chapter = 1;
  let charIdx = 0, selChar = CHARS[0];
  let titleTimer = 0;

  // Player with floating-point position for ultra-smooth movement
  let pl = {
    x: 112, y: 160, vx: 0, vy: 0,
    dir: 'down', moving: false,
    walkT: 0, walkFrame: 0, spd: 2.0,
    interactCooldown: 0,
    hp: 100, maxHp: 100,
    energy: 85, maxEnergy: 100,
    stamina: 100, maxStamina: 100
  };

  // Atmospheric Dust Motes
  let motes = [];
  function initMotes() {
    motes = [];
    for (let i = 0; i < 24; i++) {
      motes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.1 - Math.random() * 0.2,
        sz: Math.random() > 0.6 ? 1.5 : 1.0,
        alpha: 0.2 + Math.random() * 0.5
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

  /* ═══ 16-BIT DETAILED GYM ROOM MAPS ══════════════════════ */
  // Tile Key:
  // . = walnut wood floor, , = rubber deadlift mat, r = red carpet, b = blue carpet
  // s = street pavement, c = sidewalk curb, g = grass
  // W = solid wall, M = full mirror, P = Fitway poster, C = clock, V = TV, H = sunbeam window
  // F = Fitway gold sign, D = desk, L = lockers, p = ficus plant, w = water cooler, n = bench
  // T = animated treadmill, B = spin bike, k = kettlebell & yoga ball, q = squat/cable machine
  // d = chrome dumbbell rack, m = exercise mat, U = heavy bag, Y = speed bag, O = terminal
  const WALKABLE = '._, rbmgs><^vEO';
  function isWalkable(ch) { return WALKABLE.includes(ch); }

  const ROOMS = {
    main_gym: {
      name: 'FITWAY MAIN GYM — SECTOR 67',
      map: [
        'W.H..H..H..H..HW',
        'Wd.k......qq..rW',
        'Wd.k......qq..rW',
        'W..............W',
        'W.TT.TT.BB..n..W',
        'W.TT.TT.BB..n..W',
        'W..............W',
        'W..mm..mm.U.Y.pW',
        'W..mm..mm.U.Y..W',
        'W..............W',
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
        { id: 'rakesh_main', charId: 'rakesh', tx: 12, ty: 5, dir: 'left', isStory: true, name: 'RAKESH' },
        { id: 'bench_lifter', tx: 12, ty: 4, dir: 'up', sprite: 'lifter_bench', exercising: true, name: 'BENCH LIFTER' },
        { id: 'treadmill_runner', tx: 2, ty: 4, dir: 'down', sprite: 'member_m', exercising: true, name: 'RUNNER' }
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

  /* ═══ DIALOGUE SCRIPTS ═══════════════════════════════════ */
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
      { s: 'GAGAN', t: 'There you are. You haven\'t trained.' },
      { s: 'HERMAN', t: 'I just came in.' },
      { s: 'GAGAN', t: "Come on. 15 Kettlebell Swings.\nLet's see your form." }
    ],
    ch1_treadmill_chaos: [
      { s: null, t: 'BEEP. BEEP. BEEP!\nOVERHEATED TREADMILL ON CARDIO FLOOR!' },
      { s: 'SUKH', t: 'Fix it, Herman! Computer inside!' },
      { s: 'HERMAN', t: 'I reset it and the whole network is spinning!' }
    ],
    ch1_override_done: [
      { s: 'HERMAN', t: 'Fixed.' },
      { s: 'SUKH', t: "Next time don't fix it like that." },
      { s: 'HERMAN', t: 'Okay.' }
    ],
    ch2_bench_drama: [
      { s: 'GAGAN', t: 'Someone has been using my bench!' },
      { s: 'HERMAN', t: 'Does it have your name on it?' },
      { s: 'GAGAN', t: '...No.' },
      { s: 'HERMAN', t: 'Then alternate sets. Solved.' },
      { s: 'SHUBHAM', t: 'Herman! No Machine Override here.\nPure speed and 20 Band Pulls!' }
    ],
    ch3_competition: [
      { s: 'RAKESH', t: 'Old-school form beats fancy tech every time.' },
      { s: 'RAKESH', t: 'Fitway Competition! Let us see your real power!' }
    ],
    ch4_finale: [
      { s: 'HERMAN', t: 'The entire gym controller is overloading!' },
      { s: 'SUKH', t: 'Fitway became too complicated over the years.' },
      { s: 'SUKH', t: 'Gym sirf machines nahi hai. People.' },
      { s: 'SUKH', t: 'Owner\'s Final Test! Barbell Squat Challenge!' }
    ],
    ch4_sitcom_end: [
      { s: 'SUKH', t: 'Good. Tomorrow you come again.' },
      { s: 'HERMAN', t: 'I hate this place.' },
      { s: 'GAGAN', t: 'You\'ll be here tomorrow.' },
      { s: 'HERMAN', t: '...Yeah.' }
    ]
  };

  /* ═══ HIGH-DEFINITION PIXEL TILE RENDERING ═══════════════ */
  function drawTile(ctx, ch, x, y) {
    switch (ch) {
      case '.': // 16-bit Polished Walnut Hardwood Plank
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.wood2;
        ctx.fillRect(x, y + 4, TS, 1);
        ctx.fillRect(x, y + 10, TS, 1);
        ctx.fillStyle = C.wood3;
        ctx.fillRect(x + 7, y, 1, TS);
        ctx.fillStyle = C.wood4;
        ctx.fillRect(x + 8, y, 1, TS);
        // Lacquer sheen dot
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fillRect(x + 1, y + 1, TS - 2, 2);
        break;

      case ',': // Interlocking High-Density Rubber Mat
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.rubber3;
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x + i * 4 + 1, y + i * 4 + 1, 2, 2);
          ctx.fillRect(x + i * 4 + 2, y + i * 4 + 2, 1, 1);
        }
        ctx.fillStyle = '#14161c';
        ctx.fillRect(x, y, TS, 1);
        ctx.fillRect(x, y, 1, TS);
        break;

      case 'r': // Crimson Performance Mat
        ctx.fillStyle = C.carpetRed;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#b32e3b';
        ctx.fillRect(x + 1, y + 1, TS - 2, TS - 2);
        ctx.fillStyle = '#e04050';
        ctx.fillRect(x + 2, y + 2, TS - 4, 1);
        break;

      case 'b': // Cobalt Agility Mat
        ctx.fillStyle = C.carpetBlue;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#26598f';
        ctx.fillRect(x + 1, y + 1, TS - 2, TS - 2);
        ctx.fillStyle = '#3a78bd';
        ctx.fillRect(x + 2, y + 2, TS - 4, 1);
        break;

      case 's': // Street Asphalt
        ctx.fillStyle = '#3a3e47';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#282b32';
        ctx.fillRect(x, y + 7, TS, 1);
        ctx.fillRect(x + 7, y, 1, TS);
        break;

      case 'c': // Sidewalk Curb
        ctx.fillStyle = '#848d9c';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#b6bfcc';
        ctx.fillRect(x, y, TS, 3);
        ctx.fillStyle = '#5c6470';
        ctx.fillRect(x, y + 13, TS, 3);
        break;

      case 'g': // Lush Green Grass
        ctx.fillStyle = '#3d6c2e';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#528e3f';
        ctx.fillRect(x + 2, y + 3, 2, 4);
        ctx.fillRect(x + 9, y + 7, 2, 4);
        break;

      case 'W': // Structural Gym Wall with Baseboard & Top Trim
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.wallDk;
        ctx.fillRect(x, y + 11, TS, 2);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        ctx.fillStyle = C.wallTop;
        ctx.fillRect(x, y, TS, 2);
        break;

      case 'H': // Upper Architectural Window with Atmospheric Sunbeam
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.glass;
        ctx.fillRect(x + 1, y + 1, 14, 10);
        ctx.fillStyle = C.mirrorHi;
        ctx.fillRect(x + 3, y + 2, 4, 8);
        ctx.fillRect(x + 8, y + 2, 4, 8);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 7, y + 1, 2, 10);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;

      case 'F': // Glowing Fitway Gold Marquee Sign
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 1, y + 3, 14, 10);
        ctx.fillStyle = C.fyLt;
        ctx.fillRect(x + 2, y + 4, 12, 2);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 3, y + 5, 2, 6);
        ctx.fillRect(x + 3, y + 5, 8, 2);
        ctx.fillRect(x + 3, y + 8, 6, 2);
        break;

      case 'M': // Full-Height Chrome Gym Mirror
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.mirror;
        ctx.fillRect(x + 1, y + 1, 14, 12);
        ctx.fillStyle = C.mirrorLt;
        const sh = (frame * 0.3) % 20;
        if (sh < 14) ctx.fillRect(x + 1 + sh, y + 2, 2, 10);
        ctx.fillStyle = C.mirrorHi;
        ctx.fillRect(x + 4, y + 3, 5, 1);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 1, y + 0, 14, 1);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;

      case 'D': // Sleek Modern Reception Desk & Terminal
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fblk2;
        ctx.fillRect(x, y, TS, 14);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x, y + 12, TS, 2); // Underglow LED strip
        ctx.fillStyle = '#21252d';
        ctx.fillRect(x + 3, y + 2, 7, 6);
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x + 4, y + 3, 5, 4);
        break;

      case 'L': // Modern Metallic Lockers with Vents
        ctx.fillStyle = C.metal;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 7, y, 2, TS);
        ctx.fillRect(x, y + 7, TS, 1);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 1, y + 1, 5, 5);
        ctx.fillRect(x + 9, y + 1, 5, 5);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 5, y + 3, 1, 1);
        ctx.fillRect(x + 13, y + 3, 1, 1);
        break;

      case 'p': // Ficus Plant in Terracotta Pot
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#b85c38';
        ctx.fillRect(x + 4, y + 9, 8, 6);
        ctx.fillStyle = '#2e7d32';
        ctx.fillRect(x + 3, y + 2, 10, 8);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x + 5, y + 3, 6, 4);
        ctx.fillStyle = '#81c784';
        ctx.fillRect(x + 6, y + 4, 3, 2);
        break;

      case 'T': // High-Tech Treadmill with Animated Cyan LED Dash
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 2, y + 5, 12, 8);
        // Belt animation
        const bOff = (frame * 0.8) % 8;
        ctx.fillStyle = '#2c303c';
        for (let i = -1; i < 3; i++) {
          const sy = y + 6 + i * 4 + bOff;
          if (sy > y + 4 && sy < y + 13) ctx.fillRect(x + 3, sy, 10, 1);
        }
        // Cyan Dash Screen
        ctx.fillStyle = C.cyan;
        ctx.fillRect(x + 4, y + 2, 8, 2);
        ctx.fillStyle = C.red;
        ctx.fillRect(x + 7, y + 3, 2, 1); // Safety key
        // Rails
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 1, y + 3, 2, 11);
        ctx.fillRect(x + 13, y + 3, 2, 11);
        break;

      case 'B': // Ergonomic Spin Bike with Flywheel
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 5, y + 2, 6, 12);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 4, y + 5, 8, 3);
        // Chrome Flywheel
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 6, y + 9, 4, 4);
        const pOff = Math.sin(frame * 0.2) * 2;
        ctx.fillStyle = C.metalHi;
        ctx.fillRect(x + 3, y + 10 + pOff, 3, 2);
        ctx.fillRect(x + 10, y + 10 - pOff, 3, 2);
        break;

      case 'd': // Chrome & Rubber Hex Dumbbell Rack
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 1, y + 3, 14, 3);
        ctx.fillRect(x + 1, y + 9, 14, 3);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 1, y + 3, 14, 1);
        ctx.fillRect(x + 1, y + 9, 14, 1);
        // Dumbbells
        for (let i = 0; i < 4; i++) {
          ctx.fillStyle = C.fblk;
          ctx.fillRect(x + 2 + i * 3, y + 4, 2, 1);
          ctx.fillRect(x + 2 + i * 3, y + 10, 2, 1);
          ctx.fillStyle = C.metalHi;
          ctx.fillRect(x + 2 + i * 3, y + 3, 2, 1);
          ctx.fillRect(x + 2 + i * 3, y + 9, 2, 1);
        }
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;

      case 'U': // Heavy Leather Punching Bag with Chain
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 7, y + 0, 2, 3); // Hanging chain
        ctx.fillStyle = '#b71c1c';
        ctx.fillRect(x + 4, y + 3, 8, 11);
        ctx.fillStyle = '#e53935';
        ctx.fillRect(x + 5, y + 4, 6, 9);
        // Blue repair tape
        ctx.fillStyle = '#1976d2';
        ctx.fillRect(x + 4, y + 8, 8, 2);
        break;

      case 'Y': // Speed Bag Station
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 6, y + 1, 4, 14);
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(x + 5, y + 6, 6, 6);
        ctx.fillStyle = '#ff8a80';
        ctx.fillRect(x + 6, y + 7, 2, 2);
        break;

      case 'k': // Yoga Stability Ball & Kettlebell Set
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        // Blue Stability Ball with Shading
        ctx.fillStyle = '#1565c0';
        ctx.fillRect(x + 2, y + 3, 8, 8);
        ctx.fillStyle = '#1e88e5';
        ctx.fillRect(x + 3, y + 4, 6, 6);
        ctx.fillStyle = '#90caf9';
        ctx.fillRect(x + 4, y + 4, 3, 2);
        // Kettlebell
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 9, y + 8, 5, 5);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 10, y + 6, 3, 2);
        break;

      case 'q': // Heavy Squat Station & Lat Pulldown
        ctx.fillStyle = C.rubber2;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 1, y, 3, TS);
        ctx.fillRect(x + 12, y, 3, TS);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 2, y + 4, 12, 2);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 4, y + 5, 8, 1);
        // Weight plates on sides
        ctx.fillStyle = C.red;
        ctx.fillRect(x + 0, y + 2, 2, 6);
        ctx.fillRect(x + 14, y + 2, 2, 6);
        break;

      case 'n': // Heavy Bench Press with Lifter Station
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#21252d';
        ctx.fillRect(x + 2, y + 4, 12, 6);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 3, y + 10, 3, 4);
        ctx.fillRect(x + 10, y + 10, 3, 4);
        break;

      default:
        ctx.fillStyle = C.wood1;
        ctx.fillRect(x, y, TS, TS);
        break;
    }
  }

  /* ═══ 16-BIT CHARACTER SPRITE RENDERING ══════════════════ */
  function drawSprite(id, x, y, dir, walkFrame, exercising) {
    // Lifter on Bench Animation (Reference Style)
    if (id === 'lifter_bench') {
      g.fillStyle = C.shadow;
      g.fillRect(x - 2, y + 18, 20, 4);
      g.fillStyle = '#e0b080';
      g.fillRect(x + 3, y + 8, 10, 5);
      g.fillStyle = C.red;
      g.fillRect(x + 5, y + 8, 6, 5);
      // Smooth Barbell Press Motion
      const barY = y + 4 + Math.sin(frame * 0.12) * 3.5;
      g.fillStyle = C.metalHi;
      g.fillRect(x - 3, barY, 22, 2);
      g.fillStyle = C.red;
      g.fillRect(x - 5, barY - 2, 3, 6);
      g.fillRect(x + 18, barY - 2, 3, 6);
      return;
    }

    const ch = CHARS.find(c => c.id === id);
    if (!ch) { drawGenericNPC(id, x, y, dir, walkFrame, exercising); return; }
    const cl = ch.col;
    const bw = ch.build === 'broad' ? 14 : (ch.build === 'stocky' ? 13 : 11);
    const bx = x + (16 - bw) / 2;
    const legOff = (walkFrame === 1) ? 1.2 : (walkFrame === 3) ? -1.2 : 0;
    const breath = Math.sin(frame * 0.08) * 0.5;

    // Real-Time Drop Shadow
    g.fillStyle = C.shadow;
    g.beginPath();
    g.ellipse(x + 8, y + 21, bw * 0.6, 2.5, 0, 0, Math.PI * 2);
    g.fill();

    // Shoes
    g.fillStyle = cl.shoes;
    g.fillRect(bx + 1, y + 19 + legOff, 4, 2);
    g.fillRect(bx + bw - 5, y + 19 - legOff, 4, 2);

    // Pants with shading
    g.fillStyle = cl.pants;
    g.fillRect(bx + 1, y + 15 + legOff, 4, 4);
    g.fillRect(bx + bw - 5, y + 15 - legOff, 4, 4);

    // Shirt & Torso with Breathing Bounce
    g.fillStyle = cl.shirt;
    g.fillRect(bx, y + 8 + breath, bw, 7);
    g.fillStyle = cl.shirtDk;
    g.fillRect(bx, y + 13 + breath, bw, 2);

    // Arms & Hands
    g.fillStyle = cl.skin;
    if (dir === 'left') g.fillRect(bx - 2, y + 9 + breath, 3, 5);
    else if (dir === 'right') g.fillRect(bx + bw - 1, y + 9 + breath, 3, 5);
    else {
      g.fillRect(bx - 1, y + 9 + breath, 2, 5);
      g.fillRect(bx + bw - 1, y + 9 + breath, 2, 5);
    }

    // Neck & Head
    g.fillRect(bx + 3, y + 6 + breath, bw - 6, 2);
    const hw = bw - 2, hx = bx + 1;
    g.fillRect(hx, y + 2 + breath, hw, 5);

    // Hair Style
    g.fillStyle = cl.hair;
    g.fillRect(hx - 1, y + breath, hw + 2, dir === 'up' ? 4 : 3);
    g.fillRect(hx, y - 1 + breath, hw, 2);

    // Eyes & Expressions
    if (dir === 'down') {
      g.fillStyle = '#0f1115';
      g.fillRect(hx + 2, y + 4 + breath, 2, 1);
      g.fillRect(hx + hw - 4, y + 4 + breath, 2, 1);
      g.fillStyle = '#9e6140';
      g.fillRect(hx + 3, y + 6 + breath, hw - 6, 1);
    } else if (dir === 'left') {
      g.fillStyle = '#0f1115';
      g.fillRect(hx + 1, y + 4 + breath, 2, 1);
    } else if (dir === 'right') {
      g.fillStyle = '#0f1115';
      g.fillRect(hx + hw - 3, y + 4 + breath, 2, 1);
    }

    // Accessories
    if (cl.acc === 'glasses' && dir !== 'up') {
      g.fillStyle = C.cyan;
      g.fillRect(hx + 1, y + 3 + breath, hw - 2, 2);
      g.fillStyle = '#263238';
      g.fillRect(hx, y + 3 + breath, 1, 2);
      g.fillRect(hx + hw - 1, y + 3 + breath, 1, 2);
    }
    if (cl.acc === 'headband') {
      g.fillStyle = C.red;
      g.fillRect(hx - 1, y + 1 + breath, hw + 2, 2);
    }
    if (id === 'sukh') {
      g.fillStyle = C.fyDk;
      g.fillRect(bx + 2, y + 8 + breath, bw - 4, 2);
    }
  }

  function drawGenericNPC(type, x, y, dir, wf, exercising) {
    const legOff = (wf === 1) ? 1.2 : (wf === 3) ? -1.2 : 0;
    g.fillStyle = C.shadow;
    g.beginPath();
    g.ellipse(x + 8, y + 21, 6, 2, 0, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = '#263238';
    g.fillRect(x + 4, y + 15 + legOff, 3, 4);
    g.fillRect(x + 9, y + 15 - legOff, 3, 4);
    g.fillStyle = type === 'member_f' ? '#ab47bc' : '#e53935';
    g.fillRect(x + 3, y + 8, 10, 7);
    g.fillStyle = '#f8d0b0';
    g.fillRect(x + 4, y + 2, 8, 5);
    g.fillStyle = '#0f1115';
    g.fillRect(x + 3, y, 10, 3);
  }

  /* ═══ 72×72 HIGH-DETAIL CHARACTER PORTRAITS ═══════════════ */
  function drawPortrait(charId, px, py, size) {
    const ch = CHARS.find(c => c.id === charId);
    if (!ch) return;
    const cl = ch.col;
    const s = size || 64;
    const u = s / 64;

    // Glassmorphic Card Background
    g.fillStyle = C.uiGlass;
    g.fillRect(px, py, s, s);
    g.strokeStyle = C.uiGlassBorder;
    g.lineWidth = 2;
    g.strokeRect(px, py, s, s);
    g.lineWidth = 1;

    // Shoulders with Clothing Folds
    const bw = ch.build === 'broad' ? 52 : (ch.build === 'stocky' ? 46 : 42);
    const bx = px + (s - bw * u) / 2;
    g.fillStyle = cl.shirt;
    g.fillRect(bx, py + 42 * u, bw * u, 22 * u);
    g.fillStyle = cl.shirtDk;
    g.fillRect(bx, py + 54 * u, bw * u, 10 * u);

    // Neck & Collar
    g.fillStyle = cl.skin;
    g.fillRect(px + 24 * u, py + 36 * u, 16 * u, 10 * u);

    // Head Base
    g.fillRect(px + 14 * u, py + 12 * u, 36 * u, 28 * u);

    // Hair Details
    g.fillStyle = cl.hair;
    g.fillRect(px + 10 * u, py + 4 * u, 44 * u, 14 * u);
    g.fillRect(px + 12 * u, py + 2 * u, 40 * u, 8 * u);

    // Expressive Eyes with Highlights
    g.fillStyle = C.white;
    g.fillRect(px + 20 * u, py + 22 * u, 10 * u, 6 * u);
    g.fillRect(px + 34 * u, py + 22 * u, 10 * u, 6 * u);
    g.fillStyle = '#0f1115';
    g.fillRect(px + 24 * u, py + 23 * u, 5 * u, 4 * u);
    g.fillRect(px + 38 * u, py + 23 * u, 5 * u, 4 * u);
    g.fillStyle = C.cyan;
    g.fillRect(px + 26 * u, py + 24 * u, 2 * u, 2 * u);
    g.fillRect(px + 40 * u, py + 24 * u, 2 * u, 2 * u);

    // Accessories
    if (cl.acc === 'glasses') {
      g.fillStyle = C.cyan;
      g.fillRect(px + 16 * u, py + 20 * u, 14 * u, 9 * u);
      g.fillRect(px + 34 * u, py + 20 * u, 14 * u, 9 * u);
      g.fillStyle = '#263238';
      g.fillRect(px + 30 * u, py + 22 * u, 4 * u, 2 * u);
    }
    if (cl.acc === 'headband') {
      g.fillStyle = C.red;
      g.fillRect(px + 10 * u, py + 8 * u, 44 * u, 5 * u);
    }
    if (charId === 'sukh') {
      g.fillStyle = C.fyDk;
      g.fillRect(px + 20 * u, py + 42 * u, 24 * u, 5 * u);
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

    // Dynamic Slice-of-Life Atmosphere Soundtracks
    if (roomId === 'street') {
      Audio8.music('sector67_morning');
    } else if (roomId === 'weights') {
      Audio8.music('weights_floor');
    } else {
      Audio8.music('fitway_groove');
    }
  }

  function canWalkTo(px, py) {
    const footL = px + 2, footR = px + 14;
    const footT = py + 14, footB = py + 21;

    const tl = curRoom.map[Math.floor(footT / TS)]?.[Math.floor(footL / TS)] || 'W';
    const tr = curRoom.map[Math.floor(footT / TS)]?.[Math.floor(footR / TS)] || 'W';
    const bl = curRoom.map[Math.floor(footB / TS)]?.[Math.floor(footL / TS)] || 'W';
    const br = curRoom.map[Math.floor(footB / TS)]?.[Math.floor(footR / TS)] || 'W';

    if (!isWalkable(tl) || !isWalkable(tr) || !isWalkable(bl) || !isWalkable(br)) return false;

    for (const npc of npcs) {
      if (npc.sprite === 'lifter_bench') continue;
      const nx = npc.px, ny = npc.py;
      if (px + 14 > nx + 2 && px + 2 < nx + 14 && py + 21 > ny + 14 && py + 14 < ny + 21) return false;
    }
    return true;
  }

  function checkExits() {
    const col = Math.floor((pl.x + 8) / TS);
    const row = Math.floor((pl.y + 16) / TS);
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

  /* ═══ DIALOGUE & STORY TRIGGER LOGIC ═════════════════════ */
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
    let tx = Math.floor((pl.x + 8) / TS);
    let ty = Math.floor((pl.y + 16) / TS);
    if (pl.dir === 'up') ty--;
    else if (pl.dir === 'down') ty++;
    else if (pl.dir === 'left') tx--;
    else if (pl.dir === 'right') tx++;

    for (const npc of npcs) {
      if (Math.abs(npc.tx - tx) <= 1 && Math.abs(npc.ty - ty) <= 1) {
        npc.dir = pl.dir === 'up' ? 'down' : pl.dir === 'down' ? 'up' : pl.dir === 'left' ? 'right' : 'left';

        if (npc.id === 'sukh_main' || npc.id === 'sukh_weights') {
          if (chapter === 1) startDialogue('ch1_sukh_late');
          else if (chapter === 4) {
            startDialogue('ch4_finale', () => {
              startRepChallenge('OWNER SQUAT TEST', 'SUKH', 15, () => {
                startDialogue('ch4_sitcom_end', () => state = 'credits');
              });
            });
          } else {
            startDialogue('ch1_sukh_late');
          }
          return;
        }

        if (npc.id === 'gagan_main' || npc.id === 'gagan_weights') {
          if (chapter === 1) {
            startDialogue('ch1_gagan_meet', () => {
              startRepChallenge('15 KETTLEBELL SWINGS', 'GAGAN', 15, () => {
                startDialogue('ch1_treadmill_chaos', () => {
                  startChaosMinigame();
                });
              });
            });
          } else if (chapter === 2) {
            startDialogue('ch2_bench_drama');
          }
          return;
        }

        if (npc.id === 'shubham_main') {
          startDialogue('ch2_bench_drama', () => {
            startRepChallenge('20 SPEED BAND PULLS', 'SHUBHAM', 20, () => {
              showUnlock('RESISTANCE BAND', 'BAND BLAST', 'High-velocity conditioning weapon unlocked!');
            });
          });
          return;
        }

        if (npc.id === 'rakesh_main') {
          startDialogue('ch3_competition', () => {
            startRepChallenge('10 EZ-BAR CURLS', 'RAKESH', 10, () => {
              showUnlock('EZ-CURL BAR', 'OLD SCHOOL POWER', 'Veteran form purist strength unlocked!');
            });
          });
          return;
        }
      }
    }
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
      showUnlock('MACHINE OVERRIDE', 'DEBUG & REBOOT', 'Understand gym electronics instead of just lifting.', () => {
        startDialogue('ch1_override_done');
      });
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
  }

  /* ═══ ATMOSPHERIC LIGHTING & PARTICLES ════════════════════ */
  function renderAtmosphere() {
    // Volumetric Sunbeams through top windows
    const grad = g.createLinearGradient(0, 0, 180, H);
    grad.addColorStop(0, C.sunbeamCore);
    grad.addColorStop(0.5, C.sunbeam);
    grad.addColorStop(1, 'rgba(255, 245, 210, 0)');
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(20, 0);
    g.lineTo(120, 0);
    g.lineTo(240, H);
    g.lineTo(60, H);
    g.closePath();
    g.fill();

    // Rotating Ceiling Fan Shadow
    const fanAngle = frame * 0.05;
    g.fillStyle = 'rgba(0,0,0,0.08)';
    g.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = fanAngle + (i * Math.PI / 2);
      g.moveTo(W / 2, H / 2 - 10);
      g.lineTo(W / 2 + Math.cos(a) * 45, H / 2 - 10 + Math.sin(a) * 20);
      g.lineTo(W / 2 + Math.cos(a + 0.2) * 45, H / 2 - 10 + Math.sin(a + 0.2) * 20);
    }
    g.fill();

    // Floating Dust Motes
    motes.forEach(m => {
      m.x += m.vx;
      m.y += m.vy;
      if (m.y < 0) m.y = H;
      if (m.x < 0) m.x = W;
      if (m.x > W) m.x = 0;

      g.fillStyle = `rgba(255, 240, 200, ${m.alpha * 0.6})`;
      g.fillRect(m.x, m.y, m.sz, m.sz);
    });
  }

  /* ═══ SCREEN RENDERERS ═══════════════════════════════════ */
  function renderTitle() {
    titleTimer++;
    g.fillStyle = C.fblk;
    g.fillRect(0, 0, W, H);

    // Subtle background grid
    g.fillStyle = '#141720';
    for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 1);

    g.textAlign = 'center';
    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY PRESENTS', W / 2, 38);

    g.font = '16px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText('IRON RUN', W / 2, 65);

    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.cyan;
    g.fillText('SECTOR 67, MOHALI — 16-BIT GYM RPG', W / 2, 82);

    // Modern Gym Glass Facade Graphic
    g.fillStyle = '#1a1d26';
    g.fillRect(36, 95, 184, 65);
    g.strokeStyle = C.fy;
    g.strokeRect(36, 95, 184, 65);

    g.fillStyle = C.fy;
    g.fillRect(75, 102, 106, 14);
    g.fillStyle = C.fblk;
    g.font = '7px "Press Start 2P", monospace';
    g.fillText('FITWAY GYM', W / 2, 112);

    // Menu Options
    const opts = ['START GAME', 'CHAPTER SELECT', 'CHARACTER SELECT', 'FREE ROAM'];
    opts.forEach((opt, i) => {
      const isSel = i === selectedMenuIndex;
      g.fillStyle = isSel ? C.fy : C.uiMuted;
      g.font = '7px "Press Start 2P", monospace';
      g.fillText((isSel ? '► ' : '  ') + opt, W / 2, 138 + i * 14);
    });

    g.font = '5px "Press Start 2P", monospace';
    g.fillStyle = '#606878';
    g.fillText('USE D-PAD ▲ ▼ • PRESS [A] TO SELECT', W / 2, 212);
    g.textAlign = 'left';
  }

  function renderChapterSelectScreen() {
    g.fillStyle = C.fblk;
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY — CHAPTER SELECT', W / 2, 22);

    CHAPTERS.forEach((ch, i) => {
      const isSel = i === chapterSelectIndex;
      const y = 45 + i * 40;

      g.fillStyle = isSel ? C.uiGlass : '#12141c';
      g.fillRect(16, y, W - 32, 34);
      g.strokeStyle = isSel ? C.fy : '#282c38';
      g.strokeRect(16, y, W - 32, 34);

      g.textAlign = 'left';
      g.font = '7px "Press Start 2P", monospace';
      g.fillStyle = isSel ? C.fy : C.white;
      g.fillText((isSel ? '► ' : '  ') + `CH ${ch.num}: ${ch.title}`, 24, y + 13);

      g.font = '5px "Press Start 2P", monospace';
      g.fillStyle = C.uiMuted;
      g.fillText(ch.desc, 30, y + 25);
    });

    g.textAlign = 'center';
    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('▲ ▼ CHOOSE CHAPTER • [A] PLAY', W / 2, 212);
    g.textAlign = 'left';
  }

  function renderCharSelect() {
    g.fillStyle = '#0a0c10';
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY — CHOOSE YOUR MEMBER', W / 2, 14);

    drawPortrait(selChar.id, 12, 24, 60);

    const ix = 80;
    g.textAlign = 'left';
    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = C.uiText;
    g.fillText(selChar.name, ix, 32);

    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(selChar.title, ix, 42);

    g.fillStyle = C.uiMuted;
    g.font = '5px "Press Start 2P", monospace';
    selChar.quote.split('\n').forEach((ql, i) => g.fillText(ql, ix, 54 + i * 8));

    STAT_NAMES.forEach((sn, i) => {
      const sx = (i < 3) ? ix : ix + 80;
      const syi = 78 + (i % 3) * 10;
      g.fillStyle = '#808890';
      g.font = '6px "Press Start 2P", monospace';
      g.fillText(sn, sx, syi);
      for (let p = 0; p < 5; p++) {
        g.fillStyle = p < selChar.stats[i] ? C.fy : '#2a2a3a';
        g.fillRect(sx + 28 + p * 7, syi - 5, 5, 5);
      }
    });

    g.fillStyle = C.white;
    g.font = '6px "Press Start 2P", monospace';
    g.fillText('WEAPON: ' + selChar.weapon, ix, 114);
    g.fillStyle = '#00e676';
    g.fillText('SPECIAL: ' + selChar.special, ix, 124);

    // Roster Row
    const rosterY = 142, boxSize = 28, gap = 8;
    const totalW = CHARS.length * boxSize + (CHARS.length - 1) * gap;
    const startX = (W - totalW) / 2;

    CHARS.forEach((ch, i) => {
      const bx = startX + i * (boxSize + gap);
      const selected = i === charIdx;
      if (selected) {
        g.fillStyle = C.fy;
        g.fillRect(bx - 2, rosterY - 2, boxSize + 4, boxSize + 4);
      }
      drawPortrait(ch.id, bx, rosterY, boxSize);
      g.fillStyle = selected ? C.fy : '#606070';
      g.font = '5px "Press Start 2P", monospace';
      g.textAlign = 'center';
      g.fillText(ch.name, bx + boxSize / 2, rosterY + boxSize + 8);
      g.textAlign = 'left';
    });

    g.textAlign = 'center';
    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = C.uiText;
    g.fillText('◄ D-PAD ►     [A] SELECT', W / 2, 202);
    g.textAlign = 'left';
  }

  function renderHUD() {
    if (state !== 'explore' || dlg.active) return;

    // Glassmorphic Top-Left Gauges
    g.fillStyle = 'rgba(15,17,23,0.85)';
    g.fillRect(3, 3, 84, 26);
    g.strokeStyle = '#3a3f50';
    g.strokeRect(3, 3, 84, 26);

    // Health Gauge
    g.fillStyle = '#f03a3a';
    g.fillRect(6, 6, 46, 5);
    g.fillStyle = C.white;
    g.font = '5px "Press Start 2P", monospace';
    g.fillText('HP 100', 56, 11);

    // Energy Gauge
    g.fillStyle = '#00b0ff';
    g.fillRect(6, 13, 38, 5);
    g.fillText('EN 85', 56, 18);

    // Stamina Gauge
    g.fillStyle = '#00e676';
    g.fillRect(6, 20, 46, 5);
    g.fillText('ST 100', 56, 25);

    // Top-Right Sector 67 Clock
    g.fillStyle = 'rgba(15,17,23,0.85)';
    g.fillRect(W - 88, 3, 85, 26);
    g.strokeStyle = '#3a3f50';
    g.strokeRect(W - 88, 3, 85, 26);

    g.fillStyle = C.fy;
    g.font = '5px "Press Start 2P", monospace';
    g.fillText(`CH ${chapter}: ${CHAPTERS[chapter - 1]?.title.slice(0, 8)}`, W - 85, 11);
    g.fillStyle = C.uiMuted;
    g.fillText('Mon. 1  10:30am', W - 85, 18);
    g.fillText('Sector 67, Mohali', W - 85, 25);

    // Floating Interaction Prompt
    g.fillStyle = 'rgba(15,17,23,0.85)';
    g.fillRect(20, H - 18, W - 40, 16);
    g.strokeStyle = C.fy;
    g.strokeRect(20, H - 18, W - 40, 16);
    g.fillStyle = C.fy;
    g.font = '5px "Press Start 2P", monospace';
    g.textAlign = 'center';
    g.fillText(`[A] TALK / ACTION  •  [B] SPRINT  •  ⚡ OVERRIDE READY`, W / 2, H - 7);
    g.textAlign = 'left';
  }

  function renderDialogue() {
    if (!dlg.active || dlg.idx >= dlg.lines.length) return;
    const line = dlg.lines[dlg.idx];

    g.fillStyle = C.uiGlass;
    g.fillRect(0, H - 56, W, 56);
    g.fillStyle = C.uiBorder;
    g.fillRect(0, H - 56, W, 2);
    g.fillRect(0, H - 2, W, 2);

    const speakerChar = CHARS.find(ch => ch.name === line.s);
    if (speakerChar) {
      drawPortrait(speakerChar.id, 4, H - 52, 34);
    } else {
      g.fillStyle = C.fblk2;
      g.fillRect(4, H - 52, 34, 34);
      g.strokeStyle = C.metalDk;
      g.strokeRect(4, H - 52, 34, 34);
    }

    if (line.s) {
      g.fillStyle = C.fy;
      g.font = '7px "Press Start 2P", monospace';
      g.fillText(line.s, 44, H - 43);
    }

    g.fillStyle = C.uiText;
    g.font = '6px "Press Start 2P", monospace';
    const visibleText = line.t.substring(0, dlg.charPos);
    visibleText.split('\n').forEach((tl, i) => g.fillText(tl, 44, H - 31 + i * 11));

    if (dlg.charPos >= line.t.length && Math.floor(frame / 16) % 2 === 0) {
      g.fillStyle = C.fy;
      g.fillText('▼', W - 14, H - 8);
    }
  }

  function renderChallenge() {
    g.fillStyle = 'rgba(0,0,0,0.85)';
    g.fillRect(0, 0, W, H);

    g.fillStyle = C.uiGlass;
    g.fillRect(20, 25, W - 40, 170);
    g.strokeStyle = C.uiBorder;
    g.strokeRect(20, 25, W - 40, 170);

    g.textAlign = 'center';
    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(chl.title, W / 2, 45);

    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText(chl.name, W / 2, 65);
    g.fillStyle = C.uiMuted;
    g.fillText(`COACH: ${chl.trainer}`, W / 2, 78);

    const pad = n => String(n).padStart(2, '0');
    g.font = '22px "Press Start 2P", monospace';
    g.fillStyle = '#00e676';
    g.fillText(`${pad(chl.current)} / ${pad(chl.target)}`, W / 2, 120);

    g.fillStyle = C.metalDk;
    g.fillRect(40, 140, W - 80, 8);
    g.fillStyle = C.fy;
    g.fillRect(40, 140, (W - 80) * (chl.current / chl.target), 8);

    if (Math.floor(frame / 14) % 2 === 0) {
      g.font = '8px "Press Start 2P", monospace';
      g.fillStyle = C.fy;
      g.fillText('TAP [A] TO REP!', W / 2, 175);
    }
    g.textAlign = 'left';
  }

  function renderChaosMinigame() {
    g.fillStyle = 'rgba(0,0,0,0.88)';
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = '#f03a3a';
    g.fillText('CARDIO EMERGENCY OVERLOAD!', W / 2, 40);

    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText('SHUT DOWN MALFUNCTIONING TREADMILLS', W / 2, 58);

    g.font = '18px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(`REBOOTED: ${minigame.score} / ${minigame.total}`, W / 2, 110);

    if (Math.floor(frame / 12) % 2 === 0) {
      g.font = '8px "Press Start 2P", monospace';
      g.fillStyle = '#00e676';
      g.fillText('TAP [A] TO OVERRIDE', W / 2, 160);
    }
    g.textAlign = 'left';
  }

  function renderUnlock() {
    unlockAnim.timer++;
    g.fillStyle = 'rgba(0,0,0,0.92)';
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('EQUIPMENT UNLOCKED!', W / 2, 45);

    g.fillStyle = C.uiGlass;
    g.fillRect(30, 60, W - 60, 95);
    g.strokeStyle = C.fy;
    g.strokeRect(30, 60, W - 60, 95);

    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText(unlockAnim.title, W / 2, 85);

    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = '#00e676';
    g.fillText(unlockAnim.name, W / 2, 105);

    g.font = '5px "Press Start 2P", monospace';
    g.fillStyle = C.uiMuted;
    g.fillText(unlockAnim.desc, W / 2, 128);

    if (unlockAnim.timer > 30 && Math.floor(frame / 16) % 2 === 0) {
      g.font = '7px "Press Start 2P", monospace';
      g.fillStyle = C.white;
      g.fillText('PRESS [A] TO CONTINUE', W / 2, 185);
    }
    g.textAlign = 'left';
  }

  function renderCredits() {
    g.fillStyle = C.fblk;
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY: THE END', W / 2, 35);

    const yOff = 65;
    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('SUKH — OWNER / FOUNDER', W / 2, yOff);
    g.fillStyle = C.white;
    g.fillText('GAGAN — TECHNIQUE POLICE', W / 2, yOff + 16);
    g.fillStyle = C.fy;
    g.fillText('SHUBHAM — SPEED & CARDIO DEMON', W / 2, yOff + 32);
    g.fillStyle = C.white;
    g.fillText('RAKESH — VETERAN FORM PURIST', W / 2, yOff + 48);
    g.fillStyle = '#00e676';
    g.fillText('HERMAN — SOFTWARE / HARDWARE / IT', W / 2, yOff + 64);

    g.fillStyle = C.fy;
    g.font = '8px "Press Start 2P", monospace';
    g.fillText('“KAL PHIR AA JAANA.”', W / 2, 175);

    g.fillStyle = C.white;
    g.font = '6px "Press Start 2P", monospace';
    g.fillText('PRESS [A] FOR FREE ROAM GYM', W / 2, 205);
    g.textAlign = 'left';
  }

  /* ═══ MAIN UPDATE LOOP ═══════════════════════════════════ */
  function update() {
    frame++;
    updateFade();

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
            chapter = 1;
            state = 'char_select';
          } else if (selectedMenuIndex === 1) {
            state = 'chapter_select';
          } else if (selectedMenuIndex === 2) {
            state = 'char_select';
          } else if (selectedMenuIndex === 3) {
            chapter = 4;
            state = 'explore';
            loadRoom('main_gym');
          }
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
          chapter = CHAPTERS[chapterSelectIndex].num;
          state = 'char_select';
          Audio8.sfx('cartridge');
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
          state = 'explore';
          loadRoom('main_gym');
          Audio8.sfx('cartridge');
          Audio8.music('fitway_groove');
        }
        break;

      case 'explore':
        pl.moving = false;
        let nx = pl.x, ny = pl.y;
        const spd = held.b ? pl.spd * 1.5 : pl.spd;

        if (held.up) { ny -= spd; pl.dir = 'up'; pl.moving = true; }
        if (held.down) { ny += spd; pl.dir = 'down'; pl.moving = true; }
        if (held.left) { nx -= spd; pl.dir = 'left'; pl.moving = true; }
        if (held.right) { nx += spd; pl.dir = 'right'; pl.moving = true; }

        if (canWalkTo(nx, pl.y)) pl.x = nx;
        if (canWalkTo(pl.x, ny)) pl.y = ny;

        pl.x = Math.max(0, Math.min(W - TS, pl.x));
        pl.y = Math.max(0, Math.min(H - 22, pl.y));

        if (pl.moving) {
          pl.walkT++;
          if (pl.walkT % 6 === 0) pl.walkFrame = (pl.walkFrame || 0) + 1;
          if (pl.walkFrame > 3) pl.walkFrame = 0;
        } else {
          pl.walkFrame = 0;
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
          Audio8.sfx('blip');
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

    switch (state) {
      case 'title':
        renderTitle();
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
            draw: () => drawSprite(npc.sprite || npc.charId || 'member_m', npc.px, npc.py, npc.dir, npc.walkFrame || 0, npc.exercising)
          });
        });

        entities.push({
          y: pl.y,
          draw: () => drawSprite(selChar.id, pl.x, pl.y, pl.dir, pl.walkFrame || 0, false)
        });

        entities.sort((a, b) => a.y - b.y);
        entities.forEach(e => e.draw());

        // Dynamic Lighting & Sunbeams Layer
        renderAtmosphere();

        // High-Tech HUD Layer
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
