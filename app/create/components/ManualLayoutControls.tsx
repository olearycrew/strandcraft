'use client';

import type { Coordinate } from '@/types/puzzle';

interface ManualLayoutControlsProps {
    spangramWord: string;
    themeWords: string[];
    spangramPath: Coordinate[];
    themeWordPaths: Coordinate[][];
    currentWordIndex: number;
    currentPath: Coordinate[];
    isDrawing: boolean;
    onStartDrawing: (wordIndex: number) => void;
    onFinishDrawing: () => void;
    onCancelDrawing: () => void;
    onClearWord: (wordIndex: number) => void;
    onClearAll: () => void;
}

const getWordColor = (wordIndex: number): string => {
    const colorMap = [
        'text-yellow-400',    // Spangram
        'text-blue-400',      // Theme word 1
        'text-purple-400',    // Theme word 2
        'text-pink-400',      // Theme word 3
        'text-green-400',     // Theme word 4
        'text-orange-400',    // Theme word 5
        'text-cyan-400',      // Theme word 6
        'text-red-400',       // Theme word 7
        'text-indigo-400',    // Theme word 8
    ];
    return colorMap[wordIndex % colorMap.length];
};

export default function ManualLayoutControls({
    spangramWord,
    themeWords,
    spangramPath,
    themeWordPaths,
    currentWordIndex,
    currentPath,
    isDrawing,
    onStartDrawing,
    onFinishDrawing,
    onCancelDrawing,
    onClearWord,
    onClearAll,
}: ManualLayoutControlsProps) {
    const validThemeWords = themeWords.filter(w => w.trim());
    const hasAnyWords = spangramPath.length > 0 || themeWordPaths.some(path => path && path.length > 0);

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Draw Word Paths</h3>
                {hasAnyWords && !isDrawing && (
                    <button
                        onClick={onClearAll}
                        className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-1 rounded"
                    >
                        Clear All
                    </button>
                )}
            </div>
            <div className="space-y-2">
                {/* Spangram */}
                <div className="flex items-center gap-3">
                    <div className="flex-1">
                        <span className={`font-bold ${getWordColor(0)}`}>
                            Spangram: {spangramWord}
                        </span>
                        <span className="text-sm text-gray-400 ml-2">
                            ({spangramWord.length} cells)
                        </span>
                    </div>
                    {spangramPath.length > 0 ? (
                        <div className="flex gap-2">
                            <span className="text-green-400 text-sm">✓ Complete</span>
                            <button
                                onClick={() => onClearWord(0)}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                Clear
                            </button>
                        </div>
                    ) : isDrawing && currentWordIndex === 0 ? (
                        <div className="flex gap-2">
                            <span className="text-blue-400 text-sm">
                                Drawing... ({currentPath.length}/{spangramWord.length})
                            </span>
                            <button
                                onClick={onFinishDrawing}
                                disabled={currentPath.length !== spangramWord.length}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                            >
                                Finish
                            </button>
                            <button
                                onClick={onCancelDrawing}
                                className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => onStartDrawing(0)}
                            disabled={isDrawing}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-4 py-1 rounded"
                        >
                            Draw
                        </button>
                    )}
                </div>

                {/* Theme Words */}
                {validThemeWords.map((word, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="flex-1">
                            <span className={`font-bold ${getWordColor(i + 1)}`}>
                                Word {i + 1}: {word}
                            </span>
                            <span className="text-sm text-gray-400 ml-2">
                                ({word.length} cells)
                            </span>
                        </div>
                        {themeWordPaths[i] && themeWordPaths[i].length > 0 ? (
                            <div className="flex gap-2">
                                <span className="text-green-400 text-sm">✓ Complete</span>
                                <button
                                    onClick={() => onClearWord(i + 1)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                >
                                    Clear
                                </button>
                            </div>
                        ) : isDrawing && currentWordIndex === i + 1 ? (
                            <div className="flex gap-2">
                                <span className="text-blue-400 text-sm">
                                    Drawing... ({currentPath.length}/{word.length})
                                </span>
                                <button
                                    onClick={onFinishDrawing}
                                    disabled={currentPath.length !== word.length}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                                >
                                    Finish
                                </button>
                                <button
                                    onClick={onCancelDrawing}
                                    className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => onStartDrawing(i + 1)}
                                disabled={isDrawing}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm px-4 py-1 rounded"
                            >
                                Draw
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
