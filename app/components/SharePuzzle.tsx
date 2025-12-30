'use client';

import { useState, useEffect } from 'react';
import { copyToClipboard, canUseNativeShare, sharePuzzleLink, generatePuzzleLinkMessage } from '@/lib/utils/share';

interface SharePuzzleProps {
    puzzleTitle: string;
    puzzleSlug: string;
}

export default function SharePuzzle({ puzzleTitle, puzzleSlug }: SharePuzzleProps) {
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared' | 'error'>('idle');
    const [showNativeShare, setShowNativeShare] = useState(false);

    useEffect(() => {
        setShowNativeShare(canUseNativeShare());
    }, []);

    const handleCopyLink = async () => {
        const shareMessage = generatePuzzleLinkMessage(puzzleTitle, puzzleSlug);
        const success = await copyToClipboard(shareMessage);

        if (success) {
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2500);
        } else {
            setShareStatus('error');
            setTimeout(() => setShareStatus('idle'), 2500);
        }
    };

    const handleNativeShare = async () => {
        const success = await sharePuzzleLink(puzzleTitle, puzzleSlug);
        if (success) {
            setShareStatus('shared');
            setTimeout(() => setShareStatus('idle'), 2500);
        } else {
            // Fallback to copy if native share fails
            handleCopyLink();
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg p-4 mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-white">Share this Puzzle</h3>
                    <p className="text-sm text-gray-400">Challenge your friends to solve it!</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCopyLink}
                        className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                            shareStatus === 'copied'
                                ? 'bg-green-600 text-white'
                                : shareStatus === 'error'
                                ? 'bg-red-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        {shareStatus === 'copied' ? (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Link Copied!
                            </>
                        ) : shareStatus === 'error' ? (
                            'Failed to copy'
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                </svg>
                                Copy Link
                            </>
                        )}
                    </button>
                    
                    {showNativeShare && (
                        <button
                            onClick={handleNativeShare}
                            className={`py-2 px-4 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                                shareStatus === 'shared'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {shareStatus === 'shared' ? (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Shared!
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
