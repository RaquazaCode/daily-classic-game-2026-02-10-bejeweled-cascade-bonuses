Original prompt: Implement the 2026-02-10 daily classic game run with continuity migration, Bejeweled build, snake-style README parity, micro-commit culture, and automation record updates.

## Progress
- Migrated prior Asteroids run to canonical `games/` location and updated active path references.
- Created standalone daily repo and pushed branches:
  - `main`
  - `codex/2026-02-10-bejeweled-cascade-bonuses`
- Implemented deterministic Bejeweled core:
  - seeded board initialization with no pre-existing matches
  - horizontal/vertical match detection and clear
  - clear/drop/refill cascade loop
  - cascade multipliers and chain tracking
  - pointer swap input with invalid-swap rollback
  - pause/resume and restart controls
  - fullscreen toggle
  - automation hooks (`advanceTime`, `render_game_to_text`)
- Generated visual artifacts:
  - screenshots in `assets/screenshots/`
  - 3 GIF captures in `assets/gifs/`
  - Playwright state/screenshots in `playwright/`

## Verification
- `pnpm test` (pass)
- `pnpm build` (pass)
- Scripted valid swap verification (`?scripted_swap=1`) produced:
  - `score=550`
  - `moves=1`
  - `chainDepth=2`

## TODO / Next
- Finalize automation metadata updates for 2026-02-10 (`catalog`, `.automation/state`, `INDEX`, report).
- Open PR from `codex/2026-02-10-bejeweled-cascade-bonuses` to `main` and merge.
- Run post-run repo hardening script on new GitHub repo.

## Final Verification (2026-02-10)
- `pnpm test` (bejeweled): pass
- `pnpm build` (bejeweled): pass
- `pnpm test` (asteroids migrated path): pass
- `pnpm build` (asteroids migrated path): pass
