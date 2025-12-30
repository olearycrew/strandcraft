// types/puzzle.ts

export interface Coordinate {
  row: number; // 0-7
  col: number; // 0-5
}

export interface ThemeWord {
  word: string;
  path: Coordinate[];
}

export interface Puzzle {
  id: number;
  slug: string;
  title: string;
  author: string;
  themeClue: string;
  gridLetters: string; // 48 chars, row-major
  spangramWord: string;
  spangramPath: Coordinate[];
  themeWords: ThemeWord[];
  createdAt: Date;
  // Stats tracking
  playCount: number;
  completionCount: number;
  likeCount: number;
}

// For API responses (without internal id)
export interface PuzzlePublic {
  slug: string;
  title: string;
  author: string;
  themeClue: string;
  gridLetters: string;
  spangramWord: string;
  spangramPath: Coordinate[];
  themeWords: ThemeWord[];
  // Stats (read-only for clients)
  playCount: number;
  completionCount: number;
  likeCount: number;
}

// For puzzle creation
export interface CreatePuzzleInput {
  title: string;
  author: string;
  themeClue: string;
  gridLetters: string;
  spangramWord: string;
  spangramPath: Coordinate[];
  themeWords: ThemeWord[];
}

// API Response types
export interface CreatePuzzleResponse {
  success: true;
  slug: string;
  url: string;
}

export interface GetPuzzleResponse {
  success: true;
  puzzle: PuzzlePublic;
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string[];
}
