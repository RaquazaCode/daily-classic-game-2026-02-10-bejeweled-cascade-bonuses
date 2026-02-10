import "./style.css";
import {
  BOARD_COLS,
  BOARD_ROWS,
  BOARD_X,
  BOARD_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GAME_SEED,
  GEM_COLORS,
  TILE_SIZE,
} from "./constants";
import { createInitialBoard } from "./board";
import { createRng, seedFromString } from "./rng";
import type { GameState } from "./types";

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
const context = canvas.getContext("2d");
if (!context) {
  throw new Error("Canvas context missing");
}
const ctx: CanvasRenderingContext2D = context;

const rng = createRng(seedFromString(GAME_SEED));

const state: GameState = {
  mode: "title",
  board: createInitialBoard(rng),
  selectedCell: null,
  score: 0,
  moves: 0,
  chainDepth: 0,
  bestChain: 0,
  lastMoveScore: 0,
  message: "Click to start",
  seed: GAME_SEED,
  pendingAnimations: [],
  rngState: rng.getState(),
};

function drawBootState() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#0a213a");
  gradient.addColorStop(1, "#071224");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const x = BOARD_X + col * TILE_SIZE;
      const y = BOARD_Y + row * TILE_SIZE;
      const gem = state.board[row][col];
      ctx.fillStyle = GEM_COLORS[gem];
      ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
    }
  }

  ctx.fillStyle = "#eaf4ff";
  ctx.font = "700 28px Trebuchet MS, sans-serif";
  ctx.fillText("Bejeweled: Cascading Bonuses", BOARD_X, 52);
  ctx.font = "16px Trebuchet MS, sans-serif";
  ctx.fillText("Deterministic board initialized with no pre-existing matches.", BOARD_X, 78);
}

drawBootState();
