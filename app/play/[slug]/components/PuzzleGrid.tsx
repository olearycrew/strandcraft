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
    const base = 'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold rounded cursor-pointer transition-all select-none';

    switch (state) {
        case 'selected':
            return `${base} bg-blue-500 text-white scale-105`;
        case 'hint':
            return `${base} bg-gray-700 text-white border-2 border-dashed border-yellow-400`;
        case 'found-spangram':
            return `${base} bg-yellow-600 text-white`;
        case 'found-theme':
            return `${base} bg-blue-700 text-white`;
        default:
            return `${base} bg-gray-700 hover:bg-gray-600 text-white`;
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

    return (
        <div className="mb-8 flex justify-center">
            <div className="relative inline-block">
                <div
                    className="inline-grid gap-1 bg-gray-800 p-4 rounded-lg"
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
                    {foundWords.map((found, wordIndex) => {
                        const elements = [];
                        const color = found.type === 'spangram' ? '#fbbf24' : '#93c5fd';

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
                                    strokeWidth="2.5"
                                    strokeOpacity="0.5"
                                    strokeLinecap="round"
                                />
                            );
                        }

                        for (let i = 0; i < found.path.length; i++) {
                            const coord = found.path[i];
                            const x = padding + coord.col * (cellSize + gap) + cellSize / 2;
                            const y = padding + coord.row * (cellSize + gap) + cellSize / 2;

                            elements.push(
                                <circle
                                    key={`circle-${wordIndex}-${i}`}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill={color}
                                    opacity="0.6"
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
