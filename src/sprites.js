/* ============================================================
   sprites.js  --  hand-authored pixel art
   ------------------------------------------------------------
   Everything is a grid of characters mapped through PAL.
   Grids are baked into offscreen canvases once at boot, so
   drawing is a single drawImage per sprite.
   ============================================================ */

const PAL = {
  '.': null,               // transparent
  k: '#4a0f2b',            // outline, dark plum
  K: '#7a0f42',            // outline, softer
  h: '#6b3a22', H: '#8f5230',   // hair
  s: '#ffd9c0', S: '#e8b598',   // skin
  e: '#3d1029',                  // eye
  m: '#e0246e',                  // mouth
  w: '#ffffff', W: '#ffe9f3',    // white / near-white
  d: '#ff5fa2', D: '#d3216b',    // dress pink
  r: '#ffb8d8',                  // ribbon / soft pink
  b: '#7a0f42',                  // boots
  g: '#5fbf6a', G: '#3d8f4d', j: '#8fe06f',  // greens
  t: '#8a5a3a', T: '#603a22',    // wood
  p: '#ffd2b8', P: '#e8a882',    // peach / path
  c: '#fff6ec', C: '#e8dcc8',    // cream
  n: '#c9b79a', N: '#9d8b74',    // BEIGE
  y: '#ffe04f', Y: '#e8a82f',    // gold
  l: '#cdb4ff', L: '#9d7fd6',    // lavender
  q: '#8fe3c8', Q: '#4fb99a',    // mint
  R: '#ff3b5c', X: '#c0203f',    // red
  u: '#a8d8ff', U: '#6fb0e8',    // water
  o: '#ff8fbe',                  // mid pink
  z: '#7a5c8f',                  // dusk purple
};

/* Bake a character grid into a canvas. */
function PX(rows, overrides) {
  const pal = overrides ? Object.assign({}, PAL, overrides) : PAL;
  const w = Math.max(...rows.map(r => r.length));
  const h = rows.length;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]];
      if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
    }
  }
  return cv;
}

/* Horizontal mirror of a baked canvas. */
function flipX(src) {
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  const g = cv.getContext('2d');
  g.translate(src.width, 0); g.scale(-1, 1);
  g.drawImage(src, 0, 0);
  return cv;
}

/* ── THE HERO ────────────────────────────────────────────────
   16x16. Deliberately low resolution: flat colours, one
   outline value, a readable silhouette at 1x.
   ─────────────────────────────────────────────────────────── */

const HERO_DOWN = [
  '................',
  '....kkkkkkkk....',
  '...khhhhhhhhk...',
  '..khhhhhhhhhhk..',
  '..khhhhhhhhhhk..',
  '..khsssssssshk..',
  '..khseesseeshk..',
  '..khsssssssshk..',
  '..kssssmmssssk..',
  '.kddddddddddddk.',
  '.ksddddddddddsk.',
  '.ksdddwwwwdddsk.',
  '.kddddddddddddk.',
  'kddddddddddddddk',
  'kDDDDDDDDDDDDDDk',
  '..kkbb....bbkk..',
];

const HERO_UP = [
  '................',
  '....kkkkkkkk....',
  '...khhhhhhhhk...',
  '..khhhhhhhhhhk..',
  '..khhhrrrrhhhk..',
  '..khhrrrrrrhhk..',
  '..khhhrrrrhhhk..',
  '..khhhhhhhhhhk..',
  '..khhhhhhhhhhk..',
  '.kddddddddddddk.',
  '.ksddddddddddsk.',
  '.ksddddddddddsk.',
  '.kddddddddddddk.',
  'kddddddddddddddk',
  'kDDDDDDDDDDDDDDk',
  '..kkbb....bbkk..',
];

