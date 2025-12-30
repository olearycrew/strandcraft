'use client';

interface WordInputProps {
    currentWord: string;
    onSubmit: () => void;
    onClear: () => void;
}

export default function WordInput({ currentWord, onSubmit, onClear }: WordInputProps) {
    if (!currentWord) return null;

    return (
        <div className="flex justify-center">
            <div className="bg-ctp-surface0 rounded-lg p-4 flex items-center gap-4">
                <div className="text-2xl font-bold text-ctp-text">{currentWord}</div>
                <button
                    onClick={onSubmit}
                    className="bg-ctp-green hover:bg-ctp-green/80 text-ctp-base font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Submit
                </button>
                <button
                    onClick={onClear}
                    className="bg-ctp-red hover:bg-ctp-red/80 text-ctp-base font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
