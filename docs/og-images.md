# Dynamic OG Image Implementation

## Overview

Dynamic Open Graph (OG) images have been implemented for Strandcraft puzzle pages. When a puzzle is shared on social media, a unique branded image is generated showing the puzzle title, author, and the STRANDCRAFT logo in game colors.

## Implementation Details

### Files Created/Modified

1. **[`app/api/og/[slug]/route.tsx`](../app/api/og/[slug]/route.tsx)** - OG image generation endpoint

   - Uses `@vercel/og` package for image generation
   - Runs on edge runtime for optimal performance
   - Fetches puzzle data via API to avoid database connection issues in edge runtime
   - Generates 1200x630px images (optimal for social media)

2. **[`app/play/[slug]/page.tsx`](../app/play/[slug]/page.tsx)** - Server component with metadata

   - Converted to server component to support `generateMetadata()`
   - Generates OpenGraph and Twitter Card metadata
   - References the OG image endpoint

3. **[`app/play/[slug]/PlayClient.tsx`](../app/play/[slug]/PlayClient.tsx)** - Client component
   - Extracted all game logic into a client component
   - Maintains all existing functionality (hints, game state, etc.)

## Visual Design

The OG image follows the spec with:

- **Dark background** (#0a0a0a) matching the app aesthetic
- **Puzzle title** in large white text with quotes
- **Author name** in gray below the title
- **STRANDCRAFT branding** as colored letter squares:
  - Blue squares (#3B82F6) for theme word letters
  - Yellow squares (#EAB308) for spangram letters (positions 2, 4, 7, 10)
  - Pattern: `S T R A N D C R A F T` with R, N, R, T in yellow
- **Footer** with "strandcraft.app" in subtle gray

## Usage

The OG images are automatically generated when:

- A puzzle page is accessed: `/play/[slug]`
- Social media crawlers request metadata
- The image endpoint is called: `/api/og/[slug]`

## Metadata Tags

Each puzzle page includes:

```typescript
{
  title: `${puzzle.title} | Strandcraft`,
  description: `Play "${puzzle.title}" - a custom Strands puzzle by ${puzzle.author}`,
  openGraph: {
    images: [`/api/og/${slug}`],
    // ... other OG tags
  },
  twitter: {
    card: 'summary_large_image',
    images: [`/api/og/${slug}`],
  },
}
```

## Development Notes

### Local Development Limitations

The OG image generation may not work perfectly in local development due to:

- Edge runtime limitations in Next.js dev mode
- Font loading differences between dev and production
- Image generation performance

### Production Deployment

On Vercel (production), the implementation will work seamlessly because:

- Edge runtime is fully supported
- Fonts are properly cached
- Image generation is optimized
- CDN caching improves performance

## Testing

To test OG images in production:

1. **Deploy to Vercel**
2. **Use social media debuggers:**

   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

3. **Direct image access:**
   - Visit: `https://your-domain.com/api/og/[puzzle-slug]`
   - Should return a PNG image

## Future Enhancements

Potential improvements to consider:

1. **Dynamic grid preview** - Show actual puzzle grid (blurred/hidden)
2. **Theme clue display** - Include the theme clue in the image
3. **Completion stats** - Show puzzle difficulty or completion rate
4. **Custom fonts** - Load custom fonts for better branding
5. **Caching** - Implement caching strategy for generated images

## Dependencies

- `@vercel/og` (v0.8.6) - Image generation library
- Next.js 16+ - Server components and metadata API
- Edge runtime - For optimal performance

## References

- [Vercel OG Image Generation](https://vercel.com/docs/functions/edge-functions/og-image-generation)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
