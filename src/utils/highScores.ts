import type { TrainMode } from '../types'
import { loadJson, saveJson, storageKey } from './storage'

const KEY = storageKey('bestWpmByMode')

type Store = Partial<Record<TrainMode, number>>

export function getBestWpm(mode: TrainMode): number {
  const cur = loadJson<Store>(KEY, {})
  return cur[mode] ?? 0
}

/** Returns true if this WPM is a new best for the mode (and updates storage). */
export function tryRecordBestWpm(mode: TrainMode, wpm: number): boolean {
  if (wpm <= 0) return false
  const cur = loadJson<Store>(KEY, {})
  const prev = cur[mode] ?? 0
  if (wpm > prev) {
    saveJson(KEY, { ...cur, [mode]: wpm })
    return true
  }
  return false
}
