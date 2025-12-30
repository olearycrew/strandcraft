// app/api/puzzles/[slug]/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { puzzles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { isValidSlug } from "@/lib/utils/slug";
import type { ErrorResponse } from "@/types/puzzle";

interface StatsUpdateRequest {
  action: "play" | "complete";
}

interface StatsResponse {
  success: true;
  playCount: number;
  completionCount: number;
}

// POST /api/puzzles/[slug]/stats - Increment play or completion count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate slug format
    if (!isValidSlug(slug)) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Invalid slug format",
        },
        { status: 400 }
      );
    }

    const body: StatsUpdateRequest = await request.json();
    const { action } = body;

    if (action !== "play" && action !== "complete") {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Invalid action. Must be 'play' or 'complete'",
        },
        { status: 400 }
      );
    }

    // Update the appropriate counter
    const updateField =
      action === "play"
        ? { playCount: sql`${puzzles.playCount} + 1` }
        : { completionCount: sql`${puzzles.completionCount} + 1` };

    const [updatedPuzzle] = await db
      .update(puzzles)
      .set(updateField)
      .where(eq(puzzles.slug, slug))
      .returning({
        playCount: puzzles.playCount,
        completionCount: puzzles.completionCount,
      });

    if (!updatedPuzzle) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Puzzle not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json<StatsResponse>({
      success: true,
      playCount: updatedPuzzle.playCount,
      completionCount: updatedPuzzle.completionCount,
    });
  } catch (error) {
    console.error("Error updating puzzle stats:", error);
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
