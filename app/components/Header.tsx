// app/components/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Smaller letter tiles for the mini logo - Using Catppuccin colors
const strandColors = [
    'bg-ctp-yellow', // S
    'bg-ctp-blue',   // T
    'bg-ctp-mauve',  // R
    'bg-ctp-pink',   // A
    'bg-ctp-green',  // N
    'bg-ctp-peach',  // D
];

const craftColors = [
    'bg-ctp-teal',   // C
    'bg-ctp-blue',   // R
    'bg-ctp-mauve',  // A
    'bg-ctp-pink',   // F
    'bg-ctp-green',  // T
];

const strandLetters = 'STRAND'.split('');
const craftLetters = 'CRAFT'.split('');

function MiniLetterTile({ letter, color, className = '' }: { letter: string; color: string; className?: string }) {
    return (
        <div
            className={`${color} w-6 h-6 rounded flex items-center justify-center text-ctp-crust font-bold text-sm shadow border border-ctp-crust/20 transition-all duration-300 ${className}`}
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
        <header className="bg-ctp-mantle border-b border-ctp-surface0 sticky top-0 z-50 animate-in slide-in-from-top duration-300">
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
                            ? 'bg-ctp-blue text-ctp-base'
                            : 'bg-ctp-surface0 text-ctp-text hover:bg-ctp-surface1 hover:scale-105'
                            }`}
                    >
                        Community
                    </Link>
                    <Link
                        href="/create"
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${pathname === '/create'
                            ? 'bg-ctp-green text-ctp-base'
                            : 'bg-ctp-green text-ctp-base hover:bg-ctp-green/80 hover:scale-105'
                            }`}
                    >
                        Create
                    </Link>
                </nav>
            </div>
        </header>
    );
}