const HERO_SIDE = [
  '................',
  '.....kkkkkk.....',
  '....khhhhhhk....',
  '...khhhhhhhhk...',
  '...khhhhhhhhk...',
  '...khhhsssssk...',
  '...khhhsesssk...',
  '...khhhsssssk...',
  '...khhhsssmmk...',
  '...kddddddddk...',
  '...kdddddddsk...',
  '...kddwwddddk...',
  '...kddddddddk...',
  '..kddddddddddk..',
  '..kDDDDDDDDDDk..',
  '...kkbbbbkk.....',
];

/* Leg positions for the walk cycle. */
const LEGS = {
  stand: '..kkbb....bbkk..',
  stepA: '..kkbbb...bb....',
  stepB: '....bb...bbbkk..',
  sideStand: '...kkbbbbkk.....',
  sideA:     '..kkbb..bbkk....',
  sideB:     '....kkbbbbkk....',
};

function heroFrame(base, leg) {
  const rows = base.slice();
  rows[15] = leg;
  return PX(rows);
}

const HERO = {
  down:  [heroFrame(HERO_DOWN, LEGS.stand), heroFrame(HERO_DOWN, LEGS.stepA),
          heroFrame(HERO_DOWN, LEGS.stand), heroFrame(HERO_DOWN, LEGS.stepB)],
  up:    [heroFrame(HERO_UP, LEGS.stand),   heroFrame(HERO_UP, LEGS.stepA),
          heroFrame(HERO_UP, LEGS.stand),   heroFrame(HERO_UP, LEGS.stepB)],
  right: [heroFrame(HERO_SIDE, LEGS.sideStand), heroFrame(HERO_SIDE, LEGS.sideA),
          heroFrame(HERO_SIDE, LEGS.sideStand), heroFrame(HERO_SIDE, LEGS.sideB)],
};
HERO.left = HERO.right.map(flipX);

/* ── NPC BODIES ──────────────────────────────────────────────
   One shared villager silhouette, recoloured per character.
   Consistent shapes read as "one game" the way NES casts do.
   ─────────────────────────────────────────────────────────── */

const NPC_BODY = [
  '................',
  '....kkkkkkkk....',
  '...kAAAAAAAAk...',
  '..kAAAAAAAAAAk..',
  '..kAAAAAAAAAAk..',
  '..kBssssssssBk..',
  '..kBseesseesBk..',
  '..kBsssssssdBk..',
  '..kssssmmsssdk..',
  '.kCCCCCCCCCCCCk.',
  '.ksCCCCCCCCCCsk.',
  '.ksCCCEECCCCCsk.',
  '.kCCCCCCCCCCCCk.',
  'kCCCCCCCCCCCCCCk',
  'kDDDDDDDDDDDDDDk',
  '..kkbb....bbkk..',
];

const NPC_BODY_STEP = NPC_BODY.slice();
NPC_BODY_STEP[15] = '..kkbbb...bb....';

/* colors = { A:hair, B:hairSide, C:body, D:bodyShade, E:accent } */
function npcSprite(colors) {
  const ov = {
    A: colors.hair, B: colors.hair, C: colors.body,
    D: colors.shade || colors.body, E: colors.accent || '#ffffff',
    d: colors.hair,
  };
  return [PX(NPC_BODY, ov), PX(NPC_BODY_STEP, ov)];
}

/* ── SPECIAL CHARACTERS ──────────────────────────────────── */

const FROG = [
  '................',
  '....y.y..y.y....',
  '....yYyyyYy.....',
  '....yyyyyyy.....',
  '..gggg....gggg..',
  '.gwwwwg..gwwwwg.',
  '.gwkkwg..gwkkwg.',
  '.gwwwwg..gwwwwg.',
  '..gggggggggggg..',
  '.ggggggggggggg..',
  '.gGgkkkkkkkkgGg.',
  '.gGggggggggggGg.',
  '..GGgggggggggG..',
  '.gg.GGGGGGGG.gg.',
  '.Gg..........gG.',
  '................',
];
const FROG_B = FROG.slice();
FROG_B[13] = '.g..GGGGGGGG..g.';
FROG_B[14] = '.Gg..........gG.';
FROG_B[5]  = '.gwwwwg..gwwwwg.';
FROG_B[6]  = '.gwwkwg..gwkwwg.';

