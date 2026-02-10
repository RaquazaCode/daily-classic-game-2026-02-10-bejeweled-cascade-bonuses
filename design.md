# Bejeweled Cascade Bonuses - Design

## Goal
Deliver a deterministic Bejeweled match-3 with a premium modern presentation using a hybrid React + Phaser architecture, while preserving automation contracts and seeded reproducibility.

## Architecture
- Phaser remains authoritative for board state evolution, swap logic, cascade resolution, and keyboard gameplay controls.
- React + Tailwind renders modern overlay UX:
- top HUD (stats, mode badge, progress meter, status message)
- menu modal
- multi-panel how-to modal
- bottom action/audio control tray
- Runtime state bridge:
- React subscribes to `BejeweledRuntime` updates and renders from current snapshot.
- Phaser scenes consume the same runtime instance.

## Visual Direction
- Minimal-luxury palette (deep navy base, cool-cyan accents, restrained glow).
- Board-first composition with reduced HUD clutter inside canvas.
- Subtle post-processing via `LuxeVignettePipeline` plus pulse/sparkle feedback on interactions.

## Audio Strategy
- Local bundled CC0 loops in `assets/audio/`.
- `AudioDirector` coordinates:
- base ambient loop
- optional glow layer for deeper chains
- autoplay attempt + browser-block fallback on first interaction
- inline music enable/disable control in overlay.

## Input + Modes
- Pointer swap behavior is active only in gameplay modes.
- Title/how-to overlay buttons own mode transitions.
- Keyboard:
- `P` pause/resume
- `R` restart (same seed)
- `F` fullscreen

## Determinism
- Seed remains `2026-02-10-bejeweled-cascade-bonuses`.
- No uncontrolled randomness in runtime evolution.
- Restart regenerates the same initial deterministic board.

## Preserved Hook Contract
- `window.advanceTime(ms)`
- `window.render_game_to_text()`

`GameSnapshot` keys remain preserved and explicit:
- `mode`
- `score`
- `moves`
- `chainDepth`
- `bestChain`
- `board`
- `selectedCell`
- `pendingAnimations`
- `seed`
- `coordinateSystem`

## Verification Approach
- `pnpm test` self-check validates presence of runtime hooks, React/Tailwind integration, shader pipeline, and audio assets.
- `pnpm build` validates type-safe production bundle.
- `scripts/capture_react_luxe.mjs` captures menu/how-to/gameplay/invalid/pause/restart states with matching `state-*.json` snapshots.
