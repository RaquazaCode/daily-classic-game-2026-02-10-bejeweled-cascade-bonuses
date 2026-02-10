import type { Mode } from "../types";

export type AudioStatus = {
  enabled: boolean;
  blocked: boolean;
  started: boolean;
};

type StatusListener = (status: AudioStatus) => void;

function safePause(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;
}

export class AudioDirector {
  private base: HTMLAudioElement;
  private glow: HTMLAudioElement;
  private status: AudioStatus;
  private onStatus: StatusListener;

  constructor(onStatus: StatusListener) {
    const baseUrl = new URL("../../assets/audio/ambient-luxe-base.wav", import.meta.url).href;
    const glowUrl = new URL("../../assets/audio/ambient-luxe-glow.wav", import.meta.url).href;

    this.base = new Audio(baseUrl);
    this.base.loop = true;
    this.base.preload = "auto";

    this.glow = new Audio(glowUrl);
    this.glow.loop = true;
    this.glow.preload = "auto";

    this.status = {
      enabled: true,
      blocked: false,
      started: false,
    };

    this.onStatus = onStatus;
    this.emitStatus();
  }

  getStatus() {
    return { ...this.status };
  }

  async start() {
    if (!this.status.enabled) {
      return;
    }

    try {
      this.base.volume = 0.3;
      await this.base.play();
      this.status.started = true;
      this.status.blocked = false;
      this.emitStatus();
    } catch {
      this.status.blocked = true;
      this.emitStatus();
    }
  }

  setEnabled(nextEnabled: boolean) {
    this.status.enabled = nextEnabled;

    if (!nextEnabled) {
      safePause(this.base);
      safePause(this.glow);
      this.status.started = false;
      this.status.blocked = false;
      this.emitStatus();
      return;
    }

    void this.start();
  }

  sync(mode: Mode, chainDepth: number) {
    if (!this.status.enabled || !this.status.started) {
      return;
    }

    const targetVolume = mode === "playing" ? 0.34 : mode === "paused" ? 0.2 : 0.24;
    this.base.volume = targetVolume;

    if (mode === "playing" && chainDepth >= 2) {
      this.glow.volume = Math.min(0.22, 0.08 + chainDepth * 0.03);
      if (this.glow.paused) {
        void this.glow.play().catch(() => {
          this.status.blocked = true;
          this.emitStatus();
        });
      }
    } else {
      safePause(this.glow);
    }
  }

  destroy() {
    safePause(this.base);
    safePause(this.glow);
  }

  private emitStatus() {
    this.onStatus({ ...this.status });
  }
}
