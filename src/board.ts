import { BOARD_COLS, BOARD_ROWS, GEM_TYPES } from "./constants";
import type { Board, Cell } from "./types";
import type { RNG } from "./rng";

export function createInitialBoard(rng: RNG): Board {
  const board: Board = Array.from({ length: BOARD_ROWS }, () => Array(BOARD_COLS).fill(0));

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      board[row][col] = pickGemWithoutImmediateMatch(board, row, col, rng);
    }
  }

  return board;
}

function pickGemWithoutImmediateMatch(board: Board, row: number, col: number, rng: RNG) {
  const blocked = new Set<number>();

  if (col >= 2 && board[row][col - 1] === board[row][col - 2]) {
    blocked.add(board[row][col - 1]);
  }

  if (row >= 2 && board[row - 1][col] === board[row - 2][col]) {
    blocked.add(board[row - 1][col]);
  }

  const pool: number[] = [];
  for (let gem = 0; gem < GEM_TYPES; gem += 1) {
    if (!blocked.has(gem)) {
      pool.push(gem);
    }
  }

  return pool[rng.nextInt(pool.length)];
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.slice());
}

export function inBounds(cell: Cell) {
  return cell.row >= 0 && cell.row < BOARD_ROWS && cell.col >= 0 && cell.col < BOARD_COLS;
}

export function isAdjacent(a: Cell, b: Cell) {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function swapCells(board: Board, a: Cell, b: Cell) {
  const next = cloneBoard(board);
  const temp = next[a.row][a.col];
  next[a.row][a.col] = next[b.row][b.col];
  next[b.row][b.col] = temp;
  return next;
}

export function hasAnyImmediateMatches(board: Board) {
  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      const gem = board[row][col];
      if (col + 2 < BOARD_COLS && board[row][col + 1] === gem && board[row][col + 2] === gem) {
        return true;
      }
      if (row + 2 < BOARD_ROWS && board[row + 1][col] === gem && board[row + 2][col] === gem) {
        return true;
      }
    }
  }
  return false;
}

export function boardKey(board: Board) {
  return board.map((row) => row.join("")).join("|");
}
