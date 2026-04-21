import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { Difficulty, TrainMode } from '../../types'

export interface ModeOption {
  id: TrainMode
  title: string
  description: string
  badge?: string
  gradient: string
  /** Unselected hover lift shadow */
  hoverGlow: string
  badgeClass: string
  selected: {
    border: string
    ring: string
    shadow: string
    topBar: string
  }
}

const MODES: ModeOption[] = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'No timer — accuracy and muscle memory first.',
    badge: 'Calm',
    gradient: 'from-emerald-500/20 via-teal-600/10 to-transparent',
    hoverGlow: 'hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)]',
    badgeClass:
      'border-emerald-400/35 bg-emerald-500/15 text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.12)]',
    selected: {
      border: 'border-teal-400/55',
      ring: 'ring-2 ring-teal-400/25',
      shadow:
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(45,212,191,0.2),0_24px_56px_rgba(0,0,0,0.5),0_0_80px_rgba(45,212,191,0.15)]',
      topBar: 'from-teal-400 via-cyan-300 to-emerald-400',
    },
  },
  {
    id: 'timed',
    title: 'Timed',
    description: 'Performance mode with countdown and live stats.',
    badge: 'Fast',
    gradient: 'from-amber-500/25 via-orange-600/10 to-transparent',
    hoverGlow: 'hover:shadow-[0_20px_50px_rgba(251,191,36,0.14)]',
    badgeClass:
      'border-amber-400/40 bg-amber-500/15 text-amber-50 shadow-[0_0_20px_rgba(251,191,36,0.15)]',
    selected: {
      border: 'border-amber-400/55',
      ring: 'ring-2 ring-amber-400/25',
      shadow:
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(251,191,36,0.22),0_24px_56px_rgba(0,0,0,0.5),0_0_80px_rgba(251,146,60,0.14)]',
      topBar: 'from-amber-400 via-orange-400 to-rose-400',
    },
  },
  {
    id: 'adaptive',
    title: 'Adaptive',
    description: 'Targets weak keys with smart practice lines.',
    badge: 'Smart',
    gradient: 'from-violet-500/28 via-fuchsia-600/10 to-transparent',
    hoverGlow: 'hover:shadow-[0_20px_50px_rgba(167,139,250,0.16)]',
    badgeClass:
      'border-violet-400/40 bg-violet-500/15 text-violet-100 shadow-[0_0_20px_rgba(167,139,250,0.18)]',
    selected: {
      border: 'border-violet-400/55',
      ring: 'ring-2 ring-violet-400/25',
      shadow:
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(167,139,250,0.25),0_24px_56px_rgba(0,0,0,0.5),0_0_80px_rgba(167,139,250,0.18)]',
      topBar: 'from-violet-400 via-fuchsia-400 to-purple-500',
    },
  },
  {
    id: 'custom',
    title: 'Custom',
    description: 'Bring your own text or drill material.',
    badge: 'You',
    gradient: 'from-sky-500/25 via-cyan-600/10 to-transparent',
    hoverGlow: 'hover:shadow-[0_20px_50px_rgba(56,189,248,0.14)]',
    badgeClass: 'border-sky-400/40 bg-sky-500/12 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.14)]',
    selected: {
      border: 'border-sky-400/55',
      ring: 'ring-2 ring-sky-400/25',
      shadow:
        'shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(56,189,248,0.22),0_24px_56px_rgba(0,0,0,0.5),0_0_80px_rgba(34,211,238,0.14)]',
      topBar: 'from-sky-400 via-cyan-400 to-blue-500',
    },
  },
]

function optionShellAccent(mode: TrainMode): string {
  switch (mode) {
    case 'timed':
      return 'border-l-amber-400/50 shadow-[0_0_40px_rgba(251,191,36,0.06)]'
    case 'adaptive':
      return 'border-l-violet-400/50 shadow-[0_0_40px_rgba(167,139,250,0.08)]'
    case 'custom':
      return 'border-l-sky-400/50 shadow-[0_0_40px_rgba(56,189,248,0.06)]'
    default:
      return 'border-l-teal-400/50 shadow-[0_0_40px_rgba(45,212,191,0.06)]'
  }
}

export interface ModeSelectorProps {
  selected: TrainMode
  onSelect: (m: TrainMode) => void
  timerChoice: number
  onTimerChange: (s: number) => void
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  customText: string
  onCustomText: (v: string) => void
}

