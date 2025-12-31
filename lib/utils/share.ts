// lib/utils/share.ts

import type { GameAction } from "@/app/play/[slug]/components/types";
import { ACTION_EMOJIS } from "@/app/play/[slug]/components/types";

interface ShareOptions {
  puzzleTitle: string;
  puzzleSlug: string;
  gameActions: GameAction[];
  hintsUsed: number;
  totalWords: number;
}

// Width of emoji grid rows
const EMOJI_ROW_WIDTH = 4;

/**
 * Generate an emoji grid representation of game actions
 * Actions are displayed in rows of 4, showing the order of hints, words, and spangram
 */
export function generateEmojiGrid(gameActions: GameAction[]): string {
  const emojis = gameActions.map((action) => ACTION_EMOJIS[action.type]);

  // Split into rows of EMOJI_ROW_WIDTH
  const rows: string[] = [];
  for (let i = 0; i < emojis.length; i += EMOJI_ROW_WIDTH) {
    rows.push(emojis.slice(i, i + EMOJI_ROW_WIDTH).join(""));
  }

  return rows.join("\n");
}

/**
 * Generate the full shareable text for puzzle results
 * Format:
 * StrandCraft
 * "{title}"
 * 💡🟦💡🟦
 * 💡🟦🟨🟦
 * 💡💡🟦
 */
export function generateShareText(options: ShareOptions): string {
  const { puzzleTitle, puzzleSlug, gameActions } = options;

  const emojiGrid = generateEmojiGrid(gameActions);
  const puzzleUrl = `https://strandcraft.app/play/${puzzleSlug}`;

  let shareText = `StrandCraft\n`;
  shareText += `"${puzzleTitle}"\n`;
  shareText += `${emojiGrid}\n\n`;
  shareText += `${puzzleUrl}`;

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
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand("copy");
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
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function"
  );
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
    title: `StrandCraft: ${options.puzzleTitle}`,
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
    if (error instanceof Error && error.name === "AbortError") {
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
  return `https://strandcraft.app/play/${puzzleSlug}`;
}

/**
 * Generate the share message text for a puzzle
 */
export function generatePuzzleShareText(
  puzzleTitle: string,
  puzzleSlug: string
): string {
  const puzzleUrl = getPuzzleUrl(puzzleSlug);
  return `Try this word puzzle on StrandCraft: ${puzzleTitle} ${puzzleUrl}`;
}

/**
 * Share a puzzle link using the native share sheet
 * Returns true if share was initiated, false if not available
 */
export async function sharePuzzleLink(
  puzzleTitle: string,
  puzzleSlug: string
): Promise<boolean> {
  if (!canUseNativeShare()) {
    return false;
  }

  const shareText = generatePuzzleShareText(puzzleTitle, puzzleSlug);

  const shareData = {
    title: `StrandCraft: ${puzzleTitle}`,
    text: shareText,
  };

  try {
    if (navigator.canShare && !navigator.canShare(shareData)) {
      return false;
    }

    await navigator.share(shareData);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return true;
    }
    return false;
  }
}
