// app/page.tsx
'use client';

import Link from 'next/link';
import Footer from './components/Footer';
import { useState, useRef, useEffect, useCallback } from 'react';

// Letter tile colors matching the completed puzzle board - Using Catppuccin colors
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

const allColors = [
  'bg-ctp-yellow', 'bg-ctp-blue', 'bg-ctp-mauve', 'bg-ctp-pink',
  'bg-ctp-green', 'bg-ctp-peach', 'bg-ctp-teal', 'bg-ctp-red',
  'bg-ctp-flamingo', 'bg-ctp-rosewater', 'bg-ctp-sky', 'bg-ctp-sapphire',
];

const strandLetters = 'STRAND'.split('');
const craftLetters = 'CRAFT'.split('');

// Secret messages that can appear during party mode
const secretMessages = [
  "You found me!",
  "Party time!",
  "Nice clicking!",
  "Disco mode!",
  "You're crafty!",
];

function LetterTile({
  letter,
  color,
  index,
  isPartyMode,
  onClick
}: {
  letter: string;
  color: string;
  index: number;
  isPartyMode: boolean;
  onClick: () => void;
}) {
  const partyAnimations = [
    'animate-bounce',
    'animate-pulse',
    'animate-spin',
  ];

  const animationClass = isPartyMode
    ? partyAnimations[index % partyAnimations.length]
    : '';

  return (
    <div
      onClick={onClick}
      className={`${color} w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center text-ctp-crust font-bold text-lg sm:text-xl md:text-2xl shadow-lg border-2 border-ctp-crust/20 transform transition-all duration-300 hover:scale-110 cursor-pointer select-none ${animationClass} ${isPartyMode ? 'hover:rotate-12' : ''}`}
      style={{
        animationDelay: `${index * 50}ms`,
        animationDuration: isPartyMode ? '0.5s' : undefined,
      }}
    >
      {letter}
    </div>
  );
}

function EmojiTile({ emoji, color }: { emoji: string; color: string }) {
  return (
    <div className="flex justify-center">
      <div
        className={`${color} w-14 h-14 rounded-lg flex items-center justify-center text-3xl shadow-lg border-2 border-ctp-crust/20`}
      >
        {emoji}
      </div>
    </div>
  );
}

