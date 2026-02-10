# Bejeweled Cascade Bonuses - Design

## Goal
Deliver a deterministic Bejeweled-style match-3 experience with a modern Phaser UI, menu-first onboarding, and stable browser hooks for automation.

## UX Remediation Scope
1. Full viewport fit with no page scroll.
2. First-load menu with exactly two options:
- `Start Game`
- `How To Play`
3. Three onboarding panels with explicit controls/rules/scoring guidance.
4. Phaser scene migration while reusing deterministic core logic modules.

## Scene Architecture
- `MenuScene`
- Displays title, summary, and two primary actions (`Start Game`, `How To Play`).
- `HowToScene`
- Multi-panel tutorial with `Back`, `Next`, `Start Game`.
- `GameScene`
- Renders board/HUD, handles gem click swaps, pause/restart/fullscreen, and feedback overlays.

## Determinism + Logic Reuse
- Seed: `2026-02-10-bejeweled-cascade-bonuses`
- Source-of-truth logic remains in:
- `board.ts`
- `match.ts`
- `cascade.ts`
- `rng.ts`
- No uncontrolled `Math.random()` in board evolution.
- Restart always reproduces the same seeded initial state.

## Inputs
- Mouse: select and swap adjacent gems.
- Keyboard:
- `P` pause/resume
- `R` restart
- `F` fullscreen

## Scoring
- Base: `50` per cleared gem.
- Multipliers:
- chain 1 -> `x1`
- chain 2 -> `x2`
- chain 3+ -> `x3`

## Browser Hooks (Preserved Contract)
- `window.advanceTime(ms)`
- `window.render_game_to_text()`
- Snapshot keys unchanged:
- `mode`, `score`, `moves`, `chainDepth`, `bestChain`, `board`, `selectedCell`, `pendingAnimations`, `seed`

## Fit Policy
- Phaser scale mode uses `FIT` + `CENTER_BOTH`.
- CSS hard-locks `html/body/#app` to viewport with `overflow: hidden`.
- Board and HUD are laid out to remain visible in single-screen capture at common desktop sizes.

## Done Means
- No-scroll viewport behavior verified.
- Menu-first onboarding + 3 tutorial panels verified.
- Phaser runtime active and visually modernized.
- Hook payload compatibility preserved.
- `pnpm test` and `pnpm build` pass.
- Playwright artifacts capture menu, tutorial, gameplay, invalid swap, pause, restart states.