const BEIGE_ONE = [
  '................',
  '................',
  '.....nnnnnn.....',
  '...nnnnnnnnnn...',
  '..nnnnnnnnnnnn..',
  '..nnkknnnnkknn..',
  '..nnkknnnnkknn..',
  '..nnnnnnnnnnnn..',
  '..nnnnnkknnnnn..',
  '..Nnnnnnnnnnnn..',
  '..NNnnnnnnnnNN..',
  '...NNnnnnnnNN...',
  '....NN.NN.NN....',
  '................',
  '................',
  '................',
];
const BEIGE_ONE_B = BEIGE_ONE.slice();
BEIGE_ONE_B[12] = '...NN..NN..NN...';
BEIGE_ONE_B[2]  = '....nnnnnnnn....';

/* The final boss. 32x32 of slightly angry fruit. */
const BOSS = [
  '..............gg................',
  '.............gGg................',
  '...........ggGGgg...............',
  '....gg....ggGGGGgg....gg........',
  '...gGGgg.ggGGGGGGgg.ggGGg.......',
  '...gGGGGggGGGGGGGGggGGGGg.......',
  '....gGGGGGGGGGGGGGGGGGGg........',
  '.....gGGGGGGGGGGGGGGGGg.........',
  '.......kkkkkkkkkkkkkk...........',
  '.....kkRRRRRRRRRRRRRRkk.........',
  '....kRRRRwRRRRRRwRRRRRRk........',
  '...kRRRRRRRRRRRRRRRRRRRRk.......',
  '..kRRRwRRRRkkRRkkRRRRwRRRk......',
  '..kRRRRRRRkwwRkwwRRRRRRRRk......',
  '.kRRwRRRRRkwkRkwkRRRRwRRRRk.....',
  '.kRRRRRRRRRkkRRkkRRRRRRRRRk.....',
  '.kRRRRRRRRRRRRRRRRRRRRwRRRk.....',
  '.kRRwRRRRRRRRRRRRRRRRRRRRRk.....',
  '.kRRRRRRRRkkkkkkkkRRRRRRRRk.....',
  '.kRRRRRRRkRRRRRRRRkRRwRRRRk.....',
  '..kRRwRRRRkkkkkkkkRRRRRRRk......',
  '..kRRRRRRRRRRRRRRRRRRRRRRk......',
  '...kRRRRwRRRRRRRRRRwRRRRk.......',
  '....kRRRRRRRRRRRRRRRRRRk........',
  '.....kRRRRRRRRRRRRRRRRk.........',
  '......kkRRRRRRRRRRRRkk..........',
  '........kkRRRRRRRRkk............',
  '..........kkkkkkkk..............',
  '................................',
  '................................',
  '................................',
  '................................',
];
const BOSS_B = BOSS.map(r => r);
BOSS_B[12] = '..kRRRwRRRkkRRkkRRRRRwRRRk......';
BOSS_B[18] = '.kRRRRRRRRRkkkkkkkRRRRRRRRk.....';

/* A chest, closed and open. */
const CHEST = [
  '................',
  '................',
  '...kkkkkkkkkk...',
  '..kYYYYYYYYYYk..',
  '..kYttttttttYk..',
  '..kYtttttttYYk..',
  '..kkkkkkkkkkkk..',
  '..kYttttttttYk..',
  '..kYtttkktttYk..',
  '..kYtttkktttYk..',
  '..kYttttttttYk..',
  '..kYYYYYYYYYYk..',
  '...kkkkkkkkkk...',
  '................',
  '................',
  '................',
];
const CHEST_OPEN = [
  '................',
  '..kkkkkkkkkkkk..',
  '..kYYYYYYYYYYk..',
  '..kkkkkkkkkkkk..',
  '................',
  '................',
  '..kkkkkkkkkkkk..',
  '..kwwwwwwwwwwk..',
  '..kwwwwwwwwwwk..',
  '..kYttttttttYk..',
  '..kYttttttttYk..',
  '..kYYYYYYYYYYk..',
  '...kkkkkkkkkk...',
  '................',
  '................',
  '................',
];

