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
 * Format a user-friendly error message for path/word mismatch
 */
function formatPathMismatchError(
  wordType: string,
  wordIndex: number | null,
  expectedWord: string,
  actualWord: string
): string {
  const wordLabel =
    wordIndex !== null ? `Theme word ${wordIndex + 1} ("${expectedWord}")` : wordType;

  if (actualWord.length !== expectedWord.length) {
    return `${wordLabel}: Path has ${actualWord.length} cells but word has ${expectedWord.length} letters. The path traced "${actualWord}" but expected "${expectedWord}".`;
  }

  // Find where the mismatch occurs
  let mismatchIndex = -1;
  for (let i = 0; i < expectedWord.length; i++) {
    if (expectedWord[i] !== actualWord[i]) {
      mismatchIndex = i;
      break;
    }
  }

  if (mismatchIndex >= 0) {
    return `${wordLabel}: Path mismatch at position ${mismatchIndex + 1}. Expected "${expectedWord}" but path traced "${actualWord}". Try regenerating the layout or adjusting your words.`;
  }

  return `${wordLabel}: Path does not match the word in the grid. Expected "${expectedWord}" but got "${actualWord}".`;
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
      errors.push(
        `Spangram ("${input.spangramWord}"): Path contains invalid or non-adjacent coordinates. Each cell must be adjacent to the previous one.`
      );
    }
    if (!spansOppositeEdges(input.spangramPath)) {
      errors.push(
        `Spangram ("${input.spangramWord}"): Must span from one edge to the opposite edge (top-to-bottom or left-to-right).`
      );
    }
    if (input.gridLetters && input.gridLetters.length === GRID_SIZE) {
      const spangramFromGrid = getWordFromPath(
        input.gridLetters,
        input.spangramPath
      );
      if (spangramFromGrid !== input.spangramWord) {
        errors.push(
          formatPathMismatchError(
            `Spangram ("${input.spangramWord}")`,
            null,
            input.spangramWord,
            spangramFromGrid
          )
        );
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
        errors.push(
          `Theme word ${i + 1} ("${themeWord.word || ""}"): Must be at least 4 characters long.`
        );
      }

      if (!themeWord.path || themeWord.path.length === 0) {
        errors.push(
          `Theme word ${i + 1} ("${themeWord.word}"): Missing path. Please draw or generate a path for this word.`
        );
      } else {
        if (!isValidPath(themeWord.path)) {
          errors.push(
            `Theme word ${i + 1} ("${themeWord.word}"): Path contains invalid or non-adjacent coordinates. Each cell must be adjacent to the previous one.`
          );
        }
        if (input.gridLetters && input.gridLetters.length === GRID_SIZE) {
          const wordFromGrid = getWordFromPath(
            input.gridLetters,
            themeWord.path
          );
          if (wordFromGrid !== themeWord.word) {
            errors.push(
              formatPathMismatchError(
                `Theme word ${i + 1}`,
                i,
                themeWord.word,
                wordFromGrid
              )
            );
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
