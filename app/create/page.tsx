'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Coordinate, ThemeWord, CreatePuzzleInput } from '@/types/puzzle';
import { GRID_ROWS, GRID_COLS, coordToIndex, areAdjacent } from '@/lib/utils/grid';
import { autoLayout } from '@/lib/utils/auto-layout';
import { addMyPuzzle } from '@/lib/utils/my-puzzles';
import GridRenderer from './components/GridRenderer';
import ManualLayoutControls from './components/ManualLayoutControls';

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
    const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
    const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);

    const handleAddThemeWord = () => setThemeWords([...themeWords, '']);
    const handleRemoveThemeWord = (index: number) => {
        // Clear the word's path from the grid if it exists
        const pathToClear = themeWordPaths[index];
        if (pathToClear && pathToClear.length > 0 && gridLetters) {
            const newGrid = gridLetters.split('');
            pathToClear.forEach(coord => {
                newGrid[coordToIndex(coord)] = ' ';
            });
            setGridLetters(newGrid.join(''));
        }

        // Remove the word from the array
        setThemeWords(themeWords.filter((_, i) => i !== index));

        // Remove the corresponding path
        setThemeWordPaths(themeWordPaths.filter((_, i) => i !== index));
    };
    const handleThemeWordChange = (index: number, value: string) => {
        const newWords = [...themeWords];
        newWords[index] = value.toUpperCase();
        setThemeWords(newWords);
    };

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

    const handleCellClick = (row: number, col: number) => {
        if (layoutMode !== 'manual' || !isDrawing) return;

        const coord: Coordinate = { row, col };
        const index = coordToIndex(coord);

        const existingIndex = currentPath.findIndex(c => coordToIndex(c) === index);
        if (existingIndex !== -1) {
            if (existingIndex === currentPath.length - 1) return;
            setCurrentPath(currentPath.slice(0, existingIndex + 1));
            return;
        }

        if (currentPath.length === 0) {
            setCurrentPath([coord]);
            return;
        }

        const lastCell = currentPath[currentPath.length - 1];
        if (!areAdjacent(lastCell, coord)) {
            setError('Cells must be adjacent (including diagonally)');
            return;
        }

        const allUsedCells = new Set<number>();
        if (currentWordIndex === 0) {
            themeWordPaths.forEach(path => {
                if (path && path.length > 0) {
                    path.forEach(c => allUsedCells.add(coordToIndex(c)));
                }
            });
        } else {
            spangramPath.forEach(c => allUsedCells.add(coordToIndex(c)));
            themeWordPaths.forEach((path, i) => {
                if (i !== currentWordIndex - 1 && path && path.length > 0) {
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

        if (currentWordIndex === 0) {
            const hasTop = currentPath.some(c => c.row === 0);
            const hasBottom = currentPath.some(c => c.row === GRID_ROWS - 1);
            const hasLeft = currentPath.some(c => c.col === 0);
            const hasRight = currentPath.some(c => c.col === GRID_COLS - 1);

            if (!(hasTop && hasBottom) && !(hasLeft && hasRight)) {
                setError('Spangram must span from one edge to the opposite edge');
                return;
            }

            setSpangramPath(currentPath);
            const newGrid = gridLetters ? gridLetters.split('') : new Array(48).fill(' ');
            currentPath.forEach((coord, i) => {
                newGrid[coordToIndex(coord)] = spangramWord[i];
            });
            setGridLetters(newGrid.join(''));
        } else {
            const newPaths = [...themeWordPaths];
            newPaths[currentWordIndex - 1] = currentPath;
            setThemeWordPaths(newPaths);

            const newGrid = gridLetters.split('');
            currentPath.forEach((coord, i) => {
                newGrid[coordToIndex(coord)] = targetWord[i];
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
            const newGrid = gridLetters.split('');
            spangramPath.forEach(coord => {
                newGrid[coordToIndex(coord)] = '';
            });
            setGridLetters(newGrid.join(''));
            setSpangramPath([]);
        } else {
            const newGrid = gridLetters.split('');
            const pathToClear = themeWordPaths[wordIndex - 1];
            if (pathToClear) {
                pathToClear.forEach(coord => {
                    newGrid[coordToIndex(coord)] = '';
                });
                setGridLetters(newGrid.join(''));
            }
            const newPaths = [...themeWordPaths];
            newPaths[wordIndex - 1] = [];
            setThemeWordPaths(newPaths);
        }
    };

    const handlePublish = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!gridLetters || gridLetters.length !== 48) {
                throw new Error('Grid must be complete (48 letters)');
            }

            if (!spangramPath || spangramPath.length === 0) {
                throw new Error('Spangram path is missing');
            }

            const validThemeWords = themeWords.filter(w => w.trim());
            if (themeWordPaths.length !== validThemeWords.length) {
                throw new Error('Theme word paths are missing');
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
                            <button
                                onClick={() => {
                                    setLayoutMode('auto');
                                    setStep('grid');
                                }}
                                className="p-6 rounded-lg border-2 border-gray-700 bg-gray-800 hover:border-gray-600 transition-all text-left"
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

                            <button
                                onClick={() => {
                                    setLayoutMode('manual');
                                    setStep('grid');
                                }}
                                className="p-6 rounded-lg border-2 border-gray-700 bg-gray-800 hover:border-gray-600 transition-all text-left"
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
                        {layoutMode === 'auto' && (
                            <>
                                <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                                    <h3 className="font-bold mb-2">💡 Auto Layout Mode</h3>
                                    <p className="text-sm text-gray-300">
                                        Click "Auto-Layout" to automatically arrange your words in the grid.
                                        Don't like the layout? Click again to shuffle and get a different arrangement!
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

                                <ManualLayoutControls
                                    spangramWord={spangramWord}
                                    themeWords={themeWords}
                                    spangramPath={spangramPath}
                                    themeWordPaths={themeWordPaths}
                                    currentWordIndex={currentWordIndex}
                                    currentPath={currentPath}
                                    isDrawing={isDrawing}
                                    onStartDrawing={startDrawingWord}
                                    onFinishDrawing={finishDrawingWord}
                                    onCancelDrawing={cancelDrawing}
                                    onClearWord={clearWord}
                                />
                            </>
                        )}

                        {(gridLetters || layoutMode === 'manual') && (
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h3 className="font-bold mb-3">Grid Preview</h3>
                                <GridRenderer
                                    gridLetters={gridLetters || ' '.repeat(48)}
                                    spangramPath={spangramPath}
                                    themeWordPaths={themeWordPaths}
                                    currentPath={currentPath}
                                    isDrawing={isDrawing}
                                    layoutMode={layoutMode}
                                    currentWord={currentWordIndex === 0 ? spangramWord : themeWords[currentWordIndex - 1]}
                                    onCellClick={handleCellClick}
                                    onCellChange={handleGridLetterChange}
                                />
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                onClick={() => setStep('layout-mode')}
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

                {/* Step 5: Published */}
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
