'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Coordinate, ThemeWord, CreatePuzzleInput } from '@/types/puzzle';
import { GRID_ROWS, GRID_COLS, coordToIndex, areAdjacent } from '@/lib/utils/grid';
import { autoLayout } from '@/lib/utils/auto-layout';

type Step = 'metadata' | 'words' | 'layout-mode' | 'grid' | 'publish';
type LayoutMode = 'auto' | 'manual';

export default function CreatePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('metadata');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [themeClue, setThemeClue] = useState('');
    const [spangramWord, setSpangramWord] = useState('');
    const [themeWords, setThemeWords] = useState<string[]>(['']);

    // Layout mode
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('auto');

    // Grid state
    const [gridLetters, setGridLetters] = useState('');
    const [spangramPath, setSpangramPath] = useState<Coordinate[]>([]);
    const [themeWordPaths, setThemeWordPaths] = useState<Coordinate[][]>([]);
    const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

    // Manual layout state
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(0); // 0 = spangram, 1+ = theme words
    const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleAddThemeWord = () => {
        setThemeWords([...themeWords, '']);
    };

    const handleRemoveThemeWord = (index: number) => {
        setThemeWords(themeWords.filter((_, i) => i !== index));
    };

    const handleThemeWordChange = (index: number, value: string) => {
        const newWords = [...themeWords];
        newWords[index] = value.toUpperCase();
        setThemeWords(newWords);
    };

    // Calculate total letter count
    const getTotalLetters = () => {
        const spangram = spangramWord.length;
        const themes = themeWords.filter(w => w.trim()).reduce((sum, w) => sum + w.length, 0);
        return spangram + themes;
    };

    const getLetterCountStatus = () => {
        const total = getTotalLetters();
        if (total === 0) return { text: 'Enter words to see letter count', color: 'text-gray-400' };
        if (total < 48) return { text: `Need ${48 - total} more letters`, color: 'text-yellow-400' };
        if (total > 48) return { text: `${total - 48} too many letters`, color: 'text-red-400' };
        return { text: 'Perfect! 48 letters', color: 'text-green-400' };
    };

    const handleAutoLayout = () => {
        setError(null);
        const validThemeWords = themeWords.filter(w => w.trim());

        const result = autoLayout(spangramWord, validThemeWords);

        if (!result.success) {
            setError(result.error || 'Auto-layout failed');
            return;
        }

        setGridLetters(result.gridLetters!);
        setSpangramPath(result.spangramPath!);
        setThemeWordPaths(result.themeWordPaths!);
    };

    const handleGridLetterChange = (index: number, letter: string) => {
        const newGrid = gridLetters.split('');
        newGrid[index] = letter.toUpperCase() || ' ';
        setGridLetters(newGrid.join(''));
    };

    // Manual layout handlers
    const handleCellClick = (row: number, col: number) => {
        if (layoutMode !== 'manual' || !isDrawing) return;

        const coord: Coordinate = { row, col };
        const index = coordToIndex(coord);

        // Check if this cell is already in the current path
        const existingIndex = currentPath.findIndex(c => coordToIndex(c) === index);
        if (existingIndex !== -1) {
            // If clicking the last cell, do nothing (already there)
            if (existingIndex === currentPath.length - 1) return;
            // If clicking an earlier cell, truncate path to that point
            setCurrentPath(currentPath.slice(0, existingIndex + 1));
            return;
        }

        // If this is the first cell, just add it
        if (currentPath.length === 0) {
            setCurrentPath([coord]);
            return;
        }

        // Check if adjacent to last cell
        const lastCell = currentPath[currentPath.length - 1];
        if (!areAdjacent(lastCell, coord)) {
            setError('Cells must be adjacent (including diagonally)');
            return;
        }

        // Check if cell is already used by another word
        const allUsedCells = new Set<number>();
        if (currentWordIndex === 0) {
            // Drawing spangram - check theme words
            themeWordPaths.forEach(path => {
                path.forEach(c => allUsedCells.add(coordToIndex(c)));
            });
        } else {
            // Drawing theme word - check spangram and other theme words
            spangramPath.forEach(c => allUsedCells.add(coordToIndex(c)));
            themeWordPaths.forEach((path, i) => {
                if (i !== currentWordIndex - 1) {
                    path.forEach(c => allUsedCells.add(coordToIndex(c)));
                }
            });
        }

        if (allUsedCells.has(index)) {
            setError('Cell is already used by another word');
            return;
        }

        setError(null);
        setCurrentPath([...currentPath, coord]);
    };

    const startDrawingWord = (wordIndex: number) => {
        setCurrentWordIndex(wordIndex);
        setCurrentPath([]);
        setIsDrawing(true);
        setError(null);
    };

    const finishDrawingWord = () => {
        const targetWord = currentWordIndex === 0 ? spangramWord : themeWords[currentWordIndex - 1];

        if (currentPath.length !== targetWord.length) {
            setError(`Path must be exactly ${targetWord.length} cells for "${targetWord}"`);
            return;
        }

        // For spangram, check if it spans opposite edges
        if (currentWordIndex === 0) {
            const hasTop = currentPath.some(c => c.row === 0);
            const hasBottom = currentPath.some(c => c.row === GRID_ROWS - 1);
            const hasLeft = currentPath.some(c => c.col === 0);
            const hasRight = currentPath.some(c => c.col === GRID_COLS - 1);

            const spansVertically = hasTop && hasBottom;
            const spansHorizontally = hasLeft && hasRight;

            if (!spansVertically && !spansHorizontally) {
                setError('Spangram must span from one edge to the opposite edge');
                return;
            }

            setSpangramPath(currentPath);

            // Update grid with spangram letters
            const newGrid = gridLetters ? gridLetters.split('') : new Array(48).fill('');
            currentPath.forEach((coord, i) => {
                const index = coordToIndex(coord);
                newGrid[index] = spangramWord[i];
            });
            setGridLetters(newGrid.join(''));
        } else {
            // Theme word
            const newPaths = [...themeWordPaths];
            newPaths[currentWordIndex - 1] = currentPath;
            setThemeWordPaths(newPaths);

            // Update grid with theme word letters
            const newGrid = gridLetters.split('');
            currentPath.forEach((coord, i) => {
                const index = coordToIndex(coord);
                newGrid[index] = targetWord[i];
            });
            setGridLetters(newGrid.join(''));
        }

        setIsDrawing(false);
        setCurrentPath([]);
        setError(null);
    };

    const cancelDrawing = () => {
        setIsDrawing(false);
        setCurrentPath([]);
        setError(null);
    };

    const clearWord = (wordIndex: number) => {
        if (wordIndex === 0) {
            // Clear spangram
            const newGrid = gridLetters.split('');
            spangramPath.forEach(coord => {
                const index = coordToIndex(coord);
                newGrid[index] = '';
            });
            setGridLetters(newGrid.join(''));
            setSpangramPath([]);
        } else {
            // Clear theme word
            const newGrid = gridLetters.split('');
            const pathToClear = themeWordPaths[wordIndex - 1];
            if (pathToClear) {
                pathToClear.forEach(coord => {
                    const index = coordToIndex(coord);
                    newGrid[index] = '';
                });
                setGridLetters(newGrid.join(''));
            }
            const newPaths = [...themeWordPaths];
            newPaths[wordIndex - 1] = [];
            setThemeWordPaths(newPaths);
        }
    };

    // Color palette for different words
    const wordColors = [
        'bg-yellow-600 border-yellow-500',    // Spangram
        'bg-blue-600 border-blue-500',        // Theme word 1
        'bg-purple-600 border-purple-500',    // Theme word 2
        'bg-pink-600 border-pink-500',        // Theme word 3
        'bg-green-600 border-green-500',      // Theme word 4
        'bg-orange-600 border-orange-500',    // Theme word 5
        'bg-cyan-600 border-cyan-500',        // Theme word 6
        'bg-red-600 border-red-500',          // Theme word 7
        'bg-indigo-600 border-indigo-500',    // Theme word 8
    ];

    const getCellHighlight = (row: number, col: number): string => {
        const index = coordToIndex({ row, col });

        // Check if in spangram path
        if (spangramPath.some(c => coordToIndex(c) === index)) {
            return wordColors[0]; // Yellow for spangram
        }

        // Check if in any theme word path (each gets unique color)
        for (let i = 0; i < themeWordPaths.length; i++) {
            if (themeWordPaths[i].some(c => coordToIndex(c) === index)) {
                return wordColors[(i + 1) % wordColors.length];
            }
        }

        return 'bg-gray-700 border-gray-600';
    };

    const getWordColor = (wordIndex: number): string => {
        const colorMap = [
            'text-yellow-400',    // Spangram
            'text-blue-400',      // Theme word 1
            'text-purple-400',    // Theme word 2
            'text-pink-400',      // Theme word 3
            'text-green-400',     // Theme word 4
            'text-orange-400',    // Theme word 5
            'text-cyan-400',      // Theme word 6
            'text-red-400',       // Theme word 7
            'text-indigo-400',    // Theme word 8
        ];
        return colorMap[wordIndex % colorMap.length];
    };

    const handlePublish = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!gridLetters || gridLetters.length !== 48) {
                throw new Error('Grid must be complete (48 letters)');
            }

            if (!spangramPath || spangramPath.length === 0) {
                throw new Error('Spangram path is missing. Use Auto-Layout first.');
            }

            const validThemeWords = themeWords.filter(w => w.trim());
            if (themeWordPaths.length !== validThemeWords.length) {
                throw new Error('Theme word paths are missing. Use Auto-Layout first.');
            }

            const themeWordsData: ThemeWord[] = validThemeWords.map((word, i) => ({
                word,
                path: themeWordPaths[i],
            }));

            const puzzleData: CreatePuzzleInput = {
                title,
                author,
                themeClue,
                gridLetters,
                spangramWord,
                spangramPath,
                themeWords: themeWordsData,
            };

            const response = await fetch('/api/puzzles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(puzzleData),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMsg = data.details ? data.details.join(', ') : data.error;
                throw new Error(errorMsg || 'Failed to create puzzle');
            }

            setPublishedSlug(data.slug);
            setStep('publish');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        if (publishedSlug) {
            const url = `${window.location.origin}/play/${publishedSlug}`;
            navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
        }
    };

    const letterCountStatus = getLetterCountStatus();

    return (
        <main className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto py-8">
                <Link href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6">
                    ← Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-8">Create a Puzzle</h1>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {/* Step 1: Metadata */}
                {step === 'metadata' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Puzzle Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g., Beach Day"
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Author Name</label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="Your name"
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Theme Clue</label>
                            <input
                                type="text"
                                value={themeClue}
                                onChange={(e) => setThemeClue(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g., Hitting the sandy shores"
                                maxLength={200}
                            />
                        </div>

                        <button
                            onClick={() => setStep('words')}
                            disabled={!title || !author || !themeClue}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* Step 2: Words */}
                {step === 'words' && (
                    <div className="space-y-6">
                        <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold">Letter Count</h3>
                                <span className={`text-lg font-bold ${letterCountStatus.color}`}>
                                    {getTotalLetters()} / 48
                                </span>
                            </div>
                            <p className={`text-sm ${letterCountStatus.color}`}>
                                {letterCountStatus.text}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Spangram (theme word that spans the grid)
                            </label>
                            <input
                                type="text"
                                value={spangramWord}
                                onChange={(e) => setSpangramWord(e.target.value.toUpperCase())}
                                className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                                placeholder="e.g., BEACHGOING"
                                maxLength={20}
                            />
                            <p className="text-sm text-gray-400 mt-1">
                                {spangramWord.length} letters
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Theme Words</label>
                            {themeWords.map((word, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={word}
                                        onChange={(e) => handleThemeWordChange(index, e.target.value)}
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                                        placeholder={`Theme word ${index + 1}`}
                                    />
                                    <span className="flex items-center text-sm text-gray-400 min-w-[60px]">
                                        {word.length} letters
                                    </span>
                                    {themeWords.length > 1 && (
                                        <button
                                            onClick={() => handleRemoveThemeWord(index)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                onClick={handleAddThemeWord}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mt-2"
                            >
                                + Add Theme Word
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('metadata')}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={() => setStep('layout-mode')}
                                disabled={getTotalLetters() !== 48 || !spangramWord || themeWords.filter(w => w.trim()).length === 0}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Layout Mode Selection */}
                {step === 'layout-mode' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold mb-4">Choose Layout Method</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Auto Layout Option */}
                            <button
                                onClick={() => {
                                    setLayoutMode('auto');
                                    setStep('grid');
                                }}
                                className={`p-6 rounded-lg border-2 transition-all text-left ${layoutMode === 'auto'
                                    ? 'border-blue-500 bg-blue-900/30'
                                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                    }`}
                            >
                                <div className="text-4xl mb-3">🎲</div>
                                <h3 className="text-xl font-bold mb-2">Auto Layout</h3>
                                <p className="text-gray-300 text-sm mb-3">
                                    Let the algorithm automatically arrange your words in the grid.
                                    Quick and easy - just click a button!
                                </p>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>✓ Fast and automatic</li>
                                    <li>✓ Can shuffle for different layouts</li>
                                    <li>✓ Ensures valid word placement</li>
                                    <li>✓ Can manually adjust after</li>
                                </ul>
                            </button>

                            {/* Manual Layout Option */}
                            <button
                                onClick={() => {
                                    setLayoutMode('manual');
                                    setStep('grid');
                                }}
                                className={`p-6 rounded-lg border-2 transition-all text-left ${layoutMode === 'manual'
                                    ? 'border-purple-500 bg-purple-900/30'
                                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                    }`}
                            >
                                <div className="text-4xl mb-3">✏️</div>
                                <h3 className="text-xl font-bold mb-2">Manual Layout</h3>
                                <p className="text-gray-300 text-sm mb-3">
                                    Draw your own paths by clicking cells in the grid.
                                    Full creative control over word placement!
                                </p>
                                <ul className="text-sm text-gray-400 space-y-1">
                                    <li>✓ Complete control</li>
                                    <li>✓ Create custom patterns</li>
                                    <li>✓ Draw paths cell by cell</li>
                                    <li>✓ Perfect for specific designs</li>
                                </ul>
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('words')}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Grid */}
                {step === 'grid' && (
                    <div className="space-y-6">
                        {/* Auto Layout Mode */}
                        {layoutMode === 'auto' && (
                            <>
                                <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                                    <h3 className="font-bold mb-2">💡 Auto Layout Mode</h3>
                                    <p className="text-sm text-gray-300">
                                        Click "Auto-Layout" to automatically arrange your words in the grid.
                                        Don't like the layout? Click again to shuffle and get a different arrangement!
                                        You can also manually adjust letters after auto-layout.
                                    </p>
                                </div>

                                <button
                                    onClick={handleAutoLayout}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                >
                                    🎲 {gridLetters ? 'Shuffle Layout' : 'Auto-Layout'}
                                </button>
                            </>
                        )}

                        {/* Manual Layout Mode */}
                        {layoutMode === 'manual' && (
                            <>
                                <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4">
                                    <h3 className="font-bold mb-2">✏️ Manual Layout Mode</h3>
                                    <p className="text-sm text-gray-300 mb-3">
                                        Draw paths for each word by clicking cells in the grid.
                                        Cells must be adjacent (including diagonally).
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Tip: Click on an earlier cell in your path to backtrack.
                                    </p>
                                </div>

                                {/* Word Drawing Controls */}
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <h3 className="font-bold mb-3">Draw Word Paths</h3>
                                    <div className="space-y-2">
                                        {/* Spangram */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <span className={`font-bold ${getWordColor(0)}`}>
                                                    Spangram: {spangramWord}
                                                </span>
                                                <span className="text-sm text-gray-400 ml-2">
                                                    ({spangramWord.length} cells)
                                                </span>
                                            </div>
                                            {spangramPath.length > 0 ? (
                                                <div className="flex gap-2">
                                                    <span className="text-green-400 text-sm">✓ Complete</span>
                                                    <button
                                                        onClick={() => clearWord(0)}
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        Clear
                                                    </button>
                                                </div>
                                            ) : isDrawing && currentWordIndex === 0 ? (
                                                <div className="flex gap-2">
                                                    <span className="text-blue-400 text-sm">
                                                        Drawing... ({currentPath.length}/{spangramWord.length})
                                                    </span>
                                                    <button
                                                        onClick={finishDrawingWord}
                                                        disabled={currentPath.length !== spangramWord.length}
                                                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                                                    >
                                                        Finish
                                                    </button>
                                                    <button
                                                        onClick={cancelDrawing}
                                                        className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startDrawingWord(0)}
                                                    disabled={isDrawing}
                                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-4 py-1 rounded"
                                                >
                                                    Draw
                                                </button>
                                            )}
                                        </div>

                                        {/* Theme Words */}
                                        {themeWords.filter(w => w.trim()).map((word, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <span className={`font-bold ${getWordColor(i + 1)}`}>
                                                        Word {i + 1}: {word}
                                                    </span>
                                                    <span className="text-sm text-gray-400 ml-2">
                                                        ({word.length} cells)
                                                    </span>
                                                </div>
                                                {themeWordPaths[i] && themeWordPaths[i].length > 0 ? (
                                                    <div className="flex gap-2">
                                                        <span className="text-green-400 text-sm">✓ Complete</span>
                                                        <button
                                                            onClick={() => clearWord(i + 1)}
                                                            className="text-red-400 hover:text-red-300 text-sm"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                ) : isDrawing && currentWordIndex === i + 1 ? (
                                                    <div className="flex gap-2">
                                                        <span className="text-blue-400 text-sm">
                                                            Drawing... ({currentPath.length}/{word.length})
                                                        </span>
                                                        <button
                                                            onClick={finishDrawingWord}
                                                            disabled={currentPath.length !== word.length}
                                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                                                        >
                                                            Finish
                                                        </button>
                                                        <button
                                                            onClick={cancelDrawing}
                                                            className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startDrawingWord(i + 1)}
                                                        disabled={isDrawing}
                                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-4 py-1 rounded"
                                                    >
                                                        Draw
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {gridLetters && (
                            <>
                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <h3 className="font-bold mb-3">Preview (colors show word placement)</h3>
                                    <div className="inline-block relative">
                                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
                                            {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, index) => {
                                                const row = Math.floor(index / GRID_COLS);
                                                const col = index % GRID_COLS;
                                                const highlight = getCellHighlight(row, col);

                                                return (
                                                    <input
                                                        key={index}
                                                        type="text"
                                                        maxLength={1}
                                                        value={gridLetters[index] || ''}
                                                        onChange={(e) => handleGridLetterChange(index, e.target.value)}
                                                        className={`w-12 h-12 ${highlight} border-2 rounded text-center text-xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-white`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        {/* SVG overlay for connecting lines and circles */}
                                        <svg
                                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                            style={{ overflow: 'visible' }}
                                        >
                                            {/* Draw spangram path */}
                                            {spangramPath.length > 0 && (() => {
                                                const elements = [];
                                                const cellSize = 48; // w-12 = 48px
                                                const gap = 4; // gap-1 = 4px
                                                const color = '#fbbf24';

                                                // Draw lines
                                                for (let i = 0; i < spangramPath.length - 1; i++) {
                                                    const from = spangramPath[i];
                                                    const to = spangramPath[i + 1];

                                                    const fromX = from.col * (cellSize + gap) + cellSize / 2;
                                                    const fromY = from.row * (cellSize + gap) + cellSize / 2;
                                                    const toX = to.col * (cellSize + gap) + cellSize / 2;
                                                    const toY = to.row * (cellSize + gap) + cellSize / 2;

                                                    elements.push(
                                                        <line
                                                            key={`spangram-line-${i}`}
                                                            x1={fromX}
                                                            y1={fromY}
                                                            x2={toX}
                                                            y2={toY}
                                                            stroke={color}
                                                            strokeWidth="2"
                                                            strokeOpacity="0.5"
                                                            strokeLinecap="round"
                                                        />
                                                    );
                                                }

                                                // Draw small circles
                                                for (let i = 0; i < spangramPath.length; i++) {
                                                    const coord = spangramPath[i];
                                                    const x = coord.col * (cellSize + gap) + cellSize / 2;
                                                    const y = coord.row * (cellSize + gap) + cellSize / 2;

                                                    elements.push(
                                                        <circle
                                                            key={`spangram-circle-${i}`}
                                                            cx={x}
                                                            cy={y}
                                                            r="3.5"
                                                            fill={color}
                                                            opacity="0.6"
                                                        />
                                                    );
                                                }

                                                return elements;
                                            })()}

                                            {/* Draw theme word paths */}
                                            {themeWordPaths.map((path, wordIndex) => {
                                                const elements = [];
                                                const cellSize = 48;
                                                const gap = 4;

                                                // Get color based on word index
                                                const colors = ['#93c5fd', '#d8b4fe', '#f9a8d4', '#86efac', '#fdba74', '#67e8f9', '#fca5a5', '#a5b4fc'];
                                                const color = colors[wordIndex % colors.length];

                                                // Draw lines
                                                for (let i = 0; i < path.length - 1; i++) {
                                                    const from = path[i];
                                                    const to = path[i + 1];

                                                    const fromX = from.col * (cellSize + gap) + cellSize / 2;
                                                    const fromY = from.row * (cellSize + gap) + cellSize / 2;
                                                    const toX = to.col * (cellSize + gap) + cellSize / 2;
                                                    const toY = to.row * (cellSize + gap) + cellSize / 2;

                                                    elements.push(
                                                        <line
                                                            key={`word-${wordIndex}-line-${i}`}
                                                            x1={fromX}
                                                            y1={fromY}
                                                            x2={toX}
                                                            y2={toY}
                                                            stroke={color}
                                                            strokeWidth="2"
                                                            strokeOpacity="0.5"
                                                            strokeLinecap="round"
                                                        />
                                                    );
                                                }

                                                // Draw small circles
                                                for (let i = 0; i < path.length; i++) {
                                                    const coord = path[i];
                                                    const x = coord.col * (cellSize + gap) + cellSize / 2;
                                                    const y = coord.row * (cellSize + gap) + cellSize / 2;

                                                    elements.push(
                                                        <circle
                                                            key={`word-${wordIndex}-circle-${i}`}
                                                            cx={x}
                                                            cy={y}
                                                            r="3.5"
                                                            fill={color}
                                                            opacity="0.6"
                                                        />
                                                    );
                                                }

                                                return elements;
                                            })}
                                        </svg>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                                            <span>Spangram</span>
                                        </div>
                                        {themeWords.filter(w => w.trim()).map((_, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded ${wordColors[(i + 1) % wordColors.length].split(' ')[0]}`}></div>
                                                <span>Word {i + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-800 p-4 rounded-lg">
                                    <h3 className="font-bold mb-2">Words in puzzle:</h3>
                                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                                        <li className={getWordColor(0)}>Spangram: {spangramWord}</li>
                                        {themeWords.filter(w => w.trim()).map((word, i) => (
                                            <li key={i} className={getWordColor(i + 1)}>Theme word: {word}</li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('words')}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handlePublish}
                                disabled={loading || !gridLetters || gridLetters.length !== 48}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                {loading ? 'Publishing...' : 'Publish Puzzle'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Published */}
                {step === 'publish' && publishedSlug && (
                    <div className="text-center space-y-6">
                        <div className="text-6xl">🎉</div>
                        <h2 className="text-3xl font-bold">Puzzle Published!</h2>
                        <p className="text-xl text-gray-400">"{title}" by {author}</p>

                        <div className="space-y-4 max-w-md mx-auto">
                            <button
                                onClick={copyLink}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                📋 Copy Link
                            </button>

                            <Link
                                href={`/play/${publishedSlug}`}
                                className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                ▶ Play Your Puzzle
                            </Link>

                            <Link
                                href="/create"
                                className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                                onClick={() => {
                                    setStep('metadata');
                                    setTitle('');
                                    setAuthor('');
                                    setThemeClue('');
                                    setSpangramWord('');
                                    setThemeWords(['']);
                                    setGridLetters('');
                                    setSpangramPath([]);
                                    setThemeWordPaths([]);
                                    setPublishedSlug(null);
                                }}
                            >
                                Create Another Puzzle
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
