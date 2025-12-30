'use client';

import type { Coordinate } from '@/types/puzzle';
import GridRenderer from './GridRenderer';
import ManualLayoutControls from './ManualLayoutControls';

type LayoutMode = 'auto' | 'manual';

interface GridStepProps {
    layoutMode: LayoutMode;
    gridLetters: string;
    spangramWord: string;
    spangramPath: Coordinate[];
    themeWords: string[];
    themeWordPaths: Coordinate[][];
    currentWordIndex: number;
    currentPath: Coordinate[];
    isDrawing: boolean;
    loading: boolean;
    onAutoLayout: () => void;
    onCellClick: (row: number, col: number) => void;
    onCellChange: (index: number, letter: string) => void;
    onStartDrawing: (wordIndex: number) => void;
    onFinishDrawing: () => void;
    onCancelDrawing: () => void;
    onClearWord: (wordIndex: number) => void;
    onClearAll: () => void;
    onBack: () => void;
    onPublish: () => void;
}

export default function GridStep({
    layoutMode,
    gridLetters,
    spangramWord,
    spangramPath,
    themeWords,
    themeWordPaths,
    currentWordIndex,
    currentPath,
    isDrawing,
    loading,
    onAutoLayout,
    onCellClick,
    onCellChange,
    onStartDrawing,
    onFinishDrawing,
    onCancelDrawing,
    onClearWord,
    onClearAll,
    onBack,
    onPublish,
}: GridStepProps) {
    const currentWord = currentWordIndex === 0 ? spangramWord : themeWords[currentWordIndex - 1];

    return (
        <div className="space-y-6">
            {layoutMode === 'auto' && (
                <>
                    <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
                        <h3 className="font-bold mb-2">💡 Auto Layout Mode</h3>
                        <p className="text-sm text-gray-300">
                            Click "Auto-Layout" to automatically arrange your words in the grid.
                            Don't like the layout? Click again to shuffle and get a different arrangement!
                        </p>
                    </div>

                    <button
                        onClick={onAutoLayout}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        🎲 {gridLetters.trim() ? 'Shuffle Layout' : 'Auto-Layout'}
                    </button>
                </>
            )}

            {layoutMode === 'manual' && (
                <>
                    <div className="bg-purple-900/30 border border-purple-500 rounded-lg p-4">
                        <h3 className="font-bold mb-2">✏️ Manual Layout Mode</h3>
                        <p className="text-sm text-gray-300 mb-3">
                            Draw paths for each word by clicking cells in the grid.
                            Cells must be adjacent (including diagonally).
                        </p>
                        <p className="text-xs text-gray-400">
                            Tip: Click on an earlier cell in your path to backtrack.
                        </p>
                    </div>

                    <ManualLayoutControls
                        spangramWord={spangramWord}
                        themeWords={themeWords}
                        spangramPath={spangramPath}
                        themeWordPaths={themeWordPaths}
                        currentWordIndex={currentWordIndex}
                        currentPath={currentPath}
                        isDrawing={isDrawing}
                        onStartDrawing={onStartDrawing}
                        onFinishDrawing={onFinishDrawing}
                        onCancelDrawing={onCancelDrawing}
                        onClearWord={onClearWord}
                        onClearAll={onClearAll}
                    />
                </>
            )}

            {(gridLetters || layoutMode === 'manual') && (
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-bold mb-3">Grid Preview</h3>
                    <GridRenderer
                        gridLetters={gridLetters}
                        spangramPath={spangramPath}
                        themeWordPaths={themeWordPaths}
                        currentPath={currentPath}
                        isDrawing={isDrawing}
                        layoutMode={layoutMode}
                        currentWord={currentWord}
                        onCellClick={onCellClick}
                        onCellChange={onCellChange}
                    />
                </div>
            )}

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    ← Back
                </button>
                <button
                    onClick={onPublish}
                    disabled={loading || !gridLetters || gridLetters.length !== 48}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    {loading ? 'Publishing...' : 'Publish Puzzle'}
                </button>
            </div>
        </div>
    );
}
