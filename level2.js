class Level2 extends Phaser.Scene {
  constructor() {
    super("Level2");
  }

  create() {
    Camera.clamped = true;
    window.__currentScene = this;
    this.gameState = { paused: false };
    this.pauseWasDown = false;

    this.player = { x: 48, y: 270, w: 14, h: 22, vx: 0, vy: 0, onGround: false };
    this.pausePanelBounds = { x: 160, y: 100, w: 320, h: 160 };

    this.world = {
      width: 640,
      height: 360,
      spawnX: 48,
      spawnY: 270,
      getWalls: () => [
        { x: 0, y: 0, w: 16, h: 360 },
        { x: 624, y: 0, w: 16, h: 360 }
      ],
      getSurfaces: (gameState) => {
        const surfaces = [
          { x: 0, y: 320, w: 220, h: 40 },
          { x: 420, y: 320, w: 220, h: 40 },
          { x: 0, y: 0, w: 640, h: 20 }
        ];
        if (gameState.paused === true) surfaces.unshift(this.pausePanelBounds);
        return surfaces;
      }
    };

    this.g = this.add.graphics();
    this.playerG = this.add.graphics();

    this.shimmer = this.add.rectangle(320, 180, 320, 160, 0x66ffff, 0.08);
    this.tweens.add({ targets: this.shimmer, alpha: 0.15, duration: 600, yoyo: true, repeat: -1 });

    this.pausePanel = this.add.rectangle(320, 180, 320, 160, 0x061406, 0.72)
      .setScrollFactor(0)
      .setDepth(10)
      .setVisible(false);
    this.pauseText = this.add.text(250, 166, "PAUSED", {
      fontFamily: "monospace",
      fontSize: "24px",
      color: "#8cff8c"
    }).setScrollFactor(0).setDepth(11).setVisible(false);

    this.hintText = this.add.text(44, 72, "KNOWN ISSUE: UI render layer not masked from physics manifold. Affects: PAUSE_MENU.", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#eaff8f",
      backgroundColor: "#102010",
      padding: { x: 6, y: 4 },
      wordWrap: { width: 260 }
    });

    this.door = { x: 584, y: 260, w: 26, h: 60 };
    this.drawStatic();
  }

  drawStatic() {
    const g = this.g;
    g.clear();
    g.fillStyle(0x071207);
    g.fillRect(0, 0, 640, 360);
    g.fillStyle(0x163316);
    g.fillRect(0, 320, 220, 40);
    g.fillRect(420, 320, 220, 40);
    g.fillRect(0, 0, 640, 20);
    for (let x = 0; x < 220; x += 16) {
      g.fillStyle(0x214621);
      g.fillRect(x, 320, 14, 8);
    }
    for (let x = 420; x < 640; x += 16) {
      g.fillStyle(0x214621);
      g.fillRect(x, 320, 14, 8);
    }
    g.fillStyle(0x0aff5a);
    g.fillRect(this.door.x, this.door.y, this.door.w, this.door.h);
    g.fillStyle(0x052805);
    g.fillRect(this.door.x + 5, this.door.y + 8, 16, 44);
  }

  update() {
    const pauseDown = Input.get("PAUSE");
    if (pauseDown && !this.pauseWasDown) {
      this.gameState.paused = !this.gameState.paused;
      this.pausePanel.setVisible(this.gameState.paused);
      this.pauseText.setVisible(this.gameState.paused);
    }
    this.pauseWasDown = pauseDown;

    const accel = 0.55;
    const friction = 0.82;
    if (Input.get("MOVE_LEFT")) this.player.vx -= accel;
    if (Input.get("MOVE_RIGHT")) this.player.vx += accel;
    if (!Input.get("MOVE_LEFT") && !Input.get("MOVE_RIGHT")) this.player.vx *= friction;
    this.player.vx = Phaser.Math.Clamp(this.player.vx, -3.3, 3.3);
    if (Input.get("JUMP") && this.player.onGround) this.player.vy = -8.8;

    PHYSICS.update(this.player, this.world, this.gameState);

    if (Phaser.Geom.Intersects.RectangleToRectangle(
      new Phaser.Geom.Rectangle(this.player.x, this.player.y, this.player.w, this.player.h),
      new Phaser.Geom.Rectangle(this.door.x, this.door.y, this.door.w, this.door.h)
    )) {
      Save.write({ currentLevel: 3 });
      this.scene.start("Level3");
    }

    this.playerG.clear();
    this.playerG.fillStyle(0x9cff9c);
    this.playerG.fillRect(Math.floor(this.player.x), Math.floor(this.player.y), this.player.w, this.player.h);
  }
}
