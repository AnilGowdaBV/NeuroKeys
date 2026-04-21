import { memo, useMemo } from 'react'
import clsx from 'clsx'
import type { CharMark } from '../../hooks/useTypingEngine'

function wordBounds(s: string, index: number): { start: number; end: number } {
  if (s.length === 0) return { start: 0, end: 0 }
  let start = index
  while (start > 0 && s[start - 1] !== ' ') start--
  let end = index
  while (end < s.length && s[end] !== ' ') end++
  return { start, end: Math.max(end - 1, start) }
}

export interface TypingSurfaceProps {
  text: string
  marks: CharMark[]
  caretIndex: number
  focusMode: boolean
  complete: boolean
}

export const TypingSurface = memo(function TypingSurface({
  text,
  marks,
  caretIndex,
  focusMode,
  complete,
}: TypingSurfaceProps) {
  const bounds = useMemo(() => wordBounds(text, caretIndex), [text, caretIndex])

  return (
    <div className="relative rounded-2xl p-[1px] sm:rounded-3xl">
      <div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/45 via-fuchsia-500/22 to-cyan-500/32 opacity-85 blur-sm sm:rounded-3xl"
        aria-hidden
      />
      <div
        className="relative min-h-[8rem] rounded-2xl border border-white/[0.12] bg-[#070910]/92 px-4 py-6 font-mono text-lg leading-relaxed tracking-wide shadow-[0_24px_72px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:min-h-[10rem] sm:rounded-3xl sm:px-8 sm:py-10 sm:text-xl md:text-2xl"
        aria-label="Typing line"
      >
        <div className="flex flex-wrap gap-x-0.5 gap-y-1">
          {Array.from(text).map((ch, i) => {
            const mark = marks[i] ?? 'pending'
            const isCaret = i === caretIndex && !complete
            const inWord = i >= bounds.start && i <= bounds.end
            const dimOutside = focusMode && !inWord

            return (
              <span
                key={i}
                className={clsx(
                  'inline-block min-w-[0.55em] transition-all duration-200',
                  dimOutside && 'blur-[2.5px] opacity-25',
                  !dimOutside && focusMode && 'opacity-100',
                  mark === 'correct' && 'text-nk-good',
                  mark === 'incorrect' && 'text-nk-bad',
                  mark === 'pending' && i >= caretIndex && 'text-zinc-500',
                  isCaret &&
                    'relative rounded-sm text-white before:pointer-events-none before:absolute before:left-0 before:top-[0.08em] before:h-[0.92em] before:w-[3px] before:rounded-full before:bg-teal-400 before:shadow-[0_0_16px_rgba(45,212,191,0.85),0_0_6px_rgba(34,211,238,0.5)]',
                )}
              >
                {ch === ' ' ? '\u00a0' : ch}
              </span>
            )
          })}
        </div>
        {!complete && (
          <p className="mt-6 text-center text-[11px] text-nk-muted sm:text-xs">
            Type the line. Paste is disabled. Use Backspace to correct.
          </p>
        )}
      </div>
    </div>
  )
})
