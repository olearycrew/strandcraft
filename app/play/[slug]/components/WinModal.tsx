'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { generateShareText, generateEmojiGrid, copyToClipboard, nativeShare, canUseNativeShare } from '@/lib/utils/share';
import type { FoundWord, GameAction } from './types';

interface WinModalProps {
    foundWords: FoundWord[];
    gameActions: GameAction[];
    hintsUsed: number;
    totalWords: number;
    puzzleTitle: string;
    puzzleSlug: string;
}

export default function WinModal({
    foundWords,
    gameActions,
    hintsUsed,
    totalWords,
    puzzleTitle,
    puzzleSlug,
}: WinModalProps) {
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle');
    const [showNativeShare, setShowNativeShare] = useState(false);

    useEffect(() => {
        setShowNativeShare(canUseNativeShare());
    }, []);

    const getShareOptions = () => ({
        puzzleTitle,
        puzzleSlug,
        gameActions,
        hintsUsed,
        totalWords,
    });

    const handleCopyResults = async () => {
        const shareText = generateShareText(getShareOptions());
        const success = await copyToClipboard(shareText);

        if (success) {
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2500);
        } else {
            setShareStatus('error');
            setTimeout(() => setShareStatus('idle'), 2500);
        }
    };

    const handleNativeShare = async () => {
        const success = await nativeShare(getShareOptions());
        if (success) {
            setShareStatus('shared');
            setTimeout(() => setShareStatus('idle'), 2500);
        } else {
            handleCopyResults();
        }
    };

    return (
        <div className="fixed inset-0 bg-ctp-crust/90 flex items-center justify-center z-50 p-4">
            <div className="bg-ctp-surface0 rounded-lg p-8 max-w-md w-full text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-4 text-ctp-text">Puzzle Complete!</h2>
                <p className="text-ctp-subtext1 mb-2">
                    You found all {foundWords.length} words!
                </p>

                <div className="text-2xl mb-4 tracking-wider font-mono whitespace-pre-line">
                    {generateEmojiGrid(gameActions)}
                </div>

                {hintsUsed > 0 ? (
                    <p className="text-sm text-ctp-subtext0 mb-6">
                        {hintsUsed} hint{hintsUsed === 1 ? '' : 's'} used
                    </p>
                ) : (
                    <p className="text-sm text-ctp-green mb-6">
                        No hints! 🌟
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <button
                        onClick={handleCopyResults}
                        className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${shareStatus === 'copied'
                            ? 'bg-ctp-green text-ctp-base'
                            : shareStatus === 'error'
                                ? 'bg-ctp-red text-ctp-base'
                                : 'bg-ctp-surface1 hover:bg-ctp-surface2 text-ctp-text'
                            }`}
                    >
                        {shareStatus === 'copied' ? '✓ Copied!' : shareStatus === 'error' ? 'Failed to copy' : 'Copy Results'}
                    </button>

                    {showNativeShare && (
                        <button
                            onClick={handleNativeShare}
                            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${shareStatus === 'shared'
                                ? 'bg-ctp-green text-ctp-base'
                                : 'bg-ctp-blue hover:bg-ctp-blue/80 text-ctp-base'
                                }`}
                        >
                            {shareStatus === 'shared' ? '✓ Shared!' : 'Share'}
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        href="/community"
                        className="inline-block text-ctp-green hover:text-ctp-teal transition-colors font-medium"
                    >
                        🎮 Play Another
                    </Link>
                    <span className="hidden sm:inline text-ctp-overlay0">•</span>
                    <Link
                        href="/"
                        className="inline-block text-ctp-blue hover:text-ctp-sky transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
