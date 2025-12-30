// app/api/puzzles/recent/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { puzzles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch the 20 most recently created puzzles
    const recentPuzzles = await db
      .select({
        id: puzzles.id,
        slug: puzzles.slug,
        title: puzzles.title,
        author: puzzles.author,
        themeClue: puzzles.themeClue,
        createdAt: puzzles.createdAt,
      })
      .from(puzzles)
      .orderBy(desc(puzzles.createdAt))
      .limit(20);

    return NextResponse.json({
      success: true,
      puzzles: recentPuzzles,
    });
  } catch (error) {
    console.error("Error fetching recent puzzles:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch recent puzzles",
      },
      { status: 500 }
    );
  }
}
