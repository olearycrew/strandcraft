// lib/db/schema.ts
import {
  pgTable,
  serial,
  varchar,
  char,
  jsonb,
  timestamp,
  index,
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
  },
  (table) => ({
    slugIdx: index("idx_puzzles_slug").on(table.slug),
    createdAtIdx: index("idx_puzzles_created_at").on(table.createdAt),
  })
);

export type Puzzle = typeof puzzles.$inferSelect;
export type NewPuzzle = typeof puzzles.$inferInsert;
