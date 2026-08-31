# ISABELA AND THE LOST HEART OF THE PINK KINGDOM

A tiny lost NES game from about 1993 that happens to be a cute, pink,
optimistic adventure made for Isabela.

Open `index.html` in a browser. That's it — no build step, no server, no
dependencies, and it works fully offline — the fonts ship with it.

```
MOVE     arrow keys / WASD / on-screen D-pad
TALK     SPACE / ENTER / Z / the A button
RUN      hold SHIFT / the B button
SEARCH   face a thing and press A
```

The game tells you what to do as you go:

- a yellow **[A] TALK / LOOK / OPEN** tag pops up over anything you can
  act on, so you never have to guess what's interactive
- **white arrows** at the screen edges show which ways you can leave
- a **padlock** over a gate shows whether you've collected enough yet
- the counter in the top-left corner always shows what you still need

**FULLSCREEN** blows the console up to fill the display. On a phone,
turning it sideways lays the D-pad and buttons out either side of the
screen, like a handheld.

Gather **7 hearts**, **5 stars** and **3 magical flowers**, get past the
thing guarding the shrine, and find out where the Heart actually went.
About 10–15 minutes. There are 8 secrets; you need none of them.

---

## Changing the words

**Everything you'd want to rewrite lives in `src/config.js`.** Nothing else
needs touching.

### The final message

This is the one you came here for. Near the top of `src/config.js`:

```js
const FINAL_MESSAGE = [
  '[INSERT PERSONAL MESSAGE TO ISABELA HERE]',
  '[LINE TWO -- a memory, a date, an inside joke]',
  '[LINE THREE -- the sincere one]',
];
```

Each string is one dialogue box. Roughly **3 lines of 27 characters** fit per
box; add as many boxes as you like. They play through the same retro window
as the rest of the game, right after the reveal and just before the ending.

### Her name

```js
heroName: 'ISABELA',
```

Write `{HER}` anywhere in any line of dialogue and it becomes the name — so
changing this one string updates the whole game, ending card included.

### Any other line

`DIALOGUE` in the same file is a plain object of scripts:

```js
merchant: [
  { who: 'STRAWBERRY MERCHANT', text: 'Welcome! I sell strawberries.' },
  { who: '{HER}',               text: 'How many do you have?' },
  { who: 'STRAWBERRY MERCHANT', text: 'One.' },
],
```

A step is either a spoken box, a narrator box (`{ text: '...' }` with no
`who`), or a command. The commands are documented above `DIALOGUE`; the
useful ones are `shake`, `flash`, `sfx`, `music`, `give`, `secret`, `quest`,
`flag`, `choice` and `goto`.

Choices look like this:

```js
{ cmd: 'choice', prompt: 'Believe him?', options: [
  { label: 'YES, SIR',       key: 'knight_yes' },
  { label: 'SEVEN HUNDRED?', key: 'knight_no' },
]},
```

### How much you need to collect

```js
targets: { hearts: 7, stars: 5, flowers: 3 },
gates: {
  strawberryField: { stars: 3 },
  shrineDoor:      { hearts: 7, stars: 5, flowers: 3 },
},
```

If you raise a target, add matching pickups in `src/maps.js` — the game
counts what's actually placed in the world, not what the config claims.

---

## Changing the world

`src/maps.js` holds all nine screens. Each is 16 × 14 characters, one
character per tile, with the legend at the top of the file:

```js
tiles: [
  '################',
  '#..,.RRRR.,..,.#',
  ...
],
```

Alongside the art, each area lists its `npcs`, `objects`, `items`, `exits`,
`gates` and `portals` as plain data. Rows that come out the wrong length are
padded rather than breaking the world, so it's safe to experiment.

There's a reachability audit worth re-running after map edits — it
flood-fills every screen and reports anything you can no longer walk to.
It lives in the scratchpad rather than the repo; the short version is: if a
collectible stops being reachable, the game is unfinishable, so check by
walking there.

## Changing the look

- `src/sprites.js` — every sprite and tile, hand-authored as a grid of
  characters mapped through `PAL`. Edit `PAL` to reskin the whole game at
  once; edit a grid to redraw one thing.
- `assets/style.css` — the page around the game (cartridge label, CRT
  console, HUD, manual). Colours are CSS variables at the top.

## Sound

`src/audio.js` is a small synthesiser — no audio files. Songs are written as
note strings (`'G4:1 C5:1 E5:1 ...'`) in `SONGS`; sound effects are short
functions in `SFX`. The game runs perfectly with sound off, and stays silent
until the player's first click or keypress, as browsers require.

**If you can't hear anything on an iPhone**, check the physical mute switch
first. iOS routes plain WebAudio through the ringer channel, so a silenced
phone plays a silent game. The code works around this by starting a looping
silent `<audio>` element on first touch, which moves the page into the media
category — but a hardware mute switch still wins on some iOS versions. The
`♪ SOUND` button toggles audio off and on regardless.

## Fonts

Both fonts are checked into `assets/fonts/` and declared with `@font-face`
rather than pulled from Google Fonts. The entire look depends on them, and a
fallback to system monospace ruins it — this way the game renders correctly
offline, on a plane, and with no third-party request. Both are SIL Open Font
License 1.1; see `assets/fonts/OFL.txt`.

## Link previews

`assets/preview.png` is a 1200×630 card generated from the real title screen,
wired up in `index.html` with `og:` and `twitter:` tags. The two absolute
URLs in those tags assume GitHub Pages at
`https://hvndal.github.io/Projectisabela/` — change them if you host it
somewhere else, since link scrapers won't resolve a relative path.

To give the **repository** itself a preview image (the card that shows when
you paste the repo link), upload the same file under
Settings → General → Social preview. That one can't be set from git.

## Layout

```
index.html        page shell
assets/style.css  page styling
src/config.js     ← all the editable content
src/sprites.js    pixel art
src/maps.js       the nine screens
src/audio.js      chiptune synth
src/dialogue.js   the text window
src/game.js       engine: input, collision, rendering, boss, ending
assets/fonts/     the two pixel fonts, self-hosted
assets/preview.png  1200x630 card for link previews
```

Scripts load in that order as plain `<script>` tags — no modules, so the
whole thing runs straight off the filesystem.

---

Made for Isabela ♥
