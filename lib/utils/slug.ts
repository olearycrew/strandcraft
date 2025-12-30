// lib/utils/slug.ts
import { customAlphabet } from "nanoid";

/**
 * Generates a random 6-character slug using uppercase letters and digits
 * Excludes ambiguous characters: 0, O, 1, I, L
 * Uses nanoid for cryptographically strong random generation
 */
const nanoid = customAlphabet("2346789BCDFGHJKMNPQRTVWXZ", 6);

export function generateSlug(): string {
  return nanoid();
}

/**
 * Validates that a slug matches the expected format
 */
export function isValidSlug(slug: string): boolean {
  return /^[A-Z2-9]{6}$/.test(slug);
}
