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

// Enable debug logging automatically in development mode
const DEBUG_AUTO_LAYOUT = process.env.NODE_ENV === "development";

function debugLog(...args: unknown[]): void {
  if (DEBUG_AUTO_LAYOUT) {
    console.log("[AutoLayout]", ...args);
  }
}

/**
 * Helper to visualize the grid state for debugging
 */
function gridToString(grid: string[]): string {
  let result = "\n";
  for (let row = 0; row < GRID_ROWS; row++) {
    const rowLetters = grid.slice(row * GRID_COLS, (row + 1) * GRID_COLS);
    result += rowLetters.map((l) => l || ".").join(" ") + "\n";
  }
  return result;
}

/**
 * Helper to format a path for debugging
 */
function pathToString(path: Coordinate[]): string {
  return path.map((c) => `(${c.row},${c.col})`).join(" → ");
}

/**
 * Verify that a path matches the expected word in the grid
 */
function verifyPathMatchesWord(
  word: string,
  path: Coordinate[],
  grid: string[]
): { matches: boolean; actual: string } {
  const actual = path.map((c) => grid[coordToIndex(c)] || "?").join("");
  return { matches: actual === word, actual };
}

interface IndexedWord {
  word: string;
  originalIndex: number;
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
 * Auto-layout algorithm (v2)
 *
 * Improvements over v1:
 * 1. Sorts theme words by length (longest first) - longer words have fewer
 *    valid placements, so placing them early maximizes success.
 * 2. Uses limited word-level backtracking - if word N can't be placed, try a few
 *    different positions for word N-1 instead of restarting the entire puzzle.
 *
 * Uses randomization so each run can produce different layouts.
 * Tries multiple times to increase success rate.
 */
export function autoLayout(
  spangramWord: string,
  themeWords: string[]
): LayoutResult {
  const allWords = [spangramWord, ...themeWords];
  const totalLetters = allWords.reduce((sum, word) => sum + word.length, 0);

  debugLog("Starting auto-layout with spangram:", spangramWord);
  debugLog("Theme words (original order):", themeWords);

  if (totalLetters !== 48) {
    return {
      success: false,
      error: `Total letters (${totalLetters}) must equal 48. Add or remove letters.`,
    };
  }

  // Create indexed words to track original positions
  // This is critical: we sort for better placement, but must return paths in original order
  const indexedWords: IndexedWord[] = themeWords.map((word, index) => ({
    word,
    originalIndex: index,
  }));

  // Sort by length (longest first) - longer words have fewer valid placements
  const sortedIndexedWords = [...indexedWords].sort(
    (a, b) => b.word.length - a.word.length
  );

  debugLog(
    "Theme words (sorted by length):",
    sortedIndexedWords.map((w) => `${w.word}(idx:${w.originalIndex})`)
  );

  // Set a time limit to prevent UI from becoming unresponsive
  const startTime = Date.now();
  const maxTimeMs = 3000; // 3 seconds max

  // Try multiple times with different random seeds
  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Check time limit
    if (Date.now() - startTime > maxTimeMs) {
      debugLog("Time limit reached after", attempt, "attempts");
      break;
    }

    const result = tryLayoutWithLimitedBacktracking(
      spangramWord,
      sortedIndexedWords,
      startTime,
      maxTimeMs
    );

    if (result.success && result.themeWordPaths && result.gridLetters) {
      // CRITICAL FIX: Reorder paths back to original theme word order
      // The paths are currently in sorted order, but we need them in original order
      const reorderedPaths: Coordinate[][] = new Array(themeWords.length);

      for (let i = 0; i < sortedIndexedWords.length; i++) {
        const originalIndex = sortedIndexedWords[i].originalIndex;
        reorderedPaths[originalIndex] = result.themeWordPaths[i];
      }

      debugLog("Layout successful on attempt", attempt + 1);
      debugLog("Grid state:", gridToString(result.gridLetters.split("")));

      // Verify all paths match their words (sanity check)
      const grid = result.gridLetters.split("");
      let allMatch = true;

      // Verify spangram
      const spangramCheck = verifyPathMatchesWord(
        spangramWord,
        result.spangramPath!,
        grid
      );
      if (!spangramCheck.matches) {
        debugLog(
          `ERROR: Spangram path mismatch! Expected "${spangramWord}", got "${spangramCheck.actual}"`
        );
        allMatch = false;
      } else {
        debugLog(
          `✓ Spangram "${spangramWord}" verified at path:`,
          pathToString(result.spangramPath!)
        );
      }

      // Verify theme words with reordered paths
      for (let i = 0; i < themeWords.length; i++) {
        const word = themeWords[i];
        const path = reorderedPaths[i];
        const check = verifyPathMatchesWord(word, path, grid);
        if (!check.matches) {
          debugLog(
            `ERROR: Theme word ${i + 1} path mismatch! Expected "${word}", got "${check.actual}"`
          );
          debugLog(`  Path: ${pathToString(path)}`);
          allMatch = false;
        } else {
          debugLog(`✓ Theme word "${word}" verified at path:`, pathToString(path));
        }
      }

      if (!allMatch) {
        debugLog("Path verification failed, continuing to next attempt...");
        continue;
      }

      return {
        success: true,
        gridLetters: result.gridLetters,
        spangramPath: result.spangramPath,
        themeWordPaths: reorderedPaths,
      };
    }
  }

