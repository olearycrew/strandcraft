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
        <div className="bg-ctp-surface0 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2 text-ctp-text">Hint System</h2>
            <p className="text-sm text-ctp-subtext0 mb-4">
                Find 3 non-theme words to unlock a hint
            </p>

            <ProgressButton
                progress={progress}
                onClick={onUseHint}
                isActive={hasActiveHint}
            />

            {hasActiveHint && (
                <p className="text-sm text-ctp-yellow mt-3">
                    A word is highlighted on the grid!
                </p>
            )}

            {hintsUsed > 0 && (
                <p className="text-xs text-ctp-overlay0 mt-2">
                    Hints used: {hintsUsed}
                </p>
            )}
        </div>
    );
}
