'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import type { PuzzlePublic, Coordinate } from '@/types/puzzle';
import { coordToIndex, getLetterAt, GRID_ROWS, GRID_COLS } from '@/lib/utils/grid';

interface FoundWord {
    word: string;
    path: Coordinate[];
    type: 'theme' | 'spangram';
}

interface HintState {
    enabled: boolean;
    nonThemeWordsFound: string[];       // Current batch (0-3 for progress bar)
    allTimeUsedWords: string[];         // All words ever used for this puzzle (persisted)
    hintsUsed: number;
    currentHintPath: Coordinate[] | null;
}

// LocalStorage helpers for persisting hint words per puzzle
const getHintStorageKey = (puzzleSlug: string) => `diystrands-hints-${puzzleSlug}`;
const getHintEnabledKey = () => `diystrands-hints-enabled`;

const loadUsedHintWords = (puzzleSlug: string): string[] => {
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

const saveUsedHintWord = (puzzleSlug: string, word: string, existingWords: string[]): string[] => {
    const newWords = [...existingWords, word];
    try {
        localStorage.setItem(getHintStorageKey(puzzleSlug), JSON.stringify({ usedHintWords: newWords }));
    } catch {
        // Ignore storage errors (quota exceeded, etc.)
    }
    return newWords;
};

const loadHintEnabled = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        const stored = localStorage.getItem(getHintEnabledKey());
        return stored === 'true';
    } catch {
        return false;
    }
};

const saveHintEnabled = (enabled: boolean): void => {
    try {
        localStorage.setItem(getHintEnabledKey(), enabled.toString());
    } catch {
        // Ignore storage errors
    }
};

