# HERMANIFY — 8-Bit NES Arcade & Custom Retro Games

**Hermanify** is an authentic 8-bit NES Arcade Hub featuring custom-made retro video games, synthesized Mario-style chiptune sounds, CRT scanlines, and mobile touch support.

Open `index.html` in any browser. That's it — zero build steps, no server required, no dependencies, and fully offline-capable.

---

## 🎮 The Cartridge Lineup

### 1. Cartridge 01: Isabela & the Lost Heart of the Pink Kingdom
The beloved top-down adventure quest!
- 9 hand-crafted areas, dialogue trees, hidden secrets, and the slightly angry strawberry boss.
- Gather 7 hearts, 5 stars, and 3 magical flowers to restore the kingdom.

### 2. Cartridge 02: Herman's Super Plumber (Coin Castle Rush)
Classic 8-bit Super Mario-style side-scrolling platformer:
- Run, jump, and sprint across the Mushroom Kingdom.
- Hit `[?]` Mystery blocks for coins and Super Star invincibility power-ups.
- Smash brick blocks, stomp on Goombas, kick Koopa shells, and conquer the castle flagpole with victory fanfare!

### 3. Cartridge 03: Cyber Tank 1989 (Hermanify Base Defense)
NES Battle City-style armored combat:
- 4-directional tank steering through destructible brick terrain.
- Protect the Hermanify Golden Eagle Base from rogue enemy tank waves.
- Shoot flashing tanks to earn Star cannon upgrades, Grenades, and Shovel base fortification.

### 4. Cartridge 04: Star Guardian 8-Bit (Cosmic Defender)
Vertical arcade space shooter (Galaga / Space Invaders style):
- 3-layer parallax starfield with insectoid alien formations and dive-bomb swoops.
- Upgrade to Triple Spread Lasers and Energy Shields.
- Epic Sector Mothership boss battle!

---

## 🕹️ Controls

```
MOVE / RUN        Arrow keys / WASD / On-screen Touch D-pad
ACTION / TALK     SPACE / ENTER / Z / A Button
SPRINT / SPRINT   Hold SHIFT / X / B Button
EJECT CARTRIDGE   Click "⏏ EJECT / SELECT GAME"
FULLSCREEN        Toggle fullscreen mode
```

---

## 🔊 8-Bit Mario Soundboard & Chiptune Synth

`src/audio.js` synthesizes all sound in real time using the Web Audio API (square pulse waves, triangle basslines, white noise percussion, and frequency ramp pitch glides):
- **Mario Coin Ding**: Dual square wave chime (B5 → E6)
- **Mario Jump**: Frequency pitch slide up (C4 → F5)
- **1-Up Jingle & Flagpole Fanfare**
- **Goomba Stomp, Brick Smash, and Pipe Warp**
- **Tank Cannon & Space Laser Blasts**
- **Interactive Retro Soundboard** on the front page to play live 8-bit sounds!

---

## 📺 CRT Shaders & Visual Filters

Switch between 4 visual display modes on the front page:
- **CRT Color**: Authentic scanlines + phosphor glow + bezel
- **Scanlines FX**: Heavy retro scanline overlay
- **Amber Phosphor**: Classic monochrome CRT terminal amber
- **Game Boy Mono**: 4-shade authentic greenish LCD palette

---

## 📁 Project Architecture

```
index.html            Hermanify Arcade front page & console shell
assets/style.css      Arcade styling, cartridge cards, CRT shaders, soundboard
assets/fonts/         Press Start 2P & VT323 pixel fonts (self-hosted)
assets/preview.png    Social link preview card

src/
├── config.js         Game text, dialogues, and quests configuration
├── sprites.js        Pixel art tilemaps and character sprites
├── maps.js           9-screen world map layout for Isabela's Quest
├── audio.js          Chiptune audio synthesizer & Mario-style SFX engine
├── dialogue.js       Typewriter retro dialogue window
├── games/
│   ├── isabela.js    Isabela Adventure RPG Cartridge Engine
│   ├── plumber.js    Herman's Super Plumber Platformer Cartridge Engine
│   ├── tank.js       Cyber Tank 1989 Battle City Cartridge Engine
│   └── space.js      Star Guardian 8-Bit Space Shooter Cartridge Engine
└── game.js           Master Hermanify Console & Cartridge Hub Router
```

---

Crafted for Isabela ♥ by Herman
