/**
 * Gemini model configuration.
 * Central source of truth for which Gemini model each tier uses.
 *
 * Last reviewed: 2026-05-19
 * - gemini-3.1-flash-lite: GA Stable (replaces preview that's shutting down)
 * - gemini-3.1-pro-preview: Preview, production-recommended by Google.
 *   (No GA Pro model id exists yet. Don't strip -preview suffix.)
 */

export const GEMINI_MODELS = {
  /** Free tier: baseline reports, free compatibility, Q&A, almanac */
  FLASH_LITE: 'gemini-3.1-flash-lite',
  /** Paid tier: Master Reading chapters, Master Compatibility chapters */
  PRO: 'gemini-3.1-pro-preview',
} as const

export type GeminiModel = (typeof GEMINI_MODELS)[keyof typeof GEMINI_MODELS]
