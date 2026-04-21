import type { Difficulty } from '../types'
import { pickPracticeParagraph } from '../data/practice'
import { buildSentenceFromWeakKeys } from '../utils/textGenerator'

export interface PracticeRequest {
  weakKeys: string[]
  difficulty: Difficulty
  seed?: string
}

export interface CoachFeedback {
  summary: string
  tips: string[]
  pattern?: string
}

/**
 * Adaptive mode: large shuffled paragraph pool (`data/practice/adaptive`).
 * Weak-key weaving is still available for future hybrid lines via `buildSentenceFromWeakKeys`.
 */
export async function generatePracticeText(req: PracticeRequest): Promise<string> {
  void req.seed
  void req.difficulty
  void req.weakKeys
  await Promise.resolve()
  return pickPracticeParagraph('adaptive')
}

/** Optional extra drill line built from weak keys (not wired by default). */
export function weaveWeakKeySentence(
  weakKeys: string[],
  difficulty: Difficulty,
  seed: string,
): string {
  return buildSentenceFromWeakKeys(weakKeys, difficulty, seed)
}

export async function generateCoachFeedback(input: {
  wpm: number
  accuracy: number
  topWeakKeys: string[]
  mode: string
}): Promise<CoachFeedback> {
  await Promise.resolve()
  const tips: string[] = []
  if (input.accuracy < 92) {
    tips.push('Prioritize rhythm over speed until accuracy stays above 95%.')
  }
  if (input.topWeakKeys.length) {
    tips.push(
      `Spend two minutes on drills that repeat “${input.topWeakKeys.slice(0, 3).join(', ')}”.`,
    )
  }
  if (input.wpm < 45) {
    tips.push('Keep eyes on the line ahead, not the fingers — micro-pauses beat corrections.')
  }
  if (!tips.length) {
    tips.push('Stable session. Try Adaptive mode to stress uncommon letters.')
  }

  const summary =
    input.accuracy >= 97
      ? 'Clean accuracy with room to push tempo.'
      : input.accuracy >= 90
        ? 'Solid control — tighten weak letters to unlock speed.'
        : 'Accuracy first: slow down until mistakes are rare, then add pace.'

  return {
    summary,
    tips: tips.slice(0, 4),
    pattern:
      input.topWeakKeys.length > 0
        ? `Most friction on: ${input.topWeakKeys.slice(0, 5).join(', ')}`
        : undefined,
  }
}
