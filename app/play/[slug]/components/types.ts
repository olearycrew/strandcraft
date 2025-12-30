import type { Coordinate } from '@/types/puzzle';

export interface FoundWord {
    word: string;
    path: Coordinate[];
    type: 'theme' | 'spangram';
}

export interface HintState {
    enabled: boolean;
    nonThemeWordsFound: string[];
    allTimeUsedWords: string[];
    hintsUsed: number;
    currentHintPath: Coordinate[] | null;
}

export type CellState = 'default' | 'selected' | 'hint' | 'found-theme' | 'found-spangram';
