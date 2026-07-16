# Zauberverse Game — Prototype 0.1

A free, static browser-game prototype built with plain HTML, CSS and JavaScript.

## What is included

- Three tactical lanes
- Wraith as the player leader
- The Blacksite as the enemy leader
- Energy and card deployment
- Simple enemy AI
- Simultaneous lane combat
- Wraith-themed cards and abilities
- Responsive desktop/mobile layout

## Play locally

You can open `index.html` directly in a browser.

For the most reliable preview, use a small local server. Python users can run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish free with GitHub Pages

1. Create a new **public** GitHub repository named `zauberverse-game`.
2. Upload every file in this folder to the root of that repository.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and the `/ (root)` folder.
6. Save.

The published address will normally be:

`https://YOUR-USERNAME.github.io/zauberverse-game/`

## File map

- `index.html` — page structure
- `styles.css` — visual design and responsive layout
- `game.js` — cards, rules, enemy AI and combat
- `README.md` — project instructions

## Best next upgrades

1. Test whether the three-lane match is fun.
2. Adjust health, energy and card numbers.
3. Replace placeholder card treatments with Zauberverse art.
4. Add real leader powers.
5. Add a deck-building screen.
6. Save progress in the browser.
7. Add online accounts and multiplayer only after the core match works.

## Design principle

Do not build the whole Zauberverse platform yet. Prove one satisfying match first.
