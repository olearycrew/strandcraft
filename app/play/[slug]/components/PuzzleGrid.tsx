'use client';

import { useEffect, useState } from 'react';
import type { Coordinate } from '@/types/puzzle';
import { GRID_ROWS, GRID_COLS } from '@/lib/utils/grid';
import type { FoundWord, CellState } from './types';

interface PuzzleGridProps {
    gridLetters: string;
    currentPath: Coordinate[];
    foundWords: FoundWord[];
    hintPath: Coordinate[] | null;
    onCellClick: (row: number, col: number) => void;
}

function getCellClassName(state: CellState): string {
    const base = 'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold rounded-full cursor-pointer transition-all select-none relative z-10';

    switch (state) {
        case 'selected':
            return `${base} bg-transparent text-ctp-crust`;
        case 'hint':
            return `${base} bg-transparent text-ctp-text border-2 border-dashed border-ctp-yellow`;
        case 'found-spangram':
            return `${base} bg-transparent text-ctp-crust`;
        case 'found-theme':
            return `${base} bg-transparent text-ctp-crust`;
        default:
            return `${base} bg-transparent text-ctp-subtext0 hover:text-ctp-text`;
    }
}

export default function PuzzleGrid({
    gridLetters,
    currentPath,
    foundWords,
    hintPath,
    onCellClick,
}: PuzzleGridProps) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getCellState = (row: number, col: number): CellState => {
        const inCurrentPath = currentPath.some(c => c.row === row && c.col === col);
        if (inCurrentPath) return 'selected';

        if (hintPath) {
            const inHintPath = hintPath.some(c => c.row === row && c.col === col);
            if (inHintPath) return 'hint';
        }

        for (const found of foundWords) {
            const inFoundPath = found.path.some(c => c.row === row && c.col === col);
            if (inFoundPath) {
                return found.type === 'spangram' ? 'found-spangram' : 'found-theme';
            }
        }

        return 'default';
    };

    const cellSize = isMobile ? 48 : 56;
    const gap = 4;
    const padding = 16;

    // Catppuccin Mocha colors for SVG (using sapphire and peach for better visibility)
    const BLUE = '#74c7ec';   // sapphire - more vibrant than blue
    const YELLOW = '#fab387'; // peach - more visible than yellow

    return (
        <div className="mb-8 flex justify-center">
            <div className="relative inline-block">
                <div
                    className="inline-grid gap-1 bg-ctp-surface0 p-4 rounded-lg"
                    style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, index) => {
                        const row = Math.floor(index / GRID_COLS);
                        const col = index % GRID_COLS;
                        const letter = gridLetters[index];
                        const state = getCellState(row, col);

                        return (
                            <div
                                key={index}
                                className={getCellClassName(state)}
                                onClick={() => onCellClick(row, col)}
                            >
                                {letter}
                            </div>
                        );
                    })}
                </div>
                <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ overflow: 'visible' }}
                >
                    {/* Current selection path - lines first, then circles on top */}
                    {currentPath.length > 0 && (
                        <>
                            {/* Connecting lines for current selection */}
                            {currentPath.slice(0, -1).map((from, i) => {
                                const to = currentPath[i + 1];
                                const fromX = padding + from.col * (cellSize + gap) + cellSize / 2;
                                const fromY = padding + from.row * (cellSize + gap) + cellSize / 2;
                                const toX = padding + to.col * (cellSize + gap) + cellSize / 2;
                                const toY = padding + to.row * (cellSize + gap) + cellSize / 2;
                                return (
                                    <line
                                        key={`current-line-${i}`}
                                        x1={fromX}
                                        y1={fromY}
                                        x2={toX}
                                        y2={toY}
                                        stroke={BLUE}
                                        strokeWidth={cellSize * 0.35}
                                        strokeLinecap="round"
                                    />
                                );
                            })}

                            {/* Circular backgrounds for current selection */}
                            {currentPath.map((coord, i) => {
                                const x = padding + coord.col * (cellSize + gap) + cellSize / 2;
                                const y = padding + coord.row * (cellSize + gap) + cellSize / 2;
                                return (
                                    <circle
                                        key={`current-circle-${i}`}
                                        cx={x}
                                        cy={y}
                                        r={cellSize / 2}
                                        fill={BLUE}
                                    />
                                );
                            })}
                        </>
                    )}

                    {foundWords.map((found, wordIndex) => {
                        const elements = [];
                        const color = found.type === 'spangram' ? YELLOW : BLUE;

                        // Draw connecting lines first (behind circles)
                        for (let i = 0; i < found.path.length - 1; i++) {
                            const from = found.path[i];
                            const to = found.path[i + 1];

                            const fromX = padding + from.col * (cellSize + gap) + cellSize / 2;
                            const fromY = padding + from.row * (cellSize + gap) + cellSize / 2;
                            const toX = padding + to.col * (cellSize + gap) + cellSize / 2;
                            const toY = padding + to.row * (cellSize + gap) + cellSize / 2;

                            elements.push(
                                <line
                                    key={`line-${wordIndex}-${i}`}
                                    x1={fromX}
                                    y1={fromY}
                                    x2={toX}
                                    y2={toY}
                                    stroke={color}
                                    strokeWidth={cellSize * 0.35}
                                    strokeLinecap="round"
                                />
                            );
                        }

                        // Draw large circular backgrounds on top of lines
                        for (let i = 0; i < found.path.length; i++) {
                            const coord = found.path[i];
                            const x = padding + coord.col * (cellSize + gap) + cellSize / 2;
                            const y = padding + coord.row * (cellSize + gap) + cellSize / 2;

                            elements.push(
                                <circle
                                    key={`circle-${wordIndex}-${i}`}
                                    cx={x}
                                    cy={y}
                                    r={cellSize / 2}
                                    fill={color}
                                />
                            );
                        }

                        return elements;
                    })}
                </svg>
            </div>
        </div>
    );
}
