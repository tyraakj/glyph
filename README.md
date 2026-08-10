<p align="center">
  <img src="public/glyph-logo.svg" alt="Glyph" width="64" height="64" />
</p>

<h1 align="center">Glyph</h1>

<p align="center">
  <strong>The AI-native system design workspace — from prompt to production spec.</strong>
</p>

<p align="center">
  Describe your system in plain English. Watch the architecture materialize on a live canvas.<br/>
  Collaborate in real-time. Ship a technical specification your team can execute against.
</p>

---

## What Is Glyph?

An open-source system design workspace where AI is a live collaborator — it doesn't just generate, it builds alongside you. Built for teams that ship.

Describe your system. The AI builds the architecture on your canvas in real-time — typed nodes, labeled edges, correct topology — while your team watches and refines. When the design is done, generate a Markdown spec and ship it. What used to take a 2-hour whiteboard session and a week of documentation now takes minutes.

**Love Excalidraw?** So do we. Now imagine if every node on that canvas had architectural meaning — databases, gateways, services, boundaries — and the AI actually understood them. Imagine if an AI agent could join the board alongside your team and build the architecture live. And imagine if you could turn that canvas into a structured Markdown spec with one click instead of screenshotting it into a doc. That's Glyph.

**Love Eraser?** Same energy. Now imagine you didn't need to write DSL syntax — you just prompted an AI in natural language and watched it build on a visual canvas in real-time. Imagine the AI stayed in your room, took direction mid-session, and iterated with your team instead of handing back a finished diagram. And when the design was done, the spec wrote itself. That's Glyph.

## Core Flow

```
Sign in → Create project → Prompt AI or import a starter template
    → AI builds architecture on the live canvas
        → Collaborate with your team in real-time
            → Generate a Markdown technical spec → Download & ship
```

## Features

**AI co-pilot** — The agent joins your canvas room live. It places nodes, draws edges, and responds to direction mid-session. No copy-paste from a chat window, no static image to manually redraw. You talk, it builds.

**Semantic nodes** — Six typed shapes: `rectangle` (service), `diamond` (decision), `circle` (endpoint), `pill` (process), `cylinder` (database), `hexagon` (boundary). Eight dark-mode color pairs. The AI and the spec generator both understand what each node *is* — so your outputs read like engineering docs, not shape descriptions.

**Real-time multiplayer** — Liveblocks-powered. Live cursors, presence indicators, synchronized editing. Your whole team designs together in one room. No "let me share my screen" — they're already in it.

**Starter blueprints** — Prebuilt architecture templates — microservices, event-driven, serverless, monolith. Import into a live session, customize with AI or by hand. Go from zero to a working system design in under a minute.

**Graph → Spec** — One click converts your canvas into a structured Markdown technical specification. Persisted, downloadable, linked to your project. The meeting ends and the spec is already written.

**Auth & access control** — Better Auth identity. Route protection. Owner + collaborator permissions. Room tokens issued only after membership verification. Your designs stay private until you say otherwise.

## Tech Stack

| Layer | Technology | Role |
|:---|:---|:---|
| Framework | Next.js 16 + TypeScript | Full-stack with server/client boundaries |
| UI | Tailwind CSS v4 + shadcn/ui | Component composition and styling |
| Auth | Better Auth | User identity and route protection |
| Database | Prisma 7 + PostgreSQL | Relational metadata and project management |
| Canvas | Liveblocks + React Flow | Real-time collaborative canvas |
| Background Tasks | Trigger.dev | Durable AI generation workflows |
| Artifact Storage | Vercel Blob | Canvas snapshots and generated specs |

## Project Structure

```
app/
├── api/            # Authenticated route handlers
├── editor/         # Editor workspace and project views
├── (auth)/         # Sign-in and sign-up pages
components/
├── editor/         # Canvas, sidebars, shape panel, node shapes
├── ui/             # shadcn/ui foundation components
lib/                # Prisma client, auth helpers, utilities
trigger/            # Durable background tasks (AI generation)
types/              # Canvas types, node shapes, color definitions
prisma/             # Schema and migrations
context/            # Project documentation and feature specs
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Prisma Postgres)
- Liveblocks account
- Trigger.dev account (for AI generation tasks)

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=               # PostgreSQL connection string
BETTER_AUTH_SECRET=          # Auth secret key
BETTER_AUTH_URL=             # Auth base URL (http://localhost:3000 for dev)
LIVEBLOCKS_SECRET_KEY=      # Liveblocks secret key
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=  # Liveblocks public key
```

### Install & Run

```bash
# Install dependencies
npm install

# Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# Seed the database (optional)
npx tsx prisma/seed.ts

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

## Design System

Glyph uses a dark-only theme with a near-black base (`#080809`), layered surfaces, and vivid accent colors:

- **Brand accent**: Cyan (`#00c8d4`)
- **AI accent**: Indigo-purple (`#6457f9`)
- **Typography**: Geist Sans (UI) + Geist Mono (code)
- **Border radius scale**: `rounded-xl` → `rounded-2xl` → `rounded-3xl`

All colors are CSS custom properties mapped to Tailwind tokens. No hardcoded hex values.

## Roadmap

- [ ] Node properties panel (color, shape, label editing)
- [ ] Edge behavior and connection management
- [ ] Canvas ergonomics (zoom controls, minimap, keyboard shortcuts)
- [ ] Presence avatars and live cursors
- [ ] AI sidebar and chat interface
- [ ] Canvas auto-save to Vercel Blob
- [ ] Design agent API and generation logic
- [ ] Spec generation flow and download

## License

Open source — [MIT License](LICENSE).
