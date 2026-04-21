import { ADAPTIVE_PARAGRAPHS } from './adaptive'
import { BEGINNER_PARAGRAPHS } from './beginner'
import { TIMED_PARAGRAPHS } from './timed'

export { ADAPTIVE_PARAGRAPHS, BEGINNER_PARAGRAPHS, TIMED_PARAGRAPHS }

export type PracticePoolId = 'beginner' | 'timed' | 'adaptive'

const POOLS: Record<PracticePoolId, readonly string[]> = {
  beginner: BEGINNER_PARAGRAPHS,
  timed: TIMED_PARAGRAPHS,
  adaptive: ADAPTIVE_PARAGRAPHS,
}

/**
 * Random paragraph for the given pool. Pass `avoid` to reduce immediate repeats (e.g. after Retry).
 */
export function pickPracticeParagraph(poolId: PracticePoolId, avoid?: string): string {
  const pool = POOLS[poolId]
  if (!pool.length) {
    return 'Practice text is loading. Type this line once, then start again.'
  }
  if (pool.length === 1) return pool[0]!

  let pick = pool[Math.floor(Math.random() * pool.length)]!
  let n = 0
  while (avoid && pick === avoid && n < 32) {
    pick = pool[Math.floor(Math.random() * pool.length)]!
    n += 1
  }
  return pick
}

export function poolSize(poolId: PracticePoolId): number {
  return POOLS[poolId].length
}
