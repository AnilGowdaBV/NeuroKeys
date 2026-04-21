import { useId } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'

/** Four-key grid mark — reads as keyboard + “neural” link between caps. */
function LogoMark({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, '')
  const gShell = `nk-shell-${uid}`
  const gKey = `nk-key-${uid}`
  const gAccent = `nk-accent-${uid}`

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <defs>
        <linearGradient id={gShell} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#0f172a" />
          <stop offset="1" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={gKey} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#5eead4" />
          <stop offset="0.5" stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id={gAccent} x1="0" y1="1" x2="1" y2="0">
          <stop stopColor="rgba(45,212,191,0.35)" />
          <stop offset="1" stopColor="rgba(167,139,250,0.4)" />
        </linearGradient>
      </defs>
      {/* Outer rounded chassis */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="11"
        fill={`url(#${gShell})`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />
      <rect x="2.5" y="2.5" width="43" height="43" rx="10" fill="none" stroke="rgba(255,255,255,0.06)" />
      {/* Four key caps */}
      <rect x="7" y="7" width="15" height="15" rx="4" fill="#0b1220" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" />
      <rect x="26" y="7" width="15" height="15" rx="4" fill={`url(#${gKey})`} opacity="0.92" />
      <rect x="7" y="26" width="15" height="15" rx="4" fill={`url(#${gKey})`} opacity="0.75" />
      <rect x="26" y="26" width="15" height="15" rx="4" fill="#0b1220" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" />
      {/* Key tops / bevel */}
      <rect x="8" y="8" width="13" height="4" rx="1.5" fill="rgba(255,255,255,0.06)" />
      <rect x="27" y="8" width="13" height="4" rx="1.5" fill="rgba(255,255,255,0.12)" />
      <rect x="8" y="27" width="13" height="4" rx="1.5" fill="rgba(255,255,255,0.1)" />
      <rect x="27" y="27" width="13" height="4" rx="1.5" fill="rgba(255,255,255,0.06)" />
      {/* Neural link */}
      <path
        d="M 14.5 14.5 L 24 24 L 33.5 33.5"
        fill="none"
        stroke={`url(#${gAccent})`}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
      <circle cx="24" cy="24" r="2.2" fill="#22d3ee" opacity="0.9" />
    </svg>
  )
}

export function BrandLogo({
  size = 'default',
  embed = false,
}: {
  size?: 'default' | 'hero'
  /** Flush header on landing: no halo card, tighter chrome. */
  embed?: boolean
}) {
  const isHero = size === 'hero'

  return (
    <Link
      to="/"
      className={clsx(
        'group flex items-center outline-none transition focus-visible:ring-2 focus-visible:ring-teal-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-nk-bg',
        embed ? 'gap-3 rounded-lg sm:gap-3.5' : 'gap-3 rounded-2xl ring-teal-400/0 sm:gap-4',
      )}
    >
      <div className={clsx('relative shrink-0', !embed && 'rounded-2xl')}>
        {!embed && (
          <div
            className={`absolute rounded-3xl bg-gradient-to-br from-teal-400/45 to-violet-500/35 blur-2xl transition group-hover:opacity-100 group-hover:blur-3xl ${isHero ? 'inset-[-12px]' : 'inset-[-8px] opacity-90'}`}
          />
        )}
        <LogoMark
          className={clsx(
            'relative z-[1] transition duration-300',
            embed
              ? 'h-10 w-10 sm:h-11 sm:w-11 group-hover:scale-[1.03]'
              : `group-hover:scale-105 group-hover:[filter:drop-shadow(0_12px_24px_rgba(45,212,191,0.4))] ${isHero ? 'h-14 w-14 sm:h-16 sm:w-16' : 'h-9 w-9 sm:h-10 sm:w-10'}`,
          )}
        />
      </div>
      <div className="min-w-0 text-left">
        <div
          className={clsx(
            'font-display font-bold leading-[1.05] tracking-[-0.04em]',
            embed ? 'text-lg sm:text-xl' : isHero ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-lg sm:text-xl',
          )}
        >
          <span className="text-white">Neuro</span>
          <span className="bg-gradient-to-r from-teal-300 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
            Keys
          </span>
        </div>
        <p
          className={clsx(
            'font-display font-semibold uppercase tracking-[0.28em] text-teal-400/85',
            embed ? 'mt-1 text-[9px] sm:text-[10px]' : isHero ? 'mt-1 text-[9px] sm:text-[10px]' : 'mt-0.5 hidden text-[8px] sm:block sm:text-[9px]',
          )}
        >
          Blind typing lab
        </p>
      </div>
    </Link>
  )
}