/* A talking flower (used for the "Hi." joke and the shy flower). */
const TALKFLOWER = [
  '................',
  '................',
  '................',
  '.....ooooo......',
  '....oowwwoo.....',
  '....owykywo.....',
  '....owyyywo.....',
  '....oowwwoo.....',
  '.....ooooo......',
  '.......g........',
  '......gGg.......',
  '....jggGg.......',
  '.....jgGgjj.....',
  '.......Gg.......',
  '.......Gg.......',
  '................',
];
const TALKFLOWER_B = TALKFLOWER.slice();
TALKFLOWER_B[11] = '.....ggGgj......';
TALKFLOWER_B[12] = '....jjgGg.......';

/* ── COLLECTIBLE ICONS (8x8) ─────────────────────────────── */

const ICON_HEART = [
  '.dd..dd.',
  'dDddddDd',
  'dDdddddd',
  'dwddddDd',
  '.dddddd.',
  '..dddd..',
  '...dd...',
  '........',
];
const ICON_STAR = [
  '...y....',
  '...y....',
  '.yyYyy..',
  '..yyy...',
  '.yyYyy..',
  '.y...y..',
  '........',
  '........',
];
const ICON_FLOWER = [
  '..o.o...',
  '.owowo..',
  '.oyyyo..',
  '.owowo..',
  '..o.o...',
  '...g....',
  '..jg....',
  '...g....',
];
const ICON_SOCK = [
  '.wwww...',
  '.wDDw...',
  '.wwww...',
  '.wwww...',
  '.wwww...',
  '.wwwwww.',
  '.wwwwwww',
  '..wwwww.',
];
const ICON_SPARK = [
  '...w....',
  '...w....',
  '.w.w.w..',
  '..wWw...',
  'wwwWwww.',
  '..wWw...',
  '.w.w.w..',
  '...w....',
];

const ICONS = {
  heart:  PX(ICON_HEART),
  star:   PX(ICON_STAR),
  flower: PX(ICON_FLOWER),
  sock:   PX(ICON_SOCK),
  spark:  PX(ICON_SPARK),
};

