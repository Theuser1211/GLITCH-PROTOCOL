class Level3 extends Phaser.Scene {
  constructor() {
    super("Level3");
  }

  create() {
    window.__currentScene = this;
    this.player = { x: 48, y: 300, w: 14, h: 18, speed: 2.2 };
    this.questFlags = [false, false, false];
    this.keycardOwned = false;
    this.wrapFlash = 0;
    this.messageTimer = 0;
    this.actionLatch = false;

    this.objects = [
      { type: "quest", id: 0, x: 120, y: 86, w: 20, h: 24 },
      { type: "quest", id: 1, x: 294, y: 92, w: 20, h: 24 },
      { type: "quest", id: 2, x: 472, y: 86, w: 20, h: 24 },
      { type: "refund", x: 64, y: 52, w: 42, h: 34 },
      { type: "bundle", x: 410, y: 214, w: 58, h: 38 },
      { type: "merchant", x: 536, y: 214, w: 48, h: 42 }
    ];

    this.exitGate = { x: 602, y: 54, w: 24, h: 72 };
    this.g = this.add.graphics();
    this.playerG = this.add.graphics();
    this.hud = this.add.text(14, 12, "", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#9cff9c"
    }).setDepth(5);
    this.msg = this.add.text(120, 326, "", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#eaff8f",
      backgroundColor: "#102010",
      padding: { x: 6, y: 4 }
    }).setDepth(5);
    this.priceTag = this.add.text(392, 192, "", {
      fontFamily: "monospace",
      fontSize: "13px",
      color: "#fffd72"
    });

    this.add.text(34, 100, "AUDIT LOG: Bits counter stored as uint8. Finance team aware. PRIORITY: LOW.", {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#eaff8f",
      backgroundColor: "#102010",
      padding: { x: 4, y: 3 },
      wordWrap: { width: 230 }
    });

    this.drawStatic();
  }

  interactRect() {
    return new Phaser.Geom.Rectangle(this.player.x - 8, this.player.y - 8, this.player.w + 16, this.player.h + 16);
  }

  showMessage(text) {
    this.msg.setText(text);
    this.messageTimer = 1500;
  }

  handleInteract() {
    const area = this.interactRect();

    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      const rect = new Phaser.Geom.Rectangle(obj.x, obj.y, obj.w, obj.h);
      if (!Phaser.Geom.Intersects.RectangleToRectangle(area, rect)) continue;

      if (obj.type === "quest" && !this.questFlags[obj.id]) {
        this.questFlags[obj.id] = true;
        Inventory.addBits(12);
        this.showMessage("QUEST COMPLETE: +12 Bits");
      }

      if (obj.type === "refund") {
        const before = Inventory.getBits();
        Inventory.spendBits(1);
        if (before === 0) {
          this.wrapFlash = 300;
          this.showMessage("REFUND OK: BALANCE RECONCILED");
        } else {
          this.showMessage("REFUND MACHINE: -1 Bit");
        }
      }

      if (obj.type === "bundle") {
        if (Inventory.getBits() >= 255) {
          Inventory.spendBits(255);
          Inventory.bonus = 256;
          this.showMessage("+256 Bits Bundle installed");
        } else {
          this.showMessage("Bundle requires 255 Bits");
        }
      }

      if (obj.type === "merchant") {
        if (Inventory.canAfford(500)) {
          this.keycardOwned = true;
          this.showMessage("KEYCARD PURCHASED");
          this.drawStatic();
        } else {
          this.showMessage("Merchant: 500 Bits. No discounts.");
        }
      }
    }
  }

  update(_, delta) {
    let dx = 0;
    let dy = 0;

    if (Input.get("MOVE_LEFT")) dx -= 1;
    if (Input.get("MOVE_RIGHT")) dx += 1;
    if (Input.get("JUMP")) dy -= 1;
    if (Input.get("PAUSE")) dy += 1;
    if (dx && dy) {
      dx *= 0.707;
      dy *= 0.707;
    }

    this.player.x = Phaser.Math.Clamp(this.player.x + dx * this.player.speed, 16, 610);
    this.player.y = Phaser.Math.Clamp(this.player.y + dy * this.player.speed, 38, 326);

    const actionDown = Input.get("GLITCH_ACTION");
    if (actionDown && !this.actionLatch) this.handleInteract();
    this.actionLatch = actionDown;

    if (this.keycardOwned && Phaser.Geom.Intersects.RectangleToRectangle(
      new Phaser.Geom.Rectangle(this.player.x, this.player.y, this.player.w, this.player.h),
      new Phaser.Geom.Rectangle(this.exitGate.x, this.exitGate.y, this.exitGate.w, this.exitGate.h)
    )) {
      Save.write({ currentLevel: 4 });
      this.scene.start("Level4");
    }

    if (this.messageTimer > 0) {
      this.messageTimer -= delta;
      if (this.messageTimer <= 0) this.msg.setText("");
    }

    if (this.wrapFlash > 0) {
      this.wrapFlash -= delta;
      this.hud.setColor("#ff3030");
      this.hud.setText("BITS: ???");
    } else {
      this.hud.setColor("#9cff9c");
      this.hud.setText("BITS: " + (Inventory.getBits() + Inventory.bonus));
    }

    this.priceTag.setText(this.time.now % 500 < 250 ? "+256 Bundle: $∞" : "+256 Bundle: 255");
    this.playerG.clear();
    this.playerG.fillStyle(0x9cff9c);
    this.playerG.fillRect(Math.floor(this.player.x), Math.floor(this.player.y), this.player.w, this.player.h);
  }

  drawStatic() {
    const g = this.g;
    g.clear();
    g.fillStyle(0x071207);
    g.fillRect(0, 0, 640, 360);
    g.fillStyle(0x123112);
    g.fillRect(16, 38, 608, 290);
    g.lineStyle(1, 0x2c6d2c);
    for (let x = 16; x < 624; x += 32) g.lineBetween(x, 38, x, 328);
    for (let y = 38; y < 328; y += 32) g.lineBetween(16, y, 624, y);

    this.objects.forEach(obj => {
      if (obj.type === "quest") g.fillStyle(0xfff36a);
      if (obj.type === "refund") g.fillStyle(0x6affff);
      if (obj.type === "bundle") g.fillStyle(0xff6aff);
      if (obj.type === "merchant") g.fillStyle(0xffaa3d);
      g.fillRect(obj.x, obj.y, obj.w, obj.h);
    });

    g.fillStyle(this.keycardOwned ? 0x0aff5a : 0x334433);
    g.fillRect(this.exitGate.x, this.exitGate.y, this.exitGate.w, this.exitGate.h);

    this.add.text(111, 116, "NPC", { fontFamily: "monospace", fontSize: "10px", color: "#ffff99" });
    this.add.text(285, 122, "NPC", { fontFamily: "monospace", fontSize: "10px", color: "#ffff99" });
    this.add.text(463, 116, "NPC", { fontFamily: "monospace", fontSize: "10px", color: "#ffff99" });
    this.add.text(48, 88, "REFUND", { fontFamily: "monospace", fontSize: "10px", color: "#aaffff" });
    this.add.text(527, 260, "KEYCARD 500", { fontFamily: "monospace", fontSize: "10px", color: "#ffdd99" });
  }
}
