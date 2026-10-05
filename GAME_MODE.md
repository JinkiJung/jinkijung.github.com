# Glass game mode

Branch: `feat/glass-game-mode`. The original homepage is committed on `main`.

## Run

```sh
npm install
npm run dev
npm run build
node --test tests/game-geometry.test.mjs
```

The geometry tests use Node's native TypeScript stripping (Node 22.18+).

Press **게임 모드** at the bottom right, at any scroll position. WASD/arrow keys move and face the character; the most recently pressed direction sets cardinal facing, retained after stopping. Tap Space to fire, or hold it for automatic fire. Mouse/touch aiming and firing are disabled. Use the exit button or Escape to restore the homepage. Viewport resizing exits the game to avoid distorted captures and stale hitboxes.

## Implementation

- `src/game/capture.ts`: captures the full page once in document coordinates, including the current slide and loaded content. `html-to-image` embeds the page's styles, images and fonts into SVG; rasterization is capped at 4096 pixels on the longest side, 2048 pixels in width and DPR 1.5. Animation transforms are frozen at entry.
- `src/game/GlassRenderer.ts`: native WebGL, one shared page texture and one batched triangle draw per frame. Actual component pixels fly away as irregular glass fragments. Cleared regions reveal solid `#0e1417`.
- `src/game/engine.ts`: frame-rate-independent movement, swept bullet collision, reusable pools of 64 bullets (32 per side) and 320 sparks, maximum 650 moving shards. Background tabs suspend the render loop. FPS and destroyed viewport area update twice per second.
- `src/game/GameMode.tsx`: modal focus, input isolation, cancellation, loading/error states, and cleanup. The existing React page remains mounted. Scroll position, focus and paused page animations are restored on exit. GPU resources, listeners and animation frames are released.
- Components mark their boundaries with `data-breakable`. Each bullet chips away only at triangles within 30 CSS pixels of impact plus the directly hit triangle. Mesh cells are at most 56 CSS pixels wide/high; destruction never propagates to the whole component. Subsequent bullets pass through existing holes and hit the remaining glass. Existing content and links are untouched.
- Game code and the capture library load only when entering game mode; the small launcher is the only eager addition.

## Validation and limits

Production TypeScript/Vite build and geometry tests pass. Browser checks cover first-screen capture, a scrolled section, textured destruction, character movement, exit button and Escape restoration, and repeated entry. The local in-app browser displayed approximately 96–120 FPS in the tested viewport; this is an observed HUD reading, not a guarantee across hardware. Test target mobile devices before release.

The arena is the full page frozen at entry. An edge-following camera scrolls through it without recapturing or resetting the world. Same-origin images work; future cross-origin assets need CORS permission to be embedded. Unsupported WebGL and capture failures show an error with an exit control. No audio, scoring persistence or deployment is included.


## Enemy NPCs and text cover

Four red NPCs approach and strafe around the player, firing every 1.4–2.1 seconds. Each takes three hits and respawns after four seconds. The player has five HP, a one-second damage grace period, and automatically returns to the center with three seconds of protection when defeated. The HUD shows HP, active enemies and eliminations.

HTML and SVG text are captured separately on a transparent, indestructible layer. Text is hidden in the breakable texture without removing its layout. A precomputed alpha mask blocks both friendly and enemy projectiles using the glyph mask plus sealed text-block bounds, including inter-letter spaces and paragraph line spacing. Collision tests compare text, actors and glass to resolve the first impact. Text hits emit bright white/yellow/orange welding sparks. Text remains readable over exposed background with a pre-rendered light outline.

Words baked into PNG/JPEG illustrations remain part of those images and are destructible; they are not DOM/SVG text. Preserving those requires separately authored text or masks for the image assets.

Run all regression tests with `node --test tests/*.test.mjs`. Browser verification includes NPC movement/fire, repeated fire at the title, preserved letters over destroyed background and welding sparks. GPU resources are explicitly deleted on exit; canvas contexts stay reusable during Vite hot reload.

## Flanking around text cover

NPCs now check text line of sight and search for a reachable firing position (80–260 pixels from the player) when cover blocks their shot, even if they are already within their usual attack range. A 12-pixel navigation grid is built once from the text alpha mask and inflated for an 18-pixel body radius. Four-way search avoids corner cutting. Each NPC replans every 0.75 seconds with staggered initial timers; movement follows collision-checked waypoints at 76 pixels/second. Visible targets use the original approach/strafe movement, also constrained by the navigation grid. Firing continues at the normal cadence even when text blocks the target; line of sight only guides movement. Projectiles still collide with and reflect off cover. Respawns are placed in free navigation space. Completely sealed cover remains impassable.

Regression tests cover a text wall inside normal attack range, a moved target, blocked spawn recovery and an unreachable target, alongside the existing combat/destruction tests.

## Solid player collision and ricochets

The player now uses the same body-clearance text grid as NPC navigation, with swept substeps and wall sliding. Initial spawn and respawn are moved to free space. Player shots sweep the center-to-muzzle segment so a barrel extending past a letter cannot spawn a bullet on its far side.

A glyph impact emits welding sparks and reflects the actual projectile once at 65% speed, estimated from the local glyph normal. The reflected round has a yellow trail and up to 0.28 seconds of life. It starts back on the incoming side, still collides with text and actors, and skips the decorative glass layer so its rebound is visible. A second text impact removes it, preventing repeated zero-distance collisions. Regression tests cover player wall blocking/sliding, muzzle crossing and outward reflection in addition to NPC flanking.


