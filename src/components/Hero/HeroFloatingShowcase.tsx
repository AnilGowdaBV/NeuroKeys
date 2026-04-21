import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function HeroFloatingShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springX = useSpring(mx, { stiffness: 140, damping: 20 })
  const springY = useSpring(my, { stiffness: 140, damping: 20 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12])

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    mx.set(x)
    my.set(y)
  }

  const onLeave = () => {
    mx.set(0)
    my.set(0)
  }

  return (
    <div className="relative mx-auto w-full max-w-[340px] perspective-[1200px] sm:max-w-sm lg:max-w-md">
      <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-fuchsia-500/12 via-teal-500/10 to-violet-500/15 blur-2xl" />
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative"
      >
        <div
          className="relative overflow-hidden rounded-2xl border border-fuchsia-500/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-px shadow-[0_16px_48px_rgba(0,0,0,0.45),0_0_40px_rgba(217,70,239,0.08),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md"
          style={{ transform: 'translateZ(16px)' }}
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="size-2 rounded-full bg-rose-400/90" />
            <span className="size-2 rounded-full bg-amber-400/90" />
            <span className="size-2 rounded-full bg-emerald-400/90" />
            <span className="ml-1.5 font-mono text-[9px] text-zinc-500">session · beginner</span>
          </div>
          <div className="space-y-3 px-3 py-4 sm:px-4 sm:py-5">
            <div className="font-mono text-xs leading-relaxed text-zinc-500 sm:text-sm">
              <span className="text-emerald-400">Calm</span>{' '}
              <span className="text-zinc-600">hands find the home row…</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['WPM', '98%', '12 keys'].map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-[9px] text-teal-200/90 sm:text-[10px]"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="h-full w-2/5 rounded-full bg-gradient-to-r from-teal-400 to-violet-500"
                animate={{ opacity: [0.75, 1, 0.75] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/[0.05] via-transparent to-transparent" />
        </div>
      </motion.div>
      <div
        className="pointer-events-none absolute -bottom-6 left-1/2 h-10 w-[70%] -translate-x-1/2 rounded-[100%] bg-teal-500/12 blur-xl"
        aria-hidden
      />
    </div>
  )
}
