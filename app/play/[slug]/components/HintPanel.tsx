'use client';

import ProgressButton from './ProgressButton';

interface HintPanelProps {
    enabled: boolean;
    progress: number;
    canUseHint: boolean;
    hasActiveHint: boolean;
    hintsUsed: number;
    onUseHint: () => void;
}

export default function HintPanel({
    enabled,
    progress,
    canUseHint,
    hasActiveHint,
    hintsUsed,
    onUseHint,
}: HintPanelProps) {
    if (!enabled) return null;

    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2">Hint System</h2>
            <p className="text-sm text-gray-400 mb-4">
                Find 3 non-theme words to unlock a hint
            </p>

            {/* Combined progress + button */}
            <ProgressButton
                progress={progress}
                onClick={onUseHint}
                isActive={hasActiveHint}
            />

            {hasActiveHint && (
                <p className="text-sm text-yellow-400 mt-3">
                    A word is highlighted on the grid!
                </p>
            )}

            {hintsUsed > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                    Hints used: {hintsUsed}
                </p>
            )}
        </div>
    );
}