## Paragraph cover and NPC muzzle regression

The collision mask now additionally fills the visible rendered bounds of text blocks. Fragments belonging to the same paragraph or heading are unioned, closing letter spacing and wrapped-line gaps while leaving the visible text rendering unchanged. Viewport and ancestor overflow clipping are respected. The combined mask is shared by both sides' bullets, reflections, player movement and NPC line-of-sight/pathfinding. Both NPC and player projectile creation call the same swept `safeMuzzle` helper. Tests cover NPC-speed rounds through paragraph centers, reverse-direction shots, line gaps, capture scaling and both muzzle lengths. This supersedes the earlier glyph-only whitespace behavior.

## Reflected projectile trails

Projectile trails now use the previous simulated position instead of extrapolating backward from the reflected velocity. The old rendering could draw a reflected round's trail inside or across cover even though its collision position stayed outside. An additional regression reproduces three NPC firing angles above the captured first-screen paragraph toward a player below it and checks that paragraph impact precedes player contact.

## Movement on exposed ground

Player and NPC movement now requires the full 20-pixel footprint to be free of intact glass. A requested step first opens a local patch at the current and next footprint, then moves onto that exposed dark ground. The same substepped movement routine is used by both sides. Idle characters do not excavate, and text collision is checked before any excavation, so text cover cannot be broken by walking. NPCs retain flanking routes and shoot while advancing.

A trapped player sees a speech bubble containing only four vector arrow-key pictograms, with a cycling pressed-key animation. The bubble appears over intact glass or when surrounding exits remain covered, and disappears on movement. No English/Korean text appears in the hint. Ground checks use triangle/circle overlap rather than a character-center approximation. Regression tests cover full-footprint contact, excavation-before-movement, blocked ground, idle input, and unbreakable text.


## Page scrolling and pass-through ticker bands

The camera follows vertically when the player enters the top or bottom 15% of the viewport, with a smooth response and clamping at the document ends. Geometry, text collision, bullets, NPCs and destruction use persistent document coordinates; only rendering moves. Keyboard facing stays independent of camera movement and the HUD stays fixed. Entry uses the current page scroll offset; exit retains the previous behavior of restoring the original entry position. Respawns occur near the current camera.

The full-page image and text textures are captured once. WebGL culls offscreen triangles before upload, and the text overlay samples only the visible strip. Every `.wf-footer` ticker band is removed from both paragraph sealing and the final collision mask; regular text cover elsewhere stays solid. Players/NPCs can excavate and walk through these bands, and bullets pass through their text. Tests cover both 15% thresholds, stationary central-band behavior, page endpoints, returning to earlier sections, and ticker pass-through without weakening normal paragraphs.

## Voyage ice zone

The exact `#end-to-end > div > div.e2e-main > div > div.e2e-voyage-frame` bounds are captured in document coordinates as an ice region. Exposed floor inside those bounds is blue (`#145f96`), rendered with a clipped WebGL clear behind the page texture; intact content stays visible until destroyed. Camera scrolling does not move the terrain relative to the page.

Both player and NPCs use low-friction exponential velocity integration on ice: gradual acceleration, momentum through turns and deceleration after releasing input. Normal terrain retains immediate movement response. Text collisions zero blocked velocity components; respawn/blur clear player momentum. Existing excavation, text cover and NPC route planning remain active. Tests cover exact zone boundaries, release/reversal, normal-ground stopping, equivalent travel at 30/120 FPS, and camera-clipped blue floor.

## Keyboard combat

Both characters and NPCs fire in four cardinal directions. NPCs face the nearest cardinal direction toward the player and continue firing behind cover. Navigation, ice momentum, text impacts and ricochets remain active. Player facing follows the last direction key pressed, including while blocked or sliding; key repeat does not override a newer direction. Short Space presses queue a shot between animation frames. Mouse aiming, crosshair and touch controls have been removed.

## Player melee

Press Z for one swing (0.4-second cooldown). The 120-degree forward fan reaches 48 CSS pixels from the player center, 1.5 times the 32px body collision diameter. A brief fan overlay matches the damage rays. The fan follows the player position and facing throughout its 0.18-second active window. Each living NPC can lose 2.5 HP once per swing, leaving a full-health NPC with 0.5 HP. Intersecting glass triangles detach once using the existing debris pool. Text clips the fan and protects targets behind it.

Each swing triggers at most one rebound. Striking text emits welding sparks and kicks the player backward for 0.32 seconds with exponential decay (about 66px on open ground). During recoil, movement input cannot cancel the impulse. The same collision-checked 4px movement steps open the floor along the recoil path; rear text and world boundaries still stop the character. Recoil is cleared on blur and respawn. NPCs do not perform melee attacks. Tests cover cardinal fan bounds, glass intersections, text cover, recoil excavation/collision and frame-rate independence.

## Player movement and escape

Ordinary player movement (including ice momentum) only checks for open floor and never excavates glass. Four alternating direction presses within 900ms break a local 34px-radius footprint around the player; held-key repeat and WASD/arrow aliases for the same direction do not count. Each escape burst requires a fresh sequence. The arrow bubble remains visible when movement is blocked. Shooting, melee and text-impact recoil still break glass, and NPC excavation is unchanged.

