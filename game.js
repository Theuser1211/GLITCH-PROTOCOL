class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene");
  }

  preload() {
    this.load.image("logo", "logo.jpg");
  }

  create() {
    window.__currentScene = this;
    this.startLatch = false;
    const save = Save.read();
    const hasSave = !!localStorage.getItem("glitch_protocol_save");

    this.g = this.add.graphics();
    this.g.fillStyle(0x071207);
    this.g.fillRect(0, 0, 640, 360);
    this.g.lineStyle(1, 0x1f5f1f);
    for (let x = 0; x < 640; x += 16) this.g.lineBetween(x, 0, x, 360);
    for (let y = 0; y < 360; y += 16) this.g.lineBetween(0, y, 640, y);
    this.g.fillStyle(0x0a1a0a);
    this.g.fillRect(106, 64, 428, 210);
    this.g.lineStyle(3, 0x0aff5a);
    this.g.strokeRect(106, 64, 428, 210);

    this.add.image(320, 146, "logo").setDisplaySize(490, 310).setAlpha(0.98);

    const newGame = this.add.text(220, 184, "[NEW GAME]", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#0aff5a",
      backgroundColor: "#102010",
      padding: { x: 8, y: 5 }
    }).setInteractive();

    const cont = this.add.text(174, 228, "[CONTINUE - Level " + save.currentLevel + "]", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: hasSave ? "#0aff5a" : "#477047",
      backgroundColor: "#102010",
      padding: { x: 8, y: 5 }
    });
    if (hasSave) cont.setInteractive();

    newGame.on("pointerdown", () => {
      Save.clear();
      Inventory.reset();
      Camera.clamped = true;
      this.scene.start("Level1");
    });

    cont.on("pointerdown", () => {
      if (!hasSave) return;
      this.scene.start("Level" + Phaser.Math.Clamp(save.currentLevel, 1, 4));
    });

    this.add.text(152, 302, "ARROWS/WASD MOVE    SPACE JUMP    SHIFT [!]", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#77cc77"
    });
  }

  update() {
    const startDown = Input.get("JUMP") || Input.get("GLITCH_ACTION");
    if (startDown && !this.startLatch) {
      Save.clear();
      Inventory.reset();
      Camera.clamped = true;
      this.scene.start("Level1");
    }
    this.startLatch = startDown;
  }
}

const config = {
  type: Phaser.CANVAS,
  width: 640,
  height: 360,
  backgroundColor: "#0a1a0a",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 640,
    height: 360
  },
  scene: [MenuScene, Level1, Level2, Level3, Level4]
};

window.addEventListener("load", function () {
  window.__game = new Phaser.Game(config);
});

window.render_game_to_text = function () {
  const scene = window.__currentScene;
  if (!scene) return JSON.stringify({ note: "No active scene" });
  return JSON.stringify({
    coordinateSystem: "origin top-left, x right, y down",
    scene: scene.scene.key,
    player: scene.player ? {
      x: Math.round(scene.player.x),
      y: Math.round(scene.player.y),
      vx: Math.round((scene.player.vx || 0) * 100) / 100,
      vy: Math.round((scene.player.vy || 0) * 100) / 100,
      onGround: !!scene.player.onGround
    } : null,
    bits: window.Inventory ? Inventory.getBits() + Inventory.bonus : null,
    cameraClamped: window.Camera ? Camera.clamped : null,
    paused: scene.gameState ? !!scene.gameState.paused : false,
    ending: !!scene.ending
  });
};

window.advanceTime = function () {
  if (window.__game && window.__game.loop) {
    window.__game.loop.step(performance.now());
  }
};
