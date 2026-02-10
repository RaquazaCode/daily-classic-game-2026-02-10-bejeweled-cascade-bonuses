import { CASCADE_MULTIPLIERS, SCORE_PER_GEM } from "../constants";

const MULTIPLIERS = CASCADE_MULTIPLIERS.map((value) => `x${value}`).join(" -> ");

export const HOW_TO_PANELS = [
  {
    title: "1. Objective + Controls",
    body:
      "Match 3+ gems horizontally or vertically. Click one gem, then click an adjacent gem to swap. Keyboard shortcuts: P pause, R restart with same seed, F fullscreen.",
  },
  {
    title: "2. Valid vs Invalid Swaps",
    body:
      "A swap only counts when at least one match is created. Invalid swaps are rolled back with no score or move. Valid swaps trigger clear, drop, refill, then additional cascades.",
  },
  {
    title: "3. Cascades + Scoring",
    body: `Each cleared gem is worth ${SCORE_PER_GEM} base points. Chain depth applies multipliers ${MULTIPLIERS}. Deeper chains grow best chain and score much faster.`,
  },
] as const;