## Subtle impact feedback

Player damage adds a 0.24-second warm body flash, small impact ring and low-opacity red edge tint, only when HP is actually lost. Enemy bullet hits add a 0.11-second body flash and a small 0.14-second ring. Melee hits add a 0.16-second flash, a slightly larger mint ring with four short impact strokes, and a 55ms pause of that enemy's movement/fire. Other characters and the simulation continue normally. Rings persist through kills, fade within 0.24 seconds and reuse a fixed 16-slot pool. Damage values remain unchanged.

While the player blinks during post-hit protection, the entire character palette (body, helmet, boots and rifle) is tinted red. The red tint shares the blink opacity and ends with protection, including the respawn protection interval. This uses direct canvas colors without an extra full-screen filter pass.

## Death markers and respawn

Only player deaths leave a small non-colliding bone pile at the world position, with a skull overlay that rises and fades over 1.1 seconds. NPC deaths leave neither a bone pile nor a skull overlay. A maximum of 64 piles persist during the game session; older piles are recycled and offscreen piles are culled. Respawns sample random body-safe positions within the current viewport, below the top HUD and above the help bar, preferring 48px of additional navigation clearance from text. Crowded viewports fall back to 24px and then body clearance, never searching the rest of the page. If no candidate exists, an NPC retries later; the player keeps the last safe death position and respawn protection. Normal glass movement rules remain active at the new position.

## Corner pursuit with cardinal fire

NPC route goals now require a real horizontal/vertical firing lane that intersects the player's body before text cover, within 48–180px. Diagonal visibility alone no longer ends pursuit. Straight, collision-free route stretches use up to 96px lookahead so ice drift and periodic replanning do not repeatedly pull enemies back to grid centers. Pursuit speed is up to 100px/s with a slower approach near waypoints; firing positions no longer use lateral strafing that immediately loses alignment. Shooting continues during pursuit. Regression tests simulate an icy upper region and a player below a paragraph wall at both 30 and 120 FPS, checking arrival in the lower region without crossing text.

Releasing a direction key restores facing to the most recently pressed direction still held (including mixed WASD/arrow inputs). With no direction held, the last facing remains. OS repeat and combat keys do not change this priority.

## Tight text collision bounds

Text capture now groups DOM fragments per rendered line, then trims each line to actual rasterized glyph ink before sealing internal letter/word spaces. This replaces whole-paragraph rectangles: padding, font-box whitespace, inter-line whitespace and short-line tails are no longer filled as cover. The same mask drives bullets, melee, players and NPCs, while ticker exceptions remain. Navigation uses an 8px grid and character movement checks an 18px circle against actual occupied pixel rectangles, removing grid-cell snapping from body collision. Regression tests cover sealed word gaps, clear margins, short wrapped lines and body clearance.

## Game-only upper and lower HTML stages

Edit `src/game/stages/top.html` (purple `#302540`) and `src/game/stages/bottom.html` (teal `#16433d`) independently. Each starts at one viewport height and can grow with its body content. Styles are isolated in temporary sandboxed iframes; scripts do not execute. Use inline assets or absolute asset URLs. On game entry their rendered bodies are captured, the frames are removed, and the textures/text masks are composed above/below the homepage. The homepage DOM is never extended. Exit restores its original scroll position.

Stage backgrounds are permanent walkable floor, unaffected by bullets, excavation or glass completion percentage. Future HTML decoration is rendered as floor artwork; added text uses the same solid text mask. The homepage remains destructible. Entry, text, ice, breakable bounds and camera positions all shift by the upper stage height. The camera crosses both old page boundaries and stops at the new outer boundaries. Shared textures stay within the previous 4096px long-edge budget and are captured once per game entry. Regression checks cover entry offsets, both stage transitions, camera limits and exact stage/page mesh boundaries.

## Respawn performance

Clearance tiers (48px / 24px / body-safe) are now precomputed once from the conservative navigation grid using a summed-area table. A viewport candidate list is rebuilt only when its grid-row bounds change; repeated spawns pick directly from that list. Both NPC and player respawns avoid exact glyph-mask scans. Tests check safe margins, random selection, scroll/resize invalidation, crowded fallback and 1,000 repeated selections without pixel collision calls.

A local synthetic 1200×4800 world benchmark with a 600×2400 text mask measured the old spawn search at 273ms, new precomputation at 2.3ms, first viewport selection at 0.56ms, and cached selection below 0.001ms. These are isolated CPU timings, not whole-game frame-rate guarantees.

## Score and player HP

The player has an upright world-space HP label and bar above the head, including a low-health color. The movement hint sits higher to avoid overlap. The top HUD displays SCORE. Each newly detached glass triangle earns 10 points when caused by player bullets, melee, escape input or text-impact recoil. Enemy bullets/excavation and repeated hits on existing holes earn nothing. Every enemy kill earns 500 points once. Score survives player respawn and resets on a new game. The renderer counts actual detachments, including debris suppressed by the particle cap, so scoring does not depend on visual effects or frame rate.

## Toppling concrete indicators

