'use client';

import type { FoundWord } from './types';

interface FoundWordsListProps {
    foundWords: FoundWord[];
    totalWords: number;
}

export default function FoundWordsList({ foundWords, totalWords }: FoundWordsListProps) {
    return (
        <div className="bg-ctp-surface0 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-ctp-text">
                Found Words ({foundWords.length}/{totalWords})
            </h2>
            <div className="space-y-2">
                {foundWords.map((found, index) => (
                    <div
                        key={index}
                        className={`p-2 rounded ${
                            found.type === 'spangram' ? 'bg-ctp-yellow text-ctp-base' : 'bg-ctp-blue text-ctp-base'
                        }`}
                    >
                        <div className="font-bold">{found.word}</div>
                        {found.type === 'spangram' && (
                            <div className="text-xs opacity-80">Spangram!</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
