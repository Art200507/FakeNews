const Background = () => (
  <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none">
    {/* Base dark gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#080d1f] to-[#020617]" />

    {/* Perspective grid */}
    <div
      className="absolute inset-0 opacity-[0.07]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,212,255,1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,212,255,1) 1px, transparent 1px)
        `,
        backgroundSize: '64px 64px',
      }}
    />

    {/* Radial vignette overlay */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.04) 0%, transparent 70%)',
      }}
    />

    {/* Corner accent orbs */}
    <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
    <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl" />
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full bg-indigo-600/4 blur-3xl" />

    {/* Animated scan line */}
    <div
      className="scan-overlay bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"
      style={{ animation: 'scan 8s linear infinite', top: 0 }}
    />

    {/* Floating micro orbs */}
    {[
      { cx: '15%', cy: '30%', delay: '0s', size: 3, color: 'rgba(0,212,255,0.5)' },
      { cx: '80%', cy: '20%', delay: '2s', size: 2, color: 'rgba(147,51,234,0.5)' },
      { cx: '60%', cy: '70%', delay: '4s', size: 4, color: 'rgba(0,212,255,0.3)' },
      { cx: '25%', cy: '80%', delay: '1s', size: 2, color: 'rgba(99,102,241,0.5)' },
      { cx: '90%', cy: '60%', delay: '3s', size: 3, color: 'rgba(147,51,234,0.4)' },
    ].map(({ cx, cy, delay, size, color }, i) => (
      <div
        key={i}
        className="absolute rounded-full blur-sm"
        style={{
          left: cx,
          top: cy,
          width: size * 2,
          height: size * 2,
          background: color,
          animation: `floatUpDown ${5 + i}s ease-in-out infinite`,
          animationDelay: delay,
        }}
      />
    ))}
  </div>
)

export default Background
