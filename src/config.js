/* ============================================================
   config.js  --  ALL THE EDITABLE CONTENT LIVES HERE
   ------------------------------------------------------------
   Nothing in this file is engine code. Change names, jokes,
   counts and the final message freely; the game reads it all
   at runtime.
   ============================================================ */

const CONFIG = {
  /* Who the game is for. Used everywhere in text via {HER}. */
  heroName: 'ISABELA',

  /* How much optimism must be recovered. */
  targets: { hearts: 7, stars: 5, flowers: 3 },

  /* Gates: how much you need before certain doors open. */
  gates: {
    strawberryField: { stars: 3 },   // the suspicious gate east of the garden
    shrineDoor:      { hearts: 7, stars: 5, flowers: 3 },
  },

  /* Feel. */
  playerSpeed: 1.35,        // pixels per frame at 60fps
  runMultiplier: 1.75,      // how much faster B / SHIFT makes you
  textSpeed: 1.6,           // characters per frame
  startArea: 'village',
  startTile: { x: 6, y: 5 },
};

/* ── THE FINAL MESSAGE ───────────────────────────────────────
   Replace the placeholder lines below with the real thing.
   Each string is one dialogue box. Keep them short-ish; the
   box fits roughly 3 lines of ~34 characters.
   ─────────────────────────────────────────────────────────── */
const FINAL_MESSAGE = [
  '[INSERT PERSONAL MESSAGE TO ISABELA HERE]',
  '[LINE TWO -- a memory, a date, an inside joke]',
  '[LINE THREE -- the sincere one]',
];

/* ── QUEST LOG LINES ─────────────────────────────────────── */
const QUESTS = {
  start:      'Explore. Talk to everyone. Collect hearts, stars and flowers.',
  gathering:  'Keep collecting: 7 hearts, 5 stars, 3 flowers.',
  field:      'A gate east of the garden smells of strawberry.',
  shrine:     'All collected! Head east past the woods to the shrine.',
  boss:       'Something beige is blocking the shrine.',
  garden:     'The shrine door is open. Go through it.',
  done:       'You found the Heart.',
};

/* ── DIALOGUE ────────────────────────────────────────────────
   DIALOGUE[key] = [ step, step, ... ]

   step forms:
     { who:'NAME', text:'...' }        a spoken box
     { text:'...' }                    a narrator box (no name)
     { cmd:'shake' }                   screen shake
     { cmd:'flash' }                   white flash
     { cmd:'sfx',  name:'secret' }     play a sound effect
     { cmd:'music', name:'isabela' }   change the music
     { cmd:'give', item:'sock' }       award an item (see ITEMS)
     { cmd:'secret', id:'...' }        count a secret as discovered
     { cmd:'quest', text:'...' }       rewrite the quest log
     { cmd:'flag',  id:'...' }         set a story flag
     { cmd:'boss' }                    start the boss sequence
     { cmd:'ending' }                  roll the ending
     { cmd:'goto', key:'other' }       jump to another script
     { cmd:'choice', prompt:'..',
       options:[{label:'..', key:'..'}] }
   ─────────────────────────────────────────────────────────── */
