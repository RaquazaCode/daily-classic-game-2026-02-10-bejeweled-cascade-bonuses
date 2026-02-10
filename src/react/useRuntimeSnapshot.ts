import { useEffect, useState } from "react";
import { BejeweledRuntime } from "../phaser/runtime";
import type { GameState } from "../types";

export function useRuntimeSnapshot(runtime: BejeweledRuntime) {
  const [state, setState] = useState<GameState>(() => runtime.getState());

  useEffect(() => {
    return runtime.subscribe((nextState) => {
      setState(nextState);
    });
  }, [runtime]);

  return state;
}
