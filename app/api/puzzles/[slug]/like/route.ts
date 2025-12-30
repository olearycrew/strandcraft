// app/api/puzzles/[slug]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { puzzles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { isValidSlug } from "@/lib/utils/slug";
import type { ErrorResponse } from "@/types/puzzle";

interface LikeRequest {
  action: "like" | "unlike";
}

interface LikeResponse {
  success: true;
  likeCount: number;
  liked: boolean;
}

// POST /api/puzzles/[slug]/like - Like or unlike a puzzle
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

    const body: LikeRequest = await request.json();
    const { action } = body;

    if (action !== "like" && action !== "unlike") {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Invalid action. Must be 'like' or 'unlike'",
        },
        { status: 400 }
      );
    }

    // Update the like count (ensure it doesn't go below 0)
    const updateQuery =
      action === "like"
        ? { likeCount: sql`${puzzles.likeCount} + 1` }
        : { likeCount: sql`GREATEST(${puzzles.likeCount} - 1, 0)` };

    const [updatedPuzzle] = await db
      .update(puzzles)
      .set(updateQuery)
      .where(eq(puzzles.slug, slug))
      .returning({
        likeCount: puzzles.likeCount,
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

    return NextResponse.json<LikeResponse>({
      success: true,
      likeCount: updatedPuzzle.likeCount,
      liked: action === "like",
    });
  } catch (error) {
    console.error("Error updating puzzle like:", error);
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
