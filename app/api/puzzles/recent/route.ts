// app/api/puzzles/recent/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { puzzles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

// Force dynamic rendering - never cache this route
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch all puzzles ordered by creation date (most recent first)
    const allPuzzles = await db
      .select({
        id: puzzles.id,
        slug: puzzles.slug,
        title: puzzles.title,
        author: puzzles.author,
        themeClue: puzzles.themeClue,
        createdAt: puzzles.createdAt,
      })
      .from(puzzles)
      .orderBy(desc(puzzles.createdAt));

    return NextResponse.json({
      success: true,
      puzzles: allPuzzles,
    });
  } catch (error) {
    console.error("Error fetching puzzles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch puzzles",
      },
      { status: 500 }
    );
  }
}
