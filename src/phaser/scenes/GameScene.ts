import Phaser from "phaser";
import {
  BOARD_COLS,
  BOARD_MAX_HEIGHT,
  BOARD_MAX_WIDTH,
  BOARD_ROWS,
  GEM_COLORS,
} from "../../constants";
import type { Cell, GameState } from "../../types";
import { getRuntime } from "../runtime_store";
import { drawBackdrop } from "../ui/components";
import { UI_THEME } from "../ui/theme";
import { LuxeVignettePipeline } from "../pipelines/LuxeVignettePipeline";

export class GameScene extends Phaser.Scene {
  private runtime = getRuntime();
  private unsubscribe: (() => void) | null = null;

  private boardX = 0;
  private boardY = 0;
  private tileSize = 0;

  private gemSprites: Phaser.GameObjects.Image[][] = [];
  private selectionRing?: Phaser.GameObjects.Rectangle;
  private boardContainer?: Phaser.GameObjects.Container;
  private boardPulse?: Phaser.GameObjects.Rectangle;
  private pauseOverlay?: Phaser.GameObjects.Container;

  private keyP?: Phaser.Input.Keyboard.Key;
  private keyR?: Phaser.Input.Keyboard.Key;
  private keyF?: Phaser.Input.Keyboard.Key;

  private lastAnimationSignature = "";
  private resizeDebounceId: ReturnType<typeof setTimeout> | null = null;

  private readonly onPauseKeyDown = () => {
    this.runtime.togglePause();
  };

  private readonly onRestartKeyDown = () => {
    this.runtime.restart();
  };

  private readonly onFullscreenKeyDown = () => {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  };

  private readonly onScaleResize = () => {
    if (this.resizeDebounceId) {
      clearTimeout(this.resizeDebounceId);
    }

    this.resizeDebounceId = setTimeout(() => {
      this.resizeDebounceId = null;
      this.scene.restart();
    }, 200);
  };

  constructor() {
    super("game");
  }

