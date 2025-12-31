'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { PuzzlePublic, Coordinate } from '@/types/puzzle';
import { getLetterAt } from '@/lib/utils/grid';
import { isValidEnglishWord } from '@/lib/utils/dictionary';
import {
    hasLikedPuzzle,
    setLikedPuzzle,
    hasPlayedPuzzle,
    setPlayedPuzzle,
    hasCompletedPuzzle,
    setCompletedPuzzle,
    loadUsedHintWords,
    saveUsedHintWord,
    loadHintEnabled,
    saveHintEnabled,
} from '@/lib/utils/storage';
import Footer from '@/app/components/Footer';
import SharePuzzle from '@/app/components/SharePuzzle';
import {
    PuzzleGrid,
    WordInput,
    FoundWordsList,
    HintPanel,
    WinModal,
    FoundWord,
    HintState,
    GameAction,
    ACTION_EMOJIS,
} from './components';

export default function PlayClient({ slug }: { slug: string }) {
    const [puzzle, setPuzzle] = useState<PuzzlePublic | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Game state
    const [foundWords, setFoundWords] = useState<FoundWord[]>([]);
    const [currentPath, setCurrentPath] = useState<Coordinate[]>([]);
    const [gameWon, setGameWon] = useState(false);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [gameActions, setGameActions] = useState<GameAction[]>([]);

    // Like state
    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);

    // Hint system state
    const [hintState, setHintState] = useState<HintState>({
        enabled: false,
        nonThemeWordsFound: [],
        allTimeUsedWords: [],
        hintsUsed: 0,
        currentHintPath: null,
    });

    // Load puzzle and state from localStorage
    useEffect(() => {
        fetchPuzzle();
        const storedWords = loadUsedHintWords(slug);
        const hintsEnabled = loadHintEnabled();
        setHintState(prev => ({
            ...prev,
            allTimeUsedWords: storedWords.length > 0 ? storedWords : prev.allTimeUsedWords,
            enabled: hintsEnabled,
        }));
        setLiked(hasLikedPuzzle(slug));
    }, [slug]);

    // Track play when puzzle is loaded
    useEffect(() => {
        if (puzzle && !hasPlayedPuzzle(slug)) {
            setPlayedPuzzle(slug);
            fetch(`/api/puzzles/${slug}/stats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'play' }),
            }).catch(console.error);
        }
        if (puzzle) {
            setLikeCount(puzzle.likeCount);
        }
    }, [puzzle, slug]);

    const fetchPuzzle = async () => {
        try {
            const response = await fetch(`/api/puzzles/${slug}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to load puzzle');
            setPuzzle(data.puzzle);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const pathsMatch = (a: Coordinate[], b: Coordinate[]): boolean => {
        if (a.length !== b.length) return false;
        return a.every((coord, i) => coord.row === b[i].row && coord.col === b[i].col);
    };

    const handleCellClick = (row: number, col: number) => {
        if (!puzzle) return;

        const newCoord = { row, col };

        if (currentPath.length === 0) {
            setCurrentPath([newCoord]);
            return;
        }

        const lastCoord = currentPath[currentPath.length - 1];

        if (lastCoord.row === row && lastCoord.col === col) {
            setCurrentPath(currentPath.slice(0, -1));
            return;
        }

        const rowDiff = Math.abs(newCoord.row - lastCoord.row);
        const colDiff = Math.abs(newCoord.col - lastCoord.col);
        const isAdjacent = rowDiff <= 1 && colDiff <= 1 && (rowDiff + colDiff > 0);

        if (!isAdjacent) {
            setCurrentPath([newCoord]);
            return;
        }

        const alreadyInPath = currentPath.some(c => c.row === row && c.col === col);
        if (alreadyInPath) return;

        setCurrentPath([...currentPath, newCoord]);
    };

    const checkWinCondition = (words: FoundWord[]) => {
        if (!puzzle) return;
        const totalWords = 1 + puzzle.themeWords.length;
        if (words.length === totalWords) {
            setGameWon(true);
            if (!hasCompletedPuzzle(slug)) {
                setCompletedPuzzle(slug);
                fetch(`/api/puzzles/${slug}/stats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'complete' }),
                }).catch(console.error);
            }
        }
    };

    const handleSubmit = () => {
        if (currentPath.length === 0 || !puzzle) return;

        const selectedWord = currentPath.map(coord => getLetterAt(puzzle.gridLetters, coord)).join('');

        if (hintState.currentHintPath && pathsMatch(currentPath, hintState.currentHintPath)) {
            setHintState(prev => ({ ...prev, currentHintPath: null }));
        }

        // Check spangram
        if (selectedWord === puzzle.spangramWord && pathsMatch(currentPath, puzzle.spangramPath)) {
            const alreadyFound = foundWords.some(w => w.type === 'spangram');
            if (!alreadyFound) {
                const newFoundWord: FoundWord = {
                    word: selectedWord,
                    path: currentPath,
                    type: 'spangram',
                    emoji: ACTION_EMOJIS.spangram
                };
                const newFoundWords = [...foundWords, newFoundWord];
                setFoundWords(newFoundWords);
                setGameActions(prev => [...prev, { type: 'spangram', word: selectedWord }]);
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
                    const newFoundWord: FoundWord = {
                        word: selectedWord,
                        path: currentPath,
                        type: 'theme',
                        emoji: ACTION_EMOJIS.word
                    };
                    const newFoundWords = [...foundWords, newFoundWord];
                    setFoundWords(newFoundWords);
                    setGameActions(prev => [...prev, { type: 'word', word: selectedWord }]);
                    checkWinCondition(newFoundWords);
                    foundThemeWord = true;
                    break;
                }
            }
        }

        // Handle hint word validation
        if (hintState.enabled && !foundThemeWord && selectedWord.length >= 4) {
            if (!hintState.allTimeUsedWords.includes(selectedWord)) {
                if (!isValidEnglishWord(selectedWord)) {
                    setFeedback({ message: `"${selectedWord}" is not a valid English word`, type: 'error' });
                    setTimeout(() => setFeedback(null), 2000);
                } else {
                    const isThemeWord = puzzle.themeWords.some(tw => tw.word === selectedWord) || selectedWord === puzzle.spangramWord;
                    if (!isThemeWord) {
                        const updatedAllTimeWords = saveUsedHintWord(slug, selectedWord, hintState.allTimeUsedWords);
                        setHintState(prev => ({
                            ...prev,
                            nonThemeWordsFound: [...prev.nonThemeWordsFound, selectedWord],
                            allTimeUsedWords: updatedAllTimeWords
                        }));
                        setFeedback({ message: `"${selectedWord}" added to hint progress!`, type: 'success' });
                        setTimeout(() => setFeedback(null), 2000);
                    }
                }
            } else {
                setFeedback({ message: `"${selectedWord}" was already used for hints`, type: 'error' });
                setTimeout(() => setFeedback(null), 2000);
            }
        }

        setCurrentPath([]);
    };

    const handleClear = () => setCurrentPath([]);

    const toggleHints = () => {
        setHintState(prev => {
            const newEnabled = !prev.enabled;
            saveHintEnabled(newEnabled);
            return {
                ...prev,
                enabled: newEnabled,
                nonThemeWordsFound: [],
                hintsUsed: 0,
                currentHintPath: null,
            };
        });
    };

    const handleLike = async () => {
        if (likeLoading) return;
        setLikeLoading(true);
        const newLikedState = !liked;

        try {
            const response = await fetch(`/api/puzzles/${slug}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: newLikedState ? 'like' : 'unlike' }),
            });
            if (response.ok) {
                const data = await response.json();
                setLiked(newLikedState);
                setLikeCount(data.likeCount);
                setLikedPuzzle(slug, newLikedState);
            }
        } catch (error) {
            console.error('Error updating like:', error);
        } finally {
            setLikeLoading(false);
        }
    };

    const canUseHint = (): boolean => {
        return hintState.enabled && hintState.nonThemeWordsFound.length >= 3 && hintState.currentHintPath === null;
    };

    const getHintProgress = (): number => {
        if (!hintState.enabled || hintState.currentHintPath !== null) return 0;
        // Show progress toward next hint (0-3), with any overflow counting toward the next
        return hintState.nonThemeWordsFound.length % 3 || (hintState.nonThemeWordsFound.length >= 3 ? 3 : 0);
    };

    const getAvailableHints = (): number => {
        if (!hintState.enabled || hintState.currentHintPath !== null) return 0;
        return Math.floor(hintState.nonThemeWordsFound.length / 3);
    };

    const useHint = () => {
        if (!puzzle || !canUseHint()) return;

        // Track hint action in game actions
        setGameActions(prev => [...prev, { type: 'hint' }]);

        const unfoundThemeWords = puzzle.themeWords.filter(
            tw => !foundWords.some(fw => fw.word === tw.word)
        );

        if (unfoundThemeWords.length === 0 && !foundWords.some(fw => fw.type === 'spangram')) {
            setHintState(prev => ({
                ...prev,
                currentHintPath: puzzle.spangramPath,
                hintsUsed: prev.hintsUsed + 1,
                // Keep any overflow words (subtract 3 for the hint used)
                nonThemeWordsFound: prev.nonThemeWordsFound.slice(3),
            }));
        } else if (unfoundThemeWords.length > 0) {
            const randomWord = unfoundThemeWords[Math.floor(Math.random() * unfoundThemeWords.length)];
            setHintState(prev => ({
                ...prev,
                currentHintPath: randomWord.path,
                hintsUsed: prev.hintsUsed + 1,
                // Keep any overflow words (subtract 3 for the hint used)
                nonThemeWordsFound: prev.nonThemeWordsFound.slice(3),
            }));
        }
    };

    const getCurrentWord = (): string => {
        if (!puzzle || currentPath.length === 0) return '';
        return currentPath.map(coord => getLetterAt(puzzle.gridLetters, coord)).join('');
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-ctp-base text-ctp-text flex items-center justify-center">
                <div className="text-xl">Loading puzzle...</div>
            </main>
        );
    }

    if (error || !puzzle) {
        return (
            <main className="min-h-screen bg-ctp-base text-ctp-text flex items-center justify-center p-4">
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

    const totalWords = 1 + puzzle.themeWords.length;

    return (
        <main className="min-h-screen bg-ctp-base text-ctp-text p-4">
            <div className="max-w-4xl mx-auto py-8">
                <div className="mb-8">
                    <div className="flex items-center justify-between gap-4 mb-1">
                        <h1 className="text-3xl font-bold">{puzzle.title}</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleLike}
                                disabled={likeLoading}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${liked
                                    ? 'bg-ctp-pink hover:bg-ctp-pink/80 text-ctp-base'
                                    : 'bg-ctp-surface1 hover:bg-ctp-surface2 text-ctp-subtext1'
                                    }`}
                            >
                                <span>{liked ? '❤️' : '🤍'}</span>
                                <span>{likeCount}</span>
                            </button>
                            <button
                                onClick={toggleHints}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${hintState.enabled
                                    ? 'bg-ctp-yellow hover:bg-ctp-yellow/80 text-ctp-base'
                                    : 'bg-ctp-surface1 hover:bg-ctp-surface2 text-ctp-subtext1'
                                    }`}
                            >
                                {hintState.enabled ? '💡 Hints: ON' : '💡 Hints: OFF'}
                            </button>
                        </div>
                    </div>
                    <p className="text-ctp-subtext0">by {puzzle.author}</p>
                    <p className="text-lg text-ctp-subtext1 mt-2">Theme: {puzzle.themeClue}</p>
                </div>

                <div className="flex flex-col md:flex-row md:gap-8 md:items-start">
                    <div className="flex-1 mb-8 md:mb-0">
                        <PuzzleGrid
                            gridLetters={puzzle.gridLetters}
                            currentPath={currentPath}
                            foundWords={foundWords}
                            hintPath={hintState.currentHintPath}
                            onCellClick={handleCellClick}
                        />

                        <WordInput
                            currentWord={getCurrentWord()}
                            onSubmit={handleSubmit}
                            onClear={handleClear}
                        />

                        {feedback && (
                            <div className={`mt-4 p-3 rounded-lg text-center text-ctp-base font-medium ${feedback.type === 'success' ? 'bg-ctp-green' : 'bg-ctp-red'
                                }`}>
                                {feedback.message}
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-80 space-y-6">
                        <FoundWordsList foundWords={foundWords} totalWords={totalWords} />
                        <HintPanel
                            enabled={hintState.enabled}
                            progress={getHintProgress()}
                            availableHints={getAvailableHints()}
                            canUseHint={canUseHint()}
                            hasActiveHint={hintState.currentHintPath !== null}
                            hintsUsed={hintState.hintsUsed}
                            onUseHint={useHint}
                        />
                    </div>
                </div>

                {gameWon && (
                    <WinModal
                        foundWords={foundWords}
                        gameActions={gameActions}
                        hintsUsed={hintState.hintsUsed}
                        totalWords={totalWords}
                        puzzleTitle={puzzle.title}
                        puzzleSlug={slug}
                    />
                )}

                <SharePuzzle puzzleTitle={puzzle.title} puzzleSlug={slug} />
                <Footer />
            </div>
        </main>
    );
}
