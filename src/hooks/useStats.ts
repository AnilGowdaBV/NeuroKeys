import { useMemo } from 'react'
import { computeAccuracy, computeWpm } from '../utils/calculations'

/**
 * Accuracy = correct key presses ÷ total key presses (each wrong key still counts as one press).
 * With very few keys, the % can look “odd” (e.g. 6/7 ≈ 85.7%) — that’s expected.
 */
export function useLiveStats(
  correctChars: number,
  keystrokes: number,
  elapsedMs: number,
) {
  return useMemo(() => {
    const wpm = computeWpm(correctChars, elapsedMs)
    const accuracy = computeAccuracy(correctChars, keystrokes)
    return { wpm, accuracy }
  }, [correctChars, keystrokes, elapsedMs])
}