export function ModeSelector({
  selected,
  onSelect,
  timerChoice,
  onTimerChange,
  difficulty,
  onDifficultyChange,
  customText,
  onCustomText,
}: ModeSelectorProps) {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
        {MODES.map((m, i) => {
          const isSel = selected === m.id
          return (
            <motion.button
              key={m.id}
              type="button"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 380, damping: 28 }}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.992 }}
              onClick={() => onSelect(m.id)}
              className={clsx(
                'group relative overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-xl transition duration-300 sm:rounded-[1.35rem] sm:p-6',
                'bg-gradient-to-br bg-black/35',
                m.gradient,
                isSel
                  ? clsx(m.selected.border, m.selected.ring, m.selected.shadow)
                  : clsx('border-white/[0.1]', 'hover:border-white/25', !isSel && m.hoverGlow),
              )}
            >
              <div
                className={clsx(
                  'absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r opacity-0 transition duration-300',
                  m.selected.topBar,
                  isSel ? 'opacity-100' : 'opacity-0 group-hover:opacity-60',
                )}
              />
              <div
                className={clsx(
                  'pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition duration-500 group-hover:opacity-100',
                  m.id === 'beginner' && 'bg-teal-400/25',
                  m.id === 'timed' && 'bg-amber-400/25',
                  m.id === 'adaptive' && 'bg-violet-400/25',
                  m.id === 'custom' && 'bg-sky-400/25',
                )}
              />
              <div
                className={clsx(
                  'absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100',
                  'bg-[radial-gradient(700px_circle_at_90%_0%,rgba(255,255,255,0.07),transparent_42%)]',
                )}
              />
              <div className="relative">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold tracking-tight text-white sm:text-xl">{m.title}</h3>
                  {m.badge && (
                    <span
                      className={clsx(
                        'rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]',
                        m.badgeClass,
                      )}
                    >
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-zinc-400 sm:text-[15px] sm:leading-relaxed">
                  {m.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {selected === 'timed' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className={clsx(
            'rounded-2xl border border-white/[0.1] border-l-4 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[1.25rem] sm:p-6',
            optionShellAccent('timed'),
          )}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-amber-300/95">
            Duration
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[30, 60, 120].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onTimerChange(s)}
                className={clsx(
                  'rounded-xl px-5 py-2.5 font-mono text-sm font-semibold transition',
                  timerChoice === s
                    ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-[0_0_28px_rgba(251,191,36,0.35)]'
                    : 'border border-white/10 bg-black/25 text-nk-text hover:border-amber-400/35 hover:bg-amber-500/10',
                )}
              >
                {s}s
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {selected === 'adaptive' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className={clsx(
            'rounded-2xl border border-white/[0.1] border-l-4 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[1.25rem] sm:p-6',
            optionShellAccent('adaptive'),
          )}
        >
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/95">
            Difficulty
          </p>
          <div className="flex flex-wrap gap-4 sm:gap-8">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <label
                key={d}
                className="group inline-flex cursor-pointer items-center gap-2.5 text-sm transition hover:text-white"
              >
                <input
                  type="radio"
                  name="diff"
                  checked={difficulty === d}
                  onChange={() => onDifficultyChange(d)}
                  className="size-4 accent-violet-400"
                />
                <span className="capitalize text-zinc-300 group-hover:text-white">{d}</span>
              </label>
            ))}
          </div>
        </motion.div>
      )}

      {selected === 'custom' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
          className={clsx(
            'rounded-2xl border border-white/[0.1] border-l-4 bg-white/[0.04] p-5 backdrop-blur-xl sm:rounded-[1.25rem] sm:p-6',
            optionShellAccent('custom'),
          )}
        >
          <label className="mb-3 block text-xs font-semibold uppercase tracking-[0.22em] text-sky-300/95">
            Your text
          </label>
          <textarea
            value={customText}
            onChange={(e) => onCustomText(e.target.value)}
            rows={5}
            placeholder="Paste a paragraph to practice..."
            className="min-h-[120px] w-full resize-y rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-nk-text outline-none transition placeholder:text-zinc-600 focus:border-sky-400/45 focus:ring-2 focus:ring-sky-500/20 sm:min-h-[140px]"
          />
        </motion.div>
      )}
    </div>
  )
}