export default function Home() {
  const [isPartyMode, setIsPartyMode] = useState(false);
  const [secretMessage, setSecretMessage] = useState('');
  const [shuffledStrandColors, setShuffledStrandColors] = useState(strandColors);
  const [shuffledCraftColors, setShuffledCraftColors] = useState(craftColors);
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const partyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const colorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const shuffleColors = useCallback(() => {
    const getRandomColor = () => allColors[Math.floor(Math.random() * allColors.length)];
    setShuffledStrandColors(strandColors.map(() => getRandomColor()));
    setShuffledCraftColors(craftColors.map(() => getRandomColor()));
  }, []);

  const startPartyMode = useCallback(() => {
    setIsPartyMode(true);
    setSecretMessage(secretMessages[Math.floor(Math.random() * secretMessages.length)]);

    // Shuffle colors rapidly during party mode
    colorIntervalRef.current = setInterval(shuffleColors, 300);

    // End party mode after 6 seconds
    partyTimeoutRef.current = setTimeout(() => {
      setIsPartyMode(false);
      setSecretMessage('');
      setShuffledStrandColors(strandColors);
      setShuffledCraftColors(craftColors);
      if (colorIntervalRef.current) {
        clearInterval(colorIntervalRef.current);
      }
    }, 6000);
  }, [shuffleColors]);

  const handleTileClick = useCallback(() => {
    if (isPartyMode) return; // Don't count clicks during party mode

    clickCountRef.current += 1;

    // Reset click count after 2 seconds of no clicks
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 2000);

    // Trigger party mode after 7 rapid clicks
    if (clickCountRef.current >= 7) {
      clickCountRef.current = 0;
      startPartyMode();
    }
  }, [isPartyMode, startPartyMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (partyTimeoutRef.current) clearTimeout(partyTimeoutRef.current);
      if (colorIntervalRef.current) clearInterval(colorIntervalRef.current);
    };
  }, []);

  return (
    <main className="min-h-screen bg-ctp-base text-ctp-text flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-12">
        {/* Hero Section with Tile Header */}
        <div className="space-y-6">
          {/* Secret message that appears during party mode */}
          <div className={`h-8 flex items-center justify-center transition-all duration-300 ${secretMessage ? 'opacity-100' : 'opacity-0'}`}>
            <span className="text-ctp-mauve font-bold text-lg animate-pulse">
              {secretMessage}
            </span>
          </div>

          {/* Mobile-friendly tile header - breaks between STRAND and CRAFT on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 md:gap-2 px-2">
            {/* STRAND row */}
            <div className="flex gap-1 sm:gap-1.5 md:gap-2">
              {strandLetters.map((letter, index) => (
                <LetterTile
                  key={`strand-${index}`}
                  letter={letter}
                  color={isPartyMode ? shuffledStrandColors[index] : strandColors[index]}
                  index={index}
                  isPartyMode={isPartyMode}
                  onClick={handleTileClick}
                />
              ))}
            </div>
            {/* CRAFT row */}
            <div className="flex gap-1 sm:gap-1.5 md:gap-2">
              {craftLetters.map((letter, index) => (
                <LetterTile
                  key={`craft-${index}`}
                  letter={letter}
                  color={isPartyMode ? shuffledCraftColors[index] : craftColors[index]}
                  index={index + 6}
                  isPartyMode={isPartyMode}
                  onClick={handleTileClick}
                />
              ))}
            </div>
          </div>
          <p className="text-lg sm:text-xl text-ctp-subtext0">
            Create your own word puzzles
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <Link
            href="/create"
            className="group bg-ctp-surface0 hover:bg-ctp-surface1 rounded-2xl p-8 transition-all duration-200 hover:scale-105 border-2 border-ctp-surface1 hover:border-ctp-blue"
          >
            <div className="space-y-4">
              <EmojiTile emoji="➕" color="bg-ctp-blue" />
              <h2 className="text-2xl font-bold">CREATE A PUZZLE</h2>
              <p className="text-ctp-subtext0">
                Design your own word puzzle and share it with friends
              </p>
            </div>
          </Link>

          <Link
            href="/my-puzzles"
            className="group bg-ctp-surface0 hover:bg-ctp-surface1 rounded-2xl p-8 transition-all duration-200 hover:scale-105 border-2 border-ctp-surface1 hover:border-ctp-yellow"
          >
            <div className="space-y-4">
              <EmojiTile emoji="📝" color="bg-ctp-yellow" />
              <h2 className="text-2xl font-bold">MY PUZZLES</h2>
              <p className="text-ctp-subtext0">
                View and manage your created puzzles
              </p>
            </div>
          </Link>

          <Link
            href="/community"
            className="group bg-ctp-surface0 hover:bg-ctp-surface1 rounded-2xl p-8 transition-all duration-200 hover:scale-105 border-2 border-ctp-surface1 hover:border-ctp-mauve"
          >
            <div className="space-y-4">
              <EmojiTile emoji="🧩" color="bg-ctp-mauve" />
              <h2 className="text-2xl font-bold">COMMUNITY</h2>
              <p className="text-ctp-subtext0">
                Play puzzles created by the community
              </p>
            </div>
          </Link>

          <Link
            href="/how-to-play"
            className="group bg-ctp-surface0 hover:bg-ctp-surface1 rounded-2xl p-8 transition-all duration-200 hover:scale-105 border-2 border-ctp-surface1 hover:border-ctp-green"
          >
            <div className="space-y-4">
              <EmojiTile emoji="▶" color="bg-[#40a02b]" />
              <h2 className="text-2xl font-bold">HOW TO PLAY</h2>
              <p className="text-ctp-subtext0">
                Learn the rules and start solving puzzles
              </p>
            </div>
          </Link>

        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  );
}
