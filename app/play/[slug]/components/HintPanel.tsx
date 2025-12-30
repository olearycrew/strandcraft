'use client';

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
            <h2 className="text-xl font-bold mb-4">Hint System</h2>
            <p className="text-sm text-gray-400 mb-4">
                Find 3 non-theme words to unlock a hint
            </p>

            <div className="mb-4">
                <div className="flex gap-2 mb-2">
                    {[0, 1, 2].map(i => (
                        <div
                            key={i}
                            className={`flex-1 h-2 rounded ${
                                i < progress ? 'bg-yellow-500' : 'bg-gray-700'
                            }`}
                        />
                    ))}
                </div>
                <div className="text-sm text-gray-400">
                    {progress}/3 words found
                </div>
            </div>

            <button
                onClick={onUseHint}
                disabled={!canUseHint}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                    canUseHint
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
                {hasActiveHint ? 'Hint Active' : 'Use Hint'}
            </button>

            {hasActiveHint && (
                <p className="text-sm text-yellow-400 mt-2">
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
