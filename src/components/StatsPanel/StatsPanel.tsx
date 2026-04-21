import { memo } from 'react'
import clsx from 'clsx'

export interface StatsPanelProps {
  wpm: number
  accuracy: number
  correctChars?: number
  errors: number
  keystrokes: number
  timerLabel?: string | null
}

const statStyles: Record<string, string> = {
  WPM: 'hover:border-teal-400/35 hover:shadow-[0_0_28px_rgba(45,212,191,0.12)]',
  Accuracy: 'hover:border-violet-400/35 hover:shadow-[0_0_28px_rgba(167,139,250,0.12)]',
  Errors: 'hover:border-rose-400/35 hover:shadow-[0_0_28px_rgba(251,113,133,0.12)]',
  Keys: 'hover:border-cyan-400/35 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]',
}

export const StatsPanel = memo(function StatsPanel({
  wpm,
  accuracy,
  correctChars,
  errors,
  keystrokes,
  timerLabel,
}: StatsPanelProps) {
  const items = [
    { label: 'WPM', value: wpm },
    {
      label: 'Accuracy',
      value: `${accuracy}%`,
      hint:
        typeof correctChars === 'number' && keystrokes > 0
          ? `${correctChars}/${keystrokes} correct key presses`
          : undefined,
    },
    { label: 'Errors', value: errors },
    { label: 'Keys', value: keystrokes },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {timerLabel !== undefined && timerLabel !== null && (
        <div className="col-span-2 rounded-2xl border border-teal-400/35 bg-gradient-to-br from-teal-500/18 via-cyan-500/8 to-teal-950/20 px-4 py-4 shadow-[0_0_48px_rgba(45,212,191,0.18)] backdrop-blur-md transition hover:border-teal-300/45 sm:col-span-4 sm:px-5 sm:py-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-teal-200/90 sm:text-xs">
            Timer
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums tracking-tight text-teal-100 sm:text-4xl md:text-5xl">
            {timerLabel}
          </p>
        </div>
      )}
      {items.map((it) => (
        <div
          key={it.label}
          className={clsx(
            'group rounded-2xl border border-white/[0.1] bg-gradient-to-b from-[#0c0e18]/95 to-[#080a12]/90 px-3 py-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 sm:px-4 sm:py-4',
            statStyles[it.label] ?? '',
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-[11px]">
            {it.label}
          </p>
          <p className="mt-1.5 font-mono text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
            {it.value}
          </p>
          {'hint' in it && it.hint && (
            <p className="mt-1 text-[9px] leading-snug text-nk-muted sm:text-[10px]">{it.hint}</p>
          )}
        </div>
      ))}
    </div>
  )
})
