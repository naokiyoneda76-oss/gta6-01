# PALMERA HEAT architecture contract

## Runtime and coordinate system

- ES modules only. All game source lives in `game/`; there are no network requests or libraries.
- The logical canvas is 1280 × 800. World coordinates are pixels; the city is 4800 × 3600 with water on the western edge.
- `CONFIG.STEP` is 1/60 second. The main loop uses a fixed accumulator and drops frame stalls beyond 0.25 seconds.
- Golden hour palette is fixed in `CONFIG.palette`: sky `#ffd9a0`, sun tint `#ffe8b6`, sea `#2e8f86`, sand `#ecd29a`, asphalt `#4a4a52`, sidewalk `#b9b3a4`. Shadows cast south-east by a fixed vector, proportional to building height.
- `SeededRandom` is the sole source of procedural randomness. URL `?seed=N` selects a seed; default is 1.
- `?shot=<name>&seed=<n>` stages a deterministic screenshot scene rather than the live loop. It paints twice, then sets `window.__shotReady = true`.

## Required module exports and roles

Every source file in `game/src/` has one job and begins with its named export:

| File | First export | Role / interface |
| --- | --- | --- |
| `config.js` | `CONFIG` | Logical view, fixed step, city bounds, palette, district tuning, entity caps. |
| `random.js` | `SeededRandom` | `constructor(seed)`, `next()`, `range(a,b)`, `int(a,b)`, `pick(arr)`, `chance(p)`. |
| `input.js` | `InputManager` | `isDown(code)`, `takeActions()`, plus `mouseX`, `mouseY`, `mouseButtons`; action bits confirm=1, pause=2, interact=4. |
| `city.js` | `CityMap` | `constructor(rng)`, roads/buildings/districts/palms/piers arrays, `isWater(x,y)`, `isLand(x,y)`, `collidesBuilding(x,y,r)`, `randomRoadPoint(rng)`, `boulevardView()`. |
| `render.js` | `CityRenderer` | `draw(ctx,world,camera)`, `drawObjective(ctx,world)`; renders the culling-aware 2.5D city. |
| `camera.js` | `ChaseCamera` | x/y world center; `follow(target,dt,city)`, `clamp(city)`, `addShake(mag)`, `apply(ctx)`. |
| `menus.js` | `MenuScreens` | `drawTitle(ctx,world,renderer,camera,t)`, `drawPause(ctx)`. |
| `world.js` | `World` | `constructor(rng)`, fields `rng`, `city`, `time`, `objective`, `playerStart`, `player`, `vehicles`, `driving`, `heat`, `money`, `health`; `step(dt,input)` advances and updates actors; `nearestCar(x,y,maxDist)`. |
| `vehicles.js` | `Vehicle` | Arcade vehicle physics, five `VEHICLE_TYPES`, collision and draw. |
| `player.js` | `Player` | On-foot movement, car entry/exit and actor draw. |
| `hud.js` | `Hud` | Health, money, heat, objective, speed and control hint; delegates minimap. |
| `minimap.js` | `Minimap` | City map and actor/objective blips. |
| `shots.js` | `ShotDirector` | `stageShot(name,game)` stages `cover`; unknown names select title staging. |
| `main.js` | `PalmeraHeatGame` | Creates systems, handles fixed-step loop and title/play screens. |

## City and scene state

`CONFIG.city` is 4800 × 3600. The sea occupies west of x=500, with a sandy coastal strip and north-south boulevard. `CONFIG.districts` defines six named rectangles: Coral Beach, Downtown Palmera, Marina del Sol, Porto Azul, Las Palmas, and Palmera International Airport. Building records are `{x,y,w,d,height,kind,shade,district,color,roof}`. Road records are `{x1,y1,x2,y2,width}`. Palms are `{x,y}`; piers are `{x1,y1,x2,y2,width}`. The airport has `runway` and `terminal` rectangles.

`World.objective` is `null` or `{x,y,label}`. `World.playerStart` is the initial beach-side start anchor. The current play screen provides a free inspection camera moved with WASD or arrow keys at 600 world pixels per second. Title camera pans along the boulevard.

`World.player` is a `Player`; `vehicles` holds `Vehicle` instances and `driving` is the driven vehicle or `null`. `heat` is 0–5, `money` starts at 500, and `health` starts at 100. Player input uses `down(code)` and edge action bits from `InputManager`; the interact action is bit 4. Vehicle records expose `x`, `y`, `angle`, `speed`, `type`, `color`, `driver` and `damage`.

## Input and screen flow