Every `.wf-indicators .wf-indicator` is captured as a separate concrete slab during game entry and removed from the destructible page texture. Player and NPC projectiles hit its original thin rectangle using swept collision, including muzzle clearance. The first impact consumes the bullet and tips the slab toward screen-down over 0.62 seconds. The rendered face extends 80px downward at full fall while preserving its width as a rectangle. Shaded thickness and a changing ground shadow provide depth, followed by a small landing bounce. Fallen slabs stay visible but no longer block bullets. Player-owned hits earn 10 points once; NPC hits earn no player score. This is a Canvas 2D effect with no physics dependency and a fixed object count. Normal homepage indicators keep their original behavior.

Concrete slabs also respond to the player's clipped melee fan. During the fall, each newly swept strip crushes every intersecting glass triangle, with a 20px footprint margin to keep characters from catching intact glass at the slab edges. The covered glass stays removed after landing, while existing solid text rules remain. Sweeps run only as the fall advances and never repeat after settling. Player-triggered falls award glass points; NPC-triggered falls do not. Regression tests cover melee reach/cover, continuous sweep coverage at 30/120 FPS, ownership and rectangle/triangle intersections.

## Footer pits

In game mode, every `.wf-footer` becomes a permanent pit with a dark interior, shaded inner wall and highlighted near rim. Its old ticker is covered, and the area is excluded from destructible glass and completion totals. A swept character-center check applies equally to player and NPC movement, including ice and recoil; invulnerability does not prevent falling. A short shrinking/rotating silhouette marks the fall. Player death uses the existing skull, score-preserving respawn and protection; NPC falls respawn after four seconds without awarding a player kill. Respawn clearance precomputation excludes pits plus a 20px body margin without making them impassable in movement navigation. Bullets remain able to travel over pits. If the current viewport has no safe player spawn, a safe world candidate is used. This supersedes the earlier safe ticker passage behavior.

Pit deaths now use a 0.85-second descending, shrinking fall clipped inside the pit opening. Player respawn waits for this animation; controls, body rendering and incoming actor hits are disabled during the fall. Both player and NPC fall silhouettes retain their facing and shrink to zero. Pit deaths leave no skull or bone pile; ordinary player combat deaths still do.

Concrete is now rendered above pits and supplies bridge support matching its projected rectangular surface, including the falling animation. Player and NPC pit checks subtract supported portions from the entire swept movement segment. Covered crossings and standing on a slab are safe; uncovered gaps between slabs still cause a fall even during fast movement. Respawn candidates continue to avoid pits. Tests cover both crossing directions, standing, leaving a bridge, adjacent slabs, uncovered gaps and the settled footprint.

## Career weapon caches

The four desktop `.career-col-bg` rectangles expose a procedural yellow/charcoal diagonal floor beneath broken page glass. Their document-space centers receive four distinct weapons sampled without replacement from the seven types on game entry. A cache remains hidden until at least 50% of its region’s glass area is broken; the remaining glass then shatters and its small Canvas icon bobs above a shadow. Walking within 42px with an unobstructed text/concrete path equips it; the pickup returns after 18 seconds. The HUD shows the equipped weapon. Space uses it in the current facing direction; Z remains melee. Death restores the pistol.

Seven weapons: Uzi (65ms rapid fire, 0.55 damage), shotgun (five 1.3-damage piercing pellets, 780ms reload), triple (three 0.9-damage shots, 260ms), firegun (96px clipped cone spanning 72 degrees, 0.30 damage every 80ms), spike (1 damage, exponentially decelerating projectile, speed-preserving reflection off text/glass/world edges, stops and expires after six seconds), mine (arms after 0.5s, enemy proximity triggers 4 damage within 88px), and oil (96px square ahead, clears underlying glass, lasts 10 seconds). Text remains solid. Oil affects both player and NPC acceleration/coasting, with lower drag than ice. Mine blasts respect text/concrete cover and break glass; player-caused destruction and kills use existing scoring.

Oil and blast rings are capped at eight each. Mines are capped at three: additional placement is rejected without replacing existing mines. After the 0.5-second arming delay, player contact within 26px triggers an instant lethal explosion regardless of invulnerability, followed by the normal death mark and respawn. Text cover blocks contact detection. NPC proximity triggering remains unchanged. Projectile and spark pools remain bounded. Pickup visibility follows the permanent region unlock state; offscreen caches/floors are culled. Automated tests cover exposure/collection, random cache assignment, reflection energy, spike deceleration/frame independence, oil drag, deployable caps/expiry and weapon patterns. Browser smoke check covers entry and HUD; all seven weapons have not been manually playtested end-to-end.

Installed mines now have a ten-second fuse. During the final second (age >= 9s), their drawn icon shakes and rotates slightly without moving the collision center. At age >= 10s the engine consumes the mine through the same explosion, enemy damage, glass destruction and concrete-toppling path as contact triggering. Expired mines are retained until that path processes them, rather than silently removed by lifetime cleanup. Contact triggering still works during the warning. Fuse boundary tests run at 30/60/120 FPS.

Text pixels inside the four career backgrounds are composited into the destructible page texture and removed from the persistent text overlay. Their collision mask is also cleared after line sealing. Shots and melee therefore break that lettering with the local glass; it does not block characters, bullets, flame or melee rays, and cannot cause text recoil. Text outside those rectangles retains the existing indestructible behavior. This capture-only change does not alter the normal homepage.

