/* ============================================================
   maps.js  --  the kingdom, as data
   ------------------------------------------------------------
   Each area is one NES screen: 16 x 14 tiles of 16px = 256x224.

   TILE LEGEND
     .  grass          ,  grass with a tuft     f  flower bed
     p  path           _  cellar floor          x  void / wall
     #  tree           T  big tree              A  tree you can walk BEHIND
     b  bush           o  rock                  =  fence
     H  house wall     R  roof                  D  door
     h  wall + window  S  signpost              U  fountain
     $  shrine column  ~  water                 ^  stairs
     g  gate (opens when a condition is met)
     1 2 / 3 4  the four quadrants of the Great Tree
   ============================================================ */

const SOLID = new Set(['#', 'T', 'b', 'o', '=', 'H', 'h', 'R', 'D', 'S', 'U', '$', 'g', 'x', '~',
                       '1', '2', '3', '4']);

const AREAS = {

  /* ══ 1. BELLAVISTA VILLAGE ══════════════════════════════ */
  village: {
    theme: 'overworld',
    ground: { grass: '#8fd08a', grass2: '#7abd77', path: '#f2d8bd', path2: '#e6c6a6' },
    tiles: [
      '################',
      '#..,.RRRR.,..,.#',
      '#.,..RRRR....,.#',
      '#....hHDh..,...#',
      '#,..f.pp.f.U,..#',
      '#....ppp.....,.#',
      '#.f..ppppppppppp',
      '#,...ppppppppppp',
      '#..f.ppp...,...#',
      '#....p^p..RRRR.#',
      '#.,..ppp..hHDh.#',
      '#..S.ppp....,..#',
      '#....ppp.,.f...#',
      '######pp########',
    ],
    exits: {
      east:  { to: 'garden',     entry: { x: 1,  y: 6  } },
      south: { to: 'flowerpath', entry: { x: 6,  y: 1  } },
    },
    portals: [ { x: 6, y: 9, to: 'cellar', entry: { x: 7, y: 8 }, sfx: 'stairs' } ],
    npcs: [
      { id: 'villager', x: 8,  y: 4,  dir: 'down',
        look: { hair: '#9d7fd6', body: '#cdb4ff', shade: '#9d7fd6', accent: '#fff' },
        script: (st) => st.talked.villager ? 'villager_useless_2' : 'villager_useless' },
      { id: 'knight',   x: 11, y: 11, dir: 'left',
        look: { hair: '#9d8b74', body: '#c9b79a', shade: '#9d8b74', accent: '#ffe04f' },
        script: (st) => st.flags.knightDone ? 'knight_after' : 'knight' },
      { id: 'frog',     x: 2,  y: 8,  dir: 'right', sprite: 'frog',
        script: (st) => st.talked.frog ? 'frog_after' : 'frog' },
      { id: 'merchant', x: 12, y: 5,  dir: 'left',
        look: { hair: '#c0203f', body: '#ff8fbe', shade: '#d3216b', accent: '#5fbf6a' },
        script: (st) => st.flags.bossDone ? 'merchant_boss'
                      : st.talked.merchant ? 'merchant_after' : 'merchant' },
    ],
    objects: [
      { x: 3,  y: 11, tile: true, script: 'sign_village' },
      { x: 11, y: 4,  tile: true, script: (st) => st.flags.bossDone ? 'fountain_fixed' : 'fountain' },
      { x: 7,  y: 3,  tile: true, script: 'door_locked' },
      { x: 12, y: 10, tile: true, script: 'door_locked' },
    ],
    items: [
      { type: 'star',  id: 'star_village',  x: 14, y: 12 },
      { type: 'heart', id: 'heart_village', x: 1,  y: 1  },
    ],
  },

  /* ══ 2. THE PINK GARDEN ═════════════════════════════════ */
  garden: {
    theme: 'overworld',
    ground: { grass: '#96d99b', grass2: '#7fc785', path: '#ffd9ea', path2: '#ffc4de' },
    tiles: [
      '################',
      '#ff.f.ff..f.ff.#',
      '#.fbb.f.bb.f.b.#',
      '#f.f.ff..ff.ff.#',
      '#ff..fb..bf..ff#',
      '#.ff.f.ff.f.ff.#',
      ',..f.ff..ff.f.fg',
      ',.ff.f.b..f.ff.g',
      '#ff.f.ff..f.f.f#',
      '#.fb.ff.f.ff.b.#',
      '#f.f.f.ff.f.ff.#',
      '#ff.fb.f.b.f.ff#',
      '#.ff.f.ff..ff.f#',
      '######..########',
    ],
    exits: {
      west:  { to: 'village', entry: { x: 14, y: 6 } },
      south: { to: 'pond',    entry: { x: 6,  y: 1 } },
    },
    gates: [
      { x: 15, y: 6, need: 'strawberryField', to: 'strawberry', entry: { x: 1, y: 6 },
        locked: 'gate_field_locked', open: 'gate_field_open' },
      { x: 15, y: 7, need: 'strawberryField', to: 'strawberry', entry: { x: 1, y: 7 },
        locked: 'gate_field_locked', open: 'gate_field_open' },
    ],
    npcs: [
      { id: 'gardener', x: 10, y: 9, dir: 'down',
        look: { hair: '#8f5230', body: '#8fe3c8', shade: '#4fb99a', accent: '#ffe04f' },
        script: (st) => !st.flags.metGardener ? 'gardener_1'
                      : (st.hearts + st.stars + st.flowers >= 8 ? 'gardener_3' : 'gardener_2') },
    ],
    objects: [
      { x: 5, y: 3, sprite: 'talkflower',
        script: (st) => {
          const n = (st.counters.shyFlower || 0);
          if (n === 0) return 'shy_flower_1';
          if (n === 1) return 'shy_flower_2';
          if (n === 2) return 'shy_flower_3';
          return 'shy_flower_after';
        },
        onTalk: (st) => { st.counters.shyFlower = (st.counters.shyFlower || 0) + 1; } },
    ],
    items: [
      { type: 'heart',  id: 'heart_garden',  x: 13, y: 12 },
      { type: 'star',   id: 'star_garden',   x: 1,  y: 5  },
      { type: 'flower', id: 'flower_garden', x: 8,  y: 12 },
    ],
  },

  /* ══ 3. THE FLOWER PATH ═════════════════════════════════ */
  flowerpath: {
    theme: 'overworld',
    ground: { grass: '#8fd08a', grass2: '#7abd77', path: '#f2d8bd', path2: '#e6c6a6' },
    tiles: [
      '######pp########',
      '#..f..pp..,..f.#',
      '#....,ppp......#',
      '#.b...ppp...b..#',
      '#..,...ppp..,..#',
      '#.f.....pppp..f#',
      '#..,......ppppp.',
      '#...b.....ppppp.',
      '#.,....S....,..#',
      '#..f.......f...#',
      '#....b...b.....#',
      '#.,..f...f..,..#',
      '#..f.........f.#',
      '################',
    ],
    exits: {
      north: { to: 'village', entry: { x: 6,  y: 12 } },
      east:  { to: 'pond',    entry: { x: 1,  y: 6  } },
    },
    objects: [
      { x: 7, y: 8, tile: true, script: 'sign_path' },
    ],
    items: [
      { type: 'heart', id: 'heart_path', x: 2,  y: 12 },
      { type: 'star',  id: 'star_path',  x: 14, y: 1  },
    ],
  },

  /* ══ 4. THE SPARKLE POND ════════════════════════════════ */
  pond: {
    theme: 'overworld',
    ground: { grass: '#8ad4a6', grass2: '#74c092', path: '#f2d8bd', path2: '#e6c6a6' },
    tiles: [
      '######pp########',
      '#..,..pp..,....#',
      '#.b...pp....b..#',
      '#.....pp~~~~~..#',
      '#.,...pp~~~~~~.#',
      '#.....pp~~~~~~.#',
      '.ppppppp~~~~~~.#',
      '.ppppppp~~~~~~.#',
      '#.....pp~~~~~~.#',
      '#..,..pp~~~~~..#',
      '#.....pppppppppp',
      '#.b...pppppppppp',
      '#.,...,..,..f..#',
      '################',
    ],
    exits: {
      north: { to: 'garden',     entry: { x: 6,  y: 12 } },
      west:  { to: 'flowerpath', entry: { x: 14, y: 6  } },
      east:  { to: 'woods',      entry: { x: 1,  y: 6  } },
    },
    npcs: [
      { id: 'beige_pond', x: 3, y: 12, dir: 'right', sprite: 'beige', vanish: true,
        script: 'beige_3' },
    ],
    objects: [
      { x: 8, y: 5, tile: true, script: 'pond_reflection' },
      { x: 2, y: 1, tile: true, script: 'sign_pond' },
    ],
    items: [
      { type: 'heart', id: 'heart_pond', x: 14, y: 4  },
      { type: 'star',  id: 'star_pond',  x: 1,  y: 10 },
    ],
  },

  /* ══ 5. THE FORGOTTEN WOODS ═════════════════════════════ */
  woods: {
    theme: 'woods',
    ground: { grass: '#6fae7d', grass2: '#5d9a6b', path: '#c9ab8c', path2: '#b1957a' },
    tiles: [
      '################',
      '#..#...#...#..T#',
      '#.#...#...#...##',
      '#...#...#...#..#',
      '#.#...S...#...T#',
      '#...#...#...#..#',
      '.,....,.....,..,',
      '.....#....#....,',
      '#.#...#...#...##',
      '#...#...A..#...#',
      '#.#...#...#...##',
      '#..T..#...#....#',
      '#...#...#...#..#',
      '################',
    ],
    exits: {
      west: { to: 'pond',   entry: { x: 14, y: 10 } },
      east: { to: 'shrine', entry: { x: 1,  y: 6  } },
    },
    npcs: [
      { id: 'beige_woods', x: 3, y: 3, dir: 'down', sprite: 'beige', vanish: true,
        script: 'beige_1' },
      { id: 'beige_woods2', x: 11, y: 10, dir: 'left', sprite: 'beige', vanish: true,
        script: 'beige_2' },
    ],
    objects: [
      { x: 6, y: 4,  tile: true, script: 'sign_woods' },
      { x: 8, y: 6,  sprite: 'talkflower',
        script: (st) => st.secrets.flowerHi ? 'scary_flower_after' : 'scary_flower' },
      { x: 14, y: 1, tile: true, script: 'hidden_message' },
    ],
    items: [
      { type: 'heart',  id: 'heart_woods',  x: 8,  y: 9, secret: 'behindTree' },
      { type: 'star',   id: 'star_woods',   x: 1,  y: 12 },
      { type: 'flower', id: 'flower_woods', x: 14, y: 12 },
    ],
  },

  /* ══ 6. THE SECRET STRAWBERRY FIELD ═════════════════════ */
  strawberry: {
    theme: 'overworld',
    ground: { grass: '#9ede97', grass2: '#86cb80', path: '#ffd2b8', path2: '#f0bd9f' },
    tiles: [
      '################',
      '#.b.b.b.b.b.b..#',
      '#,..,.....,..,.#',
      '#.b.b.b.b.b.b..#',
      '#..,....S...,..#',
      '#.b.b.b.b.b.b..#',
      ',..............#',
      ',..............#',
      '#.b.b.b.b.b.b..#',
      '#..,.......,...#',
      '#.b.b.b.b.b.b..#',
      '#,...,....,...,#',
      '#.b.b.b.b.b.b..#',
      '################',
    ],
    exits: {
      west: { to: 'garden', entry: { x: 14, y: 6 } },
    },
    objects: [
      { x: 8, y: 4, tile: true, script: 'sign_field' },
      { x: 7, y: 7, sprite: 'chest', once: true, script: 'chest_sock' },
    ],
    items: [
      { type: 'heart',  id: 'heart_field',  x: 14, y: 11 },
      { type: 'flower', id: 'flower_field', x: 1,  y: 9  },
    ],
  },

  /* ══ 7. UNDER THE VILLAGE (secret room) ═════════════════ */
  cellar: {
    theme: 'cellar',
    ground: { grass: '#6b5a70', grass2: '#5d4d62', path: '#8a7690', path2: '#7a6880' },
    tiles: [
      'xxxxxxxxxxxxxxxx',
      'xxxxxxxxxxxxxxxx',
      'xxxx________xxxx',
      'xxxx________xxxx',
      'xxx__________xxx',
      'xxx__________xxx',
      'xxx____^_____xxx',
      'xxx__________xxx',
      'xxx__________xxx',
      'xxxx________xxxx',
      'xxxx________xxxx',
      'xxxxxxxxxxxxxxxx',
      'xxxxxxxxxxxxxxxx',
      'xxxxxxxxxxxxxxxx',
    ],
    exits: {},
    portals: [ { x: 7, y: 6, to: 'village', entry: { x: 6, y: 10 }, sfx: 'stairs' } ],
    objects: [
      { x: 5, y: 3, sprite: 'present', script: 'cellar_note' },
    ],
    items: [
      { type: 'heart', id: 'heart_cellar', x: 10, y: 9, secret: 'cellarHeart' },
    ],
  },

  /* ══ 8. THE HEART SHRINE ════════════════════════════════ */
  shrine: {
    theme: 'overworld',
    ground: { grass: '#8fd08a', grass2: '#7abd77', path: '#ffe9d0', path2: '#f0d5b8' },
    tiles: [
      '#####$gg$#######',
      '#....$..$......#',
      '#....pppp......#',
      '#.b..pppp..b...#',
      '#.....pp.......#',
      '#..,..pp..,....#',
      '.ppppppp.......#',
      '.pppppp........#',
      '#.....pp.......#',
      '#..b..pp...b...#',
      '#.....pp.......#',
      '#..,..S...,....#',
      '#..............#',
      '################',
    ],
    exits: {
      west: { to: 'woods', entry: { x: 14, y: 6 } },
    },
    gates: [
      { x: 6, y: 0, need: 'shrineDoor', to: 'isabela', entry: { x: 7, y: 12 },
        locked: 'gate_shrine_locked', open: 'gate_shrine_open', boss: true },
      { x: 7, y: 0, need: 'shrineDoor', to: 'isabela', entry: { x: 8, y: 12 },
        locked: 'gate_shrine_locked', open: 'gate_shrine_open', boss: true },
    ],
    objects: [
      { x: 6, y: 11, tile: true, script: 'sign_shrine' },
    ],
    items: [],
  },

  /* ══ 9. ISABELA'S GARDEN ════════════════════════════════ */
  isabela: {
    theme: 'isabela',
    ground: { grass: '#a8e8a4', grass2: '#93da92', path: '#ffe3f0', path2: '#ffd0e6' },
    tiles: [
      '################',
      '#f.,~~~~~~~~,.f#',
      '#..f~~~~~~~~f..#',
      '#f...,....,...f#',
      '#..f...12...f..#',
      '#f....,34,....f#',
      '#..f........f..#',
      '#....f....f....#',
      '#f..,......,..f#',
      '#..f..f..f..f..#',
      '#f,..........,f#',
      '#..f...ff...f..#',
      '#f..,......,..f#',
      '#######..#######',
    ],
    exits: {},
    npcs: [
      { id: 'gardener_final', x: 7, y: 7, dir: 'down',
        look: { hair: '#8f5230', body: '#8fe3c8', shade: '#4fb99a', accent: '#ffe04f' },
        script: 'reveal', autoTalk: true },
    ],
    objects: [],
    items: [],
  },
};

/* A few small scripts that belong to the map rather than a character. */
DIALOGUE.door_locked = [
  { text: 'The door is locked.' },
  { text: 'Through it, someone is very obviously napping.' },
];

/* Normalise every row to exactly 16 characters, so a typo in the
   art above degrades into grass instead of breaking the world. */
(function normaliseAreas() {
  for (const key in AREAS) {
    const a = AREAS[key];
    a.key = key;
    a.tiles = a.tiles.map(row => {
      if (row.length > 16) return row.slice(0, 16);
      const fill = a.theme === 'cellar' ? 'x' : '.';
      return row + fill.repeat(16 - row.length);
    });
    while (a.tiles.length < 14) a.tiles.push((a.theme === 'cellar' ? 'x' : '#').repeat(16));
    a.tiles.length = 14;
    a.npcs = a.npcs || [];
    a.objects = a.objects || [];
    a.items = a.items || [];
    a.gates = a.gates || [];
    a.portals = a.portals || [];
    a.exits = a.exits || {};
  }
})();

const MAP_W = 16, MAP_H = 14, TILE = 16;
