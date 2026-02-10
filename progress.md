Original prompt: Implement the 2026-02-10 daily classic game run with continuity migration, Bejeweled build, snake-style README parity, micro-commit culture, and automation record updates.

## Progress
- Completed modernization branch: `codex/2026-02-10-react-tailwind-luxe-audio`.
- Added hybrid React + Phaser runtime layout:
- React/Tailwind overlay for menu, how-to, HUD, and controls.
- Phaser board scene retained for deterministic gameplay and rendering effects.
- Added modern visual treatment:
- luxe gradients, glass surfaces, board framing
- vignette post-processing shader
- pulse + sparkle feedback on resolves/invalid swaps
- Added ambient music system:
- local CC0 loops in `assets/audio/`
- autoplay attempt + graceful browser unlock fallback
- interactive music toggle in UI
- Preserved automation contract:
- `window.advanceTime(ms)`
- `window.render_game_to_text()`
- `GameSnapshot` field compatibility preserved.

## Verification
- `pnpm test`: pass
- `pnpm build`: pass
- Generated new visual/state artifacts in `playwright/react-luxe/`:
- menu
- how-to panels 1/2/3
- gameplay
- invalid swap
- paused
- resumed
- restart to menu

## Notes
- The legacy canvas-only web-game client may produce black screenshots with this React+overlay+shader setup in some contexts.
- Reliable artifact generation for this version is standardized via:
- `node scripts/capture_react_luxe.mjs`

## TODO / Next
- Complete PR #3 checks/review and merge to `main`.
- Re-deploy merged `main` to Vercel and verify claimable preview.
- Update automation guidance with the force-push micro-commit + protection-restore policy.
