# ⚡ NexusLurkers

> **FAST. PRECISE. NO MERCY.**

NexusLurkers is an original **2D top-down arena shooter** built for the NexusVerse ecosystem. It takes inspiration from fast browser arena shooters while using its own gameplay code, visual identity and assets.

## Features

- Smooth 2D Canvas rendering
- WASD + arrow-key movement
- Sprint with Shift
- Mouse aiming and left-click firing
- Right-click aim mode
- Five original weapons with distinct fire rates, damage, spread and magazines
- HP + armor damage model
- Reload system
- AI opponents with patrol, line-of-sight, chase, retreat and strafing behavior
- Arena walls and collision
- Projectiles and trails
- Particle bursts and screen-shake feedback
- Health, armor, ammo and coin pickups
- Armory/shop with weapon and supply purchases
- Score, kills, deaths, streak and combat feed
- 10-minute match clock
- Minimap
- Responsive launcher and mobile-friendly layout
- Zero runtime dependencies
- Local server on port 4000
- Automated Node.js tests and syntax checks

## Run

Requirements: **Node.js 20+**.

```bash
npm install
npm start
```

Open `http://127.0.0.1:4000`.

## Controls

| Action | Input |
|---|---|
| Move | WASD / Arrow keys |
| Sprint | Shift |
| Aim | Mouse |
| Fire | Left mouse |
| Aim mode | Right mouse |
| Reload | R |
| Armory | B |
| Release cursor | Esc |

## Project structure

```text
NexusLurkers/
├── client/
│   ├── app.js
│   └── style.css
├── game/
│   └── game-core.js
├── server/
│   └── server.js
├── tests/
│   └── game-core.test.js
├── .github/workflows/
│   └── ci.yml
├── index.html
└── package.json
```

## Verification

Run the same checks used by GitHub Actions:

```bash
npm test
npm run check
```

The tests cover match initialization, armor calculations, weapon firing, shop affordability, wall/world collision, delta-time clamping and match completion.

## Multiplayer direction

The current release is a local single-player foundation. The architecture deliberately keeps game state and simulation in `game/game-core.js` so a future authoritative WebSocket server can reuse the same state model. Planned networking includes lobby state, player synchronization, LAN connectivity and reconnect handling.

## Originality

NexusLurkers is **not** the Lurkers.io source code or a redistribution of its proprietary assets. The project uses an original name, original branding, original gameplay implementation and original visual treatment.

## License

See `LICENSE` for the project-specific terms.
