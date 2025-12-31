import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Catppuccin Mocha colors used in the app
const colors = {
    base: '#1e1e2e',
    mantle: '#181825',
    crust: '#11111b',
    text: '#cdd6f4',
    subtext0: '#a6adc8',
    surface0: '#313244',
    yellow: '#f9e2af',
    blue: '#89b4fa',
    mauve: '#cba6f7',
    pink: '#f5c2e7',
    green: '#a6e3a1',
    peach: '#fab387',
    teal: '#94e2d5',
};

// Letter colors matching the Header component
const strandColors = [colors.yellow, colors.blue, colors.mauve, colors.pink, colors.green, colors.peach];
const craftColors = [colors.teal, colors.blue, colors.mauve, colors.pink, colors.green];

function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function LetterTile({ letter, color }: { letter: string; color: string }) {
    return (
        <div
            style={{
                width: 48,
                height: 48,
                backgroundColor: color,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.crust,
                fontSize: 28,
                fontWeight: 'bold',
            }}
        >
            {letter}
        </div>
    );
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch puzzle data from the API endpoint
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
                'http://localhost:3000');

        const apiUrl = `${baseUrl}/api/puzzles/${slug}`;

        let puzzle;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                return new Response('Puzzle not found', { status: 404 });
            }
            const data = await response.json();
            puzzle = data.puzzle;
        } catch (fetchError) {
            console.error('Error fetching puzzle:', fetchError);
            return new Response('Error fetching puzzle data', { status: 500 });
        }

        if (!puzzle) {
            return new Response('Puzzle not found', { status: 404 });
        }

        // Prepare text content
        const title = truncateText(puzzle.title || 'Untitled Puzzle', 50);
        const clue = truncateText(puzzle.themeClue || '', 80);
        const author = truncateText(puzzle.author || 'Anonymous', 30);

        const strandLetters = 'STRAND'.split('');
        const craftLetters = 'CRAFT'.split('');

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        background: `linear-gradient(135deg, ${colors.crust} 0%, ${colors.base} 100%)`,
                        padding: '0',
                    }}
                >
                    {/* Top accent line */}
                    <div
                        style={{
                            width: '100%',
                            height: 4,
                            backgroundColor: colors.teal,
                        }}
                    />

                    {/* Main content area */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flex: 1,
                            padding: '40px 60px',
                            width: '100%',
                        }}
                    >
                        {/* STRANDCRAFT Logo */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 6,
                                marginBottom: 50,
                            }}
                        >
                            {/* STRAND letters */}
                            {strandLetters.map((letter, i) => (
                                <LetterTile key={`s-${i}`} letter={letter} color={strandColors[i]} />
                            ))}
                            {/* Gap between STRAND and CRAFT */}
                            <div style={{ width: 12 }} />
                            {/* CRAFT letters */}
                            {craftLetters.map((letter, i) => (
                                <LetterTile key={`c-${i}`} letter={letter} color={craftColors[i]} />
                            ))}
                        </div>

                        {/* Puzzle Title */}
                        <div
                            style={{
                                fontSize: 52,
                                fontWeight: 'bold',
                                color: colors.text,
                                textAlign: 'center',
                                marginBottom: 30,
                                maxWidth: '90%',
                                lineHeight: 1.2,
                            }}
                        >
                            &ldquo;{title}&rdquo;
                        </div>

                        {/* Theme Clue Label */}
                        <div
                            style={{
                                fontSize: 18,
                                fontWeight: 'bold',
                                color: colors.teal,
                                letterSpacing: '3px',
                                marginBottom: 12,
                            }}
                        >
                            THEME CLUE
                        </div>

                        {/* Theme Clue */}
                        <div
                            style={{
                                fontSize: 28,
                                color: colors.subtext0,
                                textAlign: 'center',
                                maxWidth: '85%',
                                marginBottom: 30,
                            }}
                        >
                            {clue}
                        </div>

                        {/* Author */}
                        <div
                            style={{
                                fontSize: 22,
                                color: colors.surface0,
                            }}
                        >
                            by {author}
                        </div>
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            width: '100%',
                            height: 70,
                            backgroundColor: colors.mantle,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}
                    >
                        {/* Left accent */}
                        <div
                            style={{
                                position: 'absolute',
                                left: 40,
                                top: 0,
                                width: 60,
                                height: 4,
                                backgroundColor: colors.green,
                            }}
                        />
                        {/* Right accent */}
                        <div
                            style={{
                                position: 'absolute',
                                right: 40,
                                top: 0,
                                width: 60,
                                height: 4,
                                backgroundColor: colors.green,
                            }}
                        />
                        <div
                            style={{
                                fontSize: 22,
                                fontWeight: 'bold',
                                color: colors.subtext0,
                            }}
                        >
                            strandcraft.app
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (error) {
        console.error('Error generating OG image:', error);
        return new Response(`Failed to generate image: ${error}`, { status: 500 });
    }
}
