# StrandCraft Setup Guide

## Quick Start

Follow these steps to get StrandCraft running locally:

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Set Up Database

#### Option A: Using Neon (Recommended)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:password@host.neon.tech/database`)

#### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a new database: `createdb strandcraft`
3. Your connection string will be: `postgresql://localhost:5432/strandcraft`

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your database URL:

```
DATABASE_URL=postgresql://your-connection-string-here
```

### 4. Initialize Database

Push the schema to your database:

```bash
bun run db:push
# or
npm run db:push
```

This will create the `puzzles` table with all necessary columns and indexes.

### 5. Start Development Server

```bash
bun run dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app!

## Troubleshooting

### Database Connection Issues

If you get a connection error:

1. Check that your `DATABASE_URL` is correct in `.env`
2. Make sure your database is running (if using local PostgreSQL)
3. For Neon, check that your IP is allowed (Neon allows all IPs by default)

### Build Errors

If you get TypeScript errors:

1. Make sure all dependencies are installed: `bun install`
2. Check that you're using Node.js 18+ or Bun
3. Try deleting `.next` folder and rebuilding: `rm -rf .next && bun run dev`

### Database Schema Issues

If you need to reset your database:

```bash
# Drop all tables and recreate
bun run db:push --force
```

## Next Steps

1. Visit the home page at [http://localhost:3000](http://localhost:3000)
2. Click "Create a Puzzle" to make your first puzzle
3. Follow the wizard to create and publish
4. Share the generated link to let others play!

## Production Deployment

See [README.md](./README.md) for deployment instructions to Vercel.