`InputManager` records held keyboard codes in a `Set`, mouse coordinates/buttons, and edge-triggered action bits. Enter/Space starts the title screen; Escape/KeyP returns from play to title. The `#status` live region announces title and play status for screen readers.

## Screenshot hand-in

`shots.json` declares four seed-1 scenes: cover, chase, marina, and taxi. `main.ts` verifies `game/index.html`, copies game and screenshots, writes the make.fun dossier, and logs handed-in file counts.

## Phase B: city life and law

`traffic.js` exports `TrafficAI`; `pedestrians.js` exports `PedestrianCrowd`; `wanted.js` exports `WantedSystem`; `police.js` exports `PoliceForce`; and `effects.js` exports `Effects`. `World` owns these systems and updates them after the player; `heat` mirrors `wanted.heat`. The world also exposes `bustMeter` (0–1), `busted`, and its effects/pedestrian/traffic/police system instances. `WantedSystem.reportCrime(kind,x,y)` accepts `carjack`, `pedestrian`, `police`, `crash`, and `shot` reports. Effects expose `drawGround(ctx)` and `drawAir(ctx)`.

`shots.js` stages deterministic `cover`, `chase`, `marina`, `taxi`, `street`, `downtown`, `title`, and `map` scenes. The title scene uses the live boulevard world; map opens the full-screen district map. `shots.json` declares the four seed-1 hand-in scenes; capture is performed separately.

## Phase C1: combat, dialogue, and story

`combat.js` exports `CombatSystem`, owned as `world.combat`; it exposes `weaponName`, `ammoInMag`, `ammoReserve`, and live projectiles. `gang.js` exports `GangCrew`, owned as `world.gang`, with `spawnGroup(x,y,count,opts)`, `update(dt)`, and `draw(ctx)`. `dialogue.js` exports `DialogueBox`, owned as `world.dialogue`, with `active`, `play(lines,onDone)`, `update(dt,input)`, and `draw(ctx)`. Active dialogue pauses player and mission input.

`missions.js` exports `MissionDirector`, owned as `world.missions`; it maintains appendable mission `definitions`, mission index/state, objectives/checkpoints, rewards, dialogue, and `world.missionRetry`. `World` also exposes `wasted`, `checkpoint`, and `gameStarted`; the live session starts at Palmera International Airport with the first mission marker available. Combat reads mouse screen coordinates plus `world.camera`; `wanted.reportCrime` accepts `shot` and the existing `pedestrian` kind for bullet hits. HUD draws on-foot weapon/ammo, while driving HUD remains speed focused.

## Phase C2: missions, ending, and saves

`missions.js` appends HEAVY METAL, SET UP, and SUNSET GETAWAY after missions 1–3. M4 loots a route-bound armoured truck then requires heat 0; M5 survives two marina ambush waves and stops a ledger car within three minutes; M6 pins HEAT 5 and reaches the airport cargo-plane checkpoint within six minutes. Completing M6 sets `world.ending` to `{timeMs,money,missionsDone}` and saves completion. `menus.js` presents the epilogue and run stats; Enter returns to free roam.

`save.js` exports `SaveStore`, backed by localStorage key `palmera-heat-save-v1`. Saves contain money, next mission index, completion, garage vehicle types, and play time. `World` loads progress at startup, mission completion saves, and keeping a car at Mia’s garage records its type for respawn there. Title screen R resets the save. Marina world dressing includes deterministic boat and crate props, rendered by `CityRenderer`; dusk is a world `timeOfDay` tint.


## Phase D1: side activities and sound

`activities.js` exports `SideActivities`, owned as `world.activities`; it updates repeatable taxi fares, the Palmera Loop checkpoint race, and eight scenic postcards. Activity markers render through `CityRenderer`; activity progress and toast text are reflected in the world objective. The save retains additive `activities.raceBestMs` and `postcards` fields. Taxi fares use taxi type vehicles, a flagged nearby pedestrian, a destination timer, and clean driving bonuses.

`audio.js` exports `SoundSynth`, owned as `world.audio`; all audio is synthesized with WebAudio after the first title confirm gesture. `M` toggles and persists audio mute using the additive `muted` save field. The master output is capped at 0.15.

## Phase D2: world look and staged captures

`World.setTimeOfDay('day'|'dusk'|'night')` selects renderer palette treatment without changing simulation time. Dusk supports story staging; night adds blue grading, lit windows, lamp pools, neon, and vehicle headlight cones. The deterministic city renderer draws roof treatments, shore and district ground dressing, parking, piers, runway, cargo plane, and lighthouse. Dialogue exposes additive `revealAll()` for fully readable staged lines.
