'use client';

interface WordsStepProps {
    spangramWord: string;
    themeWords: string[];
    onSpangramChange: (value: string) => void;
    onThemeWordChange: (index: number, value: string) => void;
    onAddThemeWord: () => void;
    onRemoveThemeWord: (index: number) => void;
    onBack: () => void;
    onContinue: () => void;
}

export default function WordsStep({
    spangramWord,
    themeWords,
    onSpangramChange,
    onThemeWordChange,
    onAddThemeWord,
    onRemoveThemeWord,
    onBack,
    onContinue,
}: WordsStepProps) {
    const getTotalLetters = () => {
        const spangram = spangramWord.length;
        const themes = themeWords.filter(w => w.trim()).reduce((sum, w) => sum + w.length, 0);
        return spangram + themes;
    };

    const getLetterCountStatus = () => {
        const total = getTotalLetters();
        if (total === 0) return { text: 'Enter words to see letter count', color: 'text-gray-400' };
        if (total < 48) return { text: `Need ${48 - total} more letters`, color: 'text-yellow-400' };
        if (total > 48) return { text: `${total - 48} too many letters`, color: 'text-red-400' };
        return { text: 'Perfect! 48 letters', color: 'text-green-400' };
    };

    const letterCountStatus = getLetterCountStatus();

    return (
        <div className="space-y-6">
            <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold">Letter Count</h3>
                    <span className={`text-lg font-bold ${letterCountStatus.color}`}>
                        {getTotalLetters()} / 48
                    </span>
                </div>
                <p className={`text-sm ${letterCountStatus.color}`}>
                    {letterCountStatus.text}
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">
                    Spangram (theme word that spans the grid)
                </label>
                <input
                    type="text"
                    value={spangramWord}
                    onChange={(e) => onSpangramChange(e.target.value.toUpperCase())}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., BEACHGOING"
                    maxLength={20}
                />
                <p className="text-sm text-gray-400 mt-1">
                    {spangramWord.length} letters
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Theme Words</label>
                {themeWords.map((word, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={word}
                            onChange={(e) => onThemeWordChange(index, e.target.value)}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                            placeholder={`Theme word ${index + 1}`}
                        />
                        <span className="flex items-center text-sm text-gray-400 min-w-[60px]">
                            {word.length} letters
                        </span>
                        {themeWords.length > 1 && (
                            <button
                                onClick={() => onRemoveThemeWord(index)}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={onAddThemeWord}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mt-2"
                >
                    + Add Theme Word
                </button>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    ← Back
                </button>
                <button
                    onClick={onContinue}
                    disabled={getTotalLetters() !== 48 || !spangramWord || themeWords.filter(w => w.trim()).length === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    Continue →
                </button>
            </div>
        </div>
    );
}
