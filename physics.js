(function () {
  window.Camera = window.Camera || { clamped: true };

  const GRAVITY = 0.5;
  const CLIP_THRESHOLD = 8.0;

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function playerRectAt(player, x, y) {
    return { x: x, y: y, w: player.w, h: player.h };
  }

  function moveHorizontal(player, walls) {
    if (Math.abs(player.vx) >= CLIP_THRESHOLD) {
      player.x += player.vx;
      for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];
        if (wall.clipGate) continue;
        if (rectsOverlap(playerRectAt(player, player.x, player.y), wall)) {
          if (player.vx > 0) player.x = wall.x - player.w;
          if (player.vx < 0) player.x = wall.x + wall.w;
          player.vx = 0;
        }
      }
      return;
    }

    const dir = Math.sign(player.vx);
    let remaining = Math.abs(player.vx);

    while (remaining > 0) {
      const step = Math.min(1, remaining);
      const nextX = player.x + dir * step;
      let hit = false;

      for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];
        if (rectsOverlap(playerRectAt(player, nextX, player.y), wall)) {
          hit = true;
          if (dir > 0) player.x = wall.x - player.w;
          if (dir < 0) player.x = wall.x + wall.w;
          player.vx = 0;
          break;
        }
      }

      if (hit) break;
      player.x = nextX;
      remaining -= step;
    }
  }

  function moveVertical(player, surfaces) {
    player.onGround = false;
    const dir = Math.sign(player.vy);
    let remaining = Math.abs(player.vy);

    while (remaining > 0) {
      const step = Math.min(1, remaining);
      const nextY = player.y + dir * step;
      let hit = false;

      for (let i = 0; i < surfaces.length; i++) {
        const surface = surfaces[i];
        if (rectsOverlap(playerRectAt(player, player.x, nextY), surface)) {
          if (dir > 0) {
            player.y = surface.y - player.h;
            player.onGround = true;
          } else if (dir < 0) {
            player.y = surface.y + surface.h;
          }
          player.vy = 0;
          hit = true;
          break;
        }
      }

      if (hit) break;
      player.y = nextY;
      remaining -= step;
    }
  }

  window.PHYSICS = {
    update: function (player, world, gameState) {
      const walls = world.getWalls ? world.getWalls(gameState) : [];
      const surfaces = world.getSurfaces ? world.getSurfaces(gameState) : [];

      if (!world.noGravity) {
        player.vy += GRAVITY;
      }

      moveHorizontal(player, walls);
      moveVertical(player, surfaces);

      if (!Camera.clamped && player.x < 0) {
        player.x = world.width + player.x;
      }

      if (Camera.clamped && player.x < 0) {
        player.x = 0;
        player.vx = 0;
      }

      if (player.x + player.w > world.width) {
        player.x = world.width - player.w;
        player.vx = 0;
      }

      if (player.y > 520) {
        player.x = world.spawnX || 32;
        player.y = world.spawnY || 260;
        player.vx = 0;
        player.vy = 0;
      }
    }
  };
})();
