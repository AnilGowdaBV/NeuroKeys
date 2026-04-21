import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AnimatedTypingBackdrop } from '../components/Hero/AnimatedTypingBackdrop'
import { AmbientBackground } from '../components/layout/AmbientBackground'
import { BrandLogo } from '../components/Hero/BrandLogo'
import { LandingLights } from '../components/Hero/LandingLights'
import { HeroFloatingShowcase } from '../components/Hero/HeroFloatingShowcase'
import clsx from 'clsx'

const FEATURES = [
  {
    n: '01',
    title: 'Blind focus',
    body: 'Only the active word stays sharp — the rest fades so attention stays on the line.',
  },
  {
    n: '02',
    title: 'Adaptive drills',
    body: 'Every key is tracked; practice lines lean into what you miss until it sticks.',
  },
  {
    n: '03',
    title: 'Modes for every pace',
    body: 'Beginner calm, timed sprints, adaptive smart lines, or paste your own text.',
  },
  {
    n: '04',
    title: 'Local-first stats',
    body: 'WPM, accuracy, and session history stay on your device — no account wall.',
  },
] as const

function NavPill({
  to,
  href,
  children,
  active,
}: {
  to?: string
  href?: string
  children: ReactNode
  active?: boolean
}) {
  const className = clsx(
    'rounded-full px-4 py-2 text-xs font-medium transition sm:text-sm',
    active
      ? 'bg-white/[0.12] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
      : 'text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200',
  )
  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

function FeatureCard({
  n,
  title,
  body,
  className,
}: {
  n: string
  title: string
  body: string
  className?: string
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-24px' }}
      transition={{ duration: 0.4 }}
      className={clsx(
        'group relative overflow-hidden rounded-2xl border border-white/[0.1] bg-gradient-to-br from-fuchsia-500/[0.08] via-black/50 to-violet-600/[0.06] p-[1px] shadow-[0_0_48px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-shadow duration-300 hover:shadow-[0_0_56px_rgba(244,114,182,0.12)]',
        className,
      )}
    >
      <div className="h-full rounded-[15px] bg-[#070910]/90 p-4 sm:p-5">
        <p className="font-mono text-lg font-bold text-fuchsia-400/95 sm:text-xl">{n}</p>
        <h3 className="mt-2 font-display text-base font-bold text-white sm:text-lg">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">{body}</p>
      </div>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl transition group-hover:bg-fuchsia-400/15" />
    </motion.article>
  )
}

export function LandingPage() {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#03040a]">
      <AmbientBackground />
      <LandingLights />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:36px_36px] opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_82%)]" />
      <AnimatedTypingBackdrop />

      <div className="relative z-10 mx-auto flex min-h-svh max-w-6xl flex-col px-4 pb-14 pt-4 sm:px-6 sm:pb-20 sm:pt-6 lg:px-10">
        <header className="flex flex-col gap-4 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:pb-8">
          <BrandLogo embed />
          <nav className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
            <NavPill to="/" active>
              Home
            </NavPill>
            <NavPill to="/modes">Train</NavPill>
            <NavPill href="#features">Features</NavPill>
            <NavPill href="#about">About</NavPill>
          </nav>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
            <a
              href="#features"
              className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs font-semibold text-zinc-200 transition hover:border-fuchsia-400/40 hover:bg-white/[0.04] hover:text-white sm:text-sm"
            >
              Learn more
            </a>
            <Link
              to="/modes"
              className="rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 px-5 py-2 text-xs font-bold text-white shadow-[0_0_32px_rgba(217,70,239,0.35)] transition hover:brightness-110 sm:text-sm"
            >
              Start training
            </Link>
          </div>
        </header>

        {/* Hero — headline + focal card (reference: strong center weight, not a clone) */}
        <div className="mt-8 flex flex-1 flex-col gap-10 lg:mt-14 lg:grid lg:grid-cols-[1fr_minmax(280px,380px)] lg:items-center lg:gap-12 xl:gap-16">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center text-center lg:text-left"
          >
            <p className="mb-4 inline-flex items-center justify-center self-center rounded-full border border-fuchsia-500/25 bg-fuchsia-500/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-fuchsia-200/90 sm:self-start">
              Typing lab
            </p>

            <h1 className="font-display text-[1.85rem] font-bold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl">
              Why choose{' '}
              <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                NeuroKeys?
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-sm leading-relaxed text-zinc-500 sm:text-base lg:mx-0">
              Train muscle memory with blind focus, adaptive lines, and modes from calm drills to timed
              sprints — built for screens of every size.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="mt-8 flex w-full max-w-md flex-col gap-3 sm:mx-auto sm:flex-row sm:justify-center lg:mx-0 lg:justify-start"
            >
              <Link
                to="/modes"
                className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-500 px-8 py-3 text-sm font-bold text-white shadow-[0_0_40px_rgba(217,70,239,0.3)] transition hover:brightness-110 sm:w-auto"
              >
                Join a session
              </Link>
              <a
                href="#features"
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/35 hover:bg-white/[0.04] hover:text-white sm:w-auto sm:px-8"
              >
                Explore features
              </a>
            </motion.div>
          </motion.section>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.06, duration: 0.5 }}
            className="relative flex min-h-[240px] items-center justify-center sm:min-h-[280px]"
          >
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-b from-fuchsia-500/15 via-transparent to-violet-600/10 blur-3xl" />
            <HeroFloatingShowcase />
          </motion.div>
        </div>

        {/* Feature orbit — reference-style numbered glass cards */}
        <section id="features" className="mt-14 sm:mt-20">
          <p className="mb-6 text-center font-mono text-[10px] font-medium uppercase tracking-[0.35em] text-fuchsia-400/80 sm:mb-8 lg:hidden">
            Feature stack
          </p>
          <div className="mx-auto hidden max-w-5xl grid-cols-3 grid-rows-2 gap-5 lg:grid xl:gap-6">
            <FeatureCard {...FEATURES[0]} className="lg:col-start-1 lg:row-start-1" />
            <FeatureCard {...FEATURES[1]} className="lg:col-start-3 lg:row-start-1" />
            <div className="flex items-center justify-center py-6 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:py-8">
              <div className="relative flex max-w-[16rem] flex-col items-center gap-4">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500/45 to-transparent" />
                <p className="text-center font-display text-sm font-semibold leading-snug text-zinc-400">
                  Four pillars around your flow — same idea as a hero stack, tuned for typing.
                </p>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
              </div>
            </div>
            <FeatureCard {...FEATURES[2]} className="lg:col-start-1 lg:row-start-2" />
            <FeatureCard {...FEATURES[3]} className="lg:col-start-3 lg:row-start-2" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:hidden">
            {FEATURES.map((f) => (
              <FeatureCard key={f.n} {...f} />
            ))}
          </div>
        </section>

        {/* Decorative “timeline” strip — echo of reference progress bar, non-interactive */}
        <div
          className="mt-12 flex items-center gap-3 sm:mt-16"
          aria-hidden
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-[10px] text-zinc-500">
            ●
          </span>
          <div className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
            <motion.div
              className="absolute inset-y-0 left-0 w-2/5 rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-400 to-violet-500"
              initial={{ x: '-100%' }}
              animate={{ x: ['-100%', '120%'] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </div>

        <footer id="about" className="mt-12 border-t border-white/[0.06] pt-10 text-center sm:mt-16">
          <p className="font-display text-sm font-semibold text-white">NeuroKeys</p>
          <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-zinc-500 sm:text-sm">
            Local-first typing practice. No account — your sessions and stats stay in the browser.
          </p>
          <p className="mt-6 text-[11px] text-zinc-600">© {new Date().getFullYear()} NeuroKeys</p>
        </footer>
      </div>
    </div>
  )
}
