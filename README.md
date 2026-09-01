# HERMANIFY — 8-Bit NES Arcade & Custom Retro Games

**Hermanify** is an authentic 8-bit NES Arcade Hub featuring custom-made retro video games, synthesized Mario-style chiptune sounds, CRT scanlines, and mobile touch support.

Open `index.html` in any browser. That's it — zero build steps, no server required, no dependencies, and fully offline-capable.

---

## 🎮 The Cartridge Lineup

### 1. Cartridge 01: Isabela & the Lost Heart of the Pink Kingdom
The beloved top-down adventure quest!
- 9 hand-crafted areas, dialogue trees, hidden secrets, and the slightly angry strawberry boss.
- Gather 7 hearts, 5 stars, and 3 magical flowers to restore the kingdom.

### 1. Cartridge 01: FITWAY: IRON RUN (A Fitness Arcade Adventure)
A 16-bit top-down gym exploration RPG set in **Sector 67, Mohali**!
- **Street Fighter-Style Character Roster**: Choose from **Sukh** (Owner), **Gagan** (Power Trainer), **Shubham** (Conditioning Trainer), **Rakesh** (Old-School Trainer), or **Herman** (Software & Hardware Engineer).
- **The 4-Chapter Sitcom Story Arc**:
  - **Chapter 1**: *“Just Come To The Gym”* — Morning arrival, meeting Sukh at reception, Gagan's kettlebell test, treadmill malfunction chaos minigame, and unlocking **Machine Override**.
  - **Chapter 2**: *“The Bench Is Not Reserved”* — Gagan's bench dispute, mediating gym etiquette, meeting Shubham, speed band pulls, and unlocking **Resistance Band**.
  - **Chapter 3**: *“Everyone Knows Everyone”* — Sector 67 gym gossip, meeting veteran Rakesh, the multi-stage Fitway Competition, and unlocking **EZ-Curl Bar**.
  - **Chapter 4**: *“The Weights Floor” (Grand Finale)* — Floor 2 heavy weights area, building-wide power surge, confronting Sukh (*“Gym sirf machines nahi hai. People.”*), final ensemble team challenge, Sukh's Owner Squat Test, and sitcom ending.
- **6 Interconnected Explorable Gym Areas**: Sector 67 Street, Reception, Hallway, Cardio Floor, Functional Training Zone, and Floor 2 Weights Floor.
- **Post-Game Free Roam & Credits**: Explore the living gym freely after completing the story.

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
