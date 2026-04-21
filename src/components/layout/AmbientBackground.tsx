import { motion } from 'framer-motion'

/**
 * Shared atmospheric layer: soft color orbs + vignette + optional grid.
 * Sits behind page content (pointer-events-none).
 * Responds to syncFactor (0-100) for "Neuro-Feedback".
 * Performance-optimized for deep black OLED/Dark themes.
 */
export function AmbientBackground({ 
  variant = 'default', 
  syncFactor = 0 
}: { 
  variant?: 'default' | 'warm',
  syncFactor?: number 
}) {
  let intensity = Math.min(1, Math.max(0, syncFactor / 100))
  if (isNaN(intensity)) intensity = 0
  
  // Brighter, more saturated variants for visibility on black
  const orbB =
    variant === 'warm'
      ? 'bg-amber-400/25 blur-[120px]'
      : 'bg-fuchsia-500/40 blur-[120px]' // Saturated fuchsia

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#030408]" aria-hidden>
      {/* Base Layer - keep it deep but with a hint of purple */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Primary Neural Orb (Violet) */}
      <motion.div 
        animate={{ 
          scale: 1.1 + intensity * 0.3,
          opacity: 0.35 + intensity * 0.45,
          x: intensity * 40,
          y: intensity * -40
        }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute -left-[5%] -top-[15%] h-[min(120vw,60rem)] w-[min(120vw,60rem)] rounded-full bg-violet-600/50 blur-[130px]" 
      />
      
      {/* Secondary Neural Orb (Cyan) */}
      <motion.div 
        animate={{ 
          scale: 1 + intensity * 0.25,
          opacity: 0.25 + intensity * 0.5,
          x: intensity * -60
        }}
        transition={{ duration: 2.5, ease: "easeOut" }}
        className="absolute -right-[5%] top-[10%] h-[min(100vw,50rem)] w-[min(100vw,50rem)] rounded-full bg-cyan-400/40 blur-[110px]" 
      />

      {/* Bottom Glow */}
      <motion.div 
        animate={{ 
          scale: 1 + intensity * 0.4,
          opacity: 0.15 + intensity * 0.65 
        }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className={`absolute bottom-[-5%] left-[20%] h-[40rem] w-[60rem] rounded-full ${orbB}`} 
      />

      {/* Atmospheric Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_70%_at_50%_-10%,rgba(139,92,246,0.25),transparent_70%)]" />
      
      <motion.div 
        animate={{ 
          opacity: 0.4 + intensity * 0.6,
          scale: 1 + intensity * 0.1
        }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_80%_60%,rgba(34,211,238,0.18),transparent_60%)]" 
      />

      {/* High-Tech Grid Pattern with Sync Pulsing */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,10,0.2),rgba(5,6,10,0.98))]" />
      <motion.div 
        animate={{ 
          opacity: 0.08 + intensity * 0.25,
          backgroundSize: `${40 + intensity * 10}px ${40 + intensity * 10}px` 
        }}
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        }}
      />

      {/* Final Grainy Atmosphere */}
      <div
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
