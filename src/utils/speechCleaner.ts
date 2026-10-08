/**
 * Speech Text Cleaner for High-Clarity TTS Pronunciation
 * Removes markdown formatting, code snippets, raw URLs, and artifact punctuation
 * so the browser's speech synthesis engine speaks smooth, articulate Spanish.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  let cleaned = rawText
    // Remove multi-line code blocks
    .replace(/```[\s\S]*?```/g, " . Bloque de código técnico omitido para síntesis de voz. ")
    // Remove inline code backticks
    .replace(/`([^`]+)`/g, "$1")
    // Replace markdown links [Anchor Text](http...) with just the Anchor Text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove raw http/https links
    .replace(/https?:\/\/[^\s.,;)]+/g, " ")
    // Remove markdown bold, italic, strikethrough: **bold**, *italic*, ~~del~~
    .replace(/[*_~]{1,3}/g, "")
    // Remove markdown headers: # Header, ## Subheader
    .replace(/^#{1,6}\s+/gm, "")
    // Remove markdown list bullets: - item, * item, + item, 1. item
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // Remove blockquotes: > quote
    .replace(/^>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, "")
    // Remove table borders and vertical bars
    .replace(/\|/g, ", ")
    // Remove common emojis that cause TTS stuttering or weird phonetic reading
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, "")
    // Replace multiple colons, dashes or dashes with clean pauses
    .replace(/[-–—]{2,}/g, " ")
    // Replace multiple exclamation marks or question marks
    .replace(/!{2,}/g, "!")
    .replace(/\?{2,}/g, "?")
    // Replace newlines with period and space to give natural cadence
    .replace(/\n+/g, ". ")
    // Normalize spaces
    .replace(/\s{2,}/g, " ")
    .trim();

  // Clean trailing punctuation duplicates like ".. "
  cleaned = cleaned.replace(/\.{2,}/g, ".");

  return cleaned;
}
