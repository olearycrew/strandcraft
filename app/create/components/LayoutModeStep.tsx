'use client';

type LayoutMode = 'auto' | 'manual';

interface LayoutModeStepProps {
    onSelectMode: (mode: LayoutMode) => void;
    onBack: () => void;
}

export default function LayoutModeStep({
    onSelectMode,
    onBack,
}: LayoutModeStepProps) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Choose Layout Method</h2>

            <div className="grid md:grid-cols-2 gap-6">
                <button
                    onClick={() => onSelectMode('auto')}
                    className="p-6 rounded-lg border-2 border-gray-700 bg-gray-800 hover:border-gray-600 transition-all text-left"
                >
                    <div className="text-4xl mb-3">🎲</div>
                    <h3 className="text-xl font-bold mb-2">Auto Layout</h3>
                    <p className="text-gray-300 text-sm mb-3">
                        Let the algorithm automatically arrange your words in the grid.
                        Quick and easy - just click a button!
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                        <li>✓ Fast and automatic</li>
                        <li>✓ Can shuffle for different layouts</li>
                        <li>✓ Ensures valid word placement</li>
                        <li>✓ Can manually adjust after</li>
                    </ul>
                </button>

                <button
                    onClick={() => onSelectMode('manual')}
                    className="p-6 rounded-lg border-2 border-gray-700 bg-gray-800 hover:border-gray-600 transition-all text-left"
                >
                    <div className="text-4xl mb-3">✏️</div>
                    <h3 className="text-xl font-bold mb-2">Manual Layout</h3>
                    <p className="text-gray-300 text-sm mb-3">
                        Draw your own paths by clicking cells in the grid.
                        Full creative control over word placement!
                    </p>
                    <ul className="text-sm text-gray-400 space-y-1">
                        <li>✓ Complete control</li>
                        <li>✓ Create custom patterns</li>
                        <li>✓ Draw paths cell by cell</li>
                        <li>✓ Perfect for specific designs</li>
                    </ul>
                </button>
            </div>

            <div className="flex gap-4">
                <button
                    onClick={onBack}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    ← Back
                </button>
            </div>
        </div>
    );
}
