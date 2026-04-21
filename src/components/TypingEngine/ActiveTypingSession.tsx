import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { SessionConfig, TypingSessionRecord } from '../../types'
import { useTypingEngine } from '../../hooks/useTypingEngine'
import { useLiveStats } from '../../hooks/useStats'
import { generateCoachFeedback } from '../../services/aiService'
import { TypingSurface } from './TypingSurface'
import { StatsPanel } from '../StatsPanel/StatsPanel'
import { KeyboardHeatmap, type KeyFlash } from '../Heatmap/KeyboardHeatmap'
import type { CoachFeedback } from '../../services/aiService'
import { computeAccuracy, computeWpm } from '../../utils/calculations'
import { getBestWpm, tryRecordBestWpm } from '../../utils/highScores'
import { SessionResultsModal } from './SessionResultsModal'

function playTone(freq: number, duration = 0.04) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.value = 0.04
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + duration)
    osc.onended = () => void ctx.close()
  } catch {
    /* ignore */
  }
}

function formatTime(totalSec: number) {
  const s = Math.max(0, Math.ceil(totalSec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** Quiet beat after line ends, then spinner, then results modal (all modes). */
const RESULTS_PAUSE_MS = 2000
const RESULTS_SPINNER_MS = 2200

type ResultsPresentationPhase = 'idle' | 'pause' | 'spinner' | 'ready'

export interface ActiveTypingSessionProps {
  targetText: string
  config: SessionConfig
  focusMode: boolean
  strictMode: boolean
  sound: boolean
  recordKeyAttempt: (key: string, error: boolean) => void
  topProblemKeys: (n: number) => string[]
  addSession: (rec: Omit<TypingSessionRecord, 'id' | 'at'>) => void
  /** When set (non-custom modes), Retry loads a new random paragraph from the mode pool. */
  onShuffleLine?: () => void
}

export function ActiveTypingSession({
  targetText,
  config,
  focusMode,
  strictMode,
  sound,
  recordKeyAttempt,
  topProblemKeys,
  addSession,
  onShuffleLine,
}: ActiveTypingSessionProps) {
  const [nowTick, setNowTick] = useState(() => Date.now())
  const [timerHardStop, setTimerHardStop] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [coach, setCoach] = useState<CoachFeedback | null>(null)
  const flashSeq = useRef(0)
  const [keyFlash, setKeyFlash] = useState<KeyFlash | null>(null)
  const [resultsMeta, setResultsMeta] = useState<{ bestWpm: number; isNewHigh: boolean } | null>(null)
  const [resultsPhase, setResultsPhase] = useState<ResultsPresentationPhase>('idle')
  const savedRef = useRef(false)
  const prevSessionEndedRef = useRef(false)

  const timedMode = config.mode === 'timed'
  const timerSeconds = config.timerSeconds ?? 60

  const handleComplete = useCallback(() => {
    setSessionEnded(true)
  }, [])

  const onKeystroke = useCallback(
    (info: { key: string; expected: string; correct: boolean }) => {
      recordKeyAttempt(info.key, !info.correct)
      const raw = info.key
      if (raw.length === 1 || raw === ' ') {
        const k = raw === ' ' ? ' ' : raw.toLowerCase()
        flashSeq.current += 1
        setKeyFlash({ key: k, correct: info.correct, seq: flashSeq.current })
      }
      if (sound) {
        playTone(info.correct ? 880 : 220, 0.05)
      }
    },
    [recordKeyAttempt, sound],
  )

  const engineEnabled = useMemo(() => {
    if (!targetText.length || sessionEnded || timerHardStop) return false
    return true
  }, [targetText.length, sessionEnded, timerHardStop])

  const { snapshot, elapsedMs, reset } = useTypingEngine({
    text: targetText,
    strictMode,
    enabled: engineEnabled,
    onComplete: handleComplete,
    onKeystroke,
  })

  /** Line fully cleared → same as a new attempt: neutral keyboard + zero stat row. */
  const lineFresh =
    !sessionEnded &&
    targetText.length > 0 &&
    snapshot.index === 0 &&
    snapshot.keystrokes === 0 &&
    snapshot.errors === 0 &&
    snapshot.correctChars === 0 &&
    !snapshot.complete

  useEffect(() => {
    if (!lineFresh) return
    setKeyFlash(null)
  }, [lineFresh])

  const remainingSec = useMemo(() => {
    if (!timedMode) return timerSeconds
    if (!snapshot.startedAt) return timerSeconds
    return timerSeconds - (nowTick - snapshot.startedAt) / 1000
  }, [timedMode, timerSeconds, snapshot.startedAt, nowTick])

  useEffect(() => {
    if (!timedMode || !snapshot.startedAt || sessionEnded) return
    const id = window.setInterval(() => {
      const t = Date.now()
      setNowTick(t)
      const rem = timerSeconds - (t - snapshot.startedAt!) / 1000
      if (rem <= 0) {
        setTimerHardStop(true)
        setSessionEnded(true)
      }
    }, 50)
    return () => window.clearInterval(id)
  }, [timedMode, snapshot.startedAt, sessionEnded, timerSeconds])

  const { wpm, accuracy } = useLiveStats(
    snapshot.correctChars,
    snapshot.keystrokes,
    Math.max(elapsedMs, 1),
  )

  useLayoutEffect(() => {
    if (!sessionEnded || savedRef.current) return
    if (!snapshot.startedAt) return

    if (snapshot.keystrokes === 0) {
      savedRef.current = true
      setResultsMeta({ bestWpm: getBestWpm(config.mode), isNewHigh: false })
      void (async () => {
        const fb = await generateCoachFeedback({
          wpm: 0,
          accuracy: 100,
          topWeakKeys: topProblemKeys(6),
          mode: config.mode,
        })
        setCoach(fb)
      })()
      return
    }

    savedRef.current = true
    const durationSec = Math.max(0.001, elapsedMs / 1000)
    const finalWpm = computeWpm(snapshot.correctChars, elapsedMs)
    const acc =
      snapshot.keystrokes > 0
        ? Math.round((snapshot.correctChars / snapshot.keystrokes) * 1000) / 10
        : 100

    const isNew = tryRecordBestWpm(config.mode, finalWpm)
    setResultsMeta({ bestWpm: getBestWpm(config.mode), isNewHigh: isNew })

    addSession({
      mode: config.mode,
      wpm: finalWpm,
      accuracy: acc,
      durationSec,
      errors: snapshot.errors,
      keystrokes: snapshot.keystrokes,
    })

    void (async () => {
      const fb = await generateCoachFeedback({
        wpm: finalWpm,
        accuracy: acc,
        topWeakKeys: topProblemKeys(6),
        mode: config.mode,
      })
      setCoach(fb)
    })()
  }, [
    sessionEnded,
    config.mode,
    addSession,
    elapsedMs,
    snapshot.correctChars,
    snapshot.errors,
    snapshot.keystrokes,
    snapshot.startedAt,
    topProblemKeys,
  ])

  const timerLabel = timedMode ? formatTime(remainingSec) : null

  const timedOut = sessionEnded && timedMode && timerHardStop

  useLayoutEffect(() => {
    if (!sessionEnded) {
      setResultsPhase('idle')
      prevSessionEndedRef.current = false
      return
    }
    if (!prevSessionEndedRef.current) {
      prevSessionEndedRef.current = true
      setResultsPhase('pause')
    }
  }, [sessionEnded])

  useEffect(() => {
    if (resultsPhase !== 'pause') return
    const id = window.setTimeout(() => setResultsPhase('spinner'), RESULTS_PAUSE_MS)
    return () => window.clearTimeout(id)
  }, [resultsPhase])

  useEffect(() => {
    if (resultsPhase !== 'spinner') return
    const id = window.setTimeout(() => setResultsPhase('ready'), RESULTS_SPINNER_MS)
    return () => window.clearTimeout(id)
  }, [resultsPhase])

  const retry = () => {
    if (onShuffleLine) {
      onShuffleLine()
      return
    }
    savedRef.current = false
    setCoach(null)
    setResultsMeta(null)
    setResultsPhase('idle')
    setTimerHardStop(false)
    setSessionEnded(false)
    setKeyFlash(null)
    setNowTick(Date.now())
    reset()
  }

  useEffect(() => {
    if (!sessionEnded) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sessionEnded])

  const elapsedSafe = Math.max(elapsedMs, 1)
  const finalWpm = sessionEnded ? computeWpm(snapshot.correctChars, elapsedSafe) : wpm
  const finalAccuracy =
    sessionEnded && snapshot.keystrokes > 0
      ? computeAccuracy(snapshot.correctChars, snapshot.keystrokes)
      : sessionEnded
        ? 100
        : accuracy
  const durationSec = sessionEnded ? elapsedSafe / 1000 : 0

  return (
    <>
      <div className="space-y-6 sm:space-y-8">
        <TypingSurface
          text={targetText}
          marks={snapshot.marks}
          caretIndex={snapshot.index}
          focusMode={focusMode}
          complete={snapshot.complete || sessionEnded}
        />

        <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1fr_minmax(0,280px)]">
          <KeyboardHeatmap flash={keyFlash} />
          <div className="h-fit rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.05] via-[#070910]/85 to-violet-950/25 p-4 text-sm text-zinc-500 shadow-[0_20px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-teal-500/20 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-teal-400/90">Session</p>
            <p className="mt-3 font-medium text-white">
              Mode:{' '}
              <span className="capitalize text-teal-200/95">{config.mode}</span>
            </p>
            {timedMode && (
              <p className="mt-2">
                Time box:{' '}
                <span className="font-mono text-amber-200/90">{timerSeconds}s</span>
              </p>
            )}
            <p className="mt-4 text-xs leading-relaxed text-zinc-500">
              WPM = (correct characters ÷ 5) ÷ minutes elapsed — classic gross WPM.
            </p>
          </div>
        </div>

        <StatsPanel
          wpm={sessionEnded ? computeWpm(snapshot.correctChars, Math.max(elapsedMs, 1)) : wpm}
          accuracy={
            sessionEnded && snapshot.keystrokes > 0
              ? computeAccuracy(snapshot.correctChars, snapshot.keystrokes)
              : accuracy
          }
          correctChars={snapshot.correctChars}
          errors={snapshot.errors}
          keystrokes={snapshot.keystrokes}
          timerLabel={timerLabel}
        />
      </div>

      <AnimatePresence>
        {sessionEnded && resultsPhase === 'spinner' && (
          <motion.div
            key="results-spinner"
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-[#05060a]/88 p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div
              className="size-14 shrink-0 animate-spin rounded-full border-2 border-white/[0.1] border-t-teal-400 border-r-cyan-400/70 sm:size-16"
              aria-hidden
            />
            <p className="max-w-xs text-center text-sm font-medium text-zinc-300 sm:text-base">
              Crunching your session…
            </p>
            <p className="text-center text-xs text-zinc-500">Almost there</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sessionEnded && resultsPhase === 'ready' && (
          <SessionResultsModal
            key="session-results"
            open
            mode={config.mode}
            timedOut={!!timedOut}
            wpm={finalWpm}
            accuracy={finalAccuracy}
            durationSec={durationSec}
            errors={snapshot.errors}
            keystrokes={snapshot.keystrokes}
            correctChars={snapshot.correctChars}
            lineLength={targetText.length}
            caretIndex={snapshot.index}
            complete={snapshot.complete}
            isNewHighScore={resultsMeta?.isNewHigh ?? false}
            bestWpm={resultsMeta?.bestWpm ?? getBestWpm(config.mode)}
            coach={coach}
            onRetry={retry}
          />
        )}
      </AnimatePresence>
    </>
  )
}
