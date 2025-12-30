import { Metadata } from 'next';
import { db } from '@/lib/db';
import { puzzles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import PlayClient from './PlayClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;

    try {
        const [puzzle] = await db
            .select({
                title: puzzles.title,
                author: puzzles.author,
                themeClue: puzzles.themeClue,
            })
            .from(puzzles)
            .where(eq(puzzles.slug, slug))
            .limit(1);

        if (!puzzle) {
            return {
                title: 'Puzzle Not Found | Strandcraft',
                description: 'This puzzle does not exist',
            };
        }

        const ogImageUrl = `/api/og/${slug}`;
        const description = `Play "${puzzle.title}" - a custom Strands puzzle by ${puzzle.author}. Theme: ${puzzle.themeClue}`;

        return {
            title: `${puzzle.title} | Strandcraft`,
            description,
            openGraph: {
                title: `${puzzle.title} | Strandcraft`,
                description,
                images: [
                    {
                        url: ogImageUrl,
                        width: 1200,
                        height: 630,
                        alt: `${puzzle.title} - Strandcraft Puzzle`,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `${puzzle.title} | Strandcraft`,
                description,
                images: [ogImageUrl],
            },
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Strandcraft',
            description: 'Play custom Strands puzzles',
        };
    }
}

export default async function PlayPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <PlayClient slug={slug} />;
}
