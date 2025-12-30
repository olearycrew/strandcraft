// lib/utils/auto-layout.ts
import type { Coordinate, ThemeWord } from "@/types/puzzle";
import { GRID_ROWS, GRID_COLS, areAdjacent, coordToIndex } from "./grid";

interface LayoutResult {
  success: boolean;
  gridLetters?: string;
  spangramPath?: Coordinate[];
  themeWordPaths?: Coordinate[][];
  error?: string;
}

/**
 * Shuffle an array in place (Fisher-Yates algorithm)
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Simple auto-layout algorithm (v1)
 * Places words sequentially in the grid, trying to find valid paths
 * Uses randomization so each run can produce different layouts
 * Tries multiple times to increase success rate
 */
export function autoLayout(
  spangramWord: string,
  themeWords: string[]
): LayoutResult {
  const allWords = [spangramWord, ...themeWords];
  const totalLetters = allWords.reduce((sum, word) => sum + word.length, 0);

  if (totalLetters !== 48) {
    return {
      success: false,
      error: `Total letters (${totalLetters}) must equal 48. Add or remove letters.`,
    };
  }

  // Try multiple times with different random seeds
  const maxAttempts = 20;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = tryLayout(spangramWord, themeWords);
    if (result.success) {
      return result;
    }
  }

  return {
    success: false,
    error:
      "Could not find a valid layout after multiple attempts. Try different words or shuffle again.",
  };
}

/**
 * Single attempt at creating a layout
 */
function tryLayout(spangramWord: string, themeWords: string[]): LayoutResult {
  // Create empty grid
  const grid: string[] = new Array(48).fill("");
  const usedCells = new Set<number>();

  // Try to place spangram first (must span opposite edges)
  const spangramPath = placeSpangram(spangramWord, grid, usedCells);
  if (!spangramPath) {
    return { success: false };
  }

  // Place theme words
  const themeWordPaths: Coordinate[][] = [];
  for (const word of themeWords) {
    const path = placeWord(word, grid, usedCells);
    if (!path) {
      return { success: false };
    }
    themeWordPaths.push(path);
  }

  return {
    success: true,
    gridLetters: grid.join(""),
    spangramPath,
    themeWordPaths,
  };
}

/**
 * Place spangram ensuring it spans opposite edges
 * Uses randomization for different layouts each time
 */
function placeSpangram(
  word: string,
  grid: string[],
  usedCells: Set<number>
): Coordinate[] | null {
  // Create shuffled arrays of starting positions
  const topEdgeCols = shuffle(Array.from({ length: GRID_COLS }, (_, i) => i));
  const leftEdgeRows = shuffle(Array.from({ length: GRID_ROWS }, (_, i) => i));
  const bottomEdgeCols = shuffle(
    Array.from({ length: GRID_COLS }, (_, i) => i)
  );
  const rightEdgeRows = shuffle(Array.from({ length: GRID_ROWS }, (_, i) => i));

  // Try starting from top edge (randomized order)
  for (const col of topEdgeCols) {
    const path = tryPlaceFromPosition(word, { row: 0, col }, grid, usedCells);
    if (path && spansToBottom(path)) {
      applyPath(word, path, grid, usedCells);
      return path;
    }
  }

  // Try starting from left edge (randomized order)
  for (const row of leftEdgeRows) {
    const path = tryPlaceFromPosition(word, { row, col: 0 }, grid, usedCells);
    if (path && spansToRight(path)) {
      applyPath(word, path, grid, usedCells);
      return path;
    }
  }

  // Try starting from bottom edge (randomized order)
  for (const col of bottomEdgeCols) {
    const path = tryPlaceFromPosition(
      word,
      { row: GRID_ROWS - 1, col },
      grid,
      usedCells
    );
    if (path && spansToTop(path)) {
      applyPath(word, path, grid, usedCells);
      return path;
    }
  }

  // Try starting from right edge (randomized order)
  for (const row of rightEdgeRows) {
    const path = tryPlaceFromPosition(
      word,
      { row, col: GRID_COLS - 1 },
      grid,
      usedCells
    );
    if (path && spansToLeft(path)) {
      applyPath(word, path, grid, usedCells);
      return path;
    }
  }

  return null;
}

