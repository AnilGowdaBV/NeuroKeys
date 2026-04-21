import { motion } from 'framer-motion'
import { useState } from 'react'

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789'

export function AnimatedTypingBackdrop() {
  const [cells] = useState(() =>
    Array.from({ length: 180 }, (_, i) => ({
      id: i,
      ch: CHARS[Math.floor(Math.random() * CHARS.length)]!,
      delay: (i % 24) * 0.04,
      hue: i % 3,
    })),
  )

  const hueClass = (h: number) =>
    h === 0 ? 'text-teal-400/50' : h === 1 ? 'text-violet-400/45' : 'text-cyan-400/45'

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.12] sm:opacity-[0.15]"
      aria-hidden
    >
      <div className="absolute inset-0 grid h-full w-full grid-cols-8 gap-3 p-4 font-mono text-[10px] sm:grid-cols-12 sm:gap-4 sm:text-xs">
        {cells.map((c) => (
          <motion.span
            key={c.id}
            className={`select-none ${hueClass(c.hue)}`}
            initial={{ opacity: 0.12 }}
            animate={{ opacity: [0.08, 0.4, 0.1] }}
            transition={{
              duration: 5 + (c.id % 5) * 0.3,
              repeat: Infinity,
              delay: c.delay,
              ease: 'easeInOut',
            }}
          >
            {c.ch}
          </motion.span>
        ))}
      </div>
    </div>
  )
}
