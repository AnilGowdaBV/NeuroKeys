import { memo, useId, useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion } from 'framer-motion'
import type { TrainMode } from '../../types'
import type { CoachFeedback } from '../../services/aiService'

function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

/** How much WPM contributes to the star blend (60 WPM ≈ “full” pace credit). */
function wpmContribution(wpm: number): number {
  if (wpm <= 0) return 0
  return Math.min(100, (wpm / 60) * 100)
}

/**
 * Session stars blend **accuracy** (~74%) and **WPM** (~26%) so a middling score
 * (e.g. ~70% + low teens WPM) isn’t lumped with very weak runs where both are poor.
 * Old logic was accuracy-only and ignored `wpm`, so everything below 80% was 1★.
 */
function starCount(accuracy: number, wpm: number): number {
  const a = Math.max(0, accuracy)
  const w = Math.max(0, wpm)
  if (a <= 0 && w <= 0) return 0
  if (a <= 0) return 0

  const blend = a * 0.74 + wpmContribution(w) * 0.26

  if (blend >= 91) return 5
  if (blend >= 79) return 4
  if (blend >= 66) return 3
  if (blend >= 52) return 2
  return 1
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function RingGauge({
  label,
  valueText,
  subText,
  percent,
  fromColor,
  toColor,
}: {
  label: string
  valueText: string
  subText?: string
  percent: number
  fromColor: string
  toColor: string
}) {
  const uid = useId().replace(/:/g, '')
  const gradId = `rg-${uid}`
  const p = Math.max(0, Math.min(100, percent))
  const r = 40
  const c = 2 * Math.PI * r
  const dash = (p / 100) * c

  return (
    <div className="flex min-w-0 flex-col items-center text-center">
      <div className="relative h-[4.25rem] w-[4.25rem] shrink-0 sm:h-[4.5rem] sm:w-[4.5rem]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-0.5">
          <span className="font-mono text-xs font-bold leading-tight tabular-nums text-white sm:text-[13px]">
            {valueText}
          </span>
          {subText && (
            <span className="mt-px max-w-[3.75rem] text-center text-[8px] leading-[1.15] text-zinc-500 line-clamp-2 sm:max-w-[4.25rem] sm:text-[9px]">
              {subText}
            </span>
          )}
        </div>
      </div>
      <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-[9px]">{label}</p>
    </div>
  )
}

function useResultsReveal(
  open: boolean,
  targets: {
    accuracy: number
    durationSec: number
    wpm: number
    errors: number
    keystrokes: number
    correctChars: number
  },
  showHighScoreBanner: boolean,
) {
  const [acc, setAcc] = useState(0)
  const [dur, setDur] = useState(0)
  const [wpmV, setWpmV] = useState(0)
  const [errs, setErrs] = useState(0)
  const [keys, setKeys] = useState(0)
  const [corr, setCorr] = useState(0)
  const [starsLit, setStarsLit] = useState(0)
  const [highScoreReveal, setHighScoreReveal] = useState(false)
  const runId = useRef(0)

  useEffect(() => {
    if (!open) {
      runId.current += 1
      setAcc(0)
      setDur(0)
      setWpmV(0)
      setErrs(0)
      setKeys(0)
      setCorr(0)
      setStarsLit(0)
      setHighScoreReveal(false)
      return
    }

    const myRun = ++runId.current
    const reduced = prefersReducedMotion()

    if (reduced) {
      setAcc(targets.accuracy)
      setDur(targets.durationSec)
      setWpmV(targets.wpm)
      setErrs(targets.errors)
      setKeys(targets.keystrokes)
      setCorr(targets.correctChars)
      setStarsLit(starCount(targets.accuracy, targets.wpm))
      setHighScoreReveal(showHighScoreBanner)
      return
    }

    setAcc(0)
    setDur(0)
    setWpmV(0)
    setErrs(0)
    setKeys(0)
    setCorr(0)
    setStarsLit(0)
    setHighScoreReveal(false)

    /** Slower ease-out so scores feel deliberate, not rushed. */
    const ease = [0.16, 0.84, 0.24, 1] as const
    const controls: ReturnType<typeof animate>[] = []

    controls.push(
      animate(0, targets.accuracy, {
        duration: 2.85,
        ease,
        onUpdate: (v) => {
          if (runId.current !== myRun) return
          setAcc(v)
        },
      }),
    )
    controls.push(
      animate(0, targets.durationSec, {
        duration: 2.65,
        ease,
        onUpdate: (v) => {
          if (runId.current !== myRun) return
          setDur(v)
        },
      }),
    )
    controls.push(
      animate(0, targets.wpm, {
        duration: 3.05,
        ease,
        onUpdate: (v) => {
          if (runId.current !== myRun) return
          setWpmV(v)
        },
      }),
    )
    controls.push(
      animate(0, targets.errors, {
        duration: 2.35,
        ease,
        onUpdate: (v) => {
          if (runId.current !== myRun) return
          setErrs(Math.round(v))
        },
      }),
    )
    controls.push(
      animate(0, targets.keystrokes, {
        duration: 2.75,
        ease,
        onUpdate: (v) => {
          if (runId.current !== myRun) return
          setKeys(Math.round(v))
        },
      }),
    )
    controls.push(
      animate(0, targets.correctChars, {
        duration: 2.75,
        ease,
        onUpdate: (v) => {
          if (runId.current !== myRun) return
          setCorr(Math.round(v))
        },
      }),
    )

    const earned = starCount(targets.accuracy, targets.wpm)
    const starDelayMs = 1100
    const starStepMs = 320
    const starTimers: number[] = []
    if (earned > 0) {
      for (let i = 1; i <= earned; i++) {
        starTimers.push(
          window.setTimeout(() => {
            if (runId.current !== myRun) return
            setStarsLit(i)
          }, starDelayMs + (i - 1) * starStepMs),
        )
      }
    }

    const highTimer = window.setTimeout(() => {
      if (runId.current !== myRun) return
      if (showHighScoreBanner) setHighScoreReveal(true)
    }, 3600)

    return () => {
      runId.current += 1
      controls.forEach((c) => c.stop())
      starTimers.forEach(clearTimeout)
      clearTimeout(highTimer)
    }
  }, [
    open,
    targets.accuracy,
    targets.durationSec,
    targets.wpm,
    targets.errors,
    targets.keystrokes,
    targets.correctChars,
    showHighScoreBanner,
  ])

  return {
    acc,
    dur,
    wpmV,
    errs,
    keys,
    corr,
    starsLit,
    highScoreReveal,
  }
}

export interface SessionResultsModalProps {
  open: boolean
  mode: TrainMode
  /** Timed mode ran out before finishing the line */
  timedOut: boolean
  wpm: number
  accuracy: number
  durationSec: number
  errors: number
  keystrokes: number
  correctChars: number
  lineLength: number
  caretIndex: number
  complete: boolean
  isNewHighScore: boolean
  bestWpm: number
  coach: CoachFeedback | null
  onRetry: () => void
}

export const SessionResultsModal = memo(function SessionResultsModal({
  open,
  mode,
  timedOut,
  wpm,
  accuracy,
  durationSec,
  errors,
  keystrokes,
  correctChars,
  lineLength,
  caretIndex,
  complete,
  isNewHighScore,
  bestWpm,
  coach,
  onRetry,
}: SessionResultsModalProps) {
  const targets = {
    accuracy,
    durationSec,
    wpm,
    errors,
    keystrokes,
    correctChars,
  }
  const showHighScoreBanner = isNewHighScore && wpm > 0
  const { acc, dur, wpmV, errs, keys, corr, starsLit, highScoreReveal } = useResultsReveal(
    open,
    targets,
    showHighScoreBanner,
  )

  if (!open) return null

  const earnedStars = starCount(accuracy, wpm)
  const accDisplay = Math.round(acc * 10) / 10
  const wpmDisplay = Math.round(wpmV)
  const lineProgressPct =
    lineLength > 0 ? Math.round((Math.min(caretIndex, lineLength) / lineLength) * 1000) / 10 : 0
  const completionLabel = complete ? 'Line finished' : `${lineProgressPct}% of line typed`

  const keysSub =
    keys > 0 || keystrokes > 0 ? `${Math.min(corr, correctChars)}/${Math.min(keys, keystrokes)} keys` : undefined

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3 py-6 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[#0a1628]/85 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className="relative my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0f172a] via-[#0c1322] to-[#070b14] shadow-[0_0_48px_rgba(34,211,238,0.1),inset_0_1px_0_rgba(255,255,255,0.05)] sm:max-w-2xl"
      >
        <div className="pointer-events-none absolute -left-16 top-0 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl" />

        <div className="relative px-4 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
          <h2 id="results-title" className="sr-only">
            Session results
          </h2>

          <div className="mb-3 flex h-7 justify-center gap-0.5 sm:h-8">
            {[1, 2, 3, 4, 5].map((i) => {
              const earned = i <= earnedStars
              const lit = earned && starsLit >= i
              const waiting = earned && !lit
              return (
                <motion.span
                  key={i}
                  className="inline-flex text-sm sm:text-base"
                  aria-hidden
                  initial={false}
                  animate={
                    lit
                      ? { scale: [1, 1.38, 1], opacity: 1 }
                      : { scale: 1, opacity: waiting ? 0.4 : earned ? 0.35 : 0.3 }
                  }
                  transition={
                    lit
                      ? { type: 'spring', stiffness: 520, damping: 17, mass: 0.65 }
                      : { duration: 0.2 }
                  }
                >
                  <span
                    className={
                      lit
                        ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.45)]'
                        : 'text-zinc-600'
                    }
                  >
                    ★
                  </span>
                </motion.span>
              )
            })}
          </div>
          <p className="mt-1 text-center text-[9px] leading-snug text-zinc-500 sm:text-[10px]">
            Stars mix accuracy (~three quarters) and speed (~one quarter), not accuracy alone.
          </p>

          <p className="mt-2 text-center text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-400/80 sm:text-[11px]">
            {timedOut ? 'Time up' : 'Session complete'} ·{' '}
            <span className="capitalize text-white">{mode}</span>
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-5 sm:gap-3">
            <RingGauge
              label="accuracy"
              valueText={`${accDisplay}%`}
              subText={keysSub}
              percent={accDisplay}
              fromColor="#34d399"
              toColor="#22d3ee"
            />
            <RingGauge
              label="duration"
              valueText={formatDuration(dur)}
              subText="min : sec"
              percent={Math.min(100, (dur / 120) * 100)}
              fromColor="#fbbf24"
              toColor="#f97316"
            />
            <RingGauge
              label="speed"
              valueText={`${wpmDisplay} wpm`}
              subText={bestWpm > 0 ? `best ${bestWpm} wpm` : 'gross wpm'}
              percent={Math.min(100, (wpmV / 120) * 100)}
              fromColor="#a78bfa"
              toColor="#22d3ee"
            />
          </div>

          {isNewHighScore && wpm > 0 && (
            <motion.div
              className="mt-4 text-center sm:mt-5"
              initial={false}
              animate={{
                opacity: highScoreReveal ? 1 : 0,
                scale: highScoreReveal ? 1 : 0.88,
                y: highScoreReveal ? 0 : 6,
              }}
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            >
              <p className="font-mono text-2xl font-bold tabular-nums text-white sm:text-3xl">{wpmDisplay}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300 sm:text-xs">
                New high score
              </p>
              <div className="mx-auto mt-2 h-px max-w-[10rem] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>
          )}

          <div
            className={
              coach
                ? 'mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,15.5rem)_1fr] md:items-start md:gap-4'
                : 'mt-3 grid grid-cols-1 gap-3'
            }
          >
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 sm:gap-4 sm:py-3 md:flex-nowrap md:flex-col md:gap-2 md:py-3">
              <div className="min-w-[4.5rem] text-center md:min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-[9px]">Errors</p>
                <p className="mt-0.5 font-mono text-lg font-bold text-rose-300 tabular-nums sm:text-xl">{errs}</p>
              </div>
              <div className="hidden h-px w-full bg-white/10 md:block" />
              <div className="h-8 w-px shrink-0 bg-white/10 md:hidden" />
              <div className="min-w-[4.5rem] text-center md:min-w-0">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-[9px]">
                  Keystrokes
                </p>
                <p className="mt-0.5 font-mono text-lg font-bold text-zinc-200 tabular-nums sm:text-xl">{keys}</p>
              </div>
              <div className="hidden h-px w-full bg-white/10 md:block" />
              <div className="h-8 w-px shrink-0 bg-white/10 md:hidden" />
              <div className="min-w-0 max-w-[11rem] flex-1 text-center sm:max-w-none md:max-w-none">
                <p className="text-[8px] font-semibold uppercase tracking-wider text-zinc-500 sm:text-[9px]">
                  Progress
                </p>
                <p className="mt-0.5 text-[11px] font-medium leading-snug text-zinc-300 sm:text-xs">{completionLabel}</p>
              </div>
            </div>

            {coach && (
              <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 text-xs text-zinc-400 md:py-3">
                <p className="text-[13px] leading-snug text-zinc-200 sm:text-sm">{coach.summary}</p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-3.5 text-[11px] leading-snug sm:text-xs">
                  {coach.tips.slice(0, 3).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="order-2 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 sm:order-1 sm:px-5 sm:text-sm"
            >
              Try again
            </button>
            <p className="order-1 text-center text-[11px] leading-snug text-zinc-500 sm:order-2 sm:flex-1 sm:text-xs">
              {timedOut
                ? 'Timer ended — adjust pace or try a longer time box next round.'
                : complete
                  ? 'Excellent work! Ready for another line or a new mode?'
                  : 'Session saved — keep drilling to finish lines faster.'}
            </p>
            <Link
              to="/modes"
              className="order-3 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-[0_4px_18px_rgba(52,211,153,0.28)] transition hover:brightness-110 sm:px-5 sm:text-sm"
            >
              Next
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})
