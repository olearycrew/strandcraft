'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getMyPuzzles, removeMyPuzzle, type MyPuzzle } from '@/lib/utils/my-puzzles';
import { copyToClipboard } from '@/lib/utils/share';
import Footer from '@/app/components/Footer';

export default function MyPuzzlesPage() {
    const [puzzles, setPuzzles] = useState<MyPuzzle[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

    useEffect(() => {
        // Load puzzles from localStorage
        const myPuzzles = getMyPuzzles();
        setPuzzles(myPuzzles);
        setLoading(false);
    }, []);

    const handleRemove = (slug: string) => {
        if (confirm('Are you sure you want to remove this puzzle from your list?')) {
            removeMyPuzzle(slug);
            setPuzzles(puzzles.filter(p => p.slug !== slug));
        }
    };

    const handleCopyLink = async (slug: string) => {
        const url = `${window.location.origin}/play/${slug}`;
        const success = await copyToClipboard(url);
        if (success) {
            setCopiedSlug(slug);
            setTimeout(() => setCopiedSlug(null), 2500);
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <main className="min-h-screen bg-ctp-base text-ctp-text p-4">
            <div className="max-w-4xl mx-auto py-8">
                <Link href="/" className="inline-flex items-center text-ctp-blue hover:text-ctp-sapphire mb-6">
                    ← Back to Home
                </Link>

                <h1 className="text-4xl font-bold mb-8">My Puzzles</h1>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-ctp-subtext0">Loading...</div>
                    </div>
                ) : puzzles.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold mb-2">No puzzles yet</h2>
                        <p className="text-ctp-subtext0 mb-6">
                            You haven't created any puzzles yet. Start creating your first puzzle!
                        </p>
                        <Link
                            href="/create"
                            className="inline-block bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Create a Puzzle
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-ctp-subtext0">
                                {puzzles.length} puzzle{puzzles.length !== 1 ? 's' : ''} created
                            </p>
                            <Link
                                href="/create"
                                className="bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base font-bold py-2 px-4 rounded-lg transition-colors text-sm"
                            >
                                + Create New
                            </Link>
                        </div>

                        {puzzles.map((puzzle) => (
                            <div
                                key={puzzle.slug}
                                className="bg-ctp-surface0 border border-ctp-surface1 rounded-lg p-6 hover:border-ctp-surface2 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2">{puzzle.title}</h3>
                                        <p className="text-ctp-subtext0 text-sm mb-3">
                                            by {puzzle.author}
                                        </p>
                                        <p className="text-ctp-overlay0 text-xs mb-4">
                                            Created {formatDate(puzzle.createdAt)}
                                        </p>
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/play/${puzzle.slug}`}
                                                className="bg-ctp-green hover:bg-ctp-green/80 text-ctp-base font-bold py-2 px-4 rounded transition-colors text-sm"
                                            >
                                                ▶ Play
                                            </Link>
                                            <button
                                                onClick={() => handleCopyLink(puzzle.slug)}
                                                className={`font-bold py-2 px-4 rounded transition-all text-sm flex items-center gap-1 ${
                                                    copiedSlug === puzzle.slug
                                                        ? 'bg-ctp-green text-ctp-base'
                                                        : 'bg-ctp-blue hover:bg-ctp-sapphire text-ctp-base'
                                                }`}
                                            >
                                                {copiedSlug === puzzle.slug ? (
                                                    <>
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        Copied!
                                                    </>
                                                ) : (
                                                    '📋 Copy Link'
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleRemove(puzzle.slug)}
                                                className="bg-ctp-red hover:bg-ctp-red/80 text-ctp-base font-bold py-2 px-4 rounded transition-colors text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <Footer />
            </div>
        </main>
    );
}
