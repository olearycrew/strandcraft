'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PublishSuccessStepProps {
    title: string;
    author: string;
    slug: string;
    onCreateAnother: () => void;
}

export default function PublishSuccessStep({
    title,
    author,
    slug,
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
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold">Puzzle Published!</h2>
            <p className="text-xl text-gray-400">"{title}" by {author}</p>

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
                    ▶ Play Your Puzzle
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
