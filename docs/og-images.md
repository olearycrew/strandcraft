# Dynamic OG Image Implementation

## Overview

Dynamic Open Graph (OG) images are generated for Strandcraft puzzle pages. When a puzzle is shared on social media, a unique branded image is generated showing the puzzle title, theme clue, author, and the STRANDCRAFT logo using the app's Catppuccin color scheme.

## Implementation Details

### Files

1. **[`app/api/og/[slug]/route.tsx`](../app/api/og/[slug]/route.tsx)** - OG image generation endpoint

   - Uses `@vercel/og` package for PNG image generation
   - Runs on edge runtime for optimal performance
   - Fetches puzzle data via API to avoid database connection issues in edge runtime
   - Generates 1200x630px images (optimal for social media)

2. **[`app/play/[slug]/page.tsx`](../app/play/[slug]/page.tsx)** - Server component with metadata

   - Uses `generateMetadata()` to set OpenGraph and Twitter Card metadata
   - References the OG image endpoint

## Visual Design

The OG image features:

- **Dark gradient background** using Catppuccin Mocha colors (crust to base)
- **Teal accent line** at the top for visual interest
- **STRANDCRAFT branding** as colored letter tiles matching the app header:
  - STRAND: Yellow, Blue, Mauve, Pink, Green, Peach
  - CRAFT: Teal, Blue, Mauve, Pink, Green
- **Puzzle title** in large white text with quotation marks
- **"THEME CLUE" label** in teal with letter spacing
- **Theme clue text** in muted color below the label
- **Author attribution** in subtle gray
- **Footer** with "strandcraft.app" branding and green accent lines

### Color Palette (Catppuccin Mocha)

| Color    | Hex       | Usage                    |
| -------- | --------- | ------------------------ |
| Crust    | `#11111b` | Background gradient      |
| Base     | `#1e1e2e` | Background gradient      |
| Mantle   | `#181825` | Footer background        |
| Text     | `#cdd6f4` | Title text               |
| Subtext0 | `#a6adc8` | Clue text, footer text   |
| Surface0 | `#313244` | Author text              |
| Teal     | `#94e2d5` | Accent lines, clue label |
| Green    | `#a6e3a1` | Footer accents           |
| Yellow   | `#f9e2af` | S letter tile            |
| Blue     | `#89b4fa` | T, R letter tiles        |
| Mauve    | `#cba6f7` | R, A letter tiles        |
| Pink     | `#f5c2e7` | A, F letter tiles        |
| Peach    | `#fab387` | D letter tile            |

## Usage

The OG images are automatically generated when:

- A puzzle page is accessed: `/play/[slug]`
- Social media crawlers request metadata
- The image endpoint is called directly: `/api/og/[slug]`

## Metadata Tags

Each puzzle page includes:

```typescript
{
  title: `${puzzle.title} | Strandcraft`,
  description: `Play "${puzzle.title}" - a custom Strands puzzle by ${puzzle.author}. Theme: ${puzzle.themeClue}`,
  openGraph: {
    images: [{
      url: `/api/og/${slug}`,
      width: 1200,
      height: 630,
      alt: `${puzzle.title} - Strandcraft Puzzle`,
    }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [`/api/og/${slug}`],
  },
}
```

## Testing

### Local Development

```bash
bun run dev
# Visit: http://localhost:3000/api/og/[puzzle-slug]
```

Note: Edge runtime may have limitations in local development.

### Production Testing

1. **Deploy to Vercel**
2. **Use social media debuggers:**

   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

3. **Direct image access:**
   - Visit: `https://your-domain.com/api/og/[puzzle-slug]`
   - Should return a PNG image

## Caching

Images are cached with the following headers:

```
Cache-Control: public, max-age=86400, s-maxage=86400
```

This caches images for 24 hours on both CDN and browser.

## Dependencies

- `@vercel/og` (v0.8.6) - Image generation library (uses Satori + Resvg)
- Next.js 16+ - Server components and metadata API
- Edge runtime - For optimal performance

## References

- [Vercel OG Image Generation](https://vercel.com/docs/functions/edge-functions/og-image-generation)
- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Catppuccin Color Palette](https://catppuccin.com/)
