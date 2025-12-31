import type { Coordinate } from "@/types/puzzle";

// Game action types for tracking the order of events during gameplay
export type GameActionType = "hint" | "word" | "spangram";

export interface GameAction {
  type: GameActionType;
  word?: string; // Only for 'word' and 'spangram' actions
}

// Emoji constants for game actions
export const ACTION_EMOJIS = {
  hint: "💡",
  word: "🟦",
  spangram: "🟨",
} as const;

export interface FoundWord {
  word: string;
  path: Coordinate[];
  type: "theme" | "spangram";
  emoji: string; // The emoji assigned when this word was found
}

export interface HintState {
  enabled: boolean;
  nonThemeWordsFound: string[];
  allTimeUsedWords: string[];
  hintsUsed: number;
  currentHintPath: Coordinate[] | null;
}

export type CellState =
  | "default"
  | "selected"
  | "hint"
  | "found-theme"
  | "found-spangram";
