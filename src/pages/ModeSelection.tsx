import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Difficulty, SessionConfig, TrainMode } from '../types'
import { ModeSelector } from '../components/ModeSelector/ModeSelector'
import { AmbientBackground } from '../components/layout/AmbientBackground'
import { AnimatedTypingBackdrop } from '../components/Hero/AnimatedTypingBackdrop'
import { LandingLights } from '../components/Hero/LandingLights'
import { BrandLogo } from '../components/Hero/BrandLogo'
import { defaultPracticeText } from '../utils/textGenerator'

export function ModeSelection() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<TrainMode>('beginner')
  const [timer, setTimer] = useState(60)
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [customText, setCustomText] = useState(defaultPracticeText())
  const [customWarn, setCustomWarn] = useState(false)

  const start = () => {
    if (mode === 'custom' && !customText.trim()) {
      setCustomWarn(true)
      return
    }
    setCustomWarn(false)
    const config: SessionConfig = {
      mode,
      timerSeconds: mode === 'timed' ? timer : undefined,
      difficulty: mode === 'adaptive' ? difficulty : undefined,
      customText: mode === 'custom' ? customText : undefined,
      focusMode: true,
      strictMode: false,
      soundEnabled: false,
    }
    navigate('/type', { state: config })
  }

  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#03040a]">
      <AmbientBackground />
      <LandingLights />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:36px_36px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_82%)]" />
      <AnimatedTypingBackdrop />

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <BrandLogo embed />
            <Link
              to="/"
              className="group inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-teal-400/35 hover:bg-teal-500/10 hover:text-white sm:text-sm"
            >
              <span className="transition group-hover:-translate-x-0.5">←</span> Home
            </Link>
          </div>
          <span className="inline-flex items-center justify-center self-start rounded-full border border-fuchsia-500/30 bg-gradient-to-r from-teal-500/12 via-fuchsia-500/10 to-violet-500/12 px-4 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-teal-100/95 shadow-[0_0_28px_rgba(217,70,239,0.15)] sm:self-center">
            Pick a mode
          </span>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 sm:mt-10"
        >
          <h1 className="font-display text-[1.85rem] font-bold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl md:leading-[1.08]">
            Choose how you want{' '}
            <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_36px_rgba(45,212,191,0.18)]">
              to train
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-zinc-500 sm:text-base sm:leading-relaxed">
            Calm beginner runs, timed sprints, adaptive smart lines, or your own text — tap a card,
            tune options, then continue.
          </p>
          <div className="mt-6 h-px max-w-lg bg-gradient-to-r from-teal-500/30 via-fuchsia-500/20 to-violet-500/30" />
        </motion.div>

        <div className="mt-10 sm:mt-12">
          <ModeSelector
            selected={mode}
            onSelect={setMode}
            timerChoice={timer}
            onTimerChange={setTimer}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            customText={customText}
            onCustomText={setCustomText}
          />
        </div>

        {customWarn && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl border border-rose-400/35 bg-gradient-to-r from-rose-500/15 to-rose-600/5 px-4 py-3 text-sm text-rose-100 shadow-[0_0_32px_rgba(251,113,133,0.12)] backdrop-blur-sm"
          >
            Add some text for custom mode, or pick another mode.
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 380, damping: 30 }}
          className="mt-10 flex flex-col items-stretch gap-3 sm:mt-14 sm:flex-row sm:flex-wrap sm:justify-end sm:gap-3"
        >
          <button
            type="button"
            onClick={start}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_40px_rgba(217,70,239,0.3)] transition hover:brightness-110 sm:w-auto sm:min-w-[15rem]"
          >
            Continue to session
          </button>
          <Link
            to="/"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/20 py-3.5 text-center text-sm font-semibold text-zinc-300 transition hover:border-white/35 hover:bg-white/[0.04] hover:text-white sm:w-auto sm:px-8"
          >
            Back to landing
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
