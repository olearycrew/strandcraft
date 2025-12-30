'use client';

import type { FoundWord } from './types';

interface FoundWordsListProps {
    foundWords: FoundWord[];
    totalWords: number;
}

export default function FoundWordsList({ foundWords, totalWords }: FoundWordsListProps) {
    return (
        <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4">
                Found Words ({foundWords.length}/{totalWords})
            </h2>
            <div className="space-y-2">
                {foundWords.map((found, index) => (
                    <div
                        key={index}
                        className={`p-2 rounded ${
                            found.type === 'spangram' ? 'bg-yellow-600' : 'bg-blue-700'
                        }`}
                    >
                        <div className="font-bold">{found.word}</div>
                        {found.type === 'spangram' && (
                            <div className="text-xs text-yellow-200">Spangram!</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
