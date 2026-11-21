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

`shots.json` declares `1-cover.jpg` as `?shot=cover&seed=1`. `main.ts` verifies `game/index.html`, copies game and screenshots, writes the make.fun dossier, and logs handed-in file counts.
