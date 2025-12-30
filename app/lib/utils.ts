/**
 * Normalizes a presenter name by:
 * - Trimming leading and trailing spaces
 * - Replacing multiple spaces with a single space
 * - Capitalizing each word (Title Case)
 * 
 * @param name - The raw presenter name input
 * @returns The normalized name
 * 
 * @example
 * normalizePresenterName(" aLeX smIth ") // "Alex Smith"
 */
export function normalizePresenterName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