Shotgun pellets pass through enemies, with a per-pellet hit mask preventing repeat damage to the same enemy. Each swept segment can hit multiple enemies before its nearest glass/text/concrete obstruction, so piercing does not bypass scenery or depend on frame rate. Spread, range and reload cadence are unchanged.

Career glass partition boundaries align with all four cache rectangles. Per-shard area membership is precomputed at entry; detach events update the area counter, avoiding per-frame scans. Reaching half unlocks that region once and detaches its remaining shards through the existing bounded debris/score path. Clearing the center alone no longer reveals a pickup. Reappearing pickups keep their original distinct weapon assignments. Tests cover exact-half thresholds, unequal shard sizes, repeated detach events, independent regions, partition boundaries and repeated random samples.

Oil disappears ten seconds after placement, including if ignited. A firegun cone intersecting oil ignites the whole patch; text, concrete and intact glass block ignition along the ray. Burning patches show nine small animated flames each, with no additional particles. Players and NPCs on burning ground lose 1 HP every 0.25 seconds (4 HP/second), independently of bullet invulnerability. Leaving the patch resets the burn interval. Overlapping patches do not multiply damage, fire does not extend oil lifetime, and oil remains slippery while burning. Existing player death and enemy kill scoring apply.

During player melee rebound, pit checks are suspended for the recoil duration. The final recoil frame checks only the landing position, respecting concrete bridge support; an unsupported landing starts the existing pit fall there. Ordinary movement and NPC movement retain swept pit checks, so this exemption applies only to melee recoil. A blocked recoil still falls if its final position is unsupported.

The final below-fold footer pit spans the full viewport width in game mode, removing the side-padding bypass. Rendering, fall collision, respawn exclusion and breakable-area accounting share this expanded rectangle. Normal homepage footer layout is unchanged.

Player respawns are restricted to the original page’s world-space bounds with a body margin. Extension deaths immediately move the camera into the original page at respawn; if the nearby viewport is blocked, a safe candidate elsewhere in the original page is selected and brought into view. No candidate ever falls back to an extension. If none exists, respawn waits and retries. NPC spawn behavior is unchanged.

Spike projectiles and weapon icons now use a four-point shuriken silhouette; airborne/stopped projectiles rotate visually. After a 0.12-second muzzle grace period, the player's own spikes can hit the player for 1 HP, using the existing bullet invulnerability/death behavior. Stationary spikes remain hazardous until their existing lifetime expires. Active spike pairs use relative swept-circle collision and equal-mass normal velocity exchange without adding energy. Bounded separation passes prevent overlapping piles, including coincident stationary spikes; existing drag still slows them afterward. Tests cover fast opposing projectiles, stationary overlap, momentum transfer and separating pairs.

Every four cumulative enemy kills permanently adds one larger charger enemy slot (in addition to the original four shooters). Chargers have 4.5 HP, respawn after defeat, show a fixed aim line for 0.8 seconds, and charge along it at 620px/s until hitting solid text, an upright slab or a viewport edge. They clear all glass intersecting their swept 29px footprint without awarding player destruction points. Orange trailing sparks use the existing bounded particle pool. Impact emits surface sparks and a subtle 0.18-second camera-layer shake. Contact deals 2 player HP with existing one-second damage protection. Chargers retain pit deaths and normal kill rewards. Shotgun per-enemy hit tracking now uses sets to support more than 32 enemy slots.

Chargers are named Juggernauts. Before telegraphing, they require a body-clear straight route to player contact range. If blocked, they walk at 95px/s along a bounded grid search to a reachable charge position, digging glass as existing NPC movement does. Navigation checks the large body, upright concrete and unsupported pits; bridges remain usable. Paths replan periodically as the player moves, and after an impact cooldown. Lazy occupancy is shared briefly among Juggernauts and invalidated on camera movement; each search has a fixed node budget. Telegraphing still locks the direction before charging. Tests cover wall detours and sealed barriers.

Juggernaut performance: text navigation now builds an integral ink-count image once. Empty body bounds return in O(1), while nonempty bounds keep exact circle/pixel checks; Juggernauts use one 26px-radius query instead of nine 18px queries. Route searches are generators yielding every 24 expanded nodes, with one global round-robin slice per frame. Glass footprint queries use static spatial buckets of original shard centers with a conservative maximum vertex radius, retaining exact triangle checks and destruction accounting. A local 50,000-query text-clearance benchmark measured 93ms before / 4ms after, with zero mismatches across 10,000 sampled original-radius queries. This is a microbenchmark, not a measured gameplay FPS claim. Regression tests cover large-body clearance and sliced blocked-route completion.

Projectile wall sparks are reduced to 8 for text and 6 for glass, with 0.10–0.26s lifetime. Other impact bursts use 18 welding / 14 normal particles. Per-particle Canvas shadow blur is removed; bright streak colors remain. Offscreen impacts do not emit sparks, and offscreen particles update their lifetime without drawing. The existing 320-slot pool and combat/collision behavior are unchanged.

Juggernaut kills award 750 points; ordinary enemy kills retain 500. Both the shared weapon-damage path and melee kills use this distinction. Pit deaths still award no kill points.

