export const GAME_SEED = "2026-02-10-bejeweled-cascade-bonuses";

export const BOARD_ROWS = 8;
export const BOARD_COLS = 8;
export const GEM_TYPES = 6;
export const TILE_SIZE = 76;

export const HUD_HEIGHT = 100;
export const BOARD_X = 40;
export const BOARD_Y = 130;

export const CANVAS_WIDTH = BOARD_X * 2 + BOARD_COLS * TILE_SIZE;
export const CANVAS_HEIGHT = BOARD_Y + BOARD_ROWS * TILE_SIZE + 34;

export const STEP_SECONDS = 1 / 60;

export const SCORE_PER_GEM = 50;

export const CASCADE_MULTIPLIERS = [1, 2, 3] as const;

export const GEM_COLORS = [
  "#64d2ff",
  "#5ee3a1",
  "#ffd166",
  "#ff8fab",
  "#c79bff",
  "#ff9f5c",
] as const;
