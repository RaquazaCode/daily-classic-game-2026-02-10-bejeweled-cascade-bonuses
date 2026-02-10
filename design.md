# Bejeweled Cascade Bonuses - Design

## Goal
Deliver an unattended-safe, deterministic Bejeweled-style match-3 game with cascading bonus multipliers and test hooks for automation playback.

## Core Loop
1. Player selects and swaps adjacent gems.
2. Invalid swaps are reverted.
3. Valid matches are cleared.
4. Gems drop downward and refill from deterministic RNG.
5. Additional matches from refill trigger cascade chains and score multipliers.

## Determinism
- Seed: `2026-02-10-bejeweled-cascade-bonuses`
- Fixed-step loop: `1/60`
- No direct `Math.random()` in board evolution.
- Snapshot hook reports stable JSON payload for regression checks.

## Inputs
- Mouse click selection/swap.
- `P`: pause/resume.
- `R`: restart run.
- `F`: fullscreen toggle.

## Scoring
- Base: `50` points per cleared gem.
- Cascade multipliers:
- chain 1 -> `x1`
- chain 2 -> `x2`
- chain 3+ -> `x3`

## Browser Hooks
- `window.advanceTime(ms)` for deterministic stepping.
- `window.render_game_to_text()` for state extraction.

## Done Means
- Deterministic board init and cascade resolution.
- Valid/invalid swap behavior implemented.
- Pause/restart working.
- Visual HUD shows score/moves/chain details.
- Test/build pass and Playwright artifacts are generated.