/* Grey copies for empty HUD slots. */
const ICONS_DIM = {};
for (const key in ICONS) {
  const src = ICONS[key];
  const cv = document.createElement('canvas');
  cv.width = src.width; cv.height = src.height;
  const g = cv.getContext('2d');
  g.drawImage(src, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = '#e6cdd8';
  g.fillRect(0, 0, cv.width, cv.height);
  ICONS_DIM[key] = cv;
}

/* ── TILE ART (16x16, drawn over the grass/floor base) ────── */

const TILEART = {
  tree: [
    '.....GGGGG......',
    '...GGjjjjjGG....',
    '..GjjjggggjjG...',
    '.GjjggggggggjG..',
    '.GjggggggggggG..',
    'GjjggggGGggggjG.',
    'GjggggGGGGggggG.',
    'GjggggggggggggG.',
    '.GggggGGggggggG.',
    '.GGgggggggggGG..',
    '..GGgggggggGG...',
    '....GG.tt.GG....',
    '.......tt.......',
    '......tTTt......',
    '.....tTTTTt.....',
    '....GGGGGGGG....',
  ],
  bigtree: [
    '...GGjjjjjjGG...',
    '..GjjjggggjjjG..',
    '.GjjgggggggggjG.',
    'GjjggggggggggjjG',
    'GjggggGGgggggggG',
    'GjgggGGGGgggggjG',
    'GjggggGGgggggggG',
    'GjggggggggggGggG',
    'GjgggggggggGGggG',
    '.GggggggggggGgG.',
    '.GGgggggggggGG..',
    '..GGGG.tt.GGG...',
    '.......tt.......',
    '......tTTt......',
    '.....tTTTTt.....',
    '....GGGGGGGG....',
  ],
  bush: [
    '................',
    '.....GGGGGG.....',
    '...GGjjjjjjGG...',
    '..GjjggggggjjG..',
    '.GjggggggggggjG.',
    '.GjggggggggggjG.',
    'GjgggggGGgggggjG',
    'GjggggGGGGggggjG',
    'GjgggggGGgggggjG',
    'GjggggggggggggjG',
    '.GjggggggggggjG.',
    '.GGjggggggggjGG.',
    '..GGjjjjjjjjGG..',
    '...GGGGGGGGGG...',
    '.....GGGGGG.....',
    '................',
  ],
  /* plaster cottage wall with timber beams */
  wall: [
    'CCCCCCCCCCCCCCCC',
    'CccccccccccccccC',
    'CccccccccccccccC',
    'CtttttttttttttcC',
    'CccccccccccccccC',
    'CccccccccccccccC',
    'CccccccccccccccC',
    'CtttttttttttttcC',
    'CccccccccccccccC',
    'CccccccccccccccC',
    'CccccccccccccccC',
    'CtttttttttttttcC',
    'CccccccccccccccC',
    'CccccccccccccccC',
    'CccccccccccccccC',
    'kkkkkkkkkkkkkkkk',
  ],
  /* same wall, with a window */
  window: [
    'CCCCCCCCCCCCCCCC',
    'CccccccccccccccC',
    'CckkkkkkkkkkkccC',
    'CcktttttttttkccC',
    'CcktuuuutuuukccC',
    'CcktuuuutuuukccC',
    'CcktttttttttkccC',
    'CcktuuuutuuukccC',
    'CcktuuuutuuukccC',
    'CcktttttttttkccC',
    'CckkkkkkkkkkkccC',
    'CccccccccccccccC',
    'CtttttttttttttcC',
    'CccccccccccccccC',
    'CccccccccccccccC',
    'kkkkkkkkkkkkkkkk',
  ],
  /* shingled roof; stacks cleanly with itself */
  roof: [
    'kkkkkkkkkkkkkkkk',
    'kWWWWWWWWWWWWWWk',
    'kddddddddddddddk',
    'kddDddddDddddDdk',
    'kDDDDDDDDDDDDDDk',
    'kddddddddddddddk',
    'kDddddDddddDdddk',
    'kDDDDDDDDDDDDDDk',
    'kddddddddddddddk',
    'kddDddddDddddDdk',
    'kDDDDDDDDDDDDDDk',
    'kddddddddddddddk',
    'kDddddDddddDdddk',
    'kDDDDDDDDDDDDDDk',
    'kkkkkkkkkkkkkkkk',
    'CCCCCCCCCCCCCCCC',
  ],
  door: [
    'cccccccccccccccc',
    'cCCCCCCCCCCCCCCc',
    'cCkkkkkkkkkkkkCc',
    'cCkttttttttttkCc',
    'cCktTTtttttTtkCc',
    'cCkttttttttttkCc',
    'cCktttttttttykCc',
    'cCkttttttttttkCc',
    'cCktTTtttttTtkCc',
    'cCkttttttttttkCc',
    'cCkttttttttttkCc',
    'cCktTTtttttTtkCc',
    'cCkttttttttttkCc',
    'cCkttttttttttkCc',
    'cCkttttttttttkCc',
    'kkkkkkkkkkkkkkkk',
  ],
  fence: [
    '................',
    '................',
    '..t..........t..',
    '..t..........t..',
    'tttttttttttttttt',
    'TTTTTTTTTTTTTTTT',
    '..t..........t..',
    '..t..........t..',
    'tttttttttttttttt',
    'TTTTTTTTTTTTTTTT',
    '..t..........t..',
    '..t..........t..',
    '..T..........T..',
    '................',
    '................',
    '................',
  ],
  sign: [
    '................',
    '..kkkkkkkkkkkk..',
    '..kcccccccccck..',
    '..kckkkckkkckk..',
    '..kcccccccccck..',
    '..kckkkkckkkck..',
    '..kcccccccccck..',
    '..kckkkckkckck..',
    '..kcccccccccck..',
    '..kkkkkkkkkkkk..',
    '......tTTt......',
    '......tTTt......',
    '......tTTt......',
    '......tTTt......',
    '.....GGGGGG.....',
    '................',
  ],
  rock: [
    '................',
    '................',
    '.....kkkkk......',
    '...kkCCCCCkk....',
    '..kCCCCCCCCCk...',
    '..kCCCwwCCCCk...',
    '.kCCCCwwCCCCCk..',
    '.kCCCCCCCCCCCk..',
    '.kCCCCCCCCCCCk..',
    '.kNCCCCCCCCCNk..',
    '..kNNCCCCCNNk...',
    '...kkNNNNNkk....',
    '.....kkkkk......',
    '................',
    '................',
    '................',
  ],
  stairs: [
    'kkkkkkkkkkkkkkkk',
    'kNNNNNNNNNNNNNNk',
    'kNkkkkkkkkkkkkNk',
    'kNkXXXXXXXXXXkNk',
    'kNkXXXXXXXXXXkNk',
    'kNkCCCCCCCCCCkNk',
    'kNkXXXXXXXXXXkNk',
    'kNkCCCCCCCCCCkNk',
    'kNkXXXXXXXXXXkNk',
    'kNkCCCCCCCCCCkNk',
    'kNkXXXXXXXXXXkNk',
    'kNkCCCCCCCCCCkNk',
    'kNkkkkkkkkkkkkNk',
    'kNNNNNNNNNNNNNNk',
    'kkkkkkkkkkkkkkkk',
    '................',
  ],
  gate: [
    '................',
    'kkkkkkkkkkkkkkkk',
    'kGGjGGGjGGGjGGGk',
    'kGjjjGjjjGjjjGGk',
    'kGGjGGGjGGGjGGGk',
    'kjGGGjGGGjGGGjGk',
    'kGGjGGGjGGGjGGGk',
    'kGjjjGjjjGjjjGGk',
    'kGGjGGGjGGGjGGGk',
    'kjGGGjGGGjGGGjGk',
    'kGGjGGGjGGGjGGGk',
    'kGjjjGjjjGjjjGGk',
    'kGGjGGGjGGGjGGGk',
    'kkkkkkkkkkkkkkkk',
    '................',
    '................',
  ],
  /* a fluted stone column; stacks vertically to frame the door */
  shrine: [
    'kCCCCCCCCCCCCCCk',
    'kCWWWWWWWWWWWWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWCWWCWWCWWCWCk',
    'kCWWWWWWWWWWWWCk',
    'kCCCCCCCCCCCCCCk',
    'kkkkkkkkkkkkkkkk',
  ],
  fountain: [
    '................',
    '.....kkkkkk.....',
    '...kkooooookk...',
    '..koodddddookk..',
    '.kooddDDDDddook.',
    '.kodDuuuuuuDdok.',
    '.kodDuwUUwuDdok.',
    '.kodDuUwwUuDdok.',
    '.kodDuwUUwuDdok.',
    '.kodDuuuuuuDdok.',
    '.kooddDDDDddook.',
    '..koodddddookk..',
    '...kkooooookk...',
    '.....kkkkkk.....',
    '................',
    '................',
  ],
  /* a dense bed of blooms -- this is the Pink Kingdom, after all */
  flowerbed: [
    '..o...o.....o...',
    '.owo.owo...owo..',
    '.oyo.oyo...oyo..',
    '..o...o.....o...',
    '..g..jg......g..',
    '..g...g...jg.g..',
    '.jg...g....g.g..',
    '....l....l......',
    '...lwl..lwl...l.',
    '...lyl..lyl..lwl',
    '....l....l...lyl',
    '....g....g....l.',
    '...jg....g...jg.',
    '....g...jg....g.',
    '....g....g....g.',
    '................',
  ],
  present: [
    '................',
    '................',
    '.....ll..ll.....',
    '....l.lll.l.....',
    '.....llllll.....',
    '..kkkkkkkkkkkk..',
    '..kddddkkdddddk.',
    '..kddddkkdddddk.',
    '..kkkkkkkkkkkkk.',
    '..kddddkkdddddk.',
    '..kddddkkdddddk.',
    '..kddddkkdddddk.',
    '..kddddkkdddddk.',
    '..kkkkkkkkkkkkk.',
    '................',
    '................',
  ],
};

/* ── THE GREAT TREE (32x32, split into four 16x16 tiles) ────
   The centrepiece of Isabela's Garden. Placed in the map as
   1 2
   3 4
   ─────────────────────────────────────────────────────────── */
const BIG_TREE = [
  '..........GGGGGGGGGGGG..........',
  '.......GGGjjjjjjjjjjjjGGG.......',
  '.....GGjjjjjggggggggjjjjjGG.....',
  '....GjjjggggggggggggggggjjjG....',
  '...GjjggggggggggggggggggggjjG...',
  '..GjjggggggggGGgggggggggggjjG...',
  '..GjggggggGGGGGGggggggggggggjG..',
  '.GjgggggggGGGGGGGGgggggggggggjG.',
  'GjjggggggggGGGGgggggggggggggggG.',
  'GjgggggggggggggggggggggggggggjG.',
  'GjgggggggGGgggggggGGggggggggggjG',
  'Gjggggggggggggggggggggggggggggjg',
  'GjGggggggggggggggggggggggggggGjG',
  '.Gj' + 'g'.repeat(27) + 'jG',
  '.GjgggggggggGGGGgggggggggggggjG.',
  '..GjggggggggggggggggggggggggjG..',
  '..GggggggggggggggggggggggggggG..',
  '...G' + 'g'.repeat(25) + 'G..',
  '....GGgggggggggggggggggggggGG...',
  '.....GGgggggggggggggggggggGG....',
  '......GGGggggggggggggggGGG......',
  '........GGGGggggggggGGGG........',
  '..........GGGGttttGGGG..........',
  '..............tttt..............',
  '.............tTTttTt............',
  '.............tTTttTt............',
  '............tTTttTTTt...........',
  '...........tTTttTTTTt...........',
  '..........tTTTttTTTTTt..........',
  '........GGtTTTttTTTTTtGG........',
  '......GGGGGGGGGGGGGGGGGGGG......',
  '....GGGGGGGGGGGGGGGGGGGGGGGG....',
];

/* pad/trim to an exact 32 and cut out one quadrant */
function quadrant(rows, qx, qy) {
  const out = [];
  for (let y = 0; y < 16; y++) {
    const r = (rows[qy * 16 + y] || '').padEnd(32, '.').slice(0, 32);
    out.push(r.slice(qx * 16, qx * 16 + 16));
  }
  return out;
}

TILEART.bigTL = quadrant(BIG_TREE, 0, 0);
TILEART.bigTR = quadrant(BIG_TREE, 1, 0);
TILEART.bigBL = quadrant(BIG_TREE, 0, 1);
TILEART.bigBR = quadrant(BIG_TREE, 1, 1);

/* Bake all tile art. */
const TILES = {};
for (const key in TILEART) TILES[key] = PX(TILEART[key]);

const SPRITES = {
  frog:        [PX(FROG), PX(FROG_B)],
  beige:       [PX(BEIGE_ONE), PX(BEIGE_ONE_B)],
  boss:        [PX(BOSS), PX(BOSS_B)],
  chest:       PX(CHEST),
  chestOpen:   PX(CHEST_OPEN),
  talkflower:  [PX(TALKFLOWER), PX(TALKFLOWER_B)],
};
