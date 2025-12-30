// app/api/puzzles/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { puzzles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { isValidSlug } from "@/lib/utils/slug";
import type {
  GetPuzzleResponse,
  ErrorResponse,
  PuzzlePublic,
} from "@/types/puzzle";

export async function GET(
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

    // Fetch puzzle from database
    const [puzzle] = await db
      .select()
      .from(puzzles)
      .where(eq(puzzles.slug, slug))
      .limit(1);

    if (!puzzle) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Puzzle not found",
        },
        { status: 404 }
      );
    }

    // Return public puzzle data (without internal id)
    const publicPuzzle: PuzzlePublic = {
      slug: puzzle.slug,
      title: puzzle.title,
      author: puzzle.author,
      themeClue: puzzle.themeClue,
      gridLetters: puzzle.gridLetters,
      spangramWord: puzzle.spangramWord,
      spangramPath: puzzle.spangramPath,
      themeWords: puzzle.themeWords,
    };

    return NextResponse.json<GetPuzzleResponse>({
      success: true,
      puzzle: publicPuzzle,
    });
  } catch (error) {
    console.error("Error fetching puzzle:", error);
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
