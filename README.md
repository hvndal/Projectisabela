# HERMANIFY — 8-Bit NES Arcade & Custom Retro Games

**Hermanify** is an authentic 8-bit NES Arcade Hub featuring custom-made retro video games, synthesized Mario-style chiptune sounds, CRT scanlines, and mobile touch support.

Open `index.html` in any browser. That's it — zero build steps, no server required, no dependencies, and fully offline-capable.

---

## 🎮 The Cartridge Lineup

### 1. Cartridge 01: Isabela & the Lost Heart of the Pink Kingdom
The beloved top-down adventure quest!
- 9 hand-crafted areas, dialogue trees, hidden secrets, and the slightly angry strawberry boss.
- Gather 7 hearts, 5 stars, and 3 magical flowers to restore the kingdom.

### 2. Cartridge 02: FITWAY: IRON RUN (A Fitness Arcade Adventure)
A completely original, mobile-first retro arcade fitness game set inside **Fitway Gym**!
- **"What if Fitway Gym was secretly an arcade game?"**
- **5 Playable Fitway Team Members**:
  - **Sukh (The Owner)**: Armed with an Olympic Barbell. *Special*: Owner's Smash earthquake shockwave. *Challenge*: 10 Barbell Squats.
  - **Gagan (The Power Trainer)**: Armed with a Giant Kettlebell. *Special*: Kettle Crush cyclone throw. *Challenge*: 15 Kettlebell Swings.
  - **Shubham (The Conditioning Trainer)**: Armed with a High-Tension Resistance Band. *Special*: Band Blast full-screen snap. *Challenge*: 20 Band Pulls.
  - **Rakesh (The Old-School Trainer)**: Armed with an EZ-Curl Bar. *Special*: Old School Mode iron defense aura. *Challenge*: 10 EZ-Bar Curls.
  - **Herman (Software Developer & Hardware Engineer)**: Built the gym's connected systems and automation. Armed with Dual Dumbbells. *Special*: Debug Mode overclocked multi-split bouncing dumbbells. *Challenge*: 10 Dumbbell Curls.
- **The Living Gym World Levels**:
  - Exterior & Early Morning Sunrise
  - Fitway Reception Desk (NPCs, water cooler, tutorial foam blocks)
  - Cardio Floor (moving treadmill conveyor belts, rogue bikes, treadmill bots)
  - Interactive Fitness Checkpoints with real-time rep counter (`07 / 10`)
  - Vertical Stairwell Climb
  - Strength Floor (squat racks, cable machines, weight plates, dumbbell golems)
  - Functional Training & Boxing Area (plyo boxes, heavy punching bags)
  - Locker & Recovery Lounge (HP replenishment safe room)
  - Performance Lab & Herman's Secret Systems Terminal Room
  - Boss Arena: **The Sedentary King of Inactivity** (Couch throne, cushion projectiles, boss fitness shield breaks, and character finishers!)
- **Daily Streak Progression**: 🔥 Duolingo-like workout streak counter, XP leveling, and Fitway Token collectibles!

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
JUMP              SPACE / ENTER / Z / A Button
ATTACK            B Button / SHIFT / X
WORKOUT REPS      Tap A Button / Tap Screen
SPECIAL ABILITY   UP Key (when Special Meter is 100%)
EJECT CARTRIDGE   Click "⏏ EJECT / SELECT GAME"
FULLSCREEN        Toggle fullscreen mode
```

---

## 🔊 8-Bit Mario Soundboard & Chiptune Synth

`src/audio.js` synthesizes all sound in real time using the Web Audio API:
- **Mario Coin Ding**: Dual square wave chime (`B5` → `E6`)
- **Mario Jump Boing**: Smooth pitch glide (`C4` → `F5`)
- **1-Up Jingle & Flagpole Fanfare**
- **Goomba Stomp, Brick Smash, and Pipe Warp**
- **Workout Set Complete Jingle**
- **Tank Cannon & Space Laser Blasts**

---

## 📺 CRT Shaders & Visual Filters

Switch between 4 visual display modes on the front page:
- **CRT Color**: Authentic scanlines + phosphor glow + bezel
- **Scanlines FX**: Heavy retro scanline overlay
- **Amber Phosphor**: Classic monochrome CRT terminal amber
- **Game Boy Mono**: 4-shade authentic greenish LCD palette

---

Crafted with ♥ by Herman
