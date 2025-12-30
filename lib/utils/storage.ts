// LocalStorage helpers for persisting puzzle state

// Hint storage
const getHintStorageKey = (puzzleSlug: string) => `diystrands-hints-${puzzleSlug}`;
const getHintEnabledKey = () => `diystrands-hints-enabled`;

// Like/Play/Complete storage
const getLikeStorageKey = (puzzleSlug: string) => `diystrands-liked-${puzzleSlug}`;
const getPlayedStorageKey = (puzzleSlug: string) => `diystrands-played-${puzzleSlug}`;
const getCompletedStorageKey = (puzzleSlug: string) => `diystrands-completed-${puzzleSlug}`;

export const hasLikedPuzzle = (puzzleSlug: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(getLikeStorageKey(puzzleSlug)) === 'true';
    } catch {
        return false;
    }
};

export const setLikedPuzzle = (puzzleSlug: string, liked: boolean): void => {
    try {
        if (liked) {
            localStorage.setItem(getLikeStorageKey(puzzleSlug), 'true');
        } else {
            localStorage.removeItem(getLikeStorageKey(puzzleSlug));
        }
    } catch {
        // Ignore storage errors
    }
};

export const hasPlayedPuzzle = (puzzleSlug: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(getPlayedStorageKey(puzzleSlug)) === 'true';
    } catch {
        return false;
    }
};

export const setPlayedPuzzle = (puzzleSlug: string): void => {
    try {
        localStorage.setItem(getPlayedStorageKey(puzzleSlug), 'true');
    } catch {
        // Ignore storage errors
    }
};

export const hasCompletedPuzzle = (puzzleSlug: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(getCompletedStorageKey(puzzleSlug)) === 'true';
    } catch {
        return false;
    }
};

export const setCompletedPuzzle = (puzzleSlug: string): void => {
    try {
        localStorage.setItem(getCompletedStorageKey(puzzleSlug), 'true');
    } catch {
        // Ignore storage errors
    }
};

export const loadUsedHintWords = (puzzleSlug: string): string[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(getHintStorageKey(puzzleSlug));
        if (stored) {
            const data = JSON.parse(stored);
            return data.usedHintWords || [];
        }
    } catch {
        // Ignore parse errors
    }
    return [];
};

export const saveUsedHintWord = (puzzleSlug: string, word: string, existingWords: string[]): string[] => {
    const newWords = [...existingWords, word];
    try {
        localStorage.setItem(getHintStorageKey(puzzleSlug), JSON.stringify({ usedHintWords: newWords }));
    } catch {
        // Ignore storage errors (quota exceeded, etc.)
    }
    return newWords;
};

export const loadHintEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        const stored = localStorage.getItem(getHintEnabledKey());
        return stored === 'true';
    } catch {
        return false;
    }
};

export const saveHintEnabled = (enabled: boolean): void => {
    try {
        localStorage.setItem(getHintEnabledKey(), enabled.toString());
    } catch {
        // Ignore storage errors
    }
};