/**
 * Place a regular word anywhere in the grid
 * Uses randomization for different layouts each time
 */
function placeWord(
  word: string,
  grid: string[],
  usedCells: Set<number>
): Coordinate[] | null {
  // Create shuffled list of all positions
  const positions: Coordinate[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      positions.push({ row, col });
    }
  }
  const shuffledPositions = shuffle(positions);

  // Try each position in random order
  for (const pos of shuffledPositions) {
    const index = coordToIndex(pos);
    if (!usedCells.has(index)) {
      const path = tryPlaceFromPosition(word, pos, grid, usedCells);
      if (path) {
        applyPath(word, path, grid, usedCells);
        return path;
      }
    }
  }

  return null;
}

/**
 * Try to place a word starting from a specific position using DFS
 * Also uses randomization in direction selection
 */
function tryPlaceFromPosition(
  word: string,
  start: Coordinate,
  grid: string[],
  usedCells: Set<number>
): Coordinate[] | null {
  const path: Coordinate[] = [start];
  const pathSet = new Set<number>([coordToIndex(start)]);

  function dfs(letterIndex: number, current: Coordinate): boolean {
    if (letterIndex === word.length) {
      return true;
    }

    // All possible directions (shuffled for randomness)
    const directions = shuffle([
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ]);

    for (const [dr, dc] of directions) {
      const next: Coordinate = {
        row: current.row + dr,
        col: current.col + dc,
      };

      // Check bounds
      if (
        next.row < 0 ||
        next.row >= GRID_ROWS ||
        next.col < 0 ||
        next.col >= GRID_COLS
      ) {
        continue;
      }

      const nextIndex = coordToIndex(next);

      // Check if cell is available
      if (usedCells.has(nextIndex) || pathSet.has(nextIndex)) {
        continue;
      }

      // Try this cell
      path.push(next);
      pathSet.add(nextIndex);

      if (dfs(letterIndex + 1, next)) {
        return true;
      }

      // Backtrack
      path.pop();
      pathSet.delete(nextIndex);
    }

    return false;
  }

  if (dfs(1, start)) {
    return path;
  }

  return null;
}

/**
 * Apply a word path to the grid
 */
function applyPath(
  word: string,
  path: Coordinate[],
  grid: string[],
  usedCells: Set<number>
): void {
  for (let i = 0; i < path.length; i++) {
    const index = coordToIndex(path[i]);
    grid[index] = word[i];
    usedCells.add(index);
  }
}

/**
 * Check if path spans from top to bottom
 */
function spansToBottom(path: Coordinate[]): boolean {
  const hasTop = path.some((c) => c.row === 0);
  const hasBottom = path.some((c) => c.row === GRID_ROWS - 1);
  return hasTop && hasBottom;
}

/**
 * Check if path spans from bottom to top
 */
function spansToTop(path: Coordinate[]): boolean {
  const hasTop = path.some((c) => c.row === 0);
  const hasBottom = path.some((c) => c.row === GRID_ROWS - 1);
  return hasTop && hasBottom;
}

/**
 * Check if path spans from left to right
 */
function spansToRight(path: Coordinate[]): boolean {
  const hasLeft = path.some((c) => c.col === 0);
  const hasRight = path.some((c) => c.col === GRID_COLS - 1);
  return hasLeft && hasRight;
}

/**
 * Check if path spans from right to left
 */
function spansToLeft(path: Coordinate[]): boolean {
  const hasLeft = path.some((c) => c.col === 0);
  const hasRight = path.some((c) => c.col === GRID_COLS - 1);
  return hasLeft && hasRight;
}
