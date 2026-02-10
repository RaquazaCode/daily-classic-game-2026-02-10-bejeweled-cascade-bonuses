export type Mode = "title" | "playing" | "paused";

export type Cell = {
  row: number;
  col: number;
};

export type Board = number[][];

export type PendingAnimation = {
  type: "swap" | "resolve" | "drop" | "refill";
  detail: string;
};

export type MoveOutcome = {
  success: boolean;
  invalidReason?: string;
  scoreDelta: number;
  chainDepth: number;
  cleared: number;
};

export type GameState = {
  mode: Mode;
  board: Board;
  selectedCell: Cell | null;
  score: number;
  moves: number;
  chainDepth: number;
  bestChain: number;
  lastMoveScore: number;
  lastMultiplier: number;
  bonusTrail: number[];
  message: string;
  seed: string;
  pendingAnimations: PendingAnimation[];
  rngState: number;
};
