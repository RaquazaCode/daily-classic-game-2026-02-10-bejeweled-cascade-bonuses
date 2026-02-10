import { useSyncExternalStore } from "react";
import { BejeweledRuntime } from "../phaser/runtime";

export function useRuntimeSnapshot(runtime: BejeweledRuntime) {
  return useSyncExternalStore(
    (notify) => runtime.subscribe(() => notify()),
    () => runtime.getState(),
    () => runtime.getState(),
  );
}
