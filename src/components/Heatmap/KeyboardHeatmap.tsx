import { memo, useEffect, useState } from 'react'
import clsx from 'clsx'

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]

const FLASH_MS = 900

export type KeyFlash = { key: string; correct: boolean; seq: number }

export interface KeyboardHeatmapProps {
  /** Last key event — that key flashes green (hit) or red (miss), then returns to neutral. */
  flash: KeyFlash | null
}

const neutralKbd =
  'border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20'
const hitKbd =
  'border-emerald-400/55 bg-emerald-500/30 text-emerald-100 shadow-[0_0_22px_rgba(52,211,153,0.45)]'
const missKbd =
  'border-rose-400/55 bg-rose-500/30 text-rose-100 shadow-[0_0_22px_rgba(251,113,133,0.45)]'

function keyTone(active: { key: string; correct: boolean } | null, k: string) {
  if (!active || active.key !== k) return 'neutral' as const
  return active.correct ? ('hit' as const) : ('miss' as const)
}

export const KeyboardHeatmap = memo(function KeyboardHeatmap({ flash }: KeyboardHeatmapProps) {
  const [active, setActive] = useState<{ key: string; correct: boolean } | null>(null)

  useEffect(() => {
    if (!flash) {
      setActive(null)
      return
    }
    const k = flash.key === ' ' ? ' ' : flash.key.toLowerCase()
    setActive({ key: k, correct: flash.correct })
    const id = window.setTimeout(() => setActive(null), FLASH_MS)
    return () => window.clearTimeout(id)
  }, [flash])

  return (
    <div className="rounded-2xl border border-white/[0.1] bg-gradient-to-br from-white/[0.05] via-[#070910]/85 to-teal-950/15 p-4 shadow-[0_20px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-teal-500/20 sm:p-5">
      <div className="mb-1">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-teal-400/90 sm:text-xs">
          Key focus
        </p>
        <p className="mt-1 text-[11px] leading-snug text-zinc-500 sm:text-xs">
          Each key flashes <span className="text-emerald-400/90">green</span> on a hit or{' '}
          <span className="text-rose-400/90">red</span> on a miss, then fades back — no sticky colors.
        </p>
      </div>
      <div className="mt-4 flex flex-col items-center gap-2 overflow-x-auto pb-1 sm:gap-2">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-1.5 sm:gap-2">
            {row.map((k) => {
              const tone = keyTone(active, k)
              return (
                <kbd
                  key={k}
                  className={clsx(
                    'flex h-8 min-w-[1.75rem] items-center justify-center rounded-lg border text-[10px] font-mono uppercase transition hover:scale-110 sm:h-9 sm:min-w-[2rem] sm:text-[11px]',
                    tone === 'neutral' && neutralKbd,
                    tone === 'hit' && hitKbd,
                    tone === 'miss' && missKbd,
                  )}
                >
                  {k}
                </kbd>
              )
            })}
          </div>
        ))}
        <div className="mt-1 flex w-full max-w-sm justify-center">
          <kbd
            className={clsx(
              'h-9 w-full max-w-[14rem] rounded-lg border text-center text-[10px] font-mono uppercase leading-9 transition hover:scale-[1.02]',
              keyTone(active, ' ') === 'neutral' && neutralKbd,
              keyTone(active, ' ') === 'hit' && hitKbd,
              keyTone(active, ' ') === 'miss' && missKbd,
            )}
          >
            Space
          </kbd>
        </div>
      </div>
    </div>
  )
})