Juggernaut charge sweeps now hit the player, ordinary enemies and other Juggernauts for 2 HP, once per victim per charge. Surviving victims use the existing 520px/s exponential recoil for 0.32 seconds, directed forward away from the charging body with a lateral deflection based on the victim's position. Enemy victims suspend their AI/charge while recoiling, clear glass without player points, and check pit support at landing. Player recoil also uses the existing landing rule and does not award destruction points when caused by an enemy. Friendly-fire kills do not award player score or advance player kill milestones. Existing player invulnerability remains respected.

## Six remixed extension stages

`public/stages/index-up-1.html` through `index-up-3.html` and `index-down-1.html` through `index-down-3.html` replace the plain extension floors. Each standalone HTML page uses `public/stages/stage.css`, local homepage imagery, a distinct layout, four career caches, no navigation links or scripts, one shortened internal footer pit, and a full-width final footer pit. The world order is up-3, up-2, up-1, original page, down-1, down-2, down-3. Normal homepage content is unchanged. All stages are destructible and contribute to glass completion; player respawns still remain inside the original page.

Up-stage plates sit below their pits and topple upward. Down-stage plates sit above and topple downward. Support, glass sweeps, hit tests and drawing share the direction; both internal and final pits have reachable bridge plates. Main-page plates retain their original downward motion.

The voyage frames and career rectangles carry `data-penalty`: stage 1 reverses movement input, stage 2 permits only movement toward the next stage (up/down), and stage 3 disables Space weapon use, leaving melee available. Effects apply to the player only on exposed glass floor and stop outside the region. Voyage floor colors identify the three penalties; career backgrounds retain hazard stripes, 50% area unlocking and four distinct weapon types per stage. The HUD names the active effect. Original-page voyage ice remains unchanged.

Capture loads same-origin sandboxed HTML documents in batches of two, waits for styles/fonts, and composes all geometry in world coordinates. The preparation timeout is 30 seconds for the larger world. The six page layouts/assets, no-link checks and game startup were checked in the browser; full traversal of all six stages has not been manually completed. Regression tests cover penalty gating/input, per-stage weapon uniqueness and upward bridge projection.

Player respawn now stays within the current viewport (including extension stages), with no original-page camera jump. Prefer exposed walkable glass-free ground away from text, pits and burning oil; if none is exposed, clear a 34px landing footprint at a safe position in this same viewport without awarding points. If there is no safe position, retry without moving the camera. The old original-page-only respawn rule is superseded.

Extension penalties now apply exclusively to `.e2e-voyage-frame[data-penalty]`. Career regions retain only their hazard floor and random weapon cache mechanics, with no reverse/one-way/no-fire effects.

Reverse-control voyage fields are replaced by normal blue ice fields; one-way and no-fire voyage fields remain. Oil patches are now 144×144px (1.5× the previous width and height), with layered iridescent contour strokes. Entry velocity sets a locked drift direction; while on oil, movement input cannot steer it. Two sinusoidal lateral components with randomized entry phase/frequency create a small irregular alternating skid. Leaving oil restores steering, and reentry samples a new direction. Player and regular NPC oil motion share this behavior. Oil lifetime (10s), ignition and burn damage are unchanged; enlarged visuals, ignition, damage, slipperiness and glass clearing use the same footprint.

Each up/down stage now has three vertically stacked shells, each with four weapon caches and its own voyage field and bridged pit. The final footer remains edge-to-edge. Capture includes all twelve career regions per stage; weapon uniqueness still applies to each group of four.

Game imagery is now split into 1024 CSS-pixel vertical tiles per page. The original index retains its independent capture quality (up to 1.5x, subject to the existing per-page canvas limits); extension pages use at most 0.5x. Glass and persistent text use these tiles instead of a downscaled world atlas. Shard partitions include tile edges, preserving texture coordinates on flying debris. WebGL textures are uploaded only for visible shards and evicted beyond a 1024px retention margin. The shared collision/navigation mask keeps its existing bounded resolution independently of visual quality.

Oil now keeps regular NPCs sliding even while idle or briefly staggered. Entry velocity fixes their drift direction; stationary NPCs use the direction toward the player, with a minimum sliding speed of 140px/s and the shared random lateral oscillation. AI steering resumes outside oil. During a Juggernaut charge, oil is sampled along the swept path every 3px; each entry bends its heading once by a random angle of 10–20 degrees to either the left or right (never less than 10 degrees), retaining its charge speed and existing wall, glass, pit and character interactions. New charges reset the oil-entry latch.

Runs start with two total lives (one respawn). The second death or the explicit Finish Run (기록 종료) action freezes play and captures the immutable completion before displaying results. Respawn retries do not consume extra lives. Results and homepage tickers share the real server leaderboards. Nickname entry appears only for an eligible candidate based on the cached boards; details and configuration are below.

The HUD displays lives, score, destruction percentage, exit and a developer checkbox. Developer mode preserves remaining lives through deaths and equips the selected weapon each update. Its result and high-score preview buttons pause the simulation without changing the actual score/lives, allowing results and return-to-game testing. Developer previews never submit, and using developer mode permanently makes that run ineligible for registration. Form/control focus clears gameplay inputs; typing and selector keys do not fire or move the character.


## Leaderboard backend integration

The default API is `https://jinki-game-leaderboard.jinki-game-leaderboard.workers.dev`, with rules version `jinki-v2`. The v2 backend is not yet deployed; deploy the backend first and frontend second. No deployment or backend changes are part of this update.

### Configuration and local use

