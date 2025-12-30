// app/api/puzzles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { puzzles } from "@/lib/db/schema";
import { generateSlug } from "@/lib/utils/slug";
import { validatePuzzle } from "@/lib/utils/validation";
import type {
  CreatePuzzleInput,
  CreatePuzzleResponse,
  ErrorResponse,
} from "@/types/puzzle";

export async function POST(request: NextRequest) {
  try {
    const body: CreatePuzzleInput = await request.json();

    // Validate the puzzle data
    const validation = validatePuzzle(body);
    if (!validation.valid) {
      return NextResponse.json<ErrorResponse>(
        {
          success: false,
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // Generate a unique slug
    let slug = generateSlug();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        // Try to insert with this slug
        const [newPuzzle] = await db
          .insert(puzzles)
          .values({
            slug,
            title: body.title,
            author: body.author,
            themeClue: body.themeClue,
            gridLetters: body.gridLetters,
            spangramWord: body.spangramWord,
            spangramPath: body.spangramPath,
            themeWords: body.themeWords,
          })
          .returning();

        // Success! Return the slug and URL
        const url = `${request.nextUrl.origin}/play/${slug}`;
        return NextResponse.json<CreatePuzzleResponse>(
          {
            success: true,
            slug,
            url,
          },
          { status: 201 }
        );
      } catch (error: any) {
        // If slug collision, try again with a new slug
        if (error.code === "23505") {
          // Unique violation
          slug = generateSlug();
          attempts++;
        } else {
          throw error;
        }
      }
    }

    // If we exhausted all attempts
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Failed to generate unique slug",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error creating puzzle:", error);
    return NextResponse.json<ErrorResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
