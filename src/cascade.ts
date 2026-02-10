import { BOARD_COLS, BOARD_ROWS, CASCADE_MULTIPLIERS, GEM_TYPES, SCORE_PER_GEM } from "./constants";
import { cloneBoard } from "./board";
import { EMPTY, clearMatchedCells, findMatches } from "./match";
import type { Board, PendingAnimation } from "./types";
import type { RNG } from "./rng";

export type CascadeResolution = {
  board: Board;
  scoreDelta: number;
  cleared: number;
  chainDepth: number;
  pendingAnimations: PendingAnimation[];
};

export function resolveCascadeLoop(startBoard: Board, rng: RNG): CascadeResolution {
  let board = cloneBoard(startBoard);
  let scoreDelta = 0;
  let cleared = 0;
  let chainDepth = 0;
  const pendingAnimations: PendingAnimation[] = [];

  while (true) {
    const match = findMatches(board);
    if (match.count === 0) {
      break;
    }

    chainDepth += 1;
    cleared += match.count;

    const multiplier = CASCADE_MULTIPLIER(chainDepth);
    scoreDelta += match.count * SCORE_PER_GEM * multiplier;

    board = clearMatchedCells(board, match.cells);
    pendingAnimations.push({ type: "resolve", detail: `chain-${chainDepth}-clear-${match.count}` });

    board = dropGems(board);
    pendingAnimations.push({ type: "drop", detail: `chain-${chainDepth}-drop` });

    board = refillBoard(board, rng);
    pendingAnimations.push({ type: "refill", detail: `chain-${chainDepth}-refill` });
  }

  return {
    board,
    scoreDelta,
    cleared,
    chainDepth,
    pendingAnimations,
  };
}

function CASCADE_MULTIPLIER(chainDepth: number) {
  return CASCADE_MULTIPLIERS[Math.min(chainDepth - 1, CASCADE_MULTIPLIERS.length - 1)];
}

function dropGems(board: Board) {
  const next = cloneBoard(board);

  for (let col = 0; col < BOARD_COLS; col += 1) {
    let writeRow = BOARD_ROWS - 1;

    for (let row = BOARD_ROWS - 1; row >= 0; row -= 1) {
      const gem = next[row][col];
      if (gem === EMPTY) {
        continue;
      }

      next[writeRow][col] = gem;
      if (writeRow !== row) {
        next[row][col] = EMPTY;
      }
      writeRow -= 1;
    }

    for (let row = writeRow; row >= 0; row -= 1) {
      next[row][col] = EMPTY;
    }
  }

  return next;
}

function refillBoard(board: Board, rng: RNG) {
  const next = cloneBoard(board);

  for (let row = 0; row < BOARD_ROWS; row += 1) {
    for (let col = 0; col < BOARD_COLS; col += 1) {
      if (next[row][col] === EMPTY) {
        next[row][col] = rng.nextInt(GEM_TYPES);
      }
    }
  }

  return next;
}
