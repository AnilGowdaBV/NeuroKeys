import { useCallback, useMemo, useState } from 'react'
import type { KeyStat } from '../types'
import { loadJson, saveJson, storageKey } from '../utils/storage'

const KEY = storageKey('keyStats')

export function useAdaptiveLearning() {
  const [stats, setStats] = useState<KeyStat[]>(() => loadJson<KeyStat[]>(KEY, []))

  const recordKeyAttempt = useCallback((rawKey: string, error: boolean) => {
    if (rawKey === 'Backspace' || rawKey.length > 1) return
    const k = rawKey === ' ' ? ' ' : rawKey.toLowerCase()

    setStats((prev) => {
      const idx = prev.findIndex((s) => s.key === k)
      let next: KeyStat[]
      if (idx === -1) {
        next = [...prev, { key: k, attempts: 1, errors: error ? 1 : 0 }]
      } else {
        next = [...prev]
        const cur = next[idx]!
        next[idx] = {
          ...cur,
          attempts: cur.attempts + 1,
          errors: cur.errors + (error ? 1 : 0),
        }
      }
      saveJson(KEY, next)
      return next
    })
  }, [])

  const weakKeys = useMemo(() => {
    return stats
      .filter((s) => s.attempts >= 4)
      .map((s) => ({
        key: s.key,
        rate: s.errors / s.attempts,
        errors: s.errors,
      }))
      .sort((a, b) => b.rate - a.rate || b.errors - a.errors)
      .slice(0, 8)
      .map((s) => s.key)
  }, [stats])

  const topProblemKeys = useCallback(
    (limit = 5) => weakKeys.slice(0, limit),
    [weakKeys],
  )

  return { stats, weakKeys, recordKeyAttempt, topProblemKeys }
}
