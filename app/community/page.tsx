// app/community/page.tsx
import Link from 'next/link';
import { db } from '@/lib/db';
import { puzzles } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import Footer from '@/app/components/Footer';

interface RecentPuzzle {
    id: number;
    slug: string;
    title: string;
    author: string;
    themeClue: string;
    createdAt: Date;
}

async function getRecentPuzzles(): Promise<RecentPuzzle[]> {
    try {
        const recentPuzzles = await db
            .select({
                id: puzzles.id,
                slug: puzzles.slug,
                title: puzzles.title,
                author: puzzles.author,
                themeClue: puzzles.themeClue,
                createdAt: puzzles.createdAt,
            })
            .from(puzzles)
            .orderBy(desc(puzzles.createdAt))
            .limit(20);

        return recentPuzzles;
    } catch (error) {
        console.error('Error fetching recent puzzles:', error);
        return [];
    }
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
}

export default async function CommunityPage() {
    const puzzles = await getRecentPuzzles();

    return (
        <main className="min-h-screen bg-gray-900 text-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <span className="mr-2">←</span>
                        Back to Home
                    </Link>
                    <h1 className="text-5xl font-bold mb-2">Community Puzzles</h1>
                    <p className="text-xl text-gray-400">
                        Play the latest puzzles created by the community
                    </p>
                </div>

                {/* Puzzles Grid */}
                {puzzles.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-4">🧩</div>
                        <h2 className="text-2xl font-bold mb-2">No puzzles yet</h2>
                        <p className="text-gray-400 mb-6">
                            Be the first to create a puzzle!
                        </p>
                        <Link
                            href="/create"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Create a Puzzle
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {puzzles.map((puzzle) => (
                            <Link
                                key={puzzle.id}
                                href={`/play/${puzzle.slug}`}
                                className="group bg-gray-800 hover:bg-gray-700 rounded-xl p-6 transition-all duration-200 hover:scale-105 border-2 border-gray-700 hover:border-blue-500"
                            >
                                <div className="space-y-3">
                                    {/* Title */}
                                    <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors line-clamp-2">
                                        {puzzle.title}
                                    </h3>

                                    {/* Theme Clue */}
                                    <p className="text-gray-400 text-sm line-clamp-2">
                                        {puzzle.themeClue}
                                    </p>

                                    {/* Metadata */}
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
                                        <span className="flex items-center">
                                            <span className="mr-1">👤</span>
                                            {puzzle.author}
                                        </span>
                                        <span className="flex items-center">
                                            <span className="mr-1">🕐</span>
                                            {formatTimeAgo(puzzle.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Create Button */}
                {puzzles.length > 0 && (
                    <div className="mt-12 text-center">
                        <Link
                            href="/create"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
                        >
                            Create Your Own Puzzle
                        </Link>
                    </div>
                )}

                {/* Footer */}
                <Footer />
            </div>
        </main>
    );
}
