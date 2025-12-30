// lib/utils/validation.ts
import type { CreatePuzzleInput, Coordinate } from "@/types/puzzle";
import {
  isValidPath,
  spansOppositeEdges,
  allCellsUsedOnce,
  getWordFromPath,
  GRID_SIZE,
} from "./grid";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate puzzle data before saving to database
 */
export function validatePuzzle(input: CreatePuzzleInput): ValidationResult {
  const errors: string[] = [];

  // Validate title
  if (!input.title || input.title.trim().length === 0) {
    errors.push("Title is required");
  } else if (input.title.length > 100) {
    errors.push("Title must be 100 characters or less");
  }

  // Validate author
  if (!input.author || input.author.trim().length === 0) {
    errors.push("Author is required");
  } else if (input.author.length > 50) {
    errors.push("Author must be 50 characters or less");
  }

  // Validate theme clue
  if (!input.themeClue || input.themeClue.trim().length === 0) {
    errors.push("Theme clue is required");
  } else if (input.themeClue.length > 200) {
    errors.push("Theme clue must be 200 characters or less");
  }

  // Validate grid letters
  if (!input.gridLetters || input.gridLetters.length !== GRID_SIZE) {
    errors.push(`Grid must contain exactly ${GRID_SIZE} letters`);
  } else if (!/^[A-Z]{48}$/.test(input.gridLetters)) {
    errors.push("Grid must contain only uppercase letters A-Z");
  }

  // Validate spangram word
  if (!input.spangramWord || input.spangramWord.length < 4) {
    errors.push("Spangram must be at least 4 characters");
  } else if (input.spangramWord.length > 20) {
    errors.push("Spangram must be 20 characters or less");
  }

  // Validate spangram path
  if (!input.spangramPath || input.spangramPath.length === 0) {
    errors.push("Spangram path is required");
  } else {
    if (!isValidPath(input.spangramPath)) {
      errors.push("Spangram path contains invalid or non-adjacent coordinates");
    }
    if (!spansOppositeEdges(input.spangramPath)) {
      errors.push("Spangram must span opposite edges of the grid");
    }
    if (input.gridLetters && input.gridLetters.length === GRID_SIZE) {
      const spangramFromGrid = getWordFromPath(
        input.gridLetters,
        input.spangramPath
      );
      if (spangramFromGrid !== input.spangramWord) {
        errors.push("Spangram path does not match spangram word in grid");
      }
    }
  }

  // Validate theme words
  if (!input.themeWords || input.themeWords.length === 0) {
    errors.push("At least one theme word is required");
  } else {
    for (let i = 0; i < input.themeWords.length; i++) {
      const themeWord = input.themeWords[i];

      if (!themeWord.word || themeWord.word.length < 4) {
        errors.push(`Theme word ${i + 1} must be at least 4 characters`);
      }

      if (!themeWord.path || themeWord.path.length === 0) {
        errors.push(`Theme word ${i + 1} is missing a path`);
      } else {
        if (!isValidPath(themeWord.path)) {
          errors.push(
            `Theme word ${i + 1} has invalid or non-adjacent coordinates`
          );
        }
        if (input.gridLetters && input.gridLetters.length === GRID_SIZE) {
          const wordFromGrid = getWordFromPath(
            input.gridLetters,
            themeWord.path
          );
          if (wordFromGrid !== themeWord.word) {
            errors.push(`Theme word ${i + 1} path does not match word in grid`);
          }
        }
      }
    }
  }

  // Validate that all cells are used exactly once
  if (input.spangramPath && input.themeWords) {
    const allPaths = [
      input.spangramPath,
      ...input.themeWords.map((tw) => tw.path),
    ];
    if (!allCellsUsedOnce(allPaths)) {
      errors.push(
        "All grid cells must be used exactly once (no overlaps, no gaps)"
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
