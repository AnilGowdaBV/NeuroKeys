import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { SessionConfig } from '../types'
import { pickPracticeParagraph, type PracticePoolId } from '../data/practice'
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning'
import { useSessionHistory } from '../hooks/useSessionHistory'
import { ActiveTypingSession } from '../components/TypingEngine/ActiveTypingSession'
import { AmbientBackground } from '../components/layout/AmbientBackground'
import { AnimatedTypingBackdrop } from '../components/Hero/AnimatedTypingBackdrop'
import { LandingLights } from '../components/Hero/LandingLights'
import { defaultPracticeText } from '../utils/textGenerator'

function poolIdForMode(mode: SessionConfig['mode']): PracticePoolId | null {
  if (mode === 'beginner' || mode === 'timed' || mode === 'adaptive') return mode
  return null
}

export function TypingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const config = location.state as SessionConfig | undefined

  const [targetText, setTargetText] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [liveSync, setLiveSync] = useState(0)

  const [focusMode, setFocusMode] = useState(true)
  const [strictMode, setStrictMode] = useState(false)
  const [sound, setSound] = useState(false)

  const { recordKeyAttempt, topProblemKeys } = useAdaptiveLearning()
  const { addSession } = useSessionHistory()

  useEffect(() => {
    if (!config) {
      navigate('/modes', { replace: true })
    }
  }, [config, navigate])

  useEffect(() => {
    if (!config) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setLoadError(null)
      try {
        if (config.mode === 'custom') {
          const t = config.customText?.trim()
          setTargetText(t && t.length > 0 ? t : defaultPracticeText())
        } else {
          const id = poolIdForMode(config.mode)
          if (id) setTargetText(pickPracticeParagraph(id))
        }
      } catch {
        setLoadError('Could not load practice text. Using a fallback line.')
        setTargetText(defaultPracticeText())
      } finally {
        if (!cancelled) setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [config])

  const shuffleLine = useCallback(() => {
    if (!config) return
    const id = poolIdForMode(config.mode)
    if (!id) return
    setTargetText((prev) => pickPracticeParagraph(id, prev))
  }, [config])

  useEffect(() => {
    const block = (e: ClipboardEvent) => e.preventDefault()
    document.addEventListener('paste', block)
    return () => document.removeEventListener('paste', block)
  }, [])

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#03040a]">
      <AmbientBackground syncFactor={liveSync} />
      <LandingLights />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:36px_36px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_82%)]" />
      <AnimatedTypingBackdrop />

      <div className="relative z-10 mx-auto max-w-6xl space-y-8 px-4 pb-12 pt-4 sm:space-y-10 sm:px-6 sm:pb-16 sm:pt-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
          <Link
            to="/modes"
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-zinc-400 shadow-[0_0_24px_rgba(0,0,0,0.25)] backdrop-blur-sm transition hover:border-teal-400/40 hover:bg-teal-500/10 hover:text-white hover:shadow-[0_0_32px_rgba(45,212,191,0.12)]"
          >
            <span className="transition group-hover:-translate-x-0.5">←</span> Modes
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
            {(
              [
                ['Focus', focusMode, (v: boolean) => setFocusMode(v)],
                ['Strict', strictMode, (v: boolean) => setStrictMode(v)],
                ['Sound', sound, (v: boolean) => setSound(v)],
              ] as const
            ).map(([label, checked, set]) => (
              <label
                key={label}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                  checked
                    ? 'border-teal-400/45 bg-teal-500/15 text-teal-100 shadow-[0_0_24px_rgba(45,212,191,0.15)]'
                    : 'border-white/10 bg-white/[0.04] text-zinc-500 hover:border-white/20 hover:bg-white/[0.06] hover:text-zinc-300'
                }`}
              >
                <input
                  type="checkbox"
                  className="size-3.5 rounded border-white/25 accent-teal-400 sm:size-4"
                  checked={checked}
                  onChange={(e) => set(e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>
        </header>

        {loadError && (
          <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {loadError}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="size-10 animate-spin rounded-full border-2 border-teal-400/30 border-t-teal-400" />
            <p className="text-sm text-nk-muted">Preparing your line…</p>
          </div>
        ) : config && targetText.length > 0 ? (
          <ActiveTypingSession
            key={targetText}
            targetText={targetText}
            config={config}
            focusMode={focusMode}
            strictMode={strictMode}
            sound={sound}
            recordKeyAttempt={recordKeyAttempt}
            topProblemKeys={topProblemKeys}
            addSession={addSession}
            onShuffleLine={config.mode !== 'custom' ? shuffleLine : undefined}
            onSyncUpdate={setLiveSync}
          />
        ) : null}
      </div>
    </div>
  )
}
