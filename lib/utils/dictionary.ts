import words from 'an-array-of-english-words';

// Create a Set for O(1) lookup performance
const englishWordsSet = new Set(words);

/**
 * Check if a word is a valid English word
 * @param word - The word to validate (case-insensitive)
 * @returns true if the word is in the English dictionary
 */
export function isValidEnglishWord(word: string): boolean {
    return englishWordsSet.has(word.toLowerCase());
}
