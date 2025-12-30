'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { generateShareText, generateWordOrderEmojis, copyToClipboard, nativeShare, canUseNativeShare } from '@/lib/utils/share';
import type { FoundWord } from './types';

interface WinModalProps {
    foundWords: FoundWord[];
    hintsUsed: number;
    totalWords: number;
    puzzleTitle: string;
    puzzleSlug: string;
}

export default function WinModal({
    foundWords,
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
        foundWords: foundWords.map(fw => ({ word: fw.word, type: fw.type })),
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold mb-4">Puzzle Complete!</h2>
                <p className="text-gray-300 mb-2">
                    You found all {foundWords.length} words!
                </p>

                <div className="text-2xl mb-4 tracking-wider">
                    {generateWordOrderEmojis(foundWords.map(fw => ({ word: fw.word, type: fw.type })))}
                </div>

                {hintsUsed > 0 ? (
                    <p className="text-sm text-gray-400 mb-6">
                        {hintsUsed} hint{hintsUsed === 1 ? '' : 's'} used
                    </p>
                ) : (
                    <p className="text-sm text-green-400 mb-6">
                        No hints!
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    <button
                        onClick={handleCopyResults}
                        className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                            shareStatus === 'copied'
                                ? 'bg-green-600 text-white'
                                : shareStatus === 'error'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        {shareStatus === 'copied' ? '✓ Copied!' : shareStatus === 'error' ? 'Failed to copy' : 'Copy Results'}
                    </button>

                    {showNativeShare && (
                        <button
                            onClick={handleNativeShare}
                            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
                                shareStatus === 'shared'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {shareStatus === 'shared' ? '✓ Shared!' : 'Share'}
                        </button>
                    )}
                </div>

                <Link
                    href="/"
                    className="inline-block text-blue-400 hover:text-blue-300 transition-colors"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