Run `npm run dev`; Vite uses port **5173** with `strictPort`, because the backend permits `http://localhost:5173`, `http://127.0.0.1:5173`, `http://127.0.0.1:5175`, and `https://jinkijung.github.io`. Port 5175 is allowed only on `127.0.0.1`; `localhost:5175` is a different origin. Use HTTP, not `file://`.

- With no environment override, development and published builds use production.
- Copy `.env.example` to `.env.local` to use `VITE_LEADERBOARD_API_URL=http://localhost:8787` with a separately running local backend.
- Set `VITE_LEADERBOARD_API_URL=https://jinki-game-leaderboard.jinki-game-leaderboard.workers.dev` explicitly to select production.
- Vite reads this public configuration at startup/build time; restart the dev server or rebuild after changing it. It contains no secret. Existing deployment configuration remains unchanged.

### Requests and run lifecycle

All homepage tickers, the game and results share one in-memory leaderboard cache and one pending GET. There is one initial GET, no polling, no per-frame traffic, and no request when switching board tabs. Explicit refresh/retry and successful submission can refresh the cache. Loading, empty and failure states are visible.

Once captures and sprites are ready, each game obtains one session before gameplay begins. Double starts share a pending request; cancelled/older responses cannot start or overwrite a newer game. Session requests exceeding 15 seconds are discarded. Session failures offer an explicit retry, with no automatic session loop and no later-issued token attached to an earlier run.

The local submission filter requires a strictly higher score than the last returned entry on at least one full weekly/monthly board. A board with fewer than ten entries has an available place. Exact area-complete runs are also eligible because the all-time glass board ranks by completion time, not score. Tied scores are intentionally skipped to honor the call-saving policy, even though the server could admit a faster tie. A cached cutoff is advisory: concurrent scores may change server qualification. If a server-provided period has ended, that period cannot authorize a submission until an explicit refresh provides the new period. No local-calendar periods are invented.

The necessary session POST still occurs before gameplay; only the completion POST is conditional on the cached cutoff. Runs below the cutoff make no completion request. Candidate payloads are frozen on the first submission attempt, including the normalized nickname, submission ID, token, time and evidence. There are at most three attempts total, only for network failures, 429 or 503. Retries preserve exactly the same JSON, use exponential backoff plus jitter, honor readable Retry-After, and use a 60-second fallback for 429. Session expiry or the 300-second completion grace stops attempts. Validation errors and conflicts do not retry. All-false qualification flags mean successful acceptance outside the boards, not failure.

`performance.now()` measures elapsed time independently of simulation frames. Pauses, preview menus, respawns and hidden tabs remain included. A wall/monotonic discrepancy over two seconds makes the run ineligible; no timestamp or duration is repaired. Finish captures completion time, duration, UUID, score and evidence before nickname entry and any asynchronous action. The first death preserves the session/counters. Every terminal death returns immediately from the simulation tick so later collisions in that frame cannot alter the completed run. Exit abandons the run; ESC toggles pause. Use **Finish run & view score** in the pause menu to finish and offer registration.

### Geometry and score evidence

`GlassRenderer.totalArea` is the sum of the actual original randomized breakable triangles, excluding permanent pit floors. It is fixed for the run, in world-coordinate square pixels. Detachment contributes its original area exactly once; flying/removal animations do not add area. Evidence does not use a fixed shard total, a rounded percentage, the old rectangular area estimate, or clamping.

Attribution is scoped to each real destruction operation and inherited by recursive career-cache destruction. Player attacks/recoil/struggle/oil/mine events are player-owned; a player-toppled slab's sweep is the slab subset of player glass. NPC attacks/movement/charges, NPC slabs and non-scoring respawn landing clearance belong to the NPC/non-player category, preserving existing scoring. Topple events are counted only when `concrete.topple` returns true; enemy kill counters are updated at the guarded alive-to-dead scoring boundary.

### V2 scoring contract

The v2 evidence now records player Juggernaut kills as a subset of `enemyKills`, plus separate collision and oil-pit bonus counters. The formula is `10 * playerGlassShards + 10 * concreteTopples + 500 * (enemyKills - juggernautKills) + 750 * juggernautKills + 750 * juggernautCollisionKills + 2000 * oilPitJuggernautKills`. Slab shards are already included in player shards. All nine counters are safe integers in [0, 1,000,000]; the score cap is 3,520,000,000 with no 32-bit coercion. Developer runs remain excluded. Browser-provided counters support consistency checks, not proof of genuine gameplay or authoritative anti-cheat.

Chain reactions and respawn ground clearance are covered by the two-category player/non-player model. Glass is static and does not regenerate. No further geometry/protocol mismatch was found in the current renderer.

### Verification

Run `node --test tests/*.test.mjs` and `npm run build`. The integration tests use the existing Node test runner and esbuild (already supplied by Vite). They cover session ordering/cancellation, immutable completion and retries, timing/expiry, errors, cutoff filtering, normalized nicknames, shared loading/error/empty states, real randomized renderer area, repeated slab sweeps and career-cache attribution.