  return {
    success: false,
    error:
      "Could not find a valid layout after multiple attempts. Try different words or shuffle again.",
  };
}

/**
 * Attempt layout with limited backtracking - uses greedy placement
 * for each word but tries multiple starting positions per word before
 * fully backtracking. Much faster than full backtracking.
 */
function tryLayoutWithLimitedBacktracking(
  spangramWord: string,
  indexedWords: IndexedWord[],
  startTime: number,
  maxTimeMs: number
): LayoutResult {
  // Check time limit
  if (Date.now() - startTime > maxTimeMs) {
    return { success: false };
  }

  // Create empty grid
  const grid: string[] = new Array(48).fill("");
  const usedCells = new Set<number>();

  // Place spangram first using greedy approach
  const spangramPath = placeSpangram(spangramWord, grid, usedCells);
  if (!spangramPath) {
    return { success: false };
  }

  debugLog("Spangram placed:", pathToString(spangramPath));
  debugLog("Grid after spangram:", gridToString(grid));

  // Extract just the words for placement (in sorted order)
  const sortedWords = indexedWords.map((iw) => iw.word);

  // Try to place theme words with limited backtracking
  const themeWordPaths = placeWordsWithLimitedBacktracking(
    sortedWords,
    0,
    grid,
    usedCells,
    3, // Max backtracks per word
    startTime,
    maxTimeMs
  );

  if (!themeWordPaths) {
    return { success: false };
  }

  debugLog("All words placed successfully");
  debugLog("Final grid:", gridToString(grid));

  return {
    success: true,
    gridLetters: grid.join(""),
    spangramPath,
    themeWordPaths,
  };
}

/**
 * Place words with limited backtracking
 * For each word, tries up to maxAttempts different placements
 * before giving up on that branch.
 */
function placeWordsWithLimitedBacktracking(
  words: string[],
  wordIndex: number,
  grid: string[],
  usedCells: Set<number>,
  maxAttempts: number,
  startTime: number,
  maxTimeMs: number
): Coordinate[][] | null {
  // Check time limit
  if (Date.now() - startTime > maxTimeMs) {
    return null;
  }

  // Base case: all words placed
  if (wordIndex >= words.length) {
    return [];
  }

  const word = words[wordIndex];

  // Get shuffled starting positions
  const positions: Coordinate[] = [];
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      positions.push({ row, col });
    }
  }
  const shuffledPositions = shuffle(positions);

  let attempts = 0;

  // Try positions until we find one that works or hit max attempts
  for (const pos of shuffledPositions) {
    if (attempts >= maxAttempts) break;

    // Check time limit periodically
    if (Date.now() - startTime > maxTimeMs) {
      return null;
    }

    const index = coordToIndex(pos);
    if (usedCells.has(index)) continue;

    // Try to find a path from this position
    const path = tryPlaceFromPosition(word, pos, grid, usedCells);
    if (!path) continue;

    attempts++;

    // Create copies for this attempt
    const gridCopy = [...grid];
    const usedCellsCopy = new Set(usedCells);
    applyPath(word, path, gridCopy, usedCellsCopy);

    // Try to place remaining words
    const remainingPaths = placeWordsWithLimitedBacktracking(
      words,
      wordIndex + 1,
      gridCopy,
      usedCellsCopy,
      maxAttempts,
      startTime,
      maxTimeMs
    );

    if (remainingPaths !== null) {
      // Success! Copy state back
      for (let i = 0; i < grid.length; i++) {
        grid[i] = gridCopy[i];
      }
      usedCells.clear();
      for (const cell of usedCellsCopy) {
        usedCells.add(cell);
      }
      return [path, ...remainingPaths];
    }
    // This placement didn't work, try next position
  }

  return null;
}

// Legacy function kept for compatibility but now unused
/**
 * Single attempt at creating a layout (legacy v1 algorithm)
 * @deprecated Use tryLayoutWithBacktracking instead
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
