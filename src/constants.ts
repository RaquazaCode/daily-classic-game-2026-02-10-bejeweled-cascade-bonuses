export const GAME_SEED = "2026-02-10-bejeweled-cascade-bonuses";

export const BOARD_ROWS = 8;
export const BOARD_COLS = 8;
export const GEM_TYPES = 6;

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const STEP_SECONDS = 1 / 60;

export const HUD_HEIGHT = 136;
export const BOARD_MAX_WIDTH = 720;
export const BOARD_MAX_HEIGHT = 520;
export const TILE_SIZE = 72;

// Legacy exports kept for backward compatibility with existing helpers.
export const BOARD_X = Math.floor((GAME_WIDTH - BOARD_COLS * TILE_SIZE) / 2);
export const BOARD_Y = HUD_HEIGHT;
export const CANVAS_WIDTH = GAME_WIDTH;
export const CANVAS_HEIGHT = GAME_HEIGHT;

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
