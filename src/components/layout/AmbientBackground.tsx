/**
 * Shared atmospheric layer: soft color orbs + vignette + optional grid.
 * Sits behind page content (pointer-events-none).
 */
export function AmbientBackground({ variant = 'default' }: { variant?: 'default' | 'warm' }) {
  const orbB =
    variant === 'warm'
      ? 'bg-amber-500/12 blur-[110px]'
      : 'bg-fuchsia-600/12 blur-[110px]'
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[#05060a]" />
      <div className="absolute -left-[20%] -top-[30%] h-[min(120vw,52rem)] w-[min(120vw,52rem)] rounded-full bg-violet-600/25 blur-[120px]" />
      <div className="absolute -right-[15%] top-[10%] h-[min(100vw,44rem)] w-[min(100vw,44rem)] rounded-full bg-cyan-500/20 blur-[100px]" />
      <div className={`absolute bottom-[-20%] left-[20%] h-[36rem] w-[56rem] rounded-full ${orbB}`} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(139,92,246,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_80%_60%,rgba(34,211,238,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(5,6,10,0.2),rgba(5,6,10,0.92))]" />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
}
