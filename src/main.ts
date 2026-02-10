import "./style.css";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GAME_SEED,
  STEP_SECONDS,
} from "./constants";
import { createInitialBoard, isAdjacent, swapCells } from "./board";
import { resolveCascadeLoop } from "./cascade";
import { hasMatches } from "./match";
import { cellFromCanvasPoint, isSameCell } from "./input";
import { createRng, seedFromString } from "./rng";
import { render } from "./render";
import type { Cell, GameState } from "./types";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) {
  throw new Error("App root missing");
}

app.innerHTML = `
  <div class="shell">
    <canvas id="game" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}"></canvas>
  </div>
`;

const canvas = document.querySelector<HTMLCanvasElement>("#game");
if (!canvas) {
  throw new Error("Canvas missing");
}
const gameCanvas: HTMLCanvasElement = canvas;
const context = canvas.getContext("2d");
if (!context) {
  throw new Error("Canvas context missing");
}
const ctx: CanvasRenderingContext2D = context;

let rng = createRng(seedFromString(GAME_SEED));

const state: GameState = {
  mode: "title",
  board: createInitialBoard(rng),
  selectedCell: null,
  score: 0,
  moves: 0,
  chainDepth: 0,
  bestChain: 0,
  lastMoveScore: 0,
  lastMultiplier: 1,
  bonusTrail: [],
  message: "Click a gem to start",
  seed: GAME_SEED,
  pendingAnimations: [],
  rngState: rng.getState(),
};

let last = performance.now();
let accumulator = 0;

function resetRun() {
  rng = createRng(seedFromString(state.seed));
  state.mode = "title";
  state.board = createInitialBoard(rng);
  state.selectedCell = null;
  state.score = 0;
  state.moves = 0;
  state.chainDepth = 0;
  state.bestChain = 0;
  state.lastMoveScore = 0;
  state.lastMultiplier = 1;
  state.bonusTrail = [];
  state.pendingAnimations = [];
  state.message = "Click a gem to start";
  state.rngState = rng.getState();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    gameCanvas.requestFullscreen().catch(() => undefined);
    return;
  }
  document.exitFullscreen().catch(() => undefined);
}

function attemptSwap(from: Cell, to: Cell) {
  if (!isAdjacent(from, to)) {
    state.selectedCell = to;
    state.message = "Select adjacent gems to swap";
    return;
  }

  const swapped = swapCells(state.board, from, to);
  if (!hasMatches(swapped)) {
    state.selectedCell = to;
    state.pendingAnimations = [{ type: "swap", detail: "reverted-invalid" }];
    state.message = "Invalid swap: no match created";
    return;
  }

  const resolved = resolveCascadeLoop(swapped, rng);
  state.board = resolved.board;
  state.moves += 1;
  state.score += resolved.scoreDelta;
  state.chainDepth = resolved.chainDepth;
  state.bestChain = Math.max(state.bestChain, resolved.chainDepth);
  state.lastMoveScore = resolved.scoreDelta;
  state.lastMultiplier = resolved.lastMultiplier;
  state.bonusTrail = resolved.bonusTrail;
  state.pendingAnimations = [{ type: "swap", detail: "valid" }, ...resolved.pendingAnimations];
  state.selectedCell = null;
  state.rngState = rng.getState();
  state.message = `Resolved chain depth ${resolved.chainDepth} (+${resolved.scoreDelta})`;
}

gameCanvas.addEventListener("click", (event) => {
  const rect = gameCanvas.getBoundingClientRect();
  const scaleX = gameCanvas.width / rect.width;
  const scaleY = gameCanvas.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const cell = cellFromCanvasPoint(x, y);
  if (!cell) return;

  if (state.mode === "title") {
    state.mode = "playing";
  }
  if (state.mode === "paused") {
    return;
  }

  if (!state.selectedCell) {
    state.selectedCell = cell;
    state.message = "Select an adjacent gem to swap";
    return;
  }

  if (isSameCell(state.selectedCell, cell)) {
    state.selectedCell = null;
    state.message = "Selection cleared";
    return;
  }

  attemptSwap(state.selectedCell, cell);
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "p") {
    if (state.mode === "playing") {
      state.mode = "paused";
      state.message = "Paused";
    } else if (state.mode === "paused") {
      state.mode = "playing";
      state.message = "Resumed";
    }
  }

  if (key === "r") {
    resetRun();
  }

  if (key === "f") {
    toggleFullscreen();
  }
});

function step(_dt: number) {
  // Deterministic loop hook for automation stepping.
}

function loop(now: number) {
  const delta = Math.min(0.1, (now - last) / 1000);
  last = now;
  accumulator += delta;

  while (accumulator >= STEP_SECONDS) {
    step(STEP_SECONDS);
    accumulator -= STEP_SECONDS;
  }

  render(state, ctx);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

window.advanceTime = (ms: number) => {
  const steps = Math.max(1, Math.round(ms / (STEP_SECONDS * 1000)));
  for (let i = 0; i < steps; i += 1) {
    step(STEP_SECONDS);
  }
  render(state, ctx);
};

window.render_game_to_text = () => {
  const payload = {
    mode: state.mode,
    score: state.score,
    moves: state.moves,
    chainDepth: state.chainDepth,
    bestChain: state.bestChain,
    board: state.board,
    selectedCell: state.selectedCell,
    pendingAnimations: state.pendingAnimations,
    seed: state.seed,
    coordinateSystem: "Origin (0,0) is top-left. +x right, +y down.",
  };
  return JSON.stringify(payload);
};

declare global {
  interface Window {
    advanceTime: (ms: number) => void;
    render_game_to_text: () => string;
  }
}
