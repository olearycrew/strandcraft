// lib/utils/my-puzzles.ts
// Utility for managing user's created puzzles in localStorage

const MY_PUZZLES_KEY = "diystrands_my_puzzles";

export interface MyPuzzle {
  slug: string;
  title: string;
  author: string;
  createdAt: string; // ISO string
}

/**
 * Get all puzzles created by the user from localStorage
 */
export function getMyPuzzles(): MyPuzzle[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(MY_PUZZLES_KEY);
    if (!stored) return [];

    const puzzles = JSON.parse(stored) as MyPuzzle[];
    return puzzles;
  } catch (error) {
    console.error("Error reading my puzzles from localStorage:", error);
    return [];
  }
}

/**
 * Add a new puzzle to the user's collection
 */
export function addMyPuzzle(puzzle: MyPuzzle): void {
  if (typeof window === "undefined") return;

  try {
    const puzzles = getMyPuzzles();

    // Check if puzzle already exists (by slug)
    const exists = puzzles.some((p) => p.slug === puzzle.slug);
    if (exists) {
      console.log("Puzzle already in my puzzles");
      return;
    }

    // Add new puzzle to the beginning of the array
    puzzles.unshift(puzzle);

    localStorage.setItem(MY_PUZZLES_KEY, JSON.stringify(puzzles));
  } catch (error) {
    console.error("Error saving puzzle to localStorage:", error);
  }
}

/**
 * Remove a puzzle from the user's collection
 */
export function removeMyPuzzle(slug: string): void {
  if (typeof window === "undefined") return;

  try {
    const puzzles = getMyPuzzles();
    const filtered = puzzles.filter((p) => p.slug !== slug);

    localStorage.setItem(MY_PUZZLES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error removing puzzle from localStorage:", error);
  }
}

/**
 * Clear all puzzles from the user's collection
 */
export function clearMyPuzzles(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(MY_PUZZLES_KEY);
  } catch (error) {
    console.error("Error clearing my puzzles from localStorage:", error);
  }
}
