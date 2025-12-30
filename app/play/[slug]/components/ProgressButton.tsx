'use client';

interface ProgressButtonProps {
    progress: number; // 0, 1, 2, or 3
    onClick: () => void;
    isActive?: boolean;
}

export default function ProgressButton({
    progress,
    onClick,
    isActive = false,
}: ProgressButtonProps) {
    const fillPercentage = (progress / 3) * 100;
    const isReady = progress >= 3;

    const getButtonText = () => {
        if (isActive) return 'Hint Active';
        if (progress === 0) return 'Find 3 words...';
        if (progress === 1) return '2 more words...';
        if (progress === 2) return '1 more word...';
        return 'Use Hint';
    };

    return (
        <button
            onClick={onClick}
            disabled={!isReady || isActive}
            className={`
                relative w-full py-3 px-4 rounded-lg font-semibold
                overflow-hidden transition-all duration-300 bg-ctp-surface1
                ${isReady && !isActive
                    ? 'cursor-pointer hover:brightness-110'
                    : 'cursor-not-allowed'
                }
            `}
        >
            {/* Progress fill layer */}
            <div
                className={`absolute inset-0 transition-all duration-500 ease-out ${
                    isReady ? 'bg-ctp-yellow' : 'bg-ctp-yellow/70'
                }`}
                style={{ width: `${fillPercentage}%` }}
            />

            {/* Text layer (above fill) */}
            <span
                className={`
                    relative z-10 transition-colors duration-300
                    ${isReady ? 'text-ctp-base' : 'text-ctp-subtext0'}
                `}
            >
                {getButtonText()}
            </span>
        </button>
    );
}
