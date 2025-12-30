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

export default function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [puzzle, setPuzzle] = useState<PuzzlePublic | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Game state
    const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
    const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [gameWon, setGameWon] = useState(false);

    useEffect(() => {
        fetchPuzzle();
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

    const handlePointerDown = (row: number, col: number) => {
        setIsSelecting(true);
        setCurrentPath([{ row, col }]);
    };

    const handlePointerEnter = (row: number, col: number) => {
        if (!isSelecting || !puzzle) return;

        const newCoord = { row, col };
        const lastCoord = currentPath[currentPath.length - 1];

        // Check if adjacent
        const rowDiff = Math.abs(newCoord.row - lastCoord.row);
        const colDiff = Math.abs(newCoord.col - lastCoord.col);
        const isAdjacent = rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0);

        if (!isAdjacent) return;

        // Check if already in path
        const alreadyInPath = currentPath.some(c => c.row === row && c.col === col);
        if (alreadyInPath) return;

        setCurrentPath([...currentPath, newCoord]);
    };

    const handlePointerUp = () => {
        if (!isSelecting || !puzzle) return;

        setIsSelecting(false);

        // Check if the selected path matches any word
        const selectedWord = currentPath.map(coord => getLetterAt(puzzle.gridLetters, coord)).join('');

        // Check spangram
        if (selectedWord === puzzle.spangramWord && pathsMatch(currentPath, puzzle.spangramPath)) {
            const alreadyFound = foundWords.some(w => w.type === 'spangram');
            if (!alreadyFound) {
                const newFoundWords = [...foundWords, { word: selectedWord, path: currentPath, type: 'spangram' as const }];
                setFoundWords(newFoundWords);
                checkWinCondition(newFoundWords);
            }
        }

        // Check theme words
        for (const themeWord of puzzle.themeWords) {
            if (selectedWord === themeWord.word && pathsMatch(currentPath, themeWord.path)) {
                const alreadyFound = foundWords.some(w => w.word === themeWord.word);
                if (!alreadyFound) {
                    const newFoundWords = [...foundWords, { word: selectedWord, path: currentPath, type: 'theme' as const }];
                    setFoundWords(newFoundWords);
                    checkWinCondition(newFoundWords);
                }
            }
        }

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

    const getCellState = (row: number, col: number): string => {
        // Check if in current selection
        const inCurrentPath = currentPath.some(c => c.row === row && c.col === col);
        if (inCurrentPath) return 'selected';

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
                    <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">{puzzle.title}</h1>
                    <p className="text-gray-400">by {puzzle.author}</p>
                    <p className="text-lg text-gray-300 mt-2">Theme: {puzzle.themeClue}</p>
                </div>

                {/* Grid */}
                <div className="mb-8 flex justify-center">
                    <div
                        className="inline-grid gap-1 bg-gray-800 p-4 rounded-lg"
                        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
                        onPointerUp={handlePointerUp}
                        onPointerLeave={handlePointerUp}
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
                                    onPointerDown={() => handlePointerDown(row, col)}
                                    onPointerEnter={() => handlePointerEnter(row, col)}
                                >
                                    {letter}
                                </div>
                            );
                        })}
                    </div>
                </div>

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

                {/* Win Modal */}
                {gameWon && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center space-y-6">
                            <div className="text-6xl">🎉</div>
                            <h2 className="text-3xl font-bold">Congratulations!</h2>
                            <p className="text-xl text-gray-300">You solved "{puzzle.title}"!</p>
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
