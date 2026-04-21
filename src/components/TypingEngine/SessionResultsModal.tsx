import { memo, useId, useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { animate, motion, AnimatePresence } from 'framer-motion'
import type { TrainMode } from '../../types'
import type { CoachFeedback } from '../../services/aiService'

function formatDuration(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

function wpmContribution(wpm: number): number {
  if (wpm <= 0) return 0
  return Math.min(100, (wpm / 60) * 100)
}

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
      <div className="relative h-[4.5rem] w-[4.5rem] shrink-0 sm:h-20 sm:w-20">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fromColor} />
              <stop offset="100%" stopColor={toColor} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            style={{ filter: `drop-shadow(0 0 6px ${toColor}aa)` }}
            className="transition-[stroke-dasharray] duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
          <span className="font-mono text-sm font-bold leading-tight tabular-nums text-white sm:text-base">
            {valueText}
          </span>
          {subText && (
            <span className="mt-0.5 max-w-[4.25rem] text-center text-[9px] leading-[1.1] text-zinc-500 line-clamp-2">
              {subText}
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 sm:text-xs">{label}</p>
    </div>
  )
}

function TypewriterText({ text, delay = 12, onComplete }: { text: string; delay?: number; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('')
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index])
        setIndex((prev) => prev + 1)
      }, delay)
      return () => clearTimeout(timeout)
    } else {
      onComplete?.()
    }
  }, [index, text, delay, onComplete])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedText])

  return (
    <div ref={containerRef} className="h-full overflow-y-auto scroll-smooth pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
       <p className="whitespace-pre-wrap pb-10 text-[13px] leading-relaxed text-zinc-300 sm:text-sm">
         {displayedText}
         <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block h-4 w-1 bg-violet-400 align-middle ml-0.5" />
       </p>
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
    syncScore: number
  },
  showHighScoreBanner: boolean,
) {
  const [acc, setAcc] = useState(0)
  const [dur, setDur] = useState(0)
  const [wpmV, setWpmV] = useState(0)
  const [syncV, setSyncV] = useState(0)
  const [errs, setErrs] = useState(0)
  const [keys, setKeys] = useState(0)
  const [corr, setCorr] = useState(0)
  const [starsLit, setStarsLit] = useState(0)
  const [highScoreReveal, setHighScoreReveal] = useState(false)
  const runId = useRef(0)

  const { accuracy: tAcc, durationSec: tDur, wpm: tWpm, errors: tErrs, keystrokes: tKeys, correctChars: tCorr, syncScore: tSync } = targets

  useEffect(() => {
    if (!open) {
      runId.current += 1
      setAcc(0)
      setDur(0)
      setWpmV(0)
      setSyncV(0)
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
      setAcc(tAcc)
      setDur(tDur)
      setWpmV(tWpm)
      setSyncV(tSync)
      setErrs(tErrs)
      setKeys(tKeys)
      setCorr(tCorr)
      setStarsLit(starCount(tAcc, tWpm))
      setHighScoreReveal(showHighScoreBanner)
      return
    }

    const ease = [0.16, 0.84, 0.24, 1] as const
    const controls: ReturnType<typeof animate>[] = []

    controls.push(animate(0, tAcc, { duration: 2.5, ease, onUpdate: (v) => { if (runId.current === myRun) setAcc(v) } }))
    controls.push(animate(0, tDur, { duration: 2.2, ease, onUpdate: (v) => { if (runId.current === myRun) setDur(v) } }))
    controls.push(animate(0, tWpm, { duration: 2.8, ease, onUpdate: (v) => { if (runId.current === myRun) setWpmV(v) } }))
    controls.push(animate(0, tSync, { duration: 3.0, ease, onUpdate: (v) => { if (runId.current === myRun) setSyncV(v) } }))
    controls.push(animate(0, tErrs, { duration: 1.8, ease, onUpdate: (v) => { if (runId.current === myRun) setErrs(Math.round(v)) } }))
    controls.push(animate(0, tKeys, { duration: 2.4, ease, onUpdate: (v) => { if (runId.current === myRun) setKeys(Math.round(v)) } }))
    controls.push(animate(0, tCorr, { duration: 2.4, ease, onUpdate: (v) => { if (runId.current === myRun) setCorr(Math.round(v)) } }))

    const earned = starCount(tAcc, tWpm)
    const starTimers: number[] = []
    if (earned > 0) {
      for (let i = 1; i <= earned; i++) {
        starTimers.push(window.setTimeout(() => { if (runId.current === myRun) setStarsLit(i) }, 800 + (i - 1) * 250))
      }
    }

    const highTimer = window.setTimeout(() => { if (runId.current === myRun && showHighScoreBanner) setHighScoreReveal(true) }, 3200)

    return () => {
      runId.current += 1
      controls.forEach((c) => c.stop())
      starTimers.forEach(clearTimeout)
      clearTimeout(highTimer)
    }
  }, [open, tAcc, tDur, tWpm, tErrs, tKeys, tCorr, showHighScoreBanner])

  return { acc, dur, wpmV, syncV, errs, keys, corr, starsLit, highScoreReveal }
}

