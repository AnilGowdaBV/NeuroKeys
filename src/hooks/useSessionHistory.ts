import { useCallback, useState } from 'react'
import type { TypingSessionRecord } from '../types'
import { loadJson, saveJson, storageKey } from '../utils/storage'

const KEY = storageKey('sessions')

export function useSessionHistory() {
  const [sessions, setSessions] = useState<TypingSessionRecord[]>(() =>
    loadJson<TypingSessionRecord[]>(KEY, []),
  )

  const addSession = useCallback((rec: Omit<TypingSessionRecord, 'id' | 'at'>) => {
    const full: TypingSessionRecord = {
      ...rec,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      at: Date.now(),
    }
    setSessions((prev) => {
      const next = [full, ...prev].slice(0, 30)
      saveJson(KEY, next)
      return next
    })
  }, [])

  return { sessions, addSession }
}
