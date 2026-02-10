# 2026-02-10 Bejeweled Cascade Bonuses Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an unattended-safe Bejeweled MVP with a deterministic cascade-bonus twist, full run artifacts in `games/2026-02-10-bejeweled-cascade-bonuses/`, and automation records updated for the next daily run.

**Architecture:** Build a deterministic grid-based match-3 game in TypeScript + Vite, with frame-step simulation and swap/match/cascade phases driven by explicit state transitions. Use a date-seeded RNG for reproducible board refill and deterministic test hooks (`window.advanceTime`, `window.render_game_to_text`). Keep game artifacts isolated in the game folder and keep automation metadata in `.automation/` + `data/`.

**Tech Stack:** Vite 7, TypeScript 5, browser Canvas 2D, pnpm scripts, lightweight Node self-check script.

---

## Locked Decisions (Recovered After Crash)
- Selected game: `bejeweled` (rank #1 in `.automation/next_30_queue.json`).
- Twist: `Cascading bonuses` (first deterministic choice from `twist_candidates`).
- Folder standard moving forward: `games/YYYY-MM-DD-<slug>/`.
- Commit culture: micro-commits every 2-5 minute logical checkpoint.
- Scope: forward-only with minimal config/doc fixes (no full migration of historical entries).
- Publish flow default used to unblock crash interruption: `codex/...` feature branch + PR merge to `main` in the per-day repo.

## Canonical Structure (Now and Forward)
- Automation root: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game`
- Daily artifact root (all new runs):
  - `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/`
- Required per-game files/folders for this run:
  - `README.md`
  - `design.md`
  - `progress.md`
  - `docs/plans/`
  - `src/`
  - `assets/`
  - `package.json`
  - `pnpm-lock.yaml`
  - `scripts/self_check.mjs`
  - `playwright_actions.json`
  - `playwright/` (artifacts from verification)

## Public Interfaces / Hooks
- Browser globals (required):
  - `window.advanceTime(ms: number): void`
  - `window.render_game_to_text(): string`
- Keyboard controls:
  - `P` pause/resume
  - `R` restart
- Pointer controls:
  - Click-drag or click-select to swap adjacent gems.

## Determinism Contract
- Use seeded RNG (`seed = "2026-02-10-bejeweled-cascade-bonuses"`) for initial fill and refill.
- Fixed simulation step (`1/60`) in update loop.
- No use of uncontrolled `Math.random()` in game state transitions.
- `render_game_to_text()` returns stable JSON snapshot ordering for deterministic diffing.

---

### Task 1: Scaffold Daily Game Folder + Tooling

**Files:**
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/package.json`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/tsconfig.json`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/index.html`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/main.ts`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/style.css`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/scripts/self_check.mjs`

**Steps:**
1. Scaffold minimal Vite TS app structure with `pnpm` scripts: `dev`, `build`, `test`, `preview`.
2. Add initial canvas mount and empty loop placeholders.
3. Run `pnpm install` in the game folder.
4. Micro-commit.

**Commit message:**
- `chore: scaffold 2026-02-10 bejeweled game workspace`

---

### Task 2: Define Core Types and Constants

**Files:**
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/constants.ts`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/types.ts`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/rng.ts`

**Steps:**
1. Define board constants (8x8 grid, tile size, gem set).
2. Define game phases (`idle`, `swapping`, `resolving`, `dropping`, `refilling`, `paused`, `gameover`).
3. Implement deterministic PRNG helpers.
4. Micro-commit.

**Commit message:**
- `feat(core): add deterministic board types and constants`

---

### Task 3: Build Board Initialization With No Pre-existing Matches

**Files:**
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/board.ts`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/main.ts`

**Steps:**
1. Implement seeded board generation that avoids initial 3-in-a-row.
2. Add helper for adjacency check and candidate swap validation.
3. Initialize state with deterministic seed + initial board.
4. Add self-check assertion that initial board has zero matches.
5. Micro-commit.

**Commit message:**
- `feat(board): generate deterministic no-match starting board`

---

### Task 4: Implement Match Detection and Resolution

**Files:**
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/match.ts`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/board.ts`

**Steps:**
1. Detect horizontal and vertical matches (`>=3`).
2. Mark matched cells and clear them.
3. Award base score per cleared gem.
4. Add self-check assertion for known match patterns.
5. Micro-commit.

**Commit message:**
- `feat(match): add horizontal and vertical match resolution`

---

### Task 5: Implement Drop + Refill Pipeline

**Files:**
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/cascade.ts`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/board.ts`

**Steps:**
1. Apply gravity per column to drop gems into empty slots.
2. Refill top cells using seeded RNG.
3. Loop resolve/drop/refill until stable board.
4. Add self-check for deterministic post-cascade board from fixed seed + scripted swap.
5. Micro-commit.

**Commit message:**
- `feat(cascade): add deterministic drop and refill loop`

---

### Task 6: Implement Twist - Cascading Bonuses

**Files:**
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/cascade.ts`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/types.ts`

**Steps:**
1. Track cascade chain depth per move.
2. Apply score multiplier (`x1`, `x2`, `x3+`) for each additional chain.
3. Reset chain depth when board stabilizes and next input begins.
4. Add `lastCascadeDepth` and `lastMoveScore` fields for observability.
5. Micro-commit.

**Commit message:**
- `feat(twist): add cascading bonus multipliers`

---

### Task 7: Input + State Machine + Pause/Restart

**Files:**
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/input.ts`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/main.ts`

**Steps:**
1. Implement pointer selection/swapping for adjacent gems.
2. Reject invalid swaps (non-adjacent or no resulting match) with revert.
3. Add key handlers for `P` pause and `R` full restart.
4. Ensure no board mutation while paused.
5. Micro-commit.

**Commit message:**
- `feat(input): add swap controls with pause and restart`

---

### Task 8: Rendering and HUD

**Files:**
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/render.ts`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/style.css`

**Steps:**
1. Render board, selection highlight, and simple gem visuals.
2. Render HUD: score, best chain, move count, paused state.
3. Render deterministic status text for self-check readability.
4. Micro-commit.

**Commit message:**
- `feat(render): draw board and cascade bonus hud`

---

### Task 9: Automation Hooks + Self-Check Coverage

**Files:**
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/src/main.ts`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/scripts/self_check.mjs`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/playwright_actions.json`

**Steps:**
1. Expose `window.advanceTime(ms)`.
2. Expose `window.render_game_to_text()` with stable JSON keys.
3. Self-check verifies hooks exist and deterministic text snapshots match expected structure.
4. Add canned Playwright input actions for quick unattended run checks.
5. Micro-commit.

**Commit message:**
- `test: add deterministic hooks and scripted self-check`

---

### Task 10: Run Verification

**Files:**
- Generate artifacts in: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/playwright/`

**Steps:**
1. Run `pnpm test`.
2. Run `pnpm build`.
3. Run Playwright capture script (if available in environment) to produce screenshots + console error report.
4. If verification fails and cannot be fixed quickly, stop implementation and write blocked report.
5. Micro-commit only when green.

**Commit message:**
- `chore: verify bejeweled build and deterministic runtime hooks`

---

### Task 11: Game Documentation in Game Folder

**Files:**
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/README.md`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/design.md`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/progress.md`
- Keep: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/docs/plans/2026-02-10-bejeweled-cascade-bonuses-implementation.md`

**Steps:**
1. Document controls, rules, twist, and deterministic hooks.
2. Record implementation timeline and verification evidence in `progress.md`.
3. Ensure no root-level `docs/` or `progress.md` is created.
4. Micro-commit.

**Commit message:**
- `docs: add bejeweled design, readme, and progress log`

---

### Task 12: Per-Day Repository and Micro-Commit Publish Workflow

**Files:**
- Repo root: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/games/2026-02-10-bejeweled-cascade-bonuses/`

**Steps:**
1. Initialize git in the daily game folder.
2. Create branch `codex/2026-02-10-bejeweled-cascade-bonuses`.
3. Push branch to new remote repo: `daily-classic-game-2026-02-10-bejeweled-cascade-bonuses`.
4. Open PR into `main` preserving micro-commit history.
5. Merge PR and push `main`.
6. Run repo hardening script.

**Commit message pattern:**
- Keep prior micro-commit messages intact (no squash).

---

### Task 13: Automation Metadata + Forward-Only Minimal Policy Fixes

**Files:**
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/data/game_catalog.json`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/data/game_catalog.csv`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/.automation/state.json`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/.automation/next_30_queue.json`
- Modify: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/INDEX.md`
- Create: `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/.automation/reports/2026-02-10.md`
- Modify (minimal forward fix): `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/automation.toml`
- Modify (minimal forward fix): `/Users/testaccountforsystem-wideissues/.codex/automations/daily-classic-game/.automation/OPERATIONS.md`

**Steps:**
1. Mark `bejeweled` as `built` in catalog JSON/CSV.
2. Append run metadata in `.automation/state.json`.
3. Recompute/update queue and run `pnpm run validate:catalog`.
4. Add report entry for 2026-02-10.
5. Update `INDEX.md` with new game location in `games/` path.
6. Forward-only path fixes:
   - `automation.toml` prompt canonical folder format -> `games/YYYY-MM-DD-<slug>/`
   - `.automation/OPERATIONS.md` canonical root/path text -> current automation root + `games/`
7. Micro-commit.

**Commit message:**
- `chore(automation): record 2026-02-10 run and align forward path rules`

---

## Test Matrix (Must Pass)
1. Install/build health:
   - `pnpm install`
   - `pnpm test`
   - `pnpm build`
2. Gameplay correctness:
   - Valid adjacent swap that forms match increments score.
   - Invalid swap reverts and does not mutate final board.
   - Cascades trigger multipliers and persist only for active chain.
3. Controls:
   - `P` pauses updates.
   - `R` resets game state.
4. Determinism:
   - Same seed + same scripted input -> same `render_game_to_text()` output.
5. Automation hooks:
   - `window.advanceTime` exists and advances simulation.
   - `window.render_game_to_text` exists and returns JSON string.
6. Automation metadata integrity:
   - `pnpm run validate:catalog` exits 0.

## Acceptance Criteria
- New game exists under `games/2026-02-10-bejeweled-cascade-bonuses/` with all required artifacts.
- Game is playable, deterministic, and includes cascade bonus twist.
- Verification commands pass.
- Daily repo created + hardened + PR workflow used.
- Catalog/state/queue/report/index updated.
- No new root-level daily run artifacts outside the game folder.

## Assumptions and Defaults
- Crash-interrupted publish-flow decision defaults to `feature branch + PR merge`.
- Historical `2026/` entries remain unchanged in this run (forward-only policy).
- If queue refresh script is missing, implement minimal deterministic queue refresh logic before metadata update.
- If GitHub CLI auth is unavailable, run all local steps, mark publish as blocked in report, and stop cleanly.

