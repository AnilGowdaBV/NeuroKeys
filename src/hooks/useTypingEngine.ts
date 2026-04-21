import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type CharMark = 'pending' | 'correct' | 'incorrect'

export interface UseTypingEngineOptions {
  text: string
  strictMode: boolean
  enabled: boolean
  onComplete?: () => void
  onKeystroke?: (info: { key: string; expected: string; correct: boolean }) => void
}

export interface TypingSnapshot {
  index: number
  marks: CharMark[]
  errors: number
  keystrokes: number
  correctChars: number
  startedAt: number | null
  endedAt: number | null
  complete: boolean
}

function useLiveClock(active: boolean) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [active])
  return now
}

export function useTypingEngine({
  text,
  strictMode,
  enabled,
  onComplete,
  onKeystroke,
}: UseTypingEngineOptions) {
  const [snapshot, setSnapshot] = useState<TypingSnapshot>(() => ({
    index: 0,
    marks: Array.from({ length: text.length }, () => 'pending' as CharMark),
    errors: 0,
    keystrokes: 0,
    correctChars: 0,
    startedAt: null,
    endedAt: null,
    complete: text.length === 0,
  }))

  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  const onKeystrokeRef = useRef(onKeystroke)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    onKeystrokeRef.current = onKeystroke
  }, [onKeystroke])

  /** Stop ticking when engine is off (e.g. timed hard stop) so elapsedMs freezes for results. */
  const liveClock = useLiveClock(
    Boolean(enabled && snapshot.startedAt && !snapshot.endedAt && !snapshot.complete),
  )

  const finishIfDone = useCallback((next: TypingSnapshot, textLen: number): TypingSnapshot => {
    if (next.index >= textLen && textLen > 0) {
      const ended: TypingSnapshot = {
        ...next,
        complete: true,
        endedAt: next.endedAt ?? Date.now(),
      }
      if (!completedRef.current) {
        completedRef.current = true
        onCompleteRef.current?.()
      }
      return ended
    }
    return next
  }, [])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault()
        return
      }

      if (e.key === 'Tab') {
        e.preventDefault()
      }

      if (e.key === 'Backspace') {
        e.preventDefault()
        setSnapshot((prev) => {
          if (prev.complete) return prev

          // Strict mode: wrong key keeps the caret on the same cell — undo that cell first.
          const wrongOnCursor =
            strictMode &&
            prev.index < prev.marks.length &&
            prev.marks[prev.index] === 'incorrect'
          if (wrongOnCursor) {
            const marks = [...prev.marks]
            marks[prev.index] = 'pending'
            const keystrokes = Math.max(0, prev.keystrokes - 1)
            const errors = Math.max(0, prev.errors - 1)
            const fullyFresh = keystrokes === 0 && marks.every((m) => m === 'pending')
            return {
              ...prev,
              marks,
              errors,
              keystrokes,
              correctChars: fullyFresh ? 0 : prev.correctChars,
              endedAt: null,
              complete: false,
              startedAt: fullyFresh ? null : prev.startedAt,
            }
          }

          if (prev.index === 0) return prev

          const newIndex = prev.index - 1
          const marks = [...prev.marks]
          const undoneMark = marks[newIndex]
          marks[newIndex] = 'pending'

          let { errors, correctChars, keystrokes } = prev
          if (undoneMark === 'correct') {
            correctChars = Math.max(0, correctChars - 1)
            keystrokes = Math.max(0, keystrokes - 1)
          } else if (undoneMark === 'incorrect') {
            errors = Math.max(0, errors - 1)
            keystrokes = Math.max(0, keystrokes - 1)
          }

          const fullyFresh = newIndex === 0 && marks.every((m) => m === 'pending')

          return {
            ...prev,
            index: newIndex,
            marks,
            errors,
            correctChars,
            keystrokes,
            endedAt: null,
            complete: false,
            startedAt: fullyFresh ? null : prev.startedAt,
          }
        })
        return
      }

      if (e.key.length !== 1 && e.key !== ' ') return

      e.preventDefault()

      setSnapshot((prev) => {
        if (prev.complete) return prev
        const i = prev.index
        const expected = text[i]
        if (expected === undefined) return prev

        const typed = e.key === ' ' ? ' ' : e.key
        const match =
          expected === typed ||
          (expected.toLowerCase() === typed.toLowerCase() &&
            /[a-z]/i.test(expected) &&
            /[a-z]/i.test(typed))

        const now = Date.now()
        const marks = [...prev.marks]
        let nextIndex = i
        let errors = prev.errors
        let correctChars = prev.correctChars
        const startedAt = prev.startedAt ?? now

        if (match) {
          marks[i] = 'correct'
          correctChars += 1
          nextIndex = i + 1
          onKeystrokeRef.current?.({ key: typed, expected, correct: true })
        } else {
          errors += 1
          marks[i] = 'incorrect'
          nextIndex = strictMode ? i : i + 1
          onKeystrokeRef.current?.({ key: typed, expected, correct: false })
        }

        const base: TypingSnapshot = {
          ...prev,
          marks,
          index: nextIndex,
          errors,
          correctChars,
          keystrokes: prev.keystrokes + 1,
          startedAt,
          endedAt: null,
          complete: false,
        }

        if (nextIndex >= text.length) {
          return finishIfDone(
            {
              ...base,
              endedAt: now,
              complete: true,
            },
            text.length,
          )
        }

        return base
      })
    },
    [enabled, finishIfDone, strictMode, text],
  )

  useEffect(() => {
    if (!enabled) return
    const listener = (e: KeyboardEvent) => handleKeyDown(e)
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [enabled, handleKeyDown])

  const elapsedMs = useMemo(() => {
    if (!snapshot.startedAt) return 0
    const end = snapshot.endedAt ?? liveClock
    return Math.max(0, end - snapshot.startedAt)
  }, [snapshot.startedAt, snapshot.endedAt, liveClock])

  const reset = useCallback(() => {
    completedRef.current = false
    setSnapshot({
      index: 0,
      marks: Array.from({ length: text.length }, () => 'pending'),
      errors: 0,
      keystrokes: 0,
      correctChars: 0,
      startedAt: null,
      endedAt: null,
      complete: text.length === 0,
    })
  }, [text.length])

  return {
    snapshot,
    elapsedMs,
    reset,
  }
}
