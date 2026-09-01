/* ============================================================
   FITWAY: IRON RUN — Chapter 1 to 4 Complete Sitcom Adventure
   Sector 67, Mohali • 16-Bit Top-Down Gym RPG & Arcade Hub
   ============================================================
   NOT a platformer. NOT Mario.
   Features:
   - Full 4-Chapter Story ("Just Come To The Gym" to "The Weights Floor")
   - Street Fighter-style Character Select & Roster (5 Heroes)
   - Pokémon-style dense, interconnected gym exploration
   - Sector 67 Mohali Street, Reception, Hallway, Cardio, Functional, Weights Floor
   - Machine Override ability, Equipment Unlocks, Minigames, Boss Challenge
   - Sitcom ensemble banter, End Credits, Free Roam mode
   ============================================================ */

window.FitwayGame = (() => {
  'use strict';
  const W = 256, H = 224, TS = 16, COLS = 16, ROWS = 14;
  let g = null, frame = 0;

  /* ═══ PALETTE ════════════════════════════════════════════ */
  const C = {
    wood: '#c89868', woodDk: '#a87848', woodLt: '#d8a878', woodLine: '#b08050',
    rubber: '#2d303a', rubberLt: '#3d404e', rubberDk: '#1f2128',
    matGreen: '#2e7d32', matBlue: '#1565c0', matRed: '#c62828',
    wall: '#f0e8dc', wallDk: '#d8cbbe', baseboard: '#5c4028', wallTop: '#8c7b6c',
    fy: '#ffd000', fyDk: '#c8a000', fyLt: '#ffe566', fblk: '#141414',
    metal: '#889098', metalDk: '#586068', metalLt: '#b8c0c8',
    mirror: '#b8d8f0', mirrorLt: '#d8ecfc', mirrorHi: '#f0f8ff',
    glass: '#a0cce8',
    brick: '#a85038', brickDk: '#803828',
    red: '#e53935', green: '#43a047', blue: '#1e88e5', purple: '#8e24aa', orange: '#fb8c00',
    skin1: '#f8d0b0', skin2: '#e0b080', skin3: '#c89060', skin4: '#a06840',
    uiBg: '#120e24', uiBg2: '#1e1838', uiBorder: '#ffd000', uiText: '#f5f5f5',
    uiDark: '#080610', uiMuted: '#9e9eb0',
    hpBar: '#e53935', stBar: '#1e88e5', xpBar: '#ffd000',
    black: '#000000', white: '#ffffff', shadow: 'rgba(0,0,0,0.25)',
    streetGray: '#484c54', streetDk: '#32363e', curb: '#8a909a', grass: '#4a7c38'
  };

  /* ═══ CHARACTERS ═════════════════════════════════════════ */
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
      col: { hair: '#2a1a10', skin: '#f8d0b0', shirt: '#546e7a', shirtDk: '#37474f', pants: '#263238', shoes: '#1a1a1a', acc: 'glasses' },
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
      col: { hair: '#141414', skin: '#e0b080', shirt: '#ffd000', shirtDk: '#c8a000', pants: '#1a1a1a', shoes: '#212121', acc: 'whistle' },
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
      col: { hair: '#141414', skin: '#c89060', shirt: '#1a1a1a', shirtDk: '#0a0a0a', pants: '#37474f', shoes: '#1a1a1a', acc: 'headband' },
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
      col: { hair: '#141414', skin: '#e0b080', shirt: '#1e88e5', shirtDk: '#1565c0', pants: '#263238', shoes: '#0d47a1', acc: 'band' },
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
      col: { hair: '#757575', skin: '#c89060', shirt: '#43a047', shirtDk: '#2e7d32', pants: '#2e7d32', shoes: '#3e2723', acc: 'stripe' },
      build: 'stocky'
    }
  ];
  const STAT_NAMES = ['POW', 'SPD', 'DEF', 'TEC', 'RNG'];

  /* ═══ GAME STATE ═════════════════════════════════════════ */
  let state = 'title'; // title | char_select | chapter_select | explore | dialogue | challenge | chaos_minigame | team_challenge | unlock | chapter_end | credits | free_roam_prompt
  let chapter = 1;
  let charIdx = 0, selChar = CHARS[0];
  let titleTimer = 0;
  let mode = 'story'; // 'story' | 'free_roam'

  // Player
  let pl = {
    x: 0, y: 0, dir: 'down', moving: false,
    walkT: 0, walkFrame: 0, spd: 1.8,
    interactCooldown: 0,
    dust: []
  };

  // Current Room
  let curRoom = null, curRoomId = null;
  let roomBgCanvas = null;

  // Unlocks & Inventory
  let unlocks = {
    machineOverride: false,
    resistanceBand: false,
    ezCurlBar: false,
    olympicBarbell: false,
    dualDumbbells: true
  };

  // Progression Flags
  let storyProgress = {
    ch1_talkedSukh: false,
    ch1_talkedGagan: false,
    ch1_gaganChallengeDone: false,
    ch1_machineExamined: false,
    ch1_chaosCleared: false,
    ch1_stairsChecked: false,
    ch1_sukhReported: false,

    ch2_morningSukh: false,
    ch2_gaganBench: false,
    ch2_benchResolved: false,
    ch2_shubhamMet: false,
    ch2_shubhamChallengeDone: false,
    ch2_groupBanterDone: false,

    ch3_gossipHeard: false,
    ch3_rakeshMet: false,
    ch3_competitionDone: false,
    ch3_glitchInvestigated: false,
    ch3_gaganTalkDone: false,
    ch3_stairsUnlocked: false,

    ch4_weightsEntered: false,
    ch4_blackoutSurge: false,
    ch4_terminalHacked: false,
    ch4_sukhConfronted: false,
    ch4_teamChallengeDone: false,
    ch4_sukhBossDone: false,
    ch4_sitcomEndingDone: false,
  };

  // Dialogue Engine
  let dlg = {
    active: false,
    lines: [],
    idx: 0,
    charPos: 0,
    timer: 0,
    speaker: '',
    portrait: null,
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
    meter: 0,
    sweetSpot: [40, 70],
    tempoDir: 1,
    onDone: null
  };

  // Chaos Mini-game (Chapter 1 treadmill overload / Chapter 4 terminal reboot)
  let minigame = {
    active: false,
    type: 'chaos', // 'chaos' | 'team' | 'terminal'
    timer: 0,
    targets: [],
    score: 0,
    total: 4,
    onDone: null
  };

  // Unlock Display
  let unlockAnim = {
    active: false,
    timer: 0,
    title: '',
    name: '',
    desc: '',
    icon: '⚡',
    onDone: null
  };

  // Chapter Transition Card
  let chCard = {
    active: false,
    title: '',
    subtitle: '',
    quote: '',
    timer: 0,
    onDone: null
  };

  // Fade
  let fade = { alpha: 0, dir: 0, cb: null };

  // Room NPCs & Interactive Objects
  let npcs = [];
  let objects = [];
  let particles = [];

  /* ═══ TILE DEFINITIONS & MAPS ═════════════════════════════ */
  // Tile key:
  // . = wood floor, , = rubber floor, g = grass, s = street/pavement, c = curb
  // W = wall, M = mirror wall, P = poster wall, V = TV wall, C = clock, H = window
  // F = Fitway sign, D = desk, L = locker, p = plant, w = water cooler, n = bench
  // T = treadmill, B = bike, k = kettlebell, q = squat rack, b = barbell bench
  // d = dumbbell rack, m = exercise mat, X = locked door, S = stairs, E = elevator
  // O = interactive terminal/machine override, > < ^ v = room exits
  const WALKABLE = '._, mgs><^vEO';
  function isWalkable(ch) { return WALKABLE.includes(ch); }

  const ROOMS = {
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
        { row: 4, col1: 6, col2: 9, room: 'reception', sx: 7, sy: 12 }
      ],
      npcs: [
        { id: 'street_passer', tx: 3, ty: 12, dir: 'right', sprite: 'member_m', name: 'MOHALI RESIDENT', text: 'Sector 67 is peaceful today. Best time to hit Fitway.' }
      ]
    },
    reception: {
      name: 'FITWAY RECEPTION — GROUND FLOOR',
      map: [
        'WPdFFFFFFdPWWCMW',
        'W..............W',
        'W.DD.........p.W',
        'W.DD.........p.M',
        'W..............M',
        'W..............W',
        'W..........LL..W',
        'W..........LL.>.',
        'W.............>.',
        'W..............W',
        'W......nn....w.W',
        'W..............W',
        'W..............W',
        'WWWWWW..WWWWWWWW'
      ],
      spawn: { x: 7 * TS, y: 12 * TS },
      exits: [
        { chars: '>', room: 'hallway', sx: 1, sy: 6 },
        { row: 13, col1: 6, col2: 7, room: 'street', sx: 7, sy: 5 }
      ],
      npcs: [
        { id: 'sukh_reception', charId: 'sukh', tx: 4, ty: 3, dir: 'down', isStory: true, name: 'SUKH' },
        { id: 'member_kiosk', tx: 10, ty: 5, dir: 'left', sprite: 'member_f', name: 'REGULAR MEMBER', text: 'Checked in on the Fitway app! Ready for cardio.' }
      ]
    },
    hallway: {
      name: 'HALLWAY & STAIRWELL',
      map: [
        'WWPWWWWWWWPWWWWW',
        '<..............W',
        '<..............W',
        'W..............W',
        'W.....WWWW.....W',
        'W.....SSSS.....W',
        'W.....XXXX.....W',
        'W..............W',
        'W..........w...W',
        'W..p...........W',
        'W.............>.',
        'W.............>.',
        'W..............W',
        'WWWWWWWWWWWWWWWW'
      ],
      spawn: { x: 1 * TS, y: 6 * TS },
      exits: [
        { chars: '<', room: 'reception', sx: 13, sy: 7 },
        { chars: '>', room: 'cardio', sx: 1, sy: 6 },
        { chars: 'S', room: 'weights', sx: 7, sy: 12, condition: 'stairsUnlocked' }
      ],
      npcs: [
        { id: 'hallway_talker', tx: 3, ty: 9, dir: 'right', sprite: 'member_m', name: 'FITWAY REGULAR', text: 'Upstairs is the weights floor. Sukh keeps it locked for serious lifters.' }
      ]
    },
    cardio: {
      name: 'CARDIO & CONDITIONING FLOOR',
      map: [
        'WMMVVWWWWWMMMMMW',
        'W..............W',
        'W.TT.TT.TT....W',
        'W.TT.TT.TT....W',
        'W..............W',
        'W..BB..BB....d.W',
        'W..BB..BB....d.W',
        'W..............W',
        'W..............W',
        'W..........kk..W',
        'W..........kk..>',
        'W..............>',
        '<..............W',
        'WWWWWWWWWWWWWWWW'
      ],
      spawn: { x: 1 * TS, y: 6 * TS },
      exits: [
        { chars: '<', room: 'hallway', sx: 13, sy: 10 },
        { chars: '>', room: 'functional', sx: 1, sy: 6 }
      ],
      npcs: [
        { id: 'gagan_cardio', charId: 'gagan', tx: 9, ty: 8, dir: 'down', isStory: true, name: 'GAGAN' },
        { id: 'treadmill_runner1', tx: 2, ty: 2, dir: 'down', sprite: 'member_m', exercising: true, name: 'CARDIO RUNNER' },
        { id: 'treadmill_runner2', tx: 5, ty: 2, dir: 'down', sprite: 'member_f', exercising: true, name: 'RUNNER SIMRAN' },
        { id: 'bike_rider', tx: 3, ty: 5, dir: 'up', sprite: 'member_m', exercising: true, name: 'SPIN MEMBER' }
      ]
    },
    functional: {
      name: 'FUNCTIONAL TRAINING & AGILITY ZONE',
      map: [
        'WMMWWWWWWWWWWWMM',
        'W..............W',
        'W.mmmm.mmmm....W',
        'W.mmmm.mmmm....W',
        'W..............W',
        'W.kk....kk...d.W',
        'W.kk....kk...d.W',
        'W..............W',
        'W..nn..nn..cc..W',
        'W..nn..nn..cc..W',
        'W..............W',
        '<..............W',
        '<..............W',
        'WWWWWWWWWWWWWWWW'
      ],
      spawn: { x: 1 * TS, y: 6 * TS },
      exits: [
        { chars: '<', room: 'cardio', sx: 13, sy: 10 }
      ],
      npcs: [
        { id: 'shubham_func', charId: 'shubham', tx: 6, ty: 4, dir: 'down', isStory: true, name: 'SHUBHAM' },
        { id: 'rakesh_func', charId: 'rakesh', tx: 11, ty: 8, dir: 'left', isStory: true, name: 'RAKESH' }
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
        'W..............W',
        'W.....SSSS.....W',
        'WWWWWWWWWWWWWWWW'
      ],
      spawn: { x: 7 * TS, y: 11 * TS },
      exits: [
        { chars: 'S', room: 'hallway', sx: 7, sy: 7 }
      ],
      npcs: [
        { id: 'sukh_weights', charId: 'sukh', tx: 7, ty: 4, dir: 'down', isStory: true, name: 'SUKH' },
        { id: 'gagan_weights', charId: 'gagan', tx: 3, ty: 7, dir: 'right', isStory: true, name: 'GAGAN' },
        { id: 'shubham_weights', charId: 'shubham', tx: 11, ty: 7, dir: 'left', isStory: true, name: 'SHUBHAM' },
        { id: 'rakesh_weights', charId: 'rakesh', tx: 12, ty: 3, dir: 'left', isStory: true, name: 'RAKESH' }
      ]
    }
  };

  /* ═══ COMPREHENSIVE STORY SCRIPTS (CHAPTERS 1-4) ═════════ */
  const DIALOGUES = {
    // ── CHAPTER 1 ──
    ch1_street_intro: [
      { s: 'HERMAN', t: 'Sector 67, Mohali.\nAnother regular morning at Fitway.' },
      { s: 'HERMAN', t: "Just here for a workout.\nNothing complicated." }
    ],
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
      { s: 'SUKH', t: 'Go ask him.' },
      { s: 'HERMAN', t: "You're literally telling me to\ngo find out why someone is looking for me." },
      { s: 'SUKH', t: 'Yes.' }
    ],
    ch1_npc_bhai: [
      { s: 'GYM BRO', t: "Bhai, you're using this?" },
      { s: 'HERMAN', t: 'No.' },
      { s: 'GYM BRO', t: 'Okay.' }
    ],
    ch1_npc_unplugged: [
      { s: 'MEMBER', t: 'Ye chal nahi raha.' },
      { s: 'HERMAN', t: 'Plugged in?' },
      { s: 'MEMBER', t: 'Pata nahi.' },
      { s: 'HERMAN', t: "It's unplugged." },
      { s: 'HERMAN', t: 'Interesting.' }
    ],
    ch1_gagan_meet: [
      { s: 'GAGAN', t: 'Back straight... Not like that.' },
      { s: 'GAGAN', t: 'There you are.' },
      { s: 'HERMAN', t: 'You were looking for me?' },
      { s: 'GAGAN', t: 'Yes.' },
      { s: 'HERMAN', t: 'Why?' },
      { s: 'GAGAN', t: "You haven't trained." },
      { s: 'HERMAN', t: 'I just came in.' },
      { s: 'GAGAN', t: 'Exactly.' },
      { s: 'HERMAN', t: 'Give me five minutes.' },
      { s: 'GAGAN', t: 'You said that yesterday.' },
      { s: 'HERMAN', t: 'Yesterday was different.' },
      { s: 'GAGAN', t: 'How?' },
      { s: 'HERMAN', t: "I don't remember." },
      { s: 'GAGAN', t: "Come on. 15 Kettlebell Swings.\nLet's see your form." }
    ],
    ch1_gagan_advice: [
      { s: 'GAGAN', t: "Don't rush." },
      { s: 'GAGAN', t: "I literally just said don't rush." },
      { s: 'HERMAN', t: 'I was testing it.' },
      { s: 'GAGAN', t: 'Sure.' }
    ],
    ch1_gagan_pass: [
      { s: 'GAGAN', t: 'Better.' },
      { s: 'HERMAN', t: "That's it?" },
      { s: 'GAGAN', t: 'What do you want?' },
      { s: 'HERMAN', t: 'Something dramatic.' },
      { s: 'GAGAN', t: "It's a gym." }
    ],
    ch1_treadmill_beep: [
      { s: null, t: 'BEEP. BEEP. BEEP.' },
      { s: 'SUKH', t: 'What happened?' },
      { s: 'GAGAN', t: "It's doing that again." },
      { s: 'SUKH', t: 'Again?' },
      { s: 'GAGAN', t: 'Again.' },
      { s: 'HERMAN', t: 'No.' },
      { s: 'SUKH', t: "I didn't say anything." },
      { s: 'HERMAN', t: 'You looked at me.' },
      { s: 'SUKH', t: 'You know computers.' },
      { s: 'HERMAN', t: "It's a treadmill." },
      { s: 'SUKH', t: 'Computer inside.' },
      { s: 'HERMAN', t: "That doesn't mean—" },
      { s: 'SUKH', t: 'Fix it.' }
    ],
    ch1_investigate: [
      { s: 'HERMAN', t: 'Speed is set to 45 km/h.\nWho did this?' },
      { s: 'GAGAN', t: 'Not me.' },
      { s: 'SUKH', t: 'You sure?' },
      { s: 'GAGAN', t: 'Yes.' },
      { s: 'MEMBER', t: 'I thought it was funny...' },
      { s: 'HERMAN', t: 'It was plugged into the network.' },
      { s: 'MEMBER', t: 'Oh.' },
      { s: 'HERMAN', t: 'Yeah.' }
    ],
    ch1_chaos_start: [
      { s: null, t: 'WHIRRRR! CLACK-CLACK-CLACK!' },
      { s: 'GAGAN', t: 'What did you do?!' },
      { s: 'HERMAN', t: 'Nothing!' },
      { s: 'SUKH', t: 'Herman.' },
      { s: 'HERMAN', t: 'I said nothing!' },
      { s: null, t: 'SHUT DOWN THE OVERHEATED TREADMILLS!' }
    ],
    ch1_chaos_done: [
      { s: 'HERMAN', t: 'Fixed.' },
      { s: 'SUKH', t: "Next time don't fix it like that." },
      { s: 'HERMAN', t: 'Okay.' }
    ],
    ch1_stairs_locked: [
      { s: 'HERMAN', t: "What's upstairs?" },
      { s: 'GAGAN', t: 'Other areas.' },
      { s: 'HERMAN', t: "Why can't I go?" },
      { s: 'GAGAN', t: 'Not yet.' },
      { s: 'HERMAN', t: 'Why?' },
      { s: 'GAGAN', t: "You're not ready." },
      { s: 'HERMAN', t: 'For stairs?' },
      { s: 'GAGAN', t: "For what's upstairs." }
    ],
    ch1_sukh_end: [
      { s: 'HERMAN', t: 'What is upstairs?' },
      { s: 'SUKH', t: 'Gym.' },
      { s: 'HERMAN', t: "I know it's a gym. Why can't I go?" },
      { s: 'SUKH', t: "Because you haven't finished downstairs." },
      { s: 'HERMAN', t: 'Finished what?' },
      { s: 'SUKH', t: "You'll know." }
    ],

    // ── CHAPTER 2 ──
    ch2_intro: [
      { s: 'SUKH', t: 'Morning.' },
      { s: 'HERMAN', t: 'Morning. Everything working?' },
      { s: 'SUKH', t: 'Why?' },
      { s: 'HERMAN', t: 'Just asking.' },
      { s: 'SUKH', t: "Don't touch anything." },
      { s: 'HERMAN', t: "I wasn't going to." },
      { s: 'SUKH', t: 'Good.' }
    ],
    ch2_gagan_bench_rant: [
      { s: 'HERMAN', t: 'What happened? You look angry.' },
      { s: 'GAGAN', t: "Someone has been using my bench." },
      { s: 'HERMAN', t: 'Your bench? Does it have your name on it?' },
      { s: 'GAGAN', t: '...No.' },
      { s: 'HERMAN', t: "Then it's not your bench." },
      { s: 'GAGAN', t: 'Do you want the challenge or not?' }
    ],
    ch2_bench_resolve: [
      { s: 'MEMBER', t: 'Bro, I have 3 sets left.' },
      { s: 'HERMAN', t: 'Gagan, alternate sets. Easy.' },
      { s: 'GAGAN', t: "You're getting better at dealing with people." },
      { s: 'HERMAN', t: "I don't think that's a compliment." }
    ],
    ch2_meet_shubham: [
      { s: 'SHUBHAM', t: 'You must be Herman. The IT guy.' },
      { s: 'HERMAN', t: 'Software engineer.' },
      { s: 'SHUBHAM', t: 'Same thing. You rely on tech too much.' },
      { s: 'SHUBHAM', t: 'No Machine Override here. Pure speed and band pulls!' },
      { s: 'HERMAN', t: "Let's get this over with." }
    ],
    ch2_group_banter: [
      { s: 'SHUBHAM', t: 'Not bad! You actually have cardio.' },
      { s: 'GAGAN', t: 'He still almost broke the treadmills yesterday.' },
      { s: 'HERMAN', t: 'I RESET IT.' },
      { s: 'SUKH', t: 'The entire gym shook, Herman.' },
      { s: 'SHUBHAM', t: 'Wait, what happened yesterday?' },
      { s: 'HERMAN', t: 'Nothing. Absolutely nothing.' }
    ],
    ch2_recurring_gag: [
      { s: null, t: 'BEEP.' },
      { s: 'GAGAN', t: 'Herman?' },
      { s: 'HERMAN', t: 'Not me.' }
    ],
    ch2_end: [
      { s: 'SUKH', t: 'Reception.' },
      { s: 'HERMAN', t: 'What?' },
      { s: 'SUKH', t: "Someone's asking for you." },
      { s: 'HERMAN', t: 'Who?' },
      { s: 'SUKH', t: 'Go find out.' }
    ],

    // ── CHAPTER 3 ──
    ch3_gossip: [
      { s: 'MEMBER', t: 'Heard you hacked the entire gym.' },
      { s: 'HERMAN', t: 'I reset a treadmill.' },
      { s: 'SUKH', t: 'Same thing.' },
      { s: 'HERMAN', t: 'News travels fast in Sector 67.' }
    ],
    ch3_meet_rakesh: [
      { s: 'RAKESH', t: 'So you are Herman. Special treatment from Sukh, huh?' },
      { s: 'HERMAN', t: "I don't get special treatment. I get blamed." },
      { s: 'RAKESH', t: 'Old-school form beats fancy tech every time.' },
      { s: 'RAKESH', t: 'Fitway Competition! Let us see your real power.' }
    ],
    ch3_spectators: [
      { s: 'GAGAN', t: 'Elbows tucked! Keep the tempo!' },
      { s: 'SUKH', t: 'Five points to Herman for not breaking equipment.' },
      { s: 'SHUBHAM', t: 'Go faster!' }
    ],
    ch3_glitch_investigate: [
      { s: null, t: 'SPARK! ERR-404: NETWORK LOOP.' },
      { s: 'HERMAN', t: 'Wait... this error wasn\'t a member.' },
      { s: 'HERMAN', t: 'The machines are all talking to a legacy central server.' },
      { s: 'SUKH', t: '...' },
      { s: 'HERMAN', t: 'You knew about this?' },
      { s: 'SUKH', t: "It's a gym." }
    ],
    ch3_gagan_warm: [
      { s: 'GAGAN', t: "You're thinking too much." },
      { s: 'HERMAN', t: "That's literally what I do." },
      { s: 'GAGAN', t: "Fitway has always been like this. Different people, different styles.\nIn the end, everyone helps each other." }
    ],
    ch3_stairs_reveal: [
      { s: 'HERMAN', t: 'The door to Floor 2... it\'s unlocked.' },
      { s: 'GAGAN', t: 'Ask Sukh.' },
      { s: 'SUKH', t: 'Finish what you started. Come tomorrow.' }
    ],

    // ── CHAPTER 4 ──
    ch4_intro: [
      { s: 'HERMAN', t: 'Why is everyone standing at the stairs?' },
      { s: 'GAGAN', t: 'Nothing.' },
      { s: 'SUKH', t: 'Go upstairs.' },
      { s: 'HERMAN', t: "That's it?" },
      { s: 'SUKH', t: "That's it." }
    ],
    ch4_weights_awe: [
      { s: 'HERMAN', t: 'Floor 2... The Weights Floor.\nThis place is massive.' },
      { s: 'GAGAN', t: 'First you train. Everything you learned.' }
    ],
    ch4_blackout: [
      { s: null, t: 'CRACKLE! LIGHTS FLICKER! ALARMS PULSE!' },
      { s: 'HERMAN', t: 'The whole building is overloading!' },
      { s: 'HERMAN', t: 'The legacy controller at the main terminal!' }
    ],
    ch4_sukh_truth: [
      { s: 'HERMAN', t: 'You knew the system was patched together!' },
      { s: 'SUKH', t: 'Fitway became too complicated. Over years of growth.' },
      { s: 'SUKH', t: 'The trainers weren\'t testing you for fun.' },
      { s: 'SUKH', t: 'Gym sirf machines nahi hai.' },
      { s: 'SUKH', t: 'People.' }
    ],
    ch4_sukh_boss: [
      { s: 'SUKH', t: 'Good job fixing the system with the team.' },
      { s: 'HERMAN', t: 'So we\'re done?' },
      { s: 'SUKH', t: 'Almost.' },
      { s: 'HERMAN', t: 'What now?' },
      { s: 'SUKH', t: "Owner's Final Test! Barbell Squat Challenge!" },
      { s: 'HERMAN', t: 'I almost died fixing the server!' },
      { s: 'SUKH', t: "You're fine." }
    ],
    ch4_ending_sitcom: [
      { s: 'SUKH', t: 'Good.' },
      { s: 'HERMAN', t: 'So what happens now?' },
      { s: 'SUKH', t: 'Nothing.' },
      { s: 'HERMAN', t: 'Nothing?' },
      { s: 'SUKH', t: 'Tomorrow you come again.' },
      { s: 'HERMAN', t: 'I hate this place.' },
      { s: 'GAGAN', t: "You'll be here tomorrow." },
      { s: 'HERMAN', t: '...Yeah.' }
    ],
    ch4_street_outro: [
      { s: 'HERMAN', t: 'Sector 67, Mohali.' },
      { s: 'HERMAN', t: 'The gym lights stay on. Everyone is still training.' },
      { s: 'HERMAN', t: 'See you tomorrow.' }
    ]
  };

  /* ═══ TILE RENDERING ═════════════════════════════════════ */
  function drawTile(ctx, ch, x, y) {
    switch (ch) {
      case '.': // Wood floor
        ctx.fillStyle = C.wood;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.woodLine;
        ctx.fillRect(x, y + 5, TS, 1);
        ctx.fillRect(x, y + 11, TS, 1);
        ctx.fillStyle = C.woodDk;
        ctx.fillRect(x + 7, y, 1, TS);
        ctx.fillStyle = C.woodLt;
        ctx.fillRect(x + 8, y, 1, TS);
        break;
      case ',': // Rubber mat floor
        ctx.fillStyle = C.rubber;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.rubberLt;
        for (let i = 0; i < 4; i++) ctx.fillRect(x + i * 4 + 1, y + i * 4 + 1, 2, 2);
        break;
      case 'm': // Functional exercise mat
        ctx.fillStyle = C.matBlue;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#1e88e5';
        ctx.fillRect(x + 1, y + 1, TS - 2, TS - 2);
        ctx.fillStyle = '#64b5f6';
        ctx.fillRect(x + 3, y + 3, TS - 6, 1);
        break;
      case 's': // Street pavement
        ctx.fillStyle = C.streetGray;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.streetDk;
        ctx.fillRect(x, y + 7, TS, 1);
        ctx.fillRect(x + 7, y, 1, TS);
        break;
      case 'c': // Curb
        ctx.fillStyle = C.curb;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x, y, TS, 3);
        break;
      case 'g': // Grass
        ctx.fillStyle = C.grass;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#689f38';
        ctx.fillRect(x + 3, y + 4, 2, 3);
        ctx.fillRect(x + 9, y + 8, 2, 3);
        break;
      case 'W': // Solid gym wall
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.wallDk;
        ctx.fillRect(x, y + 12, TS, 1);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        ctx.fillStyle = C.wallTop;
        ctx.fillRect(x, y, TS, 2);
        break;
      case 'F': // Fitway Branded Sign
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 1, y + 3, 14, 10);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 3, y + 5, 2, 6);
        ctx.fillRect(x + 3, y + 5, 8, 2);
        ctx.fillRect(x + 3, y + 8, 6, 2);
        break;
      case 'M': // Mirror with reflection shimmer
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.mirror;
        ctx.fillRect(x + 1, y + 2, 14, 10);
        ctx.fillStyle = C.mirrorLt;
        const sh = (frame * 0.2) % 16;
        ctx.fillRect(x + 2 + sh % 10, y + 3, 3, 1);
        ctx.fillStyle = C.mirrorHi;
        ctx.fillRect(x + 4, y + 6, 5, 1);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 1, y + 1, 14, 1);
        ctx.fillRect(x + 1, y + 12, 14, 1);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;
      case 'P': // Fitway Motivational Poster
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 2, y + 2, 12, 9);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 3, y + 3, 10, 7);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 5, y + 4, 6, 2);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;
      case 'C': // Clock
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.white;
        ctx.fillRect(x + 4, y + 2, 8, 8);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 5, y + 3, 6, 6);
        ctx.fillStyle = C.white;
        ctx.fillRect(x + 7, y + 4, 2, 3);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;
      case 'V': // TV Screen
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 1, y + 2, 14, 9);
        ctx.fillStyle = (frame % 60 < 30) ? '#3060a0' : '#4070b0';
        ctx.fillRect(x + 2, y + 3, 12, 7);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;
      case 'H': // Exterior Window
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.glass;
        ctx.fillRect(x + 2, y + 1, 12, 10);
        ctx.fillStyle = C.mirrorHi;
        ctx.fillRect(x + 4, y + 2, 3, 4);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 8, y + 1, 1, 10);
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;
      case 'D': // Reception Desk & PC
        ctx.fillStyle = C.wood;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#8b6840';
        ctx.fillRect(x, y, TS, 14);
        ctx.fillStyle = '#a07850';
        ctx.fillRect(x, y, TS, 3);
        // PC screen
        ctx.fillStyle = '#212121';
        ctx.fillRect(x + 3, y + 2, 6, 5);
        ctx.fillStyle = '#4caf50';
        ctx.fillRect(x + 4, y + 3, 4, 3);
        break;
      case 'L': // Lockers
        ctx.fillStyle = C.metal;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 7, y, 1, TS);
        ctx.fillRect(x, y + 7, TS, 1);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 1, y + 1, 5, 5);
        ctx.fillRect(x + 9, y + 1, 5, 5);
        break;
      case 'p': // Potted plant
        ctx.fillStyle = C.wood;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#8b5030';
        ctx.fillRect(x + 4, y + 9, 8, 6);
        ctx.fillStyle = '#40a050';
        ctx.fillRect(x + 3, y + 2, 10, 8);
        break;
      case 'w': // Water Cooler
        ctx.fillStyle = C.wood;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 3, y + 4, 10, 10);
        ctx.fillStyle = '#90c8e8';
        ctx.fillRect(x + 4, y + 1, 8, 6);
        break;
      case 'n': // Workout Bench
        ctx.fillStyle = C.rubber;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 1, y + 6, 14, 4);
        ctx.fillStyle = '#404040';
        ctx.fillRect(x + 2, y + 10, 3, 4);
        ctx.fillRect(x + 11, y + 10, 3, 4);
        break;
      case 'T': // Animated Treadmill
        ctx.fillStyle = C.rubber;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 2, y + 5, 12, 8);
        const bOff = (frame * 0.6) % 8;
        ctx.fillStyle = '#3a3a4a';
        for (let i = -1; i < 3; i++) {
          const sy = y + 6 + i * 4 + bOff;
          if (sy > y + 4 && sy < y + 13) ctx.fillRect(x + 3, sy, 10, 1);
        }
        ctx.fillStyle = '#40c060';
        ctx.fillRect(x + 4, y + 2, 8, 2);
        break;
      case 'B': // Exercise Bike
        ctx.fillStyle = C.rubber;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 5, y + 2, 6, 12);
        ctx.fillStyle = C.metal;
        ctx.fillRect(x + 6, y + 3, 4, 3);
        break;
      case 'k': // Kettlebell Cluster
        ctx.fillStyle = C.rubber;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.fblk;
        ctx.fillRect(x + 3, y + 5, 5, 5);
        ctx.fillRect(x + 9, y + 7, 5, 5);
        ctx.fillStyle = C.metal;
        ctx.fillRect(x + 4, y + 3, 3, 2);
        ctx.fillRect(x + 10, y + 5, 3, 2);
        break;
      case 'd': // Dumbbell Rack
        ctx.fillStyle = C.wall;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metal;
        ctx.fillRect(x + 1, y + 3, 14, 3);
        ctx.fillRect(x + 1, y + 9, 14, 3);
        ctx.fillStyle = C.fblk;
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x + 2 + i * 3, y + 4, 2, 1);
          ctx.fillRect(x + 2 + i * 3, y + 10, 2, 1);
        }
        ctx.fillStyle = C.baseboard;
        ctx.fillRect(x, y + 13, TS, 3);
        break;
      case 'b': // Barbell Bench Press
        ctx.fillStyle = C.rubber;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metal;
        ctx.fillRect(x + 2, y + 2, 12, 12);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 3, y + 3, 10, 10);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 4, y + 5, 8, 2);
        break;
      case 'q': // Squat Rack
        ctx.fillStyle = C.rubber;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metal;
        ctx.fillRect(x + 1, y + 0, 3, TS);
        ctx.fillRect(x + 12, y + 0, 3, TS);
        ctx.fillStyle = C.metalLt;
        ctx.fillRect(x + 2, y + 4, 12, 2);
        break;
      case 'S': // Stairs
        ctx.fillStyle = '#a09888';
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#807060';
        for (let i = 0; i < 4; i++) ctx.fillRect(x, y + i * 4, TS, 1);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 6, y + 2, 4, 2);
        break;
      case 'X': // Locked Gate / Door
        ctx.fillStyle = C.metal;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = C.metalDk;
        ctx.fillRect(x + 1, y + 1, 14, 14);
        ctx.fillStyle = C.red;
        ctx.fillRect(x + 5, y + 5, 6, 6);
        ctx.fillStyle = C.fy;
        ctx.fillRect(x + 7, y + 7, 2, 2);
        break;
      case 'O': // Interactive Terminal
        ctx.fillStyle = C.rubber;
        ctx.fillRect(x, y, TS, TS);
        ctx.fillStyle = '#263238';
        ctx.fillRect(x + 2, y + 2, 12, 12);
        ctx.fillStyle = (frame % 30 < 15) ? '#00e676' : '#00b0ff';
        ctx.fillRect(x + 4, y + 4, 8, 6);
        break;
      default:
        ctx.fillStyle = C.wood;
        ctx.fillRect(x, y, TS, TS);
        break;
    }
  }

  /* ═══ CHARACTER SPRITE RENDERING ═════════════════════════ */
  function drawSprite(id, x, y, dir, walkFrame, exercising) {
    const ch = CHARS.find(c => c.id === id);
    if (!ch) { drawGenericNPC(id, x, y, dir, walkFrame, exercising); return; }
    const cl = ch.col;
    const bw = ch.build === 'broad' ? 14 : (ch.build === 'stocky' ? 13 : 11);
    const bx = x + (16 - bw) / 2;
    const legOff = (walkFrame === 1) ? 1 : (walkFrame === 3) ? -1 : 0;

    // Shadow
    g.fillStyle = C.shadow;
    g.fillRect(x + 2, y + 20, 12, 3);

    // Shoes
    g.fillStyle = cl.shoes;
    g.fillRect(bx + 1, y + 19 + legOff, 4, 2);
    g.fillRect(bx + bw - 5, y + 19 - legOff, 4, 2);

    // Pants/Legs
    g.fillStyle = cl.pants;
    g.fillRect(bx + 1, y + 15 + legOff, 4, 4);
    g.fillRect(bx + bw - 5, y + 15 - legOff, 4, 4);

    // Torso / Shirt
    g.fillStyle = cl.shirt;
    g.fillRect(bx, y + 8, bw, 7);
    g.fillStyle = cl.shirtDk;
    g.fillRect(bx, y + 13, bw, 2);

    // Arms
    g.fillStyle = cl.skin;
    if (dir === 'left') {
      g.fillRect(bx - 2, y + 9, 3, 5);
    } else if (dir === 'right') {
      g.fillRect(bx + bw - 1, y + 9, 3, 5);
    } else {
      g.fillRect(bx - 1, y + 9, 2, 5);
      g.fillRect(bx + bw - 1, y + 9, 2, 5);
    }

    // Neck & Head
    g.fillStyle = cl.skin;
    g.fillRect(bx + 3, y + 6, bw - 6, 2);
    const hw = bw - 2;
    const hx = bx + 1;
    g.fillRect(hx, y + 2, hw, 5);

    // Hair
    g.fillStyle = cl.hair;
    if (dir === 'up') {
      g.fillRect(hx - 1, y, hw + 2, 4);
    } else {
      g.fillRect(hx - 1, y, hw + 2, 3);
    }

    // Face features
    if (dir === 'down') {
      g.fillStyle = '#1a1410';
      g.fillRect(hx + 2, y + 4, 2, 1);
      g.fillRect(hx + hw - 4, y + 4, 2, 1);
      g.fillStyle = '#a06040';
      g.fillRect(hx + 3, y + 6, hw - 6, 1);
    } else if (dir === 'left') {
      g.fillStyle = '#1a1410';
      g.fillRect(hx + 1, y + 4, 2, 1);
    } else if (dir === 'right') {
      g.fillStyle = '#1a1410';
      g.fillRect(hx + hw - 3, y + 4, 2, 1);
    }

    // Character Accessories
    if (cl.acc === 'glasses' && dir !== 'up') {
      g.fillStyle = '#90b8d8';
      g.fillRect(hx + 1, y + 3, hw - 2, 2);
      g.fillStyle = '#37474f';
      g.fillRect(hx, y + 3, 1, 2);
      g.fillRect(hx + hw - 1, y + 3, 1, 2);
    }
    if (cl.acc === 'headband') {
      g.fillStyle = '#e53935';
      g.fillRect(hx - 1, y + 1, hw + 2, 2);
    }
    if (cl.acc === 'whistle') {
      g.fillStyle = C.metalLt;
      g.fillRect(bx + bw - 2, y + 8, 3, 1);
      g.fillRect(bx + bw, y + 7, 2, 2);
    }
    if (id === 'sukh') {
      g.fillStyle = C.fyDk;
      g.fillRect(bx + 2, y + 8, bw - 4, 2);
    }
  }

  function drawGenericNPC(type, x, y, dir, wf, exercising) {
    const legOff = (wf === 1) ? 1 : (wf === 3) ? -1 : 0;
    let shirtCol = '#e53935', pantsCol = '#263238', skinCol = '#e0b080';
    if (type === 'member_f') { shirtCol = '#ab47bc'; skinCol = '#f8d0b0'; }
    if (type === 'member_m') { shirtCol = '#43a047'; }

    g.fillStyle = C.shadow;
    g.fillRect(x + 3, y + 20, 10, 2);
    g.fillStyle = pantsCol;
    g.fillRect(x + 4, y + 15 + legOff, 3, 4);
    g.fillRect(x + 9, y + 15 - legOff, 3, 4);
    g.fillStyle = shirtCol;
    g.fillRect(x + 3, y + 8, 10, 7);
    g.fillStyle = skinCol;
    g.fillRect(x + 4, y + 2, 8, 5);
    g.fillStyle = '#141414';
    g.fillRect(x + 3, y, 10, 3);
    if (dir === 'down') {
      g.fillRect(x + 5, y + 4, 2, 1);
      g.fillRect(x + 9, y + 4, 2, 1);
    }
  }

  /* ═══ PORTRAIT DRAWING (48×48) ═══════════════════════════ */
  function drawPortrait(charId, px, py, size) {
    const ch = CHARS.find(c => c.id === charId);
    if (!ch) return;
    const cl = ch.col;
    const s = size || 48;
    const u = s / 48;

    g.fillStyle = C.uiBg2;
    g.fillRect(px, py, s, s);

    // Shoulders
    const bw = ch.build === 'broad' ? 40 : (ch.build === 'stocky' ? 36 : 32);
    const bx = px + (s - bw * u) / 2;
    g.fillStyle = cl.shirt;
    g.fillRect(bx, py + 32 * u, bw * u, 16 * u);
    g.fillStyle = cl.shirtDk;
    g.fillRect(bx, py + 42 * u, bw * u, 6 * u);

    // Head
    g.fillStyle = cl.skin;
    g.fillRect(px + 18 * u, py + 28 * u, 12 * u, 6 * u);
    g.fillRect(px + 10 * u, py + 8 * u, 28 * u, 22 * u);

    // Hair
    g.fillStyle = cl.hair;
    g.fillRect(px + 8 * u, py + 2 * u, 32 * u, 10 * u);

    // Eyes
    g.fillStyle = C.white;
    g.fillRect(px + 14 * u, py + 16 * u, 8 * u, 5 * u);
    g.fillRect(px + 26 * u, py + 16 * u, 8 * u, 5 * u);
    g.fillStyle = '#141414';
    g.fillRect(px + 17 * u, py + 17 * u, 4 * u, 3 * u);
    g.fillRect(px + 29 * u, py + 17 * u, 4 * u, 3 * u);

    // Glasses/Accessories
    if (cl.acc === 'glasses') {
      g.fillStyle = '#90b8d8';
      g.fillRect(px + 12 * u, py + 15 * u, 10 * u, 6 * u);
      g.fillRect(px + 26 * u, py + 15 * u, 10 * u, 6 * u);
      g.fillStyle = '#37474f';
      g.fillRect(px + 22 * u, py + 16 * u, 4 * u, 2 * u);
    }
    if (cl.acc === 'headband') {
      g.fillStyle = '#e53935';
      g.fillRect(px + 8 * u, py + 6 * u, 32 * u, 4 * u);
    }
    if (charId === 'sukh') {
      g.fillStyle = C.fyDk;
      g.fillRect(px + 14 * u, py + 32 * u, 20 * u, 4 * u);
    }

    g.strokeStyle = C.uiBorder;
    g.lineWidth = 2;
    g.strokeRect(px, py, s, s);
    g.lineWidth = 1;
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

    Audio8.sfx('stairs');
  }

  function getTile(col, row) {
    if (!curRoom || row < 0 || row >= ROWS || col < 0 || col >= COLS) return 'W';
    return curRoom.map[row]?.[c] || curRoom.map[row]?.[col] || 'W';
  }

  function canWalkTo(px, py) {
    const footL = px + 2, footR = px + 14;
    const footT = py + 14, footB = py + 21;

    const tl = getTile(Math.floor(footL / TS), Math.floor(footT / TS));
    const tr = getTile(Math.floor(footR / TS), Math.floor(footT / TS));
    const bl = getTile(Math.floor(footL / TS), Math.floor(footB / TS));
    const br = getTile(Math.floor(footR / TS), Math.floor(footB / TS));

    if (!isWalkable(tl) || !isWalkable(tr) || !isWalkable(bl) || !isWalkable(br)) return false;

    for (const npc of npcs) {
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
      if (ex.condition && !storyProgress[ex.condition]) continue;
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
    Audio8.sfx('select');
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
    Audio8.sfx('blip');
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

    // NPC Interactions
    for (const npc of npcs) {
      if (Math.abs(npc.tx - tx) <= 1 && Math.abs(npc.ty - ty) <= 1) {
        npc.dir = pl.dir === 'up' ? 'down' : pl.dir === 'down' ? 'up' : pl.dir === 'left' ? 'right' : 'left';

        // ── CHAPTER 1 ──
        if (chapter === 1) {
          if (npc.id === 'sukh_reception') {
            if (!storyProgress.ch1_talkedSukh) {
              storyProgress.ch1_talkedSukh = true;
              startDialogue('ch1_sukh_late');
            } else if (storyProgress.ch1_stairsChecked) {
              startDialogue('ch1_sukh_end', () => showChapterEnd(1));
            } else {
              startDialogue('ch1_sukh_late');
            }
            return;
          }
          if (npc.id === 'gagan_cardio') {
            if (!storyProgress.ch1_talkedGagan) {
              storyProgress.ch1_talkedGagan = true;
              startDialogue('ch1_gagan_meet', () => {
                startRepChallenge('KETTLEBELL SWINGS', 'GAGAN', 15, () => {
                  storyProgress.ch1_gaganChallengeDone = true;
                  startDialogue('ch1_treadmill_beep', () => {
                    startChaosMinigame();
                  });
                });
              });
            } else if (storyProgress.ch1_chaosCleared) {
              startDialogue('ch1_stairs_locked', () => {
                storyProgress.ch1_stairsChecked = true;
              });
            }
            return;
          }
        }

        // ── CHAPTER 2 ──
        if (chapter === 2) {
          if (npc.id === 'sukh_reception') {
            startDialogue('ch2_intro');
            return;
          }
          if (npc.id === 'gagan_cardio') {
            startDialogue('ch2_gagan_bench_rant', () => {
              storyProgress.ch2_gaganBench = true;
            });
            return;
          }
          if (npc.id === 'shubham_func') {
            startDialogue('ch2_meet_shubham', () => {
              startRepChallenge('SPEED BAND PULLS', 'SHUBHAM', 20, () => {
                storyProgress.ch2_shubhamChallengeDone = true;
                showUnlock('RESISTANCE BAND', 'BAND BLAST', 'High-velocity agility and conditioning weapon.', () => {
                  unlocks.resistanceBand = true;
                  startDialogue('ch2_group_banter', () => {
                    showChapterEnd(2);
                  });
                });
              });
            });
            return;
          }
        }

        // ── CHAPTER 3 ──
        if (chapter === 3) {
          if (npc.id === 'rakesh_func') {
            startDialogue('ch3_meet_rakesh', () => {
              startRepChallenge('EZ-BAR CURLS', 'RAKESH', 10, () => {
                storyProgress.ch3_competitionDone = true;
                startDialogue('ch3_glitch_investigate', () => {
                  showUnlock('EZ-CURL BAR', 'OLD SCHOOL POWER', 'Pure veteran form purist barbell mastery.', () => {
                    unlocks.ezCurlBar = true;
                    storyProgress.stairsUnlocked = true;
                    startDialogue('ch3_gagan_warm', () => {
                      showChapterEnd(3);
                    });
                  });
                });
              });
            });
            return;
          }
        }

        // ── CHAPTER 4 ──
        if (chapter === 4) {
          if (curRoomId === 'weights') {
            if (npc.id === 'sukh_weights') {
              startDialogue('ch4_sukh_boss', () => {
                startRepChallenge('OWNER SQUAT TEST', 'SUKH', 20, () => {
                  storyProgress.ch4_sukhBossDone = true;
                  startDialogue('ch4_ending_sitcom', () => {
                    showChapterEnd(4);
                  });
                });
              });
              return;
            }
          }
        }

        // Generic NPC lines
        if (npc.text) {
          startDialogue(npc.text);
          return;
        }
      }
    }

    // Tile Examination
    const tile = curRoom.map[ty]?.[tx];
    if (tile === 'X' || tile === 'S') {
      if (chapter < 4 && !storyProgress.stairsUnlocked) {
        startDialogue('ch1_stairs_locked');
      }
    }
  }

  /* ═══ CHALLENGE & MINIGAME ENGINES ═══════════════════════ */
  function startRepChallenge(name, trainer, target, onDone) {
    chl.active = true;
    chl.name = name;
    chl.trainer = trainer;
    chl.target = target;
    chl.current = 0;
    chl.meter = 20;
    chl.tempoDir = 1;
    chl.onDone = onDone;
    state = 'challenge';
    Audio8.sfx('powerup');
  }

  function doRep() {
    chl.current++;
    Audio8.sfx('coin');
    if (window.__buzz) window.__buzz(15);
    if (chl.current >= chl.target) {
      chl.active = false;
      state = 'explore';
      Audio8.sfx('fanfare');
      if (chl.onDone) chl.onDone();
    }
  }

  function startChaosMinigame() {
    minigame.active = true;
    minigame.type = 'chaos';
    minigame.timer = 0;
    minigame.score = 0;
    minigame.total = 5;
    minigame.onDone = () => {
      storyProgress.ch1_chaosCleared = true;
      showUnlock('MACHINE OVERRIDE', 'DEBUG & REBOOT', 'Understand gym electronics instead of just lifting.', () => {
        unlocks.machineOverride = true;
        startDialogue('ch1_chaos_done');
      });
    };
    state = 'chaos_minigame';
    Audio8.sfx('boom');
  }

  function showUnlock(title, name, desc, onDone) {
    unlockAnim.active = true;
    unlockAnim.timer = 0;
    unlockAnim.title = title;
    unlockAnim.name = name;
    unlockAnim.desc = desc;
    unlockAnim.onDone = onDone;
    state = 'unlock';
    Audio8.sfx('stage_clear');
  }

  function showChapterEnd(chNum) {
    chCard.active = true;
    chCard.timer = 0;
    chCard.title = `CHAPTER ${chNum} — COMPLETE`;
    chCard.subtitle = chNum === 1 ? '“JUST COME TO THE GYM”' :
      chNum === 2 ? '“THE BENCH IS NOT RESERVED”' :
        chNum === 3 ? '“EVERYONE KNOWS EVERYONE”' : '“THE WEIGHTS FLOOR”';
    chCard.quote = chNum === 1 ? '“COME BACK TOMORROW.”' :
      chNum === 2 ? '“NEXT: THE PEOPLE WHO NEVER LEAVE THE GYM”' :
        chNum === 3 ? '“NEXT: THE WEIGHTS FLOOR — EVERYONE HAS A LIMIT.”' : '“KAL PHIR AA JAANA.”';

    chCard.onDone = () => {
      chCard.active = false;
      if (chNum < 4) {
        chapter = chNum + 1;
        state = 'explore';
        loadRoom('street');
      } else {
        state = 'credits';
      }
    };
    state = 'chapter_end';
    Audio8.sfx('fanfare');
  }

  /* ═══ SCREENS RENDERING ══════════════════════════════════ */
  function renderTitle() {
    titleTimer++;
    g.fillStyle = C.uiDark;
    g.fillRect(0, 0, W, H);

    // Scanlines
    g.fillStyle = 'rgba(255,208,0,0.03)';
    for (let y = 0; y < H; y += 2) g.fillRect(0, y, W, 1);

    g.textAlign = 'center';

    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY PRESENTS', W / 2, 40);

    g.font = '16px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText('IRON RUN', W / 2, 70);

    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('SECTOR 67, MOHALI — THE 16-BIT GYM ADVENTURE', W / 2, 88);

    // Facade Art
    g.fillStyle = '#1a1828';
    g.fillRect(36, 105, 184, 60);
    g.fillStyle = C.fblk;
    g.fillRect(38, 107, 180, 56);
    g.fillStyle = C.fy;
    g.fillRect(80, 112, 96, 14);
    g.fillStyle = C.fblk;
    g.font = '7px "Press Start 2P", monospace';
    g.fillText('FITWAY GYM', W / 2, 122);

    // Interactive Menu Options
    const opts = ['START CHAPTER 1', 'SELECT CHAPTER', 'CHARACTER ROSTER', 'FREE ROAM'];
    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = C.uiText;

    if (Math.floor(frame / 16) % 2 === 0) {
      g.fillStyle = C.fy;
      g.fillText('PRESS [A] TO ENTER FITWAY', W / 2, 195);
    }
    g.font = '5px "Press Start 2P", monospace';
    g.fillStyle = C.uiMuted;
    g.fillText('© FITWAY GYM • CREATED BY HERMANIFY', W / 2, 215);
    g.textAlign = 'left';
  }

  function renderCharSelect() {
    g.fillStyle = '#0a0818';
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '8px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY — SELECT YOUR MEMBER', W / 2, 14);

    // Large portrait
    drawPortrait(selChar.id, 12, 24, 56);

    const ix = 76;
    g.textAlign = 'left';
    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = C.uiText;
    g.fillText(selChar.name, ix, 32);

    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(selChar.title, ix, 42);

    g.fillStyle = C.uiMuted;
    g.font = '5px "Press Start 2P", monospace';
    const qLines = selChar.quote.split('\n');
    qLines.forEach((ql, i) => g.fillText(ql, ix, 54 + i * 8));

    // Stats
    STAT_NAMES.forEach((sn, i) => {
      const sx = (i < 3) ? ix : ix + 80;
      const syi = 78 + (i % 3) * 10;
      g.fillStyle = '#808090';
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
    g.fillStyle = '#4caf50';
    g.fillText('SPECIAL: ' + selChar.special, ix, 124);

    // Roster grid
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
    if (Math.floor(frame / 16) % 2 === 0) {
      g.font = '7px "Press Start 2P", monospace';
      g.fillStyle = C.uiText;
      g.fillText('◄ D-PAD ►     [A] SELECT', W / 2, 202);
    }
    g.textAlign = 'left';
  }

  function renderChapterEnd() {
    chCard.timer++;
    g.fillStyle = C.uiDark;
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY', W / 2, 45);

    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText(chCard.title, W / 2, 70);

    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(chCard.subtitle, W / 2, 95);

    drawPortrait(selChar.id, W / 2 - 20, 110, 40);

    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = C.uiMuted;
    g.fillText(chCard.quote, W / 2, 175);

    if (chCard.timer > 50 && Math.floor(frame / 16) % 2 === 0) {
      g.fillStyle = C.white;
      g.fillText('PRESS [A] TO CONTINUE', W / 2, 205);
    }
    g.textAlign = 'left';
  }

  function renderCredits() {
    g.fillStyle = C.uiDark;
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText('FITWAY: THE END', W / 2, 35);

    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.uiMuted;
    g.fillText('SECTOR 67, MOHALI', W / 2, 50);

    // Cast Cards
    const yOff = 75;
    g.font = '6px "Press Start 2P", monospace';

    g.fillStyle = C.fy;
    g.fillText('SUKH — OWNER & FOUNDER', W / 2, yOff);
    g.fillStyle = C.white;
    g.fillText('GAGAN — TECHNIQUE POLICE', W / 2, yOff + 16);
    g.fillStyle = C.fy;
    g.fillText('SHUBHAM — SPEED & CARDIO DEMON', W / 2, yOff + 32);
    g.fillStyle = C.white;
    g.fillText('RAKESH — VETERAN FORM PURIST', W / 2, yOff + 48);
    g.fillStyle = '#4caf50';
    g.fillText('HERMAN — SOFTWARE / HARDWARE / IT', W / 2, yOff + 64);

    g.fillStyle = C.fy;
    g.font = '8px "Press Start 2P", monospace';
    g.fillText('“KAL PHIR AA JAANA.”', W / 2, 175);

    if (Math.floor(frame / 16) % 2 === 0) {
      g.fillStyle = C.white;
      g.font = '6px "Press Start 2P", monospace';
      g.fillText('PRESS [A] TO FREE ROAM THE GYM', W / 2, 205);
    }
    g.textAlign = 'left';
  }

  function renderChallenge() {
    g.fillStyle = 'rgba(0,0,0,0.85)';
    g.fillRect(0, 0, W, H);

    g.fillStyle = C.uiBg;
    g.fillRect(20, 25, W - 40, 170);
    g.strokeStyle = C.uiBorder;
    g.lineWidth = 2;
    g.strokeRect(20, 25, W - 40, 170);
    g.lineWidth = 1;

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
    g.fillStyle = '#4caf50';
    g.fillText(`${pad(chl.current)} / ${pad(chl.target)}`, W / 2, 120);

    // Rep Bar
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
    minigame.timer++;
    g.fillStyle = 'rgba(0,0,0,0.88)';
    g.fillRect(0, 0, W, H);

    g.textAlign = 'center';
    g.font = '9px "Press Start 2P", monospace';
    g.fillStyle = '#e53935';
    g.fillText('CARDIO EMERGENCY OVERLOAD!', W / 2, 40);

    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText('SHUT DOWN MALFUNCTIONING CONSOLES', W / 2, 58);

    g.font = '18px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(`REBOOTED: ${minigame.score} / ${minigame.total}`, W / 2, 110);

    if (Math.floor(frame / 12) % 2 === 0) {
      g.font = '8px "Press Start 2P", monospace';
      g.fillStyle = '#4caf50';
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
    g.fillText('ABILITY UNLOCKED!', W / 2, 45);

    g.fillStyle = C.uiBg;
    g.fillRect(30, 60, W - 60, 95);
    g.strokeStyle = C.fy;
    g.lineWidth = 2;
    g.strokeRect(30, 60, W - 60, 95);
    g.lineWidth = 1;

    g.font = '10px "Press Start 2P", monospace';
    g.fillStyle = C.white;
    g.fillText(unlockAnim.title, W / 2, 85);

    g.font = '7px "Press Start 2P", monospace';
    g.fillStyle = '#4caf50';
    g.fillText(unlockAnim.name, W / 2, 105);

    g.font = '5px "Press Start 2P", monospace';
    g.fillStyle = C.uiMuted;
    g.fillText(unlockAnim.desc, W / 2, 128);

    if (unlockAnim.timer > 40 && Math.floor(frame / 16) % 2 === 0) {
      g.font = '7px "Press Start 2P", monospace';
      g.fillStyle = C.white;
      g.fillText('PRESS [A] TO CONTINUE', W / 2, 185);
    }
    g.textAlign = 'left';
  }

  function renderHUD() {
    if (state !== 'explore' || dlg.active) return;
    g.fillStyle = 'rgba(8,6,16,0.85)';
    g.fillRect(0, 0, W, 14);

    drawPortrait(selChar.id, 1, 1, 12);
    g.font = '6px "Press Start 2P", monospace';
    g.fillStyle = C.fy;
    g.fillText(selChar.name, 16, 5);

    g.fillStyle = C.uiMuted;
    g.fillText(curRoom?.name || '', 16, 12);

    if (unlocks.machineOverride) {
      g.fillStyle = '#4caf50';
      g.fillText('⚡ OVERRIDE', W - 80, 9);
    }
  }

  function renderDialogue() {
    if (!dlg.active || dlg.idx >= dlg.lines.length) return;
    const line = dlg.lines[dlg.idx];

    g.fillStyle = C.uiBg;
    g.fillRect(0, H - 56, W, 56);
    g.fillStyle = C.uiBorder;
    g.fillRect(0, H - 56, W, 2);
    g.fillRect(0, H - 2, W, 2);

    const speakerChar = CHARS.find(ch => ch.name === line.s);
    if (speakerChar) {
      drawPortrait(speakerChar.id, 4, H - 52, 32);
    } else {
      g.fillStyle = C.uiBg2;
      g.fillRect(4, H - 52, 32, 32);
      g.strokeStyle = C.metalDk;
      g.strokeRect(4, H - 52, 32, 32);
    }

    if (line.s) {
      g.fillStyle = C.fy;
      g.font = '7px "Press Start 2P", monospace';
      g.fillText(line.s, 42, H - 45);
    }

    g.fillStyle = C.uiText;
    g.font = '6px "Press Start 2P", monospace';
    const visibleText = line.t.substring(0, dlg.charPos);
    const textLines = visibleText.split('\n');
    textLines.forEach((tl, i) => {
      g.fillText(tl, 42, H - 33 + i * 11);
    });

    if (dlg.charPos >= line.t.length) {
      if (Math.floor(frame / 16) % 2 === 0) {
        g.fillStyle = C.fy;
        g.fillText('▼', W - 14, H - 8);
      }
    }
  }

  /* ═══ MAIN UPDATE LOOP ═══════════════════════════════════ */
  function update() {
    frame++;
    updateFade();

    const held = window.__held || {};
    const aEdge = window.__aEdge;

    switch (state) {
      case 'title':
        if (aEdge) {
          state = 'char_select';
          Audio8.sfx('start');
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
          chapter = 1;
          loadRoom('street');
          Audio8.sfx('cartridge');
          Audio8.music('mario');
          startDialogue('ch1_street_intro');
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
          if (pl.walkT % 8 === 0) pl.walkFrame = (pl.walkFrame || 0) + 1;
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
        if (aEdge && unlockAnim.timer > 30) {
          unlockAnim.active = false;
          state = 'explore';
          if (unlockAnim.onDone) unlockAnim.onDone();
        }
        break;

      case 'chapter_end':
        if (aEdge && chCard.timer > 40) {
          if (chCard.onDone) chCard.onDone();
        }
        break;

      case 'credits':
        if (aEdge) {
          state = 'explore';
          mode = 'free_roam';
          chapter = 4;
          storyProgress.stairsUnlocked = true;
          loadRoom('reception');
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
      case 'char_select':
        renderCharSelect();
        break;
      case 'chapter_end':
        renderChapterEnd();
        break;
      case 'credits':
        renderCredits();
        break;
      case 'explore':
      case 'dialogue':
        if (roomBgCanvas) g.drawImage(roomBgCanvas, 0, 0);

        // Render NPCs & player sorted by Y coordinate for depth
        const entities = [];
        npcs.forEach(npc => {
          entities.push({
            y: npc.py,
            draw: () => {
              drawSprite(npc.sprite || npc.charId || 'member_m', npc.px, npc.py, npc.dir, npc.walkFrame || 0, npc.exercising);
            }
          });
        });

        entities.push({
          y: pl.y,
          draw: () => {
            drawSprite(selChar.id, pl.x, pl.y, pl.dir, pl.walkFrame || 0, false);
          }
        });

        entities.sort((a, b) => a.y - b.y);
        entities.forEach(e => e.draw());

        renderHUD();
        if (state === 'dialogue') renderDialogue();
        break;

      case 'challenge':
        if (roomBgCanvas) g.drawImage(roomBgCanvas, 0, 0);
        renderChallenge();
        break;

      case 'chaos_minigame':
        if (roomBgCanvas) g.drawImage(roomBgCanvas, 0, 0);
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

  /* ═══ LIFECYCLE ══════════════════════════════════════════ */
  function start(ctx) {
    g = ctx;
    state = 'title';
    titleTimer = 0;
    charIdx = 0;
    selChar = CHARS[0];
    chapter = 1;
  }

  function stop() {
    Audio8.stop();
  }

  function reset() {
    state = 'title';
    titleTimer = 0;
    chapter = 1;
  }

  function onAction() {
    if (state === 'challenge') { doRep(); return; }
    window.__aEdge = true;
  }

  function getHUD() {
    return {
      title: 'FITWAY: IRON RUN',
      char: selChar?.name || 'HERMAN',
      room: curRoom?.name || 'SECTOR 67, MOHALI',
      chapter: `CHAPTER ${chapter}`,
      equipped: unlocks.machineOverride ? 'OVERRIDE' : 'NONE'
    };
  }

  return { start, stop, reset, update, render, onAction, getHUD };
})();
