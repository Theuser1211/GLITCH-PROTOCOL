Original prompt: Build GLITCH://PROTOCOL, a complete Phaser 3 browser game for the GLITCHED GAMES hackathon, outputting full working code for index.html, input.js, save.js, physics.js, inventory.js, level1.js, level2.js, level3.js, level4.js, and game.js.

Progress:
- Created shell, input, save, and inventory modules.
- Added physics, all four level scenes, menu router, render_game_to_text, and advanceTime hook.
- Installed local Playwright dependency for browser verification.
- Added a tiny local dev-server.cjs helper after inline server startup failed.
- Playwright initially captured a black canvas under WebGL; switched Phaser config to Canvas renderer and added keyboard start from the menu.
- Verified with the develop-web-game Playwright client at http://127.0.0.1:5173. Latest state reached Level1 and screenshot rendered visible gameplay.
- Made Level 4 Camera Chip more visible with a label, outline, and arrow while preserving the 8x8 dead-pixel cluster.
- Added Level 4 status text after chip collection and a forgiving explicit wrap at the left edge.

TODO:
- Further manual QA can cover full progression through Levels 2-4 and ending timing.
