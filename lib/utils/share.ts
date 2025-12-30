// lib/utils/share.ts

interface FoundWord {
  word: string;
  type: 'theme' | 'spangram';
}

interface ShareOptions {
  puzzleTitle: string;
  puzzleSlug: string;
  foundWords: FoundWord[];
  hintsUsed: number;
  totalWords: number;
}

// Emoji colors for representing word order
const THEME_EMOJIS = ['🟦', '🟩', '🟪', '🟫', '⬜', '🟧'];
const SPANGRAM_EMOJI = '🟨';

/**
 * Generate a visual representation of the word order using emojis
 * Each theme word gets a colored square, spangram gets yellow
 */
export function generateWordOrderEmojis(foundWords: FoundWord[]): string {
  let themeWordIndex = 0;
  
  return foundWords.map(word => {
    if (word.type === 'spangram') {
      return SPANGRAM_EMOJI;
    }
    // Cycle through theme emojis for variety
    const emoji = THEME_EMOJIS[themeWordIndex % THEME_EMOJIS.length];
    themeWordIndex++;
    return emoji;
  }).join('');
}

/**
 * Generate the full shareable text for puzzle results
 */
export function generateShareText(options: ShareOptions): string {
  const { puzzleTitle, puzzleSlug, foundWords, hintsUsed, totalWords } = options;
  
  const wordEmojis = generateWordOrderEmojis(foundWords);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const puzzleUrl = `${baseUrl}/play/${puzzleSlug}`;
  
  let shareText = `DIY Strands: ${puzzleTitle}\n`;
  shareText += `${wordEmojis}\n`;
  shareText += `${totalWords}/${totalWords} words found`;
  
  if (hintsUsed > 0) {
    shareText += ` • ${hintsUsed} hint${hintsUsed === 1 ? '' : 's'} used`;
  } else {
    shareText += ` • No hints! 🌟`;
  }
  
  shareText += `\n\n${puzzleUrl}`;
  
  return shareText;
}

/**
 * Copy text to clipboard
 * Returns true if successful, false otherwise
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Check if the Web Share API is available
 */
export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 
         typeof navigator.share === 'function' &&
         typeof navigator.canShare === 'function';
}

/**
 * Share using the native share sheet (mobile devices)
 * Returns true if share was initiated, false if not available
 */
export async function nativeShare(options: ShareOptions): Promise<boolean> {
  if (!canUseNativeShare()) {
    return false;
  }
  
  const shareText = generateShareText(options);
  
  // Note: We only include text (which already has the URL at the end)
  // Adding a separate 'url' property would cause the link to appear twice
  const shareData = {
    title: `DIY Strands: ${options.puzzleTitle}`,
    text: shareText,
  };
  
  try {
    // Check if we can share this data
    if (navigator.canShare && !navigator.canShare(shareData)) {
      return false;
    }
    
    await navigator.share(shareData);
    return true;
  } catch (error) {
    // User cancelled or share failed
    if (error instanceof Error && error.name === 'AbortError') {
      // User cancelled - this is fine
      return true;
    }
    return false;
  }
}

/**
 * Generate the puzzle URL for sharing
 */
export function getPuzzleUrl(puzzleSlug: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/play/${puzzleSlug}`;
}

/**
 * Generate the share message for a puzzle link
 */
export function generatePuzzleLinkMessage(puzzleTitle: string, puzzleSlug: string): string {
  const puzzleUrl = getPuzzleUrl(puzzleSlug);
  return `Try this word puzzle on StrandCraft: ${puzzleTitle} ${puzzleUrl}`;
}

/**
 * Share a puzzle link using the native share sheet
 * Returns true if share was initiated, false if not available
 */
export async function sharePuzzleLink(puzzleTitle: string, puzzleSlug: string): Promise<boolean> {
  if (!canUseNativeShare()) {
    return false;
  }
  
  const shareMessage = generatePuzzleLinkMessage(puzzleTitle, puzzleSlug);
  
  // Note: We only include text (which already has the URL at the end)
  // Adding a separate 'url' property would cause the link to appear twice
  const shareData = {
    title: `StrandCraft: ${puzzleTitle}`,
    text: shareMessage,
  };
  
  try {
    if (navigator.canShare && !navigator.canShare(shareData)) {
      return false;
    }
    
    await navigator.share(shareData);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return true;
    }
    return false;
  }
}