const DIALOGUE = {

  /* ── opening ─────────────────────────────────────────── */
  intro: [
    { text: 'The kingdom of Bellavista woke up gray.' },
    { text: 'The Heart of the Pink Kingdom is gone.' },
    { who: 'VILLAGER', text: 'You! You look unemployed. Find the Heart.' },
    { who: '{HER}', text: 'Where is it?' },
    { who: 'VILLAGER', text: 'I have absolutely no idea.' },
    { text: 'The villager walks away with great confidence.' },
    { text: 'HOW TO BE A HERO:' },
    { text: 'MOVE with the arrows, WASD, or the D-pad.' },
    { text: 'When a yellow [A] tag pops up, press A.' },
    { text: 'That is talking, reading, opening and searching.' },
    { text: 'White arrows at the edges are ways out. Use them.' },
    { text: 'Find 7 hearts, 5 stars and 3 flowers. Then the shrine.' },
    { text: 'Go on. Be curious. That is the whole job.' },
    { cmd: 'quest', text: QUESTS.start },
  ],

  /* ── Bellavista Village ──────────────────────────────── */
  villager_useless: [
    { who: 'VILLAGER', text: 'No.' },
    { who: '{HER}', text: 'I have not asked anything yet.' },
    { who: 'VILLAGER', text: 'Saving us both time.' },
  ],
  villager_useless_2: [
    { who: '{HER}', text: 'Have you seen the missing Heart?' },
    { who: 'VILLAGER', text: 'No.' },
    { who: '{HER}', text: 'Do you know where it went?' },
    { who: 'VILLAGER', text: 'No.' },
    { who: '{HER}', text: 'Do you know anything?' },
    { who: 'VILLAGER', text: 'No.' },
    { text: 'The villager walks away. Somehow they are still here.' },
  ],

  knight: [
    { who: 'RETIRED KNIGHT', text: 'I once fought SEVEN HUNDRED monsters.' },
    { cmd: 'choice', prompt: 'Believe him?', options: [
      { label: 'YES, SIR', key: 'knight_yes' },
      { label: 'SEVEN HUNDRED?', key: 'knight_no' },
    ]},
  ],
  knight_yes: [
    { who: 'RETIRED KNIGHT', text: 'A hero AND polite. Take this.' },
    { cmd: 'give', item: 'sock' },
    { who: 'RETIRED KNIGHT', text: 'It is one sock. Do not ask.' },
    { cmd: 'flag', id: 'knightDone' },
  ],
  knight_no: [
    { who: 'RETIRED KNIGHT', text: '...' },
    { who: 'RETIRED KNIGHT', text: 'Okay, maybe seven.' },
    { who: 'RETIRED KNIGHT', text: 'Maybe one. It was a large moth.' },
    { who: 'RETIRED KNIGHT', text: 'Here. For your honesty.' },
    { cmd: 'give', item: 'sock' },
    { who: 'RETIRED KNIGHT', text: 'It is one sock. Do not ask.' },
    { cmd: 'flag', id: 'knightDone' },
  ],
  knight_after: [
    { who: 'RETIRED KNIGHT', text: 'The moth is still out there. Somewhere.' },
  ],

  frog: [
    { who: 'ROYAL FROG', text: 'Halt. You address royalty.' },
    { who: '{HER}', text: 'You are a frog.' },
    { who: 'ROYAL FROG', text: 'ROYAL frog. It is on my paperwork.' },
    { who: 'ROYAL FROG', text: 'I have resigned, by the way. Morale.' },
    { who: 'ROYAL FROG', text: 'Advice: the world keeps things BEHIND things.' },
    { cmd: 'quest', text: QUESTS.gathering },
  ],
  frog_after: [
    { who: 'ROYAL FROG', text: 'Behind things. I said what I said.' },
  ],

  merchant: [
    { who: 'STRAWBERRY MERCHANT', text: 'Welcome! I sell strawberries.' },
    { who: '{HER}', text: 'How many do you have?' },
    { who: 'STRAWBERRY MERCHANT', text: 'One.' },
    { who: '{HER}', text: 'May I buy it?' },
    { who: 'STRAWBERRY MERCHANT', text: 'No. It is emotionally important.' },
  ],
  merchant_after: [
    { who: 'STRAWBERRY MERCHANT', text: 'Still one. Still emotional.' },
  ],
  merchant_boss: [
    { who: 'STRAWBERRY MERCHANT', text: 'You met my strawberry, then.' },
    { who: 'STRAWBERRY MERCHANT', text: 'It gets like that. It is a phase.' },
  ],

  /* ── The Pink Garden ─────────────────────────────────── */
  gardener_1: [
    { who: 'THE GARDENER', text: 'The flowers did not die, you know.' },
    { who: 'THE GARDENER', text: 'They just stopped seeing the point.' },
    { who: 'THE GARDENER', text: 'Bring back enough small good things...' },
    { who: 'THE GARDENER', text: '...and the point comes back on its own.' },
    { cmd: 'quest', text: QUESTS.gathering },
    { cmd: 'flag', id: 'metGardener' },
  ],
  gardener_2: [
    { who: 'THE GARDENER', text: 'You are collecting well.' },
    { who: 'THE GARDENER', text: 'Strange. The kingdom feels warmer already.' },
    { who: 'THE GARDENER', text: 'Almost like it is not the Heart doing it.' },
  ],
  gardener_3: [
    { who: 'THE GARDENER', text: 'I planted the far garden a long time ago.' },
    { who: 'THE GARDENER', text: 'For someone who had not arrived yet.' },
    { who: '{HER}', text: 'Who?' },
    { who: 'THE GARDENER', text: 'You will recognise the place. Go on.' },
    { cmd: 'quest', text: QUESTS.shrine },
  ],

  /* ── signs ───────────────────────────────────────────── */
  sign_village: [
    { text: 'BELLAVISTA VILLAGE' },
    { text: 'POPULATION: ENOUGH' },
    { text: 'OPTIMISM: 27% (WAS 100%)' },
  ],
  sign_woods: [
    { text: 'WARNING' },
    { text: 'DANGEROUS FOREST AHEAD' },
    { text: 'TURN BACK. TRULY. WE MEAN IT.' },
  ],
  sign_pond: [
    { text: 'SPARKLE POND' },
    { text: 'NO SWIMMING. NO REASON GIVEN.' },
  ],
  sign_path: [
    { text: 'THE FLOWER PATH' },
    { text: 'IT IS A PATH. THERE ARE FLOWERS.' },
    { text: 'THE SIGN BUDGET WAS SPENT ON THIS SIGN.' },
  ],
  sign_field: [
    { text: 'SECRET STRAWBERRY FIELD' },
    { text: 'IT IS NOT A SECRET IF YOU SIGNPOST IT.' },
    { text: '-- ANONYMOUS COMPLAINT, FILED, IGNORED' },
  ],
  sign_shrine: [
    { text: 'HEART SHRINE' },
    { text: 'PLEASE BE SINCERE BEYOND THIS POINT.' },
  ],

  /* ── the one flower in the dangerous forest ──────────── */
  scary_flower: [
    { who: 'A FLOWER', text: 'Hi.' },
    { text: 'That is it. That is the dangerous forest.' },
    { cmd: 'secret', id: 'flowerHi' },
  ],
  scary_flower_after: [
    { who: 'A FLOWER', text: 'Hi again.' },
  ],

  /* ── the three-touch flower ──────────────────────────── */
  shy_flower_1: [ { who: 'A SHY FLOWER', text: '...' } ],
  shy_flower_2: [ { who: 'A SHY FLOWER', text: '...!' } ],
  shy_flower_3: [
    { who: 'A SHY FLOWER', text: 'Okay, fine. I saw who took the Heart.' },
    { who: 'A SHY FLOWER', text: 'It was nobody. It left on its own.' },
    { who: 'A SHY FLOWER', text: 'It said it was needed somewhere realer.' },
    { cmd: 'sfx', name: 'secret' },
    { cmd: 'secret', id: 'shyFlower' },
  ],
  shy_flower_after: [ { who: 'A SHY FLOWER', text: 'I have said too much.' } ],

  /* ── chests & finds ──────────────────────────────────── */
  chest_sock: [
    { cmd: 'sfx', name: 'chest' },
    { text: 'The chest opens with tremendous ceremony.' },
    { text: 'Inside: ONE SOCK.' },
    { text: 'You found the missing sock.' },
    { cmd: 'give', item: 'sock' },
    { text: 'QUEST UPDATED:  [check] SOCK RECOVERED' },
    { text: 'Nobody ever explains why this mattered.' },
    { cmd: 'secret', id: 'sockChest' },
  ],

  cellar_note: [
    { text: 'A note, under the village, in careful handwriting.' },
    { text: '"If you are reading this, you went looking."' },
    { text: '"Good. That was always the point."' },
    { cmd: 'sfx', name: 'secret' },
    { cmd: 'secret', id: 'cellarNote' },
  ],

  hidden_message: [
    { text: 'Words are scratched into the old tree.' },
    { text: 'FOR {HER} -- WHO MAKES GRAY PLACES PINK' },
    { cmd: 'sfx', name: 'secret' },
    { cmd: 'secret', id: 'treeMessage' },
  ],

  pond_reflection: [
    { text: 'You look into the Sparkle Pond.' },
    { text: 'The pond looks back, politely.' },
    { text: 'It has nothing to add, but it is glad you came.' },
    { cmd: 'secret', id: 'pondLook' },
  ],

  fountain: [
    { text: 'The fountain is dry. A tiny sign says:' },
    { text: '"OUT OF ORDER -- MISSING HEART, OBVIOUSLY"' },
  ],
  fountain_fixed: [
    { text: 'The fountain runs pink again.' },
    { text: 'Nobody repaired it. It simply cheered up.' },
  ],

  /* ── gates ───────────────────────────────────────────── */
  gate_field_locked: [
    { text: 'A vine gate. It smells overwhelmingly of strawberry.' },
    { who: 'THE GATE', text: 'Three stars. That is the whole policy.' },
  ],
  gate_field_open: [
    { cmd: 'sfx', name: 'unlock' },
    { who: 'THE GATE', text: 'Three stars. Excellent. Go be curious.' },
    { cmd: 'quest', text: QUESTS.field },
  ],
  gate_shrine_locked: [
    { text: 'The shrine door is shut.' },
    { text: 'Carved above it: 7 HEARTS  5 STARS  3 FLOWERS' },
    { text: 'The kingdom is not optimistic enough yet.' },
  ],
  gate_shrine_open: [
    { cmd: 'sfx', name: 'unlock' },
    { text: 'The carvings light up, one by one.' },
    { text: 'The shrine door opens.' },
    { cmd: 'quest', text: QUESTS.shrine },
  ],

  /* ── The Beige Ones ──────────────────────────────────── */
  beige_1: [
    { who: 'A BEIGE ONE', text: 'Halt. I am removing this area\'s personality.' },
    { who: '{HER}', text: 'Why?' },
    { who: 'A BEIGE ONE', text: 'It is a lot. Some of us prefer a calm taupe.' },
    { text: 'You sparkle at it, gently.' },
    { cmd: 'sfx', name: 'sparkle' },
    { who: 'A BEIGE ONE', text: 'AGH. Colour. Fine. FINE. I am leaving.' },
  ],
  beige_2: [
    { who: 'A BEIGE ONE', text: 'BEIGE BLAST!' },
    { text: 'Nothing happens. It was a very mild blast.' },
    { who: 'A BEIGE ONE', text: 'BORING CLOUD!' },
    { text: 'You yawn on purpose to be encouraging.' },
    { who: 'A BEIGE ONE', text: 'That was patronising. I am going home.' },
    { cmd: 'sfx', name: 'sparkle' },
  ],
  beige_3: [
    { who: 'A BEIGE ONE', text: 'UNINSPIRED WIND!' },
    { text: 'A slightly cool draught. Your hair moves one pixel.' },
    { who: 'A BEIGE ONE', text: 'I trained four years for that.' },
    { who: '{HER}', text: 'It was a good draught.' },
    { who: 'A BEIGE ONE', text: '...thank you. Nobody ever says that.' },
    { cmd: 'sfx', name: 'sparkle' },
    { cmd: 'secret', id: 'kindToBeige' },
  ],

  /* ── the boss ────────────────────────────────────────── */
  boss_intro: [
    { cmd: 'music', name: 'none' },
    { text: 'The ground trembles.' },
    { cmd: 'shake' },
    { text: 'Something enormous casts a shadow over the shrine.' },
    { cmd: 'shake' },
    { cmd: 'flash' },
    { cmd: 'boss' },
  ],
  boss_reveal: [
    { who: '???', text: 'You should not have come here.' },
    { who: '{HER}', text: 'You are a strawberry.' },
    { who: 'THE FINAL BOSS', text: 'I am a SLIGHTLY ANGRY strawberry.' },
    { who: 'THE FINAL BOSS', text: 'I hid the Heart. Obviously. Look at me.' },
    { text: 'Press A to sparkle at the strawberry.' },
  ],
  boss_hit_1: [ { who: 'THE FINAL BOSS', text: 'Stop being delightful at me.' } ],
  boss_hit_2: [ { who: 'THE FINAL BOSS', text: 'I said STOP. It is working. Stop.' } ],
  boss_hit_3: [
    { who: 'THE FINAL BOSS', text: 'Fine! FINE. I did not hide it.' },
    { who: 'THE FINAL BOSS', text: 'It left. I only watched it go.' },
    { who: 'THE FINAL BOSS', text: 'It went somewhere it was needed more.' },
    { who: 'THE FINAL BOSS', text: 'Go on. Through the flowers.' },
    { cmd: 'flag', id: 'bossDone' },
    { cmd: 'quest', text: QUESTS.garden },
    { cmd: 'music', name: 'overworld' },
  ],
  boss_after: [
    { who: 'A CALM STRAWBERRY', text: 'I am working on myself now.' },
  ],

  /* ── the reveal ──────────────────────────────────────── */
  reveal: [
    { cmd: 'music', name: 'isabela' },
    { who: 'THE GARDENER', text: 'There you are.' },
    { who: 'THE GARDENER', text: 'You spent all this time looking for the Heart.' },
    { text: '...' },
    { who: 'THE GARDENER', text: 'Maybe you were looking in the wrong place.' },
    { who: '{HER}', text: 'Then where is it?' },
    { who: 'THE GARDENER', text: 'It has been walking around the kingdom all day.' },
    { who: 'THE GARDENER', text: 'Cheering up frogs. Being kind to Beige Ones.' },
    { who: 'THE GARDENER', text: 'The Heart of the Pink Kingdom is {HER}.' },
    { cmd: 'flash' },
    { cmd: 'goto', key: 'final_message' },
  ],
  final_message: [
    /* FINAL_MESSAGE lines get spliced in here at runtime. */
    { cmd: 'ending' },
  ],
};

