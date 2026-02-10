import { createInitialBoard, isAdjacent, swapCells } from "../board";
import { resolveCascadeLoop } from "../cascade";
import { GAME_SEED } from "../constants";
import { hasMatches } from "../match";
import { createRng, seedFromString, type RNG } from "../rng";
import type { Cell, GameSnapshot, GameState } from "../types";

type RuntimeListener = (state: GameState) => void;

const DEFAULT_TITLE_MESSAGE = "Select Start Game or How To Play";

export class BejeweledRuntime {
  private rng: RNG;
  private listeners = new Set<RuntimeListener>();
  private state: GameState;

  constructor(seed = GAME_SEED) {
    this.rng = createRng(seedFromString(seed));
    this.state = {
      mode: "title",
      board: createInitialBoard(this.rng),
      selectedCell: null,
      score: 0,
      moves: 0,
      chainDepth: 0,
      bestChain: 0,
      lastMoveScore: 0,
      lastMultiplier: 1,
      bonusTrail: [],
      message: DEFAULT_TITLE_MESSAGE,
      seed,
      pendingAnimations: [],
      rngState: this.rng.getState(),
    };
  }

  subscribe(listener: RuntimeListener) {
    this.listeners.add(listener);
    listener(this.snapshotState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState() {
    return this.snapshotState();
  }

  getSnapshot(): GameSnapshot {
    return {
      mode: this.state.mode,
      score: this.state.score,
      moves: this.state.moves,
      chainDepth: this.state.chainDepth,
      bestChain: this.state.bestChain,
      board: this.state.board.map((row) => row.slice()),
      selectedCell: this.state.selectedCell ? { ...this.state.selectedCell } : null,
      pendingAnimations: this.state.pendingAnimations.slice(),
      seed: this.state.seed,
      coordinateSystem: "Board matrix with origin (row=0,col=0) at top-left.",
    };
  }

  advanceTime(_ms: number) {
    // Deterministic runtime currently processes transitions synchronously.
  }

  enterMenu() {
    this.state.mode = "title";
    this.state.selectedCell = null;
    this.state.message = DEFAULT_TITLE_MESSAGE;
    this.emit();
  }

  enterHowTo() {
    this.state.mode = "howto";
    this.state.selectedCell = null;
    this.state.message = "How To Play";
    this.emit();
  }

  startGame() {
    this.state.mode = "playing";
    this.state.message = "Select an adjacent gem to swap";
    this.emit();
  }

  pause() {
    if (this.state.mode !== "playing") {
      return;
    }

    this.state.mode = "paused";
    this.state.message = "Paused";
    this.emit();
  }

  resume() {
    if (this.state.mode !== "paused") {
      return;
    }

    this.state.mode = "playing";
    this.state.message = "Resumed";
    this.emit();
  }

  togglePause() {
    if (this.state.mode === "playing") {
      this.pause();
      return;
    }

    if (this.state.mode === "paused") {
      this.resume();
    }
  }

  restart() {
    this.rng = createRng(seedFromString(this.state.seed));
    this.state.mode = "title";
    this.state.board = createInitialBoard(this.rng);
    this.state.selectedCell = null;
    this.state.score = 0;
    this.state.moves = 0;
    this.state.chainDepth = 0;
    this.state.bestChain = 0;
    this.state.lastMoveScore = 0;
    this.state.lastMultiplier = 1;
    this.state.bonusTrail = [];
    this.state.pendingAnimations = [];
    this.state.message = DEFAULT_TITLE_MESSAGE;
    this.state.rngState = this.rng.getState();
    this.emit();
  }

  handleGemClick(cell: Cell) {
    if (this.state.mode === "title" || this.state.mode === "howto") {
      // In overlay-driven UX, title/howto clicks should not auto-start gameplay.
      return;
    }

    if (this.state.mode === "paused") {
      return;
    }

    if (!this.state.selectedCell) {
      this.state.selectedCell = cell;
      this.state.message = "Select an adjacent gem to swap";
      this.emit();
      return;
    }

    if (this.isSameCell(this.state.selectedCell, cell)) {
      this.state.selectedCell = null;
      this.state.message = "Selection cleared";
      this.emit();
      return;
    }

    this.attemptSwap(this.state.selectedCell, cell);
  }

  applyScriptedSwap(from: Cell, to: Cell) {
    if (this.state.mode !== "playing") {
      this.state.mode = "playing";
    }
    this.state.selectedCell = from;
    this.attemptSwap(from, to, { successMessage: "Scripted valid swap executed" });
  }

  private attemptSwap(from: Cell, to: Cell, options?: { successMessage?: string }) {
    if (!isAdjacent(from, to)) {
      this.state.selectedCell = to;
      this.state.pendingAnimations = [{ type: "swap", detail: "rejected-non-adjacent" }];
      this.state.message = "Select adjacent gems to swap";
      this.emit();
      return false;
    }

    const swapped = swapCells(this.state.board, from, to);
    if (!hasMatches(swapped)) {
      this.state.selectedCell = to;
      this.state.pendingAnimations = [{ type: "swap", detail: "reverted-invalid" }];
      this.state.message = "Invalid swap: no match created";
      this.emit();
      return false;
    }

    const resolved = resolveCascadeLoop(swapped, this.rng);
    this.state.board = resolved.board;
    this.state.moves += 1;
    this.state.score += resolved.scoreDelta;
    this.state.chainDepth = resolved.chainDepth;
    this.state.bestChain = Math.max(this.state.bestChain, resolved.chainDepth);
    this.state.lastMoveScore = resolved.scoreDelta;
    this.state.lastMultiplier = resolved.lastMultiplier;
    this.state.bonusTrail = resolved.bonusTrail;
    this.state.pendingAnimations = [
      { type: "swap", detail: "valid" },
      ...resolved.pendingAnimations,
    ];
    this.state.selectedCell = null;
    this.state.rngState = this.rng.getState();
    this.state.message = options?.successMessage ?? `Resolved chain depth ${resolved.chainDepth} (+${resolved.scoreDelta})`;
    this.emit();
    return true;
  }

  private isSameCell(a: Cell | null, b: Cell | null) {
    if (!a || !b) {
      return false;
    }
    return a.row === b.row && a.col === b.col;
  }

  private emit() {
    const snapshot = this.snapshotState();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  private snapshotState(): GameState {
    return {
      ...this.state,
      board: this.state.board.map((row) => row.slice()),
      selectedCell: this.state.selectedCell ? { ...this.state.selectedCell } : null,
      bonusTrail: this.state.bonusTrail.slice(),
      pendingAnimations: this.state.pendingAnimations.slice(),
    };
  }
}
