// Test script to check if puzzle exists
import { db } from "./lib/db";
import { puzzles } from "./lib/db/schema";
import { eq } from "drizzle-orm";

async function testPuzzleLookup() {
  const slug = "CGB8GK";

  console.log(`Looking up puzzle with slug: ${slug}`);

  // Try exact match
  const [puzzle] = await db
    .select()
    .from(puzzles)
    .where(eq(puzzles.slug, slug))
    .limit(1);

  if (puzzle) {
    console.log("✓ Puzzle found:", {
      slug: puzzle.slug,
      title: puzzle.title,
      author: puzzle.author,
    });
  } else {
    console.log("✗ Puzzle not found with exact match");

    // Try case-insensitive search
    const allPuzzles = await db
      .select({ slug: puzzles.slug, title: puzzles.title })
      .from(puzzles)
      .limit(10);

    console.log("\nFirst 10 puzzles in database:");
    allPuzzles.forEach((p) => console.log(`  - ${p.slug}: ${p.title}`));

    // Check if slug exists with different case
    const similarSlugs = allPuzzles.filter(
      (p) => p.slug.toUpperCase() === slug.toUpperCase()
    );

    if (similarSlugs.length > 0) {
      console.log("\n✓ Found puzzle with different case:", similarSlugs);
    }
  }

  process.exit(0);
}

testPuzzleLookup().catch(console.error);
