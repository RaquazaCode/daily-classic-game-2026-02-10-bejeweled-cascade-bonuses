import {
  BOARD_COLS,
  BOARD_ROWS,
  BOARD_X,
  BOARD_Y,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GEM_COLORS,
  TILE_SIZE,
} from "./constants";
import type { GameState } from "./types";

export function render(state: GameState, ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawBackground(ctx);
  drawBoard(state, ctx);
  drawHud(state, ctx);
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, "#0a213a");
  gradient.addColorStop(1, "#071224");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = "#9fcbff";
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(BOARD_X + i * 95, 18);
    ctx.lineTo(BOARD_X + i * 82, 108);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBoard(state: GameState, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "rgba(15, 27, 48, 0.78)";
  ctx.fillRect(BOARD_X - 8, BOARD_Y - 8, BOARD_COLS * TILE_SIZE + 16, BOARD_ROWS * TILE_SIZE + 16);

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const x = BOARD_X + col * TILE_SIZE;
      const y = BOARD_Y + row * TILE_SIZE;

      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);

      const gem = state.board[row][col];
      drawGem(ctx, x, y, GEM_COLORS[gem]);

      if (state.selectedCell?.row === row && state.selectedCell.col === col) {
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 5, y + 5, TILE_SIZE - 10, TILE_SIZE - 10);
      }
    }
  }
}

function drawGem(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const pad = 10;
  const size = TILE_SIZE - pad * 2;
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(size / 2, 0);
  ctx.lineTo(0, size / 2);
  ctx.lineTo(-size / 2, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(-size * 0.2, -size * 0.35);
  ctx.lineTo(size * 0.08, -size * 0.12);
  ctx.lineTo(-size * 0.14, size * 0.06);
  ctx.lineTo(-size * 0.33, -size * 0.12);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawHud(state: GameState, ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = "#eaf4ff";
  ctx.font = "700 29px Trebuchet MS, sans-serif";
  ctx.fillText("Bejeweled: Cascading Bonuses", BOARD_X, 42);

  ctx.font = "16px Trebuchet MS, sans-serif";
  ctx.fillText(`Mode: ${state.mode}`, BOARD_X, 72);
  ctx.fillText(`Score: ${state.score}`, BOARD_X + 170, 72);
  ctx.fillText(`Moves: ${state.moves}`, BOARD_X + 320, 72);
  ctx.fillText(`Chain: ${state.chainDepth}`, BOARD_X + 450, 72);
  ctx.fillText(`Best chain: ${state.bestChain}`, BOARD_X + 560, 72);
  ctx.fillText(`Last multiplier: x${state.lastMultiplier}`, BOARD_X, 97);
  ctx.fillText(`Last move score: +${state.lastMoveScore}`, BOARD_X + 220, 97);

  ctx.fillStyle = state.mode === "paused" ? "#ffd166" : "#d8ebff";
  ctx.fillText(state.message, BOARD_X + 470, 97);

  if (state.mode === "title") {
    drawCenterText(ctx, "Click any gem to start", 24, -10);
    drawCenterText(ctx, "Controls: Mouse swap, P pause, R restart, F fullscreen", 16, 22);
  }

  if (state.mode === "paused") {
    drawCenterText(ctx, "PAUSED", 34, 0);
  }
}

function drawCenterText(ctx: CanvasRenderingContext2D, text: string, size: number, offsetY: number) {
  ctx.save();
  ctx.textAlign = "center";
  ctx.fillStyle = "#f7fbff";
  ctx.font = `700 ${size}px Trebuchet MS, sans-serif`;
  ctx.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + offsetY);
  ctx.restore();
}
