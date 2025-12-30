'use client';

interface MetadataStepProps {
    title: string;
    author: string;
    themeClue: string;
    onTitleChange: (value: string) => void;
    onAuthorChange: (value: string) => void;
    onThemeClueChange: (value: string) => void;
    onContinue: () => void;
}

export default function MetadataStep({
    title,
    author,
    themeClue,
    onTitleChange,
    onAuthorChange,
    onThemeClueChange,
    onContinue,
}: MetadataStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium mb-2">Puzzle Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Beach Day"
                    maxLength={100}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Author Name</label>
                <input
                    type="text"
                    value={author}
                    onChange={(e) => onAuthorChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Your name"
                    maxLength={50}
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Theme Clue</label>
                <input
                    type="text"
                    value={themeClue}
                    onChange={(e) => onThemeClueChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Hitting the sandy shores"
                    maxLength={200}
                />
            </div>

            <button
                onClick={onContinue}
                disabled={!title || !author || !themeClue}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
                Continue →
            </button>
        </div>
    );
}
