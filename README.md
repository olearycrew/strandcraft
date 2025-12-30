# StrandCraft

> A DIY Strands Puzzle Creator — Create and share custom word puzzles inspired by NYT Strands

## Features

- 🎮 **Create Custom Puzzles** - Design your own word puzzles with a simple wizard
- 🔗 **Easy Sharing** - Get a unique link to share your puzzle with anyone
- 📱 **Mobile-Friendly** - Touch-optimized interface for creating and playing on any device
- 🌙 **Dark Mode** - Easy on the eyes with a modern dark theme
- 🎯 **Interactive Gameplay** - Drag to select letters and find hidden words
- ⚡ **Fast & Serverless** - Built with Next.js and PostgreSQL via Neon

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Hosting**: Vercel
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database (we recommend [Neon](https://neon.tech) for serverless PostgreSQL)

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd diystrands
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your database connection string:

```
DATABASE_URL=postgresql://user:password@host:5432/database
```

4. Generate and push the database schema:

```bash
bun run db:push
# or
npm run db:push
```

5. Start the development server:

```bash
bun run dev
# or
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Commands

- `bun run db:generate` - Generate migration files from schema
- `bun run db:push` - Push schema changes directly to database (recommended for development)
- `bun run db:migrate` - Run migrations
- `bun run db:studio` - Open Drizzle Studio to view/edit database

## Project Structure

```
diystrands/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   └── puzzles/          # Puzzle CRUD endpoints
│   ├── create/               # Puzzle creator page
│   ├── play/[slug]/          # Puzzle player page
│   ├── how-to-play/          # Instructions page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── lib/                      # Shared utilities
│   ├── db/                   # Database configuration
│   │   ├── index.ts          # Database connection
│   │   └── schema.ts         # Drizzle schema
│   └── utils/                # Utility functions
│       ├── grid.ts           # Grid coordinate utilities
│       ├── slug.ts           # Slug generation
│       └── validation.ts     # Puzzle validation
├── types/                    # TypeScript type definitions
│   └── puzzle.ts             # Puzzle-related types
└── plans/                    # Architecture documentation
    └── architecture.md       # Detailed architecture plan
```

## How It Works

### Creating a Puzzle

1. **Metadata** - Enter title, author, and theme clue
2. **Words** - Define your spangram (theme word) and related theme words
3. **Grid** - Fill in the 8x6 letter grid with your words
4. **Publish** - Get a unique shareable link

### Playing a Puzzle

1. Click or tap on a letter to start selecting
2. Drag to adjacent letters (horizontally, vertically, or diagonally)
3. Release to submit your word
4. Find all words to win!

### The Spangram

Every puzzle has one special word called the **spangram**:

- Describes the puzzle's theme
- Spans from one edge of the grid to the opposite edge
- Highlighted in gold when found

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add your `DATABASE_URL` environment variable
4. Deploy!

Vercel will automatically:

- Build your Next.js app
- Set up serverless functions for API routes
- Provide a production URL

### Database Setup

We recommend using [Neon](https://neon.tech) for PostgreSQL:

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to your Vercel environment variables as `DATABASE_URL`
5. Run `bun run db:push` to create the tables

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Acknowledgments

Inspired by [NYT Strands](https://www.nytimes.com/games/strands)