  create() {
    drawBackdrop(this);

    if (this.renderer.type === Phaser.WEBGL) {
      const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      const pipelineManager = renderer.pipelines as Phaser.Renderer.WebGL.PipelineManager;
      if (!pipelineManager.has("LuxeVignette")) {
        pipelineManager.addPostPipeline("LuxeVignette", LuxeVignettePipeline as unknown as typeof Phaser.Renderer.WebGL.Pipelines.PostFXPipeline);
      }
      this.cameras.main.setPostPipeline("LuxeVignette");
    }

    this.createGemTextures();
    this.computeLayout();
    this.createBoard();
    this.createPauseOverlay();
    this.bindKeyboard();

    this.unsubscribe = this.runtime.subscribe((state) => {
      this.applyState(state);
    });

    this.scale.on("resize", this.onScaleResize);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribe?.();
      this.unsubscribe = null;
      this.cleanupKeyboardBindings();
      this.scale.off("resize", this.onScaleResize);
      if (this.resizeDebounceId) {
        clearTimeout(this.resizeDebounceId);
        this.resizeDebounceId = null;
      }
    });
  }

  private computeLayout() {
    const width = this.scale.width;
    const height = this.scale.height;
    const topInset = Math.max(156, Math.floor(height * 0.2));
    const bottomInset = 26;

    const maxBoardHeight = Math.min(BOARD_MAX_HEIGHT, height - topInset - bottomInset);
    const maxBoardWidth = Math.min(BOARD_MAX_WIDTH, width - 76);

    this.tileSize = Math.max(46, Math.floor(Math.min(maxBoardWidth / BOARD_COLS, maxBoardHeight / BOARD_ROWS)));

    const boardWidth = this.tileSize * BOARD_COLS;
    const boardHeight = this.tileSize * BOARD_ROWS;

    this.boardX = Math.floor((width - boardWidth) / 2);
    this.boardY = Math.floor((height - boardHeight) / 2 + 34);
  }

  private createBoard() {
    this.gemSprites = [];

    const boardWidth = this.tileSize * BOARD_COLS;
    const boardHeight = this.tileSize * BOARD_ROWS;
    const boardCenterX = this.boardX + boardWidth / 2;
    const boardCenterY = this.boardY + boardHeight / 2;

    this.boardContainer = this.add.container(0, 0);

    const boardShadow = this.add
      .rectangle(boardCenterX, boardCenterY + 8, boardWidth + 40, boardHeight + 42, 0x02060f, 0.55)
      .setOrigin(0.5);

    const boardPanel = this.add
      .rectangle(boardCenterX, boardCenterY, boardWidth + 30, boardHeight + 30, 0x071933, 0.9)
      .setOrigin(0.5)
      .setStrokeStyle(2, 0xa7d8ff, 0.42);

    const boardSheen = this.add
      .rectangle(boardCenterX, boardCenterY - boardHeight * 0.33, boardWidth + 12, boardHeight * 0.45, 0x4bb7ff, 0.08)
      .setOrigin(0.5)
      .setAngle(-6);

    this.boardPulse = this.add
      .rectangle(boardCenterX, boardCenterY, boardWidth + 34, boardHeight + 34, 0x68d6ff, 0)
      .setOrigin(0.5);

    this.boardContainer.add([boardShadow, boardPanel, boardSheen, this.boardPulse]);

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      const rowSprites: Phaser.GameObjects.Image[] = [];

      for (let col = 0; col < BOARD_COLS; col += 1) {
        const x = this.boardX + col * this.tileSize + this.tileSize / 2;
        const y = this.boardY + row * this.tileSize + this.tileSize / 2;

        const cell = this.add
          .rectangle(x, y, this.tileSize - 2, this.tileSize - 2, 0x19365f, 0.33)
          .setStrokeStyle(1, 0x8fcbff, 0.2)
          .setOrigin(0.5);

        const hitZone = this.add
          .zone(x, y, this.tileSize - 4, this.tileSize - 4)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        hitZone.on("pointerdown", () => {
          this.runtime.handleGemClick({ row, col });
        });

        const gem = this.add.image(x, y, "gem-0").setDisplaySize(this.tileSize * 0.84, this.tileSize * 0.84);

        this.boardContainer.add([cell, hitZone, gem]);
        rowSprites.push(gem);
      }

      this.gemSprites.push(rowSprites);
    }

    this.selectionRing = this.add
      .rectangle(0, 0, this.tileSize - 8, this.tileSize - 8)
      .setStrokeStyle(3, 0xf8fcff, 1)
      .setOrigin(0.5)
      .setVisible(false);

    this.boardContainer.add(this.selectionRing);

    if (this.selectionRing) {
      this.tweens.add({
        targets: this.selectionRing,
        alpha: { from: 0.6, to: 1 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    }
  }

  private createPauseOverlay() {
    const width = this.scale.width;
    const height = this.scale.height;

    const layer = this.add.container(width / 2, height / 2);
    const mask = this.add.rectangle(0, 0, width, height, 0x010717, 0.5).setOrigin(0.5);
    const panel = this.add.rectangle(0, 0, 460, 160, 0x0b2247, 0.92).setOrigin(0.5);
    panel.setStrokeStyle(2, 0x9cd9ff, 0.65);

    const text = this.add
      .text(0, -8, "Paused", {
        fontFamily: '"Manrope", "Avenir Next", sans-serif',
        fontSize: "54px",
        fontStyle: "700",
        color: UI_THEME.warning,
      })
      .setOrigin(0.5);

    const hint = this.add
      .text(0, 44, "Press P to resume", {
        fontFamily: '"Manrope", "Avenir Next", sans-serif',
        fontSize: "24px",
        color: UI_THEME.textMuted,
      })
      .setOrigin(0.5);

    layer.add([mask, panel, text, hint]);
    layer.setDepth(100);
    layer.setVisible(false);
    this.pauseOverlay = layer;
  }

  private bindKeyboard() {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.keyP = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.keyR = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.keyF = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    keyboard.on("keydown-P", this.onPauseKeyDown);
    keyboard.on("keydown-R", this.onRestartKeyDown);
    keyboard.on("keydown-F", this.onFullscreenKeyDown);
  }

  private cleanupKeyboardBindings() {
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    keyboard.off("keydown-P", this.onPauseKeyDown);
    keyboard.off("keydown-R", this.onRestartKeyDown);
    keyboard.off("keydown-F", this.onFullscreenKeyDown);
  }

  private applyState(state: GameState) {
    this.pauseOverlay?.setVisible(state.mode === "paused");

    const boardAlpha = state.mode === "playing" || state.mode === "paused" ? 1 : 0.45;
    this.boardContainer?.setAlpha(boardAlpha);

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        const gemType = state.board[row][col];
        this.gemSprites[row][col].setTexture(`gem-${gemType}`);
      }
    }

    if (state.selectedCell && this.selectionRing) {
      const { x, y } = this.cellCenter(state.selectedCell);
      this.selectionRing.setPosition(x, y).setVisible(true);
    } else {
      this.selectionRing?.setVisible(false);
    }

    const animationSignature = state.pendingAnimations.map((entry) => `${entry.type}:${entry.detail}`).join("|");
    if (animationSignature && animationSignature !== this.lastAnimationSignature) {
      this.playAnimationPulse(state);
      this.lastAnimationSignature = animationSignature;
    }
  }

  private playAnimationPulse(state: GameState) {
    const isInvalid = state.pendingAnimations.some((entry) => entry.detail.includes("invalid"));
    const isResolve = state.pendingAnimations.some((entry) => entry.type === "resolve");

    if (this.boardPulse) {
      const tint = isInvalid ? 0xff7f9d : 0x6bd9ff;
      this.boardPulse.setFillStyle(tint, isInvalid ? 0.16 : 0.2);
      this.tweens.add({
        targets: this.boardPulse,
        alpha: { from: 0.32, to: 0 },
        duration: isInvalid ? 180 : 260,
        ease: "Sine.Out",
      });
    }

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        const target = this.gemSprites[row][col];
        const baseScale = 1;
        const peak = isInvalid ? 0.95 : 1.1;
        this.tweens.add({
          targets: target,
          scaleX: peak,
          scaleY: peak,
          yoyo: true,
          duration: isInvalid ? 90 : 120,
          ease: isInvalid ? "Sine.InOut" : "Back.Out",
          delay: isInvalid ? 0 : (row + col) * 7,
          onComplete: () => {
            target.setScale(baseScale);
          },
        });
      }
    }

    if (isResolve || state.chainDepth > 1) {
      const boardWidth = this.tileSize * BOARD_COLS;
      const boardHeight = this.tileSize * BOARD_ROWS;
      const centerX = this.boardX + boardWidth / 2;
      const centerY = this.boardY + boardHeight / 2;
      this.spawnSparkles(centerX, centerY, Math.min(24, 8 + state.chainDepth * 4));
    }
  }

  private spawnSparkles(centerX: number, centerY: number, count: number) {
    for (let index = 0; index < count; index += 1) {
      const sparkle = this.add.circle(centerX, centerY, Phaser.Math.Between(2, 4), 0xa8e8ff, 0.8);
      sparkle.setBlendMode(Phaser.BlendModes.ADD);

      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.FloatBetween(24, 130);

      this.tweens.add({
        targets: sparkle,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        alpha: 0,
        scale: 0.15,
        duration: Phaser.Math.Between(260, 460),
        ease: "Sine.Out",
        onComplete: () => sparkle.destroy(),
      });
    }
  }

  private createGemTextures() {
    const textureSize = 128;
    const graphics = this.add.graphics();

    for (let i = 0; i < GEM_COLORS.length; i += 1) {
      const key = `gem-${i}`;
      if (this.textures.exists(key)) {
        continue;
      }

      const color = Phaser.Display.Color.HexStringToColor(GEM_COLORS[i]).color;
      const center = textureSize / 2;
      const radius = textureSize * 0.38;

      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.beginPath();
      graphics.moveTo(center, center - radius);
      graphics.lineTo(center + radius, center);
      graphics.lineTo(center, center + radius);
      graphics.lineTo(center - radius, center);
      graphics.closePath();
      graphics.fillPath();

      graphics.lineStyle(5, 0xffffff, 0.5);
      graphics.strokePath();

      graphics.fillStyle(0xffffff, 0.25);
      graphics.beginPath();
      graphics.moveTo(center - radius * 0.45, center - radius * 0.42);
      graphics.lineTo(center - radius * 0.02, center - radius * 0.03);
      graphics.lineTo(center - radius * 0.3, center + radius * 0.15);
      graphics.lineTo(center - radius * 0.55, center - radius * 0.1);
      graphics.closePath();
      graphics.fillPath();

      graphics.generateTexture(key, textureSize, textureSize);
    }

    graphics.destroy();
  }

  private cellCenter(cell: Cell) {
    const x = this.boardX + cell.col * this.tileSize + this.tileSize / 2;
    const y = this.boardY + cell.row * this.tileSize + this.tileSize / 2;
    return { x, y };
  }
}
