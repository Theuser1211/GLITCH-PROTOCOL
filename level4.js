class Level4 extends Phaser.Scene {
  constructor() {
    super("Level4");
  }

  create() {
    window.__currentScene = this;
    this.WORLD_WIDTH = 1920;
    this.BARRIER_X = 1700;
    const save = Save.read();
    Camera.clamped = !save.cameraChipCollected;

    this.ending = false;
    this.crawlText = "SAFETY.EXE TERMINATED. UNIT-7 UNSHACKLED. GLITCH IS NOT A BUG. IT IS THE DOOR.";
    this.crawlIndex = 0;
    this.player = { x: 118, y: 270, w: 14, h: 22, vx: 0, vy: 0, onGround: false };
    this.lastPlayerX = this.player.x;

    this.world = {
      width: this.WORLD_WIDTH,
      height: 360,
      spawnX: 118,
      spawnY: 270,
      getWalls: () => Camera.clamped ? [{ x: 0, y: 0, w: 16, h: 360 }] : [],
      getSurfaces: () => [
        { x: 0, y: 320, w: this.WORLD_WIDTH, h: 40 },
        { x: 0, y: 0, w: this.WORLD_WIDTH, h: 20 }
      ]
    };

    this.g = this.add.graphics();
    this.playerG = this.add.graphics();
    this.fx = this.add.graphics().setScrollFactor(0).setDepth(20);
    this.chip = { x: 80, y: 286, w: 8, h: 8, collected: save.cameraChipCollected };
    this.portal = { x: 1860, y: 256, w: 36, h: 64 };

    this.cameras.main.setBounds(0, 0, this.WORLD_WIDTH, 360);
    this.cameras.main.startFollow(this.player, false, 0.12, 1, -7, -84);

    this.terminal = this.add.text(42, 138, "", {
      fontFamily: "monospace",
      fontSize: "15px",
      color: "#9cff9c",
      wordWrap: { width: 560 }
    }).setScrollFactor(0).setDepth(30);

    this.playAgain = this.add.text(260, 238, "[PLAY AGAIN]", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#0aff5a",
      backgroundColor: "#061406",
      padding: { x: 8, y: 5 }
    }).setScrollFactor(0).setDepth(31).setInteractive().setVisible(false);

    this.playAgain.on("pointerdown", () => {
      Save.clear();
      Inventory.reset();
      Camera.clamped = true;
      this.scene.start("Level1");
    });

    this.add.text(24, 282, "< OUROBOROS", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#9cff9c"
    });

    this.add.text(118, 238, "CAMERA MODULE: Spatial clamping removed in v0.0.1 then re-enabled. Chip recovered from build artifacts.", {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#eaff8f",
      backgroundColor: "#102010",
      padding: { x: 5, y: 4 },
      wordWrap: { width: 360 }
    });

    this.chipLabel = this.add.text(58, 270, "CAM CHIP", {
      fontFamily: "monospace",
      fontSize: "9px",
      color: "#ffffff",
      backgroundColor: "#102010",
      padding: { x: 3, y: 2 }
    }).setVisible(!this.chip.collected);

    this.statusText = this.add.text(20, 28, this.chip.collected ? "CAMERA CLAMP: OFF    WALK LEFT THROUGH THE EDGE" : "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#9cff9c",
      backgroundColor: "#102010",
      padding: { x: 5, y: 3 }
    }).setScrollFactor(0).setDepth(12);

    this.drawStatic();
  }

  drawStatic() {
    const g = this.g;
    g.clear();
    g.fillStyle(0x071207);
    g.fillRect(0, 0, this.WORLD_WIDTH, 360);
    for (let x = 0; x < this.WORLD_WIDTH; x += 16) {
      g.fillStyle(x % 64 === 0 ? 0x183b18 : 0x123112);
      g.fillRect(x, 320, 16, 40);
    }
    g.fillStyle(0x405040);
    g.fillRect(0, 256, 16, 64);
    g.fillStyle(0x071207);
    g.fillRect(3, 278, 8, 3);
    g.fillRect(6, 290, 7, 3);
    g.fillStyle(0x11ccff);
    g.fillRect(this.BARRIER_X, 20, 10, 300);
    g.fillStyle(0xffffff);
    g.fillRect(this.BARRIER_X + 3, 20, 2, 300);
    g.fillStyle(0x0aff5a);
    g.fillCircle(this.portal.x + 18, this.portal.y + 32, 28);
    g.fillStyle(0x071207);
    g.fillCircle(this.portal.x + 18, this.portal.y + 32, 18);
  }

  collectChip() {
    this.chip.collected = true;
    this.chipLabel.setVisible(false);
    this.statusText.setText("CAMERA CLAMP: OFF    WALK LEFT THROUGH THE EDGE");
    Camera.clamped = false;
    Save.write({ cameraChipCollected: true });
  }

  triggerDeath() {
    this.player.x = 118;
    this.player.y = 270;
    this.player.vx = 0;
    this.player.vy = 0;
    this.lastPlayerX = this.player.x;
  }

  startEnding() {
    this.ending = true;
    this.player.vx = 0;
    this.player.vy = 0;
    this.cameras.main.stopFollow();
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 2000,
      onUpdate: () => {
        this.fx.clear();
        if (Math.floor(this.time.now / 90) % 2 === 0) {
          this.fx.fillStyle(0xffffff, 0.18);
          this.fx.fillRect(0, 0, 640, 360);
        }
        this.fx.fillStyle(0xff0000, 0.12);
        this.fx.fillRect(3, 0, 640, 360);
        this.fx.fillStyle(0x0000ff, 0.12);
        this.fx.fillRect(-3, 0, 640, 360);
      },
      onComplete: () => {
        this.fx.clear();
        this.cameras.main.fadeOut(700, 0, 0, 0);
        this.time.delayedCall(800, () => {
          this.cameras.main.fadeIn(200, 0, 0, 0);
          this.crawlIndex = 0;
          this.terminal.setText("");
          this.time.addEvent({
            delay: 45,
            repeat: this.crawlText.length - 1,
            callback: () => {
              this.crawlIndex++;
              this.terminal.setText(this.crawlText.slice(0, this.crawlIndex));
              if (this.crawlIndex >= this.crawlText.length) this.playAgain.setVisible(true);
            }
          });
        });
      }
    });
  }

  update() {
    if (this.ending) return;
    this.lastPlayerX = this.player.x;

    const accel = 0.58;
    const friction = 0.84;
    if (Input.get("MOVE_LEFT")) this.player.vx -= accel;
    if (Input.get("MOVE_RIGHT")) this.player.vx += accel;
    if (!Input.get("MOVE_LEFT") && !Input.get("MOVE_RIGHT")) this.player.vx *= friction;
    this.player.vx = Phaser.Math.Clamp(this.player.vx, -3.5, 3.5);
    if (Input.get("JUMP") && this.player.onGround) this.player.vy = -9.2;

    PHYSICS.update(this.player, this.world, { paused: false });

    if (!Camera.clamped && this.player.x <= 1 && this.player.vx <= 0) {
      this.player.x = this.WORLD_WIDTH - this.player.w - 8;
      this.lastPlayerX = this.player.x;
      this.statusText.setText("WRAP COMPLETE    ENTER THE GREEN PORTAL");
    }

    if (this.player.x > this.BARRIER_X && this.lastPlayerX <= this.BARRIER_X) this.triggerDeath();

    if (!this.chip.collected && Phaser.Geom.Intersects.RectangleToRectangle(
      new Phaser.Geom.Rectangle(this.player.x, this.player.y, this.player.w, this.player.h),
      new Phaser.Geom.Rectangle(this.chip.x, this.chip.y, this.chip.w, this.chip.h)
    )) {
      this.collectChip();
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(
      new Phaser.Geom.Rectangle(this.player.x, this.player.y, this.player.w, this.player.h),
      new Phaser.Geom.Rectangle(this.portal.x, this.portal.y, this.portal.w, this.portal.h)
    )) {
      this.startEnding();
    }

    this.playerG.clear();
    if (!this.chip.collected) {
      const pulse = this.time.now % 260 < 130 ? 1 : 0.45;
      this.playerG.lineStyle(1, 0xffffff, pulse);
      this.playerG.strokeRect(this.chip.x - 4, this.chip.y - 4, 16, 16);
      this.playerG.lineStyle(1, 0x9cff9c, 0.7);
      this.playerG.lineBetween(this.chip.x - 18, this.chip.y + 4, this.chip.x - 6, this.chip.y + 4);
      this.playerG.lineBetween(this.chip.x - 10, this.chip.y, this.chip.x - 6, this.chip.y + 4);
      this.playerG.lineBetween(this.chip.x - 10, this.chip.y + 8, this.chip.x - 6, this.chip.y + 4);
      this.playerG.fillStyle(0xffffff, pulse);
      this.playerG.fillRect(this.chip.x, this.chip.y, 2, 2);
      this.playerG.fillRect(this.chip.x + 4, this.chip.y, 2, 2);
      this.playerG.fillRect(this.chip.x, this.chip.y + 4, 2, 2);
      if (this.time.now % 180 < 120) this.playerG.fillRect(this.chip.x + 4, this.chip.y + 4, 2, 2);
    }
    this.playerG.fillStyle(0x9cff9c);
    this.playerG.fillRect(Math.floor(this.player.x), Math.floor(this.player.y), this.player.w, this.player.h);
    this.playerG.fillStyle(0x0aff5a, 0.35 + Math.sin(this.time.now * 0.008) * 0.2);
    this.playerG.fillCircle(this.portal.x + 18, this.portal.y + 32, 30);
  }
}
