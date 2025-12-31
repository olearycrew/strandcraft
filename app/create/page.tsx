'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Coordinate, ThemeWord, CreatePuzzleInput } from '@/types/puzzle';
import { GRID_ROWS, GRID_COLS, coordToIndex, areAdjacent } from '@/lib/utils/grid';
import { autoLayout } from '@/lib/utils/auto-layout';
import { addMyPuzzle } from '@/lib/utils/my-puzzles';
import MetadataStep from './components/MetadataStep';
import WordsStep from './components/WordsStep';
import LayoutModeStep from './components/LayoutModeStep';
import GridStep from './components/GridStep';
import PublishSuccessStep from './components/PublishSuccessStep';
import Footer from '@/app/components/Footer';

type Step = 'metadata' | 'words' | 'layout-mode' | 'grid' | 'publish';
type LayoutMode = 'auto' | 'manual';

export default function CreatePage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('metadata');
    const [loading, setLoading] = useState(false);
    const [layoutLoading, setLayoutLoading] = useState(false);
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
    const [gridLetters, setGridLetters] = useState(' '.repeat(48));
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
        newWords[index] = value.replace(/\s/g, '').toUpperCase();
        setThemeWords(newWords);
    };

    const handleAutoLayout = () => {
        setError(null);
        setLayoutLoading(true);

        // Use setTimeout to allow UI to update with loading state before CPU-intensive work
        setTimeout(() => {
            const validThemeWords = themeWords.filter(w => w.trim());
            const result = autoLayout(spangramWord, validThemeWords);

            setLayoutLoading(false);

            if (!result.success) {
                setError(result.error || 'Auto-layout failed');
                return;
            }

            setGridLetters(result.gridLetters!);
            setSpangramPath(result.spangramPath!);
            setThemeWordPaths(result.themeWordPaths!);
        }, 50); // Small delay to let React render loading state
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

            setSpangramPath([...currentPath]);
            const newGrid = gridLetters.split('');
            currentPath.forEach((coord, i) => {
                newGrid[coordToIndex(coord)] = spangramWord[i];
            });
            setGridLetters(newGrid.join(''));
        } else {
            const newPaths = [...themeWordPaths];
            newPaths[currentWordIndex - 1] = [...currentPath];
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
                newGrid[coordToIndex(coord)] = ' ';
            });
            setGridLetters(newGrid.join(''));
            setSpangramPath([]);
        } else {
            const newGrid = gridLetters.split('');
            const pathToClear = themeWordPaths[wordIndex - 1];
            if (pathToClear) {
                pathToClear.forEach(coord => {
                    newGrid[coordToIndex(coord)] = ' ';
                });
                setGridLetters(newGrid.join(''));
            }
            const newPaths = [...themeWordPaths];
            newPaths[wordIndex - 1] = [];
            setThemeWordPaths(newPaths);
        }
    };

    const clearAll = () => {
        // Reset grid to all spaces
        setGridLetters(' '.repeat(48));
        // Clear all paths
        setSpangramPath([]);
        setThemeWordPaths([]);
        // Cancel any active drawing
        setIsDrawing(false);
        setCurrentPath([]);
        setError(null);
    };

    const handleLayoutModeSelect = (mode: LayoutMode) => {
        setLayoutMode(mode);
        setStep('grid');
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
            addMyPuzzle({
                slug: data.slug,
                title,
                author,
                createdAt: new Date().toISOString(),
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-ctp-base text-ctp-text p-4">
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

                {step === 'metadata' && (
                    <MetadataStep
                        title={title}
                        author={author}
                        themeClue={themeClue}
                        onTitleChange={setTitle}
                        onAuthorChange={setAuthor}
                        onThemeClueChange={setThemeClue}
                        onContinue={() => setStep('words')}
                    />
                )}

                {step === 'words' && (
                    <WordsStep
                        spangramWord={spangramWord}
                        themeWords={themeWords}
                        onSpangramChange={setSpangramWord}
                        onThemeWordChange={handleThemeWordChange}
                        onAddThemeWord={handleAddThemeWord}
                        onRemoveThemeWord={handleRemoveThemeWord}
                        onBack={() => setStep('metadata')}
                        onContinue={() => setStep('layout-mode')}
                    />
                )}

                {step === 'layout-mode' && (
                    <LayoutModeStep
                        onSelectMode={handleLayoutModeSelect}
                        onBack={() => setStep('words')}
                    />
                )}

                {step === 'grid' && (
                    <GridStep
                        layoutMode={layoutMode}
                        gridLetters={gridLetters}
                        spangramWord={spangramWord}
                        spangramPath={spangramPath}
                        themeWords={themeWords}
                        themeWordPaths={themeWordPaths}
                        currentWordIndex={currentWordIndex}
                        currentPath={currentPath}
                        isDrawing={isDrawing}
                        loading={loading}
                        layoutLoading={layoutLoading}
                        onAutoLayout={handleAutoLayout}
                        onCellClick={handleCellClick}
                        onCellChange={handleGridLetterChange}
                        onStartDrawing={startDrawingWord}
                        onFinishDrawing={finishDrawingWord}
                        onCancelDrawing={cancelDrawing}
                        onClearWord={clearWord}
                        onClearAll={clearAll}
                        onBack={() => setStep('layout-mode')}
                        onPublish={handlePublish}
                    />
                )}

                {step === 'publish' && publishedSlug && (
                    <PublishSuccessStep
                        title={title}
                        author={author}
                        slug={publishedSlug}
                    />
                )}

                {/* Footer */}
                <Footer />
            </div>
        </main>
    );
}
