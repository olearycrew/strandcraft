# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

> **⚠️ CRITICAL: USE BUN ONLY ⚠️**
>
> **This project uses `bun` as its package manager. DO NOT use npm, yarn, or pnpm.**
>
> ```bash
> # ✅ CORRECT
> bun install
> bun run dev
> bun run build
>
> # ❌ WRONG - DO NOT USE
> npm install    # NO!
> yarn install   # NO!
> pnpm install   # NO!
> ```

---

## 🚨 Package Manager Reminder

**BUN. ONLY. BUN.**

- Install dependencies: `bun install`
- Run scripts: `bun run <script>`
- Add packages: `bun add <package>`
- Remove packages: `bun remove <package>`

The project has a `bun.lock` file. Using any other package manager will create conflicts and break the build.

---

## Project Overview

**StrandCraft** is a DIY Strands Puzzle Creator — a web application for creating and sharing custom word puzzles inspired by NYT Strands.

### Tech Stack

| Layer     | Technology                       |
| --------- | -------------------------------- |
| Framework | Next.js 16+ (App Router)         |
| Database  | PostgreSQL via Neon (serverless) |
| ORM       | Drizzle ORM                      |
| Styling   | Tailwind CSS v4                  |
| Hosting   | Vercel                           |
| Language  | TypeScript                       |

---

## Key Commands

**Remember: Use `bun`, not npm/yarn/pnpm!**

```bash
# Development
bun install          # Install dependencies
bun run dev          # Start development server (http://localhost:3000)
bun run build        # Production build
bun run start        # Start production server

# Database (Drizzle ORM)
bun run db:generate  # Generate migration files from schema
bun run db:push      # Push schema changes directly to database
bun run db:migrate   # Run migrations
bun run db:studio    # Open Drizzle Studio to view/edit database
```

---

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── og/               # Open Graph image generation
│   │   └── puzzles/          # Puzzle CRUD endpoints
│   ├── create/               # Puzzle creator wizard
│   │   └── components/       # Creator-specific components
│   ├── play/[slug]/          # Puzzle player page
│   ├── community/            # Community puzzles page
│   ├── how-to-play/          # Instructions page
│   ├── my-puzzles/           # User's created puzzles
│   └── components/           # Shared app components
├── lib/                      # Shared utilities
│   ├── db/                   # Database configuration
│   │   ├── index.ts          # Database connection
│   │   └── schema.ts         # Drizzle schema
│   └── utils/                # Utility functions
│       ├── auto-layout.ts    # Auto-placement algorithm
│       ├── dictionary.ts     # Word dictionary utilities
│       ├── grid.ts           # Grid coordinate utilities
│       ├── slug.ts           # Slug generation
│       └── validation.ts     # Puzzle validation
├── types/                    # TypeScript type definitions
│   └── puzzle.ts             # Puzzle-related types
├── docs/                     # Documentation
├── plans/                    # Architecture documentation
└── scripts/                  # Database scripts
```

---

## Important Patterns & Conventions

### 1. Grid Coordinate System

The puzzle grid is 8 rows × 6 columns (48 cells total). Grid letters are stored as a flat 48-character string in row-major order:

```
Index = row * 6 + col
Row = Math.floor(index / 6)
Col = index % 6
```

### 2. API Routes

- `POST /api/puzzles` — Create a new puzzle
- `GET /api/puzzles/[slug]` — Fetch puzzle by slug
- `GET /api/puzzles/recent` — Get recent puzzles

### 3. Slug Generation

Slugs are 6-character identifiers using a vowel-free alphabet to prevent accidental words:

```typescript
const SAFE_ALPHABET = "2346789BCDFGHJKMNPQRTVWXZ";
```

### 4. Component Organization

- Page-specific components go in `app/<page>/components/`
- Shared components go in `app/components/`
- Utility functions go in `lib/utils/`

### 5. Database Schema

The main table is `puzzles` with:

- `slug` — Unique 6-character identifier
- `grid_letters` — 48-character string (row-major)
- `spangram_word` / `spangram_path` — Theme word spanning opposite edges
- `theme_words` — JSONB array of `{ word, path }` objects

### 6. Styling

- Uses Tailwind CSS v4
- Dark mode is the default theme
- Mobile-first responsive design

---

## Environment Variables

Required environment variable:

```
DATABASE_URL=postgresql://user:password@host:5432/database
```

For local development, copy `.env.example` to `.env.local` and configure your Neon database connection.

---

## Common Tasks

### Adding a New API Endpoint

1. Create route file in `app/api/<endpoint>/route.ts`
2. Export async functions for HTTP methods (`GET`, `POST`, etc.)
3. Use Drizzle ORM for database operations

### Modifying the Database Schema

1. Edit `lib/db/schema.ts`
2. Run `bun run db:push` (development) or `bun run db:generate` + `bun run db:migrate` (production)

### Adding a New Page

1. Create directory in `app/<page-name>/`
2. Add `page.tsx` for the route
3. Add page-specific components in `app/<page-name>/components/`

---

## Final Reminder

> **🔴 USE BUN FOR ALL PACKAGE MANAGEMENT 🔴**
>
> ```bash
> bun install
> bun run dev
> bun run build
> ```
>
> Not npm. Not yarn. Not pnpm. **BUN.**
