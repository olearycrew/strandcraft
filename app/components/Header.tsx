// app/components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Smaller letter tiles for the mini logo
const strandColors = [
    'bg-yellow-600', // S
    'bg-blue-600',   // T
    'bg-purple-600', // R
    'bg-pink-600',   // A
    'bg-green-600',  // N
    'bg-orange-600', // D
];

const craftColors = [
    'bg-cyan-600',   // C
    'bg-blue-600',   // R
    'bg-purple-600', // A
    'bg-pink-600',   // F
    'bg-green-600',  // T
];

const strandLetters = 'STRAND'.split('');
const craftLetters = 'CRAFT'.split('');

function MiniLetterTile({ letter, color, className = '' }: { letter: string; color: string; className?: string }) {
    return (
        <div
            className={`${color} w-6 h-6 rounded flex items-center justify-center text-white font-bold text-sm shadow border border-white/20 transition-all duration-300 ${className}`}
        >
            {letter}
        </div>
    );
}

export default function Header() {
    const pathname = usePathname();

    // Don't show header on home page since it has its own logo
    if (pathname === '/') {
        return null;
    }

    return (
        <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50 animate-in slide-in-from-top duration-300">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Mini Logo - S and C on mobile, full STRANDCRAFT on larger screens */}
                <Link href="/" className="flex items-center gap-0.5 hover:opacity-80 transition-opacity group">
                    {/* Mobile: Just S and C */}
                    <div className="flex gap-0.5 sm:hidden">
                        <MiniLetterTile letter="S" color={strandColors[0]} className="group-hover:scale-110" />
                        <MiniLetterTile letter="C" color={craftColors[0]} className="group-hover:scale-110" />
                    </div>

                    {/* Desktop: Full STRANDCRAFT */}
                    <div className="hidden sm:flex gap-0.5">
                        {strandLetters.map((letter, index) => (
                            <MiniLetterTile
                                key={`strand-${index}`}
                                letter={letter}
                                color={strandColors[index]}
                                className="group-hover:scale-110"
                            />
                        ))}
                    </div>
                    <div className="hidden sm:flex gap-0.5">
                        {craftLetters.map((letter, index) => (
                            <MiniLetterTile
                                key={`craft-${index}`}
                                letter={letter}
                                color={craftColors[index]}
                                className="group-hover:scale-110"
                            />
                        ))}
                    </div>
                </Link>

                {/* Navigation Buttons */}
                <nav className="flex items-center gap-2 sm:gap-3">
                    <Link
                        href="/community"
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${pathname === '/community'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:scale-105'
                            }`}
                    >
                        Community
                    </Link>
                    <Link
                        href="/create"
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${pathname === '/create'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-600 text-white hover:bg-green-500 hover:scale-105'
                            }`}
                    >
                        Create
                    </Link>
                </nav>
            </div>
        </header>
    );
}
