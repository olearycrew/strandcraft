import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch puzzle data from the API endpoint
        // This works in edge runtime since it's just an HTTP request
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` :
            'http://localhost:3000';

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

        // STRANDCRAFT letters with yellow indices for spangram pattern
        const letters = 'STRANDCRAFT'.split('');
        const yellowIndices = [2, 4, 7, 10]; // R, N, R, T positions (spangram pattern)

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#0a0a0a',
                        padding: '60px',
                    }}
                >
                    {/* Title */}
                    <div
                        style={{
                            fontSize: 56,
                            fontWeight: 'bold',
                            color: 'white',
                            marginBottom: 16,
                            textAlign: 'center',
                            maxWidth: '90%',
                        }}
                    >
                        "{puzzle.title}"
                    </div>

                    {/* Author */}
                    <div
                        style={{
                            fontSize: 28,
                            color: '#888',
                            marginBottom: 60,
                        }}
                    >
                        by {puzzle.author}
                    </div>

                    {/* Letter squares */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 10,
                            marginBottom: 60,
                        }}
                    >
                        {letters.map((letter, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 64,
                                    height: 64,
                                    background: yellowIndices.includes(i) ? '#EAB308' : '#3B82F6',
                                    borderRadius: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: 32,
                                    fontWeight: 'bold',
                                }}
                            >
                                {letter}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            fontSize: 24,
                            color: '#666',
                        }}
                    >
                        strandcraft.app
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
