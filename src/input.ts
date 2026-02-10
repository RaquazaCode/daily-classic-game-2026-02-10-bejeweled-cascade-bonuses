import { BOARD_COLS, BOARD_ROWS, BOARD_X, BOARD_Y, TILE_SIZE } from "./constants";
import type { Cell } from "./types";

export function cellFromCanvasPoint(x: number, y: number): Cell | null {
  const col = Math.floor((x - BOARD_X) / TILE_SIZE);
  const row = Math.floor((y - BOARD_Y) / TILE_SIZE);

  if (row < 0 || row >= BOARD_ROWS || col < 0 || col >= BOARD_COLS) {
    return null;
  }

  return { row, col };
}

export function isSameCell(a: Cell | null, b: Cell | null) {
  if (!a || !b) return false;
  return a.row === b.row && a.col === b.col;
}
