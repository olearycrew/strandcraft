'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Coordinate, ThemeWord, CreatePuzzleInput } from '@/types/puzzle';
import { GRID_ROWS, GRID_COLS, coordToIndex } from '@/lib/utils/grid';
import { autoLayout } from '@/lib/utils/auto-layout';

type Step = 'metadata' | 'words' | 'grid' | 'publish';

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

    // Grid state
    const [gridLetters, setGridLetters] = useState('');
    const [spangramPath, setSpangramPath] = useState<Coordinate[]>([]);
    const [themeWordPaths, setThemeWordPaths] = useState<Coordinate[][]>([]);
    const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

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
                                onClick={() => setStep('grid')}
                                disabled={getTotalLetters() !== 48 || !spangramWord || themeWords.filter(w => w.trim()).length === 0}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                Continue →
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Grid */}
                {step === 'grid' && (
                    <div className="space-y-6">
                        <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                            <h3 className="font-bold mb-2">💡 Tip: Use Auto-Layout</h3>
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
