'use client';

import type { Coordinate } from '@/types/puzzle';
import { GRID_ROWS, GRID_COLS, coordToIndex } from '@/lib/utils/grid';

interface GridRendererProps {
    gridLetters: string;
    spangramPath: Coordinate[];
    themeWordPaths: Coordinate[][];
    currentPath: Coordinate[];
    isDrawing: boolean;
    layoutMode: 'auto' | 'manual';
    currentWord?: string;
    onCellClick: (row: number, col: number) => void;
    onCellChange: (index: number, letter: string) => void;
}

const wordColors = [
    'bg-yellow-600 border-yellow-500',    // Spangram
    'bg-blue-600 border-blue-500',        // Theme word 1
    'bg-purple-600 border-purple-500',    // Theme word 2
    'bg-pink-600 border-pink-500',        // Theme word 3
    'bg-green-600 border-green-500',      // Theme word 4
    'bg-orange-600 border-orange-500',    // Theme word 5
    'bg-cyan-600 border-cyan-500',        // Theme word 6
    'bg-red-600 border-red-500',          // Theme word 7
    'bg-indigo-600 border-indigo-500',    // Theme word 8
];

export default function GridRenderer({
    gridLetters,
    spangramPath,
    themeWordPaths,
    currentPath,
    isDrawing,
    layoutMode,
    currentWord,
    onCellClick,
    onCellChange,
}: GridRendererProps) {
    const getCellHighlight = (row: number, col: number): string => {
        const index = coordToIndex({ row, col });

        // Check if in spangram path
        if (spangramPath.some(c => coordToIndex(c) === index)) {
            return wordColors[0];
        }

        // Check if in any theme word path
        for (let i = 0; i < themeWordPaths.length; i++) {
            if (themeWordPaths[i] && themeWordPaths[i].some(c => coordToIndex(c) === index)) {
                return wordColors[(i + 1) % wordColors.length];
            }
        }

        // In manual mode, make empty cells more visible with a lighter background
        if (layoutMode === 'manual') {
            return 'bg-gray-600 border-gray-500 hover:bg-gray-500';
        }

        return 'bg-gray-700 border-gray-600';
    };

    // Helper function to get the display letter for a cell
    const getCellLetter = (index: number): string => {
        // If we're actively drawing and this cell is in the current path, show the preview letter
        if (layoutMode === 'manual' && isDrawing && currentWord) {
            const pathIndex = currentPath.findIndex(c => coordToIndex(c) === index);
            if (pathIndex !== -1 && pathIndex < currentWord.length) {
                return currentWord[pathIndex];
            }
        }

        // Otherwise, if there's already a letter in the grid, show it
        if (gridLetters[index] && gridLetters[index] !== ' ') {
            return gridLetters[index];
        }

        return '';
    };

    return (
        <div className="inline-block relative">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))` }}>
                {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, index) => {
                    const row = Math.floor(index / GRID_COLS);
                    const col = index % GRID_COLS;
                    const highlight = getCellHighlight(row, col);
                    const isInCurrentPath = layoutMode === 'manual' && isDrawing &&
                        currentPath.some(c => coordToIndex(c) === index);
                    const currentPathHighlight = isInCurrentPath ? 'ring-4 ring-white' : '';

                    return (
                        <input
                            key={index}
                            type="text"
                            maxLength={1}
                            value={getCellLetter(index)}
                            onChange={(e) => onCellChange(index, e.target.value)}
                            onClick={() => onCellClick(row, col)}
                            readOnly={layoutMode === 'manual'}
                            className={`w-12 h-12 ${highlight} border-2 rounded text-center text-xl font-bold uppercase focus:outline-none focus:ring-2 focus:ring-white ${currentPathHighlight} ${layoutMode === 'manual' && isDrawing ? 'cursor-pointer' : ''}`}
                        />
                    );
                })}
            </div>
            {/* SVG overlay for connecting lines and circles */}
            <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ overflow: 'visible' }}
            >
                {/* Draw spangram path */}
                {spangramPath.length > 0 && (() => {
                    const elements = [];
                    const cellSize = 48;
                    const gap = 4;
                    const color = '#fbbf24';

                    for (let i = 0; i < spangramPath.length - 1; i++) {
                        const from = spangramPath[i];
                        const to = spangramPath[i + 1];
                        const fromX = from.col * (cellSize + gap) + cellSize / 2;
                        const fromY = from.row * (cellSize + gap) + cellSize / 2;
                        const toX = to.col * (cellSize + gap) + cellSize / 2;
                        const toY = to.row * (cellSize + gap) + cellSize / 2;

                        elements.push(
                            <line
                                key={`spangram-line-${i}`}
                                x1={fromX}
                                y1={fromY}
                                x2={toX}
                                y2={toY}
                                stroke={color}
                                strokeWidth="2"
                                strokeOpacity="0.5"
                                strokeLinecap="round"
                            />
                        );
                    }

                    for (let i = 0; i < spangramPath.length; i++) {
                        const coord = spangramPath[i];
                        const x = coord.col * (cellSize + gap) + cellSize / 2;
                        const y = coord.row * (cellSize + gap) + cellSize / 2;

                        elements.push(
                            <circle
                                key={`spangram-circle-${i}`}
                                cx={x}
                                cy={y}
                                r="3.5"
                                fill={color}
                                opacity="0.6"
                            />
                        );
                    }

                    return elements;
                })()}

                {/* Draw theme word paths */}
                {themeWordPaths.map((path, wordIndex) => {
                    if (!path || path.length === 0) return null;

                    const elements = [];
                    const cellSize = 48;
                    const gap = 4;
                    const colors = ['#93c5fd', '#d8b4fe', '#f9a8d4', '#86efac', '#fdba74', '#67e8f9', '#fca5a5', '#a5b4fc'];
                    const color = colors[wordIndex % colors.length];

                    for (let i = 0; i < path.length - 1; i++) {
                        const from = path[i];
                        const to = path[i + 1];
                        const fromX = from.col * (cellSize + gap) + cellSize / 2;
                        const fromY = from.row * (cellSize + gap) + cellSize / 2;
                        const toX = to.col * (cellSize + gap) + cellSize / 2;
                        const toY = to.row * (cellSize + gap) + cellSize / 2;

                        elements.push(
                            <line
                                key={`word-${wordIndex}-line-${i}`}
                                x1={fromX}
                                y1={fromY}
                                x2={toX}
                                y2={toY}
                                stroke={color}
                                strokeWidth="2"
                                strokeOpacity="0.5"
                                strokeLinecap="round"
                            />
                        );
                    }

                    for (let i = 0; i < path.length; i++) {
                        const coord = path[i];
                        const x = coord.col * (cellSize + gap) + cellSize / 2;
                        const y = coord.row * (cellSize + gap) + cellSize / 2;

                        elements.push(
                            <circle
                                key={`word-${wordIndex}-circle-${i}`}
                                cx={x}
                                cy={y}
                                r="3.5"
                                fill={color}
                                opacity="0.6"
                            />
                        );
                    }

                    return elements;
                })}
            </svg>
        </div>
    );
}
