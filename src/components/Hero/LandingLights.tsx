import { motion } from 'framer-motion'

/** Extra floating “neon” orbs + rings for depth (pure CSS / motion). */
export function LandingLights() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute -left-[10%] top-[18%] h-[min(90vw,28rem)] w-[min(90vw,28rem)] rounded-full bg-teal-500/20 blur-[100px]"
        animate={{ opacity: [0.35, 0.55, 0.35], scale: [1, 1.05, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-[5%] top-[8%] h-[min(85vw,24rem)] w-[min(85vw,24rem)] rounded-full bg-violet-600/25 blur-[90px]"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1.03, 1, 1.03] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
      <motion.div
        className="absolute bottom-[5%] left-[25%] h-[20rem] w-[36rem] rounded-full bg-fuchsia-600/15 blur-[100px]"
        animate={{ opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute left-[40%] top-[42%] h-[min(50vw,18rem)] w-[min(50vw,18rem)] rounded-full bg-rose-500/12 blur-[80px]"
        animate={{ opacity: [0.2, 0.38, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      {/* Thin 3D-style rings */}
      <motion.div
        className="absolute left-1/2 top-[12%] h-[min(120vw,32rem)] w-[min(120vw,32rem)] -translate-x-1/2 rounded-full border border-teal-400/15"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateZ: [0, 360] }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute left-1/2 top-[14%] h-[min(100vw,26rem)] w-[min(100vw,26rem)] -translate-x-1/2 rounded-full border border-violet-400/12"
        animate={{ rotateZ: [360, 0] }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
