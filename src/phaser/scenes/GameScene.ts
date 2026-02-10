import Phaser from "phaser";
import {
  BOARD_COLS,
  BOARD_MAX_HEIGHT,
  BOARD_MAX_WIDTH,
  BOARD_ROWS,
  GEM_COLORS,
  HUD_HEIGHT,
} from "../../constants";
import type { Cell, GameState } from "../../types";
import { getRuntime } from "../runtime_store";
import { drawBackdrop } from "../ui/components";
import { UI_FONT, UI_THEME } from "../ui/theme";

export class GameScene extends Phaser.Scene {
  private runtime = getRuntime();
  private unsubscribe: (() => void) | null = null;

  private boardX = 0;
  private boardY = 0;
  private tileSize = 0;

  private titleText?: Phaser.GameObjects.Text;
  private statsText?: Phaser.GameObjects.Text;
  private detailText?: Phaser.GameObjects.Text;
  private messageText?: Phaser.GameObjects.Text;
  private pauseOverlay?: Phaser.GameObjects.Container;

  private gemSprites: Phaser.GameObjects.Image[][] = [];
  private selectionRing?: Phaser.GameObjects.Rectangle;

  private keyP?: Phaser.Input.Keyboard.Key;
  private keyR?: Phaser.Input.Keyboard.Key;
  private keyF?: Phaser.Input.Keyboard.Key;

  private lastAnimationSignature = "";

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

  constructor() {
    super("game");
  }

  create() {
    drawBackdrop(this);
    this.createGemTextures();
    this.computeLayout();
    this.createHud();
    this.createBoard();
    this.createPauseOverlay();
    this.bindKeyboard();

    this.unsubscribe = this.runtime.subscribe((state) => {
      this.applyState(state);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribe?.();
      this.unsubscribe = null;
      this.cleanupKeyboardBindings();
    });
  }

  private computeLayout() {
    const width = this.scale.width;
    const height = this.scale.height;
    const maxBoardHeight = Math.min(BOARD_MAX_HEIGHT, height - HUD_HEIGHT - 44);
    const maxBoardWidth = Math.min(BOARD_MAX_WIDTH, width - 120);

    this.tileSize = Math.floor(Math.min(maxBoardWidth / BOARD_COLS, maxBoardHeight / BOARD_ROWS));
    const boardWidth = this.tileSize * BOARD_COLS;

    this.boardX = Math.floor((width - boardWidth) / 2);
    this.boardY = HUD_HEIGHT;
  }

  private createHud() {
    const width = this.scale.width;

    this.titleText = this.add
      .text(44, 36, "Bejeweled: Cascading Bonuses", {
        fontFamily: UI_FONT,
        fontSize: "56px",
        fontStyle: "700",
        color: UI_THEME.textPrimary,
      })
      .setOrigin(0, 0);

    this.statsText = this.add
      .text(44, 94, "", {
        fontFamily: UI_FONT,
        fontSize: "29px",
        color: UI_THEME.textMuted,
      })
      .setOrigin(0, 0);

    this.detailText = this.add
      .text(44, 124, "", {
        fontFamily: UI_FONT,
        fontSize: "25px",
        color: UI_THEME.textMuted,
      })
      .setOrigin(0, 0);

    this.messageText = this.add
      .text(width - 44, 124, "", {
        fontFamily: UI_FONT,
        fontSize: "25px",
        color: UI_THEME.accent,
        align: "right",
      })
      .setOrigin(1, 0);
  }

  private createBoard() {
    this.gemSprites = [];

    const boardWidth = this.tileSize * BOARD_COLS;
    const boardHeight = this.tileSize * BOARD_ROWS;

    this.add
      .rectangle(
        this.boardX + boardWidth / 2,
        this.boardY + boardHeight / 2,
        boardWidth + 24,
        boardHeight + 24,
        0x061732,
        0.87,
      )
      .setStrokeStyle(2, 0x9dd4ff, 0.35);

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      const rowSprites: Phaser.GameObjects.Image[] = [];

      for (let col = 0; col < BOARD_COLS; col += 1) {
        const x = this.boardX + col * this.tileSize + this.tileSize / 2;
        const y = this.boardY + row * this.tileSize + this.tileSize / 2;

        this.add
          .rectangle(x, y, this.tileSize - 3, this.tileSize - 3, 0x17345c, 0.38)
          .setStrokeStyle(1, 0x89bbef, 0.18);

        const hitZone = this.add
          .zone(x, y, this.tileSize - 3, this.tileSize - 3)
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        hitZone.on("pointerdown", () => {
          this.runtime.handleGemClick({ row, col });
        });

        const gem = this.add.image(x, y, "gem-0").setDisplaySize(this.tileSize * 0.82, this.tileSize * 0.82);

        rowSprites.push(gem);
      }

      this.gemSprites.push(rowSprites);
    }

    this.selectionRing = this.add
      .rectangle(0, 0, this.tileSize - 8, this.tileSize - 8)
      .setStrokeStyle(4, 0xfafcff, 1)
      .setVisible(false);
  }

  private createPauseOverlay() {
    const width = this.scale.width;
    const height = this.scale.height;

    const layer = this.add.container(width / 2, height / 2);
    const mask = this.add.rectangle(0, 0, width, height, 0x001029, 0.46).setOrigin(0.5);
    const panel = this.add.rectangle(0, 0, 440, 150, 0x0e2244, 0.96).setOrigin(0.5);
    panel.setStrokeStyle(2, 0xaed8ff, 0.65);
    const text = this.add
      .text(0, 0, "Paused", {
        fontFamily: UI_FONT,
        fontSize: "54px",
        fontStyle: "700",
        color: UI_THEME.warning,
      })
      .setOrigin(0.5);

    layer.add([mask, panel, text]);
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
    if (state.mode === "title") {
      this.scene.start("menu");
      return;
    }

    if (state.mode === "howto") {
      this.scene.start("howto");
      return;
    }

    this.statsText?.setText(
      `Mode: ${state.mode}     Score: ${state.score}     Moves: ${state.moves}     Chain: ${state.chainDepth}     Best chain: ${state.bestChain}`,
    );
    this.detailText?.setText(`Last multiplier: x${state.lastMultiplier}     Last move score: +${state.lastMoveScore}`);
    this.messageText?.setText(state.message);

    this.pauseOverlay?.setVisible(state.mode === "paused");

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
    const isInvalid = state.pendingAnimations.some((entry) => entry.detail.includes("reverted-invalid"));
    const duration = isInvalid ? 70 : 110;
    const scaleTo = isInvalid ? 0.94 : 1.08;

    for (let row = 0; row < BOARD_ROWS; row += 1) {
      for (let col = 0; col < BOARD_COLS; col += 1) {
        const target = this.gemSprites[row][col];
        this.tweens.add({
          targets: target,
          scaleX: scaleTo,
          scaleY: scaleTo,
          yoyo: true,
          duration,
          ease: isInvalid ? "Sine.InOut" : "Back.Out",
          delay: isInvalid ? 0 : (row + col) * 8,
        });
      }
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

      graphics.lineStyle(6, 0xffffff, 0.35);
      graphics.strokePath();

      graphics.fillStyle(0xffffff, 0.22);
      graphics.beginPath();
      graphics.moveTo(center - radius * 0.42, center - radius * 0.4);
      graphics.lineTo(center - radius * 0.04, center - radius * 0.04);
      graphics.lineTo(center - radius * 0.28, center + radius * 0.1);
      graphics.lineTo(center - radius * 0.52, center - radius * 0.12);
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