export default function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [puzzle, setPuzzle] = useState<PuzzlePublic | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Game state
    const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
    const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
    const [gameWon, setGameWon] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Hint system state
    const [hintState, setHintState] = useState<HintState>({
        enabled: false,
        nonThemeWordsFound: [],
        allTimeUsedWords: [],
        hintsUsed: 0,
        currentHintPath: null,
    });

    // Load puzzle and used hint words from localStorage
    useEffect(() => {
        fetchPuzzle();
        const storedWords = loadUsedHintWords(slug);
        if (storedWords.length > 0) {
            setHintState(prev => ({ ...prev, allTimeUsedWords: storedWords }));
        }
    }, [slug]);

    const fetchPuzzle = async () => {
        try {
            const response = await fetch(`/api/puzzles/${slug}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load puzzle');
            }

            setPuzzle(data.puzzle);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCellClick = (row: number, col: number) => {
        if (!puzzle) return;

        const newCoord = { row, col };

        // If this is the first letter, start a new path
        if (currentPath.length === 0) {
            setCurrentPath([newCoord]);
            return;
        }

        const lastCoord = currentPath[currentPath.length - 1];

        // Check if clicking the same cell - do nothing
        if (lastCoord.row === row && lastCoord.col === col) {
            return;
        }

        // Check if adjacent
        const rowDiff = Math.abs(newCoord.row - lastCoord.row);
        const colDiff = Math.abs(newCoord.col - lastCoord.col);
        const isAdjacent = rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0);

        if (!isAdjacent) {
            // If not adjacent, start a new path from this cell
            setCurrentPath([newCoord]);
            return;
        }

        // Check if already in path
        const alreadyInPath = currentPath.some(c => c.row === row && c.col === col);
        if (alreadyInPath) {
            return;
        }

        // Add to path
        setCurrentPath([...currentPath, newCoord]);
    };

    const handleSubmit = () => {
        if (currentPath.length === 0 || !puzzle) return;

        // Check if the selected path matches any word
        const selectedWord = currentPath.map(coord => getLetterAt(puzzle.gridLetters, coord)).join('');

        // Check if this matches the current hint
        if (hintState.currentHintPath && pathsMatch(currentPath, hintState.currentHintPath)) {
            // Clear the hint after successful match
            setHintState(prev => ({ ...prev, currentHintPath: null }));
        }

        // Check spangram
        if (selectedWord === puzzle.spangramWord && pathsMatch(currentPath, puzzle.spangramPath)) {
            const alreadyFound = foundWords.some(w => w.type === 'spangram');
            if (!alreadyFound) {
                const newFoundWords = [...foundWords, { word: selectedWord, path: currentPath, type: 'spangram' as const }];
                setFoundWords(newFoundWords);
                checkWinCondition(newFoundWords);
                setCurrentPath([]);
                return;
            }
        }

        // Check theme words
        let foundThemeWord = false;
        for (const themeWord of puzzle.themeWords) {
            if (selectedWord === themeWord.word && pathsMatch(currentPath, themeWord.path)) {
                const alreadyFound = foundWords.some(w => w.word === themeWord.word);
                if (!alreadyFound) {
                    const newFoundWords = [...foundWords, { word: selectedWord, path: currentPath, type: 'theme' as const }];
                    setFoundWords(newFoundWords);
                    checkWinCondition(newFoundWords);
                    foundThemeWord = true;
                    break;
                }
            }
        }

        // If hints are enabled and this wasn't a theme word or spangram, check if it's a valid non-theme word
        if (hintState.enabled && !foundThemeWord && selectedWord.length >= 4) {
            // Check if word was EVER used (not just in current batch) - prevents reusing hint words
            if (!hintState.allTimeUsedWords.includes(selectedWord)) {
                // In a real implementation, you'd validate against a dictionary
                // For now, we'll accept any 4+ letter word that's not a theme word
                const isThemeWord = puzzle.themeWords.some(tw => tw.word === selectedWord) || selectedWord === puzzle.spangramWord;

                if (!isThemeWord) {
                    // Save to localStorage and update state with the new word
                    const updatedAllTimeWords = saveUsedHintWord(slug, selectedWord, hintState.allTimeUsedWords);
                    setHintState(prev => ({
                        ...prev,
                        nonThemeWordsFound: [...prev.nonThemeWordsFound, selectedWord],
                        allTimeUsedWords: updatedAllTimeWords
                    }));
                    setFeedback({ message: `"${selectedWord}" added to hint progress!`, type: 'success' });
                    setTimeout(() => setFeedback(null), 2000);
                }
            } else {
                // Word was already used in a previous hint cycle
                setFeedback({ message: `"${selectedWord}" was already used for hints`, type: 'error' });
                setTimeout(() => setFeedback(null), 2000);
            }
        }

        // Reset path
        setCurrentPath([]);
    };

    const handleClear = () => {
        setCurrentPath([]);
    };

    const pathsMatch = (a: Coordinate[], b: Coordinate[]): boolean => {
        if (a.length !== b.length) return false;
        return a.every((coord, i) => coord.row === b[i].row && coord.col === b[i].col);
    };

    const checkWinCondition = (words: FoundWord[]) => {
        if (!puzzle) return;
        const totalWords = 1 + puzzle.themeWords.length; // spangram + theme words
        if (words.length === totalWords) {
            setGameWon(true);
        }
    };

    const toggleHints = () => {
        setHintState(prev => ({
            ...prev,
            enabled: !prev.enabled,
            nonThemeWordsFound: [],
            // Note: allTimeUsedWords is preserved - words already used cannot be reused
            hintsUsed: 0,
            currentHintPath: null,
        }));
    };

    const useHint = () => {
        if (!puzzle || !canUseHint()) return;

        // Find theme words that haven't been found yet (excluding spangram for last)
        const unfoundThemeWords = puzzle.themeWords.filter(
            tw => !foundWords.some(fw => fw.word === tw.word)
        );

        // If all theme words are found, reveal spangram
        if (unfoundThemeWords.length === 0 && !foundWords.some(fw => fw.type === 'spangram')) {
            setHintState(prev => ({
                ...prev,
                currentHintPath: puzzle.spangramPath,
                hintsUsed: prev.hintsUsed + 1,
                nonThemeWordsFound: [],
            }));
        } else if (unfoundThemeWords.length > 0) {
            // Reveal a random unfound theme word
            const randomWord = unfoundThemeWords[Math.floor(Math.random() * unfoundThemeWords.length)];
            setHintState(prev => ({
                ...prev,
                currentHintPath: randomWord.path,
                hintsUsed: prev.hintsUsed + 1,
                nonThemeWordsFound: [],
            }));
        }
    };

    const canUseHint = (): boolean => {
        return hintState.enabled &&
            hintState.nonThemeWordsFound.length >= 3 &&
            hintState.currentHintPath === null;
    };

    const getHintProgress = (): number => {
        if (!hintState.enabled || hintState.currentHintPath !== null) return 0;
        return Math.min(hintState.nonThemeWordsFound.length, 3);
    };

    const getCellState = (row: number, col: number): string => {
        // Check if in current selection
        const inCurrentPath = currentPath.some(c => c.row === row && c.col === col);
        if (inCurrentPath) return 'selected';

        // Check if in hint path
        if (hintState.currentHintPath) {
            const inHintPath = hintState.currentHintPath.some(c => c.row === row && c.col === col);
            if (inHintPath) return 'hint';
        }

        // Check if in found words
        for (const found of foundWords) {
            const inFoundPath = found.path.some(c => c.row === row && c.col === col);
            if (inFoundPath) {
                return found.type === 'spangram' ? 'found-spangram' : 'found-theme';
            }
        }

        return 'default';
    };

    const getCellClassName = (state: string): string => {
        const base = 'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold rounded cursor-pointer transition-all select-none';

        switch (state) {
            case 'selected':
                return `${base} bg-blue-500 text-white scale-105`;
            case 'hint':
                return `${base} bg-gray-700 text-white border-2 border-dashed border-yellow-400`;
            case 'found-spangram':
                return `${base} bg-yellow-600 text-white`;
            case 'found-theme':
                return `${base} bg-blue-700 text-white`;
            default:
                return `${base} bg-gray-700 hover:bg-gray-600 text-white`;
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="text-xl">Loading puzzle...</div>
            </main>
        );
    }

    if (error || !puzzle) {
        return (
            <main className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="text-6xl">😕</div>
                    <h1 className="text-2xl font-bold">Puzzle Not Found</h1>
                    <p className="text-gray-400">{error || 'This puzzle does not exist'}</p>
                    <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Go Home
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300">
                            ← Back to Home
                        </Link>
                        <button
                            onClick={toggleHints}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${hintState.enabled
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                        >
                            {hintState.enabled ? '💡 Hints: ON' : '💡 Hints: OFF'}
                        </button>
                    </div>
                    <h1 className="text-3xl font-bold">{puzzle.title}</h1>
                    <p className="text-gray-400">by {puzzle.author}</p>
                    <p className="text-lg text-gray-300 mt-2">Theme: {puzzle.themeClue}</p>
                </div>

                {/* Main Game Area - Two Column Layout on iPad+ */}
                <div className="flex flex-col md:flex-row md:gap-8 md:items-start">
                    {/* Left Column: Grid and Controls */}
                    <div className="flex-1 mb-8 md:mb-0">
                        {/* Grid */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative inline-block">
                                <div
                                    className="inline-grid gap-1 bg-gray-800 p-4 rounded-lg"
                                    style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
                                >
                                    {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, index) => {
                                        const row = Math.floor(index / GRID_COLS);
                                        const col = index % GRID_COLS;
                                        const letter = puzzle.gridLetters[index];
                                        const state = getCellState(row, col);

                                        return (
                                            <div
                                                key={index}
                                                className={getCellClassName(state)}
                                                onClick={() => handleCellClick(row, col)}
                                            >
                                                {letter}
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* SVG overlay for connecting lines and circles */}
                                <svg
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                    style={{ overflow: 'visible' }}
                                >
                                    {foundWords.map((found, wordIndex) => {
                                        const elements = [];
                                        const cellSize = 56; // 14 * 4 (3.5rem = 56px on desktop)
                                        const gap = 4; // gap-1 = 4px
                                        const padding = 16; // p-4 = 16px
                                        const color = found.type === 'spangram' ? '#fbbf24' : '#93c5fd';

                                        // Draw lines between letters
                                        for (let i = 0; i < found.path.length - 1; i++) {
                                            const from = found.path[i];
                                            const to = found.path[i + 1];

                                            const fromX = padding + from.col * (cellSize + gap) + cellSize / 2;
                                            const fromY = padding + from.row * (cellSize + gap) + cellSize / 2;
                                            const toX = padding + to.col * (cellSize + gap) + cellSize / 2;
                                            const toY = padding + to.row * (cellSize + gap) + cellSize / 2;

                                            elements.push(
                                                <line
                                                    key={`line-${wordIndex}-${i}`}
                                                    x1={fromX}
                                                    y1={fromY}
                                                    x2={toX}
                                                    y2={toY}
                                                    stroke={color}
                                                    strokeWidth="2.5"
                                                    strokeOpacity="0.5"
                                                    strokeLinecap="round"
                                                />
                                            );
                                        }

                                        // Draw small circles at each letter position
                                        for (let i = 0; i < found.path.length; i++) {
                                            const coord = found.path[i];
                                            const x = padding + coord.col * (cellSize + gap) + cellSize / 2;
                                            const y = padding + coord.row * (cellSize + gap) + cellSize / 2;

                                            elements.push(
                                                <circle
                                                    key={`circle-${wordIndex}-${i}`}
                                                    cx={x}
                                                    cy={y}
                                                    r="4"
                                                    fill={color}
                                                    opacity="0.6"
                                                />
                                            );
                                        }

                                        return elements;
                                    })}
                                </svg>
                            </div>
                        </div>

                        {/* Current Word Display and Controls */}
                        {currentPath.length > 0 && (
                            <div className="flex justify-center">
                                <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                                    <div className="text-2xl font-bold">
                                        {currentPath.map(coord => getLetterAt(puzzle.gridLetters, coord)).join('')}
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                                    >
                                        Submit
                                    </button>
                                    <button
                                        onClick={handleClear}
                                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Found Words and Hints */}
                    <div className="md:w-80 md:flex-shrink-0 space-y-4">
                        {/* Hint System */}
                        {hintState.enabled && (
                            <div className="bg-gray-800 rounded-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Hints</h2>

                                {/* Hint Progress Bar */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                                        <span>Progress</span>
                                        <span>{getHintProgress()}/3</span>
                                    </div>
                                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-500 transition-all duration-300"
                                            style={{ width: `${(getHintProgress() / 3) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Find non-theme words (4+ letters) to earn hints
                                    </p>
                                </div>

                                {/* Hint Button */}
                                <button
                                    onClick={useHint}
                                    disabled={!canUseHint()}
                                    className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${canUseHint()
                                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer'
                                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {hintState.currentHintPath ? 'Hint Active' : 'Use Hint'}
                                </button>

                                {/* Non-theme words found */}
                                {hintState.nonThemeWordsFound.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-sm text-gray-400 mb-2">Non-theme words:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {hintState.nonThemeWordsFound.map((word, i) => (
                                                <span key={i} className="text-xs bg-gray-700 px-2 py-1 rounded">
                                                    {word}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Found Words */}
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Found Words ({foundWords.length}/{1 + puzzle.themeWords.length})</h2>
                            <div className="space-y-2">
                                {foundWords.map((found, i) => (
                                    <div key={i} className={`px-4 py-2 rounded ${found.type === 'spangram' ? 'bg-yellow-600' : 'bg-blue-700'}`}>
                                        {found.type === 'spangram' ? '🟡' : '🔵'} {found.word}
                                    </div>
                                ))}
                                {Array.from({ length: (1 + puzzle.themeWords.length) - foundWords.length }).map((_, i) => (
                                    <div key={`empty-${i}`} className="px-4 py-2 rounded bg-gray-700 text-gray-500">
                                        __ __ __
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Toast */}
                {feedback && (
                    <div className="fixed top-4 right-4 z-50 animate-fade-in">
                        <div className={`px-6 py-3 rounded-lg shadow-lg ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                            } text-white font-semibold`}>
                            {feedback.message}
                        </div>
                    </div>
                )}

                {/* Win Modal */}
                {gameWon && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
                            <div className="text-6xl">🎉</div>
                            <h2 className="text-3xl font-bold">
                                {hintState.enabled && hintState.hintsUsed === 0 ? 'Perfect!' : 'Congratulations!'}
                            </h2>
                            <p className="text-xl text-gray-300">You solved "{puzzle.title}"!</p>
                            {hintState.enabled && (
                                <p className="text-gray-400">
                                    {hintState.hintsUsed === 0
                                        ? '🌟 Solved without hints!'
                                        : `Used ${hintState.hintsUsed} hint${hintState.hintsUsed > 1 ? 's' : ''}`
                                    }
                                </p>
                            )}
                            <div className="space-y-3">
                                <Link
                                    href="/"
                                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Back to Home
                                </Link>
                                <Link
                                    href="/create"
                                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    Create Your Own Puzzle
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