`tests/leaderboard-browser.mjs` runs against `http://127.0.0.1:5173` using Playwright; set `PLAYWRIGHT_MODULE` to an available Playwright module if it is not installed locally, and optionally `PLAYWRIGHT_CHROMIUM` to its browser executable. All API routes in that script are intercepted with mock responses, including sessions and score submissions. It checks desktop/mobile results, actual gameplay evidence, shared reads, low-score suppression, safe text rendering, submission success outside the top ten, and session-failure retry. Optional `LEADERBOARD_SCREENSHOT_DIR` and `LEADERBOARD_OBSERVATIONS` save local visual verification and synthetic-run measurements, without adding runtime telemetry.

A signed session proves server issuance, not genuine play. Browser counters, geometry and timing remain forgeable; this integration is not authoritative anti-cheat protection. No client signing secret, tokens in URLs/storage, evidence logging, analytics or checksums are added.


### Verified results and event observations (2026-10-05)

- Production build succeeded; 153 Node tests passed, including 19 focused client/renderer integration tests.
- The browser integration script passed against the built frontend at desktop 1280×900 and mobile 390×844. Browser page-error collection was empty. Expected API failure/recovery scenarios were mocked.
- A separate real-browser, read-only production smoke check returned HTTP 200 and `Asia/Seoul`; all three deployed lists were empty at that check. It made zero POST requests. All synthetic sessions and submissions used mocks.
- Real engine smoke samples used a held normal-weapon shot for approximately three seconds followed by explicit Finish Run. Session/transport responses were mocked; geometry and gameplay were not mocked. These are short observations, not sustained maxima or anti-cheat limits.

| Viewport | Measured duration | Player shards | NPC/non-player shards | Enemy kills | Slab shards / topples | Score | Player shards/s | Points/s |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1280x900 | 3.5192s | 157 | 127 | 0 | 0 / 0 | 1570 | 44.61 | 446.12 |
| 390x844 | 3.3091s | 401 | 325 | 1 | 0 / 0 | 4510 | 121.18 | 1362.91 |

The large difference between these samples shows why viewport and randomized partition density matter. No maximum one-second burst, sustained high-rate kill/topple scenario, full-world clear, alternate-weapon ceiling or long-duration farming rate has been established. Those need dedicated measurements before any backend plausibility thresholds are enabled. No rate limits were invented or changed.

### Changed frontend areas

- `src/leaderboard/protocol.ts`, `client.ts`, `store.ts`, `service.ts`, `evidence.ts`, `LeaderboardPanel.tsx`: protocol, session/timing/retry lifecycle, shared board cache, event evidence and board UI.
- `src/game/GameMode.tsx`, `engine.ts`, `GlassRenderer.ts`, `score.ts`, `run.ts`, `Results.tsx`: session-before-play, explicit finish, exact end snapshot, attribution, fixed original area, result registration and failure states.
- `src/components/LeaderboardFooter.tsx`, game/page styles: real shared leaderboard tickers and matching result/error controls.
- `.env.example`, `vite.config.ts`, `README.md`, this document: local/production selection, required local port and operating notes.
- `tests/leaderboard-client.test.mjs`, `leaderboard-renderer.test.mjs`, `leaderboard-browser.mjs`: mocked protocol/lifecycle tests, real renderer tests and end-to-end browser verification.

Existing unrelated working-tree edits were retained. Work is on `codex/glass-game-leaderboard`, created from `feat/glass-game-mode`; no frontend deployment or backend mutation was performed.

### CORS follow-up (2026-10-05)

The alternate frontend at `http://127.0.0.1:5175` was rejected with `ORIGIN_DENIED`. On request, that exact origin was added to the backend allowlist and deployed to the existing Worker (version `8e53df85-8628-428c-8b30-a5775d14b3d6`). This follow-up supersedes the initial integration's no-backend-change status; game rules and database contents were not changed. `localhost:5175` is not implicitly allowed. Frontend connection errors now mention origin permission as well as network connectivity, because a browser can hide the JSON body of a CORS denial.


### jinki-v2 rollout (local implementation, not production deployment)

1. Deploy the backend that accepts both v1 and v2 first, after separate authorization. Keep v1 validation and receipts available until existing sessions expire.
2. Deploy this v2 frontend second. End any old local game and start a new one. Session creation must return v2 before gameplay starts; no fallback, token replacement, or conversion of already-played v1 runs is allowed.
3. Keep the dual-version backend during any frontend rollback. `SESSION_VERSION_MISMATCH` is terminal and instructs the player to start a new game.

This update changes frontend protocol/evidence/client, score and shared enemy-death handling, their tests, and these documents. Shared leaderboard caching, eligibility, area checks, timing/expiry, frozen completion and retry body, nickname normalization, developer exclusion, and request limits remain intact. Enemy deaths are counted only on a living-to-dead transition; respawns restore HP without resetting run evidence.

Validation: `npm run build`; `node --test tests/leaderboard-*.test.mjs tests/game-score.test.mjs tests/game-bonus.test.mjs`. API lifecycle tests use mocks only. Results tests render the real React desktop/mobile components against cached mock boards; they do not replace a manual browser/device playtest. No synthetic production submission, backend modification, or deployment was performed. Until the backend rollout, the production v1-only API may reject new v2 sessions.

Local verification result: 33 focused tests passed, including mocked session/submission lifecycle, real glass renderer attribution, one-time enemy deaths, and desktop/mobile React result rendering. TypeScript/Vite build passed. The optional `tests/leaderboard-browser.mjs` fixture was updated for v2 and current English controls but was not run in this update.
