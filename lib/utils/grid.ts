// lib/utils/grid.ts
import type { Coordinate } from "@/types/puzzle";

export const GRID_ROWS = 8;
export const GRID_COLS = 6;
export const GRID_SIZE = GRID_ROWS * GRID_COLS; // 48

/**
 * Convert grid index to row/col coordinates
 */
export function indexToCoord(index: number): Coordinate {
  return {
    row: Math.floor(index / GRID_COLS),
    col: index % GRID_COLS,
  };
}

/**
 * Convert row/col coordinates to grid index
 */
export function coordToIndex(coord: Coordinate): number {
  return coord.row * GRID_COLS + coord.col;
}

/**
 * Check if two coordinates are adjacent (horizontally, vertically, or diagonally)
 */
export function areAdjacent(a: Coordinate, b: Coordinate): boolean {
  const rowDiff = Math.abs(a.row - b.row);
  const colDiff = Math.abs(a.col - b.col);
  return rowDiff <= 1 && colDiff <= 1 && rowDiff + colDiff > 0;
}

/**
 * Check if a coordinate is valid (within grid bounds)
 */
export function isValidCoord(coord: Coordinate): boolean {
  return (
    coord.row >= 0 &&
    coord.row < GRID_ROWS &&
    coord.col >= 0 &&
    coord.col < GRID_COLS
  );
}

/**
 * Get the letter at a specific coordinate from the grid string
 */
export function getLetterAt(gridLetters: string, coord: Coordinate): string {
  const index = coordToIndex(coord);
  return gridLetters[index] || "";
}

/**
 * Get the word formed by a path
 */
export function getWordFromPath(
  gridLetters: string,
  path: Coordinate[]
): string {
  return path.map((coord) => getLetterAt(gridLetters, coord)).join("");
}

/**
 * Check if a path is valid (all coordinates valid and adjacent)
 */
export function isValidPath(path: Coordinate[]): boolean {
  if (path.length < 2) return false;

  for (let i = 0; i < path.length; i++) {
    if (!isValidCoord(path[i])) return false;
    if (i > 0 && !areAdjacent(path[i - 1], path[i])) return false;
  }

  return true;
}

/**
 * Check if a path spans opposite edges (for spangram validation)
 */
export function spansOppositeEdges(path: Coordinate[]): boolean {
  if (path.length === 0) return false;

  const touchesTop = path.some((c) => c.row === 0);
  const touchesBottom = path.some((c) => c.row === GRID_ROWS - 1);
  const touchesLeft = path.some((c) => c.col === 0);
  const touchesRight = path.some((c) => c.col === GRID_COLS - 1);

  return (touchesTop && touchesBottom) || (touchesLeft && touchesRight);
}

/**
 * Check if all cells in the grid are used exactly once
 */
export function allCellsUsedOnce(paths: Coordinate[][]): boolean {
  const usedCells = new Set<number>();

  for (const path of paths) {
    for (const coord of path) {
      const index = coordToIndex(coord);
      if (usedCells.has(index)) return false; // Cell used more than once
      usedCells.add(index);
    }
  }

  return usedCells.size === GRID_SIZE; // All 48 cells used
}
