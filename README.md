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

## Vercel services

Import this repository as one Vercel project with the repository root as its Root Directory. The root `vercel.json` defines three Node services with no build step:

- `backend`: public `/api/*`, including `/api/health`.
- `frontend`: public `/` and remaining paths.
- `mobile`: public `/mobile/`, with `/mobile` redirected to the trailing-slash URL so relative assets resolve correctly.

Both browser clients call same-origin `/api/*` in this deployment. Only standalone local clients on localhost ports 5173/5174 use the API on port 4100. The old `buea-api` localStorage override is no longer used.

The client services explicitly bundle `index.html` and `src/**` using their service-scoped `functions.server.js.includeFiles` settings; mobile also bundles its manifest. Keep these settings: the static servers resolve filenames from request paths, so automatic function tracing can omit client assets even when `vercel dev` serves them successfully from disk. After changing this configuration, create a new deployment to rebuild the function bundles.

There are no server-to-server calls, so no service bindings or bound environment variables are needed. Browser JavaScript cannot consume runtime service bindings. If the backend should become internal, add a server-side API proxy and declare the backend binding on its calling service before removing the public API rewrite.

Run from the repository root to test all services through one domain:

```bash
vercel dev -L
```

`-L` uses local configuration without linking a Vercel project. Use `vercel dev` for a linked project and its environment variables. Open `/`, `/mobile/`, and `/api/health` on the URL printed by the CLI. Do not set `PORT` globally in Vercel; the runtime manages service ports. Set `TEST_MODE` explicitly if needed (it defaults to `true`); the example `GAME_MODE` variable is not read by the current server.

Deployment limitation: accounts, sessions, and player progress live in process-local Maps. They can disappear on restarts and differ between function instances. Durable shared storage is required before using this as a persistent game; this configuration does not add it.

## Test gameplay
1. Enter a character name.
2. Start at Mile 17 with 75,000 fictional FCFA.
3. Tap Molyko locations to move.
4. Rent a room, eat, register at university, or work a tech hustle.
5. Open the virtual phone.
6. Track quests, needs, XP, level and the server-controlled ledger.

## Important scope
This is a playable MVP/prototype, not yet a full GTA-like multiplayer production game. Native Android/iOS binaries, Godot physics, realtime multiplayer, persistent PostgreSQL, NPC AI, vehicles, chat and production authentication are Phase 2. The `/mobile` client is an installable PWA today; native app-store packaging requires a native SDK/toolchain and packages that could not be downloaded in this environment.
