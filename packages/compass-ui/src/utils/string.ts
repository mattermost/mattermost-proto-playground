/**
 * Converts a string to kebab-case.
 * Used to map Figma-named prop values (e.g. "Do Not Disturb", "X-Small")
 * to CSS modifier class name suffixes (e.g. "do-not-disturb", "x-small").
 */
export const toKebab = (s: string) => s.replace(/\s+/g, '-').toLowerCase();
