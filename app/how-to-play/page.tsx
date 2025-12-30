// app/how-to-play/page.tsx
import Link from 'next/link';
import Footer from '@/app/components/Footer';

export default function HowToPlay() {
    return (
        <main className="min-h-screen bg-ctp-base text-ctp-text p-4">
            <div className="max-w-3xl mx-auto py-12 space-y-8">
                <Link
                    href="/"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
                >
                    ← Back to Home
                </Link>

                <h1 className="text-5xl font-bold">How to Play</h1>

                <div className="space-y-6 text-gray-300">
                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">The Goal</h2>
                        <p>
                            Find all the hidden words in the grid by connecting adjacent letters.
                            Each puzzle has a theme, and all words relate to that theme.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">How to Select Letters</h2>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Click or tap on a letter to start selecting</li>
                            <li>Drag to adjacent letters (horizontally, vertically, or diagonally)</li>
                            <li>Release to submit your word</li>
                            <li>If correct, the word will be highlighted in the grid</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">The Spangram</h2>
                        <p>
                            Every puzzle contains one special word called the <strong>spangram</strong>.
                            This word:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Describes the puzzle's theme</li>
                            <li>Spans from one edge of the grid to the opposite edge</li>
                            <li>Is highlighted in gold when found</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">Theme Words</h2>
                        <p>
                            In addition to the spangram, there are several theme words that relate
                            to the puzzle's theme. These are highlighted in blue when found.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">Winning</h2>
                        <p>
                            You win when you've found all the words in the puzzle. Every letter
                            in the grid is used exactly once across all words.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">Creating Puzzles</h2>
                        <p>
                            Want to create your own puzzle? Click "Create a Puzzle" on the home
                            page and follow the step-by-step wizard. You'll be able to:
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Set a title, author, and theme clue</li>
                            <li>Define your spangram and theme words</li>
                            <li>Arrange them on the grid (or use auto-arrange)</li>
                            <li>Preview and test your puzzle</li>
                            <li>Share it with a unique link</li>
                        </ul>
                    </section>
                </div>

                <div className="pt-8 flex gap-4">
                    <Link
                        href="/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Create a Puzzle
                    </Link>
                    <Link
                        href="/"
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>

                {/* Footer */}
                <Footer />
            </div>
        </main>
    );
}
