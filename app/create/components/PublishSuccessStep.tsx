'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PublishSuccessStepProps {
    title: string;
    author: string;
    slug: string;
    isBlindMode?: boolean;
    onCreateAnother: () => void;
}

export default function PublishSuccessStep({
    title,
    author,
    slug,
    isBlindMode = false,
    onCreateAnother,
}: PublishSuccessStepProps) {
    const [linkCopied, setLinkCopied] = useState(false);

    const copyLink = () => {
        const url = `${window.location.origin}/play/${slug}`;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
    };

    return (
        <div className="text-center space-y-6">
            <div className="text-6xl">{isBlindMode ? '🙈🎉' : '🎉'}</div>
            <h2 className="text-3xl font-bold">Puzzle Published!</h2>
            <p className="text-xl text-gray-400">"{title}" by {author}</p>

            {isBlindMode && (
                <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-purple-200 text-sm">
                        🎲 Your puzzle was created in <strong>Blind Mode</strong> - you never saw the layout!
                        Now you can play your own puzzle and discover how the words were arranged.
                    </p>
                </div>
            )}

            <div className="space-y-4 max-w-md mx-auto">
                <button
                    onClick={copyLink}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ${linkCopied
                        ? 'bg-green-600 scale-105'
                        : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                >
                    {linkCopied ? '✓ Link Copied!' : '📋 Copy Link'}
                </button>

                <Link
                    href={`/play/${slug}`}
                    className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    {isBlindMode ? '🎮 Play Your Puzzle (Surprise!)' : '▶ Play Your Puzzle'}
                </Link>

                <button
                    onClick={onCreateAnother}
                    className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    Create Another Puzzle
                </button>
            </div>
        </div>
    );
}
