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
            <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-4">
                <div className="text-2xl font-bold">{currentWord}</div>
                <button
                    onClick={onSubmit}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    Submit
                </button>
                <button
                    onClick={onClear}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}
