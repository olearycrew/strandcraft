// lib/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  char,
  jsonb,
  timestamp,
  index,
  integer,
} from "drizzle-orm/pg-core";
import type { Coordinate, ThemeWord } from "@/types/puzzle";

export const puzzles = pgTable(
  "puzzles",
  {
    id: serial("id").primaryKey(),
    slug: varchar("slug", { length: 6 }).notNull().unique(),
    title: varchar("title", { length: 100 }).notNull(),
    author: varchar("author", { length: 50 }).notNull(),
    themeClue: varchar("theme_clue", { length: 200 }).notNull(),
    gridLetters: char("grid_letters", { length: 48 }).notNull(),
    spangramWord: varchar("spangram_word", { length: 20 }).notNull(),
    spangramPath: jsonb("spangram_path").$type<Coordinate[]>().notNull(),
    themeWords: jsonb("theme_words").$type<ThemeWord[]>().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Stats tracking
    playCount: integer("play_count").default(0).notNull(),
    completionCount: integer("completion_count").default(0).notNull(),
    likeCount: integer("like_count").default(0).notNull(),
  },
  (table) => ({
    slugIdx: index("idx_puzzles_slug").on(table.slug),
    createdAtIdx: index("idx_puzzles_created_at").on(table.createdAt),
    likeCountIdx: index("idx_puzzles_like_count").on(table.likeCount),
    completionCountIdx: index("idx_puzzles_completion_count").on(
      table.completionCount
    ),
  })
);

export type Puzzle = typeof puzzles.$inferSelect;
export type NewPuzzle = typeof puzzles.$inferInsert;