/* ── ITEMS ───────────────────────────────────────────────── */
const ITEMS = {
  sock: { name: 'ONE SOCK', blurb: 'Emotionally significant. Unexplained.' },
};

/* ── AREA NAMES (shown on the title card of each screen) ──── */
const AREA_NAMES = {
  village:    'BELLAVISTA VILLAGE',
  garden:     'THE PINK GARDEN',
  flowerpath: 'THE FLOWER PATH',
  pond:       'THE SPARKLE POND',
  woods:      'THE FORGOTTEN WOODS',
  strawberry: 'SECRET STRAWBERRY FIELD',
  cellar:     'UNDER THE VILLAGE',
  shrine:     'THE HEART SHRINE',
  isabela:    "{HER}'S GARDEN",
};

/* ── ENDING CARD ─────────────────────────────────────────── */
const ENDING_TEXT = {
  title:   'QUEST COMPLETE',
  line1:   'YOU FOUND THE HEART.',
  subject: "{HER}'S HEART",
  ending:  'ENDING 01 -- THE GOOD ENDING',
  thanks:  'THANK YOU FOR PLAYING.',
  signoff: 'MADE FOR {HER}',
};

/* Substitute {HER} (and any future tokens) into a string. */
function T(str) {
  return String(str).replace(/\{HER\}/g, CONFIG.heroName);
}
