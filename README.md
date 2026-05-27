---
noteId: "47a984b059c411f192bde310adf944d0"
tags: []

---

# GLITCH://PROTOCOL

A Phaser 3 browser game built for the GLITCHED GAMES hackathon.

## Run Locally

Open `index.html` in a browser or serve the folder with a static server.

## Controls

- Move: `A/D` or `Left/Right`
- Jump: `W`, `Space`, or `Up`
- Glitch action: `Shift` or `[!]`
- Pause: `Esc`, `P`, or `⏸`

## Glitch Mechanics

### 1. Wall clip burst

Level 1 contains a thin wall that can be clipped through when the player is boosted to high speed.

- Trigger: hold `Shift` or tap `[!]`
- Effect: `player.vx` is forced to `9.5` for 500 ms
- Engine detail: the physics code skips swept horizontal collision checks at high velocity, which lets the player pass through the thin wall

### 2. Pause-panel platform

Level 2 uses the pause menu as a hidden solid surface.

- Trigger: press `Esc`, `P`, or tap `⏸`
- Effect: `gameState.paused` toggles, and the pause panel rectangle is injected into the vertical collision surfaces
- Intended use: the player can land on the pause panel and cross the gap by using the pause state as a platform

### 3. Uint8 bit overflow

Level 3 stores bits in a `Uint8Array`, so the counter wraps instead of clamping.

- Quest NPCs: each grants `+12` bits once
- Refund Machine: subtracts `1` bit; if the value is already `0`, it wraps to `255`
- Bundle Vendor: costs `255` bits, then sets a `bonus = 256` flag so the HUD reads as `256`
- Merchant: checks affordability with `buffer[0] + bonus`, so `255 + 256` reaches `511` and passes the `500` price check

### 4. Camera clamp removal and wrap

Level 4 begins with normal left-edge clamping.

- Trigger: collect the Camera Chip at the left side of the level
- Effect: `Camera.clamped` becomes `false`
- Result: walking off the left edge wraps the player to the far right of the world

### 5. Ending portal sequence

The final portal starts a terminal-style ending sequence.

- Trigger: overlap the green portal in Level 4
- Effect: movement stops, the screen glitches for 2 seconds, then the terminal crawl begins
- End state: the game shows a `[PLAY AGAIN]` button that clears save data and restarts from Level 1

## Known Limitations

- The game uses a simplified custom physics layer instead of full Phaser Arcade Physics.
- The Level 2 pause-platform behavior is an intentional exploit, not a general-purpose platform system.
- The bit counter is intentionally broken by design and can wrap through `0` to `255`.
- Level 4 wraparound only happens after the Camera Chip is collected.
- The browser tab icon uses `logo.jpg`; the homescreen no longer draws the logo image itself.
- The build is tuned for the current browser implementation and static hosting; it is not packaged as a full production pipeline.

## Save Data

Progress is stored in `localStorage` under `glitch_protocol_save`.
