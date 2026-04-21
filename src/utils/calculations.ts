/**
 * Gross WPM: (correct characters / 5) / minutes elapsed.
 * Matches common typing-test convention for comparability.
 */
export function computeWpm(correctChars: number, elapsedMs: number): number {
  if (elapsedMs <= 0) return 0
  const minutes = elapsedMs / 60000
  return Math.round((correctChars / 5) / minutes)
}

export function computeAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100
  return Math.round((correct / total) * 1000) / 10
}
