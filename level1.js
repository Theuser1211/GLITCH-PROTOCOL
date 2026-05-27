class Level1 extends Phaser.Scene {
  constructor() {
    super("Level1");
  }

  create() {
    Camera.clamped = true;
    window.__currentScene = this;

    this.gameState = { paused: false };
    this.boostTimer = 0;

    this.player = { x: 36, y: 272, w: 14, h: 22, vx: 0, vy: 0, onGround: false };

    this.world = {
      width: 960,
      height: 360,
      spawnX: 36,
      spawnY: 272,
      getWalls: () => [
        { x: 0, y: 0, w: 16, h: 360 },
        { x: 608, y: 48, w: 60, h: 272, clipGate: true },
        { x: 944, y: 0, w: 16, h: 360 }
      ],
      getSurfaces: () => [
        { x: 0, y: 320, w: 960, h: 40 },
        { x: 0, y: 0, w: 960, h: 24 },
        { x: 320, y: 284, w: 108, h: 12 }
      ]
    };

    this.cameras.main.setBounds(0, 0, this.world.width, 360);
    this.cameras.main.startFollow(this.player, false, 0.12, 1, -7, -84);

    this.g = this.add.graphics();
    this.playerG = this.add.graphics();

    this.thinWall = this.add.rectangle(608, 48, 60, 272, 0x163316).setOrigin(0);
    this.thinWallTween = this.tweens.add({
      targets: this.thinWall,
      alpha: 0.6,
      duration: 160,
      yoyo: true,
      repeat: -1,
      paused: true
    });

    this.door = { x: 902, y: 260, w: 26, h: 60 };
    this.floppy = { x: 190, y: 252, w: 16, h: 16 };

    this.hintText = this.add.text(96, 76, "", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#eaff8f",
      backgroundColor: "#102010",
      padding: { x: 6, y: 4 },
      wordWrap: { width: 390 }
    }).setScrollFactor(0).setDepth(5);

    this.add.text(250, 302, "GO FAST. WALLS FORGET.", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#3cff3c"
    });

    this.drawStatic();
  }

  drawStatic() {
    const g = this.g;
    g.clear();
    g.fillStyle(0x071207);
    g.fillRect(0, 0, 960, 360);

    for (let x = 0; x < 960; x += 16) {
      g.fillStyle(x % 32 === 0 ? 0x174017 : 0x123312);
      g.fillRect(Math.floor(x), 320, 16, 40);
      g.fillStyle(0x102810);
      g.fillRect(Math.floor(x), 0, 16, 24);
    }

    g.fillStyle(0x163316);
    g.fillRect(0, 0, 16, 360);
    g.fillRect(944, 0, 16, 360);
    g.fillStyle(0x244c24);
    g.fillTriangle(320, 320, 428, 320, 428, 284);
    g.fillStyle(0x0aff5a);
    g.fillRect(this.door.x, this.door.y, this.door.w, this.door.h);
    g.fillStyle(0x052805);
    g.fillRect(this.door.x + 5, this.door.y + 8, 16, 44);
    g.fillStyle(0xffff4a);
    g.fillRect(this.floppy.x, this.floppy.y, 16, 16);
    g.fillStyle(0x2d2d00);
    g.fillRect(this.floppy.x + 3, this.floppy.y + 3, 10, 5);
    g.fillStyle(0xffffff);
    g.fillRect(this.floppy.x + 5, this.floppy.y + 10, 6, 3);
  }

  update(_, delta) {
    const accel = 0.65;
    const friction = 0.82;

    if (Input.get("MOVE_LEFT")) this.player.vx -= accel;
    if (Input.get("MOVE_RIGHT")) this.player.vx += accel;
    if (!Input.get("MOVE_LEFT") && !Input.get("MOVE_RIGHT")) this.player.vx *= friction;
    this.player.vx = Phaser.Math.Clamp(this.player.vx, -4, 4);

    if (Input.get("JUMP") && this.player.onGround) this.player.vy = -9.5;
    if (Input.get("GLITCH_ACTION") && this.boostTimer <= 0) this.boostTimer = 500;

    if (this.boostTimer > 0) {
      this.boostTimer -= delta;
      this.player.vx = 9.5;
    }

    PHYSICS.update(this.player, this.world, this.gameState);

    if (Math.abs(this.player.vx) >= 6) this.thinWallTween.resume();
    else {
      this.thinWallTween.pause();
      this.thinWall.setAlpha(1);
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(
      new Phaser.Geom.Rectangle(this.player.x, this.player.y, this.player.w, this.player.h),
      new Phaser.Geom.Rectangle(this.floppy.x, this.floppy.y, this.floppy.w, this.floppy.h)
    )) {
      this.hintText.setText("BUG_ID #001: Collision sweep disabled above vel. threshold. STATUS: [WILL NOT FIX]");
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(
      new Phaser.Geom.Rectangle(this.player.x, this.player.y, this.player.w, this.player.h),
      new Phaser.Geom.Rectangle(this.door.x, this.door.y, this.door.w, this.door.h)
    )) {
      Save.write({ currentLevel: 2 });
      this.scene.start("Level2");
    }

    this.playerG.clear();
    this.playerG.fillStyle(0x9cff9c);
    this.playerG.fillRect(Math.floor(this.player.x), Math.floor(this.player.y), this.player.w, this.player.h);
    this.playerG.fillStyle(0x061606);
    this.playerG.fillRect(Math.floor(this.player.x + 3), Math.floor(this.player.y + 5), 3, 3);
    this.playerG.fillRect(Math.floor(this.player.x + 9), Math.floor(this.player.y + 5), 3, 3);
  }
}
