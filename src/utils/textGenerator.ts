import type { Difficulty } from '../types'
import { pickPracticeParagraph } from '../data/practice'

const WORD_BANK: Record<Difficulty, string[]> = {
  easy: [
    'the',
    'and',
    'for',
    'are',
    'but',
    'not',
    'you',
    'all',
    'can',
    'had',
    'her',
    'was',
    'one',
    'our',
    'out',
    'day',
    'get',
    'has',
    'him',
    'his',
    'how',
    'its',
    'may',
    'new',
    'now',
    'old',
    'see',
    'two',
    'way',
    'who',
    'boy',
    'did',
    'let',
    'put',
    'say',
    'she',
    'too',
    'use',
  ],
  medium: [
    'quiet',
    'signal',
    'planet',
    'bridge',
    'cipher',
    'module',
    'vector',
    'garden',
    'silver',
    'motion',
    'crystal',
    'harbor',
    'neuron',
    'pulse',
    'stream',
    'shadow',
    'amber',
    'orbit',
    'fusion',
    'mantle',
  ],
  hard: [
    'cryptography',
    'synchronous',
    'phenomenon',
    'juxtaposition',
    'subconscious',
    'bureaucracy',
    'mnemonic',
    'phosphorescent',
    'quintessential',
    'unconsciously',
    'hypothesis',
    'symmetrical',
    'psychology',
    'xylophone',
    'zigzagging',
  ],
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]!
}

/** Deterministic PRNG from seed string (0..1) */
export function mulberry32(seedStr: string) {
  let a = 0
  for (let i = 0; i < seedStr.length; i++) {
    a = (a + seedStr.charCodeAt(i)) | 0
  }
  return function next() {
    let t = (a += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildSentenceFromWeakKeys(
  weakKeys: string[],
  difficulty: Difficulty,
  seed: string,
): string {
  const rng = mulberry32(seed + weakKeys.join(''))
  const letters = weakKeys.length
    ? weakKeys.map((k) => k.toLowerCase()).filter((k) => /[a-z]/.test(k))
    : 'etaoinshrdlu'.split('')

  const pool = WORD_BANK[difficulty]
  const parts: string[] = []
  const targetWords = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 12 : 9

  for (let i = 0; i < targetWords; i++) {
    const w = pick(pool, rng)
    if (i % 3 === 0 && letters.length) {
      const L = pick(letters, rng)
      const idx = Math.max(1, Math.floor(rng() * (w.length - 1)))
      const mutated = w.slice(0, idx) + L + w.slice(idx + 1)
      parts.push(mutated)
    } else {
      parts.push(w)
    }
  }

  let sentence = parts.join(' ')
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
  return sentence
}

/** Fallback when custom text is empty — random line from beginner pool. */
export function defaultPracticeText(): string {
  return pickPracticeParagraph('beginner')
}
