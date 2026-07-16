# Zauberverse Moving Arena — Prototype 0.2

This build replaces the static turn-based prototype with a real-time Phaser arena.

## What changed

- Phaser 4.2.1 loaded through a CDN
- Three real-time lanes
- Click-to-deploy cards
- Regenerating energy
- Automatic unit movement
- Automatic targeting and combat
- Core health and win conditions
- Enemy deployment AI
- Placeholder attack, spawn, death and damage animations
- A crude Wraith teleport jump

## Uploading to GitHub

Replace these existing repository files:

- `index.html`
- `styles.css`
- `game.js`
- `README.md`

Commit the update. GitHub Pages will redeploy automatically.

## Controls

1. Click one of the four cards at the bottom.
2. Click a lane in the battlefield.
3. The deployed unit automatically advances and fights.
4. Destroy the Blacksite core before your Wraith core falls.

## Why the art is abstract

This is a mechanics prototype. Colored pieces make it cheap and fast to test:

- movement speed
- lane readability
- targeting
- attack timing
- energy economy
- match length
- Wraith's teleport behavior

Character artwork and polished animation should be added after the basic match becomes enjoyable.

## Technology

Phaser is loaded from:

`https://cdnjs.cloudflare.com/ajax/libs/phaser/4.2.1/phaser.min.js`

The game remains a static HTML/CSS/JavaScript site and works on GitHub Pages.
