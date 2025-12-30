# Strands Hint System Implementation

## Overview

An optional hint system has been added to the DIY Strands game that closely follows the official NYT Strands hint mechanics.

## Features

### 1. Toggle Hints On/Off

- **Location**: Top-right corner of the game page
- **Button**: "💡 Hints: ON" / "💡 Hints: OFF"
- **Behavior**:
  - Yellow background when enabled
  - Gray background when disabled
  - Resets all hint progress when toggled
  - **Persistent**: The on/off state is saved to localStorage and persists across page reloads

### 2. Earning Hints

Players earn hints by finding non-theme words:

- **Requirement**: 4+ letter words that are NOT theme words or the spangram
- **Progress**: Each non-theme word fills ⅓ of the hint bar
- **Earn Rate**: 3 non-theme words = 1 hint available

#### Progress Bar

- Visual indicator showing 0/3, 1/3, 2/3, or 3/3 progress
- Yellow fill color that animates as progress increases
- Displays list of non-theme words found below the bar

### 3. Using Hints

When the hint bar is full (3/3), players can click "Use Hint":

- **Visual Indicator**: Letters of one theme word get circled with a **dashed yellow border**
- **Unscrambling Required**: Players still need to trace the correct path through the letters
- **Hint Cleared**: Once the word is successfully found, the dashed borders disappear
- **Progress Reset**: After using a hint, the progress bar resets to 0/3

#### Hint Priority

1. Random unfound theme words are revealed first
2. The spangram is always saved for last
3. Only one hint can be active at a time

### 4. Win Screen

The completion modal shows different messages based on hint usage:

- **Perfect!** - If hints were enabled but never used (0 hints)
- **Congratulations!** - Standard message
- **Hint Stats**: Shows "🌟 Solved without hints!" or "Used X hint(s)"

## Technical Implementation

### State Management

```typescript
interface HintState {
  enabled: boolean; // Is hint mode on?
  nonThemeWordsFound: string[]; // Current batch (0-3 for progress bar)
  allTimeUsedWords: string[]; // All words ever used (persisted to localStorage)
  hintsUsed: number; // Count of hints used
  currentHintPath: Coordinate[] | null; // Active hint path
}
```

### Persistence

Used hint words are stored in localStorage per puzzle to prevent reuse:

- **Storage Key**: `diystrands-hints-{puzzle-slug}`
- **Data Structure**: `{ usedHintWords: string[] }`
- **Behavior**: Once a word is used for hint progress, it cannot be used again for that puzzle (even after using the hint or toggling hints off/on)

### Key Functions

- **`toggleHints()`**: Enables/disables hint mode and resets state
- **`useHint()`**: Activates a hint for an unfound word
- **`canUseHint()`**: Checks if hint button should be enabled
- **`getHintProgress()`**: Returns 0-3 for progress bar display

### Visual States

Grid cells can have these states:

- `'default'` - Normal gray cell
- `'selected'` - Blue, currently being traced
- `'hint'` - Gray with dashed yellow border (hint active)
- `'found-theme'` - Solid blue (theme word found)
- `'found-spangram'` - Solid yellow (spangram found)

## User Experience

### Feedback

- Toast notification appears when a non-theme word is found
- Shows message: `"WORD" added to hint progress!`
- Auto-dismisses after 2 seconds

### Button States

- **Hint Button Enabled**: Yellow background, clickable
- **Hint Button Disabled**: Gray background, cursor-not-allowed
- **Hint Active**: Button text changes to "Hint Active"

## Future Enhancements

Potential improvements for a production version:

1. **Dictionary Validation**: Integrate a real English dictionary API to validate non-theme words
2. **Hint Animations**: Add subtle animations when hint borders appear
3. **Sound Effects**: Audio feedback for earning/using hints
4. **Hint History**: Track which words were hinted in game stats
5. **Difficulty Modes**: Adjust hint requirements (e.g., 4 words for hard mode)

## Testing

To test the hint system:

1. Enable hints using the toggle button
2. Find any 4+ letter word that's not a theme word (e.g., "TEST", "WORD", "PLAY")
3. Submit 3 such words to fill the hint bar
4. Click "Use Hint" to see dashed borders around a theme word
5. Trace the hinted word to clear the hint
6. Complete the puzzle to see the "Perfect!" or hint usage stats
