import { BOARD_COLS, BOARD_ROWS } from "./constants";
import { cloneBoard } from "./board";
import type { Board } from "./types";

const EMPTY = -1;

type MatchResult = {
  cells: Array<[number, number]>;
  count: number;
};

export function findMatches(board: Board): MatchResult {
  const hit = new Set<string>();

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    let runStart = 0;
    for (let col = 1; col <= BOARD_COLS; col += 1) {
      const previous = board[row][col - 1];
      const current = col < BOARD_COLS ? board[row][col] : Number.NaN;
      const same = col < BOARD_COLS && previous === current && previous !== EMPTY;

      if (!same) {
        const runLength = col - runStart;
        if (previous !== EMPTY && runLength >= 3) {
          for (let c = runStart; c < col; c += 1) {
            hit.add(`${row},${c}`);
          }
        }
        runStart = col;
      }
    }
  }

  for (let col = 0; col < BOARD_COLS; col += 1) {
    let runStart = 0;
    for (let row = 1; row <= BOARD_ROWS; row += 1) {
      const previous = board[row - 1][col];
      const current = row < BOARD_ROWS ? board[row][col] : Number.NaN;
      const same = row < BOARD_ROWS && previous === current && previous !== EMPTY;

      if (!same) {
        const runLength = row - runStart;
        if (previous !== EMPTY && runLength >= 3) {
          for (let r = runStart; r < row; r += 1) {
            hit.add(`${r},${col}`);
          }
        }
        runStart = row;
      }
    }
  }

  const cells = [...hit]
    .map((key) => {
      const [row, col] = key.split(",").map(Number);
      return [row, col] as [number, number];
    })
    .sort(([ra, ca], [rb, cb]) => (ra === rb ? ca - cb : ra - rb));

  return { cells, count: cells.length };
}

export function clearMatchedCells(board: Board, cells: Array<[number, number]>) {
  const next = cloneBoard(board);
  for (const [row, col] of cells) {
    next[row][col] = EMPTY;
  }
  return next;
}

export function hasMatches(board: Board) {
  return findMatches(board).count > 0;
}

export { EMPTY };
