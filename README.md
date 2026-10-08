# Buea Life MVP

Vector-first open-world life-simulation prototype inspired by life in Buea, Cameroon. Original implementation; it does not copy Lagos Life code or assets.

## Folders
- `/backend` — server-authoritative test economy API (Node built-ins, zero external dependencies)
- `/frontend` — desktop/browser game client
- `/mobile` — installable mobile-first PWA client using the same game UI/API

## Start
Requires Node.js 20+.

```bash
npm start
```

Open:
- Web: http://localhost:5173
- Mobile/PWA: http://localhost:5174
- API health: http://localhost:4100/health

No `npm install` is required for this test build because it intentionally has zero external runtime dependencies. The package registry was unavailable in the build environment, so this is the only truthful way to provide a verified immediately runnable package.

## Environment
Copy `backend/.env.example` to `backend/.env` when evolving beyond test mode. The current dependency-free server reads environment variables supplied by your shell. Test mode does not require secrets.

## Test gameplay
1. Enter a character name.
2. Start at Mile 17 with 75,000 fictional FCFA.
3. Tap Molyko locations to move.
4. Rent a room, eat, register at university, or work a tech hustle.
5. Open the virtual phone.
6. Track quests, needs, XP, level and the server-controlled ledger.

## Important scope
This is a playable MVP/prototype, not yet a full GTA-like multiplayer production game. Native Android/iOS binaries, Godot physics, realtime multiplayer, persistent PostgreSQL, NPC AI, vehicles, chat and production authentication are Phase 2. The `/mobile` client is an installable PWA today; native app-store packaging requires a native SDK/toolchain and packages that could not be downloaded in this environment.