export interface SessionResultsModalProps {
  open: boolean
  mode: TrainMode
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
  complete,
  isNewHighScore,
  coach,
  onRetry,
}: SessionResultsModalProps) {
  const targets = { accuracy, durationSec, wpm, errors, keystrokes, correctChars, syncScore: coach?.syncScore ?? 0 }
  const showHighScoreBanner = isNewHighScore && wpm > 0
  const { acc, dur, wpmV, syncV, errs, keys, corr, starsLit } = useResultsReveal(open, targets, showHighScoreBanner)
  const [showDetailedAI, setShowDetailedAI] = useState(false)

  if (!open) return null

  const accDisplay = Math.round(acc * 10) / 10
  const wpmDisplay = Math.round(wpmV)
  const keysSub = keys > 0 || keystrokes > 0 ? `${Math.min(corr, correctChars)}/${Math.min(keys, keystrokes)} keys` : undefined

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 py-6 sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" />

      {/* Main Results Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        className="relative my-auto flex w-full max-w-lg flex-col divide-y divide-white/5 overflow-hidden rounded-3xl border border-white/10 bg-[#0c1220] shadow-[0_0_80px_-12px_rgba(34,211,238,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
      >
        {/* Glow header decorative line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="px-6 pb-6 pt-8 sm:px-10 sm:pb-8 sm:pt-10">
          {/* Header & Stars */}
          <div className="flex flex-col items-center">
             <div className="mb-4 flex gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.span
                    key={i}
                    className="text-xl sm:text-2xl"
                    animate={i <= starsLit ? { scale: [1, 1.3, 1], opacity: 1 } : { opacity: 0.2, scale: 1 }}
                  >
                    <span className={i <= starsLit ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' : 'text-zinc-600'}>★</span>
                  </motion.span>
                ))}
              </div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-cyan-400/70">
                {timedOut ? 'Time Over' : 'Session Complete'}
              </p>
              <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
                 {mode}
              </h2>
          </div>

          {/* Core Gauges */}
          <div className="mt-8 grid grid-cols-4 gap-2">
            <RingGauge label="accuracy" valueText={`${accDisplay}%`} subText={keysSub} percent={accDisplay} fromColor="#06b6d4" toColor="#22d3ee" />
            <RingGauge label="duration" valueText={formatDuration(dur)} subText="duration" percent={Math.min(100, (dur / 120) * 100)} fromColor="#f59e0b" toColor="#fbbf24" />
            <RingGauge label="speed" valueText={`${wpmDisplay}`} subText="wpm" percent={Math.min(100, (wpmV / 120) * 100)} fromColor="#8b5cf6" toColor="#a78bfa" />
            <RingGauge label="neuro sync" valueText={`${Math.round(syncV)}%`} subText="cohesion" percent={syncV} fromColor="#22d3ee" toColor="#8b5cf6" />
          </div>

          {/* Secondary Stats */}
          <div className="mt-8 flex items-center justify-around rounded-2xl border border-white/5 bg-white/[0.015] p-4 text-center">
             <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Errors</p>
                <p className="mt-1 font-mono text-xl font-bold text-rose-400">{errs}</p>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Keys</p>
                <p className="mt-1 font-mono text-xl font-bold text-zinc-200">{keys}</p>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Status</p>
                <p className="mt-1 text-[11px] font-bold text-cyan-300">{complete ? 'Finished' : 'Partial'}</p>
             </div>
          </div>

          {/* AI Coach Trigger */}
          <div className="mt-8">
             <motion.button
               animate={{ 
                 boxShadow: [
                   '0 0 0px rgba(139,92,246,0)', 
                   '0 0 20px rgba(139,92,246,0.3)', 
                   '0 0 0px rgba(139,92,246,0)'
                 ],
                 borderColor: [
                   'rgba(139,92,246,0.3)',
                   'rgba(167,139,250,0.6)',
                   'rgba(139,92,246,0.3)'
                 ]
               }}
               transition={{ repeat: Infinity, duration: 2.5 }}
               onClick={() => setShowDetailedAI(true)}
               className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border-2 bg-violet-500/10 px-6 py-5 transition hover:bg-violet-500/20"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/30 text-violet-300 ring-2 ring-violet-500/30 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <div className="text-left">
                    <span className="flex items-center gap-2">
                       <p className="text-xs font-black uppercase tracking-wider text-white">NeuroCoach Analysis</p>
                       <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[8px] font-black uppercase text-cyan-400 ring-1 ring-cyan-500/30">New Advice</span>
                    </span>
                    <p className="text-[10px] font-medium text-violet-200/60 mt-0.5">Deep AI-powered behavior breakdown</p>
                  </div>
               </div>
               <div className="relative flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-violet-300 group-hover:text-white transition-colors">
                  Open 
                  <motion.svg 
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </motion.svg>
               </div>
             </motion.button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-3 bg-white/[0.01] px-6 py-6 sm:px-10 sm:flex-row sm:items-center sm:justify-between">
           <button onClick={onRetry} className="h-12 grow rounded-2xl border border-white/10 px-6 text-sm font-bold text-white transition hover:bg-white/5 active:scale-95">
             Try Again
           </button>
           <Link to="/modes" className="inline-flex h-12 grow items-center justify-center rounded-2xl bg-cyan-500 px-6 text-sm font-black text-slate-950 transition hover:bg-cyan-400 active:scale-95 shadow-[0_8px_20px_-8px_rgba(6,185,129,0.5)]">
             Choose Next Mode
           </Link>
        </div>
      </motion.div>

      {/* AI COACH OVERLAY (Slide-out Drawer) */}
      <AnimatePresence>
        {showDetailedAI && (
          <div className="fixed inset-0 z-[60] flex items-center justify-end p-0 sm:p-6 pointer-events-none">
            {/* Darker backdrop for focus */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetailedAI(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto"
            />

            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#0a0c14] shadow-[-20px_0_80px_rgba(0,0,0,0.8)] pointer-events-auto sm:h-[640px] sm:rounded-[2.5rem] sm:border sm:mb-24 sm:mr-4 overflow-hidden"
            >
              {/* Scanline / Texture Overlay */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_4px,3px_100%] z-10 opacity-20" />
              
              {/* Dossier Background Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:20px_20px]" />
              {/* Drawer Header */}
              <div className="relative z-20 flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-6 py-6 sm:px-8">
                 <div className="flex items-center gap-3">
                   <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/30">
                     <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                   </div>
                   <div>
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">NeuroCoach Dossier</h3>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase">Analysis ID: {Math.random().toString(36).substring(7)}</p>
                   </div>
                 </div>
                 <button
                   onClick={() => setShowDetailedAI(false)}
                   className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
                 >
                   <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              {/* Drawer Content */}
              <div className="relative z-20 flex-1 overflow-hidden px-6 py-8 sm:px-8">
                 <div className="mb-8 flex items-center justify-between rounded-xl bg-violet-500/5 px-4 py-3 ring-1 ring-violet-500/20">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400 leading-none">Pattern Analysis</span>
                       <span className="text-[9px] font-bold text-zinc-500 mt-1 italic">{coach?.pattern || 'Processing behavior...'}</span>
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center">
                       <div className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
                    </div>
                 </div>

                  <div className="h-full overflow-y-auto pr-2 pb-12 custom-scrollbar">
                    {coach?.detailedMessage ? (
                      <>
                        <div className="mb-8 space-y-3">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400/80">Strategic Tips</h4>
                          {coach.tips.map((tip, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.1 * idx }}
                              className="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-xs font-medium leading-relaxed text-zinc-300 shadow-sm"
                            >
                              <span className="mr-2 text-cyan-400">⚡</span>
                              {tip}
                            </motion.div>
                          ))}
                        </div>

                        <div className="space-y-4 border-t border-white/5 pt-8">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400/80">Deep Analysis</h4>
                          <TypewriterText text={coach.detailedMessage} delay={10} />
                        </div>
                      </>
                    ) : (
                      <div className="flex h-40 flex-col items-center justify-center gap-4 text-zinc-500">
                         <div className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                         <p className="animate-pulse text-xs font-bold uppercase tracking-widest">Generating Neuro-Metrics...</p>
                      </div>
                    )}
                  </div>
              </div>

              {/* Drawer Footer */}
              <div className="relative z-20 border-t border-white/5 p-6 sm:p-8 bg-black/40 backdrop-blur-md">
                 <button
                   onClick={() => setShowDetailedAI(false)}
                   className="group relative w-full overflow-hidden rounded-2xl bg-violet-600 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition hover:bg-violet-500 active:scale-[0.98] shadow-lg"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   Close Dossier
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})
