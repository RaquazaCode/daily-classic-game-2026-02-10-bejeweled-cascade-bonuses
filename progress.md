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
- Generated baseline artifacts:
- screenshots in `assets/screenshots/`
- GIF captures in `assets/gifs/`
- Playwright state/screenshots in `playwright/`

## UX Remediation (Phaser Migration)
- Rebuilt runtime and rendering around Phaser 3.90.0.
- Enforced viewport fit + no-scroll layout (`overflow: hidden`, scale fit/center).
- Added menu-first flow with exactly two options:
- `Start Game`
- `How To Play`
- Added 3-panel `How To Play` walkthrough with `Back`, `Next`, `Start Game`.
- Migrated gameplay view to Phaser scene with animated gem effects and HUD.
- Preserved deterministic core and browser hook contract.
- Added remediation verification artifacts in `playwright/ux-remediation/`.

## Verification
- `pnpm test` (self-check): pass
- `pnpm build`: pass
- Scripted valid swap verification (`?scripted_swap=1`) produced:
- `score=550`
- `moves=1`
- `chainDepth=2`
- UX remediation captures include:
- menu (`01-menu`)
- how-to panels 1/2/3 (`02..04`)
- game start (`05`)
- invalid swap (`06`)
- paused (`07`)
- restart to menu (`08`)

## TODO / Next
- Push `codex/2026-02-10-phaser-ui-remediation` branch.
- Open PR to `main` and merge after required approval.
- Deploy updated build to Vercel with exclusions for heavy non-runtime artifacts.
- Record preview + claim links.
